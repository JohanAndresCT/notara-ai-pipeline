# P09 Documentation Validation Report

## 1. Validation Metadata

- Validator: P09 Documentation Validator
- Project: Notara
- Documentation Report Version: `DOCUMENTATION_REPORT.md` (estado `READY_WITH_ASSUMPTIONS`, discrepancias `P09-DISC-001..012`)
- Validation Date: 2026-10-14
- Implementation Reference: commit `cbde967` (rama `Arch-Front-end`, ya integrada en `main` por el PR #10)
- Upstream Validation Status: P06 `READY_WITH_ASSUMPTIONS`; P07 `PASS_WITH_WARNINGS`; P08 `DEPLOYED_AND_VERIFIED` (alcance limitado)
- Execution Performed: PARTIAL
- Overall Result: PASS_WITH_WARNINGS

## 2. Executive Summary

La documentación describe el producto real (Django + DRF/JsonResponse, React/Vite, PostgreSQL, Railway) y las afirmaciones técnicas auditadas coinciden con el código. No se detectaron secretos, funcionalidades inventadas ni funcionalidades Future/Out of Scope presentadas como disponibles. Las diferencias entre artefactos y código (foto de perfil, `/api` frente a `/api/v1`, reacciones frente a likes) están registradas como discrepancias.

Hay dos hallazgos MEDIUM: el README no sigue el orden de secciones exigido por el prompt de generación (VAL-001) y los archivos de MkDocs añadidos a petición del usuario no están registrados en `PROMPT_LOG.md` ni en el reporte (VAL-002). No hay hallazgos CRITICAL ni HIGH.

## 3. Validation Environment and Limitations

- Windows, Python 3.13.14 (CI usa 3.12), Node 22.19.0 local (CI usa 24). pnpm no está instalado localmente.
- Ejecutado: `manage.py check` (sin incidencias) y `manage.py test accounts scores` con SQLite temporal (88 tests detectados y ejecutados; la base temporal se eliminó). No se usó `db.sqlite3`.
- No ejecutado: `pnpm` (frontend, build, E2E), PostgreSQL local, Docker, Railway, logs de GitHub Actions. `mkdocs build --strict` no se repitió; el sitio publicado responde HTTP 200 en `https://johanandresct.github.io/notara-ai-pipeline/`.
- Verificación remota: solo metadatos públicos de GitHub Actions y códigos HTTP; sin credenciales.
- Los artefactos del pipeline viven en `ai-pipeline/artifacts/`; `ai-pipeline/outputs/` no existe.

## 4. Structural Validation

| Document | Required | Present | Valid | Notes |
|---|---|---|---|---|
| README.md | Sí | Sí | Parcial | Contenido correcto; orden de secciones distinto al exigido (VAL-001) |
| docs/SETUP.md | Sí | Sí | Sí | Variables y comandos coinciden con `settings.py`, `entrypoint.sh`, `.env.example` |
| docs/ARCHITECTURE.md | Sí | Sí | Sí | No hay `corsheaders` en el código, coherente con "sin CORS" |
| docs/API.md | Sí | Sí | Sí | Vistas y `@csrf_exempt` verificados en `scores/views.py` |
| docs/DATA_MODEL.md | Sí | Sí | Sí | `photo` ImageField y migraciones 0001–0003 verificadas |
| docs/USER_GUIDE.md | Sí | Sí | Sí | Sin control de foto en `frontend/src` |
| docs/TESTING.md | Sí | Sí | Sí | Tres líneas `# ` son comentarios dentro de bloques de código, no títulos H1 |
| docs/REQUIREMENTS_COVERAGE.md | Sí | Sí | Sí | Estados coherentes con el reporte |
| docs/KNOWN_LIMITATIONS.md | Sí | Sí | Sí | Discrepancias alineadas con el reporte |
| DOCUMENTATION_REPORT.md | Sí | Sí | Sí | 15 secciones más Generation Metadata |

Enlaces relativos en README y `docs/`: todos resuelven. Cada archivo de `mkdocs.yml` (nav) existe. Cada documento tiene un único título H1.

## 5. Findings

| ID | Severity | Category | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|
| VAL-001 | MEDIUM | Estructura | El README no sigue las 15 secciones en el orden de P09 §7.2. "Estado del proyecto" va primero. No existen secciones separadas de Propósito y problema, Prerrequisitos, Configuración ni Visión de uso. "Documentación" va después de "Despliegue". "Pipeline de IA" no se presenta como Pipeline Traceability. | Encabezados `##` de `README.md`: Estado, Funcionalidades, Tecnologías, Inicio rápido, Estructura, Pruebas, Despliegue, Documentación, Alcance y limitaciones, Pipeline de IA, Equipo, Licencia | Reordenar o añadir las secciones y revalidar. El contenido existente es correcto. |
| VAL-002 | MEDIUM | Etapa/Trazabilidad | `mkdocs.yml`, `docs/index.md`, `requirements-docs.txt` y `.github/workflows/docs.yml` se añadieron tras la generación por petición explícita del usuario y entraron en el commit `cbde967`. `PROMPT_LOG.md` y el reporte no los mencionan. | `git show --stat cbde967` | Registrar la adición como decisión del usuario fuera del alcance original de P09. |
| VAL-003 | LOW | Reproducibilidad | Los documentos fijan versiones de Python y Node del CI y de Docker (3.12 y 24). El `.mise.toml` y `docker-compose.yml` usan otras (Node 22/pnpm 10, `node:20-alpine`). Esto está descrito, pero el lector no ve cuál es la autoritativa para desarrollo local. | `ci.yml` L47/L80, `Dockerfile`, `docker-compose.yml` | Indicar la versión recomendada para desarrollo local. |

## 6. Claim Accuracy Audit

### Coverage

Se auditaron comandos, variables de entorno, rutas, vistas, campos de modelo, versiones, escenarios E2E, jobs de CI, URL de despliegue y afirmaciones sobre CORS, CSRF y foto de perfil. Quedan sin auditar: contenido de logs de CI, comportamiento de la UI en navegador, persistencia de volúmenes en Railway.

### Results

| ID | Claim | Location | Verified Against | Classification | Result |
|---|---|---|---|---|---|
| CLM-001 | 88 tests backend OK | README, TESTING | Ejecución independiente (88 tests) | CONSISTENT | OK |
| CLM-002 | Variables `DJANGO_*`, `POSTGRES_*`, `SQLITE_DB_PATH`, `MEDIA_ROOT`, `PROFILE_PHOTO_MAX_BYTES` | SETUP | `settings.py`, `entrypoint.sh` | CONSISTENT | OK |
| CLM-003 | `VITE_API_BASE_URL` sin uso | SETUP, KNOWN_LIMITATIONS | `git grep`: solo `.env.example` | CONSISTENT | OK |
| CLM-004 | Vistas con `@csrf_exempt`; legacy de comentarios; `like` PUT/DELETE | API | `scores/views.py` L219–325 | CONSISTENT | OK |
| CLM-005 | Sin CORS | ARCHITECTURE | Sin `corsheaders` en backend ni frontend | CONSISTENT | OK |
| CLM-006 | Jobs `backend`, `frontend`, `e2e`, `deploy-railway`; Postgres 16 | SETUP, TESTING | `ci.yml` | CONSISTENT | OK |
| CLM-007 | Deploy solo con `RAILWAY_DEPLOY_ENABLED`, rama de producción y secreto | SETUP | `ci.yml` L160–166 | CONSISTENT | OK |
| CLM-008 | 5 escenarios E2E | TESTING | `notara-e2e.spec.ts`: 5 `test(...)` con los mismos nombres | CONSISTENT | OK |
| CLM-009 | Foto de perfil solo vía API | USER_GUIDE, API | Modelo y tests de `/api/v1/me/photo/`; sin input de archivo en `frontend/src` | CONSISTENT | OK |
| CLM-010 | Puertos E2E 18237/15173, `retries: 0` | TESTING | `playwright.config.ts` | CONSISTENT | OK |
| CLM-011 | Playwright 1.64.0 (P07) | Artefactos P07 | `package.json` declara `^1.50.1` | UNVERIFIABLE | Sin lockfile instalado; no documentado como hecho en docs |

## 7. Setup and Run Reproducibility

| Step | Documented Instruction | Method | Outcome | Cause if Failed | Result |
|---|---|---|---|---|---|
| 1 | `python backend\manage.py check` desde la raíz | Ejecutado | Sin incidencias | — | PASS |
| 2 | `python backend\manage.py test accounts scores` | Ejecutado con SQLite temporal | 88 tests | — | PASS |
| 3 | `python backend\manage.py migrate` / `runserver` | Solo lectura | Rutas y variables existen | No ejecutado | UNVERIFIABLE |
| 4 | `pnpm install` / `pnpm dev` / `pnpm build` | Lectura de `package.json` | Scripts existen; pnpm no está instalado | No ejecutado | UNVERIFIABLE |
| 5 | Docker/Compose | Lectura | Servicios coherentes con lo documentado | No ejecutado | UNVERIFIABLE |

## 8. Capability and Status Audit

| Capability | Source | Documented Status | Actual Status | Evidence | Classification | Result |
|---|---|---|---|---|---|---|
| MVP-001, 002, 004, 006, 007, 008 | P02 | Implementados | Implementados | Vistas, tests y E2E | STATUS_CORRECT | OK |
| MVP-003 Perfil | P02 | PARTIAL | PARTIAL | Edición de perfil y contraseña; foto solo en API | STATUS_CORRECT | OK |
| MVP-005, 009, 010 | P02 | Diferencias por decidir | Diferencias por decidir | Reacciones/likes y borrado de comentarios | STATUS_CORRECT | OK |
| Despliegue en Railway | P08 | `DEPLOYED` | URL responde 200; CI de despliegue exitoso | Metadatos de Actions y comprobación HTTP | STATUS_CORRECT | OK, alcance limitado |

## 9. Scope Fidelity Audit

Ninguna capacidad Future/OOS (voz, OMR, imágenes, audio, roles) se presenta como disponible. La foto de perfil se documenta como solo API y vinculada a `OOS-003` mediante `P09-DISC-003`.

## 10. Discrepancy Audit

| Discrepancy | Type | Artifact Source | Code Evidence | Classification | Result |
|---|---|---|---|---|---|
| P09-DISC-003 | UNSPECIFIED_BEHAVIOR | OOS-003 | Modelo, endpoint y tests de foto | REPORTED | OK |
| P09-DISC-008 | ARTIFACT_CONFLICT | P08 `NOT_DEPLOYED` frente a URL activa | URL 200; P08 reconciliado | REPORTED | OK |
| P09-DISC-012 | UNKNOWN | `.env.example` | `VITE_API_BASE_URL` sin uso | REPORTED | OK |
| Rutas `/api` y `/api/v1`; reacciones y likes | CODE_ARTIFACT_MISMATCH | P05/P06 | `urls.py`, `scores/views.py` | REPORTED | OK |
| Panel `/admin/login/` expuesto | Observación de P08 | `P08-VAL-006` | Responde 200 | Fuera del alcance de docs | Ver §18 |

No se detectaron discrepancias `NOT_REPORTED` ni `FALSELY_REPORTED` en lo auditado.

## 11. Fabrication Audit

> No fabricated or unsupported content detected.

## 12. Sensitive Information Audit

> No sensitive information detected in the documentation.

Las menciones de `RAILWAY_TOKEN` y de las variables `RAILWAY_*` son solo nombres de configuración, sin valores. No hay IDs de Railway ni tokens.

## 13. Test, CI, and Deployment Claims Audit

| Claim | Location | Source of Evidence | Result |
|---|---|---|---|
| Backend 88/88 OK en SQLite | README, TESTING | Ejecución independiente | Verificado |
| E2E 5/5 en SQLite (P07) | README, TESTING | `TEST_VALIDATION`; no reejecutado | Declarado como no reejecutado; aceptable |
| E2E en CI falló en la ejecución #15 y pasó en #14 | TESTING | Metadatos públicos de Actions | Declarado con causa `UNKNOWN` |
| Desplegado en `https://notara-production.up.railway.app` el 2026-10-14 | README | Comprobación HTTP 200 en `/api/health/`; P08 `DEPLOYED_AND_VERIFIED` | Verificado, alcance limitado |
| Sitio MkDocs publicado | `docs/index.md` | HTTP 200 en la URL de GitHub Pages | Verificado |

## 14. Documentation Report Audit

El reporte contiene las 15 secciones y Generation Metadata. Sus entradas de verificación coinciden con lo reproducido (88 tests, `check`). El reporte no menciona los archivos de MkDocs (VAL-002).

## 15. Out-of-Stage Content Audit

El commit `cbde967` contiene, además de la documentación, los artefactos P08 reconciliados (actualización autorizada por el usuario tras aportar evidencia de despliegue), los prompts P09 y los archivos de MkDocs/Pages (VAL-002). Esta etapa no modificó código fuente de backend ni frontend, ni migraciones. `.github/workflows/docs.yml`, `mkdocs.yml` y `requirements-docs.txt` son configuración nueva pedida de forma explícita por el usuario; se tratan como adición autorizada, no como violación, pero deben quedar registrados.

## 16. Traceability Audit

| Documentation Element | Expected Source | Classification | Result |
|---|---|---|---|
| Descripción y propósito | P00/P01 | DIRECT_FROM_ARTIFACT | OK |
| Funcionalidades | Código y P02 | DIRECT_FROM_CODE | OK |
| Stack | Manifiestos | DIRECT_FROM_CODE | OK |
| Instalación y ejecución | Scripts y configuración | DIRECT_FROM_CODE | OK |
| Variables de configuración | `.env.example`, `settings.py` | DIRECT_FROM_CODE | OK |
| Arquitectura | Código y P05 | REFINED | OK |
| API | `urls.py`, vistas | DIRECT_FROM_CODE | OK |
| Modelo de datos | `models.py`, migraciones | DIRECT_FROM_CODE | OK |
| Guía de usuario | Frontend y P04 | DIRECT_FROM_CODE | OK |
| Pruebas | Tests y P07 | DIRECT_FROM_CODE | OK |
| CI y despliegue | `ci.yml`, Docker, P08 | DIRECT_FROM_CODE | OK |
| Cobertura de requisitos | P02/P03 y código | REFINED | OK |
| Limitaciones | Discrepancias y OOS | DIRECT_FROM_ARTIFACT | OK |

## 17. Usability Observations

- El README tiene el estado al inicio, útil para leer rápido, pero no sigue la plantilla (VAL-001).
- Los comandos usan rutas de Windows (`backend\manage.py`); un usuario de Linux o macOS debe adaptarlos.
- Hay dos lockfiles rastreados (`package-lock.json` y `pnpm-lock.yaml`); los docs usan pnpm.

## 18. Observations Outside Documentation Scope

- Varias vistas de `scores` usan `@csrf_exempt` (riesgo de seguridad de la implementación).
- `/admin/login/` responde 200 de forma pública en producción (`P08-VAL-006`).
- El job E2E falló una vez en CI con causa desconocida (`P08-VAL-005`).
- No existe archivo `LICENSE`.
- El warning CSS de `@tailwind utilities` en `vite build`.

## 19. Recommended Corrections

1. VAL-001: alinear el README con las 15 secciones de P09 §7.2.
2. VAL-002: registrar en `PROMPT_LOG.md` (o en el reporte) la incorporación de MkDocs y GitHub Pages por petición del usuario.
3. VAL-003: indicar la versión de desarrollo local recomendada.

## 20. Final Decision

**Result:** PASS_WITH_WARNINGS

**Documentation matches implementation:** YES

### Conditions to Proceed

Se puede pasar a P10. Los dos hallazgos MEDIUM son estructurales y de trazabilidad, no de exactitud.

### Conditions to Revalidate

Revalidar solo si se corrige el README (VAL-001) o se modifica de forma material cualquier documento en `docs/`.

## 21. Validator Integrity Statement

No se reescribió documentación; no se modificó código fuente ni artefactos previos; no se tomaron decisiones de producto o técnicas; no se corrigió ningún defecto de implementación. Los hallazgos se basan en evidencia y las limitaciones del entorno de validación se describen en la sección 3. La ejecución creó una base SQLite temporal que se eliminó.
