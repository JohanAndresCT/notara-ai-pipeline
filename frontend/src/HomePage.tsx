import { useEffect, useState } from "react";
import type { NotaraUser, PublishedScore } from "./lib/api";
import { getCommunityScores, logoutAccount } from "./lib/api";

export default function HomePage({
  user,
  onLoggedOut,
}: {
  user: NotaraUser | null;
  onLoggedOut: () => void;
}) {
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [scores, setScores] = useState<PublishedScore[]>([]);
  const [feedError, setFeedError] = useState("");
  const [instrument, setInstrument] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user) return;
    setFeedError("");
    getCommunityScores({ page, instrument })
      .then((result) => {
        setScores(result.scores);
        setTotalPages(result.totalPages);
      })
      .catch((error: Error) => setFeedError(error.message));
  }, [user, page, instrument]);

  async function handleLogout() {
    setLogoutError("");
    setIsLoggingOut(true);
    try {
      await logoutAccount();
      onLoggedOut();
    } catch (error) {
      setLogoutError((error as Error).message);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="home-panel">
        <p className="eyebrow">Notara</p>
        {user ? (
          <>
            <h1>Welcome, {user.name}</h1>
            <p className="intro">Your session is active.</p>
            {user.photo_url ? <img className="home-avatar" src={user.photo_url} alt={`${user.name} profile`} /> : null}
            <p className="account-email">{user.email}</p>
            <a className="primary-link" href="/profile">My profile</a>
            <a className="primary-link" href="/scores/new">Publish a score</a>
            {logoutError ? <p className="form-error" role="alert">{logoutError}</p> : null}
            <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
            <section className="score-feed" aria-labelledby="community-heading">
              <h2 id="community-heading">Community scores</h2>
              <label htmlFor="instrument-filter">Filter by instrument</label>
              <input
                id="instrument-filter"
                value={instrument}
                onChange={(event) => {
                  setInstrument(event.target.value);
                  setPage(1);
                }}
                placeholder="e.g. Piano"
              />
              {feedError ? <p className="form-error" role="alert">{feedError}</p> : null}
              {!feedError && scores.length === 0 ? <p className="intro">No scores published yet.</p> : null}
              {scores.map((score) => (
                <article className="score-item" key={score.id}>
                  <div className="score-heading-row">
                    <h3><a href={`/scores/${score.id}`}>{score.title}</a></h3>
                    <span>{score.format === "ABC" ? "ABC notation" : "Plain text"}</span>
                  </div>
                  <p className="score-meta">{score.instrument} · {score.author}</p>
                  <p>{score.description}</p>
                  <pre>{score.content}</pre>
                  <p className="score-meta">{score.like_count} likes · {score.comment_count} comments</p>
                </article>
              ))}
              {totalPages > 1 ? (
                <nav aria-label="Score pages">
                  <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
                  <span>Page {page} of {totalPages}</span>
                  <button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
                </nav>
              ) : null}
            </section>
          </>
        ) : (
          <>
            <h1>A place for musical ideas.</h1>
            <p className="intro">Create an account to join the Notara community.</p>
            <a className="primary-link" href="/login">Log in</a>
            <a className="primary-link" href="/register">Create account</a>
          </>
        )}
      </section>
    </main>
  );
}
