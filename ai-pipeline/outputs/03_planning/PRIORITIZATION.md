# Prioritization and Delivery Plan

## 0. Change Log

| Version | Release | Summary |
|---|---|---|
| 1.0 | MVP 1 | Priorities for HU01-HU10; status READY; delivered as tag `v1.0.0`. |
| 2.0 | MVP 2 | Incremental plan for HU11-HU19 (US-011-US-019): priorities, delivery groups, team Story Points (31 SP), capacity cut line, drop order and preconditions. MVP 1 kept as delivered baseline; P03 DEC-002 superseded by DEC-211. |
| 3.0 | MVP 2 | Applies CR-003: HU11/HU12 use local STT, no STT provider key; PRE-004 is limited to commercial TTS. Adds quality/resource gate PRE-011 without changing priority or Story Points. |
| 4.0 | MVP 2 | Records HU11-specific human approvals: PRE-002 satisfied, PRE-011 approved for planning with empirical checks pending, and HU11-scoped decisions/ADRs ratified. Q-020 remains open for other MVP 2 scope. |

| 4.2 | MVP 2 | Records requester-approved CR-004 implementation of Whisper Base for HU11/HU12. Empirical acceptance and Railway validation remain pending; priorities, Story Points, capacity and MVP 1 baseline unchanged. |
| 4.3 | MVP 2 | Merge reconciliation: PRE-003 (DEC-236, DEC-238) and PRE-008 (DEC-237) resolved; PRE-009 records the approved 25 s STT ceiling (DEC-232); US-014 estimate is a team estimate (its rule is approved). US-011 stays provisional per DEC-208. |
| 4.4 | MVP 2 | Reconciles source versions and records CR-005/006/007 as pending changes; no new story is prioritized and the 31-SP HU11–HU19 plan is unchanged. |
| 4.5 | MVP 2 | Adds an as-built implementation evidence note from P06 without changing planned scope, priority, estimates, capacity, assignments, release status, or CR approval states. |
| 4.6 | MVP 2 | Reconciles project-lead-reported team approval of CR-005/006/007 and P02 v5.6. Adds US-020/US-021 to the approved scope register without assigning priority, estimates, delivery order, or capacity. The known HU11–HU19 plan remains 31 SP. |

## 1. Document Metadata

- **Project:** Notara
- **Version:** 4.6
- **Release:** MVP 2 - Sprint 2 (Audio, Voice and TTS/STT)
- **Stage:** P03 - Planning
- **Status:** `READY_WITH_ASSUMPTIONS`
- **Source Artifacts:**
  - `ai-pipeline/outputs/00_context/PROJECT_CONTEXT.md` (v2.5), `CONTEXT_VALIDATION.md`
  - `ai-pipeline/outputs/00_context/SPRINT_2_BACKLOG_INPUT.md` (HU11-HU19, SP, MoSCoW)
  - `ai-pipeline/outputs/00_context/DECISIONS_MVP2.md` (DEC-201-DEC-244; approval states retained)
  - `ai-pipeline/outputs/01_discovery/PRODUCT_VISION.md` (v2.4), `PRODUCT_VISION_VALIDATION.md`
  - `ai-pipeline/outputs/02_requirements/REQUIREMENTS.md` (v5.6), `product_backlog.json` (v5.6), `REQUIREMENTS_VALIDATION.md`
  - `ai-pipeline/outputs/00_context/CR-003_WHISPER_TINY.md` (approved per requester authorization)
  - `ai-pipeline/outputs/00_context/CR-004_WHISPER_BASE.md` (approved by requester for implementation; acceptance pending)
  - `ai-pipeline/outputs/03_planning/PRIORITIZATION.md` and `product_backlog.json` v1.0 (MVP 1)
  - `ai-pipeline/prompts/system/RELEASE_PLAN.md` (MVP 1 load reference), `SYSTEM_PROMPT.md`
  - `ai-pipeline/outputs/06_implementation/IMPLEMENTATION_VALIDATION_MVP2.md` (as-built status note only; not a planning or acceptance input)
- **Validation Statuses:**
  - P00: `PASS_WITH_WARNINGS` (run 6; formal CR-005/006/007 approval record pending documentation)
  - P01: `PASS_WITH_WARNINGS` (run 5; formal CR-005/006/007 approval record pending documentation)
  - P02: `PASS_WITH_WARNINGS` (requirements v5.6; Q-030 and empirical HU11 gates remain)

## 0.1 As-built implementation status note (2026-11-11)

P06's current validation reports implementation records for US-001–US-019 and code for CR-005/006/007. US-020 and US-021 are now approved-scope backlog items but are not incorporated into the 31-SP HU11–HU19 plan because no team priority or estimate was supplied. Implementation and verification states are tracked in P06/P07 and `docs/REQUIREMENTS_COVERAGE.md`; their presence does not establish acceptance or release delivery. No MVP 2 release tag or deployment of the inspected current tree was confirmed, so US-011–US-019 delivery statuses remain `PLANNED`; US-020/US-021 are explicitly unplanned.

## 2. Executive Summary

MVP 2 must demonstrate one product promise: **a user can dictate a score, publish it, and listen to it.** The P0 slice delivers exactly that: dictation (US-011), spoken solfege (US-013) and instrument playback (US-015), together with the two enablers that keep audio affordable and available, the audio store (US-016) and the fallback voice (US-017). P0 totals 21 SP. Voice comments, the audio tutor and `.abc` file loading are P1, 8 SP. The MP3 download is the only P2 item, 2 SP.

The team's load is **31 SP**, the same nominal load that MVP 1 delivered in one sprint. MVP 2 is riskier, though:
- It adds user audio and synchronous local CPU inference whose quality, memory and latency remain unvalidated.
- MVP 1 ended with an evaluation of `NEEDS_ITERATION`.
- The estimate for US-011 (8 SP) is provisional.

For these reasons the plan **commits only the P0 slice**, targets P1, treats P2 as stretch, and gives an explicit drop order.

**Sequencing:**
- Stories with no external dependency (US-015, US-019) start first, so the team is not blocked while TTS keys, budget and storage are confirmed.
- The voice-output chain runs US-017 → US-016 → US-013. US-017 comes first because the free fallback voice lets development proceed without paid credits (DEC-202).
- Dictation (US-011), the highest-uncertainty item, starts in parallel and early, so problems surface early.

**Status:** `READY_WITH_ASSUMPTIONS`. Sprint dates, owners, budget, decision ratification and three PROPOSAL rules are still team inputs (section 6.1). No technology beyond the decided constraints, no developer assignment and no date has been introduced.

## 3. Product Priorities at a Glance

| Priority | Item / Capability | Why It Matters | Source / Requirement | Status |
|---|---|---|---|---|
| — | MVP 1 capabilities (HU01-HU10) | Delivered baseline; P0/P1 as in version 1.0. | US-001-US-010; FR-001-FR-017 | Delivered (`v1.0.0`) |
| P0 | Dictate a score by voice | Core input promise of MVP 2; highest uncertainty in recognition quality and local runtime capacity. | US-011; FR-018-FR-021, FR-025, FR-029, FR-030, FR-043 | MVP Core |
| P0 | Spoken solfege | Core listening promise; learning use case for students. | US-013; FR-031-FR-033, FR-036, FR-037, FR-044 | MVP Core |
| P0 | Instrument playback | Core listening promise without external cost. | US-015; FR-035-FR-037 | MVP Core |
| P0 | Audio store (cache) | Protects credits; Must in the backlog. | US-016; FR-038, FR-039 | MVP Supporting (enabler) |
| P0 | Fallback voice | Keeps audio available in demos; free voice for development. | US-017; FR-040, FR-041 | MVP Supporting (enabler, Must by DEC-209) |
| P1 | Load score from `.abc` file | Closes MVP 1 scope gap; cheap and independent. | US-019; FR-022-FR-025 | MVP Supporting |
| P1 | Voice comments | Extends community feedback to voice. | US-012; FR-026-FR-030 | MVP Supporting |
| P1 | Audio tutor | Helps users understand a score before practicing. | US-014; FR-034 | MVP Supporting |
| P2 | MP3 download | Convenience for offline practice. | US-018; FR-042 | MVP Supporting (stretch) |
| — | Other-instrument playback / DDSP and instrument MP3 | Approved CR-005 scope; priority and estimate are not supplied, so not part of this committed or target plan. | US-020; FR-051-FR-052 | Approved scope; unplanned |
| — | Conversational score tutor | Approved CR-007 scope; priority and estimate are not supplied, so not part of this committed or target plan. | US-021; FR-047-FR-050 | Approved scope; unplanned |
| P3 | OMR, sung solfege, mixed MP3, other languages | Excluded or future. | P00 FUT-002, FUT-004, FUT-005; OOS-* | Future / Out of Scope |

## 4. MVP Focus

### MVP Core

| ID | Capability | User Value | Priority | Rationale |
|---|---|---|---|---|
| US-011 / HU11 | Dictate a score by voice | Enter a melody without typing notation (NEED-007). | P0 | Must; the defining input of MVP 2; highest uncertainty (vocabulary, musical recognition quality and local CPU/memory), so it must start early after PRE-002/PRE-011. Estimate 8 SP is **provisional** (BR-013, BR-025). |
| US-013 / HU13 | Spoken solfege | Hear note names to practice sight-reading (NEED-009). | P0 | Must; the defining output of MVP 2; depends on US-016 and US-017 for cost and availability. |
| US-015 / HU15 | Instrument playback | Hear how the melody sounds (NEED-011). | P0 | Must; runs in the browser with no provider (DEC-203), so it carries no external risk and gives early listening value. |

MVP 1 Core (HU01, HU02, HU04, HU07-HU10) remains delivered. The MVP 1 content rules apply unchanged to dictated and loaded content (DEC-218).

### MVP Supporting

| ID | Capability | User Value | Priority | Rationale |
|---|---|---|---|---|
| US-016 / HU16 | Audio store | Avoids paying twice for the same audio (OPS-002). | P0 | Must enabler; without it US-013 and US-014 can exhaust credits (RISK-010). Needs persistent storage (Q-009). |
| US-017 / HU17 | Fallback voice | Audio still works when the provider fails (OPS-001). | P0 | Must by DEC-209; also the default voice in development and CI (DEC-202), which unblocks US-013 before paid keys exist. |
| US-019 / HU19 | Load `.abc` file | Bring existing scores without copy-paste (NEED-013). | P1 | Should; 2 SP, frontend only, no provider or storage (DEC-217). Scheduled early because it is independent, not because it outranks P0. Fix DEFECT-001 in the same change. |
| US-012 / HU12 | Voice comments | Quick spoken feedback (NEED-008). | P1 | Should; reuses the local STT adapter, but adds storage (Q-009), personal data (DEC-214) and a lifecycle question (Q-022). |
| US-014 / HU14 | Audio tutor | Understand clef, meter and difficulty (NEED-010). | P1 | Should; depends on US-016/US-017 and on BR-014 (approved as initial version, DEC-238); tutor content set by DEC-236. Estimate 3 SP (team). |
| US-018 / HU18 | MP3 download | Offline practice (NEED-012). | P2 | Could; depends on US-013; first item dropped under pressure. |

MVP 1 Supporting (HU03, HU05, HU06) remains delivered.

### Future / Deferred

| ID | Capability | Reason for Deferral | Priority |
|---|---|---|---|
| FUT-002 | Image recognition / OMR | Reserved for MVP 3. | P3 |
| FUT-004 | Sung solfege with rhythmic synchronization | DEC-206. | P3 |
| FUT-005 | Single MP3 mixing voice and instrument | DEC-204. | P3 |
| FUT-006 | Email verification, account recovery | Not in the MVP 2 backlog. | P3 |
| DEFER-001 | Advanced ABC features | Q-001 minimal subset still applies; dictation vocabulary is one octave (ASM-012). | P2 |
| DEFER-002 | Additional feed sorting | Q-003 newest-first still applies. | P2 |
| DEFER-003 | Fallback for transcription | Not in the backlog; EDGE-018 defines a clear message instead. | P3 |

### Out of Scope

| ID | Excluded Item | Reason |
|---|---|---|
| OOS-002 | OMR in MVP 2 | MVP 3. |
| OOS-003 | Image uploads | HU19 loads text files only. |
| OOS-005 | Differentiated roles | HU16/HU17 are enablers, not roles. |
| OOS-006 | Comment editing | DEC-211 ratifies deletion only. |
| OOS-007 | Account recovery | Q-005. |
| OOS-008 | Server-side instrument synthesis | DEC-203. |
| OOS-009 | Storing loaded `.abc` files; other file formats | DEC-217. |
| OOS-010 | Languages other than Spanish | DEC-215. |

## 5. Delivery Sequence

Delivery groups are product groupings within Sprint 2, not technical tasks or dates. Groups 1-3 can run in parallel when people are available.

### Phase 0 - Preconditions (team decisions, before or at sprint start)

See section 6.1 (PRE-001-PRE-009). They are not development work, but several delivery groups depend on them.

### Phase 1 - MVP 2 Delivery (Sprint 2)

| Order | Work Item | Depends On | Value Delivered |
|---|---|---|---|
| 1a | US-015 Instrument playback (P0, 3 SP) | Published ABC scores (US-004, US-008) | First listening value with no external dependency. |
| 1b | US-019 Load `.abc` file + DEFECT-001 (P1, 2 SP) | US-004, US-005 (DEP-004) | Closes the MVP 1 gap; independent of keys and storage. |
| 2a | US-017 Fallback voice (P0, 2 SP) | Decided provider pair (DEC-202) | Free voice available for development, CI and demos. |
| 2b | US-016 Audio store (P0, 3 SP) | US-017; PRE-005 storage verification (DEP-009) | Reuse of synthesized audio; protects credits. |
| 2c | US-013 Spoken solfege (P0, 5 SP) | US-016, US-017 (DEP-007); ABC scores | Core listening promise. |
| 3 | US-011 Dictation (P0, 8 SP provisional) | US-004, US-005 (DEP-004); approved PRE-002 rules and PRE-011 targets | Core input promise; implementation authorized, with empirical quality/resource verification still pending. No OpenAI key dependency. |
| 4a | US-014 Audio tutor (P1, 3 SP) | US-016, US-017 (PRE-003 resolved by DEC-236, DEC-238) | Spoken summary of clef, meter, estimated difficulty. |
| 4b | US-012 Voice comments (P1, 3 SP) | US-010 and DEC-211 (DEP-005); transcription from US-011; PRE-005 storage | Spoken community feedback. |
| 5 | US-018 MP3 download (P2, 2 SP) | US-013 (DEP-006) | Offline practice. |

The **minimum coherent validation slice** is 1a, 2a, 2b, 2c and 3: dictate → publish → listen with solfege and instrument, with cost and availability protected.

### Phase 2 - Expansion / Post-MVP 2

| Order | Work Item | Depends On | Value Delivered |
|---|---|---|---|
| 1 | Address MVP 1 `NEEDS_ITERATION` findings not covered by Sprint 2 (e.g. P10 EVAL-001 security concern). | Team decision (PRE-010) | Reduces carried risk. |
| 2 | Revisit dictation vocabulary (octaves, dotted notes) with evidence from US-011 use. | Q-021; usage evidence | Richer dictation. |
| 3 | Evaluate sung solfege and mixed MP3. | FUT-004, FUT-005; new decision | Richer listening. |
| 4 | OMR / image recognition. | MVP 3 decision | Next product phase. |

## 6. Dependencies, Decisions, and Risks

### 6.1 Preconditions

| ID | Precondition | Needed by | Owner / Source | Status |
|---|---|---|---|---|
| PRE-001 | Ratify remaining MVP 2 decisions not amended by approved CR-003. | P04, P05; all MVP 2 groups | Team; Q-020 | Open overall; HU11-specific decisions ratified |
| PRE-002 | Approve dictation vocabulary BR-013 and header completion BR-025. | US-011 estimate and UX (P04) | Team; Q-021, Q-023; REQ-VAL-201 | Satisfied for HU11; Q-029 (populated-field malformed/present-empty header edge case) remains open only for that append path |
| PRE-003 | Approve difficulty rule BR-014 and tutor content (key/tempo). | US-014 | Team; Q-024, Q-025 | Resolved by DEC-236, DEC-238 |
| PRE-004 | ElevenLabs key, TTS credits/budget and global monthly cap. | US-013, US-014 with the commercial voice | Team; Q-011 | Open |
| PRE-005 | Verify that the Railway volume persists files across deployments. | US-016, US-012 in production | TEAM-005 / P05; Q-009 | Open |
| PRE-006 | Sprint 2 dates and story owners. | Sprint commitment | Team; Q-010 | Open |
| PRE-007 | Decide the API route prefix (`/api/` vs `/api/v1/`) and the duplicated `Like`/`Reaction` models before adding MVP 2 endpoints. | P05, P06 | P05 architecture; P00 RISK-011 | Satisfied for HU11 endpoint by ratified ADR-013; other endpoint scope remains as applicable |
| PRE-008 | Decide the account-deletion gap in the retention rule. | US-012 closure | Team; Q-022 | Resolved by DEC-237 |
| PRE-009 | Latency targets. | P05, P07 | Team; Q-012 | Partially resolved: HU11 STT p95 target approved; 25 s STT ceiling and 20 s per synthesis attempt approved as initial values (DEC-232); TTS targets open |
| PRE-010 | Decide whether MVP 1 `NEEDS_ITERATION` items enter Sprint 2 capacity. | Sprint commitment | Team; P10 evaluation | Open |
| PRE-011 | Before committing HU11, approve the evaluation corpus, quality threshold and resource budgets; during HU11 acceptance, measure pinned-model startup, cold/warm latency, total memory and concurrency locally. | US-011 implementation/acceptance; Railway go/no-go | Team / P05; CR-003; Q-012, Q-028 | Approved for HU11 planning; empirical acceptance verification pending |

### 6.2 Dependencies, Decisions and Risks

| ID | Dependency / Risk / Decision Needed | Impact | Owner / Source | Status |
|---|---|---|---|---|
| DEP-004 | Dictation and file loading extend create/edit (US-004, US-005). | Medium | P02 | Confirmed |
| DEP-005 | Voice comments extend comments and need BR-019. | Medium | P02 | Confirmed |
| DEP-006 | MP3 needs the solfege audio (US-013). | Low | P02 | Confirmed |
| DEP-007 | Solfege and tutor rely on US-016 and US-017. | High | P02 | Confirmed |
| DEP-008 | Local STT needs pinned model weights and sufficient CPU/memory; paid TTS still needs provider access and budget. | High | P02; CR-003; PRE-004, PRE-011 | Open |
| DEP-009 | Voice comments and the audio store need persistent storage. | High | P02; PRE-005 | Open |
| DEP-010 | Decision-refined items need ratification. | Medium | P02; PRE-001 | Open |
| RISK-001 | 31 SP in one sprint with unknown dates; equal to the MVP 1 load but with first external integrations. | High | P00 | Mitigated by the cut line (section 7) |
| RISK-006 | Provider outages or exhausted credits. | High | P00 | Mitigated by US-016 and US-017 at P0 |
| RISK-007 | Dictation may reject natural phrasing. | High | P00 | US-011 early in the sprint; PRE-002 |
| RISK-008 | Storage persistence unverified. | High | P00 | PRE-005 before US-016/US-012 go to production |
| RISK-010 | Credit consumption by users. | High | P00 | US-016 P0; FR-044 limit |
| RISK-011 | MVP 1 debt (duplicate routes and models) spreading to new endpoints. | Medium | P00 | PRE-007 |
| RISK-014 | Decisions reversed at ratification. | Medium | P00 | PRE-001 before P04/P05 |
| PLAN-RISK-004 | Tiny may fail to recognize musical vocabulary; synchronous CPU inference may saturate workers, miss latency targets or multiply model memory across workers/replicas. | High | CR-003 spike; P05 | PRE-011; keep HU11 estimate provisional; Railway remains unvalidated |
| PLAN-RISK-001 | The provisional US-011 estimate (8 SP) may grow as implementation evidence becomes available; US-014 (3 SP) is a team estimate since BR-014 was approved (DEC-238). | Medium | P02 REQ-VAL-201; DEC-208 | Re-estimate if implementation evidence changes scope |
| PLAN-RISK-002 | Most MVP 2 stories have a user-facing part (US-011-US-015, US-018, US-019); MVP 1 concentrated frontend load on one role (35%, RELEASE_PLAN.md). Frontend capacity may be the bottleneck. | Medium | RELEASE_PLAN.md section 6 | Consider when owners are assigned (PRE-006); P03 does not assign people |
| PLAN-RISK-003 | MVP 1 closed as `NEEDS_ITERATION`; its improvement items compete for the same sprint capacity. | Medium | P10 MVP_EVALUATION | PRE-010 |
| DEC-001 | Newest-first feed, 10 per page. | Medium | MVP 1 | Approved |
| DEC-002 | Comments cannot be edited or deleted in MVP 1. | Low | MVP 1 | **Superseded by DEC-211** (deletion by author allowed; editing excluded) |
| DEC-003 | Account recovery excluded. | Low | MVP 1 | Approved |
| DEC-201-DEC-238 | MVP 2 decisions (DEC-230-DEC-238 reconciled from the second batch on merge). | — | `DECISIONS_MVP2.md`, CR-003 and HU11 authorization | HU11-specific decisions ratified per requester authorization; remaining MVP 2 ratification pending (Q-020) |

## 7. Capacity and Cut Line

| Band | Stories | Story Points | Commitment |
|---|---|---:|---|
| Committed (P0) | US-011, US-013, US-015, US-016, US-017 | 21 | Must be delivered for MVP 2 to exist. |
| Target (P1) | US-012, US-014, US-019 | 8 | Planned; dropped in order below if needed. |
| Stretch (P2) | US-018 | 2 | Only if P0 and P1 are complete. |
| **Total** | 9 stories | **31** | Equal to the MVP 1 load (31 SP, RELEASE_PLAN.md). |

**Drop order under capacity pressure** (first dropped first):

1. US-018 MP3 download (P2, Could).
2. US-012 Voice comments (P1). It has the most external dependencies (storage, personal data, Q-022).
3. US-014 Audio tutor (P1). It depends on an unapproved rule (BR-014).
4. US-019 Load `.abc` file (P1). It is kept longest because it is cheap, independent and closes an MVP 1 gap.

P0 stories are never dropped. If a P0 story is at risk, re-scope its acceptance criteria with the team, for example by narrowing the vocabulary in BR-013, rather than drop the story.

**Estimate status:** 23 SP are team estimates. 8 SP are provisional (US-011), kept provisional for capacity planning by DEC-208; US-014's rule is approved (DEC-238).

## 8. Requirements-to-Priority Traceability

| Requirement | Priority / Phase | Decision Basis | Notes |
|---|---|---|---|
| FR-001-FR-017 / HU01-HU10 | Delivered / MVP 1 | Version 1.0 plan | FR-016 extended by FR-028 (DEC-211). |
| FR-018-FR-021, FR-025, FR-029, FR-030, FR-043 / US-011 | P0 / group 3 | Must; core input; risk discovery | Provisional 8 SP; DIRECT to HU11, REFINED by DEC-205/208. |
| FR-026-FR-028 / US-012 | P1 / group 4b | Should; external dependencies | DIRECT to HU12; REFINED by DEC-211/214. |
| FR-031-FR-033, FR-044 / US-013 | P0 / group 2c | Must; core output | DIRECT to HU13; REFINED by DEC-206. |
| FR-034 / US-014 | P1 / group 4a | Should; rule approved as initial version | DIRECT to HU14; REFINED by DEC-212; 3 SP (team); DEC-236, DEC-238. |
| FR-035 / US-015 | P0 / group 1a | Must; no external dependency | DIRECT to HU15; REFINED by DEC-203. |
| FR-036, FR-037 | P0 / groups 1a, 2c | Cross-cutting for listening features | DEC-207. |
| FR-038, FR-039 / US-016 | P0 / group 2b | Must enabler; cost | DIRECT to HU16; REFINED by DEC-210. |
| FR-040, FR-041 / US-017 | P0 / group 2a | Must by DEC-209 | REFINED (Should → Must). |
| FR-042 / US-018 | P2 / group 5 | Could | DIRECT to HU18; REFINED by DEC-204. |
| FR-022-FR-024 / US-019 | P1 / group 1b | Should; independent | DIRECT to HU19 (CR-002). |
| NFR-004 Privacy | P0/P1 / groups 3, 4b | Applies to recordings | DEC-214. |
| NFR-005 Reliability | P0 / all MVP 2 groups | Text flows must not break | PRINCIPLE-008. |
| NFR-006 Cost control | P0 / groups 2a-2c | Credits | DEC-202, DEC-213. |
| NFR-007 Language | P0 / groups 2c, 3, 4 | Spanish only | DEC-215. |
| NFR-008 Platform | P0 / groups 3, 4b | Recording needs HTTPS and support | NFR-002 matrix. |
| NFR-009 Performance | BLOCKED | Targets not defined | PRE-009. |
| NFR-010 Testability | P0 / all MVP 2 groups | Tests without paid providers | P00 RISK-006. |

## 9. Assumptions and Unknowns

| ID | Item | Classification | Why It Affects Prioritization |
|---|---|---|---|
| ASSUM-001 | The approved minimal ABC subset is sufficient. | ASSUMED (MVP 1) | Still bounds dictated and loaded content (DEC-218). |
| ASSUM-002 | Readable text with preserved line breaks is sufficient. | ASSUMED (MVP 1) | Also applies to loaded files. |
| ASSUM-003 | Five-person team and one two-week sprint. | DIRECT | Basis for the cut line. |
| ASSUM-004 | P04 can refine presentation without changing scope. | ASSUMED | Enables UX for recording, listening and file loading. |
| ASSUM-005 | MVP 1 load (31 SP) is a usable reference for Sprint 2 capacity. | ASSUMED | MVP 2 risk is higher, so only P0 is committed. |
| ASSUM-006 | The free fallback voice is good enough for development and CI. | ASSUMED | Lets group 2 start before paid keys (DEC-202). |
| UNKNOWN-001 | Sprint dates and owners. | UNKNOWN | No commitment by date or person (PRE-006). |
| UNKNOWN-002 | Budget and global cap. | UNKNOWN | Commercial TTS use in demos (PRE-004). |
| UNKNOWN-003 | Adoption and learning outcomes. | UNKNOWN | Priorities rely on product intent, not metrics. |

## 10. Key Constraints

- MVP 1 content rules unchanged; they apply to dictated and loaded content.
- Listening features only for `.abc` scores; Spanish only; recordings ≤ 30 s and ≤ 2 MB; 20 new syntheses per user per day; HU11 STT quota 30 admitted inferences/user/UTC day by default (DEC-219).
- Decided engines: local `faster-whisper base` for STT (CR-004; CR-003 retained historically), ElevenLabs with `edge-tts` fallback for TTS, Tone.js in the browser; these are constraints, not P03 design.
- 31 SP in one sprint, five-person team, dates unknown.
- P03 assigns no developers, dates or workload, and designs no technology.

## 11. Final Recommendation

1. **Resolve story-specific preconditions before commitment.** HU11's applicable decisions and ADRs are ratified; PRE-002 is satisfied and PRE-011 is approved for planning, with acceptance measurements still required. PRE-001 remains open for other MVP 2 groups; PRE-004 (TTS key/budget) and PRE-006 (dates/owners) remain sprint-planning items, not HU11 implementation blockers. HU11 no longer needs an OpenAI key.
2. **Start without waiting.** Begin with US-015 and US-019, which depend on nothing external, together with US-017, whose free voice unblocks audio work.
3. **Start dictation early after its gates.** Begin US-011 after PRE-002 and PRE-011; use local fake/adapter tests to surface integration risk without claiming model quality or Railway readiness.
4. **Build the voice-output chain in order:** US-017 → US-016 → US-013.
5. **Commit the P0 slice (21 SP).** Deliver P1 in the order US-019 (already early), US-014, US-012, and treat US-018 as stretch.
6. **Re-estimate if implementation evidence changes scope.** PRE-002 is now satisfied for HU11; retain the provisional 8 SP estimate unless new evidence warrants a team re-estimate.

### CR-004 - Approved for implementation

CR-004 replaces Whisper Tiny with `Systran/faster-whisper-base`
for HU11/HU12, as authorized by the requester on 2026-11-09.
Approval from other team members has not been established.

Priorities, Story Points, capacity, delivery sequence and the
MVP 1 baseline remain unchanged.

Corpus-based quality, latency, memory, security and Railway
validation remain pending. Production deployment is not authorized.

CR-003 remains preserved as the historical STT decision.

## 12. Status and Next Actions

- **Status:** `READY_WITH_ASSUMPTIONS`
- **Next stage:** P04 - UX/UI
- **Next actions:**
  1. Validate this plan with `P03_validation.md` v2.0.
  2. In P04, design the P0 journeys first: dictation (with notice, vocabulary and errors), listening options on score detail (including disabled state for plain text), then file loading and voice comments.
  3. Take PRE-001-PRE-011 to the team; update this plan with dates and owners when PRE-006 closes.
- **Human decisions required:** PRE-001-PRE-011 as applicable by story. HU11 is authorized to begin implementation: PRE-002 is satisfied and PRE-011 is approved for planning. PRE-001 remains open overall but its HU11-specific subset is ratified; empirical acceptance gates are still outstanding.

## Addendum — Approved-scope planning reconciliation (2026-11-11)

The approved scope contains US-001–US-021. The detailed, prioritized plan
below still covers US-001–US-019 only: 31 SP (P0 21, P1 8, P2 2), with no
developer assignments. US-020 and US-021 remain canonical but unplanned
because the project lead supplied no priority, estimate, sequencing or
capacity decision. They are not assigned a release or sprint.

| Change | Planning treatment |
|---|---|
| CR-005 / HU20 | Approved scope as reported by the project lead; canonical US-020, not prioritized or estimated. |
| CR-006 / US-011 amendment | Approved scope as reported by the project lead; AC-078–AC-082 apply to US-011. Existing estimate and priority are unchanged. |
| CR-007 / HU21 | Approved scope as reported by the project lead; canonical US-021, not prioritized or estimated. |

The underlying team approval record/date remains pending documentation (Q-030);
the request receipt date is not represented as the approval date. The 31-SP
known plan is unchanged and is not a plan for all approved scope. No estimates
or priorities are invented. This is not a sprint commitment; dates, owners,
budget, storage and acceptance preconditions remain open as recorded.
