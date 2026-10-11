# REMAINING MODULES — Build Scripts

This folder contains the scripts that build the remaining modules of the
Nexus Enterprise Platform after Messages 1–7 of the frontend-first upgrade.

## How to run

From the project root:

    cd D:\NexusScaffold\FINTECH-ENTERPRISE-PLATFORM
    .\remaining\Install-Remaining.ps1

The runner executes scripts 01–06 in order. Every script is idempotent —
re-running is safe. The runner:

1. Applies the Prisma schema patch (fixes crash + adds new tables)
2. Installs Funding Intelligence
3. Installs Exam Builder
4. Installs Biometric Integration Readiness
5. Installs Automation Engine extension
6. Installs the Testing Suite
7. Runs `prisma migrate dev` and `prisma generate`
8. Prints a summary

After it finishes, restart the backend once (`npm run dev` in `backend/`)
and every module is live.

## Modules in this folder

| Script | Module | What it builds |
|--------|--------|----------------|
| `01-schema-patch.ps1` | Schema fix | Adds `Employee.onboarding` back-relation, adds Funding / Biometric / Automation tables |
| `02-funding.ps1` | Funding Intelligence | 3 records (₹60 Cr total), status pipeline, backend + frontend |
| `03-exam-builder.ps1` | Exam Builder | Create exam with sections/questions, publish, backend + frontend |
| `04-biometric.ps1` | Biometric Readiness | Device registry (no raw biometrics), integration abstraction |
| `05-automation.ps1` | Automation Engine | 6 new rules, run history, dashboard |
| `06-tests.ps1` | Testing Suite | Jest config, auth / RBAC / creation / payroll tests |

## Honesty rules enforced

- **Funding** — three records are explicit. Nothing is marked Verified
  without evidence in the DB.
- **Biometric** — devices are labelled `Integration Required` unless
  credentials are configured. No fake face recognition.
- **Automation** — every run writes an `AutomationRunLog` row. No hidden
  background magic.
- **Tests** — tests that cannot run report as skipped, not passed.

## Folder contents after running

- `backend/src/services/*` — service files
- `backend/src/controllers/*` — controller files
- `backend/src/routes/*` — route files
- `frontend/src/pages/*` — page components
- `frontend/src/services/*` — API clients
- `frontend/src/data/navConfig.ts` — updated with new sidebar entries
- `frontend/src/router.tsx` — updated with new routes

Nothing in this folder overwrites existing working code except the two
additive files listed above.