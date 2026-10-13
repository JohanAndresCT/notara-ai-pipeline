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

  if (!score && !error) return <main className="page-shell"><p role="status">Loading score...</p></main>;
  return (
    <main className="page-shell">
      <section className="form-panel">
        <a className="back" href={`/scores/${scoreId}`}>Back to score</a>
        <h1>Edit score</h1>
        <form className="registration-form" onSubmit={handleSubmit}>
          <label htmlFor="edit-title">Title</label>
          <input id="edit-title" value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} required />
          <label htmlFor="edit-instrument">Instrument</label>
          <input id="edit-instrument" value={values.instrument} onChange={(event) => setValues({ ...values, instrument: event.target.value })} required />
          <label htmlFor="edit-description">Description</label>
          <textarea id="edit-description" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} required rows={4} />
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
        </form>
      </section>
    </main>
  );
}
