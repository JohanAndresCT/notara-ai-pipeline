import { useEffect, useState, type FormEvent } from "react";
import {
  addComment,
  deleteScore,
  getComments,
  getScore,
  toggleReaction,
  type NotaraUser,
  type PublishedScore,
  type ScoreComment,
} from "./lib/api";

export default function ScoreDetailPage({
  scoreId,
  user,
}: {
  scoreId: number;
  user: NotaraUser;
}) {
  const [score, setScore] = useState<PublishedScore | null>(null);
  const [comments, setComments] = useState<ScoreComment[]>([]);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingComment, setIsSavingComment] = useState(false);

  useEffect(() => {
    Promise.all([getScore(scoreId), getComments(scoreId)])
      .then(([loadedScore, loadedComments]) => {
        setScore(loadedScore);
        setComments(loadedComments);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false));
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
    if (!comment.trim()) return;
    setIsSavingComment(true);
    setError("");
    try {
      const created = await addComment(scoreId, comment);
      setComments([...comments, created]);
      setComment("");
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setIsSavingComment(false);
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

  if (isLoading) return <main className="page-shell"><p role="status">Loading score...</p></main>;
  if (!score) return <main className="page-shell"><p className="form-error" role="alert">{error || "Score not found."}</p></main>;

  const isOwner = score.author_id === user.id;
  return (
    <main className="page-shell detail-page">
      <a className="back" href="/">Back to community</a>
      <article className="detail-card">
        <header className="detail-top">
          <span>{score.author}</span>
          {isOwner ? (
            <div className="owner-actions">
              <a className="button secondary small" href={`/scores/${score.id}/edit`}>Edit</a>
              <button className="button small danger-button" type="button" onClick={handleDelete}>Delete</button>
            </div>
          ) : null}
        </header>
        <section className="detail-title">
          <span className="format">{score.format === "ABC" ? "ABC notation" : "Plain text"}</span>
          <span className="instrument">{score.instrument}</span>
          <h1>{score.title}</h1>
          <p>{score.description}</p>
        </section>
        <section className={`score ${score.format === "ABC" ? "abc" : "text"}`}>
          <pre>{score.content}</pre>
        </section>
        <div className="detail-reactions">
          {!isOwner ? (
            <button type="button" className={score.user_reacted ? "liked" : ""} onClick={handleReaction}>
              {score.user_reacted ? "Unlike" : "Like"} · {score.reaction_count}
            </button>
          ) : <span>{score.reaction_count} reactions</span>}
        </div>
      </article>
      <section className="comments-card" aria-labelledby="comments-heading">
        <h2 id="comments-heading">Comments</h2>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <form className="comment-form" onSubmit={handleComment}>
          <textarea value={comment} maxLength={500} onChange={(event) => setComment(event.target.value)} placeholder="Share a thought" />
          <button className="button primary small" type="submit" disabled={isSavingComment || !comment.trim()}>
            {isSavingComment ? "Sending..." : "Comment"}
          </button>
        </form>
        {comments.map((item) => (
          <article className="comment" key={item.id}>
            <div><strong>{item.author}</strong><span> · {new Date(item.created_at).toLocaleString()}</span><div>{item.body}</div></div>
          </article>
        ))}
      </section>
    </main>
  );
}
