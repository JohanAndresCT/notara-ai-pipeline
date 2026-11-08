# Documentation Report

## 1. Document Metadata

- Version: 1.0
- Stage: P09 — Documentation
- Status: READY_WITH_ASSUMPTIONS
- Generated From: código de `backend/` y `frontend/`, `Dockerfile`, `deploy/`, `docker/`, `.github/workflows/ci.yml`, `.env.example`, artefactos P00–P08 en `ai-pipeline/artifacts/` (ubicación usada; la carpeta `ai-pipeline/outputs/` no existe) y verificaciones locales de esta etapa.
- Validation Dependency: P00 PASS_WITH_WARNINGS, P01–P04 PASS, P05 PASS_WITH_WARNINGS, P06 `IMPLEMENTATION_VALIDATION` READY_WITH_ASSUMPTIONS, P07 `TEST_VALIDATION` PASS_WITH_WARNINGS, P08 `CICD_VALIDATION` actualizado a `DEPLOYED_AND_VERIFIED` con alcance limitado.
- Implementation Reference: commit `54a26f5` ("Fixes to front") en la rama `Arch-Front-end`, con árbol de trabajo modificado (prompts P08/P09 y artefactos P08). El despliegue en Railway se realizó desde otros commits de `pruebas-despliegue` (`430dfad`, `3ce012f`), por lo que el código desplegado puede diferir del inspeccionado (`UNKNOWN`).

## 2. Documentation Summary

Se generaron `README.md` (reescrito) y ocho documentos en `docs/`, en español, basados en el código inspeccionado. Setup y uso principal quedan documentados con evidencia. Las pruebas backend (88/88), `check`, `makemigrations --check`, `tsc --noEmit` y `vite build` se ejecutaron en esta etapa con SQLite y Python 3.13.14. No se ejecutaron Playwright, Docker ni Compose; sus resultados se citan de P07 y de metadatos de CI. El despliegue figura como `DEPLOYED` por evidencia: URL pública con `/api/health/` 200 observado el 2026-10-14, y jobs de despliegue exitosos en CI. Se registran 12 discrepancias, varias con decisión pendiente.

## 3. Documentation Inventory

| ID | File | Purpose | Primary Sources | Status |
|---|---|---|---|---|
| P09-DOC-001 | `README.md` | Punto de entrada | Todas | COMPLETE |
| P09-DOC-002 | `docs/SETUP.md` | Instalación, variables, despliegue | `settings.py`, `.env.example`, `Dockerfile`, `ci.yml`, `package.json` | PARTIAL |
| P09-DOC-003 | `docs/ARCHITECTURE.md` | Arquitectura real | `urls.py`, `Dockerfile`, `nginx.conf.template`, `App.tsx` | COMPLETE |
| P09-DOC-004 | `docs/API.md` | Endpoints | `urls.py`, `views.py` de ambas apps | COMPLETE |
| P09-DOC-005 | `docs/DATA_MODEL.md` | Modelos y migraciones | `models.py`, `migrations/` | COMPLETE |
| P09-DOC-006 | `docs/USER_GUIDE.md` | Flujo de uso | Páginas de `frontend/src` | COMPLETE |
| P09-DOC-007 | `docs/TESTING.md` | Pruebas y CI | `tests.py`, E2E, `playwright.config.ts`, P07, metadatos de CI | PARTIAL |
| P09-DOC-008 | `docs/REQUIREMENTS_COVERAGE.md` | Trazabilidad | P00, P02, P06, código | COMPLETE |
| P09-DOC-009 | `docs/KNOWN_LIMITATIONS.md` | Límites y discrepancias | P03, P08, código | COMPLETE |

`SETUP.md` y `TESTING.md` son PARTIAL porque Compose, `pnpm install` local y Playwright no se ejecutaron en P09.

## 4. Implementation Evidence Summary

| Area | Evidence Examined | Notes |
|---|---|---|
| Backend | `settings.py`, `urls.py`, `accounts/{models,views}.py`, `scores/{models,views}.py`, migraciones | Las vistas usan `JsonResponse`; DRF solo está configurado en settings |
| Frontend | `App.tsx`, `HomePage`, `ScoreDetailPage`, `ScoreEditPage`, `ProfilePage`, `RegistrationPage`, `AppShell`, `lib/api.ts` | Enrutado propio; no se encontró subida de foto en la interfaz |
| Pruebas | `accounts/tests.py` (25), `scores/tests.py` (63), `e2e/notara-e2e.spec.ts` (5) | Backend ejecutado en P09 |
| Despliegue | `Dockerfile`, `entrypoint.sh`, `nginx.conf.template`, `ci.yml`, `.railwayignore` | URL pública consultada con GET de solo lectura |
| Artefactos | P00–P08 | P08 reconciliado antes de P09 |

## 5. Capability Coverage

| ID | Capability | Source | Implementation Status | Evidence | Documented In |
|---|---|---|---|---|---|
| P09-COV-001 | Registro | MVP-001 | IMPLEMENTED | `register_view`, tests, E2E | `REQUIREMENTS_COVERAGE.md`, `API.md`, `USER_GUIDE.md` |
| P09-COV-002 | Login y logout | MVP-002 | IMPLEMENTED | `login_view`, `logout_view` | ídem |
| P09-COV-003 | Perfil y contraseña | MVP-003 | PARTIAL | `ProfilePage.tsx`, `current_user_view`; foto solo en API | ídem |
| P09-COV-004 | Publicar | MVP-004 | IMPLEMENTED | `scores_view`, tests | ídem |
| P09-COV-005 | Editar | MVP-005 | PARTIAL | UI sin contenido ni formato | ídem |
| P09-COV-006 | Eliminar | MVP-006 | IMPLEMENTED | DELETE, E2E 4 | ídem |
| P09-COV-007 | Panel y filtro | MVP-007 | IMPLEMENTED | `HomePage.tsx`, tests de feed | ídem |
| P09-COV-008 | Feed y detalle | MVP-008 | IMPLEMENTED | `ScoreDetailPage.tsx` | ídem |
| P09-COV-009 | Reacciones | MVP-009 | PARTIAL | permite reaccionar a lo propio | ídem |
| P09-COV-010 | Comentarios | MVP-010 | PARTIAL | permite comentar lo propio; borrado propio | ídem |

## 6. Verification Log

| ID | Statement or Instruction | Location | Method | Level | Result |
|---|---|---|---|---|---|
| P09-VERIFY-001 | 88 pruebas backend pasan | `TESTING.md`, `README.md` | `python backend\manage.py test accounts scores` con SQLite | VERIFIED_BY_EXECUTION | OK, 81 s, Python 3.13.14 |
| P09-VERIFY-002 | `check` sin problemas | `TESTING.md` | `manage.py check` | VERIFIED_BY_EXECUTION | OK |
| P09-VERIFY-003 | Sin migraciones pendientes | `DATA_MODEL.md` | `makemigrations --check --dry-run` | VERIFIED_BY_EXECUTION | Sin cambios |
| P09-VERIFY-004 | `pnpm typecheck` equivale a `tsc --noEmit` | `SETUP.md` | Script leído; `npx tsc --noEmit` ejecutado | VERIFIED_BY_EXECUTION | Exit 0 (con npx, no con pnpm) |
| P09-VERIFY-005 | `pnpm build` equivale a `vite build` | `SETUP.md` | Script leído; `npx vite build` ejecutado | VERIFIED_BY_EXECUTION | Exit 0, advertencia CSS |
| P09-VERIFY-006 | Playwright 5/5 | `TESTING.md` | Cita de `TEST_VALIDATION.md` | VERIFIED_BY_INSPECTION | No reejecutado en P09 |
| P09-VERIFY-007 | `pnpm install`, `pnpm dev`, `pnpm test:e2e` | `SETUP.md` | Scripts leídos en `package.json`; pnpm no está instalado localmente | VERIFIED_BY_INSPECTION | No ejecutados |
| P09-VERIFY-008 | `docker compose up` | `SETUP.md` | `docker-compose.yml` leído | VERIFIED_BY_INSPECTION | No ejecutado |
| P09-VERIFY-009 | Variables de entorno | `SETUP.md` | Lectura de `settings.py`, `.env.example`, `entrypoint.sh` | VERIFIED_BY_INSPECTION | Solo nombres |
| P09-VERIFY-010 | Rutas y métodos HTTP | `API.md` | Lectura de `urls.py` y vistas | VERIFIED_BY_INSPECTION | Coincide |
| P09-VERIFY-011 | Despliegue activo en la URL pública | `README.md`, `SETUP.md` | GET `/api/health/` y `/api/v1/health/` (2026-10-14) | VERIFIED_BY_EXECUTION | 200 en ambos |
| P09-VERIFY-012 | Jobs de CI y despliegue exitosos | `TESTING.md`, `SETUP.md` | API pública de GitHub Actions (solo metadatos) | VERIFIED_BY_EXECUTION | Runs #7 y #16 exitosos; #15 con E2E fallido |
| P09-VERIFY-013 | Volumen, backups, rollback, redirección HTTP→HTTPS | `SETUP.md`, `KNOWN_LIMITATIONS.md` | — | UNVERIFIED | Marcados como pendientes |
| P09-VERIFY-014 | Verificación manual de registro, login, partituras y foto en producción | — | Reporte del equipo | UNVERIFIED | `USER_REPORTED`; la foto no tiene UI (`P09-DISC-003`) |

## 7. Discrepancies

| ID | Type | Description | Artifact Source | Code Evidence | Documentation Treatment | Decision Required |
|---|---|---|---|---|---|---|
| P09-DISC-001 | ARTIFACT_CONFLICT | Rutas `/api/` y `/api/v1/` coexisten y el frontend usa ambas | `IMPLEMENTATION_VALIDATION`: todas usan `/api/v1/` | `urls.py`, `lib/api.ts` | Ambas documentadas en `API.md` | Sí |
| P09-DISC-002 | IMPLEMENTATION_DEVIATION | `Reaction` y `Like` duplican la función | P02 FR-015 (un solo like) | `scores/models.py` | `DATA_MODEL.md` | Sí |
| P09-DISC-003 | UNSPECIFIED_BEHAVIOR | La API admite foto de perfil; OOS-003 excluye imágenes; la UI no la expone | P03 OOS-003, `US-003_*` | `accounts/views.py`, `ProfilePage.tsx` | Documentada como solo API | Sí |
| P09-DISC-004 | PARTIAL_IMPLEMENTATION | La edición de UI omite contenido y formato | FR-010 | `ScoreEditPage.tsx` vs PATCH | `USER_GUIDE.md` | Sí |
| P09-DISC-005 | ARTIFACT_CONFLICT | Versiones de Node y pnpm discrepan; Compose usa npm; ambos lockfiles versionados | — | `.mise.toml`, `package.json`, `Dockerfile`, `docker-compose.yml` | `SETUP.md` | Sí |
| P09-DISC-006 | IMPLEMENTATION_DEVIATION | Se puede reaccionar y comentar la propia partitura | FR-015, FR-016 | test `test_author_can_react_to_own_score` | `REQUIREMENTS_COVERAGE.md` | Sí |
| P09-DISC-007 | IMPLEMENTATION_DEVIATION | Vistas de `scores` con `@csrf_exempt` y sesión | NFR-003 | `scores/views.py` | `API.md`, `KNOWN_LIMITATIONS.md` | Sí |
| P09-DISC-008 | ARTIFACT_CONFLICT | P08 decía `NOT_DEPLOYED` y hay evidencia de despliegue | `CICD_VALIDATION.md` (histórico) | Health 200, CI | Resuelto en P08; README usa `DEPLOYED` | No |
| P09-DISC-009 | UNKNOWN | Artefactos citan `ai-pipeline/outputs/` y la carpeta no existe | Artefactos P00–P08 | `ai-pipeline/` | No se citó `outputs/` | No |
| P09-DISC-010 | IMPLEMENTATION_DEVIATION | Existe borrado de comentarios | `AC-028` | `score_comment_detail_view` | `KNOWN_LIMITATIONS.md` | Sí |
| P09-DISC-011 | UNKNOWN | US-005, 006, 009, 010 sin validación individual | P06 | `06_implementation/` | `REQUIREMENTS_COVERAGE.md` | No |
| P09-DISC-012 | UNKNOWN | `VITE_API_BASE_URL` sin uso en el código | `.env.example` | búsqueda en `frontend/src` | `SETUP.md` | No |

## 8. Known Limitations

| ID | Limitation | Origin | Documented In |
|---|---|---|---|
| P09-LIMIT-001 | Voz, OMR, imágenes, audio y roles fuera del MVP | P00/P03 | `KNOWN_LIMITATIONS.md` |
| P09-LIMIT-002 | Sin renderizado de notación | P05 / código | `README.md`, `KNOWN_LIMITATIONS.md` |
| P09-LIMIT-003 | Pendientes de despliegue (volumen, backup, rollback, environment, HTTPS) | P08 | `KNOWN_LIMITATIONS.md`, `SETUP.md` |
| P09-LIMIT-004 | E2E intermitente o inestable (`P08-VAL-005`) | CI | `TESTING.md` |
| P09-LIMIT-005 | Sin PostgreSQL local, rendimiento, accesibilidad ni pruebas unitarias del frontend | P07 | `TESTING.md` |

## 9. Documentation Gaps

| ID | Gap | Reason | Impact |
|---|---|---|---|
| P09-GAP-001 | Compose, `pnpm install` y Playwright sin ejecutar | Fuera del alcance seguro de P09 | Comandos solo inspeccionados |
| P09-GAP-002 | Código exacto desplegado desconocido | Commits desplegados distintos del inspeccionado | La URL pública puede diferir del código documentado |
| P09-GAP-003 | Sin documento de contribución ni licencia | No existen `CONTRIBUTING` ni `LICENSE` | README indica licencia no definida |
| P09-GAP-004 | NFR-002 sin evidencia de navegadores | Sin validación automática | Cobertura `UNKNOWN` |

## 10. Documentation Assumptions

| ID | Assumption | Impact | Validation Needed |
|---|---|---|---|
| P09-ASSUMPTION-001 | `backend/requirements.txt` instala las dependencias correctas con Python 3.12 | Setup local | Ejecutar instalación limpia |
| P09-ASSUMPTION-002 | El estado de despliegue se aplica a la URL indicada | README | Confirmar commit desplegado |
| P09-ASSUMPTION-003 | Los resultados de CI de los metadatos reflejan los pasos descritos | `TESTING.md` | Auditar logs |

## 11. Open Questions

| ID | Question | Affected Area | Priority |
|---|---|---|---|
| P09-QUESTION-001 | ¿Se mantiene la foto de perfil dentro del MVP? | MVP-003, `OOS-003` | Alta |
| P09-QUESTION-002 | ¿Se retiran las rutas `/api/` heredadas y el modelo `Like`? | API, datos | Media |
| P09-QUESTION-003 | ¿Debe bloquearse reaccionar o comentar la propia partitura? | MVP-009, MVP-010 | Media |
| P09-QUESTION-004 | ¿Se eliminan los `@csrf_exempt` de `scores`? | Seguridad | Alta |
| P09-QUESTION-005 | ¿Cuál es el commit desplegado y la versión oficial de Node y pnpm? | Despliegue, tooling | Media |

## 12. Documentation Risks

| ID | Risk | Impact | Mitigation Consideration |
|---|---|---|---|
| P09-RISK-001 | La documentación se desactualiza al cambiar el código | Lectores siguen datos viejos | Revalidar con `P09_validation.md` y automatizar tras cada cambio |
| P09-RISK-002 | El despliegue refleja un commit distinto del documentado | Descripción incorrecta de la app pública | Confirmar el SHA desplegado |
| P09-RISK-003 | Falta de CSRF en rutas de escritura | Riesgo de seguridad | Decisión del equipo (`P09-DISC-007`) |

## 13. Scope Summary

### Do
Registro, login/logout, perfil (nombre, usuario, descripción, instrumento, contraseña), publicar ABC/texto, feed con filtro y paginación, detalle, editar (título, instrumento, descripción), eliminar, reacciones y comentarios.

### Documented as Partial
MVP-003 (foto sin UI y fuera de alcance), MVP-005 (UI), MVP-009 y MVP-010 (propia partitura, borrado de comentarios).

### Documented as Not Implemented
Renderizado de notación; edición de contenido y formato desde la UI; subida de foto desde la UI.

### Future and Out of Scope
FUT-001..003 y OOS-001..005.

### Pending Decisions
`P09-QUESTION-001..005`.

## 14. Traceability Summary

MVP-001..010 se trazan a código, pruebas y documentos en `REQUIREMENTS_COVERAGE.md`. Los FR-001..017 y NFR-001..003 se agrupan por historia. Las 12 discrepancias de la sección 7 están referenciadas en `docs/`.

## 15. Documentation Status

READY_WITH_ASSUMPTIONS

## Generation Metadata

Generated by: P09 — Documentation Prompt
Prompt Version: 1.0
Status: READY_WITH_ASSUMPTIONS
