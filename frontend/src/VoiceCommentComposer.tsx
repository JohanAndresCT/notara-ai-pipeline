import { useEffect, useState } from "react";
import { createVoiceComment, type ScoreComment } from "./lib/api";
import { formatCountdown, MAX_RECORDING_BYTES, recorderMessages, useRecorder } from "./lib/useRecorder";

// REG-005 — voice comment composer (HU12, UX_SPEC FLOW-013). Preview before sending (UX-PROP-003).
const notice =
  "El audio se enviará a los servidores de Notara para transcribirlo y se publicará junto con el texto y el audio. El proveedor de alojamiento procesa esta solicitud."; // M-11 (voice comment)

export default function VoiceCommentComposer({
  scoreId,
  onCreated,
}: {
  scoreId: number;
  onCreated: (comment: ScoreComment) => void;
}) {
  const [draft, setDraft] = useState<{ audio: Blob; url: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const recorder = useRecorder((audio) => {
    if (!audio.size) return;
    if (audio.size > MAX_RECORDING_BYTES) {
      setError(recorderMessages.tooLarge);
      return;
    }
    setDraft({ audio, url: URL.createObjectURL(audio) });
  });

  useEffect(() => () => {
    if (draft) URL.revokeObjectURL(draft.url);
  }, [draft]);

  async function start() {
    setError("");
    setDraft(null);
    const message = await recorder.start();
    if (message) setError(message);
  }

  async function send() {
    if (!draft) return;
    setSending(true);
    setError("");
    try {
      const created = await createVoiceComment(scoreId, draft.audio);
      onCreated(created);
      setDraft(null);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="voice-comment" aria-labelledby="voice-comment-heading">
      <div className="voice-panel-head">
        <div>
          <h3 id="voice-comment-heading">Comentar con voz</h3>
          <p>Graba hasta 30 segundos; se publicará como texto y audio.</p>
        </div>
        {recorder.status === "recording" ? (
          <button className="button primary small recording" type="button" onClick={recorder.stop}>
            <span className="rec-dot" aria-hidden="true" /> Detener · {formatCountdown(recorder.remaining)}
          </button>
        ) : !draft ? (
          <button className="button secondary small" type="button" onClick={() => void start()} disabled={!recorder.supported || recorder.status !== "idle" || sending}>
            {recorder.status === "requesting" ? "Esperando permiso…" : "Grabar comentario"}
          </button>
        ) : null}
      </div>
      {!recorder.supported ? <p className="voice-hint">{recorderMessages.unsupported}</p> : null}
      <p className="voice-notice">{notice}</p>
      {draft ? (
        <div className="voice-draft">
          <audio controls src={draft.url} aria-label="Escuchar tu comentario antes de enviarlo" />
          <div className="voice-draft-actions">
            <button className="button secondary small" type="button" onClick={() => setDraft(null)} disabled={sending}>Descartar</button>
            <button className="button primary small" type="button" onClick={() => void send()} disabled={sending}>
              {sending ? "Transcribiendo…" : "Enviar"}
            </button>
          </div>
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {recorder.status === "recording" ? "Grabando comentario." : sending ? "Transcribiendo comentario…" : ""}
      </p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </section>
  );
}
