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
- Con sesión: **Mis publicaciones recientes** y el **feed de la comunidad**, con un filtro por instrumento (Piano, Guitarra, Violín, Flauta, Trompeta, Saxofón, Otro) y paginación **Anterior / Siguiente** (10 por página, más recientes primero).

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

- **Dictar una partitura (HU11):** desde los formularios de creación o edición, permite grabar audio en español y devuelve una propuesta ABC que el usuario puede revisar antes de guardar. Si el parser determinista no interpreta el texto transcrito, puede usarse Gemini para normalizar solo ese texto; el audio no se envía a Gemini. Se necesita permiso de micrófono, navegador compatible y contexto seguro. Audio máximo: 30 segundos y 2 MiB.
- **Comentar con voz (HU12):** en partituras de otra persona, graba un comentario, permite previsualizarlo y lo envía para transcripción. Se publica el texto junto con el audio; el límite del texto transcrito es 1.000 caracteres.
- **Escuchar (HU13–HU14):** en partituras ABC compatibles se puede generar solfeo hablado o un resumen hablado; el audio se devuelve como MP3.
- **Reproducir (HU15):** reproduce en el navegador las partituras ABC que el lector puede interpretar. Otros formatos o elementos no soportados muestran un mensaje.
- **Descargar (HU18):** el MP3 de solfeo generado se puede descargar desde la interfaz.
- **Cargar un archivo (HU19):** desde los formularios de creación o edición, al elegir un archivo `.abc`, el navegador lee su texto localmente y lo coloca en el editor; el archivo no se carga al servidor solo por seleccionarlo.
- **Elegir instrumento (HU20):** en partituras ABC compatibles, selecciona Piano, Guitarra, Violín, Flauta, Trompeta o Saxofón (estos cuatro últimos con insignia «IA»). Los instrumentos IA pueden usar el fallback Tone.js con un aviso. El MP3 instrumental, cuando se ofrece, es independiente del MP3 de solfeo. El flujo está en el código, pero no cuenta con validación P06 de historia ni E2E actual.
- **Preguntar al tutor (HU21):** en el detalle, lee el aviso de privacidad y acepta antes de iniciar la conversación. La voz se transmite a Gemini durante la sesión, que termina tras 2 minutos o al pulsar "Terminar"; existe fallback de pregunta escrita. La implementación está registrada, pero falta validación P06 de historia, prueba de micrófono real y aceptación.

El responsable del proyecto informó que el equipo aprobó CR-005/006/007; la fecha/acta formal de aprobación sigue pendiente de documentación. P02 incluye HU20/HU21 y la enmienda a US-011; P03 aún no asigna prioridad ni estimación a HU20/HU21. La aprobación y la presencia de código no constituyen aceptación empírica de precisión, latencia, memoria, audio ni UX.

## 9. Límites de esta versión

OMR, recuperación de cuenta y gestión diferenciada de roles no están implementados en este alcance. Las limitaciones de verificación y los cambios pendientes se describen en [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md).
