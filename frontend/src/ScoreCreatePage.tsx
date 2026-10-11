import { useState, type FormEvent } from "react";
import { publishScore, type PublishedScore } from "./lib/api";

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
    if (!values.title) localErrors.title = ["Title is required."];
    if (!values.instrument) localErrors.instrument = ["Instrument is required."];
    if (!values.description) localErrors.description = ["Description is required."];
    if (!values.content.trim()) localErrors.content = ["Score content is required."];
    else if (values.content.length > 1000) {
      localErrors.content = ["Score content must be 1,000 characters or fewer."];
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
    <main className="page-shell">
      <section className="form-panel" aria-labelledby="score-heading">
        <p className="eyebrow">Community</p>
        <h1 id="score-heading">Publish a score</h1>
        <p className="intro">Share a short text score with the community.</p>
        <form className="registration-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="score-title">Title</label>
          <input id="score-title" name="title" required aria-invalid={Boolean(errors.title)} />
          {errors.title?.length ? <FieldError text={errors.title[0]} /> : null}

          <label htmlFor="score-instrument">Instrument</label>
          <input id="score-instrument" name="instrument" required aria-invalid={Boolean(errors.instrument)} />
          {errors.instrument?.length ? <FieldError text={errors.instrument[0]} /> : null}

          <label htmlFor="score-description">Description</label>
          <textarea id="score-description" name="description" required rows={3} aria-invalid={Boolean(errors.description)} />
          {errors.description?.length ? <FieldError text={errors.description[0]} /> : null}

          <label htmlFor="score-format">Format</label>
          <select id="score-format" value={format} onChange={(event) => setFormat(event.target.value as PublishedScore["format"])}>
            <option value="TEXT">Plain text</option>
            <option value="ABC">ABC notation</option>
          </select>

          <label htmlFor="score-content">Score content</label>
          <textarea
            id="score-content"
            name="content"
            maxLength={1000}
            required
            rows={8}
            aria-invalid={Boolean(errors.content)}
            aria-describedby={errors.content?.length ? "score-content-error" : undefined}
          />
          <span className="field-hint">Maximum 1,000 characters.</span>
          {errors.content?.length ? <FieldError id="score-content-error" text={errors.content[0]} /> : null}

          {formError ? <p className="form-error" role="alert">{formError}</p> : null}
          <button type="submit" disabled={isPublishing}>
            {isPublishing ? "Publishing..." : "Publish score"}
          </button>
        </form>
        <p className="form-footer"><a href="/">Cancel and return home</a></p>
      </section>
    </main>
  );
}

function FieldError({ id, text }: { id?: string; text: string }) {
  return <span className="field-error" id={id}>{text}</span>;
}
