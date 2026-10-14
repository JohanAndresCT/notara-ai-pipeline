# API

Referencia de los endpoints existentes en `backend/notara_backend/urls.py`, con el comportamiento observado en `backend/accounts/views.py` y `backend/scores/views.py`. No hay documentación OpenAPI en el repositorio.

## Convenciones

- Formato JSON. Los errores usan `{"message": "..."}` o `{"errors": {"campo": ["..."]}}`. Los mensajes están en inglés.
- Autenticación por sesión (cookie). Sin sesión, los endpoints protegidos responden **401** `{"message": "Authentication is required."}`.
- CSRF: `GET /api/v1/csrf/` devuelve `{"csrfToken": "..."}` y fija la cookie. `CsrfViewMiddleware` está activo, pero varias vistas de `scores` están marcadas `@csrf_exempt` (ver [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md), `P09-DISC-007`).
- Existen **dos prefijos**: `/api/...` (heredado) y `/api/v1/...`. El frontend usa `/api/v1/` salvo `deleteComment`, que usa `/api/comments/<id>/`. Esta guía usa `/api/v1/` salvo indicación.
- Probado por el equipo y en producción (2026-10-14): `/api/health/` y `/api/v1/health/` → 200; `/api/me/` y `/api/v1/scores/` sin sesión → 401.

## Salud y CSRF

| Método | Ruta | Auth | Respuesta |
|---|---|---|---|
| GET | `/api/v1/health/` | No | 200 `{"status": "ok", "service": "notara-backend"}` |
| GET | `/api/v1/csrf/` | No | 200 `{"csrfToken": "..."}` |

## Cuentas

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/register/` | No | Cuerpo JSON `name` (≤150), `email` (válido, único), `password` (≥8). 201 `{"user": {...}}` e inicia sesión; 400 con `errors`. Email duplicado devuelve 400 con `errors.email` |
| POST | `/api/v1/auth/login/` | No | JSON `email`, `password`. 200 `{"user": {...}}`; 400 `Email or password is incorrect.` |
| POST | `/api/v1/auth/logout/` | Sí | 200 `{"message": "Logged out."}` |
| GET | `/api/v1/me/` | Sí | 200 `{"user": {...}}` |
| PATCH | `/api/v1/me/` | Sí | Actualiza `name`, `username` (a-z, 0-9, `.`, `_`, `-`; ≤30), `description`, `main_instrument` (Piano, Guitarra, Violín, Flauta, Voz, Otro) y `photo` (JPG/PNG, ≤`PROFILE_PHOTO_MAX_BYTES`). Acepta JSON o multipart |
| GET | `/api/v1/me/photo/` | Sí | Imagen del usuario (`Cache-Control: private, no-store`); 404 si no hay foto |
| POST | `/api/v1/me/password/` | Sí | Cambia la contraseña: requiere la actual; la nueva ≥8. 200 `Password changed.` |

Objeto `user`: `id`, `username`, `name`, `email`, `description`, `main_instrument`, `date_joined`, `score_count`, `likes_received`, `photo_url`.

## Partituras

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/scores/` | Feed paginado (10 por página), más reciente primero. Parámetros: `page`, `instrument` (sin distinguir mayúsculas), `mine=1`. Responde `scores`, `page`, `page_size`, `total_count`, `total_pages`, `total_scores`, `has_next`, `has_previous`. `page` inválido → 400 |
| POST | `/api/v1/scores/` | Crea. Requiere `title`, `instrument`, `description`, `format` (`ABC` o `TEXT`), `content` (no vacío, ≤1000). 201 `{"score": {...}}`; 400 con `errors` |
| GET | `/api/v1/scores/<id>/` | Detalle; 404 si no existe |
| PATCH | `/api/v1/scores/<id>/` | Edita (solo el propietario; 403 si no). Mismas validaciones |
| DELETE | `/api/v1/scores/<id>/` | Elimina (solo propietario). 204 sin cuerpo |

Para `format = ABC` el contenido debe tener los campos `X:`, `T:`, `M:`, `L:`, `K:` y al menos una línea musical.

Objeto `score`: `id`, `title`, `instrument`, `description`, `format`, `content`, `author`, `author_id`, `created_at`, `reaction_count`, `user_reacted`, `like_count`, `is_liked`, `comment_count`, `is_owner`.

## Reacciones y comentarios

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/scores/<id>/reactions/` | Alterna la reacción: 201 `{"reacted": true, "reaction_count": n}` al crear; 200 `{"reacted": false, ...}` al quitar |
| GET | `/api/v1/scores/<id>/comments/` | 200 `{"comments": [{id, body, author, author_id, created_at}]}` |
| POST | `/api/v1/scores/<id>/comments/` | JSON `body` (≤500). 400 si vacío o largo |
| DELETE | `/api/v1/scores/<id>/comments/<cid>/` | Solo el autor del comentario. 204 |

## Rutas heredadas `/api/...`

Mismos endpoints de salud, CSRF, cuentas y partituras bajo `/api/`. Adicionalmente:

| Método | Ruta | Nota |
|---|---|---|
| POST | `/api/scores/<id>/comments/` | Crear comentario (ruta heredada, definida en `urls.py`) |
| DELETE | `/api/comments/<id>/` | Usada por `deleteComment` del frontend |
| PUT / DELETE | `/api/scores/<id>/like/` | "Me gusta" heredado; no lo usa ninguna página del frontend |

Los likes y las reacciones son modelos distintos con conteos separados (`like_count` frente a `reaction_count`). Ver [DATA_MODEL.md](./DATA_MODEL.md) y `P09-DISC-002`.

## Administración

`/admin/` (Django Admin). En producción `/admin/login/` responde 200 públicamente (hallazgo `P08-VAL-006`). No hay modelos registrados en `admin.py` (los archivos no existen).
