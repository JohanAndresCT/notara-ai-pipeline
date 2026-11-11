# API

Referencia de los endpoints existentes en `backend/notara_backend/urls.py`, con el comportamiento observado en `backend/accounts/views.py` y `backend/scores/views.py`. No hay documentación OpenAPI en el repositorio.

## Convenciones

- Formato JSON. Los errores no tienen un formato ni un idioma único: las rutas generales suelen responder `{"message": "..."}` o `{"errors": {"campo": ["..."]}}` en inglés; algunos errores de voz incluyen `code`, `message` y `errors`, y sus mensajes pueden estar en español.
- Autenticación por sesión (cookie). Sin sesión, los endpoints protegidos responden **401** `{"message": "Authentication is required."}`.
- CSRF: `GET /api/v1/csrf/` devuelve `{"csrfToken": "..."}` y fija la cookie. `CsrfViewMiddleware` está activo para todas las vistas: las peticiones que modifican datos deben enviar la cabecera `X-CSRFToken`; sin ella la respuesta es 403.
- Existen **dos prefijos**: `/api/...` (heredado) y `/api/v1/...`. El frontend usa `/api/v1/` salvo `deleteComment`, que usa `/api/comments/<id>/`. Esta guía usa `/api/v1/` salvo indicación.
- Evidencia histórica (2026-10-14): `/api/health/` y `/api/v1/health/` respondieron 200; `/api/me/` y `/api/v1/scores/` sin sesión respondieron 401. No se repitieron estas solicitudes en esta validación.

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
| GET | `/api/v1/scores/<id>/comments/` | 200 `{"comments": [{id, body, kind, audio_url, author, author_id, created_at}]}`. `audio_url` es `null` para comentarios de texto. |
| POST | `/api/v1/scores/<id>/comments/` | JSON `body` (≤500) para texto, o multipart `audio` para comentario de voz. 400 si el texto está vacío o es largo |
| DELETE | `/api/v1/scores/<id>/comments/<cid>/` | Solo el autor del comentario. 204 |

## Voz y audio (MVP 2)

Las rutas nuevas usan `/api/v1/`; requieren sesión y CSRF válido para POST, salvo que se indique lo contrario. La disponibilidad de proveedores, la calidad de audio y el comportamiento en producción no se verificaron en esta etapa.

| Método | Ruta | Entrada / respuesta |
|---|---|---|
| POST | `/api/v1/audio/stt/` | Multipart `audio` requerido y `title` opcional. Dictado HU11; responde con `transcript`, `meter`, `abc_line`, `abc_document` y `ai_interpreted`. Errores tipados incluyen 400, 401, 413, 422, 429 y 503. Ver [API_STT_HU11.md](./API_STT_HU11.md). |
| POST | `/api/v1/scores/<id>/comments/` | Acepta multipart `audio` para comentario de voz HU12; respuesta incluye comentario transcrito y URL del audio. La variante JSON crea comentario de texto. |
| GET | `/api/v1/comments/<comment_id>/audio/` | Devuelve el audio del comentario de voz si el usuario tiene acceso. |
| POST | `/api/v1/scores/<id>/audio/solfege/` | Devuelve audio MPEG del solfeo (HU13); requiere partitura ABC compatible. |
| POST | `/api/v1/scores/<id>/audio/tutor/` | Devuelve audio MPEG del resumen hablado (HU14); el texto también se incluye en `X-Notara-Tutor-Text`. |
| POST | `/api/v1/scores/<id>/tutor/session/` | Devuelve credenciales de sesión temporales de Gemini Live (CR-007, pendiente de ratificación). |
| POST | `/api/v1/scores/<id>/tutor/ask/` | Recibe JSON `question` (1–500 caracteres) y devuelve `answer` (CR-007, pendiente de ratificación). |

El cliente genera la reproducción instrumental y el MP3 descargable en el navegador; no se exponen como endpoints de síntesis de servidor. Los endpoints del tutor conversacional son funcionalidades presentes en el código, pero no forman parte del backlog canónico ratificado.

## Rutas heredadas `/api/...`

Mismos endpoints de salud, CSRF, cuentas y partituras bajo `/api/`. Adicionalmente:

| Método | Ruta | Nota |
|---|---|---|
| POST | `/api/scores/<id>/comments/` | Crear comentario (ruta heredada, definida en `urls.py`) |
| DELETE | `/api/comments/<id>/` | Usada por `deleteComment` del frontend |
| PUT / DELETE | `/api/scores/<id>/like/` | "Me gusta" heredado; no lo usa ninguna página del frontend |

Los likes y las reacciones son modelos distintos con conteos separados (`like_count` frente a `reaction_count`). Ver [DATA_MODEL.md](./DATA_MODEL.md) y `P09-DISC-002`.

## Administración

`/admin/` (Django Admin). El hallazgo histórico `P08-VAL-006` registró un 200 público en `/admin/login/`; no se repitió la comprobación en esta revalidación. No hay modelos de la aplicación registrados en Django Admin.
