# Guía de usuario

Flujos disponibles según las pantallas actuales de `frontend/src`. La interfaz está en español. La URL pública y su estado actual no se verificaron en esta revalidación; la evidencia histórica se documenta en [SETUP.md](./SETUP.md).

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

- `/scores/<id>/edit` permite cambiar **título, instrumento, descripción, formato y contenido**. También ofrece dictado (HU11) y carga local de `.abc` (HU19).
- Eliminar quita la partitura y vuelve al feed.
- Solo el propietario puede editar o eliminar; otros usuarios reciben 403 desde la API.

## 7. Perfil (`/profile`)

- **Información personal:** nombre, nombre de usuario (a-z, 0-9, `.`, `_`, `-`; máx. 30), instrumento principal y descripción.
- **Contraseña:** requiere la contraseña actual; la nueva debe tener 8 caracteres como mínimo.
- Se muestran el número de partituras y las reacciones recibidas.
- **Foto de perfil:** la API la admite, pero no se encontró ningún control para subirla en `frontend/src` (`P09-DISC-003`).

## 8. Funciones de voz y audio (MVP 2)

- **Dictar una partitura (HU11):** desde los formularios de creación o edición, permite grabar audio en español y devuelve una propuesta ABC que el usuario puede revisar antes de guardar. Se necesita permiso de micrófono, navegador compatible y contexto seguro. Audio máximo: 30 segundos y 2 MiB.
- **Comentar con voz (HU12):** en partituras de otra persona, graba un comentario, permite previsualizarlo y lo envía para transcripción. Se publica el texto junto con el audio; el límite del texto transcrito es 1.000 caracteres.
- **Escuchar (HU13–HU14):** en partituras ABC compatibles se puede generar solfeo hablado o un resumen hablado; el audio se devuelve como MP3.
- **Reproducir (HU15):** reproduce en el navegador las partituras ABC que el lector puede interpretar. Otros formatos o elementos no soportados muestran un mensaje.
- **Descargar (HU18):** el MP3 de solfeo generado se puede descargar desde la interfaz.
- **Cargar un archivo (HU19):** desde los formularios de creación o edición, al elegir un archivo `.abc`, el navegador lee su texto localmente y lo coloca en el editor; el archivo no se carga al servidor solo por seleccionarlo.

El código también contiene Gemini para normalizar dictados no interpretables (CR-006) y un tutor conversacional de voz/texto (CR-007). Ambos cambios están implementados con aprobación del solicitante, pero pendientes de ratificación del equipo y no son historias canónicas añadidas. Las opciones de instrumentos adicionales asociadas a CR-005 siguen propuestas; su presencia en el código no significa aprobación. No se afirma aceptación empírica de precisión, latencia, memoria o calidad de audio.

## 9. Límites de esta versión

OMR, recuperación de cuenta y gestión diferenciada de roles no están implementados en este alcance. Las limitaciones de verificación y los cambios pendientes se describen en [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md).
