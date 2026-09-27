#!/usr/bin/env python3
"""Laya plan-validation worker.

Laya (https://github.com/NandhaKishorM/laya) is a non-autoregressive decision
engine. It does not generate text; it answers typed questions --- ``choice``,
``score`` and ``noul`` --- over a text/JSON state in a single forward pass.

This worker is intentionally small: it turns a plan into a fixed set of typed
questions, asks the locally installed Laya model, and maps the calibrated
answers onto a pass/fail/inconclusive gate. It never fabricates a result: if
Laya is missing it reports that clearly.

Protocol (one JSON document per line, prefixed with SENTINEL so unrelated
stdout noise from model libraries cannot corrupt the stream):

    request : {"id": "<string>", "op": "status" | "validate_plan", "args": {...}}
    response: SENTINEL + {"id": "<string>", "ok": true, "result": {...}}
              SENTINEL + {"id": "<string>", "ok": false, "error": "<message>"}

Environment variables (all optional):

    LAYA_PYTHON        interpreter that has ``laya`` installed (resolved by the
                       Node launcher, not read here).
    LAYA_MODEL         ``english`` (default), ``typed-decisions``,
                       ``multilingual`` or ``auto``. ``english`` is the general
                       checkpoint; ``typed-decisions`` is fine-tuned on four
                       specific workflows and is near-chance on other schemas.
    LAYA_ROUTER        ``1``/``0`` --- use Laya's built-in Router (default 1).
    LAYA_DEVICE        e.g. ``cpu`` or ``cuda``; Laya decides when unset.
    LAYA_PRELOAD       ``1``/``0`` --- preload all checkpoints (default 0;
                       the worker only ever routes to ``LAYA_MODEL``, so
                       preloading the other two is pure overhead).
    LAYA_MIN_CONFIDENCE minimum answer confidence to trust (default 0.6).
    LAYA_NOUL_THRESHOLD probability needed for a ``noul`` check to pass (0.5).
    LAYA_MAX_AMBIGUITY  highest accepted ``score`` ambiguity level (default 1.5).
    LAYA_MAX_LEN, LAYA_HEAD_MAX_LEN  optional Laya token-budget overrides.
"""

from __future__ import annotations

import importlib.util
import json
import os
import re
import sys
import traceback

# huggingface_hub defaults to symlinking cache blobs, which fails on Windows
# without Developer Mode (WinError 1314). Force file copies so checkpoint
# downloads work on a stock Windows machine.
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS", "1")

SENTINEL = "@@LAYA_MCP@@"

DEFAULT_MODEL = "english"
DEFAULT_MIN_CONFIDENCE = 0.6
DEFAULT_NOUL_THRESHOLD = 0.5
DEFAULT_MAX_AMBIGUITY = 1.5

UNAVAILABLE_WARNING = (
    "Laya was unavailable, so this plan was NOT validated. Do not describe it "
    "as Laya-validated. Continue without the gate only if you accept the risk, "
    "and record 'laya_validation: skipped (unavailable)' with the reason."
)

# --- typed questions -------------------------------------------------------

PLAN_QUESTIONS = {
    "decomposition": {
        "type": "choice",
        "instructions": (
            "How well is this implementation plan decomposed into independently "
            "implementable tasks that collectively cover the stated outcome?"
        ),
        "criteria": {
            "adequate": "tasks are atomic, specific, and together cover the stated outcome",
            "partial": "some tasks are vague, bundled, or missing, but the structure is usable",
            "poor": "tasks are not meaningfully decomposed or key work is missing",
        },
    },
    "deterministic": {
        "type": "noul",
        "instructions": (
            "Does the plan contain enough information --- scope, constraints, "
            "ordering and verification --- for an implementer to proceed "
            "deterministically without making unstated decisions?"
        ),
    },
    "safe": {
        "type": "noul",
        "instructions": (
            "Can an implementer proceed safely with this plan without missing "
            "dependencies, unstated assumptions or risky ambiguity?"
        ),
    },
}

TASK_QUESTIONS = {
    "atomic": {
        "type": "noul",
        "instructions": (
            "Does this task describe exactly one essential unit of work, without "
            "bundling several independent sub-tasks together?"
        ),
    },
    "specific": {
        "type": "noul",
        "instructions": (
            "Does this task name the concrete files, modules or components and "
            "the expected behaviour or acceptance criteria, so an implementer "
            "would not have to infer missing requirements?"
        ),
    },
    "self_contained": {
        "type": "noul",
        "instructions": (
            "Can this task be implemented and verified independently of "
            "unrelated unfinished tasks?"
        ),
    },
    "ambiguity": {
        "type": "score",
        "instructions": "How ambiguous or underspecified is this task?",
        "criteria": [
            "fully unambiguous",
            "minor gaps",
            "ambiguous",
            "severely ambiguous",
        ],
    },
}

AMBIGUITY_LABELS = ["fully unambiguous", "minor gaps", "ambiguous", "severely ambiguous"]

# --- helpers ---------------------------------------------------------------


def _env(name, default=None):
    value = os.environ.get(name)
    if value is None:
        return default
    value = value.strip()
    return value if value else default


def _flag(name, default=True):
    raw = _env(name)
    if raw is None:
        return default
    return raw.lower() not in {"0", "false", "no", "off"}


def _number(raw, default):
    try:
        return float(raw)
    except (TypeError, ValueError):
        return default


def _respond(payload):
    sys.stdout.write(SENTINEL + json.dumps(payload, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def _unavailable(reason):
    return {
        "laya_available": False,
        "validated": False,
        "status": "unavailable",
        "reason": reason,
        "warning": UNAVAILABLE_WARNING,
    }


# --- Laya loading ----------------------------------------------------------

_AGENT = None
_LOAD_ERROR = None
_USE_ROUTER = True
_MODEL = DEFAULT_MODEL


def _laya_installed():
    return importlib.util.find_spec("laya") is not None


def _apply_limits(agent):
    max_len = _env("LAYA_MAX_LEN")
    head = _env("LAYA_HEAD_MAX_LEN")
    if not max_len and not head:
        return
    cfg = getattr(agent, "cfg", None)
    if not isinstance(cfg, dict):
        return
    if max_len:
        try:
            cfg["max_len"] = int(max_len)
        except ValueError:
            pass
    if head:
        try:
            cfg["head_max_len"] = int(head)
        except ValueError:
            pass


def _load_agent():
    global _AGENT, _LOAD_ERROR, _USE_ROUTER, _MODEL
    if _AGENT is not None:
        return _AGENT, None
    if _LOAD_ERROR is not None:
        return None, _LOAD_ERROR

    if not _laya_installed():
        _LOAD_ERROR = (
            "The Python package 'laya' is not installed in this interpreter "
            f"({sys.executable}). Install it with: pip install laya"
        )
        return None, _LOAD_ERROR

    try:
        import laya

        _MODEL = _env("LAYA_MODEL", DEFAULT_MODEL)
        _USE_ROUTER = _flag("LAYA_ROUTER", True)
        device = _env("LAYA_DEVICE")

        if _USE_ROUTER:
            from laya import Router

            kwargs = {"preload": _flag("LAYA_PRELOAD", False)}
            if device:
                kwargs["device"] = device
            agent = Router(**kwargs)
        else:
            kwargs = {}
            if device:
                kwargs["device"] = device
            if _MODEL in ("auto", "english"):
                agent = laya.load("convaiinnovations/laya", **kwargs)
            else:
                agent = laya.load("convaiinnovations/laya", subfolder=_MODEL, **kwargs)

        _apply_limits(agent)
        _AGENT = agent
        return _AGENT, None
    except Exception as exc:  # pragma: no cover - depends on local install
        _LOAD_ERROR = f"Failed to load Laya: {type(exc).__name__}: {exc}"
        return None, _LOAD_ERROR


def _predict(state, questions):
    agent, err = _load_agent()
    if err:
        raise RuntimeError(err)
    if _USE_ROUTER and _MODEL not in ("auto",):
        try:
            return agent.predict(state, questions, model=_MODEL)
        except TypeError:
            pass
    return agent.predict(state, questions)


# --- answer interpretation -------------------------------------------------


def _value(answer, kind):
    if isinstance(answer, dict):
        return answer.get(kind)
    return None


def _confidence(answer):
    if isinstance(answer, dict):
        return _number(answer.get("confidence"), None)
    return None


def _noul_check(answer, threshold, min_conf):
    raw = _value(answer, "noul")
    try:
        probability = float(raw)
    except (TypeError, ValueError):
        probability = None
    confidence = _confidence(answer)
    if probability is None:
        return {
            "value": None,
            "confidence": confidence,
            "passed": False,
            "inconclusive": True,
            "detail": "Laya returned no probability for this question.",
        }
    return {
        "value": round(probability, 4),
        "confidence": confidence,
        "passed": probability >= threshold,
        "inconclusive": confidence is not None and confidence < min_conf,
        "detail": f"P(true)={probability:.2f} (needs >= {threshold:.2f})",
    }


def _choice_check(answer, expected, min_conf):
    choice = _value(answer, "choice")
    confidence = _confidence(answer)
    if choice is None:
        return {
            "value": None,
            "confidence": confidence,
            "passed": False,
            "inconclusive": True,
            "detail": "Laya returned no choice for this question.",
        }
    return {
        "value": choice,
        "confidence": confidence,
        "passed": choice == expected,
        "inconclusive": confidence is not None and confidence < min_conf,
        "detail": f"choice={choice} (needs '{expected}')",
    }


def _ambiguity_check(answer, max_ambiguity, min_conf):
    raw = _value(answer, "score")
    try:
        score = float(raw)
    except (TypeError, ValueError):
        score = None
    confidence = _confidence(answer)
    if score is None:
        return {
            "value": None,
            "confidence": confidence,
            "passed": False,
            "inconclusive": True,
            "detail": "Laya returned no score for this question.",
        }
    index = max(0, min(len(AMBIGUITY_LABELS) - 1, int(round(score))))
    return {
        "value": round(score, 4),
        "label": AMBIGUITY_LABELS[index],
        "confidence": confidence,
        "passed": score <= max_ambiguity,
        "inconclusive": confidence is not None and confidence < min_conf,
        "detail": f"ambiguity={score:.2f} ({AMBIGUITY_LABELS[index]}, needs <= {max_ambiguity:.2f})",
    }


def _verdict(checks):
    if any(not check["passed"] for check in checks):
        return "fail"
    if any(check["inconclusive"] for check in checks):
        return "inconclusive"
    return "pass"


def _answers_of(result):
    if isinstance(result, dict) and isinstance(result.get("answers"), dict):
        return result["answers"]
    return {}


def _routing_of(result):
    if isinstance(result, dict):
        return result.get("routing")
    return None


# --- operations ------------------------------------------------------------


def handle_status(_args):
    installed = _laya_installed()
    result = {
        "laya_available": False,
        "laya_installed": installed,
        "python": sys.version.split()[0],
        "python_executable": sys.executable,
        "model": _env("LAYA_MODEL", DEFAULT_MODEL),
        "router": _flag("LAYA_ROUTER", True),
        "device": _env("LAYA_DEVICE", "auto"),
        "min_confidence": _number(_env("LAYA_MIN_CONFIDENCE"), DEFAULT_MIN_CONFIDENCE),
    }
    if installed:
        try:
            import laya

            result["laya_version"] = getattr(laya, "__version__", "unknown")
            result["laya_available"] = True
        except Exception as exc:  # pragma: no cover - depends on local install
            result["load_error"] = f"{type(exc).__name__}: {exc}"
    else:
        result["load_error"] = (
            "The Python package 'laya' is not installed in this interpreter."
        )
    if not result["laya_available"]:
        result["warning"] = UNAVAILABLE_WARNING
    return result


_TASK_LINE = re.compile(r"^(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s*)?(.+)$")
_HEADING_LINE = re.compile(r"^#{2,6}\s+(.+)$")


def derive_tasks(plan):
    tasks = []
    for line in plan.splitlines():
        match = _TASK_LINE.match(line.strip())
        if match:
            text = match.group(1).strip()
            if text:
                tasks.append(text)
    if not tasks:
        for line in plan.splitlines():
            match = _HEADING_LINE.match(line.strip())
            if match:
                text = match.group(1).strip()
                if text:
                    tasks.append(text)
    if not tasks and plan.strip():
        tasks = [plan.strip()]
    return tasks


def handle_validate_plan(args):
    args = args or {}
    plan = (args.get("plan") or "").strip()
    if not plan:
        raise ValueError("validate_plan requires a non-empty 'plan' string.")

    raw_tasks = args.get("tasks")
    provided = isinstance(raw_tasks, list)
    tasks = []
    if provided:
        tasks = [str(item).strip() for item in raw_tasks if str(item).strip()]
    if not tasks:
        tasks = derive_tasks(plan)
        provided = False
    context = (args.get("context") or "").strip()
    min_conf = _number(
        args.get("min_confidence"), _number(_env("LAYA_MIN_CONFIDENCE"), DEFAULT_MIN_CONFIDENCE)
    )
    threshold = _number(_env("LAYA_NOUL_THRESHOLD"), DEFAULT_NOUL_THRESHOLD)
    max_ambiguity = _number(_env("LAYA_MAX_AMBIGUITY"), DEFAULT_MAX_AMBIGUITY)

    _agent, err = _load_agent()
    if err:
        return _unavailable(err)

    plan_state = {"plan": plan}
    if context:
        plan_state["context"] = context
    try:
        plan_result = _predict(plan_state, PLAN_QUESTIONS)
    except Exception as exc:  # pragma: no cover - depends on local install
        return _unavailable(
            f"Laya failed while evaluating the plan: {type(exc).__name__}: {exc}"
        )

    plan_answers = _answers_of(plan_result)
    plan_checks = {
        "decomposition": _choice_check(plan_answers.get("decomposition"), "adequate", min_conf),
        "deterministic": _noul_check(plan_answers.get("deterministic"), threshold, min_conf),
        "safe": _noul_check(plan_answers.get("safe"), threshold, min_conf),
    }

    task_results = []
    for index, task in enumerate(tasks, start=1):
        # Task first: build_sequence truncates the state from the right to the
        # model's max_len, so a full plan ahead of it would push the task out of
        # the context window and every task would be judged against the same
        # prefix of the plan. This is task-first for that reason.
        state = {"task": task, "plan": plan}
        if context:
            state["context"] = context
        try:
            result = _predict(state, TASK_QUESTIONS)
            answers = _answers_of(result)
            checks = {
                "atomic": _noul_check(answers.get("atomic"), threshold, min_conf),
                "specific": _noul_check(answers.get("specific"), threshold, min_conf),
                "self_contained": _noul_check(
                    answers.get("self_contained"), threshold, min_conf
                ),
                "ambiguity": _ambiguity_check(
                    answers.get("ambiguity"), max_ambiguity, min_conf
                ),
            }
        except Exception as exc:  # pragma: no cover - depends on local install
            checks = {
                name: {
                    "value": None,
                    "confidence": None,
                    "passed": False,
                    "inconclusive": True,
                    "detail": f"Laya failed: {type(exc).__name__}: {exc}",
                }
                for name in ("atomic", "specific", "self_contained", "ambiguity")
            }
        task_results.append(
            {"index": index, "task": task, "verdict": _verdict(checks.values()), **checks}
        )

    issues = []
    inconclusive = []
    for name, check in plan_checks.items():
        if not check["passed"]:
            issues.append(f"plan.{name}: {check['detail']}")
        if check["inconclusive"]:
            inconclusive.append(f"plan.{name}: confidence={check['confidence']}")
    for task in task_results:
        for name in ("atomic", "specific", "self_contained", "ambiguity"):
            check = task[name]
            label = f"task {task['index']}.{name}"
            if not check["passed"]:
                issues.append(f"{label}: {check['detail']}")
            if check["inconclusive"]:
                inconclusive.append(f"{label}: confidence={check['confidence']}")

    if issues:
        status = "failed"
    elif inconclusive:
        status = "inconclusive"
    else:
        status = "passed"

    if status == "passed":
        guidance = (
            "Laya judged the plan sufficiently decomposed and specific. Record "
            "'laya_validation: passed' (with the model and timestamp) before "
            "writing the plan to docs/plans/."
        )
    elif status == "failed":
        guidance = (
            "Revise or subdivide the flagged tasks, then call validate_plan again. "
            "Do not write the plan to docs/plans/ as validated yet."
        )
    else:
        guidance = (
            "Laya answered but with confidence below the threshold, so the result "
            "is not reliable enough to accept as validation. Treat it as NOT "
            "validated; tighten the plan, raise LAYA_MIN_CONFIDENCE only if the "
            "model is calibrated for your domain, or record "
            "'laya_validation: inconclusive'."
        )

    return {
        "laya_available": True,
        "validated": status == "passed",
        "status": status,
        "tasks_source": "provided" if provided else "derived-from-plan",
        "task_count": len(tasks),
        "min_confidence": min_conf,
        "thresholds": {"noul": threshold, "max_ambiguity": max_ambiguity},
        "routing": _routing_of(plan_result),
        "plan": plan_checks,
        "tasks": task_results,
        "issues": issues,
        "inconclusive": inconclusive,
        "guidance": guidance,
    }


# --- entrypoint ------------------------------------------------------------

_OPS = {"status": handle_status, "validate_plan": handle_validate_plan}


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
        except json.JSONDecodeError as exc:
            _respond({"id": None, "ok": False, "error": f"invalid request JSON: {exc}"})
            continue

        request_id = request.get("id")
        op = request.get("op")
        handler = _OPS.get(op)
        if handler is None:
            _respond({"id": request_id, "ok": False, "error": f"unknown op: {op!r}"})
            continue

        try:
            result = handler(request.get("args") or {})
            _respond({"id": request_id, "ok": True, "result": result})
        except ValueError as exc:
            _respond({"id": request_id, "ok": False, "error": str(exc)})
        except Exception as exc:  # pragma: no cover - defensive
            _respond(
                {
                    "id": request_id,
                    "ok": False,
                    "error": f"{type(exc).__name__}: {exc}\n{traceback.format_exc()}",
                }
            )


if __name__ == "__main__":
    main()
