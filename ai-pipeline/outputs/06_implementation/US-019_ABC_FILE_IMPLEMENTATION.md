# P06.19 US-019 Load a Score from an `.abc` File — Implementation Record

## 1. Metadata

| Field | Value |
|---|---|
| Story | US-019 / HU19 — Load a score from an `.abc` file (CR-002) |
| Priority / SP | P1 / 2 SP — MVP Supporting |
| Story prompt | `ai-pipeline/prompts/06_implementation/P06.19_US-019_load_abc_file.md` |
| Generation prompt | `P06_implementation.md` v2.0 (story mode) |
| Contributor | TEAM-001 working session — branch `pipeline/mvp2-p00-context` (not yet committed at the time of this record) |
| Date | 2026-11-09 |
| Status | `IMPLEMENTED` (create page) |

## 2. Summary

"Crear partitura" has a **Cargar archivo .abc** button. The selected file is read in the browser, validated, and its text is placed in "Tu partitura" with its line breaks, selecting the ABC format. If the field already has content, the user is asked before replacing it. The file is never uploaded or stored; publication uses the existing validation.

## 3. Traceability

| Item | Implementation |
|---|---|
| AC-066 / FR-022 / M-14 | `AbcFileLoader.tsx` reads the file (UTF-8), normalizes BOM and CRLF; `ScoreCreatePage.insertAbc()` sets content, selects ABC, focuses the field |
| AC-067 / FR-023 / SCR-010 | Confirmation "¿Reemplazar el contenido actual por el del archivo?" when the field has content; cancel keeps it |
| AC-068 / FR-024 / M-08a-M-08d | Extension, empty/whitespace-only, invalid UTF-8 and >1,000 characters rejected; content unchanged |
| AC-069 / FR-025 / DEC-217 / DEC-218 | No network request for the file; publish uses the MVP 1 validation |

## 4. Implemented Components

| File | Change |
|---|---|
| `frontend/src/AbcFileLoader.tsx` | New file loader (REG-002) |
| `frontend/src/ScoreCreatePage.tsx` | Controlled content, insertion handler, character counter |
| `frontend/src/index.css` | Tool layout and success text styles |

## 5. API and Data Behavior

No API change. The file stays on the user's device; only the resulting text is sent when the user publishes.

## 6. Database and Migrations

None.

## 7. Verification Results

| Check | Result | Evidence |
|---|---|---|
| `tsc --noEmit` / `vite build` | PASS | 0 errors / built |
| `.txt` file | PASS | M-08a shown, content unchanged |
| Empty and whitespace-only `.abc` | PASS | M-08b, content unchanged |
| Invalid UTF-8 bytes | PASS | M-08c, content unchanged |
| >1,000 characters | PASS | M-08d, content unchanged |
| Valid `.abc` with CRLF | PASS | Inserted with `\n` line breaks, ABC selected, M-14 shown |
| Replace confirmation | PASS | Cancel keeps "Mi idea previa"; accept replaces it |
| Publish loaded content | PASS | Score "Escala cargada desde archivo" created with format `ABC` and the file content |
| 375 px layout | PASS | Button full width; no horizontal scroll |

## 8. Scope Boundary, Deviations and Open Items

- **Edit page not covered.** AC-066 mentions the edit page, but the delivered HU05 edit page does not edit content.
- **SCR-010** uses the browser's native confirmation, as the existing score-deletion flow does, rather than a styled modal.

## 9. Definition of Done

| Item | Status | Evidence / Remaining action |
|---|---|---|
| Load, validate and insert `.abc` | PASS | Browser checks above |
| Replace confirmation | PASS | Browser check |
| File not stored | PASS | Client-only implementation; no request for the file |
| Product Owner review | PENDING | — |

## 10. Final Status

`IMPLEMENTED` for the create page; the edit-page placement depends on a team decision.


## Addendum 2026-11-10 — edit page

`AbcFileLoader` is now also on `ScoreEditPage` (FR-022), with the same replace confirmation. Finding "edit page has no content editing" is resolved.
