# Pruebas

## Resumen

| Capa | Herramienta | Cantidad | Último resultado verificado |
|---|---|---:|---|
| Backend | Django `manage.py test` (`accounts/tests.py`, `scores/tests.py`) | 91 | 91 OK, SQLite, Python 3.12.3, Django 5.2.18 (2026-10-24, 49 s). En P09 eran 88 pruebas con Django 5.2.1; se agregaron 3 de consultas del feed |
| E2E | Playwright (`frontend/e2e/notara-e2e.spec.ts`) | 5 | 5/5 en SQLite en P07 (22.9 s); **no se reejecutó en P09** |
| Tipos | `tsc --noEmit` | n/a | Exit 0 (P09) |
| Build | `vite build` | n/a | Exit 0 (P09); advierte sobre `@tailwind utilities` en CSS |
| Chequeos Django | `check` y `makemigrations --check --dry-run` | n/a | Sin problemas ni cambios pendientes (P09) |

PostgreSQL local: `NOT_RUN` en P07. En CI el job `e2e` usa PostgreSQL 16 y salió exitoso en las ejecuciones #7 y #16 según los metadatos de GitHub Actions; no se auditaron sus logs ni se verificó el número de escenarios.

## Cómo ejecutarlas

```powershell
# Backend (raíz del repositorio)
$env:DJANGO_DB_ENGINE = "sqlite"
$env:SQLITE_DB_PATH = "$env:TEMP\notara-test.sqlite3"
python backend\manage.py test accounts scores

# Frontend (desde frontend/)
pnpm typecheck
pnpm build
pnpm test:e2e
```

La configuración E2E (`frontend/playwright.config.ts`) inicia Django en el puerto 18237 y Vite en 15173, usa SQLite temporal por defecto (o PostgreSQL), `retries: 0` y la variable `DJANGO_PYTHON` para elegir el intérprete.

## Escenarios E2E

1. Registro, login, logout y acceso anónimo.
2. Publicación, detalle y feed.
3. Edición.
4. Eliminación.
5. Publicación y acceso anónimo a ruta protegida.

Las pruebas usan UI y backend reales, sin mocks (`TEST_VALIDATION.md`).

## CI

`.github/workflows/ci.yml` define los jobs `backend`, `frontend`, `e2e` y `deploy-railway`. Estado observado (metadatos de GitHub Actions, sin logs):

- Ejecuciones #7 (`430dfad`) y #16 (`3ce012f`) en `pruebas-despliegue`: 4/4 jobs exitosos.
- Ejecución #14 (push, `54a26f5`): exitosa. Ejecución #15 (pull request, mismo SHA): **el job E2E falló**. La causa es `UNKNOWN`; podría ser intermitente (`P08-VAL-005`).

## Brechas

- Sin pruebas de rendimiento ni accesibilidad automatizadas.
- Sin pruebas unitarias del frontend.
- El comportamiento sobre PostgreSQL local no se ejecutó en P07 ni P09.
- Registros de P07: `ai-pipeline/artifacts/07_testing/`.
