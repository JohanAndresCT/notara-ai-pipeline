import { useEffect, useState, type FormEvent } from "react";
import {
  addComment,
  deleteComment,
  deleteScore,
  getComments,
  getScore,
  toggleReaction,
  updateScore,
  type PublishedScore,
  type ScoreComment,
} from "./lib/api";

export default function ScoreDetailPage({
  scoreId,
  currentUserId,
}: {
  scoreId: number;
  currentUserId: number;
}) {
  const [score, setScore] = useState<PublishedScore | null>(null);
  const [comments, setComments] = useState<ScoreComment[]>([]);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    Promise.all([getScore(scoreId), getComments(scoreId)])
      .then(([loadedScore, loadedComments]) => {
        setScore(loadedScore);
        setComments(loadedComments);
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, [scoreId]);

  async function handleReaction() {
    if (!score) return;
    try {
      const result = await toggleReaction(score.id);
      setScore({ ...score, user_reacted: result.reacted, reaction_count: result.reaction_count });
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
      const created = await addComment(score.id, comment.trim());
      setComments([...comments, created]);
      setScore({ ...score, comment_count: score.comment_count + 1 });
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
      setScore(updated);
      setIsEditing(false);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCommentDelete(commentId: number) {
    if (!score) return;
    try {
      await deleteComment(commentId);
      setComments(comments.filter((item) => item.id !== commentId));
      setScore({ ...score, comment_count: Math.max(0, score.comment_count - 1) });
    } catch (requestError) {
      setError((requestError as Error).message);
    }
  }

  if (error && !score) {
    return <main className="page-shell"><p className="form-error" role="alert">{error}</p><a href="/">Return home</a></main>;
  }
  if (!score) return <main className="page-shell"><p role="status">Loading score...</p></main>;

  const isOwner = score.author_id === currentUserId;
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
          {!isOwner ? (
            <button type="button" onClick={handleReaction}>
              {score.user_reacted ? "Unlike" : "Like"} ({score.reaction_count})
            </button>
          ) : <span>{score.reaction_count} reactions</span>}
          {isOwner && !isEditing ? <button type="button" onClick={() => setIsEditing(true)}>Edit score</button> : null}
          {isOwner ? <button type="button" onClick={handleDelete}>Delete score</button> : null}
        </div>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <section aria-labelledby="comments-heading">
          <h2 id="comments-heading">Comments ({score.comment_count})</h2>
          {comments.map((item) => (
            <article className="score-item" key={item.id}>
              <p>{item.body}</p>
              <p className="score-meta">{item.author} · {new Date(item.created_at).toLocaleString()}</p>
              {item.author_id === currentUserId ? (
                <button type="button" onClick={() => handleCommentDelete(item.id)}>Delete comment</button>
              ) : null}
            </article>
          ))}
          {!isOwner ? (
            <form className="registration-form" onSubmit={handleComment}>
              <label htmlFor="score-comment">Add a comment</label>
              <textarea
                id="score-comment"
                value={comment}
                maxLength={500}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                required
              />
              <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Comment"}</button>
            </form>
          ) : null}
        </section>
        <p className="form-footer"><a href="/">Back to community</a></p>
      </section>
    </main>
  );
}
