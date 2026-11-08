# MVP Evaluation - Notara

- Stage: P10 - Evaluation
- Evaluation date: 2026-10-14
- Verdict: `NEEDS_ITERATION`
- Machine-readable companion: [eval_metrics.json](./eval_metrics.json)

## 1. Executive Summary

**Verdict: `NEEDS_ITERATION`.** Notara is a working, deployed MVP whose core flow (register, log in, publish, browse, view detail, react, comment, edit, delete) is implemented and backed by 88 passing backend tests and 5 end-to-end scenarios. The evidence does not yet support moving on without a first improvement round: one security concern, several implementation-versus-requirement deviations that need a team decision, and verification gaps remain.

**Maturity:** a deployed prototype with partial verification (`PARTIALLY_VERIFIED`). There are no user, adoption or business data.

**Demonstrated strengths**
- 13 of 20 requirements are `VERIFIED`; none is `NOT_IMPLEMENTED`.
- Backend: 88 tests passed (P07 reported 88/88; the P09 stage re-executed them on SQLite). Frontend: 5 end-to-end scenarios passed in P07 (SQLite).
- A real defect (`BUG-P07-204-01`, DELETE answered 204 with a body) was found by an E2E test, fixed and covered by a regression test.
- The application answers on its public Railway URL and a CI workflow tests and deploys it.
- Documentation (README, 8 documents in `docs/`, published MkDocs site) was audited against the code with `PASS_WITH_WARNINGS`.

**Material limitations and risks**
- Several `scores` write endpoints use `@csrf_exempt` (`EVAL-001`).
- Reacting to and commenting on one's own score is allowed, and `Reaction` and `Like` duplicate each other (`EVAL-002`).
- Profile photo exists in the API but is excluded by `OOS-003` (`EVAL-003`).
- The UI edit form omits content and format (`EVAL-004`).
- No browser or viewport evidence for `NFR-002` beyond Chromium (`EVAL-005`).
- No PostgreSQL local run; one E2E CI run failed with an unknown cause (`EVAL-006`).

**What the verdict does and does not establish.** It states that the MVP is a demonstrable, documented and deployed prototype. It does not establish production readiness, adoption, reliability under load, security assurance or business value.

## 2. Evaluation Scope and Evidence

**Baseline.** Approved requirements `FR-001..FR-017`, `NFR-001..NFR-003`, 28 acceptance criteria (`AC-*`), `MVP-001..010` (`HU01..HU10`), and `SUCCESS-001..009` from `PRODUCT_VISION.md` §11. Out-of-scope items (`FUT-001..003`, `OOS-001..005`) are excluded from completion counts.

**Sources inspected** (all under `ai-pipeline/artifacts/` unless noted):
`00_context/PROJECT_CONTEXT.md`; `01_discovery/PRODUCT_VISION.md`; `02_requirements/REQUIREMENTS.md`; `03_planning/PRIORITIZATION.md`; `04_ux/UX_SPEC.md`; `05_architecture/ARCHITECTURE.md`; `06_implementation/` (log and validations); `07_testing/` (`TEST_VALIDATION.md`, `BUG_FIX_REPORT.md`); `08_cicd/` (`CICD_VALIDATION.md`); `09_documentation/` (`DOCUMENTATION_REPORT.md`, `DOCUMENTATION_VALIDATION.md`, `PROMPT_LOG.md`); `README.md`; `docs/*.md`; `backend/scores/{views,tests}.py`; `backend/accounts/tests.py`; `.github/workflows/ci.yml`; `frontend/playwright.config.ts`; `frontend/e2e/notara-e2e.spec.ts`.

**Provenance classes used.** Local execution (P09: 88 backend tests, `check`, `tsc`, `vite build`); P07 reported execution (E2E 5/5); public GitHub Actions metadata (job conclusions, no logs); public HTTP checks; static review; user-reported results.

**P09 status.** Complete and validated: `DOCUMENTATION_VALIDATION.md` is `PASS_WITH_WARNINGS`. The real filenames are `DOCUMENTATION_REPORT.md`, `DOCUMENTATION_VALIDATION.md` and `PROMPT_LOG.md`. The P09 gate passed.

**Missing or conflicting inputs**
- `ai-pipeline/outputs/` does not exist; `ai-pipeline/artifacts/` is authoritative.
- Historical P08 records said `NOT_DEPLOYED`; they were reconciled to `DEPLOYED_AND_VERIFIED` (limited scope) after deployment evidence was supplied.
- No `LICENSE` file.
- The P09 validation was produced in the same working session as the P09 generation, so it is not fully independent (see §9).

**Limits of this evaluation.** No new test, build or deployment was run for P10; it relies on static reads and earlier executions. Acceptance criteria were assessed at the requirement level, not one by one.

## 3. Requirements and Feature Assessment

Status rule: `VERIFIED` requires suitable tests (backend tests or E2E) with passing results; behavior exposed only through code or documentation is not enough.

| ID | Requirement (short) | Implementation | Status | Evidence and limitation |
|---|---|---|---|---|
| FR-001 | Register | Implemented | VERIFIED | `RegistrationTests` (8); E2E 1 |
| FR-002 | Log in and out | Implemented | VERIFIED | `AuthenticationTests` (4); E2E 1 |
| FR-003 | Profile view and edit | Implemented, plus photo in API | PARTIALLY_VERIFIED | `ProfileManagementTests` (13); no UI test; photo conflicts with `OOS-003` |
| FR-004 | Change password | Implemented | VERIFIED | `ProfileManagementTests`; API-level evidence only |
| FR-005 | Create publication | Implemented | VERIFIED | `ScorePublicationTests` (11); E2E 2 |
| FR-006 | Accept `.abc` and plain text | Implemented | VERIFIED | `test_authenticated_abc_publication_passes_minimal_checks`; publication tests |
| FR-007 | Reject empty or over 1,000 characters | Implemented | VERIFIED | `test_content_over_1000_characters_is_rejected` |
| FR-008 | Basic `.abc` validation | Implemented | VERIFIED | `test_abc_requires_headers_and_a_musical_line` |
| FR-009 | Publish and view valid score | Implemented | VERIFIED | Tests; E2E 2 |
| FR-010 | Edit own publication | Implemented in API; UI edits title, instrument, description only | PARTIALLY_VERIFIED | `ScoreEditTests` (15); E2E 3; UI omits content and format (`P09-DISC-004`) |
| FR-011 | Delete own publication | Implemented | VERIFIED | `ScoreDeleteTests` (7); E2E 4; bug fixed and retested |
| FR-012 | Newest-first feed, 10 per page | Implemented | VERIFIED | `test_feed_filters_by_instrument_and_paginates_ten_results` |
| FR-013 | Filter by instrument | Implemented | VERIFIED | Same test; own-scores filter test |
| FR-014 | Score detail with comments | Implemented | VERIFIED | `test_detail_returns_comments_and_like_state`; E2E 2 |
| FR-015 | Like another user's score; remove like | Implemented, but own score also likable; `Reaction` and `Like` coexist | PARTIALLY_VERIFIED | `ScoreReactionTests` (10); one E2E click; deviation `P09-DISC-002/006` |
| FR-016 | Comment on another user's score | Implemented, but own score also commentable; comment deletion added | PARTIALLY_VERIFIED | `ScoreCommentTests` (13); no E2E for comments; `P09-DISC-006/010` |
| FR-017 | Authentication required for protected actions | Implemented | VERIFIED | Anonymous-access tests; E2E 1 and 5 |
| NFR-001 | Readable presentation | Implemented | PARTIALLY_VERIFIED | No usability or rendering test beyond E2E navigation |
| NFR-002 | Chrome/Edge/Firefox at 360, 768 and 1280 px | Responsive layout present | NOT_VERIFIED | Playwright config has only `chromium`; no viewport tests |
| NFR-003 | Security: auth and owner-only changes | Auth and ownership enforced | PARTIALLY_VERIFIED | `test_only_owner_can_update_or_delete_score`; CSRF weakened by `@csrf_exempt` |

Totals: 20 requirements; 13 `VERIFIED`; 6 `PARTIALLY_VERIFIED`; 1 `NOT_VERIFIED`; 0 `NOT_IMPLEMENTED`.

Excluded from counts: voice input, OMR, audio, images, roles, account recovery (`FUT-001..003`, `OOS-001..005`). The profile photo is outside the approved scope but present in the API.

## 4. Functional and Technical Quality

| Check | Environment | Result | Provenance |
|---|---|---|---|
| Backend tests (88: 25 accounts, 63 scores) | SQLite, Python 3.13.14 | 88 passed | Local execution in P09; P07 reported the same |
| `manage.py check`, `makemigrations --check` | SQLite | No issues, no changes | Local execution in P09 |
| `tsc --noEmit`, `vite build` | Node 22, `npx` | Exit 0; CSS warning on `@tailwind utilities` | Local execution in P09 |
| E2E (5 scenarios) | SQLite, Chromium | 5/5 | P07 report; not re-run in P09 or P10 |
| E2E history | SQLite | 4/5 before the fix of `BUG-P07-204-01`, 5/5 after | `BUG_FIX_REPORT.md`, `TEST_VALIDATION.md` |
| CI jobs (`backend`, `frontend`, `e2e`) | GitHub-hosted, PostgreSQL 16 | Run #7 and #16 succeeded; #14 passed and #15 failed in E2E on the same SHA (cause `UNKNOWN`) | Public Actions metadata, no logs |

**Defects.** `BUG-P07-204-01` is `FIXED_AND_VERIFIED`. No unresolved `BLOCKER` or `CRITICAL` defect is recorded in the inspected P07 records. P07 decision: `PASS_WITH_WARNINGS`.

**Measurement gaps.** Not performed: code coverage; PostgreSQL local run; performance or load tests; accessibility; security testing; cross-browser and viewport testing; frontend unit tests.

## 5. CI/CD, Deployment, and Operational Readiness

- **Status:** deployed and operation partially verified. The application answers at `https://notara-production.up.railway.app`. On 2026-10-14, `/api/health/`, `/api/v1/health/`, `/`, `/login` and `/admin/login/` returned 200; `/api/me/` and `/api/v1/scores/` returned 401 without a session. Runs #7 and #16 on `pruebas-despliegue` completed all four jobs, including `deploy-railway`.
- **Evidence types.** Remote-verified metadata (job conclusions), independent public HTTP checks, and a user-reported manual verification of registration, login and scores in production (`USER_REPORTED`).
- **Automation.** `.github/workflows/ci.yml` runs backend tests, frontend typecheck and build, and E2E, then deploys only when `RAILWAY_DEPLOY_ENABLED` is true and the branch matches `RAILWAY_PRODUCTION_BRANCH`.
- **Not verified:** the exact commit deployed (differs from the inspected tree); persistence of the photo volume; backups; rollback; protection of the `production` environment; HTTP-to-HTTPS redirection; log contents of the CI runs.
- **Observation:** the Django admin login is publicly reachable (`P08-VAL-006`).
- **Docs pipeline.** A separate workflow builds the MkDocs site and publishes it to GitHub Pages (HTTP 200 observed).

## 6. Documentation and Traceability

- **Deliverables:** `README.md`, `docs/{SETUP,ARCHITECTURE,API,DATA_MODEL,USER_GUIDE,TESTING,REQUIREMENTS_COVERAGE,KNOWN_LIMITATIONS}.md`, `docs/index.md`, `mkdocs.yml`, `.github/workflows/docs.yml`, `DOCUMENTATION_REPORT.md`.
- **Accuracy.** The P09 validation found no inconsistent or fabricated statements and no sensitive data. This evaluation corroborated the test counts, the E2E scenario names and the CSRF and feed behavior with the code.
- **Gaps:** the README does not follow the required 15-section order (`VAL-001`); the MkDocs and Pages files were added at the user's request but are not logged in `PROMPT_LOG.md` (`VAL-002`); development tool versions disagree across `.mise.toml`, CI, Dockerfile and Compose (`P09-DISC-005`).
- **Traceability.** `REQUIREMENTS_COVERAGE.md` maps MVP-001..010 to code and tests. Acceptance criteria are not traced one by one.
- **Automation.** Documentation publishing is automated; its content is generated by running the P09 prompt, so it can become outdated when the code changes (`P09-RISK-001`).

## 7. Success Criteria and Outcome Assessment

Targets are the approved qualitative indicators of `PRODUCT_VISION.md` §11. No numeric target was approved for adoption, performance, usability, learning or community activity.

| ID | Original target | Result and evidence | Status |
|---|---|---|---|
| SUCCESS-001 | A visitor can register; a user can log in and out | Tests and E2E 1 | MET |
| SUCCESS-002 | Manage profile fields and change password | Backend tests; no UI test; photo deviation | PARTIALLY_MET |
| SUCCESS-003 | Publish `.abc` or plain text up to 1,000 characters with metadata | Tests; E2E 2 | MET |
| SUCCESS-004 | Basic `.abc` validation; plain text free | Validation tests | MET |
| SUCCESS-005 | Readable content, line breaks preserved, format identified | Detail view exists and is exercised by E2E; no test of line breaks or format label | PARTIALLY_MET |
| SUCCESS-006 | Edit and delete only own publications | Ownership tests; E2E 3 and 4 | MET |
| SUCCESS-007 | View recent personal and community scores; filter by instrument | Feed and filter tests; E2E 2 | MET |
| SUCCESS-008 | View detail, comment and react on others' scores | Backend tests for both; E2E covers like only; self-interaction deviation | PARTIALLY_MET |
| SUCCESS-009 | Demonstrate MVP 1 scope within the two-week sprint | A deployed, demonstrable MVP exists; the sprint timing was not evidenced | UNMEASURED |

Totals: 9 criteria; 5 met; 3 partially met; 0 not met; 1 unmeasured.

**Outcomes by type**
- Technical (demonstrated): tests passing, application deployed, documentation published.
- Operational: deployment verified at a basic level; reliability, backups and rollback not verified.
- User and business: `DATA_UNAVAILABLE`. There are no users, adoption, engagement or impact data. Measuring them would require real usage over time and approved targets.

## 8. Risks and Prioritized Recommendations

| ID | Priority | Finding and evidence | Expected benefit | Next action | Related |
|---|---|---|---|---|---|
| EVAL-001 | HIGH | `@csrf_exempt` on several `scores` write views (`scores/views.py`) weakens the session-based security model | Reduces cross-site request risk | Team decides whether to remove the exemptions and adapt the frontend and tests | NFR-003, `P09-DISC-007` |
| EVAL-002 | MEDIUM | Authors can react to and comment on their own scores; `Reaction` and `Like` duplicate each other | Aligns behavior with the stories and simplifies data | Decide whether to block self-interaction and which model to keep | FR-015, FR-016, `P09-DISC-002/006` |
| EVAL-003 | MEDIUM | Profile photo exists in the API but `OOS-003` excludes images and the UI has no control | Removes a scope conflict | Decide to keep it in the MVP or remove it | FR-003, `P09-DISC-003` |
| EVAL-004 | MEDIUM | The UI edit form cannot change score content or format although the API can | Completes the edit story | Add the fields to the form or document the restriction as an accepted decision | FR-010, `P09-DISC-004` |
| EVAL-005 | MEDIUM | `NFR-002` has no evidence: only Chromium is configured and no 360/768/1280 px checks exist | Verifies a stated requirement | Run a manual or automated check across the named browsers and widths | NFR-002 |
| EVAL-006 | MEDIUM | No local PostgreSQL run; E2E CI run #15 failed with unknown cause while #14 passed | Confirms parity with production and rules out flakiness | Run tests on PostgreSQL and inspect the failed run logs | `P08-VAL-005`, P07 |
| EVAL-007 | MEDIUM | Deployed commit unknown; volume persistence, backups, rollback, environment protection and HTTPS redirect unverified | Operational confidence | Record the deployed SHA and verify each prerequisite | P08, `P09-DISC-009` |
| EVAL-008 | LOW | `/admin/login/` is publicly reachable | Smaller attack surface | Decide whether to restrict it | `P08-VAL-006` |
| EVAL-009 | LOW | README order deviates from the template; MkDocs additions not logged | Documentation conformance | Reorder README and log the MkDocs addition; re-run P09 validation | `VAL-001`, `VAL-002` |
| EVAL-010 | LOW | `/api` and `/api/v1` coexist; Node and pnpm versions differ across files; two lockfiles tracked | Less confusion for contributors | Choose one route prefix and one toolchain version | `P09-DISC-001/005` |
| EVAL-011 | INFO | No `LICENSE`; the CSS build warning on `@tailwind utilities` | Clarity for reuse | Decide on a license; review the CSS directive | `P09-GAP-003` |

Counts: 0 blocker, 1 high, 6 medium, 3 low, 1 info.

## 9. Next Evaluation Steps

1. Resolve the pending team decisions (`P09-QUESTION-001..005`) and record them.
2. Fix or consciously accept `EVAL-001..004`, then re-run the P07 tests and the P09 validation.
3. Collect the missing evidence: PostgreSQL test run, CI log review, deployed SHA, cross-browser and viewport checks, code coverage (if the team wants it).
4. Re-run this evaluation with an independent reviewer; the P09 validation was done in the same session as generation.
5. For user and business outcomes, define approved targets and gather usage data after real use begins.

**Conditions to reassess:** any change to application code, any new CI or deployment evidence, or a change in the approved scope.

**Incomplete in this evaluation:** acceptance-criterion-level tracing; any new execution of tests; PostgreSQL and remote-log evidence (unavailable in this environment).

## 10. Final Verdict

**`NEEDS_ITERATION`**

Justification: no unresolved blocker or critical defect and no failed essential gate, so the verdict is not `BLOCKED`. The core MVP is implemented, deployed and documented. But 6 of 20 requirements are only partially verified and 1 is not verified. One security concern (`EVAL-001`) and several decisions about deviations from the approved baseline remain open. Moving to a next stage without those would overstate the evidence. This verdict does not mean the MVP is unusable; it identifies the improvements to make first.
