# Arquitectura

Descripción de Notara tal como está construido (verificado en el código). Es un monolito desplegable en un solo contenedor: SPA de React servida por Nginx y API de Django con sesiones.

## Vista general

```text
Navegador ──HTTPS──► Nginx (:$PORT)
                       ├─ /            → SPA (index.html, fallback)
                       ├─ /static/     → staticfiles de Django
                       └─ /api/        → Gunicorn/Django (127.0.0.1:8000)
                                             └─► PostgreSQL (servicio separado)
Fotos de perfil: disco (MEDIA_ROOT=/data/media), solo vía GET /api/v1/me/photo/
```

En desarrollo, Vite sirve la SPA y hace proxy de `/api` al servidor de Django.

## Estructura del repositorio

| Ruta | Contenido |
|---|---|
| `backend/notara_backend/` | Configuración (`settings.py`) y rutas (`urls.py`) |
| `backend/accounts/` | Modelo `User` personalizado, registro, login, perfil, foto, contraseña |
| `backend/scores/` | Partituras, comentarios, reacciones y likes |
| `frontend/src/` | SPA React 19 + TypeScript + Tailwind 4 |
| `frontend/e2e/` | Pruebas Playwright |
| `Dockerfile`, `deploy/entrypoint.sh`, `docker/nginx.conf.template` | Imagen de producción |
| `docker-compose.yml` | Entorno local con PostgreSQL |
| `.github/workflows/ci.yml` | CI y despliegue a Railway |
| `ai-pipeline/` | Prompts y artefactos del pipeline de IA (P00–P09) |

## Backend

- Django 5.2.18 y Django REST Framework 3.15.2 en `INSTALLED_APPS`. Las vistas de `accounts` y `scores` devuelven `JsonResponse`.
- Autenticación por sesión y CSRF de Django. Cookies `SameSite=Lax`.
- Base de datos seleccionada con `DJANGO_DB_ENGINE` (`sqlite` o PostgreSQL).
- Rutas duplicadas bajo `/api/` y `/api/v1/` (ver [API.md](./API.md) y `P09-DISC-001`).
- Idioma `en-us`, zona horaria UTC. Los mensajes de error de la API están en inglés; el frontend los traduce.

## Frontend

- Sin librería de enrutado: `App.tsx` resuelve rutas por `window.location`: `/`, `/login`, `/register`, `/profile`, `/scores/new`, `/scores/<id>`, `/scores/<id>/edit`.
- Las rutas protegidas muestran el login a usuarios anónimos.
- `src/lib/api.ts` centraliza las llamadas a la API y usa mayormente `/api/v1/*`.
- Configuración de Vite con plugins de Figma Make (`vite.config.ts`) además de React y Tailwind.

## Decisiones visibles en el código

- Mismo origen para SPA y API, sin CORS (Nginx unifica ambos).
- Foto de perfil servida solo con sesión y `Cache-Control: private, no-store`; Nginx no expone `/media/`.
- Seguridad en producción (`DEBUG=false`): cookies seguras, redirección SSL y HSTS de 31 536 000 s.

## No verificado

- Persistencia real del volumen `/data` en Railway.
- Comportamiento bajo carga o concurrencia (no hay pruebas de rendimiento).
