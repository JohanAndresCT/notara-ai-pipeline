import { useEffect, useRef, useState, type FormEvent } from "react";
import type { NotaraUser, PublishedScore } from "./lib/api";
import { getCommunityScores, getInitials, instrumentOptions, toggleReaction } from "./lib/api";
import PublicHeader from "./PublicHeader";

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
              <a className="button primary" href="/register">Únete a la comunidad <span aria-hidden="true">→</span></a>
              <a className="button secondary" href="/login">Ya tengo una cuenta</a>
            </div>
            <p className="hero-note"><span aria-hidden="true">✓</span> Gratis · Sin archivos ni software adicional</p>
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
            <span className="floating-note note-one" aria-hidden="true">♪</span>
            <span className="floating-note note-two" aria-hidden="true">♩</span>
          </div>
        </section>
        <section className={`how${howVisible ? " in-view" : ""}`} ref={howRef}>
          <div className="how-bg" aria-hidden="true">
            <svg viewBox="0 0 1440 600" preserveAspectRatio="none">
              <defs>
                {/* Bocinas tipo cono con aros concéntricos bien contrastados */}
                <radialGradient id="speakerConeL" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0f3830" />
                  <stop offset="20%" stopColor="#a3e635" />
                  <stop offset="38%" stopColor="#ffffff" />
                  <stop offset="55%" stopColor="#1f6355" />
                  <stop offset="72%" stopColor="#ffffff" />
                  <stop offset="88%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#174c42" />
                </radialGradient>
                <radialGradient id="speakerConeR" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#174c42" />
                  <stop offset="22%" stopColor="#ffffff" />
                  <stop offset="42%" stopColor="#16a34a" />
                  <stop offset="60%" stopColor="#d9f99d" />
                  <stop offset="78%" stopColor="#ffffff" />
                  <stop offset="92%" stopColor="#0f3830" />
                  <stop offset="100%" stopColor="#86efac" />
                </radialGradient>
              </defs>

              {/* Remolinos y florituras estilo Frutiger Metro / 2000s vector - Lado Izquierdo */}
              <g className="swirl-group swirl-left-1">
                <path d="M-50 630 C 50 500, 160 380, 150 210 C 140 70, 240 20, 320 60 C 390 100, 390 200, 310 240 C 230 270, 170 210, 200 150 C 220 110, 270 120, 270 160" fill="none" stroke="#1f6355" strokeWidth="28" strokeLinecap="round" opacity="0.65" />
              </g>
              <g className="swirl-group swirl-left-2">
                <path d="M-70 650 C 60 540, 190 420, 220 280 C 250 140, 190 40, 80 60 C -10 80, -20 190, 50 240 C 110 280, 190 240, 180 160 C 170 110, 110 120, 120 170" fill="none" stroke="#16a34a" strokeWidth="22" strokeLinecap="round" opacity="0.75" />
              </g>
              <g className="swirl-group swirl-left-3">
                <path d="M-30 670 C 80 570, 120 450, 260 380 C 360 330, 410 420, 340 480 C 270 530, 190 470, 220 400 C 240 350, 300 370, 290 420" fill="none" stroke="#65a30d" strokeWidth="18" strokeLinecap="round" opacity="0.7" />
              </g>
              <g className="swirl-group swirl-left-4">
                <path d="M-10 680 C 90 590, 180 470, 160 360 C 140 240, 40 220, 0 280 C -30 330, 10 390, 60 380 C 100 370, 110 310, 70 300" fill="none" stroke="#84cc16" strokeWidth="15" strokeLinecap="round" opacity="0.8" />
              </g>
              <g className="swirl-group swirl-left-5">
                <path d="M-60 520 C 50 450, 150 350, 250 370 C 320 385, 340 460, 270 500 C 210 530, 150 470, 180 420" fill="none" stroke="#a3e635" strokeWidth="12" strokeLinecap="round" opacity="0.85" />
              </g>
              {/* Zarcillo fino extra */}
              <g className="swirl-group swirl-left-2">
                <path d="M10 680 C 80 520, 100 320, 220 220 C 290 160, 350 200, 340 260" fill="none" stroke="#bef264" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
              </g>

              {/* Remolinos y florituras estilo Frutiger Metro - Lado Derecho */}
              <g className="swirl-group swirl-right-1">
                <path d="M1490 630 C 1390 500, 1280 380, 1290 210 C 1300 70, 1200 20, 1120 60 C 1050 100, 1050 200, 1130 240 C 1210 270, 1270 210, 1240 150 C 1220 110, 1170 120, 1170 160" fill="none" stroke="#1f6355" strokeWidth="28" strokeLinecap="round" opacity="0.65" />
              </g>
              <g className="swirl-group swirl-right-2">
                <path d="M1510 650 C 1380 540, 1250 420, 1220 280 C 1190 140, 1250 40, 1360 60 C 1450 80, 1460 190, 1390 240 C 1330 280, 1250 240, 1260 160 C 1270 110, 1330 120, 1320 170" fill="none" stroke="#16a34a" strokeWidth="22" strokeLinecap="round" opacity="0.75" />
              </g>
              <g className="swirl-group swirl-right-3">
                <path d="M1470 670 C 1360 570, 1320 450, 1180 380 C 1080 330, 1030 420, 1100 480 C 1170 530, 1250 470, 1220 400 C 1200 350, 1140 370, 1150 420" fill="none" stroke="#65a30d" strokeWidth="18" strokeLinecap="round" opacity="0.7" />
              </g>
              <g className="swirl-group swirl-right-4">
                <path d="M1450 680 C 1350 590, 1260 470, 1280 360 C 1300 240, 1400 220, 1440 280 C 1470 330, 1430 390, 1380 380 C 1340 370, 1330 310, 1370 300" fill="none" stroke="#84cc16" strokeWidth="15" strokeLinecap="round" opacity="0.8" />
              </g>
              <g className="swirl-group swirl-right-5">
                <path d="M1500 520 C 1390 450, 1290 350, 1190 370 C 1120 385, 1100 460, 1170 500 C 1230 530, 1290 470, 1260 420" fill="none" stroke="#a3e635" strokeWidth="12" strokeLinecap="round" opacity="0.85" />
              </g>
              {/* Zarcillo fino extra derecho */}
              <g className="swirl-group swirl-right-2">
                <path d="M1430 680 C 1360 520, 1340 320, 1220 220 C 1150 160, 1090 200, 1100 260" fill="none" stroke="#bef264" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
              </g>

              {/* Bocinas tipo cono / speaker targets */}
              <g className="speaker-pulse speaker-1">
                <circle cx="85" cy="110" r="54" fill="url(#speakerConeL)" opacity="0.7" />
                <circle cx="85" cy="110" r="44" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.9" />
                <circle cx="85" cy="110" r="32" fill="none" stroke="#1f6355" strokeWidth="3" opacity="0.8" />
                <circle cx="85" cy="110" r="18" fill="none" stroke="#a3e635" strokeWidth="3" opacity="0.9" />
                <circle cx="85" cy="110" r="8" fill="#0f3830" opacity="0.95" />
              </g>

              <g className="speaker-pulse speaker-2">
                <circle cx="1355" cy="115" r="62" fill="url(#speakerConeR)" opacity="0.7" />
                <circle cx="1355" cy="115" r="50" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.9" />
                <circle cx="1355" cy="115" r="36" fill="none" stroke="#174c42" strokeWidth="3.5" opacity="0.8" />
                <circle cx="1355" cy="115" r="22" fill="none" stroke="#84cc16" strokeWidth="3" opacity="0.9" />
                <circle cx="1355" cy="115" r="10" fill="#0f3830" opacity="0.95" />
              </g>

              <g className="speaker-pulse speaker-3">
                <circle cx="180" cy="540" r="46" fill="url(#speakerConeR)" opacity="0.65" />
                <circle cx="180" cy="540" r="36" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.85" />
                <circle cx="180" cy="540" r="24" fill="none" stroke="#1f6355" strokeWidth="3" opacity="0.8" />
                <circle cx="180" cy="540" r="12" fill="#0f3830" opacity="0.9" />
              </g>

              <g className="speaker-pulse speaker-4">
                <circle cx="1260" cy="535" r="50" fill="url(#speakerConeL)" opacity="0.65" />
                <circle cx="1260" cy="535" r="38" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.85" />
                <circle cx="1260" cy="535" r="26" fill="none" stroke="#65a30d" strokeWidth="3" opacity="0.8" />
                <circle cx="1260" cy="535" r="14" fill="#0f3830" opacity="0.9" />
              </g>

              <g className="speaker-pulse speaker-5">
                <circle cx="720" cy="570" r="32" fill="url(#speakerConeL)" opacity="0.45" />
                <circle cx="720" cy="570" r="22" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
                <circle cx="720" cy="570" r="12" fill="none" stroke="#1f6355" strokeWidth="2" opacity="0.8" />
              </g>

              {/* Aros concéntricos de onda sonora flotantes (disco/anillo) */}
              <circle cx="280" cy="180" r="18" fill="none" stroke="#a3e635" strokeWidth="3" opacity="0.6" />
              <circle cx="280" cy="180" r="9" fill="none" stroke="#1f6355" strokeWidth="2.5" opacity="0.7" />
              <circle cx="1160" cy="180" r="18" fill="none" stroke="#a3e635" strokeWidth="3" opacity="0.6" />
              <circle cx="1160" cy="180" r="9" fill="none" stroke="#1f6355" strokeWidth="2.5" opacity="0.7" />

              {/* Burbujas y puntos de colores en la gama lima/verde/menta */}
              <circle cx="130" cy="180" r="7" fill="#84cc16" opacity="0.75" />
              <circle cx="195" cy="225" r="5" fill="#1f6355" opacity="0.7" />
              <circle cx="110" cy="340" r="8" fill="#a3e635" opacity="0.8" />
              <circle cx="260" cy="290" r="6" fill="#16a34a" opacity="0.75" />
              <circle cx="170" cy="460" r="7" fill="#65a30d" opacity="0.75" />
              <circle cx="70" cy="480" r="6" fill="#d9f99d" opacity="0.85" />
              <circle cx="230" cy="140" r="4" fill="#ffffff" opacity="0.8" />

              <circle cx="1310" cy="180" r="7" fill="#84cc16" opacity="0.75" />
              <circle cx="1245" cy="225" r="5" fill="#1f6355" opacity="0.7" />
              <circle cx="1330" cy="340" r="8" fill="#a3e635" opacity="0.8" />
              <circle cx="1180" cy="290" r="6" fill="#16a34a" opacity="0.75" />
              <circle cx="1270" cy="460" r="7" fill="#65a30d" opacity="0.75" />
              <circle cx="1370" cy="480" r="6" fill="#d9f99d" opacity="0.85" />
              <circle cx="1210" cy="140" r="4" fill="#ffffff" opacity="0.8" />

              <circle cx="620" cy="550" r="5" fill="#65a30d" opacity="0.5" />
              <circle cx="820" cy="555" r="5" fill="#84cc16" opacity="0.5" />
            </svg>
          </div>
          <p className="eyebrow">ASÍ DE FÁCIL</p>
          <h2>Tu próxima idea empieza aquí.</h2>
          <p>Un espacio abierto para compartir, descubrir y crecer con la música.</p>
          <div className="steps">
            <div><span>01</span><i>♫</i><h3>Comparte una partitura</h3><p>Anota una idea musical y compártela con la comunidad.</p></div>
            <div><span>02</span><i>⌕</i><h3>Encuentra inspiración</h3><p>Explora ideas de otros músicos y descubre nuevos sonidos.</p></div>
            <div><span>03</span><i>♡</i><h3>Conecta con la música</h3><p>Reacciona y comenta las partituras que te gustan.</p></div>
          </div>
        </section>
        <footer><a className="logo" href="/" aria-label="Inicio de Notara"><span className="logo-mark">♫</span><span>Notara</span></a><p>Un poco más de música en el mundo.</p><span>© {new Date().getFullYear()} Notara</span></footer>
      </div>
    );
  }

  return (
    <>
      <header className="feed-header">
        <div>
          <p className="eyebrow dashboard-date"><span className="dot" /> {formatDashboardDate()}</p>
          <h1>Qué bueno verte, {user.name.split(" ")[0]}.</h1>
          <p>Descubre una nueva idea o comparte una propia.</p>
        </div>
        <a className="button primary" href="/scores/new">＋ Crear partitura</a>
      </header>
      <section aria-labelledby="my-scores-heading" className="recent-section">
        <div className="section-heading">
          <h2 id="my-scores-heading">Mis publicaciones recientes</h2>
          <span>{myScoresCount}</span>
        </div>
        {myScoresError ? <p className="form-error" role="alert">{myScoresError}</p> : null}
        {isLoadingMyScores && !myScoresError ? <p className="recent-loading">Cargando tus publicaciones...</p> : null}
        {!isLoadingMyScores && !myScoresError && myScores.length === 0 ? (
          <div className="recent-empty">
            <p>Aún no tienes publicaciones.</p>
            <a href="/scores/new">Comparte tu primera partitura →</a>
          </div>
        ) : null}
        {!isLoadingMyScores && !myScoresError && myScores.length > 0 ? (
          <div className="post-list">
            {myScores.map((score) => (
              <ScoreCard
                key={score.id}
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
          <div className="section-title"><h2 id="community-heading">Partituras de la comunidad</h2><span>{totalCount} publicaciones</span></div>
          <form className="filter-actions" onSubmit={applyInstrumentFilter}>
            <label className="filter" htmlFor="instrument-filter">
              <span aria-hidden="true">⌕</span>
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
          <div className="empty-state"><span aria-hidden="true">♫</span><h3>{instrument ? "No hay partituras" : "Comparte la primera"}</h3><p>{instrument ? "Prueba con otro instrumento." : "La comunidad espera su primera idea musical."}</p>{!instrument ? <a className="button primary" href="/scores/new">Crear partitura</a> : null}</div>
        ) : (
          <div className="post-list">
            {scores.map((score) => (
              <ScoreCard
                key={score.id}
                score={score}
                isReacting={pendingReactions.has(score.id)}
                onReaction={() => handleReaction(score)}
              />
            ))}
          </div>
        )}
        {!feedError && totalCount > 0 ? (
          <nav className="pagination" aria-label="Páginas de partituras">
            <button type="button" disabled={!hasPrevious} onClick={() => setPage((current) => current - 1)}>← Anterior</button>
            <span>Página {page}</span>
            <button type="button" disabled={!hasNext} onClick={() => setPage((current) => current + 1)}>Siguiente →</button>
          </nav>
        ) : null}
      </section>
    </>
  );
}

function ScoreCard({
  score,
  isReacting,
  onReaction,
}: {
  score: PublishedScore;
  isReacting: boolean;
  onReaction: () => void;
}) {
  return (
    <article className="post-card">
      <div className="post-meta">
        <div className="avatar tone-1">{getInitials(score.author) || "N"}</div>
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
          <span className="reaction-emoji" aria-hidden="true">{score.user_reacted ? "❤️" : "🤍"}</span>
          {score.reaction_count ?? 0} me gusta
        </button>
        <span><span className="reaction-emoji comment-emoji" aria-hidden="true">💬</span>{score.comment_count} comentarios</span>
        <a href={`/scores/${score.id}`}>Ver partitura →</a>
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
