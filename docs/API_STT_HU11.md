# API STT de HU11

## Endpoint

`POST /api/v1/audio/stt/`

Endpoint del mismo origen con autenticación por sesión. No acepta bearer tokens. El navegador envía la cookie de sesión Django y un token CSRF.

### Solicitud

Usa `multipart/form-data`:

| Campo | Obligatorio | Valor |
|---|---:|---|
| `audio` | Sí | Un archivo. Tipos MIME declarados permitidos: `audio/webm`, `audio/ogg`, `audio/wav`, `audio/mp4`. |
| `title` | No | Título usado en la cabecera ABC `T:`. Si se omite o está vacío, se usa `Dictado`. |

Límites: 2 MiB (`AUDIO_MAX_BYTES`) y 30 segundos (`AUDIO_MAX_SECONDS`). El servidor valida el tipo declarado, el contenedor/firma decodificados, la pista de audio y la duración; no confía en la comprobación de tamaño o duración del cliente.

El endpoint devuelve un documento ABC nuevo y la línea musical (`abc_line`, escrita para `L:1/4`). No recibe el contenido de una partitura existente. Si el campo ya está poblado, el frontend combina la respuesta (`frontend/src/lib/dictationMerge.ts`, DEC-239 / BR-025): conserva el ABC, añade solo las cabeceras requeridas ausentes, respeta un `M:` existente, reescala duraciones a la `L:` existente y añade la línea al final. Se rechazan texto libre, ABC sin cabeceras y cabeceras requeridas presentes pero vacías. Whisper recibe el vocabulario BR-013 como prompt y hace una sola pasada a temperatura 0, sin fallback de temperatura (DEC-240), solo para dictado.

### Autenticación y CSRF

1. Solicita `GET /api/v1/csrf/` para obtener un token y fijar la cookie CSRF. Úsalo en el flujo de login o registro existente.
2. Autentícate mediante la sesión y vuelve a solicitar `GET /api/v1/csrf/` para obtener un token de la sesión autenticada.
3. Envía la cookie de sesión y `X-CSRFToken: <csrfToken>` en el POST STT. Mantén el mismo origen e incluye credenciales.
4. Construye `FormData` con `audio` y `title` opcional. No establezcas `Content-Type` manualmente; el navegador añade el límite multipart.

Ejemplo:

```js
const csrfResponse = await fetch("/api/v1/csrf/", {
  credentials: "same-origin",
});
const { csrfToken } = await csrfResponse.json();

const body = new FormData();
body.append("audio", audioBlob, "dictado.webm");
body.append("title", scoreTitle);

const response = await fetch("/api/v1/audio/stt/", {
  method: "POST",
  credentials: "same-origin",
  headers: { "X-CSRFToken": csrfToken },
  body,
});
const result = await response.json();
```

### Respuesta correcta

HTTP `200`, JSON con los campos:

```json
{
  "transcript": "Compás cuatro cuartos, Do negra, Re corchea, Mi corchea",
  "meter": "4/4",
  "abc_line": "C D/2 E/2",
  "abc_document": "X:1\nT:Mi partitura\nM:4/4\nL:1/4\nK:C\nC D/2 E/2",
  "ai_interpreted": false
}
```

Para un campo vacío, el documento usa los valores predeterminados BR-025: `X:1`, `T:` del campo `title` o `Dictado`, el compás dictado o `4/4`, `L:1/4` y `K:C`. Este endpoint no publica ni persiste `abc_line` ni `abc_document`. Ante cualquier respuesta no-2xx, el frontend conserva el campo existente; el usuario puede revisar el resultado antes de publicarlo.

`ai_interpreted` indica si se utilizó el normalizador Gemini de CR-006. Esa enmienda está implementada con aprobación del solicitante, pero pendiente de ratificación del equipo; no se integra al contrato canónico US-011 mientras no se ratifique.

### Errores

Los errores JSON usan `{"code": "...", "message": "...", "errors": {}}`.

| HTTP | `code` | Significado |
|---:|---|---|
| 400 | `AUDIO_INVALID` | Falta el audio, el tipo no está admitido, la firma/contenedor o pista no son válidos, o supera 30 s. |
| 401 | `AUTHENTICATION_REQUIRED` | No hay sesión autenticada. |
| 403 | `CSRF_FAILED` | Falta el token CSRF o no es válido. |
| 413 | `AUDIO_TOO_LARGE` | El archivo supera 2 MiB. |
| 422 | `DICTATION_UNINTERPRETABLE` | La transcripción está vacía, es ininteligible o no corresponde al vocabulario cerrado aprobado. |
| 429 | `STT_DAILY_LIMIT_REACHED` | Se alcanzó el límite diario configurado (30 intentos admitidos por usuario y día UTC, por defecto). |
| 503 | `STT_UNAVAILABLE` | El modelo no está habilitado/disponible, el proceso está ocupado, falló la reserva de cuota o falló la inferencia. |

Los métodos no admitidos reciben la respuesta estándar Django `405`.

### Privacidad, cuota y concurrencia

- El endpoint no guarda el audio del dictado ni la transcripción en el almacenamiento o los logs de la aplicación.
- Autenticación, CSRF, validación de archivo, disponibilidad del modelo y admisión al espacio de inferencia ocurren antes de reservar cuota.
- Solo puede correr una inferencia STT por proceso. Si el proceso está ocupado, responde `STT_UNAVAILABLE` sin consumir cuota.
- Una vez admitido, el intento cuenta aunque falle la transcripción o el análisis. Al exceder la cuota, responde `STT_DAILY_LIMIT_REACHED` antes de inferir.
- El modelo debe estar aprovisionado y verificado por SHA-256 antes de que el proceso web lo cargue. La solicitud HTTP no descarga pesos.
- DEC-232 aprueba un límite inicial de 25 s para completar el STT o devolver un error tipado. DEC-221/DEC-232 registran además un objetivo p95 de 15 s para una grabación de 30 s con el modelo cargado. No se han medido en el backend integrado: son objetivos aprobados, no resultados demostrados.

## Aprovisionamiento del modelo

Consulta [SETUP.md](./SETUP.md#stt-local-hu11) para la revisión fijada del modelo, el manifiesto SHA-256, los comandos de aprovisionamiento Windows/Linux y el arranque local.
