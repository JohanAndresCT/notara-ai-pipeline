import { useEffect, useState, type FormEvent } from "react";
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
  const [instrumentInput, setInstrumentInput] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    setFeedError("");
    getCommunityScores(page, instrument)
      .then((feed) => {
        setScores(feed.scores);
        setHasNext(feed.has_next);
        setHasPrevious(feed.has_previous);
        setTotalCount(feed.total_count);
      })
      .catch((error: Error) => setFeedError(error.message));
  }, [user, page, instrument]);

  function applyInstrumentFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setInstrument(instrumentInput);
  }

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
              <form className="filter" onSubmit={applyInstrumentFilter}>
                <label htmlFor="instrument-filter">Instrument</label>
                <input
                  id="instrument-filter"
                  value={instrumentInput}
                  onChange={(event) => setInstrumentInput(event.target.value)}
                  placeholder="All instruments"
                />
                <button type="submit">Filter</button>
                {instrument ? (
                  <button type="button" onClick={() => { setInstrumentInput(""); setInstrument(""); setPage(1); }}>
                    Clear
                  </button>
                ) : null}
              </form>
              {feedError ? <p className="form-error" role="alert">{feedError}</p> : null}
              {!feedError && scores.length === 0 ? (
                <p className="intro">{instrument ? "No scores match this instrument." : "No scores published yet."}</p>
              ) : null}
              {scores.map((score) => (
                <article className="score-item" key={score.id}>
                  <div className="score-heading-row">
                  <h3><a href={`/scores/${score.id}`}>{score.title}</a></h3>
                    <span>{score.format === "ABC" ? "ABC notation" : "Plain text"}</span>
                  </div>
                  <p className="score-meta">{score.instrument} · {score.author}</p>
                  <p>{score.description}</p>
                  <pre>{score.content}</pre>
                  <a className="primary-link" href={`/scores/${score.id}`}>View score</a>
                </article>
              ))}
              {!feedError && totalCount > 0 ? (
                <nav className="pagination" aria-label="Score pages">
                  <button type="button" disabled={!hasPrevious} onClick={() => setPage((current) => current - 1)}>
                    Previous
                  </button>
                  <span>Page {page}</span>
                  <button type="button" disabled={!hasNext} onClick={() => setPage((current) => current + 1)}>
                    Next
                  </button>
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
