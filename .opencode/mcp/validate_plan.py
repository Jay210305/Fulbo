#!/usr/bin/env python3
r"""Run the Laya plan gate directly, with no MCP client timeout.

The `fulbo-laya` MCP server wraps `.opencode/mcp/laya_worker.py`. The first
`validate_plan` call builds the checkpoint in memory (minutes on CPU), which
exceeds the MCP client's per-call timeout. This script invokes the same worker
in-process, waits as long as it needs, and prints the parsed result, so the
first, slow run always completes.

Usage (from the repository root):

    & ".\.laya-venv\Scripts\python.exe" ".\.opencode\mcp\validate_plan.py"

Optional:
    ... validate_plan.py <plan.md> [tasks.json]

`<plan.md>` defaults to docs/plans/current/backend.md. When a `<plan>.tasks.json`
file sits next to the plan (a JSON array of task strings), it is used as the
explicit task list; otherwise the tasks embedded below are used, and failing
that the worker derives tasks from the plan markdown.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
WORKER = REPO / ".opencode" / "mcp" / "laya_worker.py"
DEFAULT_PLAN = REPO / "docs" / "plans" / "current" / "backend.md"
SENTINEL = "@@LAYA_MCP@@"

DEFAULT_TASKS = [
    "Part B: Define the full Prisma schema (User, BusinessProfile, Field, FieldPhoto, Product, Promotion, Booking, BookingProduct, ScheduleBlock, Review, PaymentSettings and enums), create the initial migration under backend/prisma/migrations, and add backend/prisma/seed.ts. Acceptance: prisma validate passes and prisma studio shows all tables.",
    "Part C: Implement the NestJS auth module with POST /auth/login, POST /auth/register, POST /auth/social, POST /auth/send-otp, and POST /auth/verify-otp, issuing JWTs and using Twilio Verify for OTP. Acceptance: all five endpoints work from Swagger at /api/docs.",
    "Part D: Implement the users module with GET /users/profile, PUT /users/phone, and POST /users/promote-to-manager, enforcing JWT auth and the phone-verification gate on promotion. Acceptance: a JWT client can fetch its profile and a verified user can be promoted to MANAGER.",
    "Part E: Implement the fields module: public GET /fields, GET /fields/:id, GET /fields/:id/availability and manager GET/POST /manager/fields plus GET/PUT/DELETE /manager/fields/:id with owner-only authorization. Acceptance: a manager can list, create, and edit only their own fields and availability returns unavailable slots.",
    "Part F: Implement the upload module (POST /upload, POST /upload/multi max 5, DELETE /upload via Cloudinary), products module (manager CRUD plus PATCH toggle-active), and promotions module (manager CRUD plus PATCH deactivate). Acceptance: an authenticated manager can upload an image and manage their own products and promotions.",
    "Part G1: Implement schedule block listing for managers: GET /manager/schedule/blocks with optional startDate/endDate filters, GET /manager/fields/:fieldId/schedule/blocks, and GET /manager/schedule/blocks/:id, each restricted to blocks on the manager's own fields. Acceptance: a manager lists only their own fields' blocks and a block on another manager's field is not returned.",
    "Part G2: Implement POST /manager/schedule/block creating a block on one of the manager's own fields with startTime, endTime, reason, and note, rejecting overlaps against existing bookings (PENDING/CONFIRMED) and schedule blocks with 409 and a conflicts array. Acceptance: an overlapping block returns 409 with conflicts[] and a non-overlapping block is created.",
    "Part G3: Implement DELETE /manager/schedule/block/:id removing a block only when it belongs to one of the requesting manager's fields. Acceptance: deleting own block succeeds and deleting another manager's block returns 403.",
    "Part H1: Implement POST /bookings: reject unverified phones, detect conflicts against bookings (PENDING/CONFIRMED) and schedule blocks returning 409 with details, calculate the total price (base * hours + weekend + night surcharges + FulVaso items + service fee), and persist the booking with BookingProduct snapshots. Acceptance: a phone-verified player books a free slot successfully and an overlapping request returns 409.",
    "Part H2: Implement booking reads: GET /bookings/user returning the player's own bookings as snake_case PlayerBooking[], GET /bookings/:id visible to the owning player and the field's manager, and GET /bookings/field/:fieldId with from/to filters restricted to the field's manager. Acceptance: a player sees only their bookings and a manager sees only their own fields' bookings.",
    "Part H3: Implement PATCH /bookings/:id/cancel letting a player cancel their own booking (status CANCELLED) and rejecting cancellation of other players' bookings. Acceptance: cancelling own booking returns the updated booking and cancelling another player's booking returns 403.",
    "Part I: Implement manager reporting (GET /manager/bookings, GET /manager/stats, GET /manager/stats/chart, GET/PUT /manager/profile, GET/PUT /manager/payment-settings) and reviews (POST /reviews/:fieldId upsert, GET /reviews/:fieldId, GET /reviews/:fieldId/can-review). Acceptance: dashboard returns stats and chart data and a player with a completed booking can submit one review per field.",
    "Part J: Enable the frontend PWA with vite-plugin-pwa, manifest.json, theme-color, apple-touch-icon, and VITE_API_BASE_URL; fix missing socket.io-client and @react-oauth/google deps, replace hardcoded localhost API hosts, and resolve duplicate src/ vs src/app/ trees. Acceptance: frontend builds, installs as PWA, and calls the API through VITE_API_BASE_URL.",
    "Part K: Add Vitest unit tests for price calculation, booking conflict detection, and the phone-verification gate, and Vitest + Supertest e2e tests covering Phase 1 endpoints including authorization and ownership. Acceptance: npm test and npm run test:e2e pass in backend/.",
]


def load_tasks(plan_path: Path, explicit: str | None):
    if explicit:
        with open(explicit, encoding="utf-8") as handle:
            return json.load(handle)
    sibling = plan_path.with_suffix(plan_path.suffix + ".tasks.json")
    if sibling.exists():
        with open(sibling, encoding="utf-8") as handle:
            return json.load(handle)
    return DEFAULT_TASKS


def main() -> int:
    plan_path = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_PLAN
    tasks_arg = sys.argv[2] if len(sys.argv) > 2 else None

    with open(plan_path, encoding="utf-8") as handle:
        plan = handle.read()
    tasks = load_tasks(plan_path, tasks_arg)

    request = {
        "id": "plan-1",
        "op": "validate_plan",
        "args": {
            "plan": plan,
            "tasks": tasks,
            "context": (
                "Fulbo backend: NestJS 12 + Prisma 7 + PostgreSQL 16 under backend/. "
                "React frontend already written against REST at http://localhost:4000/api. "
                "Part A is done; Parts B-K are pending."
            ),
        },
    }

    env = dict(os.environ)
    env.setdefault("HF_HUB_DISABLE_SYMLINKS", "1")
    env["PYTHONUTF8"] = "1"

    print(
        f"Running Laya ({env.get('LAYA_MODEL', 'english')}); first call "
        "builds the checkpoint and can take minutes...",
        file=sys.stderr,
    )
    proc = subprocess.run(
        [sys.executable, str(WORKER)],
        input=json.dumps(request, ensure_ascii=False) + "\n",
        capture_output=True,
        text=True,
        encoding="utf-8",
        env=env,
    )

    found = False
    for line in proc.stdout.splitlines():
        at = line.find(SENTINEL)
        if at < 0:
            continue
        found = True
        payload = json.loads(line[at + len(SENTINEL):])
        if not payload.get("ok"):
            print("ERROR:", payload.get("error"), file=sys.stderr)
            continue
        result = payload["result"]
        print(json.dumps(result, indent=2, ensure_ascii=False))
        summary = {
            "status": result.get("status"),
            "validated": result.get("validated"),
            "task_count": result.get("task_count"),
            "issues": result.get("issues"),
        }
        print("\n--- SUMMARY ---", file=sys.stderr)
        print(json.dumps(summary, indent=2, ensure_ascii=False), file=sys.stderr)

    if not found:
        print("No sentinel response received. Worker stderr tail:", file=sys.stderr)
        print(proc.stderr[-3000:], file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
