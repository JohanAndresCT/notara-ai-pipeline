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

  useEffect(() => {
    if (!user) return;
    getCommunityScores()
      .then(setScores)
      .catch((error: Error) => setFeedError(error.message));
  }, [user]);

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
              {feedError ? <p className="form-error" role="alert">{feedError}</p> : null}
              {!feedError && scores.length === 0 ? <p className="intro">No scores published yet.</p> : null}
              {scores.map((score) => (
                <article className="score-item" key={score.id}>
                  <div className="score-heading-row">
                    <h3>{score.title}</h3>
                    <span>{score.format === "ABC" ? "ABC notation" : "Plain text"}</span>
                  </div>
                  <p className="score-meta">{score.instrument} · {score.author}</p>
                  <p>{score.description}</p>
                  <pre>{score.content}</pre>
                </article>
              ))}
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
