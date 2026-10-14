# Guía de usuario

Flujo principal de Notara según las pantallas del código (`frontend/src`). La interfaz está en español. Producción: <https://notara-production.up.railway.app>.

## 1. Crear una cuenta

1. Entra a `/register`.
2. Completa **nombre**, **correo** y **contraseña** (mínimo 8 caracteres).
3. Al registrarte, la sesión se inicia automáticamente. Si el correo ya existe, verás un error.

## 2. Iniciar y cerrar sesión

- `/login`: correo y contraseña. Con datos incorrectos se muestra un error.
- La opción de cerrar sesión está en la barra de navegación.
- Sin sesión, `/profile`, `/scores/new` y las rutas de detalle y edición muestran el login.

## 3. Inicio (`/`)

- Sin sesión: página de presentación.
- Con sesión: **Mis publicaciones recientes** y el **feed de la comunidad**, con un filtro por instrumento (6 opciones) y paginación **Anterior / Siguiente** (10 por página, más recientes primero).

## 4. Publicar una partitura (`/scores/new`)

1. Indica **título**, **instrumento** y **descripción**.
2. Elige el formato: **ABC** o **texto**.
3. Escribe el contenido (máximo 1000 caracteres).
4. En formato ABC, el contenido debe incluir los campos `X:`, `T:`, `M:`, `L:`, `K:` y al menos una línea musical; si falta algo, se muestra un error.

## 5. Ver el detalle (`/scores/<id>`)

- El contenido se muestra tal cual, sin renderizar notación.
- **Reaccionar:** pulsa para añadir o quitar tu reacción.
- **Comentar:** escribe hasta 500 caracteres. Solo el autor de un comentario puede borrarlo.
- Si eres el propietario aparecen **Editar** y **Eliminar**.

## 6. Editar y eliminar

- `/scores/<id>/edit` permite cambiar **título, instrumento y descripción**. La pantalla no permite editar el contenido ni el formato aunque la API sí lo admite (`P09-DISC-004`).
- Eliminar quita la partitura y vuelve al feed.
- Solo el propietario puede editar o eliminar; otros usuarios reciben 403 desde la API.

## 7. Perfil (`/profile`)

- **Información personal:** nombre, nombre de usuario (a-z, 0-9, `.`, `_`, `-`; máx. 30), instrumento principal y descripción.
- **Contraseña:** requiere la contraseña actual; la nueva debe tener 8 caracteres como mínimo.
- Se muestran el número de partituras y las reacciones recibidas.
- **Foto de perfil:** la API la admite, pero no se encontró ningún control para subirla en `frontend/src` (`P09-DISC-003`).

## Qué no existe en esta versión

Audio, imágenes en partituras, roles, recuperación de cuenta y edición de comentarios (ver [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md)).
