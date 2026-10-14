import { useEffect, useState, type FormEvent } from "react";
import { getScore, updateScore, type PublishedScore } from "./lib/api";

export default function ScoreEditPage({ scoreId }: { scoreId: number }) {
  const [score, setScore] = useState<PublishedScore | null>(null);
  const [values, setValues] = useState({ title: "", instrument: "", description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getScore(scoreId)
      .then((loaded) => {
        setScore(loaded);
        setValues({ title: loaded.title, instrument: loaded.instrument, description: loaded.description });
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, [scoreId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateScore(scoreId, values);
      window.location.assign(`/scores/${scoreId}`);
    } catch (requestError) {
      setError((requestError as Error).message);
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
        <div><p className="eyebrow"><span className="dot" /> TU PARTITURA</p><h1>Editar publicación</h1><p>Modifica los datos de tu partitura.</p></div>
        <span className="step">EDITAR PARTITURA</span>
      </header>
      <form className="editor-grid" onSubmit={handleSubmit}>
        <section className="form-card">
          <h2>Detalles de la partitura</h2>
          <p className="form-lead">Actualiza la información que verá la comunidad.</p>
          <div className="form-row">
            <div className="field"><label htmlFor="edit-title">Título <b>*</b></label><div className="input-wrap"><input id="edit-title" value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} required /></div></div>
            <div className="field"><label htmlFor="edit-instrument">Instrumento <b>*</b></label><div className="input-wrap"><input id="edit-instrument" value={values.instrument} onChange={(event) => setValues({ ...values, instrument: event.target.value })} required /></div></div>
          </div>
          <div className="field"><label htmlFor="edit-description">Descripción <b>*</b></label><div className="input-wrap"><input id="edit-description" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} required /></div></div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <div className="form-actions"><a className="button secondary" href={`/scores/${scoreId}`}>Cancelar</a><button className="button primary" type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar cambios →"}</button></div>
        </section>
        <aside className="editor-aside">
          <section className="tip-card"><span aria-hidden="true">♫</span><div><strong>Tu partitura, mejorada.</strong><p>Actualiza los datos para que otros músicos la encuentren y entiendan tu idea.</p></div></section>
          <section className="rules"><h3>El contenido se conserva</h3><ul><li>✓ El título y el instrumento facilitan que la encuentren.</li><li>✓ Se conserva la notación original.</li></ul></section>
        </aside>
      </form>
    </>
  );
}
