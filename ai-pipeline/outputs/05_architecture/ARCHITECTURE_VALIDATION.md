# P05 Architecture Validation Report

## 1. Validation Metadata

- **Validator:** P05 - Software Architecture Validation Prompt v2.0 (Senior Architecture Reviewer)
- **Project:** Notara
- **Release:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT)
- **Architecture Version:** 4.0 (CR-003 and HU11 authorization revalidation addenda below; original run preserved)
- **Validation Date:** 2026-11-08
- **Upstream statuses:** P02 v5.0, P03 v4.0, P04 v4.0; all `PASS_WITH_WARNINGS`
- **Overall result:** `PASS_WITH_WARNINGS` (see current addendum)
- **P06 readiness:** HU11 implementation authorized locally; acceptance and Railway deployment remain gated by empirical evidence

> The MVP 1 report (architecture 1.0, result `PASS_WITH_WARNINGS`, produced while the P05 prompt files were empty) is preserved in Git history. This run uses the v2.0 validation prompt.

## 2. Executive Summary

The original report validated the OpenAI STT design. See section 12 for the current CR-003 validation: the approved STT engine is now local, and Railway readiness remains unvalidated.

**Strengths:**
- **Runtime risk addressed:** synchronous provider calls that would block the current two sync workers are handled with threaded workers and timeouts.
- **Single ABC reader:** one reader serves solfege, tutor and piano, and piano playback needs no extra request.
- **Privacy enforced in design:** dictation audio is not persisted, and voice-comment audio is deleted together with its comment, including on cascade.
- **Server-side controls:** quotas and the cache are enforced on the server.
- **Clean UX mapping:** every UX message maps to a typed error code.

The as-built baseline was verified against the repository. Every FR-018-FR-044 and NFR-004-NFR-010 has a design response.

**No CRITICAL or HIGH findings.**

**Two MEDIUM findings:**
- the ADRs and two conflicts with decisions need team approval;
- storage persistence is still unverified.

**Four LOW findings.**

## 3. Input Readiness

| Input | Present | Status | Notes |
|---|---|---|---|
| REQUIREMENTS v4.0 / validation | Yes | PASS_WITH_WARNINGS | CR-003 notice/retention and local STT reflected |
| PRIORITIZATION v3.0 / validation | Yes | PASS_WITH_WARNINGS | PRE-011 added; PRE-004 is TTS-only |
| UX_SPEC v3.0 / validation | Yes | PASS_WITH_WARNINGS | M-11 updated for backend/hosting disclosure |
| DECISIONS_MVP2.md and CR-003 | Yes | CR-003 approved per requester authorization | DEC-201 amended; other decision ratifications remain open |
| ARCHITECTURE v1.0 | Yes (Git) | — | ADR-001-ADR-005 preserved |
| Repository | Yes | — | Spot-checked (section 4) |

## 4. As-Built Baseline Verification

| Claim | Evidence | Result |
|---|---|---|
| Function-based views with `JsonResponse` and `{"errors": ...}` | `backend/scores/views.py` (e.g. lines 182, 289) | Verified |
| `Comment.body` max 500 | `backend/scores/models.py:67` | Verified |
| `Reaction` and `Like` both exist; `/api/v1/` uses `Reaction` | `models.py`; `urls.py` (`score-reactions` v1, `score-like` legacy) | Verified |
| Comment deletion by author in `/api/v1/` | `urls.py` `score-comment-detail`; `views.py` lines 299-311 | Verified |
| Profile photo via authenticated `FileResponse`, `default_storage` | `accounts/views.py` `profile_photo_view`; `settings.py` `STORAGES` | Verified |
| Gunicorn 2 sync workers, no timeout set | `deploy/entrypoint.sh` (no `gthread`, no `--timeout`) | Verified |
| Nginx `client_max_body_size 6m`, no `proxy_read_timeout` | `docker/nginx.conf.template` | Verified |
| Frontend has only React as runtime dependency | `frontend/package.json` | Verified |
| `MEDIA_ROOT=/data/media`, persistence unverified | `Dockerfile`; P08 deployment guide | Verified |

## 5. Requirements and UX Coverage

**Requirements: PASS.**
- **Coverage:** an automated check found every FR-018-FR-044 and NFR-004-NFR-010 referenced. Section 17 maps each one to components and endpoints, and US-010-US-019 are all mapped.
- **One gap fixed during review:** M-06 (dictation over 1,000 characters) is now handled explicitly in runtime flow 10.1.

**UX handoff needs:**

| Need | Response | Result |
|---|---|---|
| 1. Typed outcomes for dictation and voice comments | Error codes in section 9 (M-01, M-05b, M-07, M-09) | PASS |
| 2. Synthesis outcomes: limit, unrenderable, unavailable | `DAILY_LIMIT_REACHED`, `ABC_UNSUPPORTED`, `NOT_ABC`, `AUDIO_UNAVAILABLE` | PASS |
| 3. MP3 retrievable | MP3 body returned; download from the client object URL | PASS |
| 4. Voice comment as one deletable entity | ADR-011; `on_commit` + `post_delete` | PASS |
| 5. File loading and piano without server calls | Client-side file reading; events in the detail response (CONFLICT-ARCH-204 resolved) | PASS |
| 6. Deletion compatible with confirmation | Unchanged delete endpoint; the confirmation is a UI concern | PASS |
| UX-VAL-203 timeouts | ADR-014; timeouts lead to M-07/M-15 | PASS (values PROPOSAL) |

## 6. Technology and Architecture Decision Review

**PASS_WITH_WARNINGS.**
- **ADR quality:** ADR-006-ADR-015 each state benefit, trade-off and revisit trigger, and all are labeled PROPOSAL.
- **Provider note:** that original run reflected the then-current OpenAI DEC-201; it is superseded by the CR-003 addendum below. TTS decisions DEC-202/203 remain unchanged.
- **Rejected alternatives:** a job queue is rejected with a revisit trigger.
- **API versioning:** ADR-013 freezes the legacy `/api/` routes, which resolves PRE-007 for MVP 2 without a risky cleanup.
- **Open conflicts:** CONFLICT-ARCH-201 (DEC-202 in CI) and CONFLICT-ARCH-202 (500-character limit) are reported, not resolved silently.

## 7. Security, Data Integrity, Privacy and Runtime Review

**PASS.**
- **Secrets:** the TTS key is server-only and absent from CI; STT needs no provider key. Model weights require immutable pinning and hash verification.
- **Uploads:** whitelist checked against both MIME and file signature, generated filenames, 2 MB server limit.
- **Media:** served only through authenticated views with `nosniff`.
- **Privacy:**
  - no dictation persistence;
  - voice-comment audio deleted on commit and on cascade, which also mitigates CONFLICT-203 (account deletion) for administrative deletions;
  - cached audio contains no user voice.
- **Logging:** no transcripts, audio or keys.
- **Quota:** an atomic counter, incremented only on cache misses.
- **Runtime budget:** primary 20 s plus fallback 20 s fits within the 75 s worker timeout; Nginx at 90 s sits above it.
- **Failure handling:** expected provider failures return typed 4xx/503 JSON, never an unhandled error.

## 8. Scope and Planning Boundary Review

**PASS.**
- **Scope:** no new product capability. The tutor text header serves an approved UX proposal (UX-PROP-005), and quotas and limits come from DEC-213.
- **Boundaries:** no people or dates are introduced. Candidate quantitative thresholds are explicitly proposals, not accepted targets; NFR-009 stays open.
- **Order:** the handoff order matches the P03 groups.

## 9. Findings

| ID | Severity | Category | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|
| ARCH-VAL-201 | MEDIUM | Decisions | ADR-006-ADR-015 are proposals, and two conflicts with upstream need a decision: CONFLICT-ARCH-201 (fake engine in CI instead of `edge-tts`, against DEC-202/AC-063) and CONFLICT-ARCH-202 (voice transcripts vs. the 500-character limit, new Q-026). | ARCHITECTURE sections 14.2, 15 | Review with TEAM-002; record the outcome in `DECISIONS_MVP2.md` and amend DEC-202 / AC-063 if approved. |
| ARCH-VAL-202 | MEDIUM | Operations | Persistence of `/data/media` on Railway is unverified. Voice-comment audio loss would be data loss. | Section 13; PRE-005; P08 deployment guide | Verify the volume before US-012/US-016 reach production; otherwise switch to S3-compatible storage (ADR-008 trigger). |
| ARCH-VAL-203 | LOW | Interface | The tutor text travels in a URL-encoded response header (`X-Notara-Tutor-Text`). It works for short text but is unusual, and needs CORS-safe exposure if origins ever split. | Section 9 | Acceptable for same-origin MVP 2; alternatively return JSON with an audio URL. Decide in P06. |
| ARCH-VAL-204 | LOW | Resource abuse | Local transcription has no per-user quota; repeated requests can consume CPU. | Section 16; Q-027 | Decide a rate/quota policy; choose enforcement after operational measurements. |
| ARCH-VAL-205 | LOW | Performance | Timeout and worker values remain proposals without measured local/Railway latency. | ADR-014; NFR-009 | Measure cold/warm runs with the integrated service and feed results into Q-012; Railway needs separate authorization. |
| ARCH-VAL-206 | LOW | Traceability | Q-026/Q-027 were originally local to P05. | Section 16 | Resolved in the CR-003 revalidation: questions are now carried in P02 and DECISIONS_MVP2.md. |

## 10. P06 Readiness

- **Ready:** `YES_WITH_REVIEW_GATES`
- **Can start now:**
  - Group 1a/1b: US-015 (reader and piano), US-019 (file loader), DEFECT-001;
  - Group 2 with fake and Edge engines: US-017, US-016, US-013;
  - proposed runtime configuration (single model process, bounded STT concurrency, Nginx timeout, environment variables, fake engines in CI), subject to local measurement.
- **Review gates:**
  - **ADR approval:** ARCH-VAL-201.
  - **US-011:** PRE-002 (vocabulary and headers) and PRE-011 (quality/resource gates); PRE-004 is no longer an STT dependency.
  - **US-012:** PRE-005 and Q-026.
  - **US-014:** PRE-003 (difficulty rule).
  - **ElevenLabs adapter:** PRE-004.

## 11. Final Decision

**`PASS_WITH_WARNINGS`.** The architecture addendum may proceed to P06 under the review gates above. This is the original validation; the current CR-003 status is recorded below.

## 12. CR-003 Revalidation Addendum

- **Approval record:** CR-003 and the DEC-201 amendment are approved as reported by the requester; no approval date or individual approver names were supplied.
- **Inputs:** architecture v3.0, P02 v4.0, P03 v3.0, P04 v3.0, amended `DECISIONS_MVP2.md`, and CR-003.
- **Contract/scope:** `SttAdapter`, `POST /api/v1/audio/stt/`, multipart fields, success shape `{transcript, meter, abc_line, abc_document}`, typed errors, session auth/CSRF, upload limits and deterministic ABC conversion remain unchanged. No endpoint, model, UI, Dockerfile or runtime file was implemented.
- **Design coherence:** OpenAI STT key/client removed from the proposed architecture; `faster-whisper tiny` multilingual, CPU/int8, Spanish is behind `SttAdapter`. Proposed variables, pinned weights, build-time preload, readiness failure, one-process/one-inference initial resource profile and typed saturation errors are documented. Runtime worker and inference-timeout behavior require tests; a Gunicorn timeout cannot by itself prove cancellation of an in-process inference.
- **Candidate gates (not approved):** ≥100 labeled clips / ≥5 speakers and ≥90% exact parsed ABC; warm p95 ≤15 s for 30 s input and typed failure by 25 s; total Railway container peak ≤800 MiB of 1 GiB; saturation rejection; pinned/hash-verified weights and no runtime download. Q-012/Q-028 remain open, so these values are engineering proposals only.
- **Evidence limits:** requester-reported Windows/Python 3.11.9 spike (3.81 s clip, 1.06 s transcription, 9.66 s cold load including import/download, sampled process RSS ≈249 MB, transcript «¡Dorre mi, faso la sí!»). Not independently reproduced; not a quality pass. No Python 3.12/Django/Gunicorn concurrency, total-container memory, or Railway test has been run.
- **Current result:** `PASS_WITH_WARNINGS` for the architecture documentation. P06 may prepare an isolated local HU11 increment after PRE-002/PRE-011 decisions; HU11 acceptance and Railway deployment are not ready/approved. PRE-001/002/011, Q-012/Q-026/Q-027/Q-028 and other P05 ADR conflicts remain open as applicable.

## 13. HU11 Authorization Revalidation Addendum

- **Authorization:** The requester reports human approval of HU11 conditions. No names, approval date or meeting record were supplied and none is inferred.
- **Decision scope:** The HU11 implementation scope ratifies ADR-006, ADR-007, ADR-009, ADR-013, ADR-014 and ADR-015 as specified in ARCHITECTURE v4.0; it ratifies DEC-205, DEC-208, the recording constraints in DEC-213, DEC-215, DEC-218 and DEC-219. It does not globally close Q-020 or unrelated architecture conflicts.
- **Quota design:** `STTInferenceQuota(user, UTC day, admitted_inferences)` has a unique user/day key and a persistent atomic conditional increment shared across HU11/HU12. Reserve after auth/CSRF, file validation and process-slot admission; reject saturation or quota excess without consuming a daily inference. Attempts count once admitted even on subsequent decode/inference/parser failure. `STT_DAILY_LIMIT` defaults to 30; over-limit code is `STT_DAILY_LIMIT_REACHED` (429).
- **Accepted targets, not results:** ≥100 authorized recordings from ≥5 speakers and ≥90% exact parsed ABC; loaded-model p95 ≤15 s for 30 s recordings with cold start reported separately; total service peak ≤800 MiB of a 1 GiB container; one inference per process. None has been measured or passed. The 25 s completion/error ceiling remains pending explicit approval, as do TTS latency targets.
- **Security/privacy:** session auth and CSRF, server-side size/MIME/signature checks before inference, no persisted dictation audio/temp files and no audio/transcript logging remain design requirements. Existing route and success schema are preserved.
- **Remaining clarification:** P02 Q-029 tracks populated-field present-empty/malformed ABC headers and non-ABC content; clarify before implementing that append edge path. Q-026 remains a HU12 concern; CONFLICT-ARCH-201 remains unrelated to HU11.
- **Readiness:** HU11 is ready to begin local implementation. PRE-002 is satisfied for HU11; PRE-011 is approved for planning while empirical acceptance verification remains pending. PRE-001 remains open outside HU11 scope. No Railway deployment is authorized by this approval.
- **Result:** `PASS_WITH_WARNINGS`; documentation consistency only. No code, performance, quality or deployment behavior was tested.

## 14. HU11 Backend Increment Review

- **Implementation contract:** The backend increment keeps the documented success payload and endpoint. `AUTHENTICATION_REQUIRED` (401) and `CSRF_FAILED` (403) are implementation-proposed typed security outcomes to satisfy AC-075; the team should confirm these code names before treating the error vocabulary as final.
- **Scope boundary:** The endpoint accepts audio and optional title and composes a new ABC document for an empty content field. It does not merge an existing field; Q-029 remains open for that append path.
- **Runtime boundary:** Local weights are loaded only when `STT_MODEL_REQUIRED=true`, after hash/revision verification. No approved immutable model commit, staged weights, Python 3.12 run, PostgreSQL concurrency result, complete-service resource measurement, or Railway evidence is supplied by this increment.
- **Review result:** `PASS_WITH_WARNINGS` for contract and implementation traceability only; the acceptance targets remain unmeasured and Railway is not ready/authorized.

## 15. CR-004 Revalidation Addendum

- **Date:** 2026-11-09
- **Architecture Version:** 4.1
- **Requirements Version:** 5.1
- **Planning Version:** 4.1
- **UX Version:** 4.1
- **Change Request:** CR-004 (PROPOSED)
- **Affected Stories:** US-011 (HU11), US-012 (HU12)
- **Result:** PASS_WITH_WARNINGS ? documentation alignment only
- **Production Authorization:** NOT GRANTED

### Architecture alignment

- Whisper Base is the proposed replacement for Whisper Tiny.
- Model repository and revision are pinned.
- Local SHA-256 manifest verification succeeded.
- Local CPU/INT8 model loading succeeded.
- Docker configuration provisions the model during image build.
- Existing STT endpoint and ABC conversion contracts are retained.
- CR-003 remains the historical approved decision.
- MVP 1 baseline remains unchanged.

### Local test evidence

- Django voice tests: 23 discovered, 1 skipped, 0 failures.
- One local audio sample compared Tiny and Base.
- Empirical acceptance has not been established.

### Outstanding conditions

- Formal approval of CR-004.
- Reconciliation of AC-071 referencing Whisper Tiny.
- At least 100 authorized recordings from 5 speakers.
- At least 90% exact expected ABC output.
- p95 transcription latency at most 15 seconds.
- Total service memory at most 800 MiB.
- Railway resource and runtime validation.
- Integration, security and quota regression.
- Review of temporary debug interfaces and bypasses.

### Conclusion

P05 documentation is aligned with proposed CR-004.
This does not establish production readiness or authorize deployment.


## 16. CR-004 Architecture v4.3 Revalidation

- **Date:** 2026-11-09
- **Architecture Version:** 4.3
- **Requirements Version:** 5.2
- **Planning Version:** 4.2
- **UX Version:** 4.2
- **Change Request:** CR-004 (APPROVED BY REQUESTER FOR LOCAL IMPLEMENTATION)
- **Result:** `PASS_WITH_WARNINGS` - documentation consistency only
- **Production Authorization:** NOT GRANTED

### Architecture alignment

- Whisper Base is the active STT model selected for HU11/HU12.
- DEC-201 and ADR-006 reflect the CR-004 model selection.
- CR-003 and prior Tiny measurements remain historical evidence.
- The pinned revision and SHA-256 manifest are retained.
- The STT adapter, endpoint contracts, deterministic ABC parser and MVP 1 baseline remain unchanged.
- AC-071 references Whisper Base in P02 v5.2.
- Other team members' approval has not been established.

### Pending acceptance

- At least 100 authorized recordings from at least five speakers.
- At least 90% exact expected ABC output.
- Loaded-model p95 at most 15 seconds for 30-second recordings.
- Total service memory peak at most 800 MiB in a 1 GiB container.
- Concurrency, quota, security and integration regression.
- Python 3.12/Docker image compatibility and Railway runtime validation.
- Separate authorization before production deployment.

### Conclusion

The architecture documents the requester-approved CR-004
implementation. This review does not certify empirical
acceptance, Railway readiness or production deployment.
