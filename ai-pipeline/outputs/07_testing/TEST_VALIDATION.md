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
