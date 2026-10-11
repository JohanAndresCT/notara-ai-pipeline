# P06.3 US-002 Login and Logout Implementation Record

## 1. Metadata

- Project: Notara MVP
- Phase: P06.3 - Incremental Implementation
- Story: US-002 / HU02 / MVP-002
- Priority: P0 - MVP Core
- Canonical Epic: EPIC-001 - Identity and Profile
- Version: 1.0
- Execution date: 2026-10-11
- Implementation status: `READY_WITH_REVIEW_GATES`
- Implementation prompt: `prompts/06_implementation/P06.3_US-002_authenticate_and_leave_account.md`
- Validation prompt: `prompts/06_implementation/P06.3_US-002_authenticate_and_leave_account_validation.md`
- Validation report: `artifacts/06_implementation/US-002_LOGIN_VALIDATION.md`

## 2. Summary

Implemented login and logout using the P06.2 email-based Django account and
server-side session foundation. Valid credentials authenticate the registered
user and direct the React client to the authenticated home/dashboard shell.
Invalid and unknown credentials receive the same generic message. Logout is a
CSRF-protected POST, calls Django's logout helper, clears the client flow only
after success, and returns the browser to public home.

No full score feed, profile workflow, or other story was added. The existing
P06.2 registration flow remains available and links to login.

## 3. Traceability

- Requirements: FR-002, FR-017
- Story: US-002 / HU02 / MVP-002
- Canonical acceptance criteria: AC-003, AC-004, AC-005
- Business rule: BR-002
- Edge case: EDGE-002
- Dependency: DEP-001
- P03 priority: P0, delivery group 1
- User-supplied epic label: ACCESS; canonical epic remains EPIC-001.

## 4. Implemented Components

| Component | Implementation | Main files |
|---|---|---|
| Login API | Django `authenticate()` and `login()` against the existing email-based user; one generic invalid-credential response | `backend/accounts/views.py`, `backend/notara_backend/urls.py` |
| Logout API | Authenticated CSRF-protected POST; Django logout flushes the server session | `backend/accounts/views.py`, `backend/notara_backend/urls.py` |
| Login form | Dedicated accessible React login page with generic feedback, pending state, password clearing after failure, and registration link | `frontend/src/LoginPage.tsx` |
| Session-aware navigation | Minimal `/login` route, authenticated home logout action, and public login/register links | `frontend/src/App.tsx`, `frontend/src/HomePage.tsx`, `frontend/src/RegistrationPage.tsx` |
| API integration | Same-origin cookie credentials and CSRF token for authentication mutations | `frontend/src/lib/api.ts` |
| UI styling | Reuses the small replaceable US-001 presentation styles for login/logout controls | `frontend/src/styles.css` |

## 5. API and Security Behavior

- `POST /api/auth/login/` accepts email/password and returns safe user identity
  on success. Unknown email and incorrect password return the same generic
  message and status.
- `POST /api/auth/logout/` requires an authenticated session and valid CSRF
  token; logout deletes that server-side session.
- `GET /api/me/` remains the session authority and returns 401 after logout.
- Browser credentials remain in the form request only; no token or password is
  stored in local/session storage or returned by the API.
- Routes follow the existing `/api/` convention used by US-001. Architecture
  documents `/api/v1/`; no API-wide version migration was included.

## 6. Changed Files

- Backend: `backend/accounts/views.py`, `backend/accounts/tests.py`,
  `backend/notara_backend/urls.py`.
- Frontend: `frontend/src/LoginPage.tsx`, `frontend/src/lib/api.ts`,
  `frontend/src/App.tsx`, `frontend/src/HomePage.tsx`,
  `frontend/src/RegistrationPage.tsx`, `frontend/src/styles.css`.
- No database model or migration change was required.

## 7. Verification Results

| Check | Command / procedure | Result | Evidence |
|---|---|---|---|
| Django system check | `$env:DJANGO_DB_ENGINE="sqlite"; python backend/manage.py check` | PASSED | No issues identified. |
| Combined registration/auth tests | `python backend/manage.py test accounts -v 2` | PASSED | 12 tests passed. |
| Focused auth regression | `python backend/manage.py test accounts.tests.AuthenticationTests -v 2` | PASSED | 4 tests passed, including exact server-side session-row deletion on logout. |
| Migration consistency | `python backend/manage.py makemigrations --check --dry-run` | PASSED | No model changes detected. |
| Frontend production build | `npm run build` | PASSED | TypeScript project build and Vite bundle succeeded. |
| Browser login/logout, mobile | VS Code integrated Chrome 150, 360 x 800 | PASSED | Wrong password stayed on login with generic feedback; correct login reached authenticated home; logout returned to public home; `/api/me/` returned 401; no horizontal overflow. |
| Browser invalid login/navigation, desktop | VS Code integrated Chrome 150, 1280 x 900 | PASSED | Unknown email showed the same generic error, remained on login, no horizontal overflow; registration login link navigated to `/login`. |
| PostgreSQL/Docker runtime | Not run | NOT_RUN | Browser/backend validation used the existing SQLite test setup. |
| Full browser matrix | Chrome/Edge/Firefox at 360/768/1280 px | PARTIAL | Integrated Chrome checked at 360 and 1280 px only. |

## 8. Definition of Done

| Item | Status | Evidence / remaining action |
|---|---|---|
| Valid login opens authenticated home/dashboard | PASS | Backend session test and browser login at 360 px passed. |
| Invalid credentials show safe error without access | PASS | Wrong password/unknown-email API responses match; browser remains public. |
| Logout completely clears the active session | PASS | Test confirms exact session row deletion; browser `/api/me/` returns 401 after logout. |
| Flow verified on mobile devices | PASS_WITH_LIMITATION | Mobile viewport smoke test at 360 px passed; physical mobile and full matrix not run. |
| Product Owner approval | PENDING | Record actual reviewer/date/approval evidence after review. |

## 9. Review Gates and Deviations

- Product Owner approval is pending; this record does not claim full DoD
  completion.
- The complete P02/P04 browser matrix and PostgreSQL/Docker execution remain
  outstanding.
- Existing `/api/` routes differ from architecture's `/api/v1/` examples.
  This story followed the working existing route convention and did not make an
  unrelated API-contract migration.

## 10. Final Status

`READY_WITH_REVIEW_GATES` — behavior and available automated/browser checks
pass. Product Owner approval, complete browser matrix, and PostgreSQL runtime
verification remain outstanding.
