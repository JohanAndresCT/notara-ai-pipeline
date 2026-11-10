import { useEffect, useRef, useState, type FormEvent } from "react";
import AbcFileLoader from "./AbcFileLoader";
import DictationPanel from "./DictationPanel";
import { getScore, instrumentOptions, updateScore, type DictationResult, type PublishedScore } from "./lib/api";
import { dictationBlockReason, mergeDictation } from "./lib/dictationMerge";

// HU05 edit page; also hosts HU11 dictation and HU19 file loading (FR-018, FR-022, SCR-007).
const MAX_CONTENT = 1000;

type Values = {
  title: string;
  instrument: string;
  description: string;
  format: PublishedScore["format"];
  content: string;
};

export default function ScoreEditPage({ scoreId }: { scoreId: number }) {
  const [score, setScore] = useState<PublishedScore | null>(null);
  const [values, setValues] = useState<Values>({ title: "", instrument: "", description: "", format: "TEXT", content: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getScore(scoreId)
      .then((loaded) => {
        setScore(loaded);
        setValues({
          title: loaded.title,
          instrument: loaded.instrument,
          description: loaded.description,
          format: loaded.format,
          content: loaded.content,
        });
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, [scoreId]);

  function insertAbc(text: string) {
    setValues((current) => ({ ...current, content: text, format: "ABC" }));
    setErrors((current) => {
      if (!current.content) return current;
      const next = { ...current };
      delete next.content;
      return next;
    });
    window.setTimeout(() => contentRef.current?.focus(), 0);
  }

  function handleDictation(result: DictationResult) {
    const merged = mergeDictation(values.content, values.format, result);
    if ("error" in merged) return merged.error;
    insertAbc(merged.content);
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const localErrors: Record<string, string[]> = {};
    if (!values.content.trim()) localErrors.content = ["El contenido de la partitura es obligatorio."];
    else if (values.content.length > MAX_CONTENT) localErrors.content = ["El contenido no puede superar los 1.000 caracteres."];
    setErrors(localErrors);
    if (Object.keys(localErrors).length) return;

    setSaving(true);
    try {
      // Send format/content only when changed, so editing details of an older score never re-validates untouched content.
      await updateScore(scoreId, {
        title: values.title,
        instrument: values.instrument,
        description: values.description,
        ...(score && values.format !== score.format ? { format: values.format } : {}),
        ...(score && values.content !== score.content ? { content: values.content } : {}),
      });
      window.location.assign(`/scores/${scoreId}`);
    } catch (requestError) {
      const failure = requestError as Error & { fieldErrors?: Record<string, string[]> };
      setErrors(failure.fieldErrors ?? {});
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  }

  if (!score && !error) return <div className="loading-list" role="status"><div className="skeleton-card">Cargando partitura...</div></div>;
  if (!score && error) return <div className="empty-state"><span aria-hidden="true">!</span><h2>No se pudo cargar la partitura</h2><p className="form-error" role="alert">{error}</p><a className="button secondary" href="/">Volver al inicio</a></div>;
  return (
    <>
      <a className="back" href={`/scores/${scoreId}`}>← Volver a la partitura</a>
      <header className="page-heading">
        <div><p className="eyebrow"><span className="dot" /> TU PARTITURA</p><h1>Editar publicación</h1><p>Modifica los datos y el contenido de tu partitura.</p></div>
        <span className="step">EDITAR PARTITURA</span>
      </header>
      <form className="editor-grid" onSubmit={handleSubmit} noValidate>
        <section className="form-card">
          <h2>Detalles de la partitura</h2>
          <p className="form-lead">Actualiza la información que verá la comunidad.</p>
          <div className="form-row">
            <div className={`field ${errors.title ? "has-error" : ""}`}><label htmlFor="edit-title">Título <b>*</b></label><div className="input-wrap"><input id="edit-title" value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} required /></div>{errors.title?.length ? <span className="field-error">{errors.title[0]}</span> : null}</div>
            <div className={`field ${errors.instrument ? "has-error" : ""}`}><label htmlFor="edit-instrument">Instrumento <b>*</b></label><div className="input-wrap"><select id="edit-instrument" value={values.instrument} onChange={(event) => setValues({ ...values, instrument: event.target.value })} required>{(instrumentOptions as readonly string[]).includes(values.instrument) ? null : <option value={values.instrument}>{values.instrument}</option>}{instrumentOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>{errors.instrument?.length ? <span className="field-error">{errors.instrument[0]}</span> : null}</div>
          </div>
          <div className={`field ${errors.description ? "has-error" : ""}`}><label htmlFor="edit-description">Descripción <b>*</b></label><div className="input-wrap"><input id="edit-description" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} required /></div>{errors.description?.length ? <span className="field-error">{errors.description[0]}</span> : null}</div>
          <div className="format-picker">
            <label>Formato de partitura <b>*</b></label>
            <div role="group" aria-label="Formato de partitura">
              <button className={values.format === "TEXT" ? "selected" : ""} type="button" onClick={() => setValues({ ...values, format: "TEXT" })} aria-pressed={values.format === "TEXT"}><strong>Texto sin formato</strong><span>Notas musicales libres</span></button>
              <button className={values.format === "ABC" ? "selected" : ""} type="button" onClick={() => setValues({ ...values, format: "ABC" })} aria-pressed={values.format === "ABC"}><strong>Notación ABC</strong><span>Notación musical en texto</span></button>
            </div>
          </div>
          <div className="input-tools" aria-label="Otras formas de editar la partitura" role="group">
            <DictationPanel title={values.title} disabledReason={dictationBlockReason(values.content, values.format)} onResult={handleDictation} />
            <AbcFileLoader hasContent={Boolean(values.content.trim())} onLoad={insertAbc} />
          </div>
          <div className={`field content-field ${errors.content ? "has-error" : ""}`}>
            <label htmlFor="edit-content">Tu partitura <b>*</b></label>
            <textarea ref={contentRef} id="edit-content" maxLength={MAX_CONTENT} required rows={8} value={values.content} onChange={(event) => setValues({ ...values, content: event.target.value })} aria-invalid={Boolean(errors.content)} aria-describedby={errors.content?.length ? "edit-content-error" : undefined} />
            <div className="field-help"><span>Mantenla clara y fácil de leer.</span><strong>{values.content.length} / 1.000 · Máximo 1.000 caracteres</strong></div>
            {errors.content?.length ? <span className="field-error" id="edit-content-error">{errors.content[0]}</span> : null}
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <div className="form-actions"><a className="button secondary" href={`/scores/${scoreId}`}>Cancelar</a><button className="button primary" type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios →"}</button></div>
        </section>
        <aside className="editor-aside">
          <section className="tip-card"><span aria-hidden="true">♫</span><div><strong>Tu partitura, mejorada.</strong><p>Actualiza los datos para que otros músicos la encuentren y entiendan tu idea.</p></div></section>
          <section className="rules"><h3>Antes de guardar</h3><ul><li>✓ Las mismas reglas que al publicar.</li><li>✓ No superes los 1.000 caracteres.</li><li>✓ En ABC, el dictado se añade al final y respeta tus cabeceras.</li></ul></section>
        </aside>
      </form>
    </>
  );
}
