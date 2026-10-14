import { useState, type FormEvent } from "react";
import { instrumentOptions, publishScore, type PublishedScore } from "./lib/api";

const emptyErrors: Record<string, string[]> = {};

export default function ScoreCreatePage() {
  const [format, setFormat] = useState<PublishedScore["format"]>("TEXT");
  const [errors, setErrors] = useState(emptyErrors);
  const [formError, setFormError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors(emptyErrors);
    setFormError("");
    setIsPublishing(true);
    const data = new FormData(event.currentTarget);
    const values = {
      title: String(data.get("title") ?? "").trim(),
      instrument: String(data.get("instrument") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(),
      format,
      content: String(data.get("content") ?? ""),
    };
    const localErrors: Record<string, string[]> = {};
    if (!values.title) localErrors.title = ["El título es obligatorio."];
    if (!values.instrument) localErrors.instrument = ["El instrumento es obligatorio."];
    if (!values.description) localErrors.description = ["La descripción es obligatoria."];
    if (!values.content.trim()) localErrors.content = ["El contenido de la partitura es obligatorio."];
    else if (values.content.length > 1000) {
      localErrors.content = ["El contenido no puede superar los 1.000 caracteres."];
    }
    if (Object.keys(localErrors).length) {
      setErrors(localErrors);
      setIsPublishing(false);
      return;
    }

    try {
      await publishScore(values);
      window.location.assign("/");
    } catch (error) {
      const requestError = error as Error & { fieldErrors?: Record<string, string[]> };
      setErrors(requestError.fieldErrors ?? emptyErrors);
      setFormError(requestError.message);
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <>
      <a className="back" href="/">← Volver al inicio</a>
      <header className="page-heading">
        <div><p className="eyebrow"><span className="dot" /> COMPARTE CON TU COMUNIDAD</p><h1 id="score-heading">Crear partitura</h1><p>Convierte una idea musical en algo que otros puedan descubrir.</p></div>
        <span className="step">NUEVA PARTITURA</span>
      </header>
      <form className="editor-grid" onSubmit={handleSubmit} noValidate>
        <section className="form-card" aria-labelledby="score-details-heading">
          <h2 id="score-details-heading">Detalles de la partitura</h2>
          <p className="form-lead">Añade algunos datos para que otros músicos la encuentren.</p>
          <div className="form-row">
            <div className={`field ${errors.title ? "has-error" : ""}`}><label htmlFor="score-title">Título <b>*</b></label><div className="input-wrap"><input id="score-title" name="title" placeholder="p. ej., Mañana en Sol" required aria-invalid={Boolean(errors.title)} /></div>{errors.title?.length ? <FieldError text={errors.title[0]} /> : null}</div>
            <div className={`field ${errors.instrument ? "has-error" : ""}`}><label htmlFor="score-instrument">Instrumento <b>*</b></label><div className="input-wrap"><select id="score-instrument" name="instrument" defaultValue="" required aria-invalid={Boolean(errors.instrument)}><option value="" disabled>Selecciona un instrumento</option>{instrumentOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>{errors.instrument?.length ? <FieldError text={errors.instrument[0]} /> : null}</div>
          </div>
          <div className={`field ${errors.description ? "has-error" : ""}`}><label htmlFor="score-description">Descripción <b>*</b></label><div className="input-wrap"><input id="score-description" name="description" placeholder="¿Qué inspiró esta partitura?" required aria-invalid={Boolean(errors.description)} /></div>{errors.description?.length ? <FieldError text={errors.description[0]} /> : null}</div>
          <div className="format-picker">
            <label>Formato de partitura <b>*</b></label>
            <div role="group" aria-label="Formato de partitura">
              <button className={format === "TEXT" ? "selected" : ""} type="button" onClick={() => setFormat("TEXT")} aria-pressed={format === "TEXT"}><strong>Texto sin formato</strong><span>Notas musicales libres</span></button>
              <button className={format === "ABC" ? "selected" : ""} type="button" onClick={() => setFormat("ABC")} aria-pressed={format === "ABC"}><strong>Notación ABC</strong><span>Notación musical en texto</span></button>
            </div>
          </div>
          <div className={`field content-field ${errors.content ? "has-error" : ""}`}>
            <label htmlFor="score-content">Tu partitura <b>*</b></label>
            <textarea id="score-content" name="content" maxLength={1000} required rows={8} placeholder={format === "ABC" ? "X:1&#10;T:Mañana en Sol&#10;M:4/4&#10;L:1/8&#10;K:G&#10;GABc d2 B2" : "Escribe aquí tu idea musical..."} aria-invalid={Boolean(errors.content)} aria-describedby={errors.content?.length ? "score-content-error" : undefined} />
            <div className="field-help"><span>Mantenla clara y fácil de leer.</span><strong>Máximo 1.000 caracteres</strong></div>
            {errors.content?.length ? <FieldError id="score-content-error" text={errors.content[0]} /> : null}
          </div>
          {formError ? <p className="form-error" role="alert">{formError}</p> : null}
          <div className="form-actions"><a className="button secondary" href="/">Cancelar</a><button className="button primary" type="submit" disabled={isPublishing}>{isPublishing ? "Publicando..." : "Crear partitura →"}</button></div>
        </section>
        <aside className="editor-aside">
          <section className="tip-card"><span aria-hidden="true">♫</span><div><strong>Una pequeña idea puede llegar lejos.</strong><p>Comparte una melodía, un ejercicio o un boceto. Tu partitura puede inspirar a alguien.</p></div></section>
          <section className="rules"><h3>Antes de publicar</h3><ul><li>✓ Añade un título y un instrumento.</li><li>✓ No superes los 1.000 caracteres.</li><li>✓ Usa saltos de línea para facilitar la lectura.</li></ul></section>
        </aside>
      </form>
    </>
  );
}

function FieldError({ id, text }: { id?: string; text: string }) {
  return <span className="field-error" id={id}>{text}</span>;
}
