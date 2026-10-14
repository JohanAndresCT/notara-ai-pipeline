# Notara MVP 1 Architecture

## 1. Document Metadata

- **Project:** Notara
- **Version:** 1.0
- **Stage:** P05 - Architecture
- **Status:** `READY_FOR_REVIEW`
- **Sources:** P00 project context; P01 product vision; P02 requirements v2.0; P03 prioritization; P04 UX specification v1.0.
- **Upstream validation:** P00 `PASS_WITH_WARNINGS` (reconciled by later decisions); P01 `PASS`; P02 `PASS`; P03 `PASS`; P04 `PASS`.
- **Purpose:** Define an implementable, low-operational-complexity architecture for the approved Notara MVP 1. This document selects a recommended stack; it does not imply that any code or deployment already exists.

## 2. Executive Summary

Use a same-origin responsive web application backed by a Django modular monolith, Django REST Framework, and PostgreSQL. Build the browser client with React, TypeScript, and Vite. The backend owns authentication, authorization, validation, and all durable state. The React client provides the P04 screens and calls a versioned JSON API.

Use Django's session authentication with secure, HTTP-only cookies and CSRF protection rather than browser-stored bearer tokens. Deploy the frontend and API behind one origin to keep the session boundary simple. A relational database models users, scores, comments, and likes with database constraints for ownership-related invariants.

This is a single application and database, not a microservice system. No AI inference, audio processing, image storage, queue, or external notation service is required for this MVP.

## 3. Architecture Drivers and Boundaries

### 3.1 Drivers

- Support visitor registration/login and authenticated profile actions (FR-001..004, FR-017).
- Publish and manage `.abc` or plain-text scores with required metadata, a 1,000-character maximum, and the approved minimal ABC checks (FR-005..011; BR-003..007).
- Provide newest-first, ten-item pagination, instrument filtering, readable detail, comments, and reversible likes (FR-012..016; BR-008..011).
- Enforce authentication and score ownership on the server, regardless of client state (NFR-003).
- Preserve score line breaks and visibly identify the content format (NFR-001).
- Support current Chrome, Edge, and Firefox at 360, 768, and 1280 px (NFR-002).
- Fit the one two-week sprint and five-person team by minimizing deployment and operational components.

### 3.2 In Scope

The P0 flow is registration/authentication, score publication, feed/detail/filter, likes, and comments. P1 includes profile/password change and owner-only score edit/delete. All features have a place in the component and API design; P03 retains P0 as the delivery-protection priority.

### 3.3 Explicitly Out of Scope

Voice, OMR, images, audio, differentiated roles, account recovery, advanced ABC support, extra feed sorting, and comment editing/deletion. Do not add infrastructure for these features in MVP 1.

## 4. System Context

```text
Visitor / authenticated user
            |
            | HTTPS, same-origin browser requests
            v
+--------------------------------------+
| Notara web application               |
| React + TypeScript static client      |
| Django + Django REST Framework API    |
| Authentication, domain rules, API    |
+------------------+-------------------+
                   | SQL via Django ORM
                   v
             PostgreSQL
```

The user interacts through a supported browser. The web application serves the frontend and `/api/v1/` from one origin. The API is the only application path to persistent data. PostgreSQL stores account and community content. No external runtime service is required by the approved product scope.

## 5. Technology Decisions

| Concern | Decision | Rationale / Constraint |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fits the responsive, form- and feed-oriented UX and allows frontend/backend work to proceed in parallel. Keep state and dependencies lean. |
| Backend | Python + Django + Django REST Framework | Django provides mature account/session/CSRF primitives, ORM, migrations, and an API framework suitable for a compact academic product. |
| Database | PostgreSQL | Relational constraints and transactions suit ownership, comments, likes, and paginated/filterable records. |
| API | Same-origin JSON REST under `/api/v1/` | Clear frontend/backend contract without introducing cross-origin session configuration. |
| Authentication | Django server-side session; secure, HTTP-only cookie; CSRF token for unsafe requests | Avoids storing credentials or bearer tokens in browser local storage. Authentication and authorization remain backend-enforced. |
| Score storage | Text column in PostgreSQL; format enum/choice (`ABC`, `TEXT`) | Scores are capped at 1,000 characters; no file/object storage is needed. Preserve content as text, including newlines. |
| Runtime shape | One deployable web application plus PostgreSQL | Avoids microservice, queue, and distributed-transaction overhead for the MVP team. |
| Local development | One documented local environment; Docker Compose is recommended for app/database parity | Recommendation only; no existing tooling or hosting provider is assumed by the source artifacts. |

These choices are architecture recommendations for review, not product requirements. The project sources do not specify existing code, hosting provider, budget, or deployment environment.

## 6. Logical Components

### 6.1 Browser Client

- **Public access:** entry, registration, and login (SCR-001..003).
- **Authenticated experience:** dashboard/feed, score detail, create/edit forms, profile, and delete confirmation (SCR-004..009).
- **API client:** sends same-origin requests, includes CSRF protection for mutations, and presents API validation/authentication results in the UX-defined states.
- **Score display:** renders content as escaped text in a whitespace-preserving element; never interpret score text as HTML.
- **Responsive layout:** implement and verify the P04 requirements at the three approved widths and browser set.

The client may mirror validation for responsive feedback, but client checks are advisory. The server is authoritative for every write and access decision.

### 6.2 Django API and Domain Modules

Organize code as modules in one Django project, not separately deployed services:

- **Identity:** registration, login/logout, current-user profile, password change.
- **Scores:** score create/read/list/update/delete, metadata/content validation, minimal ABC validation, ownership checks.
- **Community:** score comments and per-user likes.
- **Shared API:** request validation, pagination, error response conventions, and authentication/CSRF configuration.

Keep business rules in backend validation/domain code and call them from API handlers. Use Django ORM transactions for operations that update related records. Avoid a generic plugin or event architecture at this scope.

### 6.3 Persistence

Use PostgreSQL as the system of record. Apply schema changes through checked-in Django migrations. API handlers must not bypass model/domain validation or rely on frontend filtering for confidentiality or ownership.

## 7. Data Model

| Entity | MVP fields (illustrative) | Relationships and constraints |
|---|---|---|
| User | Django user identity; username, name, description, main instrument | Unique username. Use Django password hashing and authentication facilities. Registration fields and password policy follow the approved registration flow; this architecture does not invent additional profile fields. |
| Score | id, owner, title, instrument, description, format, content, created_at, updated_at | `owner` references User; format is `ABC` or `TEXT`; content is non-empty and at most 1,000 characters; required metadata is validated. Index `(created_at, id)` for deterministic newest-first listing and an instrument/date index for filtering. |
| Comment | id, score, author, body, created_at | References Score and User. Created only by an authenticated user on another user's score. No edit/delete API in MVP 1. Comment length policy is not specified upstream and must be clarified before choosing a limit. |
| Like | id, score, user, created_at | Unique constraint on `(score, user)` so repeated like requests cannot create duplicates. Creation/deletion is idempotent from the API perspective. |

Deleting a score removes its associated comments and likes through database/application cascade behavior so deleted score interactions cannot remain orphaned. User deletion semantics are not defined by the MVP and are not designed here. Use stable identifiers and database foreign keys. The fields above are a conceptual model; final field nullability and exact types belong in implementation migrations.

## 8. API Boundaries

All endpoints return JSON and use a consistent error shape with a stable error code and field-level details where applicable. Exact payload schemas should be finalized during implementation and tested against P02 acceptance criteria.

| Method and route | Access | Behavior |
|---|---|---|
| `POST /api/v1/auth/register` | Visitor | Create a user; return field validation errors or success. |
| `POST /api/v1/auth/login` | Visitor | Establish a server-side session; reject invalid credentials. |
| `POST /api/v1/auth/logout` | Authenticated | Invalidate the session. |
| `GET /api/v1/me` | Authenticated | Return the current user's approved profile fields. |
| `PATCH /api/v1/me` | Authenticated | Update approved profile fields. |
| `POST /api/v1/me/password` | Authenticated | Change the current user's password; account recovery is not provided. |
| `GET /api/v1/scores?instrument=&page=` | Authenticated | Return newest-first results, 10 per page, optionally filtered by instrument. Enforce page size on the server. |
| `POST /api/v1/scores` | Authenticated | Validate and create a score owned by the current user. |
| `GET /api/v1/scores/{id}` | Authenticated | Return score metadata, readable content, format, comments, and the current user's like state. |
| `PATCH /api/v1/scores/{id}` | Authenticated owner | Validate and update an owned score. Non-owners receive a denied/not-found response consistent with the API's disclosure policy. |
| `DELETE /api/v1/scores/{id}` | Authenticated owner | Delete an owned score and associated interactions. |
| `POST /api/v1/scores/{id}/comments` | Authenticated, non-owner | Create a comment on another user's score. |
| `PUT /api/v1/scores/{id}/like` | Authenticated, non-owner | Ensure the current user's like exists; repeated calls do not duplicate it. |
| `DELETE /api/v1/scores/{id}/like` | Authenticated, non-owner | Remove the current user's like; repeated calls leave it absent. |

The API must not expose comment update/delete operations. Listing/detail responses must not imply audio, image, or advanced ABC capabilities.

## 9. Key Runtime Flows

### 9.1 Publish Score

1. The browser submits metadata, format, and content with an authenticated session and valid CSRF token.
2. The API validates required fields, supported format, non-empty content, and the 1,000-character limit.
3. For `ABC`, the server checks the required `X:`, `T:`, `M:`, `L:`, and `K:` fields and the approved valid musical-line condition. It does not claim full ABC grammar support.
4. The API sets owner from the authenticated session, persists the score, and returns the created resource.
5. The client navigates to detail and displays escaped text with preserved line breaks and a visible format label.

### 9.2 Feed and Instrument Filter

The API applies an optional exact instrument filter, deterministic newest-first ordering, and server-side page size 10. Filtering and pagination are performed in the database query. Empty results return a successful empty page; the client presents the specified empty state.

### 9.3 Owner-Only Mutation

For score update/delete, derive the actor from the authenticated session and compare it with the persisted score owner inside the request's authorization path. Never accept an owner identifier from the client as authority. A non-owner mutation must not change data.

### 9.4 Like and Comment

Enforce authentication and the non-owner rule at the API/domain boundary. The unique `(score, user)` constraint makes like creation safe against duplicates and concurrent repeat requests. Comments are append-only for MVP 1; the API offers creation and reading only.

## 10. Security and Privacy Baseline

- Require HTTPS in deployed environments; keep session cookies `Secure`, `HttpOnly`, and appropriately `SameSite` configured.
- Use Django's CSRF protection for cookie-authenticated state-changing requests; do not disable it to simplify frontend integration.
- Use Django's password hashing and session invalidation behavior; never store plaintext passwords or tokens in browser storage.
- Enforce authentication and ownership server-side on every protected endpoint, including direct API requests.
- Validate all submitted fields on the server. Render user-supplied score, profile, and comment text as escaped text; do not allow raw HTML.
- Use ORM parameterization and database constraints; do not construct SQL from user input.
- Keep secrets and database credentials outside source control, supplied through the deployment environment.
- Return only fields needed by each view. Do not expose password hashes or internal session data.
- No differentiated roles are introduced. Authenticated user status and resource ownership are the authorization model for this MVP.

Specific rate limits, retention periods, privacy jurisdiction, backup policy, and quantitative security targets are not defined by the upstream requirements and remain deployment/operational decisions.

## 11. Quality Attribute Strategy

| Attribute | Architecture response | Verification evidence |
|---|---|---|
| Readability (NFR-001) | Store content unchanged; return the format; render escaped text with line breaks preserved. | Detail-view tests for multiline ABC/plain text and format label. |
| Responsive behavior (NFR-002) | Responsive browser client; no viewport-specific backend assumptions. | Exercise P04 main flows in current Chrome, Edge, Firefox at 360/768/1280 px. |
| Access/ownership (NFR-003) | Session authentication plus server-side authorization on API mutations. | API tests for anonymous access, owner success, non-owner denial, and logout invalidation. |
| Content integrity | Server-side format/content validation and relational constraints. | Boundary tests for empty, 1,000, and 1,001 characters; ABC required fields/line; unsupported formats. |
| Feed correctness | Database filtering, stable newest-first order, fixed page size 10. | API tests for order, page boundaries, filter results, and empty results. |
| Sprint feasibility | One frontend, one backend application, one relational database; no required third-party runtime dependencies. | Demonstrate the P0 path end-to-end before P1 completion. |

The requirements define no latency, throughput, availability, recovery-time, or concurrent-user targets. Do not claim quantitative performance or availability guarantees until product/operations owners define them.

## 12. Deployment and Environments

Recommended deployment topology: a single public origin terminates HTTPS and serves the compiled React assets plus Django API routes; Django connects to PostgreSQL on a private network. The exact hosting provider and production topology remain unselected because no provider, budget, or hosting constraint is present in P00.

For local development, provide reproducible frontend/backend/database setup and migrations. Keep configuration environment-based and separate local, test, and deployed settings. Before public deployment, define database backups, migrations/rollback procedure, secret management, and HTTPS/session settings. No queue, object store, CDN, or AI model endpoint is required for MVP 1.

## 13. Architecture Decisions and Trade-offs

| ID | Decision | Benefit | Trade-off / revisit trigger |
|---|---|---|---|
| ADR-001 | Use a modular monolith instead of microservices. | Lowest operational and integration burden for a five-person, one-sprint project. | Revisit only if independently scaling or deploying a domain becomes a demonstrated need. |
| ADR-002 | Use React/TypeScript with Django/DRF and PostgreSQL. | Clear frontend/backend ownership and mature account/data primitives. | Adds a separate frontend build and API contract; requires team familiarity and review before implementation. |
| ADR-003 | Use same-origin Django session authentication with CSRF. | Avoids browser token storage and cross-origin credential configuration. | Deployment must route assets/API under one origin; cross-origin hosting would require a deliberate security redesign. |
| ADR-004 | Keep score content in the relational database as bounded text. | Simple persistence, backup, and transaction behavior for 1,000-character content. | If attachments or substantially larger content are approved later, revisit storage. |
| ADR-005 | Make the API authoritative for validation and ownership. | Direct API access cannot bypass client-side checks. | Requires API/domain tests in addition to UX tests. |

## 14. Risks, Assumptions, and Decisions Needed

| ID | Item | Impact | Handling / owner |
|---|---|---|---|
| ARCH-RISK-001 | The selected stack may not match team experience or course constraints. | Could threaten the two-week plan. | Team/technical lead confirms stack before implementation; retain modular monolith if replacing a technology. |
| ARCH-RISK-002 | Hosting and production operations are unspecified. | Deployment, cookie settings, backups, and release steps cannot be finalized. | Select hosting and define operational baseline before public release. |
| ARCH-RISK-003 | Comment length/validation and exact registration/password fields are not specified in these source requirements. | API schemas and database constraints could otherwise encode invented rules. | Confirm the approved flows or make explicit product decisions before implementation; do not silently add limits. |
| ARCH-RISK-004 | ABC “valid musical line” may require interpretation during implementation. | Overly strict checks could reject valid intended MVP content. | Implement only the approved minimal subset and test examples agreed by product/UX; advanced grammar remains excluded. |
| ARCH-ASSUM-001 | The UI and API can be served from one origin. | Enables session-cookie and CSRF approach. | Validate against chosen host; revise only if deployment requires separate origins. |
| ARCH-ASSUM-002 | MVP traffic and data volume do not require distributed scaling. | Supports a single application and database. | Revisit if actual measured load or availability needs require it. |
| ARCH-DECISION-001 | Stack recommendation is selected by P05 for implementation planning, subject to team/course review. | Removes the unspecified-stack blocker from technical design while exposing the human review gate. | Confirm prior to implementation. |

## 15. Requirement Traceability

| Requirements / UX | Architectural elements |
|---|---|
| FR-001..004; FR-017 | Identity module, Django session auth, profile/password endpoints, protected API. |
| FR-005..009; BR-003..006 | Scores module, bounded text storage, server validation, publication endpoint, readable detail. |
| FR-010..011; BR-007 | Owner-derived authorization for score update/delete. |
| FR-012..013; BR-008 | Database-backed newest-first, 10-item pagination, instrument filter. |
| FR-014; BR-009; NFR-001 | Score detail response and escaped whitespace-preserving text display. |
| FR-015; BR-010 | Unique per-user like constraint and idempotent create/remove API. |
| FR-016; BR-011 | Append-only comment API; no comment edit/delete endpoints. |
| NFR-002 | Responsive client validated at approved browser/viewport combinations. |
| NFR-003 | Authentication and ownership enforcement in backend, independent of UI visibility. |
| P03 P0/P1 boundary and P04 SCR-001..009 | End-to-end component and API coverage for P0 and P1; excluded capabilities omitted. |

## 16. Implementation Handoff

1. Confirm the recommended stack against course constraints and team skills.
2. Agree API schemas for registration, profile/password, comments, and the minimal ABC musical-line test cases without adding unapproved product rules.
3. Scaffold the frontend, Django API, and PostgreSQL environment; add migrations and a reproducible local run path.
4. Implement and test the P0 path end-to-end: registration/login, publish, feed/filter/detail, like, and comment.
5. Add P1 profile/password and owner edit/delete flows without displacing P0 acceptance coverage.
6. Verify security, content validation, responsive behavior, and release operations against the validation evidence in this stage.

## 17. Status and Next Actions

- **Status:** `READY_FOR_REVIEW`
- **Next stage:** P06 - Implementation
- **Before implementation:** Review ADR-002 and confirm the stack; settle the explicitly listed API/product ambiguities; select a hosting target before deployment.
- **Scope guard:** Any addition of voice, OMR, images, audio, roles, account recovery, advanced ABC, extra sorting, or comment management requires an approved scope change and traceability update.
