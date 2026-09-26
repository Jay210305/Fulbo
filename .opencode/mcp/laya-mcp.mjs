#!/usr/bin/env node
// Fulbo Laya MCP server (stdio).
//
// Exposes the locally installed Laya decision model as MCP tools, so OpenCode
// can use it as an optional plan-validation gate. Laya is a non-autoregressive
// decision engine (https://github.com/NandhaKishorM/laya) installed as the
// Python package `laya`; this server is only a thin MCP/stdio bridge.
//
// Tool names (server `fulbo-laya`): `validate_plan` and `laya_status`.
//
// Why a Node bridge instead of a Python MCP server? Node ships with OpenCode,
// so the server always starts and its tools are always discoverable. The Python
// worker is resolved lazily and may be absent --- in that case every call
// returns an explicit "unavailable" result instead of pretending to validate.
//
// Configuration (environment variables):
//   LAYA_PYTHON  interpreter with `laya` installed. When unset, `python`,
//                `python3` and `py` are tried in order.
//   LAYA_MODEL / LAYA_ROUTER / LAYA_DEVICE / LAYA_PRELOAD /
//   LAYA_MIN_CONFIDENCE / LAYA_NOUL_THRESHOLD / LAYA_MAX_AMBIGUITY /
//   LAYA_MAX_LEN / LAYA_HEAD_MAX_LEN are forwarded to the worker (see
//   .opencode/mcp/laya_worker.py).
//
// This file must never write to stdout except JSON-RPC; logs go to stderr.

import { spawn, spawnSync } from "node:child_process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SENTINEL = "@@LAYA_MCP@@";
const PROTOCOL_VERSION = "2025-06-18";
const SERVER_NAME = "fulbo-laya";
const SERVER_VERSION = "0.1.0";

const HERE = dirname(fileURLToPath(import.meta.url));
const WORKER_PATH = join(HERE, "laya_worker.py");

const UNAVAILABLE_WARNING =
  "Laya was unavailable, so this plan was NOT validated. Do not describe it as " +
  "Laya-validated. Continue without the gate only if you accept the risk, and " +
  "record 'laya_validation: skipped (unavailable)' with the reason.";

const TOOLS = [
  {
    name: "validate_plan",
    description:
      "Validate an implementation plan with the local Laya decision model. Laya " +
      "answers typed choice/score/noul questions about whether the plan is " +
      "decomposed, whether each task is atomic/specific/essential, and whether " +
      "the plan is safe to proceed. Returns status passed/failed/inconclusive " +
      "plus per-task results. It is a quality gate, not a plan generator. If " +
      "Laya is not installed it returns status 'unavailable' and never claims " +
      "validation.",
    inputSchema: {
      type: "object",
      properties: {
        plan: {
          type: "string",
          description: "Full implementation plan as markdown or plain text.",
        },
        tasks: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional explicit task list. When omitted, tasks are derived from " +
            "markdown headings or list items in `plan`.",
        },
        context: {
          type: "string",
          description:
            "Optional repo/architecture context that helps Laya judge whether " +
            "tasks are specific enough.",
        },
        min_confidence: {
          type: "number",
          description:
            "Optional per-answer confidence floor (0-1). Answers below it make " +
            "the result 'inconclusive' rather than trusted.",
        },
      },
      required: ["plan"],
      additionalProperties: false,
    },
  },
  {
    name: "laya_status",
    description:
      "Report whether the local Laya model is installed and loadable, with the " +
      "resolved interpreter, model, device and confidence threshold. Use this to " +
      "decide whether plan validation is available before relying on it.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

// --- worker management -----------------------------------------------------

let worker = null;
let workerPython = null;
let pyResolved = false;
const pending = new Map();
let seq = 0;

function findPython() {
  if (pyResolved) return workerPython;
  pyResolved = true;
  const explicit = (process.env.LAYA_PYTHON || "").trim();
  const localVenv = join(
    HERE,
    "..",
    "..",
    ".laya-venv",
    process.platform === "win32" ? join("Scripts", "python.exe") : join("bin", "python"),
  );
  const candidates = explicit
    ? [explicit]
    : [localVenv, "python", "python3", "py"];
  for (const candidate of candidates) {
    const probe = spawnSync(
      candidate,
      ["-c", "import sys; sys.stdout.write(sys.version.split()[0])"],
      { encoding: "utf8", windowsHide: true },
    );
    if (!probe.error && probe.status === 0) {
      workerPython = candidate;
      return candidate;
    }
  }
  workerPython = null;
  return null;
}

function startWorker() {
  const python = findPython();
  if (!python) return null;

  const proc = spawn(python, [WORKER_PATH], {
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
    env: process.env,
  });

  const reader = createInterface({ input: proc.stdout });
  reader.on("line", (line) => {
    const at = line.indexOf(SENTINEL);
    if (at < 0) return;
    let message;
    try {
      message = JSON.parse(line.slice(at + SENTINEL.length));
    } catch {
      return;
    }
    const entry = pending.get(message.id);
    if (entry) {
      pending.delete(message.id);
      entry.resolve(message);
    }
  });

  proc.stderr.on("data", (chunk) => {
    process.stderr.write(`[fulbo-laya] ${chunk}`);
  });

  proc.on("error", (error) => {
    for (const [, entry] of pending) entry.reject(error);
    pending.clear();
    worker = null;
  });

  proc.on("exit", (code) => {
    for (const [, entry] of pending) {
      entry.reject(new Error(`Laya worker exited with code ${code}`));
    }
    pending.clear();
    worker = null;
  });

  worker = proc;
  return proc;
}

function callWorker(op, args) {
  const proc = worker || startWorker();
  if (!proc) {
    return Promise.reject(new Error("python-not-found"));
  }
  const id = String(++seq);
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    proc.stdin.write(`${JSON.stringify({ id, op, args })}\n`, (error) => {
      if (error) {
        pending.delete(id);
        reject(error);
      }
    });
  });
}

function unavailable(reason) {
  return {
    laya_available: false,
    validated: false,
    status: "unavailable",
    reason,
    warning: UNAVAILABLE_WARNING,
  };
}

async function runTool(name, args) {
  if (name === "laya_status" || name === "validate_plan") {
    let reply;
    try {
      reply = await callWorker(name === "laya_status" ? "status" : "validate_plan", args);
    } catch (error) {
      const reason =
        error && error.message === "python-not-found"
          ? "No Python interpreter was found (set LAYA_PYTHON to the interpreter that has `laya` installed)."
          : `Laya worker failed to start: ${error && error.message ? error.message : error}`;
      return { isError: false, payload: unavailable(reason) };
    }
    if (!reply.ok) {
      return { isError: true, payload: reply.error || "Laya worker returned an error." };
    }
    return { isError: false, payload: reply.result };
  }
  return { isError: true, payload: `Unknown tool: ${name}` };
}

// --- MCP protocol ----------------------------------------------------------

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function reply(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function fail(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

async function handle(message) {
  const { id, method, params } = message;
  const isNotification = id === undefined || id === null;

  switch (method) {
    case "initialize": {
      const requested = params && params.protocolVersion;
      reply(id, {
        protocolVersion: requested || PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
      });
      return;
    }
    case "notifications/initialized":
    case "initialized":
      return;
    case "ping":
      if (!isNotification) reply(id, {});
      return;
    case "tools/list":
      reply(id, { tools: TOOLS });
      return;
    case "tools/call": {
      const name = params && params.name;
      const args = (params && params.arguments) || {};
      const { isError, payload } = await runTool(name, args);
      const text =
        typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
      reply(id, { content: [{ type: "text", text }], isError });
      return;
    }
    default:
      if (!isNotification) fail(id, -32601, `Method not found: ${method}`);
  }
}

function main() {
  const reader = createInterface({ input: process.stdin });
  let closed = false;
  const maybeExit = () => {
    if (closed && pending.size === 0) process.exit(0);
  };
  reader.on("line", (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let message;
    try {
      message = JSON.parse(trimmed);
    } catch {
      fail(null, -32700, "Parse error");
      return;
    }
    Promise.resolve(handle(message)).catch((error) => {
      if (message && message.id !== undefined && message.id !== null) {
        fail(message.id, -32603, `Internal error: ${error}`);
      }
    });
  });
  // Terminate when the client closes the pipe and no request is in flight;
  // a stdio server has no other work to do and would otherwise linger.
  process.stdin.on("close", () => {
    closed = true;
    maybeExit();
  });
  process.stdin.on("error", () => {
    closed = true;
    maybeExit();
  });
  // Flush the last in-flight result after a client closes the pipe, then exit.
  setInterval(() => maybeExit(), 250).unref();
}

main();
