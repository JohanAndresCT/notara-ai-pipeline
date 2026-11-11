import { useEffect, useRef, useState, type FormEvent } from "react";
import Icon from "./Icon";
import { askTutor, createTutorSession, type PublishedScore } from "./lib/api";
import { LiveTutor } from "./lib/liveTutor";

// HU21 / CR-007 — conversational music tutor (Google Gemini Live).
const messages = {
  notice:
    "Tu voz y tus preguntas se envían a Google Gemini durante la conversación para generar las respuestas. Notara no guarda el audio.", // M-18
  disclaimer: "Respuestas generadas por IA; pueden contener errores.",
  micDenied: "No se pudo usar el micrófono. Puedes escribir tu pregunta.",
  ended: "Conversación terminada.",
};

type Bubble = { id: number; who: "user" | "tutor"; text: string };
type Status = "idle" | "connecting" | "live" | "ended";

function formatSeconds(total: number) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function TutorChat({ score }: { score: PublishedScore }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [level, setLevel] = useState(0);
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const liveRef = useRef<LiveTutor | null>(null);
  const timerRef = useRef<number | null>(null);
  const idRef = useRef(0);
  const turnRef = useRef<{ user: number | null; tutor: number | null }>({ user: null, tutor: null });
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => () => end(false), []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles, thinking]);

  // Keep the updaters pure (React may call them twice in development).
  function append(who: Bubble["who"], text: string) {
    const currentId = turnRef.current[who];
    if (currentId !== null) {
      setBubbles((list) => list.map((bubble) => (bubble.id === currentId ? { ...bubble, text: bubble.text + text } : bubble)));
      return;
    }
    const id = ++idRef.current;
    turnRef.current[who] = id;
    setBubbles((list) => [...list, { id, who, text: text.trimStart() }]);
  }

  function end(showInfo = true) {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    liveRef.current?.close();
    liveRef.current = null;
    setSpeaking(false);
    setLevel(0);
    setStatus((current) => (current === "idle" ? "idle" : "ended"));
    if (showInfo) setInfo(messages.ended);
  }

  function restart() {
    end(false);
    setBubbles([]);
    setQuestion("");
    setThinking(false);
    setError("");
    setInfo("");
    turnRef.current = { user: null, tutor: null };
    setStatus("idle");
  }

  async function startLive() {
    setError("");
    setInfo("");
    setStatus("connecting");
    try {
      const session = await createTutorSession(score.id);
      const live = new LiveTutor({
        onReady: async () => {
          setStatus("live");
          setRemaining(session.max_seconds);
          timerRef.current = window.setInterval(() => {
            setRemaining((seconds) => {
              if (seconds <= 1) {
                end();
                return 0;
              }
              return seconds - 1;
            });
          }, 1000);
          const micOk = await live.startMicrophone();
          if (!micOk) setInfo(messages.micDenied);
        },
        onUserText: (text) => {
          turnRef.current.tutor = null;
          append("user", text);
        },
        onTutorText: (text) => {
          turnRef.current.user = null;
          setThinking(false);
          append("tutor", text);
        },
        onTurnComplete: () => {
          turnRef.current = { user: null, tutor: null };
          setThinking(false);
        },
        onSpeaking: setSpeaking,
        onLevel: (value) => setLevel((previous) => previous * 0.6 + value * 0.4),
        onError: (message) => {
          setError(message);
          end(false);
        },
        onClose: () => end(),
      });
      liveRef.current = live;
      live.connect(session);
    } catch (requestError) {
      setStatus("idle");
      setError((requestError as Error).message);
    }
  }

  async function sendQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (!text) return;
    setQuestion("");
    setError("");
    turnRef.current = { user: null, tutor: null };
    append("user", text);
    turnRef.current.user = null;
    const live = liveRef.current;
    if (live?.isOpen) {
      setThinking(true);
      live.sendText(text);
      return;
    }
    // AC-087: typed fallback without a live session.
    setThinking(true);
    try {
      const answer = await askTutor(score.id, text);
      append("tutor", answer);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      turnRef.current = { user: null, tutor: null };
      setThinking(false);
    }
  }

  const isLive = status === "live";
  const instrumentName = score.instrument && score.instrument !== "Otro" ? score.instrument.toLowerCase() : "mi instrumento";
  const suggestions = ["¿Qué compás tiene?", `¿Cómo la toco en ${instrumentName}?`, "¿Es difícil para principiantes?"];

  return (
    <section className={`tutor-chat${open ? " is-open" : ""}${isLive ? " is-live" : ""}`} aria-labelledby="tutor-chat-heading">
      <div className="tutor-chat-head">
        <span className={`tutor-orb${isLive ? " live" : ""}${speaking ? " speaking" : ""}`} aria-hidden="true" style={{ ["--level" as string]: String(Math.min(1, level * 6)) }}>
          <Icon name="sparkles" size={22} />
        </span>
        <div>
          <h2 id="tutor-chat-heading">Pregúntale al tutor <span className="ai-badge">IA · Gemini</span></h2>
          <p>Habla o escribe tus dudas sobre esta partitura y el tutor te responde con voz.</p>
        </div>
        {!open ? (
          <button className="button primary small" type="button" onClick={() => setOpen(true)}>
            <Icon name="mic" size={16} /> Preguntar al tutor
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="tutor-chat-body">
          <p className="voice-notice">{messages.notice}</p>
          <div className="tutor-controls">
            {isLive ? (
              <>
                <span className="tutor-live-pill"><i className="live-dot" /> En vivo · {formatSeconds(remaining)}</span>
                <span className="tutor-state">{speaking ? "El tutor está hablando…" : "Te escucho, haz tu pregunta."}</span>
                <button className="button secondary small" type="button" onClick={() => end()}>Terminar</button>
              </>
            ) : (
              <button className="button primary small" type="button" onClick={() => void startLive()} disabled={status === "connecting"}>
                <Icon name="mic" size={16} /> {status === "connecting" ? "Conectando…" : status === "ended" ? "Hablar de nuevo" : "Hablar con el tutor"}
              </button>
            )}
            {bubbles.length > 0 || status === "ended" ? (
              <button className="button secondary small tutor-restart" type="button" onClick={restart}>
                <Icon name="sparkles" size={15} /> Reiniciar conversación
              </button>
            ) : null}
          </div>

          {bubbles.length === 0 ? (
            <div className="tutor-suggestions">
              {suggestions.map((text) => (
                <button key={text} type="button" onClick={() => setQuestion(text)}>{text}</button>
              ))}
            </div>
          ) : null}

          <ol className="tutor-messages" ref={listRef} aria-live="polite">
            {bubbles.map((bubble) => (
              <li key={bubble.id} className={`tutor-bubble ${bubble.who}`}>
                <span className="sr-only">{bubble.who === "user" ? "Tú: " : "Tutor: "}</span>
                {bubble.text}
              </li>
            ))}
            {thinking ? <li className="tutor-bubble tutor thinking" aria-label="El tutor está pensando"><i /><i /><i /></li> : null}
          </ol>

          <form className="tutor-ask" onSubmit={(event) => void sendQuestion(event)}>
            <label className="sr-only" htmlFor="tutor-question">Escribe tu pregunta</label>
            <input id="tutor-question" value={question} maxLength={500} placeholder="Escribe tu pregunta…" onChange={(event) => setQuestion(event.target.value)} />
            <button className="button primary small" type="submit" disabled={!question.trim() || thinking} aria-label="Enviar pregunta">
              <Icon name="arrowRight" size={16} />
            </button>
          </form>
          <p className="tutor-disclaimer">{messages.disclaimer}</p>
          {info ? <p className="voice-hint" role="status">{info}</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
