# Fulbo agent system

How the Fulbo repository organizes agent configuration, skills, quality gates,
and platform adapters for Agy (Antigravity), Codex, and OpenCode.

## Canonical layout

```
.agents/
├── rules/                       # project-wide behavioral rules (Graphify, Ponytail)
├── workflows/                   # Antigravity workflow definitions (Graphify pipeline)
├── mcp_config.json              # Antigravity IDE MCP convention (agy CLI uses ~/.gemini/config/mcp_config.json)
├── skills/
│   ├── project/                 # Fulbo-specific engineering skills (source of truth)
│   ├── frontend/                # reusable frontend/UI skills
│   ├── agent-optimization/      # agent reasoning / workflow skills
│   ├── infrastructure/          # developer-infrastructure skills (MCP)
│   └── quality/                 # validation / quality-gate skills (Laya)
└── ...
```

All skills live under `.agents/skills/`. This is the single canonical project
location. OpenCode and Codex read it directly; the `agy` CLI reads skills from
its global `~/.gemini/config/` instead (see "Discovery model").

## Discovery model

`.agents/skills/` is the canonical project skill layer. Which agents actually
read it differs by harness (verified by live turns):

- **OpenCode** scans `.agents/skills/**/SKILL.md` recursively (its loader uses
  the glob `skills/**/SKILL.md` under `.agents/`). Each `SKILL.md` `name` must
  match its directory name.
- **Codex** reads `.agents/skills/**` as its project skill path (confirmed:
  Codex's skill loader reads `.agents/skills/frontend/impeccable/SKILL.md`).
- **Agy (Antigravity CLI)** reads skills from its **global** config
  `~/.gemini/config/skills/` and from installed plugins (`~/.gemini/config/plugins/`),
  **not** from `.agents/skills/`. A live `agy` turn enumerated only its global
  skill (`graphify`), the native Superpowers plugin skills, and built-ins; the
  project/frontend/ponytail/mcp-builder/laya skills were not listed. `.agents/`
  is the Antigravity *IDE* convention (rules/workflows), not the CLI's skill
  path.

Consequences, all verified:

- OpenCode and Codex discover the full `.agents/skills/` tree.
- Agy discovers Superpowers (native plugin) and Graphify (global skill); the
  remaining `.agents/skills/` content is served to Agy only if explicitly
  installed into its global skill/plugin directories.

Because OpenCode's and Codex's discovery is recursive, skills are organized into
category subdirectories without breaking them. The `name` in each skill's
frontmatter always equals its directory name.

## Categories

### `.agents/skills/project/` — Fulbo conventions

Skills specific to this repository. They are authoritative for Fulbo behavior
and override generic guidance when they conflict.

| Skill | Purpose |
| --- | --- |
| `api-integration` | Align frontend service calls with NestJS REST endpoints/DTOs. |
| `backend-api-development` | NestJS modules, endpoints, DTOs, guards, services. |
| `frontend-development` | React/Vite UI features, hooks, client state. |
| `fulbo-testing` | Backend/frontend/cross-app test coverage. |
| `prisma-migrations` | Prisma schema, migrations, seed, generated client. |
| `project-architecture-planning` | Plans, ADRs, milestone acceptance. |

### `.agents/skills/frontend/` — UI expertise

Reusable frontend/UI skills. The Fulbo-specific `project/frontend-development`
skill orchestrates and overrides these where Fulbo architecture requires it.

- `emilkowalski/` — 13 design/animation skills (Emil Kowalski philosophy,
  animation decision framework, UI-library selection, prototype, review, etc.).
  Source: `emilkowalski/skill` (MIT).
- `impeccable/` — a single design-craft skill (23 commands, 61 deterministic
  detector rules) backed by a self-contained Rust binary that the skill
  downloads on first use. Source: `pbakaus/impeccable` (Apache-2.0).
- `taste/` — 13 anti-slop design skills (design-taste-frontend, minimalist,
  brutalist, soft, redesign, image-to-code, etc.). Source:
  `Leonxlnx/taste-skill` (MIT).

### `.agents/skills/agent-optimization/` — reasoning & workflow

- `ponytail/` — 6 skills encoding the "lazy senior dev" discipline: YAGNI
  ladder, minimal diffs, root-cause fixes. Source: `DietrichGebert/ponytail`
  (MIT).
- `superpowers/` — 15 skills forming a development methodology: brainstorming,
  writing-plans, executing-plans, subagent-driven-development, TDD,
  systematic-debugging, code review, verification-before-completion, etc.
  Includes per-harness `references/*-tools.md` adapters. Source:
  `obra/superpowers`.

### `.agents/skills/infrastructure/` — developer infrastructure

- `mcp-builder/` — guide + references + eval harness for building high-quality
  MCP servers (Python FastMCP and Node/TypeScript MCP SDK). Source:
  `anthropics/skills` `skills/mcp-builder`.

### `.agents/skills/quality/` — validation gates

- `laya/` — how to use the local Laya decision model (`fulbo-laya` MCP server)
  as a quality gate for plans and test claims.

## Skill precedence

When skills disagree, the more specific, project-bound rule wins:

1. Project-specific rules (`AGENTS.md`, `.agents/rules/`).
2. Project skills (`project/*`) — Fulbo conventions and testing.
3. Specialized domain skills (`frontend/*`, `infrastructure/*`).
4. Agent-optimization / workflow skills (`agent-optimization/*`).
5. Generic default agent behavior.

Concretely: `project/frontend-development` beats `frontend/*` on Fulbo-specific
architecture; `project/fulbo-testing` beats a generic testing workflow.

This is expressed through skill *content* (each project skill tells the agent
it is authoritative for Fulbo), not through a platform-specific precedence
field, because the agents' native mechanisms are: project rules override
skills, skills override defaults. No additional precedence behavior is invented.

## Responsibility split

| Component | Responsibility |
| --- | --- |
| Graphify | understand the repository (structure, relationships, context). |
| Project skills | Fulbo engineering conventions. |
| Frontend skills | frontend/UI domain expertise. |
| Ponytail | agent optimization (minimal, YAGNI discipline). |
| Superpowers | development methodology / workflow. |
| MCP Builder | MCP server development. |
| Laya | quality / validation gate. |
| Rules | global project behavior. |

Graphify remains responsible for repository context and is not duplicated by
any skill. Its configuration (`.agents/rules/graphify.md`,
`.agents/workflows/graphify.md`, the Graphify skill installs, and
`graphify-out/`) is unchanged.

## Source of truth vs. generated files

- **Source of truth (project-canonical, committed):** `.agents/rules/`,
  `.agents/skills/`, `AGENTS.md`.
- **Project config (committed):**
  - `.opencode/opencode.json` and `.opencode/mcp/` — OpenCode plugin/MCP config
    (the `fulbo-laya` bridge lives here).
  - `.opencode/plugins/graphify.js`, `superpowers.js`, `ponytail.js` — OpenCode
    plugins (graphify is generated by Graphify; the other two are hand-written).
  - `.agents/mcp_config.json` — Antigravity IDE MCP convention (not read by the
    `agy` CLI, which uses `~/.gemini/config/mcp_config.json`).
- **Generated (do not edit):** `graphify-out/`.
- **Machine-global (not committed):** `~/.codex/plugins/...`, `~/.codex/config.toml`,
  `~/.gemini/config/` (Agy global skills/plugins/mcp), `.laya-venv/` (gitignored),
  HuggingFace model cache, agent auth/credentials.

Do not hand-duplicate skill content into per-agent directories. OpenCode and
Codex read the same `.agents/skills/` tree; Agy does not, so its global skill
directory and plugin registry are the only places it discovers skills.

## Third-party skills: what was adapted

Third-party skills are copied into `.agents/skills/` verbatim except where the
target layout or OpenCode's `name == directory` rule required a mechanical fix:

- `taste/*` skill directories were renamed to match their frontmatter `name`
  (e.g. `minimalist-skill/` -> `minimalist-ui/`), because OpenCode requires the
  directory name to equal the skill `name`. Content is otherwise unchanged.
- `impeccable` hardcoded `.agents/skills/impeccable/` script paths were updated
  to `.agents/skills/frontend/impeccable/` after the move.
- Heavy platform-specific machinery (`.claude-plugin/`, `.codex-plugin/`,
  `.opencode/plugins/*.mjs`, hooks, MCP servers, Rust binaries) is not vendored
  as skill content. Where a native plugin genuinely adds activation, a thin
  adapter is used instead (see "Platform integrations"): OpenCode
  `.opencode/plugins/superpowers.js` (bootstrap) and `.opencode/plugins/ponytail.js`
  (always-on ruleset); Agy and Codex use their native plugin installs.

Each vendor directory carries a `SOURCE.md` recording upstream repo, URL,
purpose, install method, local modifications, and update procedure.

Licenses are preserved in each vendor directory (`LICENSE`, `LICENSE.txt`).

## Platform integrations

For each harness there are two layers: **portable** (the `.agents/skills/` tree,
discovered by all three) and **native** (a harness-specific plugin/hook/rule
that provides activation the portable skills cannot, e.g. always-on injection).

### Agy / Antigravity

- **Portable skills:** the `.agents/skills/` tree is **not** read by the `agy`
  CLI; only `graphify` (global `~/.gemini/config/skills/graphify`) and plugin
  skills are discovered.
- **Native Superpowers:** `agy plugin install https://github.com/obra/superpowers`
  — installed (15 skills + session-start hook), verified live (`agy` turn listed
  all 15 Superpowers skills).
- **Ponytail:** `.agents/rules/ponytail.md` is vendored as the documented
  Antigravity rule; its effect on the `agy` CLI was not confirmed by a live turn.
- Rules: `AGENTS.md` and `.agents/rules/`. MCP: the `agy` CLI reads
  `~/.gemini/config/mcp_config.json` (not `.agents/mcp_config.json`, which is
  the Antigravity IDE convention).

### Codex

- **Portable skills:** `.agents/skills/**` (Codex project skill path; confirmed
  via its skill loader reading `.agents/skills/frontend/impeccable/SKILL.md`).
- **Native Superpowers:** `codex plugin add superpowers@openai-curated-remote`
  — installed and enabled (v6.4.1).
- **Native Ponytail:** not installed — the openai-curated-remote marketplace
  only lists a re-package (`engineering-suite-ponytail`), not the official
  `DietrichGebert/ponytail`. Ponytail is served by the portable skills.
- Rules: `AGENTS.md`. MCP: `codex mcp add fulbo-laya ...` (global config).

### OpenCode

- **Portable skills:** `.agents/skills/**` (recursive) and
  `~/.config/opencode/skills/`.
- **Native Superpowers:** thin bootstrap adapter `.opencode/plugins/superpowers.js`
  (injects `using-superpowers`; does not re-register skills).
- **Native Ponytail:** thin always-on adapter `.opencode/plugins/ponytail.js`
  (injects the `.agents/rules/ponytail.md` ruleset into the system prompt).
- MCP: `.opencode/opencode.json` (`fulbo-laya`, `fulbo-git`, `fulbo-fetch`).
- Graphify plugin: `.opencode/plugins/graphify.js`.

### Ponytail MCP (evaluated, not installed)

Ponytail ships an MCP server (`ponytail-mcp/`) that exposes the same ruleset as
a user-invoked prompt and a `ponytail_instructions` tool. It is deliberately
**not** installed: it only duplicates the ruleset already available via the
portable skills and the always-on rule, and MCP prompts are user-invoked, so it
adds no activation beyond what the adapters above already provide.

## Quality gate (Laya)

Laya is exposed through the `fulbo-laya` MCP server (`validate_plan`,
`laya_status`). See `.agents/skills/quality/laya/SKILL.md` and
`docs/guides/laya.md`.

Laya output is an **advisory quality signal**, not proof of correctness. It can
surface potential decomposition issues, omissions, inconsistencies, or areas
requiring review; it does not prove a plan or an implementation is correct.

### Runtime

The Laya engine is the Python package `laya`, installed in the project-local
venv `.laya-venv/` (Python 3.13; Python 3.14 is unsupported by torch):

```powershell
uv venv --python 3.13 .laya-venv
uv pip install --python .laya-venv/Scripts/python.exe laya
```

`.opencode/mcp/laya-mcp.mjs` auto-detects `.laya-venv` and
`.opencode/mcp/laya_worker.py` forces `HF_HUB_DISABLE_SYMLINKS=1` (required on
stock Windows) and defaults `LAYA_PRELOAD=0` (loads only the `typed-decisions`
checkpoint). `validate_plan` is operational and returns real
`passed`/`failed`/`inconclusive` results; `laya_status` reports
`laya_available: true, laya_version: 0.3.6`.

The `fulbo-laya` MCP server is wired into all three harnesses:

- OpenCode: `.opencode/opencode.json` (verified end-to-end via the MCP bridge).
- Codex: `codex mcp add fulbo-laya ...` (global config).
- Agy: `agy mcp add fulbo-laya node <abs path to laya-mcp.mjs>` (global config;
  verified live: an `agy` turn called `laya_status` -> `laya_available: true`).

### Workflow

1. Agent receives a task.
2. Agent inspects repository context through Graphify / project skills.
3. Agent produces a plan.
4. Plan is decomposed into explicit TODOs.
5. `validate_plan` is invoked with the plan and task list.
6. Laya results are treated as a quality signal.
7. Agent reviews Laya `issues` / `guidance`.
8. Agent corrects the plan when appropriate.
9. Implementation begins.
10. Tests are created/executed with the project's normal testing infrastructure.
11. Test quality is a separate concern: Laya does not expose `validate_test`.

Laya does not replace tests and does not prove correctness.

### Limitations

- Laya exposes only `validate_plan` and `laya_status`. There is no
  `validate_test` tool; test-level validation is not a first-class Laya
  capability (a test claim can only be gated by passing test descriptions to
  `validate_plan` as plan text — a weaker gate).
- The base checkpoint is near chance zero-shot; results are confidence-gated and
  frequently `inconclusive` until the model is fine-tuned on this project's
  plans. Only `passed` counts as validation; `inconclusive`/`unavailable` are
  recorded as `laya_validation: skipped (unavailable)` / `inconclusive`.

## Adding a new skill

1. Create `.agents/skills/<category>/<name>/SKILL.md` with frontmatter `name`
   (matching the directory) and `description`.
2. Keep the `name` lowercase with single hyphens and equal to the directory.
3. Reference sibling skills by name, not by filesystem path.
4. Do not add a new category unless there is a real architectural reason.

## Updating third-party skills

Inspect the upstream repository before updating. Then either:

- Re-run the transport the vendor documents (e.g. `npx skills add
  emilkowalski/skill`, `npx impeccable install`), then move the installed files
  into the canonical category path and re-apply the mechanical fixes above; or
- Re-copy the skill directory from the upstream checkout.

Always re-run the `name == directory` check afterward:

```powershell
Get-ChildItem .agents/skills -Recurse -Filter SKILL.md | ForEach-Object {
  $dir = Split-Path $_.FullName -Parent | Split-Path -Leaf
  $name = (Get-Content $_.FullName -Raw) -match '(?ms)^---\s*\n(.*?)\n---' | Out-Null
  $fm = $Matches[1]
  $name = if ($fm -match '(?m)^name:\s*(.+?)\s*$') { $Matches[1].Trim().Trim('"').Trim("'") } else { '<none>' }
  "$dir -> $name"
}
```

## Verification

- OpenCode: `opencode mcp list` (expect `fulbo-laya` connected when Laya is
  installed), and confirm the `skill` tool lists project/frontend/optimization
  skills.
- Graphify: `graphify query "<question>"` still returns a scoped subgraph.

## Reproducibility

### PROJECT-REPRODUCIBLE (committed to Git)

- `.agents/` (rules, workflows, skills, `mcp_config.json`)
- `.opencode/` (`opencode.json`, `plugins/`, `mcp/`)
- `docs/` (including this file, `docs/guides/laya.md`, `docs/guides/mcp.md`)
- `AGENTS.md`, `.gitignore`
- Skill `SOURCE.md` metadata

A new developer with the repo gets the full canonical skill layer and the MCP
bridge source. OpenCode and Codex discover `.agents/skills/` automatically.

### USER-MACHINE-SPECIFIC (reproduced via documented commands)

| State | Location | Reproduce with |
| --- | --- | --- |
| Agy Superpowers plugin | `~/.gemini/config/plugins/superpowers` | `agy plugin install https://github.com/obra/superpowers` |
| Agy global Graphify skill | `~/.gemini/config/skills/graphify` | `graphify install --platform antigravity` |
| Agy MCP (`fulbo-laya`) | `~/.gemini/config/mcp_config.json` | `agy mcp add fulbo-laya node <abs .opencode/mcp/laya-mcp.mjs>` |
| Codex Superpowers plugin | `~/.codex/plugins/cache/.../superpowers` | `codex plugin add superpowers@openai-curated-remote` |
| Codex MCP (`fulbo-laya`) | `~/.codex/config.toml` | `codex mcp add fulbo-laya -- node <abs path>` |
| Laya Python venv | `.laya-venv/` (gitignored) | `uv venv --python 3.13 .laya-venv` + `uv pip install ... laya` |
| Model cache | `~/.cache/huggingface/hub/...` | downloaded on first `validate_plan` |
| Auth/credentials | agent-specific | per-agent login (never committed) |

## Troubleshooting

- **"missing YAML frontmatter" in Codex:** a skill `SKILL.md` has a UTF-8 BOM
  (introduced by `Set-Content -Encoding UTF8` on PowerShell 5.1). Strip it:
  rewrite with `[System.IO.File]::WriteAllText($p, $text, (New-Object System.Text.UTF8Encoding($false)))`.
- **Laya `status: unavailable`:** `.laya-venv` is missing or Python is 3.14.
  Recreate with Python 3.13 and verify `laya_status` via the MCP bridge.
- **Laya download `WinError 1314`:** symlink privilege error — ensure
  `HF_HUB_DISABLE_SYMLINKS=1` (the worker sets it by default) and clear the
  broken `~/.cache/huggingface/hub/models--convaiinnovations--laya`.
- **Agy doesn't list project skills:** expected — the `agy` CLI reads global
  `~/.gemini/config/skills/`, not `.agents/skills/`.
- **Headless agent can't call MCP:** add an `mcp` allow-rule or run with
  `--dangerously-skip-permissions` (Agy) / approve (Codex/OpenCode).

## Known limitations

- Laya base checkpoints are near chance zero-shot; plan validation is advisory
  and confidence-gated until the model is fine-tuned for this project. There is
  no dedicated test-validation tool.
- `impeccable` and `mcp-builder` reference external runtimes (a Rust binary and
  Python/Node MCP stacks, respectively) that are fetched at use time, not
  vendored.
- Some `emilkowalski` skills target mobile/Swift (`write-swift`,
  `mobile-native`); they are frontend-adjacent and kept under `frontend/` for
  cohesion.
- Codex has no official `ponytail` plugin in its marketplace (only a re-package),
  so Ponytail is served to Codex via the portable skills only.
- The `agy` CLI does not discover `.agents/skills/`; only OpenCode and Codex do.
  Agy receives Superpowers (plugin) and Graphify (global skill), and its Laya
  MCP server was wired manually.

## Final status matrix

Status vocabulary: `NOT AVAILABLE` (not present), `DISCOVERED` (enumerable),
`ACTIVATED` (mechanism registered/enabled), `EXECUTED` (actually invoked),
`VERIFIED` (execution returned an expected result), `PARTIALLY VERIFIED` (some
layers tested, no full live turn).

| Capability | Agy | Codex CLI | OpenCode | Evidence |
| --- | --- | --- | --- | --- |
| Graphify | VERIFIED (live) | DISCOVERED | DISCOVERED (no duplicate) | Agy turn listed `graphify`; `~/.codex/skills/graphify`; OpenCode `init count=59`, no dup warning |
| Project skills | NOT AVAILABLE | DISCOVERED | DISCOVERED | Codex loader read `.agents/skills/...`; OpenCode count 59; Agy turn did not list them |
| Frontend skills | NOT AVAILABLE | DISCOVERED | DISCOVERED | same as above |
| Ponytail | NOT AVAILABLE (rule unverified) | DISCOVERED (portable) | ACTIVATED (adapter) | OpenCode adapter logic-tested; no Agy/Codex live turn |
| Superpowers | VERIFIED (live, plugin) | ACTIVATED (plugin) | ACTIVATED (adapter) | Agy listed 15 skills; Codex `installed, enabled`; OpenCode adapter logic-tested |
| MCP Builder | NOT AVAILABLE | DISCOVERED | DISCOVERED | present in `.agents/skills/` |
| Laya | VERIFIED (live, MCP) | ACTIVATED (MCP wired) | EXECUTED (bridge) | Agy `laya_status` -> `true`; Codex `codex mcp list`; OpenCode bridge `validate_plan` ran |

Notes:

- **OpenCode** live turn blocked by OpenRouter credits; verified at the lower
  level: `init count=59`, MCP bridge `initialize`/`tools/list`/`validate_plan`
  executed directly, plugin hooks logic-tested.
- **Codex** live turn hit an account usage limit (one earlier turn did run and
  revealed skill loading from `.agents/skills/`); Superpowers plugin is
  installed/enabled, Laya MCP wired, but a full skill-list turn was not
  completed.
- **Agy** live turns succeeded: skills enumerated and `laya_status` returned
  `laya_available: true, laya_version: 0.3.6`.
- Agy Superpowers plugin: `agy plugin list` shows `superpowers` (`skills` +
  `hooks`). Codex Superpowers plugin: `codex plugin list` shows `installed, enabled`.
- Ponytail MCP: evaluated and intentionally not installed.
- Graphify duplicate: removed `~/.claude/skills/graphify` (Claude CLI not
  installed); the duplicate-skill warning is gone.
