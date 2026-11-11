# Validación final de pruebas - P07

| Check / Test ID | Command and working directory | Database/runtime | Exit code | Discovered/executed count | Result | Evidence |
|---|---|---|---:|---:|---|---|
| `DJK-BASE-01` | Root: `$env:DJANGO_DB_ENGINE = "sqlite"; python backend/manage.py test accounts scores --verbosity 1` | Django 5.2.1, SQLite test DB | 0 | 86/86 | PASS (baseline) | `Ran 86 tests in 102.260s`; `OK`. Conservadas después del fix. |
| `DJK-204-REG-01` | Root: `python backend/manage.py test scores.tests.ScoreDeleteTests.test_delete_204_response_has_no_body scores.tests.ScoreCommentTests.test_delete_204_response_has_no_body --verbosity 1` con `DJANGO_DB_ENGINE=sqlite` y `SQLITE_DB_PATH` temporal único | Django 5.2.1, SQLite test DB | 0 | 2/2 | PASS | `Ran 2 tests in 2.471s`; ambos responses 204 sin body. |
| `DJK-FIX-01` | Root: `python backend/manage.py test accounts scores --verbosity 1` con `DJANGO_DB_ENGINE=sqlite` y `SQLITE_DB_PATH` temporal único | Django 5.2.1, SQLite test DB | 0 | 88/88 | PASS | `Found 88 test(s)`; `Ran 88 tests in 80.266s`; `OK`. Incluye las 86 existentes y 2 regresiones. |
| `E2E-UI-04-BEFORE` | `frontend/`: `npm run test:e2e -- --reporter=line` | Chromium 156, Django/Vite reales, SQLite temporal | 1 | 5 casos: 4 PASS, 1 FAIL | FAIL (histórico) | `204 2` y error de proxy Vite; detalle preservado en `BUG_FIX_REPORT.md`. El rerun final regeneró `frontend/test-results/`, por lo que el trace binario inicial ya no está ahí. |
| `E2E-UI-04-REG` | `frontend/`: `npm run test:e2e -- --grep "eliminación" --reporter=line` | Chromium 156, puertos E2E 18237/15173, SQLite temporal por proceso | 0 | 1/1 | PASS | Django registra `DELETE /api/v1/scores/1/` como `204 0`; UI regresa al feed. |
| `E2E-UI-01..05` | `frontend/`: `corepack.cmd pnpm test:e2e -- --reporter=line` | Node 24.21.0, pnpm 12.11.2, Playwright 1.64.0, Chromium 156; Django/Vite iniciados por Playwright; SQLite temporal por proceso | 0 | 5/5 (22.9 s) | PASS | Registro/login/logout y acceso anónimo; publicación/detalle/reacción; edición; eliminación; ruta protegida. Sin mocks. |
| `E2E-TYPE-01` | `frontend/`: `corepack.cmd pnpm exec tsc --noEmit --strict --skipLibCheck --moduleResolution bundler --module esnext --target es2020 --types node playwright.config.ts e2e/notara-e2e.spec.ts` | TypeScript 5.9.3 vía pnpm | 0 | Config + suite E2E | PASS | Typecheck estricto final, sin errores. |
| `FE-BUILD-01` | `frontend/`: `npm run build` | Vite 8.3.4 | 0 | Build completado | PASS_WITH_WARNINGS | Build correcto; Lightning CSS advierte reglas Tailwind `@theme`/`@tailwind` no reconocidas durante minificación. |
| `PG-ENV-01` | No ejecutado | PostgreSQL | N/A | 0 | NOT_RUN | La ejecución SQLite no se presenta como evidencia PostgreSQL. |

## 1. Información operativa

- Backend: Django 5.2.1 + DRF 3.15.2. Cada ejecución backend usa una ruta SQLite temporal; Django crea y destruye su propia test DB.
- Frontend: Vite 8.3.4 + React 19; navegador Chromium 156 con Playwright 1.64.0.
- La suite automatizada no usa mocks de API; ejercita UI y backend reales. Las pruebas usan contextos aislados y datos únicos.
- Gestor elegido: pnpm 12.11.2. El manifiesto `frontend/package.json` declara `@playwright/test`; `frontend/pnpm-lock.yaml` lo resuelve a 1.64.0. No se cambió de gestor.

## 2. Comprobaciones pendientes / nulidades

- PostgreSQL no fue ejecutado; no hay afirmación de equivalencia ni de readiness PostgreSQL.
- No se implementó CI ni despliegue.
- Corrección verificada: ambos handlers DELETE usan `HttpResponse(status=204)` y responden con cero bytes. El historial del fallo anterior está preservado en `BUG_FIX_REPORT.md` y en `frontend/test-results/`.
- Discrepancia pendiente: existe borrado de comentarios en implementación aunque los requisitos excluyen esa API (`AC-028`). El cambio solo corrige el cuerpo 204 de la ruta existente; no decide el alcance del endpoint.

## 3. Estado final

- `Status`: `PASS_WITH_WARNINGS`
- Motivo: 88/88 backend y 5/5 E2E pasan en SQLite aislado. PostgreSQL sigue `NOT_RUN`

## Revalidación incremental (2026-11-11)

Esta ejecución revalida el código actual sin añadir ni modificar pruebas.

| Check / Test ID | Command and working directory | Database/runtime | Exit code | Discovered/executed count | Result | Evidence |
|---|---|---|---:|---:|---|---|
| `DJK-CURRENT-01` | Root: `.\.venv\Scripts\python.exe backend\manage.py test accounts scores voice --verbosity 1`; `DJANGO_DB_ENGINE=sqlite`, `SQLITE_DB_PATH` temporal en `%TEMP%` | Python 3.11.9, Django 5.2.18, DRF 3.15.2; SQLite test DB | 0 | 165/165 (164 passed, 1 skipped) | PASS_WITH_WARNINGS | `Ran 165 tests in 121.227s`; `OK (skipped=1)`. El único skip es la prueba de concurrencia que requiere PostgreSQL. |
| `DJK-CURRENT-CHECK` | Root: `.\.venv\Scripts\python.exe backend\manage.py check` | Mismo entorno/SQLite | 0 | Django system check | PASS | `System check identified no issues (0 silenced).` |
| `DJK-CURRENT-MIGRATIONS` | Root: `.\.venv\Scripts\python.exe backend\manage.py makemigrations --check --dry-run` | Mismo entorno/SQLite | 0 | Migration drift check | PASS | `No changes detected`. |
| `FE-CURRENT-TYPECHECK` | `frontend/`: `npm.cmd run typecheck` | Node 24.21.0; instalación local incompleta | 2 | TypeScript project | BLOCKED (environment) | No resuelve `@tensorflow/tfjs`, `tone` ni `@breezystack/lamejs`, aunque constan en `package.json` y `pnpm-lock.yaml`. No se instalaron paquetes ni se modificó el lockfile. |
| `E2E-CURRENT` | No ejecutado | Requiere restaurar dependencias frontend y arrancar frontend/backend aislados | N/A | N/A | NOT_RUN | Se conserva evidencia histórica E2E `5/5 PASS`; esta revalidación no la presenta como ejecución actual. |
| `FE-BUILD-CURRENT` | No ejecutado | `frontend/dist/` preexistente e ignorado por Git | N/A | N/A | NOT_RUN | No se sobrescribió la salida local existente. |

Resultado de la revalidación: `PASS_WITH_WARNINGS` para las pruebas backend y
checks de Django ejecutados; la validación frontend/E2E actual queda parcial
por dependencias locales ausentes. PostgreSQL continúa `NOT_RUN`.

## Reconciliación de alcance aprobado P02 v5.6 (2026-11-11)

**Resultado documental:** `PASS_WITH_WARNINGS` · **Resultado de ejecución:**
el estado registrado arriba permanece `PARTIAL`.

| Alcance | Evidencia actual | Estado de validación |
|---|---|---|
| CR-006 / US-011 AC-078–AC-081 | La revalidación backend existente ejecutó 165 tests; los tests del normalizador usan proveedor falso, según P06/CR-006. | Evidencia automatizada histórica/reproducida en P06, no aceptación de AC por Product Owner. |
| CR-006 / AC-082 | El corpus con y sin normalización requiere medición y reporte exacto. | `NOT_RUN`; no se hizo llamada real a Gemini. |
| CR-005 / US-020 AC-090–AC-096 | CR-005 contiene verificaciones locales históricas del MP3/DDSP, pero P07 no tiene reporte de validación de historia US-020. | `NOT_VALIDATED`; no se ha repetido browser/manual testing ni se ha afirmado aceptación. |
| CR-007 / US-021 AC-083–AC-089 | La suite backend registrada incluye tests de tutor con proveedor mock, y CR-007 conserva pruebas locales históricas de proveedor. | Parcial; falta reporte P06/P07 de aceptación por criterio y la verificación con micrófono real sigue pendiente. No se repitieron llamadas a Gemini. |
| Frontend y PostgreSQL | Typecheck actual bloqueado por dependencias; build/E2E actual y PostgreSQL no ejecutados, según P06. | `BLOCKED` / `NOT_RUN`, respectivamente. |

El proyecto lead confirmó el alcance; la fecha/acta formal de aprobación está
pendiente de documentación (Q-030), no es una condición para el registro de
las pruebas. No se modificaron pruebas ni código en esta reconciliación.


---

## Run 2 — MVP 2 (prompts P07 v2.0, 2026-11-11)

### Entorno

| Elemento | Valor |
|---|---|
| Rama / base | `pipeline/mvp2-p00-context`, HEAD `658f2e8` + cambios de prueba sin commit (`backend/voice/tests.py`, `frontend/e2e/notara-e2e.spec.ts`) |
| Python | 3.13.14 (venv `.venv`), Django 5.2 |
| Node / gestor | Node 22.19.0, pnpm 12.11.2 (`frontend/`, `pnpm install --frozen-lockfile`, dependencias instaladas) |
| Bases de datos | SQLite (temporal) y PostgreSQL 16 en contenedor local `notara-p07-pg` (puerto 55432) |
| Modelo Whisper | No requerido (`STT_MODEL_REQUIRED=false`); STT/TTS/Gemini sustituidos por fakes/mocks |
| Proveedores reales | No invocados por la suite automatizada (DEC-230, NFR-010) |
| Diferencias | CI usa PostgreSQL de servicio y fakes; Railway (volumen `/data`, HTTPS, claves) no ejecutado en esta corrida |

### Comandos y resultados

| # | Comando (desde) | Exit | Resultado | Clase |
|---|---|---|---|---|
| 1 | `pnpm exec tsc --noEmit` (`frontend/`) | 0 | 0 errores | AUTOMATED_EXECUTED |
| 2 | `pnpm exec vite build` (`frontend/`) | 0 | Build OK; TensorFlow.js en chunk diferido | AUTOMATED_EXECUTED |
| 3 | `DJANGO_DB_ENGINE=sqlite STT_MODEL_REQUIRED=false python manage.py test` (`backend/`) | 0 | **Ran 175, OK (skipped=2)** — las 2 omitidas son pruebas solo-PostgreSQL de `tests_migrations` | AUTOMATED_EXECUTED |
| 4 | `DJANGO_DB_ENGINE=postgresql POSTGRES_HOST=127.0.0.1 POSTGRES_PORT=55432 STT_MODEL_REQUIRED=false python manage.py test --noinput` | 0 | **Ran 175, OK** — incluye migraciones `scores.0006`, `voice.0002`, `voice.0003` | AUTOMATED_EXECUTED |
| 5 | `pnpm exec playwright test` (`frontend/`, backend y Vite locales) | 0 | **9 passed** (6 MVP 1 + 3 MVP 2) | AUTOMATED_EXECUTED |

Desglose backend por módulo: `voice/tests.py` 32, `voice/tests_tutor.py` 8, `scores/tests.py` 66, `scores/tests_mvp2.py` 26, `scores/tests_migrations.py` 7, `accounts/tests.py` 25, resto 11.

### Evidencia no automatizada

| Elemento | Clase |
|---|---|
| Dictado y tutor Live con voz sintetizada inyectada como micrófono (P06, CR-006/CR-007) | SIMULATED |
| Gemini/ElevenLabs reales en desarrollo local (CR-005..007) | USER_REPORTED / SIMULATED; no repetido |
| Micrófono real, escucha humana, corpus AC-070–AC-072/AC-082, Railway `/data` | NOT_RUN |

### Defectos

Ninguno confirmado en esta corrida (ver `BUG_FIX_REPORT.md`, Run 2).

### Estado

`PASS_WITH_WARNINGS` — todas las suites automatizadas pasan en SQLite y PostgreSQL; la aceptación manual MVP 2 (MAN-MVP2-01..06) sigue pendiente y bloquea declarar las HU como aceptadas por usuario.
