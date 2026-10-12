# P06.5 US-004 Score Publication Implementation Record

## 1. Metadata

- Project: Notara MVP
- Phase: P06.5 - Incremental Implementation
- Story: US-004 / HU04 / MVP-004
- Priority: P0 - MVP Core
- Canonical Epic: EPIC-002 - Score Publication and Ownership
- User-supplied epic label: CONTENT
- Version: 1.0
- Execution date: 2026-10-11
- Content mode selected for this implementation: `TEXT_ONLY`
- Decision source: user's explicit selection of `Text-only` at the P06.5
  content-model clarification
- Implementation status: `READY_WITH_REVIEW_GATES`
- Implementation prompt: `prompts/06_implementation/P06.5_US-004_publish_a_score.md`
- Validation prompt: `prompts/06_implementation/P06.5_US-004_publish_a_score_validation.md`
- Validation report: `artifacts/06_implementation/US-004_PUBLICATION_VALIDATION.md`

## 2. Summary

Implemented authenticated publication of `.abc` and plain-text scores using the
existing Django account/session and React foundations. A user can enter title,
instrument, description, format, and textual content. The backend enforces
required fields, supported formats, non-empty content, the 1,000-character
maximum, and the approved minimal ABC header/musical-line checks. Successful
publications persist in the database and appear in the minimal newest-first
community score list on the authenticated home page.

This follows the user-selected `TEXT_ONLY` content mode. JPG/PNG image
publication and file upload were not implemented; the earlier image-specific
acceptance criteria are superseded for this implementation, not reported as
passed. P03/P05 remain unchanged.

## 3. Traceability

- Requirements: FR-005, FR-006, FR-007, FR-008, FR-009, FR-017
- Story: US-004 / HU04 / MVP-004
- Canonical acceptance criteria: AC-009..AC-012
- Business rules: BR-003..BR-006
- Edge cases: EDGE-004..EDGE-007
- Dependency: DEP-002
- P03 priority: P0 / MVP Core / delivery group 3
- User-supplied epic label: CONTENT; canonical epic remains EPIC-002.

## 4. Implemented Components

| Component | Implementation | Main files |
|---|---|---|
| Score persistence | Separate Django `scores` app; owner FK, title, instrument, description, format, text content, timestamps, newest-first index | `backend/scores/models.py`, `backend/scores/migrations/0001_initial.py`, `backend/scores/migrations/0002_alter_score_description_alter_score_instrument_and_more.py` |
| Publication/feed API | Authenticated `POST /api/scores/` validates and persists; authenticated `GET /api/scores/` returns persisted entries | `backend/scores/views.py`, `backend/notara_backend/urls.py` |
| Score rules | Required metadata/content; TEXT/ABC formats only; 1,000-character limit; minimal ABC required fields and basic musical-line check | `backend/scores/views.py` |
| Tests | Publication, feed visibility, authentication, CSRF, required data, formats, length, ABC checks | `backend/scores/tests.py` |
| Frontend create form | Minimal title/instrument/description/format/content form with field feedback | `frontend/src/ScoreCreatePage.tsx` |
| Frontend integration | `/scores/new`, typed create/feed API helpers, score list on authenticated home | `frontend/src/App.tsx`, `frontend/src/lib/api.ts`, `frontend/src/HomePage.tsx`, `frontend/src/styles.css` |

## 5. API and Data Behavior

- `POST /api/scores/` requires an authenticated session and CSRF token. The
  server sets the score owner from `request.user`.
- JSON fields are `title`, `instrument`, `description`, `format` (`ABC` or
  `TEXT`), and `content`.
- Successful creation returns 201 with the saved score.
- `GET /api/scores/` returns persisted scores ordered newest-first for the
  minimal feed integration. Full filtering, pagination, detail, and interaction
  behavior remains in US-007/US-008/US-009/US-010.
- The P05 architecture shows `/api/v1/`; this implementation follows the
  existing working `/api/` convention from US-001..US-003 and does not perform
  an unrelated API-version migration.

## 6. Database and Migrations

- Added score table through `scores.0001_initial`.
- Applied `scores.0001_initial` and `scores.0002` to the existing root
  `db.sqlite3`; no database reset occurred.
- Verification confirmed two existing users and two browser-created scores
  remain persisted after migration.
- No image media or blob storage was added for score publication in the
  selected text-only mode.

## 7. Verification Results

| Check | Command / procedure | Result | Evidence |
|---|---|---|---|
| Django system check | `$env:DJANGO_DB_ENGINE="sqlite"; python backend/manage.py check` | PASSED | No issues identified. |
| Score-specific tests | `python backend/manage.py test scores -v 2` | PASSED | 8 tests passed. |
| Full account/score suite | `python backend/manage.py test accounts scores -v 1` | PASSED | 30 tests passed across US-001..US-004. |
| Migration generation/application | `makemigrations scores`; `python backend/manage.py migrate` | PASSED | Score table and metadata field migrations applied. |
| Migration consistency | `python backend/manage.py makemigrations --check --dry-run` | PASSED | No changes detected. |
| Frontend build | `npm run build` | PASSED | TypeScript and Vite production build succeeded. |
| Browser plain-text publication | VS Code integrated Chrome 150, 360 x 800 | PASSED | Score persisted and appeared on home with metadata/content; no horizontal overflow. |
| Browser required metadata + ABC publication | VS Code integrated Chrome 150, 1280 x 900 | PASSED | Empty title/instrument surfaced errors; valid ABC score appeared with format and preserved lines; no horizontal overflow. |
| PostgreSQL runtime | Docker/PostgreSQL connection | NOT_RUN | Local checks used SQLite. |
| Full supported browser matrix | Chrome/Edge/Firefox at 360/768/1280 | PARTIAL | Integrated Chrome checked at 360 and 1280 px only. |

## 8. Content Decision and Scope Boundary

The user selected `TEXT_ONLY` after the implementation prompt identified the
conflict. This implementation accepts `.abc` and plain text and rejects
unsupported formats including `PDF`; it does not provide a file upload input.
The supplied JPG/PNG acceptance criterion is therefore superseded by the
explicit text-only choice for this implementation. Canonical P02/P03/P05 remain
consistent and were not edited. Product Owner approval remains pending.

## 9. Definition of Done

| Item | Status | Evidence / remaining action |
|---|---|---|
| Published score appears in community feed | PASS | Browser checks showed the persisted plain-text and ABC records on home. |
| Only JPG/PNG accepted; unsupported formats rejected | SUPERSEDED_BY_TEXT_ONLY | Selected content mode is `.abc`/plain text; PDF and unsupported format values are rejected. No image upload UI is present. |
| Required title and instrument validated | PASS | Backend tests and desktop browser errors passed. |
| Complete flow tested on mobile and desktop | PASS_WITH_LIMITATION | Integrated Chrome at 360 and 1280 px; complete P02/P04 matrix not run. |
| Product Owner approval | PENDING | Record actual reviewer/date/approval evidence after review. |

## 10. Final Status

`READY_WITH_REVIEW_GATES` — the user-selected text-only story path and available
checks pass. Product Owner approval, PostgreSQL runtime testing, and the full
browser matrix remain pending. The JPG/PNG criterion is explicitly not part of
the selected text-only implementation.
