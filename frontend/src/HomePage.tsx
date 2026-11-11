import { useEffect, useRef, useState, type FormEvent } from "react";
import type { NotaraUser, PublishedScore } from "./lib/api";
import { getCommunityScores, getInitials, instrumentOptions, toggleReaction } from "./lib/api";
import PublicHeader from "./PublicHeader";
import Icon from "./Icon";
import StreamerBackground from "./StreamerBackground";

export default function HomePage({ user }: { user: NotaraUser | null }) {
  const [scores, setScores] = useState<PublishedScore[]>([]);
  const [myScores, setMyScores] = useState<PublishedScore[]>([]);
  const [myScoresCount, setMyScoresCount] = useState(0);
  const [feedError, setFeedError] = useState("");
  const [myScoresError, setMyScoresError] = useState("");
  const [isLoadingMyScores, setIsLoadingMyScores] = useState(true);
  const [reactionError, setReactionError] = useState("");
  const [pendingReactions, setPendingReactions] = useState<Set<number>>(() => new Set());
  const [instrument, setInstrument] = useState("");
  const [instrumentInput, setInstrumentInput] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [howVisible, setHowVisible] = useState(false);
  const howRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = howRef.current;
    if (!el || howVisible) return;
    if (typeof IntersectionObserver === "undefined") {
      setHowVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHowVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [user, howVisible]);

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

  useEffect(() => {
    if (!user) return;
    setMyScoresError("");
    setIsLoadingMyScores(true);
    getCommunityScores(1, "", true)
      .then((feed) => {
        setMyScores(feed.scores);
        setMyScoresCount(feed.total_count);
      })
      .catch((error: Error) => setMyScoresError(error.message))
      .finally(() => setIsLoadingMyScores(false));
  }, [user]);

  function applyInstrumentFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setInstrument(instrumentInput);
  }

  async function handleReaction(score: PublishedScore) {
    if (pendingReactions.has(score.id)) return;
    setReactionError("");
    setPendingReactions((pending) => new Set(pending).add(score.id));
    try {
      const result = await toggleReaction(score.id);
      const updateScore = (currentScore: PublishedScore) =>
        currentScore.id === score.id
          ? { ...currentScore, user_reacted: result.reacted, reaction_count: result.reaction_count }
          : currentScore;
      setScores((currentScores) => currentScores.map(updateScore));
      setMyScores((currentScores) => currentScores.map(updateScore));
    } catch (error) {
      setReactionError((error as Error).message);
    } finally {
      setPendingReactions((pending) => {
        const updated = new Set(pending);
        updated.delete(score.id);
        return updated;
      });
    }
  }

  if (!user) {
    return (
      <div className="home-page">
        <PublicHeader current="home" />
        <div className="music-bg" aria-hidden="true">
          <svg viewBox="0 0 1200 400" preserveAspectRatio="none">
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} d={`M0 ${170 + i * 14} C 200 ${90 + i * 14}, 400 ${250 + i * 14}, 600 ${170 + i * 14} S 1000 ${90 + i * 14}, 1200 ${170 + i * 14}`} />
            ))}
          </svg>
          {["♪", "♫", "♩", "♬", "♪", "♫", "♩", "♬", "♫", "♪", "♬", "♩"].map((note, i) => (
            <span key={i} className={`float-note n${i + 1}`}><i>{note}</i></span>
          ))}
        </div>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="dot" /> TU MÚSICA, TU COMUNIDAD</p>
            <h1>Escribe una idea.<br /><em>Compártela. Hazla crecer.</em></h1>
            <p>Comparte melodías, bocetos e ideas musicales. Encuentra inspiración en las creaciones de otros músicos.</p>
            <div className="hero-actions">
              <a className="button primary" href="/register">Únete a la comunidad <Icon name="arrowRight" size={16} /></a>
              <a className="button secondary" href="/login">Ya tengo una cuenta</a>
            </div>
            <p className="hero-note"><Icon name="check" size={14} /> Gratis · Sin archivos ni software adicional</p>
          </div>
          <div className="hero-visual" aria-label="Ejemplo de una partitura compartida">
            <div className="paper-shadow" />
            <article className="score-paper">
              <div className="paper-head">
                <span className="format abc">.ABC</span>
                <span>Guitarra</span>
              </div>
              <h2>Estudio en Sol mayor</h2>
              <p>Pequeño estudio de arpegios para practicar cambios de posición.</p>
              <div className="notation" aria-hidden="true">
                <img src="/images/treble-clef.png" alt="" />
                <div>
                  <i /><i /><i /><i /><i />
                  <b>♩ ♪ ♫　♩　♪ ♩</b>
                </div>
              </div>
              <div className="paper-author">
                <div className="avatar tone-0">LV</div>
                <span>
                  <strong>Lucía Vega</strong>
                  <small>Hace 12 min</small>
                </span>
                <span>
                  <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
                  </svg>
                  24
                </span>
                <span>
                  <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
                  </svg>
                  5
                </span>
              </div>
            </article>
            <span className="floating-note note-one" aria-hidden="true"><Icon name="music" size={20} /></span>
            <span className="floating-note note-two" aria-hidden="true"><Icon name="heart" size={20} filled /></span>
          </div>
        </section>
        <section className={`how${howVisible ? " in-view" : ""}`} ref={howRef}>
          <StreamerBackground />
          <p className="eyebrow">ASÍ DE FÁCIL</p>
          <h2>Tu próxima idea empieza aquí.</h2>
          <p>Un espacio abierto para compartir, descubrir y crecer con la música.</p>
          <div className="steps">
            <div><span>01</span><i><Icon name="share" size={22} /></i><h3>Comparte una partitura</h3><p>Anota una idea musical y compártela con la comunidad.</p></div>
            <div><span>02</span><i><Icon name="search" size={22} /></i><h3>Encuentra inspiración</h3><p>Explora ideas de otros músicos y descubre nuevos sonidos.</p></div>
            <div><span>03</span><i><Icon name="heart" size={22} /></i><h3>Conecta con la música</h3><p>Reacciona y comenta las partituras que te gustan.</p></div>
          </div>
        </section>
        <footer><a className="logo" href="/" aria-label="Inicio de Notara"><span className="logo-mark" aria-hidden="true"><Icon name="music" size={16} /></span><span>Notara</span></a><p>Un poco más de música en el mundo.</p><span>© {new Date().getFullYear()} Notara</span></footer>
      </div>
    );
  }

  return (
    <>
      <header className="feed-header dash-hero">
        <StreamerBackground variant="dash" />
        <div className="dash-hero-copy">
          <p className="eyebrow dashboard-date"><span className="dot" /> {formatDashboardDate()}</p>
          <h1>Qué bueno verte, {user.name.split(" ")[0]}.</h1>
          <p>Descubre una nueva idea o comparte una propia.</p>
          <div className="dash-stats">
            <span><Icon name="music" size={16} /> {myScoresCount} {myScoresCount === 1 ? "partitura tuya" : "partituras tuyas"}</span>
            <span><Icon name="share" size={16} /> {totalCount} en la comunidad</span>
          </div>
        </div>
        <a className="button dash-cta" href="/scores/new"><Icon name="plus" size={16} /> Crear partitura</a>
      </header>
      <section aria-labelledby="my-scores-heading" className="recent-section">
        <div className="section-heading">
          <i className="heading-badge" aria-hidden="true"><Icon name="music" size={16} /></i>
          <h2 id="my-scores-heading">Mis publicaciones recientes</h2>
          <span>{myScoresCount}</span>
        </div>
        {myScoresError ? <p className="form-error" role="alert">{myScoresError}</p> : null}
        {isLoadingMyScores && !myScoresError ? <p className="recent-loading">Cargando tus publicaciones...</p> : null}
        {!isLoadingMyScores && !myScoresError && myScores.length === 0 ? (
          <div className="recent-empty">
            <p>Aún no tienes publicaciones.</p>
            <a href="/scores/new">Comparte tu primera partitura <Icon name="arrowRight" size={14} /></a>
          </div>
        ) : null}
        {!isLoadingMyScores && !myScoresError && myScores.length > 0 ? (
          <div className="post-list">
            {myScores.map((score, index) => (
              <ScoreCard
                key={score.id}
                index={index}
                score={score}
                isReacting={pendingReactions.has(score.id)}
                onReaction={() => handleReaction(score)}
              />
            ))}
          </div>
        ) : null}
      </section>
      <section aria-labelledby="community-heading">
        <div className="feed-tools">
          <div className="section-title"><i className="heading-badge alt" aria-hidden="true"><Icon name="share" size={16} /></i><h2 id="community-heading">Partituras de la comunidad</h2><span>{totalCount} publicaciones</span></div>
          <form className="filter-actions" onSubmit={applyInstrumentFilter}>
            <label className="filter" htmlFor="instrument-filter">
              <Icon name="search" size={16} />
              <select id="instrument-filter" value={instrumentInput} onChange={(event) => setInstrumentInput(event.target.value)}>
                <option value="">Todos los instrumentos</option>
                {instrumentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <button className="button secondary small" type="submit">Filtrar</button>
            {instrument ? <button className="button ghost small" type="button" onClick={() => { setInstrumentInput(""); setInstrument(""); setPage(1); }}>Limpiar</button> : null}
          </form>
        </div>
        {feedError ? <p className="form-error" role="alert">{feedError}</p> : null}
        {reactionError ? <p className="form-error" role="alert">{reactionError}</p> : null}
        {!feedError && scores.length === 0 ? (
          <div className="empty-state"><span aria-hidden="true"><Icon name="music" size={24} /></span><h3>{instrument ? "No hay partituras" : "Comparte la primera"}</h3><p>{instrument ? "Prueba con otro instrumento." : "La comunidad espera su primera idea musical."}</p>{!instrument ? <a className="button primary" href="/scores/new">Crear partitura</a> : null}</div>
        ) : (
          <div className="post-list">
            {scores.map((score, index) => (
              <ScoreCard
                key={score.id}
                index={index}
                score={score}
                isReacting={pendingReactions.has(score.id)}
                onReaction={() => handleReaction(score)}
              />
            ))}
          </div>
        )}
        {!feedError && totalCount > 0 ? (
          <nav className="pagination" aria-label="Páginas de partituras">
            <button type="button" disabled={!hasPrevious} onClick={() => setPage((current) => current - 1)}><Icon name="arrowLeft" size={16} /> Anterior</button>
            <span>Página {page}</span>
            <button type="button" disabled={!hasNext} onClick={() => setPage((current) => current + 1)}>Siguiente <Icon name="arrowRight" size={16} /></button>
          </nav>
        ) : null}
      </section>
    </>
  );
}

function avatarHue(name: string) {
  let sum = 0;
  for (const character of name) sum += character.charCodeAt(0);
  return sum % 5;
}

function ScoreCard({
  score,
  index = 0,
  isReacting,
  onReaction,
}: {
  score: PublishedScore;
  index?: number;
  isReacting: boolean;
  onReaction: () => void;
}) {
  return (
    <article className={`post-card ${score.format === "ABC" ? "is-abc" : "is-text"}`} style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}>
      <div className="post-meta">
        <div className={`avatar hue-${avatarHue(score.author)}`}>{getInitials(score.author) || "N"}</div>
        <div><strong>{score.author}</strong><span>{formatRelativeDate(score.created_at)}</span></div>
        <span className="instrument">{score.instrument}</span>
      </div>
      <div className="post-body">
        <div>
          <span className={`format ${score.format === "ABC" ? "abc" : "text"}`}>{score.format === "ABC" ? "NOTACIÓN ABC" : "PARTITURA EN TEXTO"}</span>
          <h3>{score.title}</h3>
          <p>{score.description}</p>
        </div>
        <pre className={score.format === "ABC" ? "abc-preview" : "text-preview"}>{score.content}</pre>
      </div>
      <div className="post-footer">
        <button
          className={`post-reaction-button${score.user_reacted ? " liked" : ""}`}
          type="button"
          onClick={onReaction}
          disabled={isReacting}
          aria-pressed={Boolean(score.user_reacted)}
          aria-label={`${score.user_reacted ? "Quitar me gusta" : "Me gusta"}: ${score.title}. ${score.reaction_count ?? 0} me gusta`}
        >
          <Icon name="heart" size={20} filled={Boolean(score.user_reacted)} className="reaction-icon" />
          {score.reaction_count ?? 0} me gusta
        </button>
        <span><Icon name="comment" size={20} className="reaction-icon" />{score.comment_count} comentarios</span>
        <a href={`/scores/${score.id}`}>Ver partitura <Icon name="arrowRight" size={14} /></a>
      </div>
    </article>
  );
}

function formatDashboardDate() {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date()).toLocaleUpperCase("es-ES");
}

function formatRelativeDate(date: string) {
  const timestamp = Date.parse(date);
  if (Number.isNaN(timestamp)) return "Fecha no disponible";

  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const intervals: { limit: number; seconds: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { limit: 60, seconds: 1, unit: "second" },
    { limit: 60 * 60, seconds: 60, unit: "minute" },
    { limit: 24 * 60 * 60, seconds: 60 * 60, unit: "hour" },
    { limit: 7 * 24 * 60 * 60, seconds: 24 * 60 * 60, unit: "day" },
  ];
  const formatter = new Intl.RelativeTimeFormat("es-ES", { numeric: "auto" });
  const absoluteSeconds = Math.abs(seconds);
  const interval = intervals.find(({ limit }) => absoluteSeconds < limit);

  if (interval) {
    return formatter.format(Math.round(seconds / interval.seconds), interval.unit);
  }
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(timestamp);
}
