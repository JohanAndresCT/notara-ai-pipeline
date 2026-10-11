# P06.2 US-001 Registration Implementation Record

## 1. Metadata

- Project: Notara MVP
- Phase: P06.2 - Incremental Implementation
- Story: US-001 / HU01 / MVP-001
- Priority: P0 - MVP Core
- Version: 1.0
- Execution date: 2026-10-11
- Implementation status: `READY_WITH_REVIEW_GATES`
- Validation report: `artifacts/06_implementation/US-001_REGISTRATION_VALIDATION.md`
- Prompt: `prompts/06_implementation/P06.2_US-001_register_an_account.md`

## 2. Summary

Implemented the visitor registration path across the React client and Django
backend. A visitor can submit a name, email, and password; the backend validates
and normalizes the input, persists a user with a hashed password, establishes a
Django session, and returns the browser to the home route. Duplicate email,
invalid email, missing fields, and passwords shorter than eight characters are
rejected with clear field errors.

The existing PostgreSQL configuration remains the default. For local testing,
`DJANGO_DB_ENGINE=sqlite` selects the repository-root `db.sqlite3`; both options
use Django models and migrations. The local SQLite database currently contains
one browser-created test account and is ignored by Git.

## 3. Traceability

- FR-001; US-001; HU01; MVP-001
- Canonical P02 acceptance criteria: AC-001 and AC-002
- Story criteria supplied for this implementation: successful account/session/home redirect, duplicate email rejection, required/valid fields, and eight-character password minimum
- Cross-cutting: server-authoritative validation, CSRF, session authentication, responsive use

## 4. Implemented Components

| Component | Implementation | Main files |
|---|---|---|
| Account model | Minimal email-based Django user model with required name, case-normalized unique email, password hashing, and Django session compatibility | `backend/accounts/models.py`, `backend/accounts/migrations/0001_initial.py` |
| Registration API | CSRF-protected JSON endpoint; validates name/email/password; rejects duplicates and uniqueness races; creates and logs in the user | `backend/accounts/views.py`, `backend/notara_backend/urls.py` |
| Session/CSRF API | Issues a CSRF token and returns only the current authenticated user's safe fields | `backend/accounts/views.py` |
| Frontend | Small registration page, API helper, route selection, and minimal home view | `frontend/src/RegistrationPage.tsx`, `frontend/src/lib/api.ts`, `frontend/src/App.tsx`, `frontend/src/HomePage.tsx` |
| Local database choice | Environment-selected SQLite or PostgreSQL; SQLite file is at repository root and Git-ignored | `backend/notara_backend/settings.py`, `.env.example`, `.gitignore` |
| Local integration | Vite proxies `/api` requests to Django in development | `frontend/vite.config.ts` |

## 5. Database and Migration

- Added the initial custom-user migration: `backend/accounts/migrations/0001_initial.py`.
- Applied the migration to `db.sqlite3` on 2026-10-11.
- `email` is unique at the database layer and normalized by the account manager/API before creation.
- `makemigrations --check --dry-run` reports no pending model changes.
- `db.sqlite3` is located at the repository root, excluded by `.gitignore`, and can be moved with `SQLITE_DB_PATH`.
- Keep `DJANGO_DB_ENGINE=postgresql` to use the existing PostgreSQL configuration; run migrations against the target database before use.
- No destructive migrations or pre-existing user data conversion were required in this repository.

## 6. Security and Maintainability

- Passwords are stored using Django's password hashing and are not returned by the API.
- Registration is CSRF-protected; registration/session behavior uses Django's built-in authentication/session facilities.
- The account schema, database choice, focused API helper, registration component, and presentation styles are separated so the database and frontend can be replaced or extended without coupling them to one large component.
- The registration screen's local styles are identified with a short replacement comment for the frontend team.
- Updated `psycopg2-binary` from 2.9.9 to 2.9.11 after the old pin attempted an incompatible source build on the available Python 3.13 environment. The new wheel installed successfully.

## 7. Verification Results

| Check | Command / procedure | Result | Evidence |
|---|---|---|---|
| Python syntax | `python -m compileall backend` | PASSED | Backend modules compiled. |
| Django system check | `DJANGO_DB_ENGINE=sqlite; python backend/manage.py check` | PASSED | No issues identified. |
| Migration generation/application | `makemigrations accounts`; `migrate` | PASSED | `accounts.0001_initial` generated and applied. |
| Migration consistency | `python backend/manage.py makemigrations --check --dry-run` | PASSED | No changes detected. |
| Registration backend tests | `python backend/manage.py test accounts -v 2` | PASSED | 8 tests passed: success/session/hash, duplicate normalization, blank fields, malformed email, 7/8 password boundary, CSRF, and anonymous access. |
| Frontend type check | `npx tsc --noEmit --pretty false` | PASSED | No TypeScript diagnostics. |
| Frontend production build | `npm run build` | PASSED | Vite production build completed. |
| Browser successful registration | VS Code integrated Chrome 150, 360 x 800 | PASSED | Account persisted, authenticated session established, route returned to `/`, welcome state shown; no horizontal overflow. |
| Browser duplicate and short password | VS Code integrated Chrome 150, 1280 x 900 | PASSED | Duplicate email message shown; 7-character password rejected; no horizontal overflow. |
| Browser required fields | VS Code integrated Chrome 150 | PASSED | Empty name, email, and password display individual messages without submission. |
| SQLite persistence | Django shell and filesystem inspection | PASSED | Root `db.sqlite3` exists; one test account persisted; email field is unique. |
| Full browser matrix | Current Chrome, Edge, Firefox at 360/768/1280 px | PARTIAL | Integrated Chrome checks covered 360 and 1280 px; 768 px, Edge, and Firefox were not run. |
| PostgreSQL/Docker runtime | `docker compose` and PostgreSQL connection | NOT_RUN | Local verification used SQLite; PostgreSQL service was not started in this run. |

## 8. Source Alignment and Open Review Gates

The user-supplied story criteria add explicit name/email fields, duplicate-email
rejection, an eight-character password minimum, and authenticated home redirect
to the less-specific P02/P04 registration flow. The implementation follows the
explicit US-001 prompt, but the upstream artifacts have not been revised or
approved as aligned. Product Owner approval remains pending and must not be
inferred from the passing tests.

## 9. Definition of Done

| Item | Status | Evidence / remaining action |
|---|---|---|
| User can register and access an authenticated session | PASS | Backend session test and browser success flow passed. |
| Duplicate emails rejected with clear message | PASS | Backend count/normalization test and browser message passed. |
| Empty/invalid fields and short passwords rejected | PASS | Backend tests and browser validation messages passed; 7 rejected and 8 accepted. |
| Registration tested on mobile and desktop | PASS_WITH_LIMITATION | Smoke checks at 360 and 1280 px; complete P02/P04 browser matrix remains outstanding. |
| Product Owner review and approval | PENDING | Record actual reviewer and approval evidence after review. |

## 10. Final Status

`READY_WITH_REVIEW_GATES` — US-001 implementation and available checks pass.
The full supported-browser/viewport matrix, PostgreSQL runtime check, upstream
artifact alignment, and Product Owner approval remain open.
