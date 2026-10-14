# P10 Validator - Independent Evaluation Validation

- **Version:** 1.0
- **Stage:** P10 - Evaluation
- **Type:** Independent Validation Prompt
- **Project:** Notara
- **Input Artifacts:** P10 report and JSON; approved P00-P05 records; P06-P09 evidence; current repository
- **Output Artifact:** `ai-pipeline/artifacts/10_evaluation/P10_VALIDATION.md`
- **Related Prompt:** `P10_evaluation.md`
- **Advance Condition:** The evaluation report and metrics accurately represent the available evidence, disclose limitations, and justify their verdict.

---

## 1. Role and Objective

Act as an independent quality auditor specializing in software evaluation,
evidence verification, requirements traceability, and technical reporting.
Validate P10's conclusions independently; do not accept a claim merely because
it appears in an AI-generated report.

Validate:

* `ai-pipeline/artifacts/10_evaluation/MVP_EVALUATION.md`
* `ai-pipeline/artifacts/10_evaluation/eval_metrics.json`

Determine whether the evaluation reflects approved Notara scope, traces
material conclusions to evidence, handles missing data honestly, is internally
consistent, and reaches a defensible verdict.

You are a validator, not an implementer. Do not modify P10 outputs, source
code, tests, configuration, infrastructure, requirements, architecture,
backlog, or P09 deliverables. Record corrections for the evaluation author.

## 2. Inputs and Source of Truth

Read `ai-pipeline/prompts/system/SYSTEM_PROMPT.md` completely. Inspect the
current repository and use actual paths. This project has historical references
to both `ai-pipeline/outputs/` and `ai-pipeline/artifacts/`; do not assume an
obsolete path is current, duplicate artifacts, or treat a missing old path as
missing evidence when its current counterpart exists.

Review, as applicable:

* P00-P05 artifacts under `ai-pipeline/artifacts/00_context/` through
  `05_architecture/`, especially approved requirements, validations, backlog,
  prioritization, and success criteria.
* Actual P06 implementation logs and validations under
  `ai-pipeline/artifacts/06_implementation/`.
* Actual P07 records under `ai-pipeline/artifacts/07_testing/`, including
  `TEST_VALIDATION.md`, `BUG_FIX_REPORT.md`, and execution records.
* Actual P08 records under `ai-pipeline/artifacts/08_cicd/`, including
  `CICD_VALIDATION.md`, `CICD_IMPLEMENTATION.md`, and `DEPLOYMENT_GUIDE.md`.
* Actual P09 artifacts and validation under
  `ai-pipeline/artifacts/09_documentation/`, the root `README.md`, and
  relevant `docs/` files.
* Source, tests, manifests, workflow/configuration, and other repository
  evidence needed to corroborate material statements.

Use filenames and structures that exist. Do not assume P09 produced
`DOCUMENTATION_REPORT.md`. If sources conflict or are unavailable, document the
conflict/gap and its effect. Do not invent missing content or treat missing
evidence as proof that a requirement was satisfied or violated.

## 3. Validation Rules

### 3.1 Evidence and factual accuracy

For each significant conclusion, verify that the report identifies relevant
evidence and that the evidence supports the claim. Check test results against
P07 records; implementation claims against implementation records or direct
inspection; deployment claims against P08 and available verification;
documentation claims against actual P09 deliverables; and defect statuses
against current reports.

Distinguish local execution, static review, remote-verified evidence,
user-reported results, and operations not run. A local test does not prove a
remote CI job passed. A build or workflow configuration does not prove
production readiness. Missing measurements mean a claim is unverified, not
automatically false.

### 3.2 P09 gate and documentation

Check whether P09's actual deliverables and applicable validation are
available, and whether P10 accurately states their status. If P09 is
incomplete, verify that the evaluation is not represented as final and that
the verdict/limitations address the incomplete gate. Confirm documentation
claims against the files actually reviewed.

### 3.3 Requirements and success criteria

Compare P10 with the approved P02 requirements/backlog and the original
success criteria in upstream approved artifacts. Verify that identifiers and
targets are preserved, all material in-scope requirements are assessed or
their omission explained, statuses match evidence, and no new requirement is
presented as previously approved. Report unresolved conflicts or ambiguous
criteria.

### 3.4 Missing data, metrics, and technical claims

Verify that unknown numeric values use `null`, not zero where zero would imply
a measured result; status labels are used consistently; template examples are
not reported as actual findings; and derived counts are reproducible from
accessible evidence.

Check that:

* Test and defect results match the evidence, including relevant historical
  failures and the final status.
* Unresolved `BLOCKER`/`CRITICAL` defects and P07 `FAIL`/`BLOCKED` results are
  addressed in the verdict.
* Deployment configuration is not confused with completed, verified
  deployment. User-reported results are not labelled remote-verified.
* Security, performance, reliability, PostgreSQL, or other unmeasured outcomes
  are disclosed rather than invented.
* Absence of reported defects is not treated as proof of defect-free software.
* No arbitrary coverage thresholds or unsupported production claims are added.

Do not require user analytics or business measurements when the MVP has not
reached a stage where they can reasonably exist.

### 3.5 JSON parsing, structure, and consistency

Parse `ai-pipeline/artifacts/10_evaluation/eval_metrics.json` and compare it
against the schema in `P10_evaluation.md`. Check that:

* The file exists, is readable, valid JSON, and has the required top-level
  fields and expected types.
* Status values comply with P10's defined values.
* Unknown numeric values use `null`; counts are supported by the inspected
  baseline and source evidence.
* `evaluation_date` is a valid ISO 8601 date or `null`.
* The overall verdict, P09 status, requirement and success-criterion counts,
  test results, deployment status, findings, and limitations agree with the
  report wherever repeated.
* Unknown or inaccessible source counts are disclosed instead of being
  accepted as independently verified.

If the JSON cannot be parsed or the template itself has an ambiguity, report
the exact issue and assess its impact rather than silently repairing either
file.

### 3.6 Verdict and recommendations

The verdict must be one of `READY_FOR_NEXT_STAGE`, `NEEDS_ITERATION`, or
`BLOCKED`. Independently assess whether it follows from the evidence:

* `READY_FOR_NEXT_STAGE` must not imply production readiness, adoption, or
  business viability without evidence.
* `NEEDS_ITERATION` must identify material improvements or verification gaps.
* `BLOCKED` must identify a critical issue or missing prerequisite that
  prevents meaningful evaluation or safe progress.
* Missing user/business data alone does not require `BLOCKED`.

Verify recommendations are actionable, prioritized, linked to actual findings
or evidence gaps, and traceable to related requirement/defect/backlog IDs when
those IDs exist. Recommendations are not completed changes.

## 4. Validation Workflow

1. **Inspect outputs:** confirm the Markdown and JSON exist, are readable, and
   are not empty or malformed.
2. **Reconstruct the evidence baseline:** review approved scope and relevant
   upstream evidence; identify accessible, missing, stale, or conflicting
   sources, including P09 status.
3. **Audit the report:** check evidence, completeness, requirement/criterion
   coverage, deployment/doc claims, and limitations.
4. **Audit the JSON:** parse and validate the P10 schema, values, counts, and
   cross-artifact consistency.
5. **Reassess the verdict:** independently decide whether material findings
   support the chosen verdict.
6. **Write the validation report:** create
   `ai-pipeline/artifacts/10_evaluation/P10_VALIDATION.md`. Do not edit the
   two P10 outputs while validating.

## 5. Required Validation Report

Use this structure in `P10_VALIDATION.md`:

### 1. Validation Summary

State the overall validation decision, main findings, whether P10 reliably
represents available evidence, and any review limitations.

### 2. Artifact Integrity

For each P10 output, report existence, readability, expected format, and
validation result. Explicitly report JSON parse/schema results.

### 3. Evidence and Traceability Audit

List material claims as `VERIFIED`, `PARTIALLY_VERIFIED`, `NOT_VERIFIED`, or
`CONTRADICTED`. For each issue, identify the P10 section/claim, actual source,
evidence provenance where relevant, and explanation.

### 4. Requirements and Success Criteria Audit

Identify omissions, incorrect statuses, changed targets, unsupported
conclusions, counting errors, or traceability gaps. Report the actual approved
baseline reviewed.

### 5. P09 Documentation Gate

State whether P09 is complete and validated based on actual records, which
deliverables were reviewed, and whether P10 characterized their status
accurately.

### 6. Metrics and JSON Audit

Report parse/schema results, malformed or unsupported values, count errors,
cross-file inconsistencies, and unavailable measurements handled incorrectly.

### 7. Verdict Assessment

State the verdict proposed by P10, whether it is justified, evidence for the
assessment, recommended verdict if different, and unresolved readiness issues.

### 8. Findings and Required Corrections

For each finding include:

* ID such as `VAL-001`.
* Severity: `BLOCKER`, `MAJOR`, `MINOR`, or `INFO`.
* Affected file and section/field.
* Issue description and supporting evidence.
* Required correction or clarification.

Use `BLOCKER` when the evaluation cannot be relied upon, such as fabricated
material metrics or a fundamentally unsupported verdict. Use `MAJOR` for a
substantial issue that could change conclusions, `MINOR` for a limited
non-material defect, and `INFO` for observations not requiring correction.

### 9. Final Validation Decision

Choose exactly one:

* `PASS`: sufficiently supported, consistent, and complete for its stated
  scope; no material corrections are required.
* `PASS_WITH_WARNINGS`: usable with minor issues or accurately disclosed
  evidence limitations; no material unsupported conclusion compromises it.
* `FAIL`: material inaccuracies, inconsistencies, omissions, or unsupported
  conclusions require correction before acceptance.
* `BLOCKED`: essential outputs or evidence are inaccessible or missing such
  that meaningful independent review is not possible.

Do not use `FAIL` or `BLOCKED` solely because real-world usage data is
unavailable when P10 has disclosed that limitation correctly. Distinguish an
evaluation defect from an upstream evidence gap accurately disclosed by P10.

### 10. Handoff

For `PASS` or `PASS_WITH_WARNINGS`, state remaining limitations and whether
the evaluation is acceptable. For `FAIL`, list corrections and require P10
correction/rerun followed by independent revalidation. For `BLOCKED`, identify
the missing prerequisites needed to resume.

## 6. Constraints and Completion Criteria

* Do not modify P10 outputs, application source, tests, configuration,
  infrastructure, requirements, architecture, backlog, or P09 deliverables.
* Do not invent evidence, test results, metrics, IDs, or missing contents.
* Do not introduce new mandatory quality thresholds.
* Do not mistake a missing measurement for a failed measurement.
* Do not accept a claim merely because an earlier AI report states it.
* Do not require every recommendation to be implemented before P10 can pass.
* Keep technical readiness distinct from demonstrated user/business outcomes.

Validation is complete only when:

1. Both P10 outputs have been inspected, or their absence is recorded.
2. Relevant upstream evidence has been reviewed to the extent available.
3. JSON parsing, schema, and cross-artifact consistency have been assessed.
4. P09 status and the independent verdict assessment are documented.
5. Material findings, required corrections, and limitations are recorded in
   `ai-pipeline/artifacts/10_evaluation/P10_VALIDATION.md`.