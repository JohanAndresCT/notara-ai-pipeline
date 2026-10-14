# Cobertura de requisitos

Estado de los requisitos del MVP según el código y las pruebas actuales (verificación P09 sobre `54a26f5` en `Arch-Front-end`). Los IDs provienen de `ai-pipeline/artifacts/00_context/PROJECT_CONTEXT.md` y `02_requirements/REQUIREMENTS.md`.

Estados: `IMPLEMENTED`, `PARTIAL` (implementado con diferencias que requieren decisión), `NOT_IMPLEMENTED`, `UNKNOWN`.

## Historias MVP

| ID | Historia | Estado | Evidencia | Observaciones |
|---|---|---|---|---|
| MVP-001 | Registro (FR-001) | IMPLEMENTED | `register_view`, `RegistrationPage.tsx`, tests de `accounts`, E2E 1 | Nombre, correo y contraseña ≥8 |
| MVP-002 | Login y logout (FR-002, FR-017) | IMPLEMENTED | `login_view`, `logout_view`, `AppShell.tsx`, E2E 1 | |
| MVP-003 | Perfil y contraseña (FR-003, FR-004) | PARTIAL | `current_user_view`, `change_password_view`, `ProfilePage.tsx` | Nombre, usuario, descripción, instrumento y contraseña funcionan. La API además admite foto, aunque la interfaz no la ofrece y `OOS-003` excluye imágenes (`P09-DISC-003`) |
| MVP-004 | Publicar (FR-005..009) | IMPLEMENTED | `scores_view`, `ScoreCreatePage.tsx`, tests de `scores`, E2E 2 | ABC y texto; validación ABC y límite 1000 |
| MVP-005 | Editar (FR-010) | PARTIAL | `score_detail_view` (PATCH), `ScoreEditPage.tsx`, E2E 3 | La API edita todos los campos; la pantalla solo título, instrumento y descripción (`P09-DISC-004`) |
| MVP-006 | Eliminar (FR-011) | IMPLEMENTED | `score_detail_view` (DELETE), E2E 4, `BUG-P07-204-01` | Solo propietario |
| MVP-007 | Panel y filtro (FR-012, FR-013) | IMPLEMENTED | `HomePage.tsx`, parámetros `mine` e `instrument`, tests de feed | 10 por página, más reciente primero. Sin registro individual en P06 |
| MVP-008 | Feed y detalle (FR-014, NFR-001) | IMPLEMENTED | `ScoreDetailPage.tsx`, `ScoreCard` | Contenido en `<pre>`; distingue ABC y texto. Sin registro individual en P06 |
| MVP-009 | Reacciones (FR-015) | PARTIAL | `score_reaction_view`, test `test_author_can_react_to_own_score` | Se puede reaccionar a la propia partitura, mientras que FR-015 dice "otro usuario" (`P09-DISC-006`, ver KNOWN_LIMITATIONS). Conviven `Reaction` y `Like` |
| MVP-010 | Comentarios (FR-016) | PARTIAL | `score_comments_view`, `ScoreDetailPage.tsx` | No se encontró restricción contra comentar la propia partitura. Existe borrado de comentarios propios, aunque `AC-028` indica que no debe estar disponible en MVP 1 (`P09-DISC-006`, `P09-DISC-010`) |

## Requisitos no funcionales

| ID | Estado | Evidencia |
|---|---|---|
| NFR-001 Legibilidad | IMPLEMENTED | Líneas conservadas en `<pre>` y formato visible |
| NFR-002 Responsive 360/768/1280 | UNKNOWN | P06 reporta comprobaciones manuales de US-003 a 360 y 1280 px; no hay validación automática ni registro para Edge/Firefox |
| NFR-003 Seguridad | PARTIAL | Autenticación exigida y propiedad verificada; varias vistas de `scores` son `@csrf_exempt` (`P09-DISC-007`) |

## Trazabilidad con pruebas

Backend: 88 pruebas (`accounts` y `scores`). E2E: 5 escenarios que cubren MVP-001, 002, 004, 005, 006, 008 y el acceso anónimo (FR-017). Reacciones y comentarios se prueban solo en el backend y, según P07, en el E2E de publicación/detalle/reacción. Ver [TESTING.md](./TESTING.md).

## Validación de historias de P06

Existen validaciones individuales solo para US-001 a US-004. US-005, US-006, US-009 y US-010 tienen registro de implementación sin validación: su estado de validación es `UNKNOWN`.
