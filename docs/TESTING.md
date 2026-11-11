# Pruebas

## Evidencia local más reciente

| Capa | Comando / evidencia | Entorno | Resultado |
|---|---|---|---|
| Backend | `.\.venv\Scripts\python.exe backend\manage.py test accounts scores voice --verbosity 1` | Python 3.11.9, Django 5.2.18, DRF 3.15.2, SQLite temporal | 165 detectadas: 164 pasaron, 1 omitida; 0 fallos |
| Chequeo Django | `.\.venv\Scripts\python.exe backend\manage.py check` | Mismo entorno | Sin incidencias |
| Migraciones | `.\.venv\Scripts\python.exe backend\manage.py makemigrations --check --dry-run` | Mismo entorno | No se detectaron cambios |
| Frontend | `npm.cmd run typecheck` desde `frontend/` | Node 24.21.0; instalación local incompleta | Bloqueado: no resuelve `@tensorflow/tfjs`, `tone` y `@breezystack/lamejs`, aunque están declarados en los manifiestos |
| Playwright E2E | No ejecutado en esta revalidación | Requiere dependencias frontend | `NOT_RUN`; se conserva evidencia histórica P07 de 5/5 |
| Build frontend | No ejecutado en esta revalidación | `frontend/dist/` preexistente | `NOT_RUN`; se preservó el artefacto existente |
| PostgreSQL local | No ejecutado | PostgreSQL no disponible en esta ejecución | `NOT_RUN`; no se infiere equivalencia con SQLite |

El test omitido requiere PostgreSQL para validar concurrencia de cuota STT. No se instalaron dependencias ni se alteraron lockfiles. Los comandos de backend usan una base de pruebas administrada por Django; para una base de desarrollo persistente, elige una ruta `SQLITE_DB_PATH` nueva y verifica que no exista antes de migrar.

## Cómo ejecutar

Desde la raíz del repositorio, con el entorno virtual y dependencias backend preparados:

```powershell
$env:DJANGO_DB_ENGINE = "sqlite"
$env:SQLITE_DB_PATH = "$env:TEMP\notara-test-unique.sqlite3"
if (Test-Path $env:SQLITE_DB_PATH) { throw "Choose a new SQLite path; the target already exists." }
.\.venv\Scripts\python.exe backend\manage.py test accounts scores voice
.\.venv\Scripts\python.exe backend\manage.py check
.\.venv\Scripts\python.exe backend\manage.py makemigrations --check --dry-run
```

Desde `frontend/`, una vez restauradas las dependencias conforme al lockfile:

```powershell
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test:e2e
```

No ejecutar `pnpm install` sobre una instalación local que se quiera preservar sin revisar primero su estado; esta documentación no indica que se haya instalado nada durante P06–P09.

## Cobertura E2E histórica

P07 registró 5/5 escenarios Playwright en SQLite: registro/login/logout y acceso anónimo; publicación/detalle/reacción; edición; eliminación; y protección de rutas. Esa evidencia no se volvió a ejecutar en la validación actual.

## CI

`.github/workflows/ci.yml` contiene los jobs `backend`, `frontend`, `e2e` y `deploy-railway`. Los resultados de runs #7, #14, #15 y #16 son metadatos históricos registrados en P08; los logs no fueron auditados en esta ejecución y no se consultó GitHub.

## Brechas

- La ejecución local actual no valida PostgreSQL; un test de concurrencia quedó omitido.
- No se reejecutaron E2E, build, pruebas cross-browser, accesibilidad ni rendimiento.
- La validación no mide precisión real de dictado, latencia p95, uso máximo de memoria ni calidad auditiva.
- El historial E2E de CI incluye un fallo con causa desconocida en run #15, aunque #14 pasó con el mismo SHA según los metadatos históricos.
- El registro de P07 y la revalidación de P06 están en `ai-pipeline/outputs/07_testing/` y `ai-pipeline/outputs/06_implementation/`.
