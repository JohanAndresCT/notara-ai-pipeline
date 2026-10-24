# Notara

Aplicación web responsive de comunidad y gestor básico de partituras en texto para estudiantes de música y músicos aficionados. Es un MVP académico construido con apoyo de un pipeline de prompts de IA.

## Estado del proyecto

| Dimensión | Estado | Evidencia |
|---|---|---|
| Implementación | `READY_WITH_ASSUMPTIONS`: MVP-001, 002, 004, 006, 007 y 008 implementados; MVP-003, 005, 009 y 010 con diferencias por decidir | [REQUIREMENTS_COVERAGE.md](./docs/REQUIREMENTS_COVERAGE.md) |
| Pruebas | Backend: 91/91 OK en SQLite (2026-10-24). E2E: 5/5 en SQLite (P07, no reejecutado en P09). PostgreSQL local: no ejecutado | [TESTING.md](./docs/TESTING.md) |
| CI | Workflow `ci.yml` con 4 jobs. Ejecuciones #7 y #16 exitosas; la #15 falló en E2E (causa desconocida) | [TESTING.md](./docs/TESTING.md) |
| Despliegue | `DEPLOYED` en Railway: <https://notara-production.up.railway.app>. Observado el 2026-10-14: `/api/health/` devuelve 200 | [SETUP.md](./docs/SETUP.md) |
| Documentación | Generada en P09, pendiente de validación | [DOCUMENTATION_REPORT.md](./ai-pipeline/artifacts/09_documentation/DOCUMENTATION_REPORT.md) |

Sin verificar: persistencia del volumen de fotos, copias de seguridad, rollback, protección del environment y redirección HTTP→HTTPS.

## Funcionalidades implementadas

- Registro, inicio y cierre de sesión (sesión de Django).
- Perfil: nombre, usuario, descripción, instrumento principal y cambio de contraseña.
- Publicar partituras en formato ABC (con validación básica) o texto, hasta 1000 caracteres.
- Feed de la comunidad y de publicaciones propias, con filtro por instrumento y paginación de 10.
- Detalle de partitura, reacciones y comentarios.
- Editar y eliminar las publicaciones propias.

La interfaz no renderiza notación musical; muestra el contenido como texto.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Django 5.2.18, Django REST Framework 3.15.2, Gunicorn 23 |
| Frontend | React 19, TypeScript 5.7, Vite 8, Tailwind CSS 4 |
| Base de datos | PostgreSQL 16 (producción y CI); SQLite para pruebas locales |
| Pruebas | Django test runner, Playwright |
| Despliegue | Docker (Nginx + Gunicorn), Railway, GitHub Actions |

## Inicio rápido

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
$env:DJANGO_DB_ENGINE = "sqlite"
python backend\manage.py migrate
python backend\manage.py runserver
```

```powershell
cd frontend
corepack enable
pnpm install
pnpm dev
```

Configuración, variables de entorno y Docker Compose en [docs/SETUP.md](./docs/SETUP.md).

## Estructura

```text
backend/            Django: notara_backend, accounts, scores
frontend/           SPA React + pruebas Playwright (e2e/)
docs/               Documentación del proyecto
deploy/, docker/    Entrypoint y plantilla de Nginx
.github/workflows/  CI y despliegue
ai-pipeline/        Prompts y artefactos del pipeline (P00-P09)
```

## Pruebas

```powershell
$env:DJANGO_DB_ENGINE = "sqlite"
python backend\manage.py test accounts scores
cd frontend; pnpm typecheck; pnpm test:e2e
```

Más detalles en [docs/TESTING.md](./docs/TESTING.md).

## Despliegue

La imagen del `Dockerfile` raíz sirve la SPA con Nginx y la API con Gunicorn. Railway despliega desde GitHub Actions cuando `RAILWAY_DEPLOY_ENABLED` es `true` y la rama coincide con `RAILWAY_PRODUCTION_BRANCH`. Ver [docs/SETUP.md](./docs/SETUP.md) y `ai-pipeline/artifacts/08_cicd/DEPLOYMENT_GUIDE.md`.

## Documentación

| Documento | Contenido |
|---|---|
| [SETUP](./docs/SETUP.md) | Instalación, variables y despliegue |
| [ARCHITECTURE](./docs/ARCHITECTURE.md) | Arquitectura real |
| [API](./docs/API.md) | Endpoints |
| [DATA_MODEL](./docs/DATA_MODEL.md) | Modelos y migraciones |
| [USER_GUIDE](./docs/USER_GUIDE.md) | Guía de uso |
| [TESTING](./docs/TESTING.md) | Pruebas y CI |
| [REQUIREMENTS_COVERAGE](./docs/REQUIREMENTS_COVERAGE.md) | Cobertura de requisitos |
| [KNOWN_LIMITATIONS](./docs/KNOWN_LIMITATIONS.md) | Limitaciones y discrepancias |

## Alcance y limitaciones

Fuera del MVP: voz, OMR, imágenes, audio y roles. Hay discrepancias abiertas que requieren decisión del equipo (rutas `/api` y `/api/v1`, reacciones y likes, foto de perfil, CSRF). Ver [docs/KNOWN_LIMITATIONS.md](./docs/KNOWN_LIMITATIONS.md).

## Pipeline de IA

El proyecto se desarrolló por etapas (P00 contexto a P09 documentación). Prompts en `ai-pipeline/prompts/` y resultados en `ai-pipeline/artifacts/`. Las etapas P00 a P08 tienen artefactos con estados `PASS`, `PASS_WITH_WARNINGS` o `READY_WITH_ASSUMPTIONS` según cada validación.

## Equipo

| Integrante | Rol (P00) |
|---|---|
| Johan Andrés Ceballos Tabarez | Frontend / UX |
| Emanuel Rivas | Backend / Arquitectura |
| David Urrego | Backend |
| Alejandro Rodríguez | Base de datos |
| Alejandro Zamorano | Pruebas / DevOps |

## Licencia

No hay un archivo `LICENSE` en el repositorio; la licencia no está definida.
