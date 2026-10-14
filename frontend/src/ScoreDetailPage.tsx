import { useEffect, useState, type FormEvent } from "react";
import {
  addComment,
  deleteComment,
  deleteScore,
  getComments,
  getInitials,
  getScore,
  toggleReaction,
  type PublishedScore,
  type ScoreComment,
} from "./lib/api";

export default function ScoreDetailPage({
  scoreId,
  currentUserId,
  currentUserName,
}: {
  scoreId: number;
  currentUserId: number;
  currentUserName: string;
}) {
  const [score, setScore] = useState<PublishedScore | null>(null);
  const [comments, setComments] = useState<ScoreComment[]>([]);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!score || !window.confirm("¿Quieres eliminar esta partitura?")) return;
    try {
      await deleteScore(score.id);
      window.location.assign("/");
    } catch (requestError) {
      setError((requestError as Error).message);
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
    return <div className="empty-state"><span aria-hidden="true">!</span><h2>No se pudo cargar la partitura</h2><p className="form-error" role="alert">{error}</p><a className="button secondary" href="/">Volver al inicio</a></div>;
  }
  if (!score) return <div className="loading-list" role="status"><div className="skeleton-card">Cargando partitura...</div></div>;

  const isOwner = score.author_id === currentUserId;
  return (
    <div className="detail-page">
      <a className="back" href="/">← Volver al inicio</a>
      <article className="detail-card" aria-labelledby="score-detail-heading">
        <div className="detail-top">
          <span className={`format ${score.format === "ABC" ? "abc" : "text"}`}>{score.format === "ABC" ? "NOTACIÓN ABC" : "PARTITURA EN TEXTO"}</span>
          {isOwner ? (
            <div className="owner-actions">
              <a className="button secondary small" href={`/scores/${score.id}/edit`}>Editar</a>
              <button className="danger" type="button" onClick={handleDelete}>Eliminar</button>
            </div>
          ) : null}
        </div>
        <>
            <div className="detail-title">
              <span className="instrument">{score.instrument}</span>
              <h1 id="score-detail-heading">{score.title}</h1>
              <p>Compartida por <strong>{score.author}</strong></p>
              <p>{score.description}</p>
            </div>
            <section className={`score ${score.format === "ABC" ? "abc" : "text"}`} aria-label="Notación de la partitura">
              <div className="score-bar"><span>{score.format === "ABC" ? "NOTACIÓN ABC" : "TEXTO SIN FORMATO"}</span><span>{score.content.length} caracteres</span></div>
              <pre>{score.content}</pre>
            </section>
            <div className="detail-reactions">
              <button className={`detail-reaction-button${score.user_reacted ? " liked" : ""}`} type="button" onClick={handleReaction} aria-pressed={score.user_reacted}>
                <span className="reaction-emoji" aria-hidden="true">{score.user_reacted ? "❤️" : "🤍"}</span>
                {score.user_reacted ? "Te gusta" : "Me gusta"} · {score.reaction_count}
              </button>
              <span><span className="reaction-emoji comment-emoji" aria-hidden="true">💬</span>{score.comment_count} comentarios</span>
            </div>
        </>
      </article>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <section className="comments-card" aria-labelledby="comments-heading">
        <h2 id="comments-heading">Comentarios de la comunidad <span>({score.comment_count})</span></h2>
        <form className="comment-form" onSubmit={handleComment}>
          <span className="avatar tone-1" aria-hidden="true">{getInitials(currentUserName) || "N"}</span>
          <div><textarea id="score-comment" aria-label="Añadir un comentario" placeholder="Escribe un comentario..." value={comment} maxLength={500} onChange={(event) => setComment(event.target.value)} rows={3} required /><button className="button primary small" type="submit" disabled={isSubmitting}>{isSubmitting ? "Enviando..." : "Comentar"}</button></div>
        </form>
        {comments.length === 0 ? <p className="comments-empty">Todavía no hay comentarios. Inicia la conversación.</p> : null}
        {comments.map((item) => (
          <article className="comment" key={item.id}>
            <span className="avatar tone-2" aria-hidden="true">{getInitials(item.author) || "N"}</span>
            <div><p><strong>{item.author}</strong><span>{new Date(item.created_at).toLocaleString("es-ES")}</span></p><div>{item.body}</div></div>
            {item.author_id === currentUserId ? <button className="comment-delete" type="button" onClick={() => handleCommentDelete(item.id)}>Eliminar</button> : null}
          </article>
        ))}
      </section>
    </div>
  );
}
