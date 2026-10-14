# P06 — Implementation Validation

**Version:** 1.0  
**Stage:** P06 — Implementation  
**Type:** Validation Prompt  
**Input Artifacts:**

* Approved `Architecture`
* Current `Sprint`
* Approved `UX`
* Current source code and repository state
* `artifacts/06_implementation/IMPLEMENTATION_LOG.md`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/06_implementation/IMPLEMENTATION_VALIDATION.md`  
**Related Generation Prompt:** `prompts/06_implementation/P06_implementation.md`  
**Previous Stage:** P05 — Architecture  
**Next Stage:** P07 — Testing  
**Advance Condition:** Code meets the approved design and requirements and is ready for subsequent user-story implementation.

---

# 1. Purpose

Validate that P06 correctly transforms the approved Architecture, current Sprint context, and UX foundation into an implementation foundation that is coherent, traceable, maintainable, and ready for future feature development.

The validator must determine whether:

* The implementation conforms to the approved Architecture.
* Required architectural components and boundaries are actually implemented.
* The UX foundation is consistent with the approved UX and architecture.
* The repository structure supports the intended development model.
* Required configuration and infrastructure foundations exist.
* Dependencies are justified and compatible.
* Security foundations are handled appropriately.
* The implementation is sufficiently real to support subsequent development.
* The implementation does not silently redesign the Architecture.
* The implementation does not introduce unsupported product functionality.
* Sprint context is respected without turning P06 into a backlog-completion stage.
* User stories remain clearly separated from foundation work.
* `IMPLEMENTATION_LOG.md` accurately reflects the repository state.
* Important implementation decisions and limitations remain traceable.
* The code is ready to enter P07 Testing after successful review.

This is a **code review and implementation validation prompt**, not a code repair prompt.

The validator must not implement missing features, redesign the Architecture, or silently fix findings in the artifacts being evaluated.

---

# 2. Inputs

## 2.1 Architecture

Read the approved Architecture artifact completely.

Use it as the primary source of truth for validating:

* Components.
* Layers.
* Boundaries.
* Technologies.
* Interfaces.
* Runtime requirements.
* Data boundaries.
* Security architecture.
* Infrastructure requirements.
* Architectural constraints.

---

## 2.2 Sprint

Read the current Sprint artifact.

Use it to distinguish:

* Architectural prerequisites.
* Shared infrastructure tasks.
* Future user-story work.
* Dependencies that P06 should prepare for.

The Sprint must **not** be interpreted as evidence that user stories should already be implemented in P06.

The validator must explicitly check that story scope was not accidentally absorbed into the architecture implementation stage.

---

## 2.3 UX

Read the approved UX artifact.

Use it to validate:

* Application shell.
* Navigation foundation.
* Shared UI components.
* Design system foundations.
* Responsive behavior foundations.
* Accessibility foundations.
* Interaction conventions.
* Frontend architecture compatibility.

Do not require feature-specific UX flows to be implemented merely because they appear in the Sprint.

---

## 2.4 Source Code and Repository

Inspect the current repository as the primary implementation source of truth.

Review:

* Source files.
* Configuration.
* Dependency manifests.
* Project structure.
* Build configuration.
* Application entry points.
* API/service foundations.
* Persistence foundations.
* Frontend foundations.
* Shared components.
* Integration boundaries.
* Security mechanisms.
* Logging and error handling.
* Available architecture-level verification.

Do not rely solely on the Implementation Log to determine what exists.

---

## 2.5 Implementation Log

Read:

```text
artifacts/06_implementation/IMPLEMENTATION_LOG.md
```

Use it to evaluate:

* What the generation stage claims to have implemented.
* What was intentionally deferred.
* What assumptions remain.
* What blockers remain.
* How architecture decisions map to source code.
* Whether the documentation matches reality.

The repository remains the source of truth when the log and code disagree.

---

## 2.6 Global System Prompt

Read:

```text
prompts/system/SYSTEM_PROMPT.md
```

Use it to validate compliance with:

* Architecture consistency.
* Traceability.
* Security.
* Dependency discipline.
* Code quality.
* Human control.
* Change management.
* Incremental implementation.
* Accurate documentation.

---

# 3. Role

Act as a:

> **Senior Software Engineer, Architecture Reviewer, and Code Quality Auditor.**

Your responsibility is to determine whether the P06 implementation is a faithful and sufficient realization of the approved technical design and whether it is ready to proceed to Testing.

You must:

* Review objectively.
* Compare implementation against Architecture.
* Compare UX foundation against UX.
* Check the Sprint boundary.
* Inspect actual code rather than trusting documentation.
* Verify traceability.
* Identify architectural violations.
* Detect accidental feature implementation.
* Distinguish missing foundation from intentionally deferred user-story work.
* Report evidence for findings.

You are not authorized to:

* Repair the code while validating it.
* Redesign the Architecture.
* Add missing product features.
* Invent requirements.
* Treat common engineering practices as project requirements unless supported by the source artifacts.
* Penalize the implementation because user stories remain unimplemented when P06 correctly deferred them.
* Approve undocumented deviations simply because they seem reasonable.

---

# 4. Core Validation Principle

The central question is:

> **Does the current codebase faithfully implement the approved architecture and required foundation, while intentionally leaving product backlog stories for subsequent development?**

Validation must evaluate the following relationship:

```text
Approved Architecture
        ↓
P06 Implementation Foundation
        ↓
Future User-Story Development
        ↓
P07 Testing
```

A passing P06 artifact is not a complete product.

It is a technically coherent foundation upon which the planned stories can be implemented.

---

# 5. Validation Process

## Step 1 — Validate Input Consistency

Review Architecture, Sprint, UX, and repository state before evaluating individual files.

Identify:

* Approved architecture decisions.
* Architectural requirements.
* UX foundations.
* Sprint prerequisites.
* Planned stories that must remain future work.
* Known assumptions.
* Known unresolved questions.
* Existing implementation constraints.

If the source artifacts themselves are contradictory, record the contradiction instead of silently resolving it.

---

## Step 2 — Validate Repository and Structural Integrity

Check whether the repository contains a coherent implementation structure.

Verify, when applicable:

* Expected source directories exist.
* Entry points exist.
* Dependency configuration exists.
* Configuration mechanisms exist.
* Required architectural modules exist.
* Frontend and backend foundations exist when applicable.
* Required integration boundaries exist.
* No obvious broken module references exist.

Do not require files that the Architecture does not justify.

Do not reward the presence of empty files merely because their names match the architecture diagram.

---

## Step 3 — Architecture Conformance Validation

For each important architectural element, determine whether it is:

```text
IMPLEMENTED
PARTIALLY_IMPLEMENTED
MISSING
CONFLICTING
NOT_APPLICABLE
```

Evaluate:

### 3.1 Architectural Layers

Verify that the implementation preserves defined layer boundaries.

Look for:

* Incorrect dependency direction.
* Business logic placed in infrastructure layers.
* Persistence leaking into unrelated layers.
* UI code directly bypassing intended service boundaries.
* Infrastructure coupled directly to product logic when an abstraction is required.

### 3.2 Components and Modules

Verify that defined components exist where required and own appropriate responsibilities.

Flag:

* Missing required components.
* Duplicate components.
* Responsibilities that were moved without justification.
* Monolithic code created despite an explicit architecture boundary.
* Modules that exist only cosmetically and contain no meaningful implementation.

### 3.3 Interfaces and Contracts

Verify that defined interfaces, contracts, or extension points exist when required.

Check:

* Naming.
* Responsibility.
* Dependency direction.
* Consistency with the architecture.
* Whether implementations actually use the defined boundary.

Do not require contracts that the Architecture never specified.

### 3.4 Technology Conformance

Verify that selected or required technologies are used consistently.

Flag:

* Silent framework replacement.
* Unapproved technology substitutions.
* Duplicate frameworks performing the same role.
* Unsupported infrastructure additions.

If a technology deviation appears justified, classify it as a deviation requiring explicit review unless supported by a documented decision.

---

## Step 4 — Application Bootstrap Validation

Verify that the application can be structurally initialized according to the Architecture.

Check, as applicable:

* Entry point.
* Framework initialization.
* Configuration loading.
* Dependency initialization.
* Routing initialization.
* Application lifecycle.
* Service startup.
* Frontend bootstrapping.

Where execution is available, use evidence from the actual environment.

Do not infer successful initialization merely from file presence.

---

## Step 5 — Configuration and Environment Validation

Verify:

* Configuration is centralized or otherwise consistent with Architecture.
* Environment-specific values are handled appropriately.
* Secrets are not hard-coded.
* Required environment variables are identifiable.
* Safe development defaults exist where appropriate.
* Production configuration is not accidentally embedded in source code.

Flag:

* Credentials in source control.
* Hidden configuration assumptions.
* Missing required configuration.
* Inconsistent configuration mechanisms.

---

## Step 6 — Persistence Foundation Validation

When persistence is part of the Architecture, validate:

* Database connectivity foundation.
* Data-access configuration.
* ORM or equivalent configuration.
* Migration framework.
* Connection lifecycle.
* Transaction mechanisms when required.
* Required schema foundations.

Do not penalize P06 because feature-specific entities are not implemented when those entities belong to future stories and the Architecture intentionally leaves them for later implementation.

Flag invented entities or premature schema decisions that are not justified by Architecture.

---

## Step 7 — API and Service Foundation Validation

When APIs or services are part of the Architecture, review:

* Server/application setup.
* Routing structure.
* Middleware.
* Service boundaries.
* Error handling.
* Dependency injection.
* Request/response conventions.
* Integration interfaces.
* Health/readiness infrastructure when required.

Distinguish between:

```text
FOUNDATION READY
```

and:

```text
FEATURE IMPLEMENTED
```

The first is expected in P06.

The second is generally outside the P06 boundary unless explicitly required by Architecture.

Do not require fake feature endpoints merely to make the architecture look complete.

---

## Step 8 — UX Foundation Validation

Compare the implementation against approved UX foundations.

Verify, when applicable:

* Application shell.
* Global layout.
* Routing foundation.
* Shared UI primitives.
* Theme and design tokens.
* Typography/spacing foundations.
* Loading states.
* Error states.
* Empty states.
* Accessibility foundations.
* Responsive foundations.
* Shared data-access mechanisms.

Do not require complete feature screens for future user stories.

Flag feature-specific UI that was added without justification, especially when it creates unapproved product scope.

---

## Step 9 — Cross-Cutting Infrastructure Validation

Review infrastructure that affects multiple application areas.

Check, as required:

* Logging.
* Error handling.
* Validation infrastructure.
* Security middleware.
* Authentication infrastructure.
* Authorization infrastructure.
* Observability hooks.
* Request correlation.
* Dependency injection.
* Configuration validation.

Each mechanism must have a justified architectural purpose.

Do not require enterprise infrastructure that the project did not define.

---

## Step 10 — Security Validation

Verify that the implementation:

* Does not contain hard-coded secrets.
* Does not disable security controls merely to simplify development.
* Handles sensitive configuration safely.
* Applies appropriate input boundaries.
* Respects defined authentication and authorization architecture.
* Does not introduce insecure default credentials.
* Does not expose unnecessary internal configuration.

If security requirements are unresolved in Architecture, report the gap rather than inventing the policy.

---

## Step 11 — Dependency and Code Quality Validation

Review dependencies and source quality.

Check:

* Dependencies are justified.
* Versions are compatible with the architecture.
* Duplicate libraries are avoided.
* Unused dependencies are minimized.
* Code is readable.
* Names are meaningful.
* Responsibilities are focused.
* Duplication is reasonable.
* Minimal architecture-level smoke checks or scaffolding necessary to prove the foundation is coherent.

Only implement items justified by the source artifacts.

---

## Step 12 — Scope Boundary Validation

Check whether the repository accidentally implements user-story functionality.

Flag:

* Story-specific business logic.
* Feature workflows that belong to backlog items.
* UI screens associated with unimplemented business features.
* Product-specific routes or pages appearing before their architectural justification.
* Fake success responses or demo data being disguised as real implementation.

The validation must explicitly distinguish:

```text
FOUNDATION IMPLEMENTED
```

from:

```text
BUSINESS FEATURE IMPLEMENTED
```

The first is acceptable in P06. The second is not unless explicitly justified by architecture.

---

## Step 13 — Implementation Log Validation

Read the log and compare it to the actual repository.

Determine whether the log:

* Matches the source code.
* Identifies deferred work correctly.
* Distinguishes foundation work from feature work.
* Documents assumptions, blockers, and gaps honestly.
* Refers to real files and real components.
* Avoids unsupported success claims.

The repository is the source of truth; the log is evidence, not authority.

---

## Step 14 — Status Determination

Assign one of the following statuses:

```text
READY
READY_WITH_ASSUMPTIONS
BLOCKED
```

### READY

Use when:

* The approved architecture has been implemented sufficiently as a technical foundation.
* Required UX foundations are present when applicable.
* Required development infrastructure is present.
* The project structure is coherent.
* The code respects architectural boundaries.
* The implementation can proceed to Testing.
* No material blocker remains.
* Deferred user stories are clearly distinguished from implemented foundation work.

### READY_WITH_ASSUMPTIONS

Use when:

* The architecture foundation is usable.
* Non-critical assumptions remain.
* Those assumptions are explicitly documented.
* Future story implementation can proceed without resolving every non-critical uncertainty.

### BLOCKED

Use when:

* The Architecture is missing or unusable.
* Architectural contradictions prevent implementation.
* Required technical decisions are absent and cannot safely be inferred.
* The codebase cannot establish the required architecture foundation.
* Critical dependencies or infrastructure are unavailable.
* The implementation cannot meet mandatory architecture requirements.
* Proceeding would require inventing project-specific behavior or redesigning the architecture without approval.

Do not use `BLOCKED` merely because user stories remain unimplemented. That is expected in P06.

---

# 6. Required Output

Generate:

```text
artifacts/06_implementation/IMPLEMENTATION_VALIDATION.md
```

The validation report must contain:

## 6.1 Executive Summary

* Implementation status.
* Overall confidence.
* High-level evaluation of architecture compliance.

## 6.2 Scope Validation

* Confirm whether the implementation respects the approved boundary between foundation and future story work.
* Clearly state which stories or features were intentionally deferred.

## 6.3 Architecture Validation Findings

For each relevant element, report:

```text
Element
Status (IMPLEMENTED / PARTIALLY_IMPLEMENTED / MISSING / CONFLICTING / NOT_APPLICABLE)
Evidence
Assessment
```

## 6.4 Repository and Structure Review

* Project structure.
* Dependency correctness.
* Config completeness.
* Bootstrap viability.

## 6.5 UX Foundation Review

* Design-system and shell foundation.
* Shared UI and responsive behavior.
* Accessibility and layout baseline.

## 6.6 Security and Quality Review

* Sensitive-data handling.
* Security boundaries.
* Dependency quality.
* Logging/error-handling foundations.

## 6.7 Implementation Log Review

* Whether the log is accurate.
* Whether deferred work is correctly identified.
* Whether assumptions and blockers are documented.

## 6.8 Risks, Assumptions, and Blockers

List all important issues requiring awareness before P07.

## 6.9 Final Recommendation

State whether the implementation is:

* READY
* READY_WITH_ASSUMPTIONS
* BLOCKED

And explain why.

---

# 7. Failure Conditions

The validation should be considered invalid if:

* It approves an implementation that violates the approved Architecture.
* It treats future story work as implemented foundation work.
* It ignores a mismatch between the repository and the Implementation Log.
* It rewards empty scaffolding without meaningful code.
* It accepts unsupported product functionality simply because it seems convenient.
* It does not distinguish between technical foundation and backlog completion.
* It fails to document material blockers or assumptions.
* It approves the stage without evidence from the actual repository state.

---

# 8. Final Response Format

After validating the implementation, report:

1. Validation status.
2. Main architecture elements verified.
3. Main findings.
4. User-story work intentionally deferred.
5. Important assumptions or risks.
6. Important blockers or limitations.
7. Whether the implementation is ready for P07 Testing.

Do not claim that the product is complete.

Do not claim that user stories are done unless they were explicitly and legitimately implemented.

The output of this stage is a validation result for a technical foundation, not a completed product increment.

---

# 9. Stage Transition

If the result is:

```text
READY
```

the project may proceed to:

```text
P07 — Testing
```

If the result is:

```text
READY_WITH_ASSUMPTIONS
```

the project may proceed only while carrying the documented assumptions forward.

If the result is:

```text
BLOCKED
```

return to the appropriate previous stage, normally P05 Architecture when the blocker is architectural, or remain in P06 when the blocker is implementation-specific.

The AI must not automatically advance the pipeline.
