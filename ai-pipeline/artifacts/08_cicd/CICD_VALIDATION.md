# Validación CI/CD - P08

## 1. Metadatos e identidad

- Proyecto: Notara; fecha: 2026-10-13.
- Prompt: `ai-pipeline/prompts/08_cicd/P08_validation.md`; prompt de sistema leído completo.
- Fuente: working tree actual. No se inspeccionaron logs remotos. El SHA local exacto es UNKNOWN en esta auditoría; no hay run/deployment ID.
- Entradas P07: `TEST_VALIDATION.md` y `PROMPT_LOG.md` registran 88/88 backend y 5/5 E2E en SQLite. No prueban PostgreSQL.
- Fuentes de implementación: workflow, Dockerfile, Nginx, entrypoint, settings, manifests y `CICD_IMPLEMENTATION.md`.

## 2. Alcance y procedencia

Auditoría estática del workflow, gates, SHA, contenedor, Railway y del reporte previo. No se ejecutó GitHub Actions ni se modificó código/configuración. Evidencias: `LOCAL_EXECUTION` significa salida local resumida en registros P08 (stdout original no archivado); `STATIC_REVIEW` es inspección de archivos; `NOT_RUN` es operación sin ejecución; `REMOTE_VERIFIED` no aplica.

## 3. Workflow, gates y SHA

`.github/workflows/ci.yml` declara PR, push a todas las ramas y `workflow_dispatch`; permisos globales `contents: read`. Declara jobs separados `backend`, `frontend` y `e2e`; backend y e2e configuran servicios `postgres:16` con healthchecks. El deploy solo se evalúa para `push`, requiere `RAILWAY_DEPLOY_ENABLED == 'true'`, branch igual a `RAILWAY_PRODUCTION_BRANCH` y `needs` satisfactorio para los tres jobs. Requiere `environment: production`, valida token, project/environment/service IDs y URL HTTPS; serializa production sin cancelar el release. PR y `workflow_dispatch` no despliegan.

El deploy ejecuta checkout explícito con `ref: ${{ github.sha }}` y `persist-credentials: false`. Los tres checks hacen checkout sin `ref`; el default de `actions/checkout` es el ref/SHA del evento. **Conclusión estática:** en push, checks y deploy se refieren al SHA del mismo evento. **SHA concreto usado:** UNKNOWN, porque no hay run remoto del que leer el valor ni logs.

`environment: production` por sí solo solo referencia un Environment; no acredita required reviewers ni branch restrictions. La protección debe configurarse y verificarse en GitHub antes de habilitar el deploy.

## 4. Comprobaciones

| Check | Exact command/job | Source/run identity | Environment | Result | Evidence provenance | Limitation |
|---|---|---|---|---|---|---|
| Frozen install | `corepack pnpm install --frozen-lockfile` | Manifest + pnpm lock | Local; pnpm 12.11.2 | PASS | LOCAL_EXECUTION, registrado | No es ejecución del runner GitHub. |
| YAML workflow | `pnpm dlx prettier@3.6.2 --check ../.github/workflows/ci.yml` | Workflow actual | Local | PASS | LOCAL_EXECUTION, registrado | Valida parseo/formato, no el motor Actions remoto. |
| Backend suite | `python backend/manage.py test accounts scores --verbosity 1` | 88 tests | SQLite temporal | PASS, complementario | LOCAL_EXECUTION, registro: 88/88 en 74.632 s | No equivale a PostgreSQL. |
| Migrations/system checks | `makemigrations --check --dry-run`; `manage.py check` | Source actual | SQLite | PASS, complementario | LOCAL_EXECUTION, registrado | Workflow configurado para repetir sobre PostgreSQL. |
| App typecheck/build | `pnpm typecheck`; `pnpm build` | Node 24/pnpm 12.11.2 | Local | PASS_WITH_WARNINGS | LOCAL_EXECUTION, registrado | Lightning CSS advierte `@theme`/`@tailwind`; no remote run. |
| P07 Playwright | `pnpm test:e2e` | 5 tests, Playwright 1.64.0 | Chromium + backend/frontend reales + SQLite temporal | 5/5 PASS, complementario | LOCAL_EXECUTION, registro: 22.9 s | Job CI definido con PostgreSQL 16, pero no ejecutado. |
| Django `check --deploy` | `python backend/manage.py check --deploy` con variables sintéticas | Settings prod | SQLite | PASS_WITH_WARNINGS | LOCAL_EXECUTION, registro | 2 warnings HSTS; decisión de dominio pendiente. |
| CI backend/e2e | Jobs `backend` y `e2e` | `postgres:16` | GitHub-hosted | NOT_RUN | NOT_RUN | No se leyó ningún log remoto ni SHA de Actions. |
| CI frontend | Job `frontend` | Node 24/pnpm frozen | GitHub-hosted | NOT_RUN | NOT_RUN | Los equivalentes locales pasaron, no el job remoto. |
| Docker image/runtime | Dockerfile + smoke | Working tree; SHA UNKNOWN | Docker | NOT_RUN | STATIC_REVIEW; NOT_RUN ejecución | Docker CLI no está instalado; no hay prueba Nginx/volumen/UID. |
| Railway deploy/health | Job `deploy-railway` | `github.sha` estático; SHA efectivo UNKNOWN | Railway | NOT_RUN / NOT_DEPLOYED | STATIC_REVIEW; NOT_RUN ejecución | Sin proyecto, token, IDs, domain, volumen ni logs reales. |

## 5. Revisión de producción

STATIC_REVIEW: imagen multistage Node 24 + Python 3.12; Nginx sirve SPA con fallback, proxya `/api/` a Gunicorn y `/static/` de Django; no sirve `/media/`. El entrypoint exige `PORT`, secret y DB, exige `DJANGO_DEBUG=false`, ejecuta `check --deploy` y migraciones antes de arrancar. Django configura cookies Secure, CSRF origins, SSL redirect y proxy header. `MEDIA_ROOT=/data/media` requiere volumen manual `/data`.

No se construyó ni arrancó la imagen. No se verificaron Nginx, disponibilidad del header del edge, UID/permisos del volumen, migraciones en Railway, persistencia tras restart, backups/restores ni rollback de esquema. `check --deploy` retiene W005/W021 sobre HSTS includeSubDomains/preload.

## 6. Railway Config as Code (documentación oficial)

Consultadas el 2026-10-13:

- https://docs.railway.com/config-as-code
- https://docs.railway.com/infrastructure-as-code

La documentación confirma que Config as Code (`railway.json`/`railway.toml`) está deprecado, que servicios nuevos no pueden elegirlo, y que servicios legacy dejan de leer esos archivos el **2026-12-01**. Railway recomienda IaC (`.railway/railway.ts`) para configuración de proyecto. La afirmación de `CICD_IMPLEMENTATION.md` es correcta con ese alcance; este repo no tiene `railway.toml` ni proyecto Railway inspeccionado.

## 7. Hallazgos

| Finding ID | Severity | File/symbol | Evidence | Impact | Minimum proposed correction |
|---|---|---|---|---|---|
| `P08-VAL-001` | Medium | GitHub Environment `production`; workflow | El YAML solo referencia el Environment; no puede probar reviewers/restricción de branches. | El gate puede no tener aprobación manual efectiva si el Environment se crea sin reglas. | Configurar reviewers y branches permitidas en GitHub antes de activar `RAILWAY_DEPLOY_ENABLED`. |
| `P08-VAL-002` | High | Jobs `backend`, `frontend`, `e2e`, `deploy-railway` | No existe evidencia de run remoto; el SHA concreto no se observó. | PostgreSQL 16, gates remotos, checkout/deploy y healthcheck no están demostrados. | Ejecutar Actions en un SHA; archivar URL/run, SHA probado y resultados job por job. |
| `P08-VAL-003` | Medium | Dockerfile / volumen Railway `/data` | Configuración solo estática; Docker y Railway no disponibles. | Build/runtime, media persistente y permisos no están validados. | Construir/smoke en Docker y probar upload/restart con volumen antes de deploy. |

## 8. Trazabilidad y discrepancias

- P07 local (`TEST_VALIDATION.md`): SQLite, 88 backend y 5 E2E; CI define explícitamente PostgreSQL 16.
- Architecture P05: origen único, sesiones, DB privada. Nginx/Django reflejan ese diseño a nivel estático.
- P06 `IMPLEMENTATION_VALIDATION.md` está desfasado: dice que no hay Django/PostgreSQL, aunque el source actual sí contiene backend/tests/settings. Se prioriza source activo y se conserva el artefacto histórico.
- No se encontró `ai-pipeline/outputs/` aplicable; se usó `ai-pipeline/artifacts/`.

## 9. Pendientes

- Ejecutar GitHub Actions real y verificar SHA/job logs con PostgreSQL 16.
- Docker build y runtime smoke.
- Configurar y proteger el Environment production; añadir Railway services/variables/secrets/domain/volume manualmente.
- Resolver HSTS para el dominio real; probar medios, migraciones, backup/restore y rollback.
- No crear recursos ni desplegar como parte de esta validación.

## 10. Estados

- CI configuration: `READY_WITH_WARNINGS` (STATIC_REVIEW + YAML/local checks).
- CI execution: `NOT_RUN` remoto; PostgreSQL 16 CI `NOT_RUN`.
- Production preparation: `READY_WITH_WARNINGS` estático; Docker, volume, HSTS y Environment protection pendientes.
- Runtime deployment: `NOT_DEPLOYED`.

## 11. Acción mínima siguiente

Configurar reviewers/branch policy del GitHub Environment y recursos Railway con valores reales; después ejecutar workflow en un SHA concreto y auditar sus logs. Validar Docker/runtime y persistencia antes de habilitar deploy automático. No se modificó código ni workflow durante esta auditoría.
