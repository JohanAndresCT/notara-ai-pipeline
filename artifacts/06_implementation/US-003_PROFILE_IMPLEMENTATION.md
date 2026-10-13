# P06.4 US-003 Profile Management Implementation Record

## 1. Metadata

- Project: Notara MVP
- Phase: P06.4 - Incremental Implementation
- Story: US-003 / HU03 / MVP-003
- Priority: P1 - MVP Supporting
- Canonical Epic: EPIC-001 - Identity and Profile
- User-supplied epic label: ACCESS
- Version: 1.0
- Execution date: 2026-10-11
- Implementation status: `READY_WITH_REVIEW_GATES`
- Prompt: `prompts/06_implementation/P06.4_US-003_manage_profile.md`
- Validation prompt: `prompts/06_implementation/P06.4_US-003_manage_profile_validation.md`
- Validation report: `artifacts/06_implementation/US-003_PROFILE_VALIDATION.md`

## 2. Summary

Implemented an authenticated profile page where a user can view and update name
and main instrument, upload a JPEG/PNG profile photo, and change their password
under canonical P02 US-003. Profile fields persist through the Django ORM; image
bytes use Django's swappable media-storage API and the database stores only the
image path. Photo reads require the current authenticated session.

The existing root SQLite database was migrated additively. Both existing users
were preserved. The code keeps PostgreSQL as the normal database option and
allows media storage/root and photo size limit to be configured independently.

## 3. Traceability and Scope

- Canonical requirements: `FR-003`, `FR-004`
- Story: `US-003` / `HU03` / `MVP-003`
- Canonical acceptance criteria: `AC-006`, `AC-007`, `AC-008`
- Business rule/dependency: `BR-002`, `DEP-001`
- P03 priority: `P1` / `MVP_SUPPORTING` / delivery group 2
- User criteria implemented: view profile name/photo/instrument; save name or
  instrument and reflect immediately; accept JPG/PNG photo and replace prior.
- Canonical password change remains available with current-password
  verification and hashed persistence.
- The request explicitly authorizes a profile photo even though P03 marks image
  uploads `OOS-003`. Upstream artifacts were not silently edited.

## 4. Implemented Components

| Component | Implementation | Main files |
|---|---|---|
| Profile data | Added `main_instrument` and optional `ImageField` to the existing user model | `backend/accounts/models.py`, `backend/accounts/migrations/0002_user_main_instrument_user_photo.py` |
| Profile API | Authenticated GET/PATCH on `/api/v1/me/`; multipart PATCH parsed explicitly; returns updated safe profile data | `backend/accounts/views.py`, `backend/notara_backend/urls.py` |
| Photo validation/storage | Pillow verifies actual JPEG/PNG bytes and extension; configurable 5 MiB default; old file is removed after successful replacement | `backend/accounts/views.py`, `backend/notara-ai-pipeline/backend/notara_backend/settings.py` |
| Protected photo retrieval | `/api/v1/me/photo/` streams only the current authenticated user's image with private/no-store and nosniff headers | `backend/accounts/views.py` |
| Password change | `/api/v1/me/password/` verifies current password, validates new password, hashes it, and preserves the session | `backend/accounts/views.py` |
| Frontend profile | Isolated `/profile` page with photo preview, name/instrument form, and canonical password-change section | `frontend/src/ProfilePage.tsx`, `frontend/src/App.tsx` |
| Frontend API | Typed multipart profile and password requests with cookies, CSRF, and field errors | `frontend/src/lib/api.ts` |
| Media configuration | Environment-selectable Django storage backend and media root; local media excluded from Git | `backend/notara_backend/settings.py`, `.env.example`, `.gitignore` |

## 5. API Contract

- `GET /api/v1/me/`: returns safe identity/profile fields: name, email, main
  instrument, and an authenticated photo URL when set.
- `PATCH /api/v1/me/`: accepts multipart profile fields/photo or JSON profile
  fields; returns the updated safe profile.
- `GET /api/v1/me/photo/`: streams the current user's photo only to an
  authenticated session.
- `POST /api/v1/me/password/`: accepts current and new password; invalid data
  returns field errors and does not change the password.

The repository now uses the approved `/api/v1/` route convention; no
unrelated API-wide `/api/v1/` migration was made.

## 6. Database and Media

- Migration: `accounts.0002_user_main_instrument_user_photo` adds nullable/blank
  profile fields; no existing user row was removed or reset.
- Migration applied to root `db.sqlite3`; Django reported 2 existing users
  preserved and no further migration changes pending.
- Photo file storage defaults to `FileSystemStorage` under `MEDIA_ROOT` (default
  repository-root `media/`). Set `DJANGO_FILE_STORAGE_BACKEND` and `MEDIA_ROOT`
  to use the deployment storage adapter/path. The DB stores a path, not bytes.
- `PROFILE_PHOTO_MAX_BYTES` defaults to 5 MiB as a configurable technical
  resource safeguard; that default is not an approved product requirement and
  needs Product Owner confirmation.
- Local `media/` files are Git-ignored. PostgreSQL and cloud/remote storage were
  not exercised in this run.

## 7. Verification Results

| Check | Command / procedure | Result | Evidence |
|---|---|---|---|
| Pillow installation | Selected Python 3.13 environment package install | PASSED | Pillow 11.3.0 installed. |
| Django system check | `$env:DJANGO_DB_ENGINE="sqlite"; python backend/manage.py check` | PASSED | No issues identified. |
| Migration application | `python backend/manage.py migrate` | PASSED | `0002_user_main_instrument_user_photo` applied; two users preserved. |
| Migration consistency | `python backend/manage.py makemigrations --check --dry-run` | PASSED | No changes detected. |
| Combined account tests | `python backend/manage.py test accounts -v 1` | PASSED | 22 tests passed across registration, auth, profile, media, CSRF, and password change. |
| Frontend build | `npm run build` | PASSED | TypeScript and Vite production bundle succeeded. |
| Browser profile edit/photo, mobile viewport | VS Code integrated Chrome 150, 360 x 800 | PASSED | Name/instrument update persisted; PNG upload saved and visible; authenticated photo endpoint returned 200/image/png; no horizontal overflow. |
| Browser profile edit, desktop viewport | VS Code integrated Chrome 150, 1280 x 900 | PASSED | Name/instrument updated, photo remained visible, no horizontal overflow. |
| Full browser matrix | Chrome/Edge/Firefox at 360/768/1280 | PARTIAL | Integrated Chrome exercised at 360 and 1280 px; other cells not run. |
| PostgreSQL/remote storage | Runtime integration | NOT_RUN | Local verification used SQLite and FileSystemStorage. |

## 8. Source Alignment and Review Gates

- P03 `OOS-003` excludes image uploads and P05 describes a text-first MVP
  without image storage. The explicit user request authorized the profile photo
  implementation for this step; Product Owner approval and upstream artifact
  reconciliation remain pending.
- P02 lists username and description as profile information. The current account
  model uses email as its authentication identifier, and this request only
  specifies name/photo/main instrument. Username and description were not
  invented; reconcile those fields with the Product Owner before claiming full
  canonical FR-003 coverage.
- The configurable 5 MiB upload safeguard is technical, not product-approved.
- Only local filesystem media storage was tested. Configure and validate the
  production backend before deployment.

## 9. Definition of Done

| Item | Status | Evidence / remaining action |
|---|---|---|
| View/edit name, photo, and main instrument | PASS | Backend tests and browser profile page checks passed. |
| Changes persist and reflect immediately | PASS | PATCH response/UI and fresh database/session reads confirmed values. |
| Only JPG/PNG accepted | PASS | Valid JPEG/PNG accepted; unsupported suffix, malformed bytes, and over-limit files rejected. |
| Flow validated on mobile and desktop | PASS_WITH_LIMITATION | Integrated Chrome viewport checks at 360 and 1280 px passed; full matrix not run. |
| Product Owner approval | PENDING | Record actual reviewer/date/approval after review. |

## 10. Final Status

`READY_WITH_REVIEW_GATES` — exercised profile, photo, password, security, and
build checks pass. Product Owner approval, upstream scope/field alignment, the
full browser matrix, and production storage/PostgreSQL verification remain
outstanding.
