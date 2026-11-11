# P10 - Notara MVP Evaluation

- **Version:** 2.0
- **Stage:** P10 - Evaluation
- **Type:** Evaluation Prompt
- **Project:** Notara
- **Release covered:** MVP 2 — Sprint 2 (incremental over MVP 1)  
- **Input Artifacts:** Approved P00-P05 records; P06 implementation evidence; P07 test evidence; P08 CI/CD and deployment evidence; completed P09 documentation outputs; current repository
- **Output Artifacts:** `ai-pipeline/outputs/10_evaluation/MVP_EVALUATION.md`, `eval_metrics.json`
- **Validator / Related Prompt:** `P10_validation.md`
- **Previous Stage:** P09 - Documentation
- **Advance Condition:** P09 documentation work and its applicable validation are complete; evaluate the actual evidence and disclose any remaining gaps.

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

### 0.2 Stage-specific rules (P10 evaluation, MVP 2)

- Evaluate MVP 2 against its own success indicators (P01 `IND-201`-`IND-212`, P00 `SUCCESS-008`-`SUCCESS-019`) and compare with the MVP 1 verdict; state what improved, what regressed and what remains unmeasured.
- Add an **AI components** assessment: for each provider (Whisper, ElevenLabs/edge-tts, Gemini, Gemini Live, Magenta DDSP) state the stories it serves, evidence class, measured quality/latency where available and its risks (quotas, model retirement, third-party hosting).
- Count requirements by approval status separately (approved vs proposed) so proposed CR items do not inflate or deflate the approved-scope result.
- Record ratification status of DEC-201-DEC-244 and of CR-005-CR-007 as an evaluation input, not as an assumption.
- `eval_metrics.json`: keep the existing schema and add an `mvp2` object (`approved_requirements`, `proposed_requirements`, `ai_components`, `manual_acceptance_pending`).
- Output: append an MVP 2 evaluation to `MVP_EVALUATION.md` and update `eval_metrics.json` with a new `evaluation_version`.

---

## 1. Purpose

Evaluate the delivered Notara MVP against its approved scope and the evidence
actually available in this repository. Describe what has been demonstrated,
what remains incomplete, what cannot yet be verified, and what should happen
next.

This prompt prepares and documents an evaluation; it does not implement
features, repair findings, alter requirements, approve a release, or publish
the application.

## 2. P09 Completion Gate

Run this evaluation after P09 documentation and its applicable review have
finished. Before evaluating:

1. Inspect the actual P09 records and documentation deliverables in
   `ai-pipeline/outputs/09_documentation/`, `docs/`, and the repository root.
2. Establish whether P09 is complete and identify the relevant validation
   decision, if one was produced.
3. Do not assume P09 produced a file named `DOCUMENTATION_REPORT.md`; use the
   real filenames and record them.
4. If P09 is not complete, do not present the evaluation as final. Record the
   missing prerequisite in the report and set the verdict to `BLOCKED` if the
   incomplete documentation stage prevents a meaningful final assessment.
   If a useful partial assessment is still possible, label it explicitly as
   partial and do not imply that the P09 gate passed.

Do not change or complete P09 as part of this prompt.

## 3. Source of Truth and Project-Specific Inputs

Read `ai-pipeline/prompts/system/SYSTEM_PROMPT.md` completely before acting.
Inspect the current repository and resolve artifacts by their actual paths.
The project has historical references to both `ai-pipeline/outputs/` and
`ai-pipeline/outputs/`; do not assume an old path exists or create duplicate
artifacts to satisfy an outdated reference. If multiple versions exist, compare
them, identify the authoritative/current version from repository evidence, and
record unresolved conflicts.

Inspect the following actual sources when present:

* `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md` and its validation.
* `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md` and its validation.
* `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md`,
  `REQUIREMENTS_VALIDATION.md`, and the approved `product_backlog.json`.
* `ai-pipeline/outputs/03_planning/PRIORITIZATION.md`,
  `PRIORITIZATION_VALIDATION.md`, and its prioritized `product_backlog.json`.
* `ai-pipeline/outputs/04_ux/UX_SPEC.md` and `UX_SPEC_VALIDATION.md`.
* `ai-pipeline/outputs/05_architecture/ARCHITECTURE.md` and
  `ARCHITECTURE_VALIDATION.md`.
* Relevant records under `ai-pipeline/outputs/06_implementation/`, including
  `IMPLEMENTATION_LOG.md`, `IMPLEMENTATION_VALIDATION.md`,
  `IMPLEMENTATION_FOUNDATION_VALIDATION.md`, and story-specific implementation
  or validation files that actually exist.
* `ai-pipeline/outputs/07_testing/TEST_ANALYSIS.md`, `TEST_PLAN.md`,
  `TEST_IMPLEMENTATION.md`, `TEST_VALIDATION.md`, `BUG_FIX_REPORT.md`, and
  `PROMPT_LOG.md`, as available.
* `ai-pipeline/outputs/08_cicd/CICD_IMPLEMENTATION.md`,
  `CICD_VALIDATION.md`, `DEPLOYMENT_GUIDE.md`, `README.md`, and
  `PROMPT_LOG.md`, as available.
* Actual P09 outputs and validation, `README.md`, relevant `docs/` files, and
  source/configuration/test files needed to corroborate material claims.

These names describe the current Notara layout, not a guarantee that every file
exists. Check actual contents and paths. Do not invent unavailable records or
treat a missing artifact as proof that a requirement passed or failed.

## 4. Role and Evaluation Principles

Act as an independent MVP evaluator with expertise in software quality,
requirements traceability, testing, deployment, documentation, and continuous
improvement. Previous AI-generated reports are evidence sources to corroborate,
not authoritative conclusions.

### 4.1 Evidence-based statuses

For each requirement, criterion, and material claim, use the most accurate
status:

* `VERIFIED`: directly supported by suitable evidence.
* `PARTIALLY_VERIFIED`: some evidence exists, but coverage or verification is
  incomplete.
* `NOT_VERIFIED`: evidence is insufficient to confirm the claim.
* `NOT_IMPLEMENTED`: available evidence shows the capability is absent.
* `DATA_UNAVAILABLE`: a measurement or external data source is unavailable.
* `NOT_APPLICABLE`: the criterion does not apply, with justification.

Missing evidence is not proof of a defect. Code existence alone is not proof of
working behavior. Identify the evidence source and its provenance when it
matters (for example, local execution, static review, remote-verified run, or
user-reported result).

### 4.2 Preserve approved scope and identifiers

Use the approved requirements, acceptance criteria, backlog, product vision,
and success criteria as the baseline. Preserve their IDs and original targets.
Do not add new mandatory requirements or reinterpret targets to make the MVP
appear successful. If upstream files disagree, describe the conflict and its
impact instead of silently choosing.

### 4.3 Respect the MVP's maturity

Evaluate implementation and readiness using available evidence. Do not assume
that Notara was deployed, has real users, or generated operational or business
data. Mark adoption, engagement, business impact, production reliability, and
other unmeasured outcomes as `DATA_UNAVAILABLE` or `NOT_VERIFIED`, as
appropriate. Do not invent measurements or infer them from a successful build.

### 4.4 Proportional quality assessment

Assess only relevant quality dimensions supported by evidence, including
functional suitability, usability, reliability, performance, security,
maintainability, and compatibility. Do not impose unapproved coverage
thresholds, certifications, or enterprise practices.

## 5. Evaluation Workflow

### Step 1 - Establish the baseline and P09 status

Review the approved scope, requirements, acceptance criteria, success criteria,
and actual P09 completion/validation evidence. Record the sources inspected,
their paths, versions or dates when available, and missing/conflicting
artifacts. Preserve all existing IDs and targets.

### Step 2 - Assess requirements and implementation

For each in-scope requirement or feature, record its original ID, expected
behavior, implementation status, verification status, evidence, and known
limitations. Distinguish implementation from successful verification.
Exclude deferred and out-of-scope capabilities from MVP completion counts
unless the approved baseline explicitly includes them.

### Step 3 - Assess testing and technical quality

Review current P07 reports and corroborating repository evidence. Report
commands, environments, result counts, and provenance as recorded; do not
conflate SQLite results with PostgreSQL results, local checks with remote CI,
or a build/typecheck with functional testing. Preserve relevant historical
failures and fixes, and distinguish them from final rerun results.

Review unresolved defects and risks. Explicitly address unresolved
`BLOCKER`/`CRITICAL` defects and any P07 `FAIL`/`BLOCKED` decision. Disclose
security, performance, reliability, or compatibility measurements that were
not performed.

### Step 4 - Assess CI/CD, deployment, and operations

Use the actual P08 records and repository configuration. Distinguish:

* deployment completed and operation independently verified;
* deployment configured but not completed or verified;
* deployment strategy documented but configuration incomplete; and
* deployment blocked.

Treat CI workflow existence, static inspection, local test execution, a green
build, a user-reported run, and remote-verified workflow logs as different
evidence. Do not claim Railway deployment or production readiness without
direct supporting evidence. Respect the latest P08 validation, including
known failed or unverified remote jobs and manual prerequisites.

### Step 5 - Assess P09 documentation and traceability

Review the deliverables P09 actually created, the P09 validation decision if
available, the root `README.md`, relevant files under `docs/`, and any
documentation exposed by the application. Evaluate whether they accurately
explain the MVP scope, architecture, prerequisites, environment setup,
installation, execution, testing, deployment, limitations, and traceability,
as applicable. Report stale, contradictory, missing, or unverified content.
Do not assume a document is accurate because P09 generated it.

### Step 6 - Assess success criteria and outcomes

For every approved success criterion, preserve its ID and original target and
record available measurement/evidence, actual result if measurable, status,
and limitations. Separate demonstrated technical outcomes, operational
outcomes, user/business outcomes, and unmeasured outcomes. Explain what
evidence and conditions would allow an unmeasured criterion to be evaluated.

### Step 7 - Prioritize recommendations and decide the verdict

For each recommendation, assign a stable `EVAL-NNN` ID, priority
(`BLOCKER`, `HIGH`, `MEDIUM`, or `LOW`), evidence/gap, expected benefit or risk
reduction, concrete next action, and related requirement, defect, or backlog ID
when applicable. Do not modify the approved backlog or assign work.

Choose exactly one verdict:

* `READY_FOR_NEXT_STAGE`: evidence supports moving to the next planned stage;
  this does not mean production readiness or proven business viability.
* `NEEDS_ITERATION`: material improvements, incomplete requirements, defects,
  or verification gaps should be addressed first.
* `BLOCKED`: a critical issue or prerequisite prevents meaningful evaluation
  or makes proceeding unsafe or infeasible.

Explain how the evidence supports the verdict. Missing user/business data alone
does not require `BLOCKED`. Do not recommend proceeding as if unresolved
critical defects or failed essential gates were resolved.

## 6. Required Output 1 - Evaluation Report

Create `ai-pipeline/outputs/10_evaluation/MVP_EVALUATION.md` with:

1. **Executive Summary** - verdict, MVP maturity, demonstrated strengths,
   material limitations/risks, and what the verdict does and does not establish.
2. **Evaluation Scope and Evidence** - baseline, actual sources inspected,
   provenance, missing/conflicting inputs, and limitations; explicitly state
   whether P09 is complete and validated.
3. **Requirements and Feature Assessment** - requirement-by-requirement
   status, acceptance-criteria evidence, and incomplete, unimplemented, or
   unverified features.
4. **Functional and Technical Quality** - actual test results, defects,
   relevant quality evidence, and measurement gaps.
5. **CI/CD, Deployment, and Operational Readiness** - actual status, evidence
   type, automation/reproducibility, verification results, and prerequisites.
6. **Documentation and Traceability** - actual P09 deliverables, accuracy,
   completeness, and traceability gaps.
7. **Success Criteria and Outcome Assessment** - original target versus
   measured result, supporting evidence, and criteria not yet measurable.
8. **Risks and Prioritized Recommendations** - stable finding IDs, priorities,
   evidence, next action, and related IDs when applicable.
9. **Next Evaluation Steps** - evidence or measurements needed and conditions
   for reassessment.
10. **Final Verdict** - exactly one allowed verdict and evidence-based
    justification.

## 7. Required Output 2 - Machine-readable Metrics

Create `ai-pipeline/outputs/10_evaluation/eval_metrics.json` as valid JSON.
Use this schema; replace every example with evidence-based values. Do not use
the template's example statuses or counts as findings.

```json
{
  "evaluation_version": "1.0",
  "overall_verdict": "NEEDS_ITERATION",
  "evaluation_date": null,
  "mvp_maturity": "NOT_VERIFIED",
  "p09_status": "NOT_VERIFIED",
  "requirements": {
    "total": null,
    "verified": null,
    "partially_verified": null,
    "not_verified": null,
    "not_implemented": null,
    "data_unavailable": null,
    "not_applicable": null
  },
  "testing": {
    "execution_status": "DATA_UNAVAILABLE",
    "tests_passed": null,
    "tests_failed": null,
    "coverage_percent": null,
    "unresolved_blocker_defects": null,
    "unresolved_critical_defects": null
  },
  "deployment": {
    "status": "DATA_UNAVAILABLE",
    "operational_verification": "NOT_VERIFIED"
  },
  "documentation": {
    "status": "NOT_VERIFIED",
    "major_gaps": null
  },
  "success_criteria": {
    "total": null,
    "met": null,
    "partially_met": null,
    "not_met": null,
    "unmeasured": null,
    "not_applicable": null
  },
  "user_and_business_outcomes": {
    "status": "DATA_UNAVAILABLE",
    "notes": []
  },
  "findings": {
    "blocker": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "info": 0
  },
  "limitations": [],
  "evidence_sources": []
}
```

JSON rules:

* The example is structural only. Set the real `overall_verdict` and actual
  statuses. Use `null` for unknown numeric values, never zero to mean unknown.
* A numeric zero is allowed only when the zero count was actually established.
* `evaluation_date` must be an ISO 8601 date or `null`.
* Keep `p09_status` explicit (`PASS`, `PASS_WITH_WARNINGS`, `FAIL`,
  `BLOCKED`, `IN_PROGRESS`, `NOT_RUN`, or `NOT_VERIFIED`).
* Use the assessment statuses from Section 4.1 for `mvp_maturity`,
  `documentation.status`, `user_and_business_outcomes.status`, and
  `deployment.operational_verification`.
* `testing.execution_status` must be one of `PASS`, `PASS_WITH_WARNINGS`,
  `FAIL`, `BLOCKED`, `NOT_RUN`, or `DATA_UNAVAILABLE`.
* `deployment.status` must be one of `DEPLOYED_VERIFIED`,
  `CONFIGURED_NOT_DEPLOYED`, `DOCUMENTED_NOT_CONFIGURED`, `BLOCKED`, or
  `DATA_UNAVAILABLE`; it describes actual state, not merely configuration.
* Count requirements/criteria against the inspected approved baseline.
  When all category counts are known, they must sum to the corresponding
  total. If any category or total cannot be established, use `null` for the
  unknown value and explain why rather than asserting a complete sum. Findings
  counts must agree with the report. Add no fabricated values.
* `evidence_sources` is an array of actual paths/references inspected;
  `limitations` and `user_and_business_outcomes.notes` are arrays of concise
  strings. Do not include secrets, personal data, or credentials.
* Keep the report and JSON consistent. If a count is unknown, explain why.

## 8. Boundaries and Completion

* Do not modify application code, tests, dependencies, configuration,
  infrastructure, requirements, architecture, backlog, or P09 deliverables.
* Do not publish/deploy, provision resources, commit, or push.
* Do not invent evidence, metrics, IDs, results, or missing artifact contents.
* Do not require unavailable user/business data or unapproved quality targets.
* Do not treat missing measurements as failed measurements.
* Do not mark a claim verified without suitable evidence.
* Do not report recommendations as completed work.

Before handing off:

1. Confirm both output files exist at the exact paths above.
2. Parse `eval_metrics.json` with a JSON parser.
3. Cross-check verdict, requirement and success-criterion counts, test results,
   deployment, P09 status, findings, and limitations between both outputs.
4. Verify significant conclusions cite actual evidence or explicitly disclose
   the evidence gap.
5. Record incomplete evaluation work and why it remains incomplete.

P10 documents the demonstrated state and valuable next steps. Technical
completion alone does not establish adoption, business viability, production
readiness, or real-world impact.