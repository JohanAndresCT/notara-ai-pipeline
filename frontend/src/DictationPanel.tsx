import { useState } from "react";
import { transcribeDictation, type DictationResult } from "./lib/api";
import { formatCountdown, MAX_RECORDING_BYTES, recorderMessages, useRecorder } from "./lib/useRecorder";

// HU11 / US-011 — voice dictation (UX_SPEC FLOW-011, FLOW-018, REG-001, REG-008).
// Audio goes to POST /api/v1/audio/stt/; it is not stored after transcription.
const messages = {
  notice:
    "El audio se enviará a los servidores de Notara para transcribirlo. No se conservará después de la transcripción. El proveedor de alojamiento procesa esta solicitud.", // M-11
  uninterpretable: "No se pudo interpretar el dictado musical", // M-01
  inserted: "Dictado insertado. Revísalo antes de publicar.", // M-12
};

type Feedback = { kind: "error" | "success"; text: string } | null;

export default function DictationPanel({
  title,
  disabledReason,
  onResult,
}: {
  title: string;
  disabledReason: string | null;
  /** Returns an error message when the result cannot be inserted. */
  onResult: (result: DictationResult) => string | null;
}) {
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const recorder = useRecorder((audio, autoStopped) => void sendRecording(audio, autoStopped));

  async function startRecording() {
    setFeedback(null);
    const error = await recorder.start();
    if (error) setFeedback({ kind: "error", text: error });
  }

  async function sendRecording(audio: Blob, autoStopped: boolean) {
    if (!audio.size) {
      setFeedback({ kind: "error", text: messages.uninterpretable });
      return;
    }
    if (audio.size > MAX_RECORDING_BYTES) {
      setFeedback({ kind: "error", text: recorderMessages.tooLarge });
      return;
    }
    setProcessing(true);
    try {
      const result = await transcribeDictation(audio, title);
      const rejected = onResult(result);
      if (rejected) {
        setFeedback({ kind: "error", text: rejected });
        return;
      }
      const prefix = autoStopped ? `${recorderMessages.autoStopped} ` : "";
      setFeedback({ kind: "success", text: `${prefix}${messages.inserted}` });
    } catch (error) {
      setFeedback({ kind: "error", text: (error as Error).message });
    } finally {
      setProcessing(false);
    }
  }

  const blockedText = !recorder.supported ? recorderMessages.unsupported : disabledReason;
  const busy = processing || recorder.status !== "idle";
  const liveText =
    recorder.status === "recording"
      ? "Grabando dictado."
      : processing
        ? "Interpretando dictado…"
        : recorder.status === "requesting"
          ? "Esperando permiso del micrófono."
          : "";

  return (
    <section className="voice-panel" aria-labelledby="dictation-heading">
      <div className="voice-panel-head">
        <div>
          <h3 id="dictation-heading">Dictar por voz</h3>
          <p>Di las notas en español y Notara las escribe en ABC.</p>
        </div>
        {recorder.status === "recording" ? (
          <button className="button primary small recording" type="button" onClick={recorder.stop}>
            <span className="rec-dot" aria-hidden="true" /> Detener · {formatCountdown(recorder.remaining)}
          </button>
        ) : (
          <button
            className="button secondary small"
            type="button"
            onClick={() => void startRecording()}
            disabled={Boolean(blockedText) || busy}
            aria-describedby={blockedText ? "dictation-hint" : undefined}
          >
            {recorder.status === "requesting" ? "Esperando permiso…" : processing ? "Interpretando dictado…" : "Dictar"}
          </button>
        )}
      </div>
      {blockedText ? (
        <p className="voice-hint" id="dictation-hint">
          {blockedText}
        </p>
      ) : null}
      <p className="voice-notice">{messages.notice}</p>
      <details className="voice-vocab">
        <summary>Vocabulario soportado</summary>
        <ul>
          <li><strong>Notas:</strong> Do, Re, Mi, Fa, Sol, La, Si (una octava desde el Do central).</li>
          <li><strong>Alteraciones:</strong> «sostenido» o «bemol» después de la nota.</li>
          <li><strong>Figuras:</strong> redonda, blanca, negra, corchea, semicorchea.</li>
          <li><strong>Silencios:</strong> «silencio de negra», «silencio de corchea»…</li>
          <li><strong>Compás:</strong> «compás cuatro cuartos», «tres cuartos», «seis octavos».</li>
          <li><strong>Barra de compás:</strong> «barra».</li>
        </ul>
        <p>Ejemplo: «Compás cuatro cuartos, Do negra, Re corchea, Mi corchea».</p>
      </details>
      <p className="sr-only" aria-live="polite">
        {liveText}
      </p>
      {feedback ? (
        <p className={feedback.kind === "error" ? "form-error" : "tool-success"} role={feedback.kind === "error" ? "alert" : "status"}>
          {feedback.text}
        </p>
      ) : null}
    </section>
  );
}
