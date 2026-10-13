import { useEffect, useState, type FormEvent } from "react";
import {
  addScoreComment,
  deleteComment,
  deleteScore,
  getScore,
  toggleScoreLike,
  updateScore,
  type PublishedScore,
} from "./lib/api";

export default function ScoreDetailPage({ scoreId, currentUserId }: { scoreId: number; currentUserId: number }) {
  const [score, setScore] = useState<PublishedScore | null>(null);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getScore(scoreId).then(setScore).catch((requestError: Error) => setError(requestError.message));
  }, [scoreId]);

  async function handleLike() {
    if (!score) return;
    try {
      const result = await toggleScoreLike(score.id, Boolean(score.is_liked));
      setScore({ ...score, is_liked: result.liked, like_count: result.likeCount });
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!score || !comment.trim()) return;
    setIsSubmitting(true);
    setError("");
    try {
      const newComment = await addScoreComment(score.id, comment.trim());
      setScore({
        ...score,
        comments: [...(score.comments ?? []), newComment],
        comment_count: score.comment_count + 1,
      });
      setComment("");
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!score || !window.confirm("Delete this score?")) return;
    try {
      await deleteScore(score.id);
      window.location.assign("/");
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!score) return;
    const data = new FormData(event.currentTarget);
    setIsSubmitting(true);
    try {
      const updated = await updateScore(score.id, {
        title: String(data.get("title") ?? "").trim(),
        instrument: String(data.get("instrument") ?? "").trim(),
        description: String(data.get("description") ?? "").trim(),
        format: score.format,
        content: String(data.get("content") ?? ""),
      });
      setScore({ ...updated, comments: score.comments });
      setIsEditing(false);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCommentDelete(commentId: number) {
    if (!score) return;
    const currentScore = score;
    try {
      await deleteComment(commentId);
      setScore({
        ...currentScore,
        comments: (currentScore.comments ?? []).filter((item) => item.id !== commentId),
        comment_count: Math.max(0, currentScore.comment_count - 1),
      });
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }

  if (error && !score) {
    return <main className="page-shell"><p className="form-error" role="alert">{error}</p><a href="/">Return home</a></main>;
  }
  if (!score) return <main className="page-shell"><p role="status">Loading score...</p></main>;

  return (
    <main className="page-shell">
      <section className="home-panel" aria-labelledby="score-detail-heading">
        <p className="eyebrow">Community score</p>
        <h1 id="score-detail-heading">{score.title}</h1>
        {isEditing ? (
          <form className="registration-form" onSubmit={handleUpdate}>
            <label htmlFor="edit-title">Title</label>
            <input id="edit-title" name="title" defaultValue={score.title} required />
            <label htmlFor="edit-instrument">Instrument</label>
            <input id="edit-instrument" name="instrument" defaultValue={score.instrument} required />
            <label htmlFor="edit-description">Description</label>
            <textarea id="edit-description" name="description" defaultValue={score.description} required rows={3} />
            <label htmlFor="edit-content">Score content</label>
            <textarea id="edit-content" name="content" defaultValue={score.content} required maxLength={1000} rows={8} />
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save changes"}</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        ) : null}
        <p className="score-meta">{score.instrument} · {score.author} · {score.format}</p>
        {!isEditing ? <><p>{score.description}</p><pre>{score.content}</pre></> : null}
        <div className="score-actions">
          {!score.is_owner ? <button type="button" onClick={handleLike}>{score.is_liked ? "Unlike" : "Like"} ({score.like_count})</button> : null}
          {score.is_owner && !isEditing ? <button type="button" onClick={() => setIsEditing(true)}>Edit score</button> : null}
          {score.is_owner ? <button type="button" onClick={handleDelete}>Delete score</button> : null}
        </div>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <section aria-labelledby="comments-heading">
          <h2 id="comments-heading">Comments ({score.comment_count})</h2>
          {(score.comments ?? []).map((item) => (
            <article className="score-item" key={item.id}>
              <p>{item.body}</p>
              <p className="score-meta">{item.author} · {new Date(item.created_at).toLocaleString()}</p>
              {item.author_id === currentUserId ? <button type="button" onClick={() => handleCommentDelete(item.id)}>Delete comment</button> : null}
            </article>
          ))}
          {!score.is_owner ? (
            <form className="registration-form" onSubmit={handleComment}>
              <label htmlFor="score-comment">Add a comment</label>
              <textarea id="score-comment" value={comment} onChange={(event) => setComment(event.target.value)} rows={3} required />
              <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Comment"}</button>
            </form>
          ) : null}
        </section>
        <p className="form-footer"><a href="/">Back to community</a></p>
      </section>
    </main>
  );
}
