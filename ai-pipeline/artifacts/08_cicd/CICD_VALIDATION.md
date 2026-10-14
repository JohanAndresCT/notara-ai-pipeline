# Validación CI/CD - P08

## 1. Metadatos e identidad

- Proyecto: Notara; fecha: 2026-10-13.
- Prompt: `ai-pipeline/prompts/08_cicd/P08_validation.md`; prompt de sistema leído completo.
- Fuente: working tree actual. La usuaria reporta que CI del SHA `c34419a` falló en E2E; ese SHA/run no se pudo contrastar con logs remotos. No inferir que identifica el checkout local ni hay deployment ID.
- Entradas P07: `TEST_VALIDATION.md` y `PROMPT_LOG.md` registran 88/88 backend y 5/5 E2E en SQLite. No prueban PostgreSQL.
- Fuentes de implementación: workflow, Dockerfile, Nginx, entrypoint, settings, manifests y `CICD_IMPLEMENTATION.md`.

## 2. Alcance y procedencia

Auditoría estática del workflow, gates, SHA, contenedor, Railway y del reporte previo. No se ejecutó GitHub Actions ni se modificó código/configuración. Evidencias: `LOCAL_EXECUTION` significa salida local resumida en registros P08 (stdout original no archivado); `STATIC_REVIEW` es inspección de archivos; `NOT_RUN` es operación sin ejecución; `REMOTE_VERIFIED` no aplica.

## 3. Workflow, gates y SHA

`.github/workflows/ci.yml` declara PR, push a todas las ramas y `workflow_dispatch`; permisos globales `contents: read`. Declara jobs separados `backend`, `frontend` y `e2e`; backend y e2e configuran servicios `postgres:16` con healthchecks. En el estado auditado, `e2e` solo instala Node/pnpm y Chromium: no configura Python 3.12 ni instala `backend/requirements.txt`. Como `frontend/playwright.config.ts` inicia Django con `python backend/manage.py ...`, Django no está garantizado en ese runner; esto concuerda con `ModuleNotFoundError: No module named 'django'` reportado.

El deploy solo se evalúa para `push`, requiere `RAILWAY_DEPLOY_ENABLED == 'true'`, branch igual a `RAILWAY_PRODUCTION_BRANCH` y `needs` satisfactorio para los tres jobs. Requiere `environment: production`, valida token, project/environment/service IDs y URL HTTPS; serializa production sin cancelar el release. PR y `workflow_dispatch` no despliegan.

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
| CI backend | Job `backend` | El reporte recibido menciona SHA `c34419a`, resultado backend no proporcionado | GitHub-hosted + PostgreSQL 16 | NOT_RUN / no verificado | USER_REPORTED parcialmente; sin logs backend | No se aportó salida del job backend. |
| CI E2E (run reportado) | Job `e2e` | SHA reportado `c34419a` | GitHub-hosted + PostgreSQL 16 | FAIL | USER_REPORTED | `ModuleNotFoundError: No module named 'django'`; log remoto no inspeccionado. |
| Fix E2E static | `actions/setup-python@v5` Python 3.12 + `python -m pip install -r ../backend/requirements.txt`; `DJANGO_PYTHON` toma `steps.setup-python.outputs.python-path` | Workflow/config actual | GitHub Actions, PostgreSQL 16 mantenido | PASS estático | STATIC_REVIEW | No sustituye un rerun remoto. |
| Playwright con ejecutable explícito | `DJANGO_DB_ENGINE=sqlite; DJANGO_PYTHON=(Get-Command python).Source; pnpm test:e2e` | 5 tests P07 | Local, SQLite aislado | 5/5 PASS en 23.1 s | LOCAL_EXECUTION | Confirma cableado al intérprete dado; no prueba Python 3.12 hosted ni PostgreSQL 16. |
| CI frontend | Job `frontend` | Node 24/pnpm frozen | GitHub-hosted | NOT_RUN | NOT_RUN | Los equivalentes locales pasaron, no el job remoto. |
| Docker image/runtime | Dockerfile + smoke | Working tree; SHA UNKNOWN | Docker | NOT_RUN | STATIC_REVIEW; NOT_RUN ejecución | Docker CLI no está instalado; no hay prueba Nginx/volumen/UID. |
| Railway deploy/health | Job `deploy-railway` | `github.sha` estático; SHA efectivo UNKNOWN | Railway | NOT_RUN / NOT_DEPLOYED (auditoría 2026-10-13; superado por la sección 14) | STATIC_REVIEW; NOT_RUN ejecución | Sin proyecto, token, IDs, domain, volumen ni logs reales. |

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
| `P08-VAL-001` | High, corregido localmente | `.github/workflows/ci.yml` job `e2e`; `frontend/playwright.config.ts` | El run reportado falló por Django ausente. La configuración actual instala Python 3.12/requisitos y pasa el `python-path` de setup a Playwright; la prueba local explícita pasó 5/5. | El run remoto fallido sigue sin revalidación con la corrección, por lo que el gate de release aún no está demostrado. | Reejecutar el workflow corregido con PostgreSQL 16 y comprobar los cinco tests antes de habilitar deploy. |
| `P08-VAL-002` | Medium | GitHub Environment `production`; workflow | El YAML solo referencia el Environment; no prueba reviewers/restricción de branches. | El gate puede carecer de aprobación efectiva si el Environment no tiene reglas. | Configurar reviewers y branches permitidas en GitHub antes de activar `RAILWAY_DEPLOY_ENABLED`. |
| `P08-VAL-003` | High | Jobs `backend`, `frontend`, `e2e`, `deploy-railway` | No hay logs remotos inspeccionados ni SHA concreto verificado; `c34419a` es USER_REPORTED. | PostgreSQL16, gates remotos y SHA desplegado no están demostrados. | Obtener URL/run y logs; comparar SHA de checkout por job antes de considerar el gate validado. |
| `P08-VAL-004` | Medium | Dockerfile / volumen Railway `/data` | Configuración solo estática; Docker y Railway no disponibles. | Build/runtime, media persistente y permisos no están validados. | Construir/smoke en Docker y probar upload/restart con volumen antes de deploy. |

## 8. Trazabilidad y discrepancias

- P07 local (`TEST_VALIDATION.md`): SQLite, 88 backend y 5 E2E; CI define explícitamente PostgreSQL 16.
- Architecture P05: origen único, sesiones, DB privada. Nginx/Django reflejan ese diseño a nivel estático.
- P06 `IMPLEMENTATION_VALIDATION.md` está desfasado: dice que no hay Django/PostgreSQL, aunque el source actual sí contiene backend/tests/settings. Se prioriza source activo y se conserva el artefacto histórico.
- No se encontró `ai-pipeline/outputs/` aplicable; se usó `ai-pipeline/artifacts/`.

## 9. Pendientes

- Corregir el setup Python del job E2E; después ejecutar GitHub Actions real y verificar SHA/job logs con PostgreSQL 16.
- Docker build y runtime smoke.
- Configurar y proteger el Environment production; añadir Railway services/variables/secrets/domain/volume manualmente.
- Resolver HSTS para el dominio real; probar medios, migraciones, backup/restore y rollback.
- No crear recursos ni desplegar como parte de esta validación.

## 10. Estados

- CI configuration: `READY_WITH_WARNINGS`; el setup E2E ya incluye Python 3.12, requirements y el mismo ejecutable Django/Playwright.
- CI execution: `FAIL` histórico USER_REPORTED para `c34419a`; configuración corregida sin ejecución remota todavía. Backend y PostgreSQL 16 remotos no verificados.
- Production preparation: `READY_WITH_WARNINGS` estático; Docker, volume, HSTS y Environment protection pendientes.
- Runtime deployment: `NOT_DEPLOYED` (estado de la auditoría 2026-10-13, conservado como registro histórico; el estado vigente está en la sección 14).

## 11. Acción mínima siguiente

Configurar reviewers/branch policy del GitHub Environment y recursos Railway con valores reales; ejecutar de nuevo el workflow corregido en un SHA concreto, confirmar PostgreSQL 16 y auditar logs. Validar Docker/runtime y persistencia antes de habilitar deploy automático. En esta continuación se corrigieron workflow/config como autorizó el usuario; no se desplegó.

## 12. Actualización del despliegue

Se observó una ejecución de CI exitosa para c76b08c en pruebas-despliegue.
Se configuraron los recursos de Railway y se habilitó RAILWAY_DEPLOY_ENABLED.
El despliegue y la verificación pública siguen pendientes.
Esta actualización es posterior a la auditoría anterior.
## 13. Resultado del despliegue real

- Ejecución: https://github.com/JohanAndresCT/notara-ai-pipeline/actions/runs/38481851856
- Rama: pruebas-despliegue.
- Resultado reportado: CI y despliegue exitosos.
- URL: https://notara-production.up.railway.app
- Verificación manual del usuario: registro, inicio de sesión,
  publicación de partituras y foto de perfil funcionan.
- Estado: DEPLOYED.

Nota: las secciones 12 y 13 son declaraciones de la usuaria (`USER_REPORTED`) añadidas tras la auditoría. La sección 14 las contrasta con evidencia independiente. La sección 12 cita el SHA `c76b08c` y la 13 el run `38481851856`, cuyo SHA es `430dfad`; son ejecuciones distintas.

## 14. Revalidación posterior al despliegue (2026-10-14)

### 14.1 Alcance e identidad

- Alcance: CI, producción y despliegue real en Railway. Se auditó sin modificar código, tests, workflow ni configuración; no se hizo commit, push ni redeploy.
- Working tree local: rama `Arch-Front-end`, HEAD `54a26f5`. El despliegue ocurre desde la rama `pruebas-despliegue` (inferido por los runs; `RAILWAY_PRODUCTION_BRANCH` no se inspeccionó). El checkout local **no** es el commit desplegado.
- Evidencia remota: metadatos de la API pública de GitHub Actions (`REMOTE_VERIFIED` para estado, SHA, jobs y pasos). Los logs de los jobs no se inspeccionaron, por lo que conteos de tests y salida de comandos no están verificados.
- Evidencia de runtime: peticiones GET de solo lectura a la URL pública, 2026-10-14 13:49 (-05:00). No se enviaron credenciales ni se crearon datos.

### 14.2 Checks

| Check | Exact command/job | Source/run identity | Environment | Result | Evidence provenance | Limitation |
|---|---|---|---|---|---|---|
| CI backend | Job `Backend (PostgreSQL 16)` | Run `38481851856` (#7, push, `pruebas-despliegue`), SHA `430dfad` | GitHub-hosted + PostgreSQL 16 | PASS | REMOTE_VERIFIED (metadatos) | Conteo de tests no verificado (logs no leídos). |
| CI frontend | Job `Frontend typecheck and build` | Mismo run y SHA | GitHub-hosted | PASS | REMOTE_VERIFIED (metadatos) | Sin logs. |
| CI E2E | Job `Playwright E2E (PostgreSQL 16)`, paso `Run all browser scenarios against PostgreSQL` | Mismo run y SHA | GitHub-hosted + PostgreSQL 16 | PASS | REMOTE_VERIFIED (metadatos) | Número de escenarios no verificado. Corrige `P08-VAL-001`. |
| Deploy gate | Job `Deploy tested commit to Railway` con `needs` de los tres checks | Mismo run; los 4 jobs comparten `head_sha` `430dfad` | GitHub Actions + Railway | PASS | REMOTE_VERIFIED (metadatos) | Pasos `Verify Railway setup is complete`, `Deploy the checked-out commit and wait for success` y `Verify deployed health endpoint`: success. ID de deployment de Railway no inspeccionado. |
| Último run en rama de despliegue | Run `38610251114` (#16, push, `pruebas-despliegue`), SHA `3ce012f` | 2026-10-14 | GitHub Actions + Railway | PASS (4/4 jobs, incluido deploy) | REMOTE_VERIFIED (metadatos) | El SHA corresponde al último deploy exitoso observado; el ID de deployment de Railway no se comparó. |
| PR sin deploy | Run `38606194394` (#15, `pull_request`, `Arch-Front-end`, SHA `54a26f5`) | Deploy omitido | GitHub Actions | PASS para el gate (`deploy` skipped en PR) | REMOTE_VERIFIED (metadatos) | Ver `P08-VAL-005`: el job E2E de ese run falló. |
| CI E2E intermitente | Job E2E, run #15 (falló) vs run #14 (push, mismo SHA `54a26f5`, pasó) | `54a26f5` | GitHub-hosted + PostgreSQL 16 | FAIL (run #15) / PASS (run #14) | REMOTE_VERIFIED (metadatos) | Causa UNKNOWN: logs no inspeccionados. No se omite ni se relaja el test. |
| Health pública | `GET /api/health/`, `GET /api/v1/health/` | URL pública | Railway | PASS (200, JSON `{"status":"ok","service":"notara-backend"}`) | LOCAL_EXECUTION | Indica servicio activo, no el SHA desplegado. |
| Rutas públicas SPA | `GET /`, `/login`, `/scores/1` | URL pública | Railway | PASS (200, `text/html`, fallback SPA) | LOCAL_EXECUTION | No prueba la UI funcional. |
| API protegida | `GET /api/me/`, `/api/v1/scores/` sin sesión | URL pública | Railway | PASS (401 sin autenticación) | LOCAL_EXECUTION | Autorización por rol no auditada. |
| CSRF y cookies | `GET /api/csrf/` | URL pública | Railway | PASS (200; cookie con atributo `Secure`) | LOCAL_EXECUTION | Solo atributo `Secure`; no se auditó el resto de atributos. |
| Estáticos Django | `GET /static/admin/css/base.css` | URL pública | Railway | PASS (200, `text/css`) | LOCAL_EXECUTION | |
| HSTS | Cabecera de `/api/health/` | URL pública | Railway | PASS_WITH_WARNINGS: `max-age=31536000`, sin `includeSubDomains`/`preload` | LOCAL_EXECUTION | Decisión de dominio sobre `includeSubDomains`/`preload` sigue pendiente. |
| `/media/` | `GET /media/` | URL pública | Railway | PASS_WITH_WARNINGS: devuelve el HTML de la SPA (200), sin listado de medios | LOCAL_EXECUTION | No se comprobó un archivo de media concreto ni su acceso autenticado. |
| Redirección HTTP→HTTPS | `GET http://…/api/health/` | URL pública | Railway | NOT_RUN | NOT_RUN | La respuesta no pudo interpretarse con este método. |
| Flujos de usuario | Registro, login, publicar partitura, foto de perfil | URL pública | Railway | PASS según la usuaria | USER_REPORTED | No se repitieron: crearía datos reales. |
| Docker local | `docker build` + smoke | Working tree | Local | NOT_RUN | NOT_RUN | Docker no instalado. La imagen sí se construyó en la plataforma de despliegue (el deploy terminó en success). |
| Persistencia de medios, backup/restore, rollback | Volumen `/data`, restart, restauración | Railway | Railway | NOT_RUN | NOT_RUN | Sin evidencia. |
| Protección del Environment `production` | Reviewers y ramas permitidas | GitHub | GitHub | NOT_RUN | NOT_RUN | No inspeccionado (requiere acceso a la configuración del repositorio). |

### 14.3 Hallazgos vigentes

| Finding ID | Severity | File/symbol | Evidence | Impact | Minimum proposed correction |
|---|---|---|---|---|---|
| `P08-VAL-001` | Resuelto | Job `e2e` | Run #7 (SHA `430dfad`): E2E con PostgreSQL 16 en success; el workflow instala Python 3.12 y requisitos. | Ninguno | Ninguna. |
| `P08-VAL-002` | Medium, abierto | GitHub Environment `production` | Sigue sin inspeccionarse; el deploy se ejecutó. | Puede faltar aprobación humana efectiva. | Verificar reviewers y ramas permitidas en GitHub. |
| `P08-VAL-003` | Parcialmente resuelto | Jobs de CI y deploy | Los cuatro jobs del run #7 comparten el mismo `head_sha`; el deploy dependió de los tres checks. Logs, conteos de tests e ID de deployment de Railway no se inspeccionaron. | Gate demostrado por metadatos; no por logs. | Guardar el ID de deployment de Railway y el conteo de tests ejecutados. |
| `P08-VAL-004` | Medium, abierto | Dockerfile, volumen `/data` | Sin prueba de persistencia, permisos ni restart; Docker local no ejecutado. | Medios de perfil podrían perderse tras un redeploy. | Probar subida de foto, redeploy y lectura con el volumen. |
| `P08-VAL-005` | Medium, nuevo | Job `Playwright E2E (PostgreSQL 16)`, run `38606194394` | Falló en el run #15 (PR) y pasó en el run #14 con el mismo SHA `54a26f5`. | Posible test intermitente; un falso verde o rojo reduce la confianza del gate. | Inspeccionar logs y trazas del run #15; no saltar ni debilitar el test. |
| `P08-VAL-006` | Low, observación | `/admin/` | `GET /admin/login/` responde 200 en la URL pública. | Superficie administrativa expuesta; no hay requisito que lo prohíba. | Decisión del equipo (`REQUIRES_DECISION`). |
| `P08-VAL-007` | Low | Artefactos P08 | `CICD_IMPLEMENTATION.md` y `DEPLOYMENT_GUIDE.md` decían `NOT_DEPLOYED`. | Contradicción entre artefactos. | Corregido en esta revalidación; ver sección 14.4. |

### 14.4 Estados vigentes (separados)

- CI configuration: `READY_WITH_WARNINGS` (Environment sin verificar).
- CI execution: `PASS` en el run `38481851856` y en el run `38610251114`; `FAIL` intermitente del job E2E en el run `38606194394` (`P08-VAL-005`); la falla histórica de `c34419a` se conserva como `USER_REPORTED`.
- Production preparation: `READY_WITH_WARNINGS` (Docker local, volumen, HSTS y backups pendientes).
- Runtime deployment: `DEPLOYED_AND_VERIFIED`, con alcance limitado a: despliegue completado por el job (pasos success), disponibilidad, health, rutas SPA, protección 401 de la API y cookie CSRF `Secure`. Persistencia de medios, restart, backup/restore, rollback y los flujos de usuario siguen sin verificación independiente (`USER_REPORTED` o `NOT_RUN`).
- URL pública: https://notara-production.up.railway.app

### 14.5 Acción mínima siguiente

Revisar los logs del run #15 para explicar el E2E intermitente; configurar y verificar la protección del Environment `production`; probar persistencia de medios con redeploy; registrar el ID de deployment de Railway junto con el SHA. Esta revalidación no modificó código ni configuración y no desplegó.
