# HU11 STT API

## Endpoint

`POST /api/v1/audio/stt/`

Same-origin, session-authenticated endpoint. It does not accept bearer tokens. The browser must send its existing Django session cookie and a CSRF token.

### Request

Use `multipart/form-data`:

| Field | Required | Value |
|---|---:|---|
| `audio` | Yes | One audio file. Allowed declared media types: `audio/webm`, `audio/ogg`, `audio/wav`, `audio/mp4`. |
| `title` | No | Score title used for the ABC `T:` header. If omitted or blank, the header uses `Dictado`. |

Limits are 2 MiB (`AUDIO_MAX_BYTES`) and 30 seconds (`AUDIO_MAX_SECONDS`). The server validates the declared media type, decoded container/signature, audio stream and duration. It does not trust a client-side file size or duration check.

The current endpoint returns a complete new ABC document for an empty score field. It does not accept the existing score content. Until P02 Q-029 is resolved, the frontend must not use it to append a dictation to a populated field.

### Authentication and CSRF

1. `GET /api/v1/csrf/` to obtain a token and set the CSRF cookie. Use it on the existing `POST /api/v1/auth/login/` or registration request.
2. Authenticate through the existing session flow. Then fetch `/api/v1/csrf/` again so the token corresponds to the authenticated session.
3. Send both the session cookie and `X-CSRFToken: <csrfToken>` on the STT POST. Keep the request same-origin and include credentials.
4. Build `FormData` with `audio` and optional `title`. Do not set `Content-Type` manually; the browser supplies the multipart boundary.

Example:

```js
const csrfResponse = await fetch("/api/v1/csrf/", {
  credentials: "same-origin",
});
const { csrfToken } = await csrfResponse.json();

const body = new FormData();
body.append("audio", audioBlob, "dictation.webm");
body.append("title", scoreTitle);

const response = await fetch("/api/v1/audio/stt/", {
  method: "POST",
  credentials: "same-origin",
  headers: { "X-CSRFToken": csrfToken },
  body,
});
const result = await response.json();
```

### Success

HTTP `200`, JSON with exactly these fields:

```json
{
  "transcript": "Compás cuatro cuartos, Do negra, Re corchea, Mi corchea",
  "meter": "4/4",
  "abc_line": "C D/2 E/2",
  "abc_document": "X:1\nT:Mi partitura\nM:4/4\nL:1/4\nK:C\nC D/2 E/2"
}
```

The document applies BR-025 defaults for an empty field: `X:1`, `T:` from `title` or `Dictado`, the dictated meter or `4/4`, `L:1/4`, and `K:C`. `abc_line` and `abc_document` are not published or persisted by this endpoint. The frontend should keep the existing field unchanged on any non-2xx response and should let the user review the returned document before publication.

### Errors

All endpoint JSON errors use `{"code": "...", "message": "...", "errors": {}}`.

| HTTP | `code` | Meaning |
|---:|---|---|
| 400 | `AUDIO_INVALID` | Missing/unsupported audio, invalid signature/container, invalid stream or duration over 30 s. |
| 401 | `AUTHENTICATION_REQUIRED` | No authenticated session. |
| 403 | `CSRF_FAILED` | Missing or invalid CSRF token. |
| 413 | `AUDIO_TOO_LARGE` | Upload exceeds 2 MiB. |
| 422 | `DICTATION_UNINTERPRETABLE` | Transcript is empty, unintelligible or outside the approved closed vocabulary. |
| 429 | `STT_DAILY_LIMIT_REACHED` | User has reached the configured daily limit (default 30 admitted attempts per UTC day). |
| 503 | `STT_UNAVAILABLE` | Model is not enabled/available, the process inference slot is busy, quota storage failed, or inference failed. |

P05 records the names of the authentication and CSRF codes as implementation proposals pending team confirmation. The other codes and status codes follow the approved P05 endpoint contract. Unsupported methods receive Django's standard `405` response.

### Privacy, quota, and concurrency

- The endpoint does not save dictation audio or transcript to application storage or logs.
- Authentication, CSRF, file validation, model availability, and process-slot admission happen before quota reservation.
- One STT inference can run per process. Saturated requests return `STT_UNAVAILABLE` without quota use.
- Once admitted, the attempt counts even when transcription or parsing fails. Excess requests return `STT_DAILY_LIMIT_REACHED` before inference.
- The model must already be staged and SHA-256 verified before the web process starts. The HTTP request path does not download weights.
- The approved p95 target is 15 s for a 30 s recording with the model loaded, but it has not been measured on the integrated backend. There is no current per-request 25 s completion guarantee; that proposed ceiling remains pending approval.

## Model provisioning

See [SETUP.md](./SETUP.md#stt-local-hu11) for the pinned model revision, SHA-256 file manifest, Windows/Linux provisioning commands, and local startup procedure.
