# P08 - Continuous Integration and Deployment Preparation

**Version:** 2.0  
**Stage:** P08 - CI/CD  
**Type:** Generation Prompt  
**Project:** Notara  
**Release covered:** MVP 2 — Sprint 2 (incremental over MVP 1)  
**Input Artifacts:** Actual code/manifests/settings; P07 test evidence; approved architecture; Railway destination decision; system prompt  
**Output Artifacts:** CI and scoped production/deploy configuration; `ai-pipeline/outputs/08_cicd/CICD_IMPLEMENTATION.md`, `DEPLOYMENT_GUIDE.md`, `PROMPT_LOG.md`  
**Validator / Related Prompt:** `P08_validation.md`  
**Previous Stage:** P07 - Testing  
**Next Stage:** P08 - Validation / P09 - Documentation  
**Advance Condition:** CI evidence is valid and production/deployment readiness is separately established.

---

## Change Log

| Version | Change |
|---|---|
| 1.0 | MVP 1 prompt (October 2026). |
| 2.0 | 2026-11-11: incremental mode for MVP 2 (section 0); output paths moved to `ai-pipeline/outputs/`; MVP 2 scope, change requests CR-005-CR-007, AI/voice providers, evidence classes and append-only runs. |

---

## 0. Incremental Mode (MVP 2)

Apply this section on top of the rest of the prompt. Where it conflicts with an MVP 1 instruction below, this section prevails.

### 0.1 Common rules (all P07-P10 prompts)

1. **Scope baseline.** MVP 1 (US-001-US-010) is the delivered baseline (tag `v1.0.0`). MVP 2 covers US-011-US-019 and, **only with the approval status recorded in the latest P02/P03 outputs**, the change requests CR-005 (US-020, other and AI instruments), CR-006 (US-011 amendment, AI interpretation of dictation) and CR-007 (US-021, conversational tutor). Never decide or change an approval; report the status the artifacts record (approved, proposed, rejected).
2. **Latest inputs.** Read the latest versions under `ai-pipeline/outputs/` (P00 `PROJECT_CONTEXT.md`, P02 `REQUIREMENTS.md` and `product_backlog.json`, P03 `PRIORITIZATION.md`, P04 `UX_SPEC.md`, P05 `ARCHITECTURE.md`, P06 story records `US-0XX_*_IMPLEMENTATION.md` / `_VALIDATION.md`, `IMPLEMENTATION_LOG_MVP2.md`, `IMPLEMENTATION_VALIDATION_MVP2.md`, `MVP2_MANUAL_ACCEPTANCE_CHECKLIST.md`) and `00_context/DECISIONS_MVP2.md` plus `CR-00X_*.md`. If two versions conflict, report the conflict and its impact; do not pick one silently.
3. **Incremental, append-only.** Keep every earlier run and result. Add a new dated run section (`Run N — MVP 2, <date>`) and, where the output has a change log, a new version row. Mark statements that a new run supersedes; never delete or rewrite earlier evidence. Preserve all existing identifiers (`AC-*`, `FR-*`, `TC-*`, `EVAL-*`, `P08-VAL-*`, …) and continue numbering for new ones.
4. **Evidence classes.** Label every check: `AUTOMATED_EXECUTED`, `MANUAL_EXECUTED`, `SIMULATED` (for example synthetic speech injected as a microphone stream, or a mocked provider), `USER_REPORTED`, `NOT_RUN` or `BLOCKED`. A simulated check is never reported as real-device or real-user evidence; a blocked environment is never reported as a pass.
5. **AI and voice providers.** Notara MVP 2 uses: Whisper Base locally via `faster-whisper` (STT), ElevenLabs (primary TTS) with `edge-tts` fallback, Google Gemini (dictation interpretation and typed tutor answers), Gemini Live (spoken tutor, single-use ephemeral tokens), Magenta DDSP models with TensorFlow.js (AI instruments) and Tone.js (browser synthesis). Automated tests and CI must use fakes/mocks (DEC-230, NFR-010). Real-provider checks are optional, must be labelled, must not consume paid credits without the team's authorization, and must never print, store or commit keys, tokens or provider responses containing personal data.
6. **Environment disclosure.** State Python and Node versions, package manager (pnpm, from `frontend/`), database (SQLite or PostgreSQL), whether frontend dependencies were installed and whether the Whisper model was available. Differences between local, CI and Railway must be stated, not assumed away.
7. **Removed or excluded items** (sung voice, "Voz" as an instrument, synthetic a cappella; OMR; mixed voice+instrument MP3 per DEC-204) must not be tested, documented or evaluated as delivered features.
8. **Language.** Reports may be written in Spanish or English, consistently within a document; final responses to the team are in Spanish.

### 0.2 Stage-specific rules (P08 CI/CD, MVP 2)

- CI must keep running MVP 1 and MVP 2 tests with fake providers and must not need provider keys.
- Production configuration must cover the MVP 2 variables without committing values: `STT_*` (model directory, revision/manifest, limits), `VOICE_*` / `TTS_*`, `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` / `ELEVENLABS_MODEL_ID`, `GEMINI_API_KEY` / `GEMINI_MODEL` / `DICTATION_AI_ENABLED`, `TUTOR_*`. Keys go to Railway variables or CI secrets only.
- Check that the Whisper model is available in the image or volume, that `MEDIA_ROOT` points to the persistent volume (`/data`, PRE-005) and that migrations `scores.0006`, `voice.0002`, `voice.0003` run on deploy.
- HTTPS is required in production for microphone capture and the Gemini Live WebSocket.
- Do not trigger a deployment, create billable resources or change provider plans without explicit authorization.
- Output: append an MVP 2 section to `CICD_IMPLEMENTATION.md` and `DEPLOYMENT_GUIDE.md`.

---

## 1. Purpose

Implement reproducible CI and prepare a controlled automatic deployment for
Notara. Railway is the destination proposed for this project; confirm any later
user decision before adapting provider-specific infrastructure.

Support scope-limited instructions. If the user requests CI only, implement CI
and its records only; do not create production files, alter production settings
or implement P09. Missing hosting credentials must not block independent CI work.

## 2. Inputs and Source of Truth

Read `ai-pipeline/prompts/system/SYSTEM_PROMPT.md` completely before acting.
Inspect the current repository, not a previously generated implementation.

Resolve upstream requirements, backlog/sprint, UX, architecture and implementation
records from their actual locations. This project has historically used both
`ai-pipeline/artifacts/` (MVP 1) and `ai-pipeline/outputs/` (current); locate the real files, report
which ones were used, and do not duplicate or fabricate missing artifacts.
If several versions conflict, identify the conflict and its impact.

Source code defines implemented behavior; approved requirements define expected
behavior. Distinguish an unimplemented requirement from a working feature.
Missing non-essential upstream records do not prevent useful analysis of the
available code; record the resulting traceability limitation.

If the input is a ZIP without `.git`, branch, commit and index state are UNKNOWN.
Never infer them from the folder or ZIP filename. A source-file hash may identify
the inspected input, but must not be presented as a Git commit.

## 3. Global Boundaries

- Preserve existing design, screens, routes, API contracts and working features.
- Do not replace App.tsx with a minimal app, mock UI or another branch's version.
- Identify real merge markers in source, excluding dependencies and generated
  files. Do not treat Markdown separators as Git conflicts. Do not choose a
  side of an unresolved merge silently.
- Preserve existing valid tests and dependency lockfiles.
- Never omit tests, relax authorization/CSRF, disable security controls or weaken
  assertions merely to make execution pass.
- Never report editor diagnostics, parsing or a dry run as real test execution.
- Do not expose secrets, user data, database dumps or authenticated session
  tokens in reports, prompts or committed evidence.
- Do not commit, push, merge, create billable cloud resources or publish the
  application merely by executing this prompt. External publication is a
  separate step requiring a configured destination and explicit authorization.
- Routine local implementation and available validation within this stage are
  authorized. Do not stop after proposing files when implementation is required.

---

## 4. Role

Act as a **CI/CD and Production Configuration Engineer**. Automate real checks
and preserve the existing application architecture. The AI generates and reviews
the configuration; the runners and hosting service execute it.

## 5. Repository and Runtime Review

Inspect actual settings.py, dependency manifests/lockfiles, scripts, migrations,
API routes, file storage, frontend entrypoint/config and existing workflows.
Do not force versions from another branch: React/Vite/Node requirements must be
established from this copy. Use Python 3.12 and PostgreSQL 16 when compatible;
choose a Node version supported by the actual frontend tooling.

Check P07 results. A failed suite must remain visible and block deploy. A green
workflow with zero tests is not acceptable evidence.

## 6. CI Implementation

- Configure pull_request, push and workflow_dispatch with contents: read.
- If push filters are requested, use confirmed exact branch names, including
  accents. Ask for an unknown exact name; never deduce it from a ZIP folder.
  Without a requested filter, push on all branches is acceptable.
- Use ubuntu-latest, supported setup actions and bounded job timeouts.
- Backend: PostgreSQL service with healthcheck, actual compatible DB variables,
  requirements installation, Django check, migration-drift check, migrate and
  complete test discovery from a correct directory or explicit labels.
- Frontend: npm ci from frontend using its valid lockfile; cache by that file;
  typecheck where supported, build and implemented frontend/browser tests.
- Browser integration: dedicated PostgreSQL database, real frontend/backend,
  Playwright browser dependencies and failure report/trace artifacts.
- Keep fixture credentials distinct from production secrets. PR checks must not
  require deploy tokens or publish external changes.
- Do not replace pnpm install --frozen-lockfile with npm install to conceal a missing/corrupt lockfile.
  Identify the defect and handle a justified repair explicitly.

## 7. Production Preparation (Only When In Scope)

1. Preserve development Compose; create separate production configuration.
2. Use Gunicorn for Django and compiled frontend served by Nginx. Include
   required build context files, including Figma site configuration if imported.
3. Preserve same-origin session and CSRF behavior: one public frontend origin,
   API reverse proxy and SPA route fallback. Do not switch to unrelated auth.
4. Require production secret/hosts/origins, DEBUG=false, secure cookies and
   intentional trusted-proxy handling. Never use wildcard hosts or expose the DB
   merely to simplify deployment. TLS forwarding must come from a trusted edge.
5. Configure static assets and persistent authenticated media. Do not expose
   private profile photos through public /media/ paths.
6. Define migrations, readiness, volume permissions, application user and startup
   order. Document backups, restore verification and rollback limits.
7. For Railway, configure actual service Dockerfile/config paths, backend-private
   networking, public frontend port/domain and a persistent media volume.
   Do not assume Compose is automatically the Railway deployment.
8. Keep provider IDs, tokens, domain and storage decisions unset when unknown.
   Document exact user setup steps; no fabricated cloud resources or URLs.

## 8. Automatic Deployment Gate (Only When In Scope)

Use a deploy job that depends on every mandatory check for the same source
commit. Limit deployment to the approved production branch and environment.
Keep it disabled until destination, token, variables, domain and storage exist.

Publish the tested checkout rather than independently fetching a moving branch.
Avoid duplicate native/provider deployment paths that can bypass CI. Serialize
production changes; never cancel a running release merely for a newer push.
Use scoped secrets and a pinned CLI/action when practical. Wait for deployment
completion; upload/queue acknowledgement is not a successful release. Verify
runtime API, public routes and application health after deployment.

## 9. Validation and Evidence

Run available checks at their actual strength: parse/config validation, tests,
build, image builds, container startup, readiness and smoke tests. Distinguish
all of these from real remote CI and deployment.

If Docker or PostgreSQL is unavailable, record NOT_RUN and configure real CI
checks. A local SQLite experiment may be supplementary, not PostgreSQL proof.
Record deploy security warnings and pending external resources accurately.

## 10. Required Outputs

CICD_IMPLEMENTATION.md must include metadata/input identity, scoped changes,
workflow triggers/jobs, exact commands/environments, secret boundaries,
production architecture if in scope, files changed, executed checks, pending
checks, assumptions, blockers and status.

DEPLOYMENT_GUIDE.md (when production is in scope) must document prerequisites,
provider services/variables, volume/static handling, migrations, activation of
automatic deploy, healthchecks, operational verification, backup/restore,
rollback risks and explicit NOT_DEPLOYED status until deployment is observed.

Update PROMPT_LOG.md. Preserve existing valid records and past failures.

## 11. Status and Self-Validation

Separate these dimensions:

- CI configuration: READY / READY_WITH_WARNINGS / BLOCKED.
- CI execution: PASS / FAIL / NOT_RUN.
- Production preparation: READY / READY_WITH_WARNINGS / BLOCKED / OUT_OF_SCOPE.
- Runtime deployment: DEPLOYED_AND_VERIFIED / FAILED / NOT_DEPLOYED.

```text
[ ] Versions and commands come from this repository.
[ ] Nonzero complete test discovery and PostgreSQL checks configured.
[ ] Design, auth and functionality preserved.
[ ] Deploy cannot bypass required checks or run from untrusted PRs.
[ ] Tested source identity and release completion are addressed.
[ ] Secrets and media are protected.
[ ] Execution evidence is distinct from static review.
[ ] Missing cloud configuration and unexecuted operations remain explicit.
[ ] No P09 work or external publication performed by this prompt alone.
```

## 12. Final Response and Stage Transition

Respond in Spanish with scoped status, changed files, exact executed/pending
checks and remaining deployment setup. Show the complete ci.yml if requested.
Proceed to P08 validation; do not declare deployment successful from file creation.
