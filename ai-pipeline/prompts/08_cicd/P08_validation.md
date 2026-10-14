# P08 - CI/CD Validation

**Version:** 1.0  
**Stage:** P08 - CI/CD  
**Type:** Validation Prompt  
**Project:** Notara  
**Input Artifacts:** Actual CI/production/deploy files; P07 evidence; P08 implementation/guide; real execution logs when available; system prompt  
**Output Artifacts:** `ai-pipeline/artifacts/08_cicd/CICD_VALIDATION.md`, updated `PROMPT_LOG.md`  
**Validator / Related Prompt:** Related generation prompt: `P08_cicd.md`  
**Previous Stage:** P08 - CI/CD Implementation  
**Next Stage:** P09 - Documentation / Controlled Release  
**Advance Condition:** Actual execution and deployment status are established without unsupported success claims.

---

## 1. Purpose

Independently audit the implemented CI/CD scope, actual execution evidence and
production behavior. This is a validation prompt, not an implementation or repair
prompt. Do not change application source, tests, dependencies or workflows.
Create/update validation records only. Report proposed fixes separately.

## 2. Inputs and Source of Truth

Read `ai-pipeline/prompts/system/SYSTEM_PROMPT.md` completely before acting.
Inspect the current repository, not a previously generated implementation.

Resolve upstream requirements, backlog/sprint, UX, architecture and implementation
records from their actual locations. This project has historically used both
`ai-pipeline/artifacts/` and `ai-pipeline/outputs/`; locate the real files, report
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

## 4. Role and Evidence Rules

Act as a **CI/CD Auditor and Production Readiness Reviewer**.

Distinguish evidence provenance:

- LOCAL_EXECUTION: command/output directly inspected for this source.
- REMOTE_VERIFIED: GitHub/provider execution logs directly inspected.
- USER_REPORTED: result supplied by the user, not independently inspected.
- STATIC_REVIEW: syntax/content review, not execution.
- NOT_RUN: operation not executed or evidence unavailable.

When remote access is unavailable, retain user-provided run/commit/job details
as USER_REPORTED without claiming to have inspected logs. A ZIP lacking Git
metadata cannot establish that local code equals a particular remote commit.

## 5. Audit Procedure

1. Establish the requested scope: CI only, production preparation or actual
   release. Mark unrelated dimensions OUT_OF_SCOPE rather than implementing them.
2. Resolve inputs and compare records to current files. Identify missing or
   contradictory versions and preserve earlier failures.
3. Parse workflow/config files with suitable tooling when available. Syntax and
   editor diagnostics are distinct from successful jobs/runtime behavior.
4. Inspect triggers, exact branch filters, permissions, concurrency, dependencies,
   commands/working directories, lockfile caching and supported runtime versions.
5. Verify backend DB type, service readiness, migrations and nonzero test
   discovery. Record found, executed, skipped and failed counts when available.
   SQLite success does not establish PostgreSQL behavior.
6. Verify frontend installation, typecheck/build and genuine browser tests.
   A build is not evidence of UI behavior, API integration or all-browser coverage.
7. Inspect complete traces for failed tests and classify findings. A passing
   subset cannot erase a failing required case. Never suggest skipping a failing
   case or changing the DB simply to produce green CI.
8. Check deploy gating: all mandatory checks for the deployed commit, trusted
   branch/environment, disabled setup state, scoped credentials, no PR publishing,
   no moving-branch mismatch and serialized production changes.
9. If production is in scope, inspect Gunicorn/Nginx, build contexts, TLS/proxy
   trust, secure cookies/CSRF, static files, private database, authenticated media,
   persistent volumes, permissions, migrations and healthchecks.
10. Run non-destructive available checks in an isolated environment. Validate
    image builds/runtime if Docker exists. A rendered Nginx template tested with
    substituted hosts/ports must record those changes and binary version.
11. For a real release, verify provider completion, deployment IDs/source identity,
    public health/routes, sessions and persistence. Do not infer successful
    deployment from upload acknowledgement, a generic healthy old service or a
    workflow merely named deploy.
12. Review backup/restore and rollback evidence, including schema compatibility
    and partial failure between separate frontend/backend deployments.
13. Produce actionable findings with file/symbol references, severity, evidence,
    impact and minimum proposed correction. Do not apply fixes during the audit.

## 6. Required Report

Generate CICD_VALIDATION.md using this structure:

1. Document metadata and input/source identity.
2. Requested audit scope and out-of-scope dimensions.
3. Inputs inspected and evidence provenance.
4. Workflow/static review.
5. Test/build execution evidence.
6. Production/container/security review, when in scope.
7. Actual deployment and operational evidence, when available.
8. Traceability and findings.
9. Assumptions, blockers and pending checks.
10. Separate readiness/execution/runtime statuses.
11. Minimum corrections proposed and next action.

Include:

| Check | Exact command/job | Source/run identity | Environment | Result | Evidence provenance | Limitation |
|---|---|---|---|---|---|---|

| Finding ID | Severity | File/symbol | Evidence | Impact | Minimum proposed correction |
|---|---|---|---|---|---|

Use PASS, FAIL, NOT_RUN, BLOCKED or OUT_OF_SCOPE for individual checks. Show
backend/frontend/browser/container job results independently. Classify supplied
screenshots/summaries as user-reported when complete logs are not inspected.

Update PROMPT_LOG.md with audit inputs and checks. No secret values in reports.

## 7. Readiness Rules

- READY: all mandatory checks within the requested scope have adequate evidence.
- READY_WITH_WARNINGS: non-blocking limitations are visible and justified.
- BLOCKED: mandatory checks fail, are missing or cannot be verified.

Runtime status remains separate:

- NOT_DEPLOYED: no actual external deployment observed.
- DEPLOYED_PENDING_VERIFICATION: provider reports release but runtime checks lack.
- DEPLOYED_AND_VERIFIED: release and scoped runtime behavior independently verified.
- FAILED: deployment or required runtime checks fail.

Validating CI alone must not imply production readiness. Unavailable hosting
must not prevent an honest CI-only audit. Do not automatically advance stages.

## 8. Self-Validation and Final Response

```text
[ ] Requested scope and exact source identity are explicit.
[ ] Local, remote, reported and static evidence distinguished.
[ ] Counts, database and job results checked rather than assumed.
[ ] No tests omitted or security weakened.
[ ] Production and actual deployment statuses separate.
[ ] Findings include evidence and concrete proposed corrections.
[ ] No application/workflow edits or publication performed.
```

Respond in Spanish with the main conclusion, checks that really passed,
failures/pending checks, report paths and the minimum next action. Never describe
unexecuted tests, builds, deployments, backups or rollbacks as successful.
