import { useRef, useState, type ChangeEvent } from "react";

// HU19 / US-019 — load an .abc file into the score editor (UX_SPEC FLOW-012, REG-002).
// The file is read in the browser and never uploaded or stored (DEC-217).
const MAX_CHARACTERS = 1000;
const MAX_FILE_BYTES = 64 * 1024; // Guard before decoding; the real limit is 1,000 characters.

const messages = {
  wrongExtension: "El archivo debe tener extensión .abc.", // M-08a
  empty: "El archivo está vacío.", // M-08b
  unreadable: "No se pudo leer el archivo como texto.", // M-08c
  tooLong: "El archivo supera los 1.000 caracteres.", // M-08d
  loaded: "Archivo cargado. Revísalo antes de publicar.", // M-14
  replace: "¿Reemplazar el contenido actual por el del archivo?", // SCR-010
};

type Feedback = { kind: "error" | "success"; text: string } | null;

export default function AbcFileLoader({
  hasContent,
  onLoad,
}: {
  hasContent: boolean;
  onLoad: (text: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setFeedback(null);

    if (!file.name.toLowerCase().endsWith(".abc")) {
      setFeedback({ kind: "error", text: messages.wrongExtension });
      return;
    }
    if (file.size === 0) {
      setFeedback({ kind: "error", text: messages.empty });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFeedback({ kind: "error", text: messages.tooLong });
      return;
    }

    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
    } catch {
      setFeedback({ kind: "error", text: messages.unreadable });
      return;
    }
    text = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
    if (!text.trim()) {
      setFeedback({ kind: "error", text: messages.empty });
      return;
    }
    if (text.length > MAX_CHARACTERS) {
      setFeedback({ kind: "error", text: messages.tooLong });
      return;
    }
    if (hasContent && !window.confirm(messages.replace)) return;

    onLoad(text);
    setFeedback({ kind: "success", text: messages.loaded });
  }

  return (
    <div className="input-tool">
      <button className="button secondary small" type="button" onClick={() => inputRef.current?.click()}>
        Cargar archivo .abc
      </button>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".abc"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleChange}
      />
      {feedback ? (
        <p className={feedback.kind === "error" ? "form-error" : "tool-success"} role={feedback.kind === "error" ? "alert" : "status"}>
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}
