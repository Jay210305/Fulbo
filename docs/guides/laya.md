# Laya plan-validation gate

Laya ([NandhaKishorM/laya](https://github.com/NandhaKishorM/laya)) is a local,
non-autoregressive **decision engine**. It does not generate text. It answers
typed questions over a text or JSON state in a single forward pass:

| Primitive | Output | Used here for |
| --- | --- | --- |
| `choice` | top label + probabilities + confidence | overall plan decomposition quality |
| `score` | expected level on an ordinal rubric | task ambiguity |
| `noul` | calibrated `P(true)` in `[0, 1]` | atomicity, specificity, self-containedness, safety |

Fulbo uses Laya as an **optional quality gate for implementation plans**. It
judges a plan that another model wrote; it never writes the plan.

## How it is wired

- OpenCode server: `.opencode/mcp/laya-mcp.mjs` (Node MCP stdio server).
- Laya worker: `.opencode/mcp/laya_worker.py` (imports the Python package `laya`).
- Config: `fulbo-laya` in `.opencode/opencode.json` (`type: local`).

Node is used as the bridge because it always ships with OpenCode, so the MCP
tools are always discoverable even before Laya is installed. The Python worker
is started lazily on the first tool call and reports a clear `unavailable`
result when `laya` is missing.

## Install and start Laya

Laya requires Python 3.10+; **Python 3.14 is not yet supported by torch**, so
use 3.13 (or 3.11/3.12) in an isolated project-local venv:

```powershell
uv venv --python 3.13 .laya-venv
uv pip install --python .laya-venv/Scripts/python.exe laya
```

No server or port is required: the MCP server imports the package in-process.
The `.opencode/mcp/laya-mcp.mjs` bridge auto-detects `.laya-venv`, so no
`LAYA_PYTHON` is needed. If you install into a different interpreter, point the
bridge at it with `LAYA_PYTHON`.

The worker forces `HF_HUB_DISABLE_SYMLINKS=1` (required on stock Windows, which
cannot symlink HuggingFace cache blobs) and defaults `LAYA_PRELOAD=0` so only
the `typed-decisions` checkpoint is downloaded. The first `validate_plan` call
downloads the checkpoint and builds it in memory, which can take minutes on CPU;
later calls reuse it.

## Configuration

Set these environment variables before starting OpenCode. All are optional.

| Variable | Default | Meaning |
| --- | --- | --- |
| `LAYA_PYTHON` | auto (`.laya-venv`, then `python`, `python3`, `py`) | interpreter that has `laya` installed |
| `LAYA_MODEL` | `english` | `english`, `typed-decisions`, `multilingual`, or `auto` |
| `LAYA_ROUTER` | `1` | use Laya's built-in `Router` (recommended) |
| `LAYA_DEVICE` | Laya default | e.g. `cpu` or `cuda` |
| `LAYA_PRELOAD` | `0` | preload all checkpoints; `0` downloads only `LAYA_MODEL` |
| `LAYA_MIN_CONFIDENCE` | `0.6` | per-answer confidence floor before a result is trusted |
| `LAYA_NOUL_THRESHOLD` | `0.5` | `P(true)` required for a `noul` check to pass |
| `LAYA_MAX_AMBIGUITY` | `1.5` | highest accepted `score` ambiguity level |
| `LAYA_MAX_LEN`, `LAYA_HEAD_MAX_LEN` | Laya defaults | optional token-budget overrides |

`LAYA_PYTHON` is the only machine-specific value. `.opencode/opencode.json`
forwards all of them from the environment, so nothing machine-specific is
committed.

PowerShell example:

```powershell
$env:LAYA_PYTHON = "C:\path\to\venv\Scripts\python.exe"
$env:LAYA_MODEL = "english"
```

## Tools

| Tool | Purpose |
| --- | --- |
| `validate_plan` | Validate a plan (`plan` required; optional `tasks`, `context`, `min_confidence`). |
| `laya_status` | Report whether Laya is installed/loadable and the resolved settings. |

`validate_plan` derives tasks from markdown headings or list items when `tasks`
is omitted. It returns:

- `status`: `passed`, `failed`, `inconclusive`, or `unavailable`
- `plan`: decomposition, deterministic, safe checks
- `tasks[]`: per-task `atomic`, `specific`, `self_contained`, `ambiguity` + `verdict`
- `issues`, `inconclusive`, and `guidance`

Only `passed` counts as validation. `inconclusive` means Laya answered below
`LAYA_MIN_CONFIDENCE`; `unavailable` means Laya was not present or failed to
load. Neither is validation.

## Tuning

The defaults are tuned for judging Fulbo plans; these are the levers and the
evidence behind them.

### Checkpoint: use `english`, not `typed-decisions`

`typed-decisions` is fine-tuned on four specific synthetic workflows with exact
question-id signatures (`agent_trace_observability`, `customer_service`,
`invoice_processing`, `security_incidents`). The gate's question ids
(`decomposition`, `deterministic`, `safe`, `atomic`, `specific`,
`self_contained`, `ambiguity`) match none of them, so it runs out-of-domain and
answers at ~chance. Measured on `docs/plans/current/backend.md`:

| Setting | plan `deterministic` | plan `safe` | task checks |
| --- | --- | --- | --- |
| `typed-decisions` | 0.55, low confidence | 0.50, low confidence | ~0.50–0.55, all inconclusive |
| `english` | 0.79, confident | 0.81, confident | mostly 0.6–0.86, confident |

`english` is the default. `typed-decisions` remains selectable for its own
workflows.

### Context window: the task must come before the plan

`build_sequence` truncates the serialized state from the right to the model's
`max_len`. The state is `{"task": ..., "plan": ...}`, so the task is always
inside the window; with `{"plan": ..., "task": ...}` a long plan pushed every
task out, and all tasks were scored identically against the same plan prefix.
`LAYA_MAX_LEN` / `LAYA_HEAD_MAX_LEN` override the budgets if a plan-level check
needs to see more of a long plan.

### Other knobs

- `LAYA_MIN_CONFIDENCE` (default `0.6`): answers below it are `inconclusive`.
- `LAYA_NOUL_THRESHOLD` (default `0.5`): `P(true)` needed for a `noul` check.
- `LAYA_MAX_AMBIGUITY` (default `1.5`): highest accepted `score` level.
- `LAYA_DEVICE`: `cuda` if available; CPU is ~10–15x slower.

### Known limitation

Even with `english`, the `choice` (`decomposition`) and `score` (`ambiguity`)
checks report confidence near `0.0`, because the model's probability mass is
spread rather than peaked. Those checks therefore stay `inconclusive` and the
gate will not return `passed` for this schema on the pretrained checkpoints
alone. `docs/guides/laya.md` already warns the base checkpoints are near chance
zero-shot; the durable fix is to fine-tune Laya on Fulbo plans (see the Laya
repository's fine-tuning notebook) and then raise `LAYA_MIN_CONFIDENCE`. Until
then, treat a non-`passed` result as advisory, not as proof the plan is bad.

## When Laya is unavailable

The MCP server still starts and the tools are still discoverable. Calls return
`status: unavailable` with a warning instead of a fabricated result. Per
`AGENTS.md`, the agent must skip the gate, tell the user the plan was not
Laya-validated, and record `laya_validation: skipped (unavailable)`.

## Honesty about accuracy

Laya's base checkpoints are near chance on the typed-decisions benchmark
zero-shot; the published strong results come from fine-tuning on a domain split.
Treat these checks as advisory and confidence-gated, not as proof. For reliable
plan gating, fine-tune Laya on your own plans (see the Laya repository's
fine-tuning notebook) and/or raise `LAYA_MIN_CONFIDENCE` once the model is
calibrated for your domain.

## Running the gate directly (the first call is slow)

The MCP client applies a per-call timeout, but the first `validate_plan` downloads
and builds the checkpoint in memory, which can take minutes on CPU. When that
exceeds the client timeout, run the worker directly so it can wait as long as it
needs:

```powershell
& ".\.laya-venv\Scripts\python.exe" ".\.opencode\mcp\validate_plan.py"
```

`validate_plan.py` invokes the same `.opencode/mcp/laya_worker.py`, passes the plan
at `docs/plans/current/backend.md` with its task list, waits for the result (no
internal timeout), and prints the parsed JSON. Optional arguments:
`validate_plan.py <plan.md> [tasks.json]`. A `<plan>.tasks.json` next to the plan
overrides the embedded tasks. The checkpoint is cached after the first run, so
later runs are faster.

The original scratch command pointed at a copy in the OS temp directory; prefer the
repository script so the path is stable:

```powershell
& ".\.laya-venv\Scripts\python.exe" "C:\Users\jay21\AppData\Local\Temp\opencode\run_laya.py"
```

## Verify

```powershell
opencode mcp list          # fulbo-laya should show "connected"
```

Then in an OpenCode session ask the agent to call `laya_status`; it should
report `laya_available: true` once Laya is installed.
