---
laya_validation: skipped (unavailable)
laya_model: typed-decisions
laya_checked_at: 2026-09-22T00:00:00Z
laya_reason: The Python package `laya` is not installed in the resolved interpreter (C:\Python314\python.exe), so `fulbo-laya` returned `status: unavailable`. The plan below was not Laya-validated.
---

# Agent system reorganization

Reorganize `.agents/skills/` into canonical category directories and integrate
third-party skills, without breaking Graphify or agent discovery. See
`docs/agent-system.md` for the resulting architecture and verification results.

## Outcome

- Moved the six existing project skills to `.agents/skills/project/` (git history preserved).
- Added frontend skills (`emilkowalski`, `impeccable`, `taste`), agent-optimization skills (`ponytail`, `superpowers`), an infrastructure skill (`mcp-builder`), and a quality skill (`laya`).
- Verified OpenCode discovers `.agents/skills/**/SKILL.md` recursively (binary glob `skills/**/SKILL.md`).
- Graphify configuration untouched.
