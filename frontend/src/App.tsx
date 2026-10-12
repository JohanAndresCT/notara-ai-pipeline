<<<<<<< HEAD
import { useEffect, useState } from "react";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import ProfilePage from "./ProfilePage";
import RegistrationPage from "./RegistrationPage";
import ScoreCreatePage from "./ScoreCreatePage";
import { getCurrentUser, type NotaraUser } from "./lib/api";

// Keep route selection minimal for US-001; replace with the product router as flows grow.
export default function App() {
  const [user, setUser] = useState<NotaraUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const isRegistrationRoute = window.location.pathname === "/register";
  const isLoginRoute = window.location.pathname === "/login";
  const isProfileRoute = window.location.pathname === "/profile";
  const isCreateScoreRoute = window.location.pathname === "/scores/new";

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  if (isCheckingSession) {
    return <main className="page-shell"><p role="status">Checking your session...</p></main>;
  }

  if (isRegistrationRoute && !user) {
    return <RegistrationPage onRegistered={() => window.location.assign("/")} />;
  }

  if (isLoginRoute && !user) {
    return <LoginPage onAuthenticated={() => window.location.assign("/")} />;
  }

  if (isProfileRoute && !user) {
    return <LoginPage onAuthenticated={() => window.location.assign("/profile")} />;
  }

  if (isProfileRoute && user) {
    return <ProfilePage user={user} onProfileUpdated={setUser} />;
  }

  if (isCreateScoreRoute && !user) {
    return <LoginPage onAuthenticated={() => window.location.assign("/scores/new")} />;
  }

  if (isCreateScoreRoute && user) {
    return <ScoreCreatePage />;
  }

  return <HomePage user={user} onLoggedOut={() => window.location.assign("/")} />;
=======
import { FormEvent, ReactNode, useMemo, useState } from "react"

type Screen = "home" | "register" | "login" | "dashboard" | "create" | "detail" | "edit" | "profile"
type Format = "abc" | "text"
type Post = {
  id: number
  title: string
  instrument: string
  description: string
  format: Format
  content: string
  author: string
  initials: string
  time: string
  likes: number
  comments: number
  own?: boolean
}

const abcExample = `X:1
T:Estudio en Sol
M:4/4
L:1/8
K:G
G2 AB c2 d2 | e2 d2 B4 |`

const initialPosts: Post[] = [
  {
    id: 1,
    title: "Melodía de primavera",
    instrument: "Piano",
    description:
      "Una melodía breve para practicar fraseo y dinámica con la mano derecha.",
    format: "abc",
    content: `X:1\nT:Melodía de primavera\nM:4/4\nL:1/8\nK:G\nG2 AB c2 d2 | e2 d2 B4 |`,
    author: "Laura Martínez",
    initials: "LM",
    time: "Hace 8 min",
    likes: 24,
    comments: 5,
    own: true,
  },
  {
    id: 2,
    title: "Ejercicio de arpegios",
    instrument: "Guitarra",
    description:
      "Patrón ascendente y descendente para practicar cambios de posición.",
    format: "text",
    content:
      "Am: La — Do — Mi — La\nDm: Re — Fa — La — Re\nE7: Mi — Sol♯ — Si — Re",
    author: "Carlos Gómez",
    initials: "CG",
    time: "Hace 25 min",
    likes: 17,
    comments: 3,
  },
  {
    id: 3,
    title: "Tema para violín",
    instrument: "Violín",
    description:
      "Tema cantabile de ocho compases para trabajar cambios de cuerda.",
    format: "abc",
    content: `X:1\nT:Tema para violín\nM:3/4\nL:1/8\nK:D\nD2 FA d2 | c4 B2 | A2 GF E2 | D6 |`,
    author: "Ana Torres",
    initials: "AT",
    time: "Hace 1 h",
    likes: 31,
    comments: 8,
  },
  {
    id: 4,
    title: "Ejercicio de cuerdas al aire",
    instrument: "Violín",
    description: "Secuencia sencilla para calentamiento y control del arco.",
    format: "text",
    content:
      "Sol: 4 negras\nRe: 2 blancas\nLa: redonda\nRepetir en sentido inverso",
    author: "Daniela Soto",
    initials: "DS",
    time: "Hace 2 h",
    likes: 9,
    comments: 1,
  },
  {
    id: 5,
    title: "Línea de bajo en Re",
    instrument: "Bajo",
    description: "Groove breve con síncopas para practicar con metrónomo.",
    format: "abc",
    content: `X:1\nT:Línea de bajo en Re\nM:4/4\nL:1/8\nK:D\nD2 D A,2 CD | F2 A F E2 D2 |`,
    author: "Nico Gil",
    initials: "NG",
    time: "Hace 3 h",
    likes: 14,
    comments: 2,
  },
  {
    id: 6,
    title: "Respiración en Fa",
    instrument: "Flauta",
    description:
      "Melodía lenta para sostener el aire y cuidar el final de frase.",
    format: "text",
    content: "Fa (2) · Sol (2) · La (4)\nSib (2) · La (2) · Sol (4)",
    author: "Elena León",
    initials: "EL",
    time: "Ayer",
    likes: 22,
    comments: 4,
  },
  {
    id: 7,
    title: "Cadencia para piano",
    instrument: "Piano",
    description:
      "Progresión breve de acordes para analizar funciones armónicas.",
    format: "text",
    content: "Cmaj7 | Am7 | Dm7 G7 | Cmaj7",
    author: "Álex Mora",
    initials: "AM",
    time: "Ayer",
    likes: 28,
    comments: 6,
  },
  {
    id: 8,
    title: "Dúo imaginario",
    instrument: "Guitarra",
    description: "Dos voces sugeridas para practicar independencia.",
    format: "abc",
    content: abcExample,
    author: "Lucía Vega",
    initials: "LV",
    time: "Hace 2 días",
    likes: 11,
    comments: 2,
  },
  {
    id: 9,
    title: "Escala con acentos",
    instrument: "Clarinete",
    description: "Patrón ascendente con acento cada tres notas.",
    format: "text",
    content: "Do > Re Mi · Fa > Sol La · Si > Do",
    author: "Mateo Ruiz",
    initials: "MR",
    time: "Hace 2 días",
    likes: 8,
    comments: 0,
  },
  {
    id: 10,
    title: "Final en La menor",
    instrument: "Violín",
    description: "Idea para cerrar una pieza de carácter íntimo.",
    format: "abc",
    content: `X:1\nT:Final en La menor\nM:4/4\nL:1/8\nK:Am\ne2 dc B2 A2 | ^G2 E2 A4 |`,
    author: "Clara Rey",
    initials: "CR",
    time: "Hace 3 días",
    likes: 19,
    comments: 3,
  },
  {
    id: 11,
    title: "Pulso constante",
    instrument: "Bajo",
    description: "Ejercicio adicional para la segunda página.",
    format: "text",
    content: "Re — Re — Fa — La\nRe — Do — La — Fa",
    author: "Nico Gil",
    initials: "NG",
    time: "Hace 4 días",
    likes: 6,
    comments: 1,
  },
]

const instruments = [
  "Todos los instrumentos",
  "Piano",
  "Guitarra",
  "Violín",
  "Flauta",
  "Voz",
  "Otro",
]

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    heart: (
      <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.4a5.5 5.5 0 0 0 1-8.9Z" />
    ),
    message: (
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    ),
    filter: <path d="M4 5h16M7 12h10M10 19h4" />,
    arrow: (
      <>
        <path d="m15 18-6-6 6-6" />
      </>
    ),
    chevron: <path d="m9 18 6-6-6-6" />,
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M14 3h7v18h-7" />
      </>
    ),
    music: (
      <>
        <path d="M9 18V5l11-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="17" cy="16" r="3" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  }
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button className="logo" onClick={onClick} aria-label="Ir al inicio">
      <span className="logo-mark">
        <Icon name="music" size={19} />
      </span>
      <span>notara</span>
    </button>
  )
}

function PublicHeader({ go }: { go: (s: Screen) => void }) {
  return (
    <header className="public-header">
      <div className="public-nav">
        <Logo onClick={() => go("home")} />
        <div className="public-actions">
          <button className="button ghost" onClick={() => go("login")}>
            Iniciar sesión
          </button>
          <button
            className="button primary small"
            onClick={() => go("register")}
          >
            Crear cuenta
          </button>
        </div>
      </div>
    </header>
  )
}

function AuthShell({
  type,
  go,
  authenticate,
}: {
  type: "login" | "register"
  go: (s: Screen) => void
  authenticate: () => void
}) {
  const register = type === "register"
  const [submitted, setSubmitted] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      if (register) go("login")
      else authenticate()
    }, 450)
  }
  return (
    <div className="auth-page">
      <PublicHeader go={go} />
      <main className="auth-main">
        <section className="auth-intro">
          <span className="eyebrow">
            <span className="dot" /> Comunidad académica musical
          </span>
          <h1>
            {register
              ? "Empieza a escribir tu próxima idea."
              : "Qué bueno tenerte de vuelta."}
          </h1>
          <p>
            {register
              ? "Crea, comparte y conversa sobre música con estudiantes y docentes."
              : "Continúa compartiendo partituras y aprendiendo con la comunidad."}
          </p>
          <div className="staff-lines">
            <span>𝄞</span>
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </section>
        <section className="auth-card">
          <div className="auth-heading">
            <span className="mini-icon">
              <Icon name={register ? "user" : "lock"} size={20} />
            </span>
            <div>
              <h2>{register ? "Crea tu cuenta" : "Inicia sesión"}</h2>
              <p>
                {register
                  ? "Solo te tomará un momento."
                  : "Accede a tu espacio en Notara."}
              </p>
            </div>
          </div>
          <form onSubmit={submit}>
            {register && (
              <>
                <Field
                  label="Nombre de usuario"
                  placeholder="Ej. laura.music"
                  required
                />
                <Field
                  label="Nombre"
                  placeholder="Ej. Laura Martínez"
                  required
                />
              </>
            )}
            <Field
              label={register ? "Correo electrónico" : "Correo o usuario"}
              placeholder={
                register ? "tu@correo.com" : "tu@correo.com o usuario"
              }
              type={register ? "email" : "text"}
              required
            />
            <Field
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              type="password"
              required
            />
            {register && (
              <Field
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña"
                type="password"
                required
              />
            )}
            {register && (
              <>
                <label className="field">
                  <span>
                    Instrumento principal <b> *</b>
                  </span>
                  <div className="input-wrap">
                    <select required defaultValue="">
                      <option value="" disabled>
                        Selecciona un instrumento
                      </option>
                      {instruments.slice(1).map((instrument) => (
                        <option key={instrument}>{instrument}</option>
                      ))}
                    </select>
                  </div>
                </label>
                <label className="check-row">
                  <input type="checkbox" required />
                  <span>Acepto las normas de convivencia de la comunidad.</span>
                </label>
              </>
            )}
            <button
              className="button primary wide"
              type="submit"
              disabled={submitted}
            >
              {submitted ? (
                <>
                  <span className="spinner" />{" "}
                  {register ? "Creando cuenta…" : "Accediendo…"}
                </>
              ) : register ? (
                "Crear cuenta"
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>
          <p className="auth-switch">
            {register ? "¿Ya tienes una cuenta?" : "¿Aún no tienes cuenta?"}{" "}
            <button onClick={() => go(register ? "login" : "register")}>
              {register ? "Inicia sesión" : "Regístrate"}
            </button>
          </p>
        </section>
      </main>
    </div>
  )
}

function Field({
  label,
  placeholder,
  type = "text",
  required,
  defaultValue,
}: {
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  defaultValue?: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="field">
      <span>
        {label}
        {required && <b> *</b>}
      </span>
      <div className="input-wrap">
        <input
          type={type === "password" && visible ? "text" : type}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
        />
        {type === "password" && (
          <button
            type="button"
            aria-label="Mostrar contraseña"
            onClick={() => setVisible(!visible)}
          >
            <Icon name="eye" size={18} />
          </button>
        )}
      </div>
    </label>
  )
}

function AppShell({
  screen,
  go,
  logout,
  children,
}: {
  screen: Screen
  go: (s: Screen) => void
  logout: () => void
  children: ReactNode
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo onClick={() => go("dashboard")} />
        <div className="sidebar-user">
          <div className="avatar tone-1">LM</div>
          <div>
            <strong>Laura Martínez</strong>
            <span>@laura.music</span>
          </div>
        </div>
        <nav>
          <button
            className={screen === "dashboard" ? "active" : ""}
            onClick={() => go("dashboard")}
          >
            <Icon name="home" /> Inicio
          </button>
          <button
            className={screen === "create" ? "active" : ""}
            onClick={() => go("create")}
          >
            <Icon name="plus" /> Crear partitura
          </button>
          <button
            className={screen === "profile" ? "active" : ""}
            onClick={() => go("profile")}
          >
            <Icon name="user" /> Mi perfil
          </button>
        </nav>
        <div className="sidebar-note">
          <Icon name="music" />
          <strong>Tu música importa</strong>
          <p>Comparte una idea breve. Puede inspirar a alguien.</p>
        </div>
        <button className="logout" onClick={logout}>
          <Icon name="logout" /> Cerrar sesión
        </button>
      </aside>
      <div className="mobile-top">
        <Logo onClick={() => go("dashboard")} />
        <button aria-label="Menú">
          <Icon name="menu" />
        </button>
      </div>
      <main className="app-main">{children}</main>
      <nav className="bottom-nav">
        <button
          className={screen === "dashboard" ? "active" : ""}
          onClick={() => go("dashboard")}
        >
          <Icon name="home" />
          <span>Inicio</span>
        </button>
        <button className="create-mobile" onClick={() => go("create")}>
          <Icon name="plus" />
        </button>
        <button
          className={screen === "profile" ? "active" : ""}
          onClick={() => go("profile")}
        >
          <Icon name="user" />
          <span>Perfil</span>
        </button>
      </nav>
    </div>
  )
}

function Dashboard({
  posts,
  go,
  openPost,
  editPost,
  removePost,
}: {
  posts: Post[]
  go: (s: Screen) => void
  openPost: (id: number) => void
  editPost: (id: number) => void
  removePost: (id: number) => void
}) {
  const [pendingFilter, setPendingFilter] = useState("Todos los instrumentos")
  const [filter, setFilter] = useState("Todos los instrumentos")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)
  const filtered = useMemo(
    () =>
      filter === "Todos los instrumentos"
        ? posts
        : posts.filter((p) => p.instrument === filter),
    [filter, posts],
  )
  const shown = filtered.slice((page - 1) * 10, page * 10)
  const ownPosts = shown.filter((post) => post.own)
  const communityPosts = shown.filter((post) => !post.own)
  const applyFilter = (value = pendingFilter) => {
    setLoading(true)
    setFilter(value)
    setPendingFilter(value)
    setPage(1)
    setTimeout(() => setLoading(false), 350)
  }
  return (
    <div className="content feed">
      <div className="feed-header">
        <div>
          <span className="eyebrow">Miércoles, 21 de mayo</span>
          <h1>Dashboard</h1>
          <p>Explora partituras recientes de la comunidad.</p>
        </div>
        <button
          className="button primary desktop-create"
          onClick={() => go("create")}
        >
          <Icon name="plus" size={18} /> Nueva partitura
        </button>
      </div>
      <div className="feed-tools dashboard-tools">
        <div className="section-title">
          <h2>Partituras recientes</h2>
          <span>{filtered.length} publicaciones</span>
        </div>
        <div className="filter-actions">
          <label className="filter">
            <Icon name="filter" size={18} />
            <select
              value={pendingFilter}
              onChange={(e) => setPendingFilter(e.target.value)}
              aria-label="Filtrar por instrumento"
            >
              {instruments.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </label>
          <button
            className="button secondary small"
            onClick={() => applyFilter()}
          >
            Aplicar filtro
          </button>
          {filter !== "Todos los instrumentos" && (
            <button
              className="button ghost small"
              onClick={() => applyFilter("Todos los instrumentos")}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
      {filter !== "Todos los instrumentos" && (
        <div className="active-filter">
          <span>Filtro activo</span>
          {filter}
          <button onClick={() => applyFilter("Todos los instrumentos")}>
            <Icon name="close" size={14} /> Quitar filtro
          </button>
        </div>
      )}
      {loading ? (
        <LoadingState />
      ) : shown.length === 0 ? (
        <EmptyState
          title={
            posts.length
              ? `No hay partituras de ${filter}`
              : "Todavía no hay publicaciones"
          }
          description={
            posts.length
              ? "Prueba con otro instrumento para descubrir más publicaciones."
              : "Sé la primera persona en compartir una idea musical."
          }
          clear={() =>
            posts.length ? applyFilter("Todos los instrumentos") : go("create")
          }
          action={posts.length ? "Limpiar filtro" : "Nueva publicación"}
        />
      ) : (
        <div className="feed-sections">
          {ownPosts.length > 0 && (
            <section>
              <div className="section-heading">
                <h2>Mis publicaciones recientes</h2>
                <span>{ownPosts.length}</span>
              </div>
              <div className="post-list">
                {ownPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    open={() => openPost(post.id)}
                    edit={() => editPost(post.id)}
                    remove={() => setDeleteTarget(post)}
                  />
                ))}
              </div>
            </section>
          )}
          {communityPosts.length > 0 && (
            <section>
              <div className="section-heading">
                <h2>Publicaciones de la comunidad</h2>
                <span>{communityPosts.length}</span>
              </div>
              <div className="post-list">
                {communityPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    open={() => openPost(post.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      {filtered.length > 10 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            <Icon name="arrow" size={17} /> Anterior
          </button>
          <span>
            Página <strong>{page}</strong> de {Math.ceil(filtered.length / 10)}
          </span>
          <button
            disabled={page * 10 >= filtered.length}
            onClick={() => setPage(page + 1)}
          >
            Siguiente <Icon name="chevron" size={17} />
          </button>
        </div>
      )}
      {deleteTarget && (
        <ConfirmDelete
          post={deleteTarget}
          cancel={() => setDeleteTarget(null)}
          confirm={() => {
            removePost(deleteTarget.id)
            setDeleteTarget(null)
          }}
        />
      )}
    </div>
  )
}

function PostCard({
  post,
  open,
  edit,
  remove,
}: {
  post: Post
  open: () => void
  edit?: () => void
  remove?: () => void
}) {
  return (
    <article className="post-card" onClick={open}>
      <div className="post-meta">
        <div className={`avatar tone-${post.id % 4}`}>{post.initials}</div>
        <div>
          <strong>{post.author}</strong>
          <span>{post.time}</span>
        </div>
        <span className="instrument">{post.instrument}</span>
      </div>
      <div className="post-body">
        <div>
          <div className={`format ${post.format}`}>
            {post.format === "abc" ? ".ABC" : "TEXTO"}
          </div>
          <h3>{post.title}</h3>
          <p>{post.description}</p>
        </div>
        <pre className={post.format === "abc" ? "abc-preview" : "text-preview"}>
          {post.content.split("\n").slice(0, 4).join("\n")}
        </pre>
      </div>
      <div className="post-footer">
        <span>
          <Icon name="heart" size={18} /> {post.likes}
        </span>
        <span>
          <Icon name="message" size={18} /> {post.comments} comentarios
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            open()
          }}
        >
          Ver partitura <Icon name="chevron" size={16} />
        </button>
        {post.own && edit && remove && (
          <div className="card-owner-actions">
            <button
              onClick={(e) => {
                e.stopPropagation()
                edit()
              }}
            >
              <Icon name="edit" size={16} /> Editar
            </button>
            <button
              className="danger"
              onClick={(e) => {
                e.stopPropagation()
                remove()
              }}
            >
              <Icon name="trash" size={16} /> Eliminar
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

function LoadingState() {
  return (
    <div className="loading-list" aria-label="Cargando publicaciones">
      {[1, 2, 3].map((i) => (
        <div className="skeleton-card" key={i}>
          <div className="sk-head">
            <i />
            <span />
          </div>
          <b />
          <b />
          <em />
        </div>
      ))}
    </div>
  )
}

function EmptyState({
  clear,
  title,
  description,
  action,
}: {
  clear: () => void
  title: string
  description: string
  action: string
}) {
  return (
    <div className="empty-state">
      <span>
        <Icon name="music" size={28} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="button secondary" onClick={clear}>
        {action}
      </button>
    </div>
  )
}

function Editor({
  mode,
  existing,
  onSave,
  cancel,
}: {
  mode: "create" | "edit"
  existing?: Post
  onSave: (post: Partial<Post>) => void
  cancel: () => void
}) {
  const [format, setFormat] = useState<Format>(existing?.format || "abc")
  const [content, setContent] = useState(existing?.content || "")
  const [title, setTitle] = useState(existing?.title || "")
  const [instrument, setInstrument] = useState(existing?.instrument || "")
  const [description, setDescription] = useState(existing?.description || "")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const validate = () => {
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = "Escribe un título para tu partitura."
    if (!instrument) next.instrument = "Selecciona un instrumento."
    if (!description.trim()) next.description = "Añade una descripción breve."
    if (!content.trim()) next.content = "El contenido no puede estar vacío."
    if (content.length > 1000)
      next.content = "Has superado el máximo de 1.000 caracteres."
    if (format === "abc" && content.trim()) {
      const required = ["X:", "T:", "M:", "L:", "K:"]
      const missing = required.filter(
        (field) =>
          !content.split("\n").some((line) => line.trim().startsWith(field)),
      )
      const musical = content
        .split("\n")
        .some((line) => !/^[XTMLK]:/.test(line.trim()) && /[A-Ga-g]/.test(line))
      if (missing.length || !musical)
        next.content = `Formato .abc incompleto${
          missing.length
            ? `. Faltan: ${missing.join(", ")}`
            : ". Añade una línea musical válida."
        }`
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (validate()) onSave({ title, instrument, description, format, content })
  }
  return (
    <div className="content editor-page">
      <button className="back" onClick={cancel}>
        <Icon name="arrow" size={17} /> Volver
      </button>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {mode === "create" ? "Nueva publicación" : "Tu publicación"}
          </span>
          <h1>{mode === "create" ? "Crear partitura" : "Editar partitura"}</h1>
          <p>
            {mode === "create"
              ? "Comparte una idea musical breve con la comunidad."
              : "Actualiza los detalles o el contenido de tu partitura."}
          </p>
        </div>
        <span className="step">Borrador local</span>
      </div>
      <form className="editor-grid" onSubmit={submit}>
        <div className="form-card">
          <div className="format-picker">
            <label>
              Formato <b>*</b>
            </label>
            <div>
              <button
                type="button"
                className={format === "abc" ? "selected" : ""}
                onClick={() => setFormat("abc")}
              >
                <strong>.abc</strong>
                <span>Notación musical estructurada</span>
              </button>
              <button
                type="button"
                className={format === "text" ? "selected" : ""}
                onClick={() => setFormat("text")}
              >
                <strong>Texto plano</strong>
                <span>Notas y acordes libres</span>
              </button>
            </div>
          </div>
          <label className={`field ${errors.title ? "has-error" : ""}`}>
            <span>
              Título <b>*</b>
            </span>
            <div className="input-wrap">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Estudio breve en Sol mayor"
                maxLength={80}
              />
            </div>
            {errors.title && <small>{errors.title}</small>}
          </label>
          <div className="form-row">
            <label className={`field ${errors.instrument ? "has-error" : ""}`}>
              <span>
                Instrumento <b>*</b>
              </span>
              <div className="input-wrap">
                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                >
                  <option value="">Selecciona uno</option>
                  {instruments.slice(1).map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </div>
              {errors.instrument && <small>{errors.instrument}</small>}
            </label>
            <label className={`field ${errors.description ? "has-error" : ""}`}>
              <span>
                Descripción <b>*</b>
              </span>
              <div className="input-wrap">
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="¿Qué te gustaría contar?"
                />
              </div>
              {errors.description && <small>{errors.description}</small>}
            </label>
          </div>
          <label
            className={`field content-field ${
              errors.content ? "has-error" : ""
            }`}
          >
            <span>
              Contenido <b>*</b>
            </span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                format === "abc"
                  ? abcExample
                  : "Escribe notas, acordes o indicaciones...\nLos saltos de línea se conservarán."
              }
            />
            <div className="field-help">
              <span>
                {errors.content ||
                  (format === "abc"
                    ? "Incluye X:, T:, M:, L:, K: y al menos una línea musical."
                    : "Los saltos de línea se conservarán.")}
              </span>
              <strong className={content.length > 1000 ? "over" : ""}>
                {content.length} / 1.000
              </strong>
            </div>
          </label>
          <div className="form-actions">
            <button type="button" className="button ghost" onClick={cancel}>
              Cancelar
            </button>
            <button className="button primary" type="submit">
              <Icon name="check" size={18} />
              {mode === "create" ? "Publicar partitura" : "Guardar cambios"}
            </button>
          </div>
        </div>
        <aside className="editor-aside">
          <div className="tip-card">
            <span>
              <Icon name="music" />
            </span>
            <div>
              <strong>Una idea breve es suficiente</strong>
              <p>
                Notara está pensada para compartir fragmentos de hasta 1.000
                caracteres.
              </p>
            </div>
          </div>
          <div className="rules">
            <h3>Antes de publicar</h3>
            <ul>
              <li>
                <Icon name="check" size={16} /> Revisa título e instrumento
              </li>
              <li>
                <Icon name="check" size={16} /> Usa saltos de línea para
                facilitar la lectura
              </li>
              <li>
                <Icon name="check" size={16} /> Mantén una conversación
                respetuosa
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  )
}

function ConfirmDelete({
  post,
  cancel,
  confirm,
}: {
  post: Post
  cancel: () => void
  confirm: () => void
}) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div className="modal">
        <button className="modal-close" onClick={cancel} aria-label="Cerrar">
          <Icon name="close" />
        </button>
        <span className="danger-icon">
          <Icon name="trash" size={24} />
        </span>
        <h2 id="delete-title">¿Eliminar publicación?</h2>
        <p>
          “{post.title}” y todas sus reacciones se eliminarán de forma
          permanente. Esta acción no se puede deshacer.
        </p>
        <div>
          <button className="button ghost" onClick={cancel}>
            Cancelar
          </button>
          <button className="button danger-button" onClick={confirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

function Detail({
  post,
  go,
  updatePost,
  removePost,
}: {
  post: Post
  go: (s: Screen) => void
  updatePost: (p: Post) => void
  removePost: () => void
}) {
  const [liked, setLiked] = useState(false)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([
    {
      initials: "AR",
      name: "Ana Ríos",
      time: "Hace 5 min",
      text: "Me gusta mucho cómo resuelve la frase final. La probaré esta tarde.",
    },
    {
      initials: "JP",
      name: "Julián Pérez",
      time: "Hace 1 min",
      text: "Gracias por compartirla. ¿Has pensado en una segunda voz?",
    },
  ])
  const [confirm, setConfirm] = useState(false)
  const sendComment = (e: FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    setComments([
      ...comments,
      { initials: "LM", name: "Laura Martínez", time: "Ahora", text: comment },
    ])
    setComment("")
  }
  return (
    <div className="content detail-page">
      <button className="back" onClick={() => go("dashboard")}>
        <Icon name="arrow" size={17} /> Volver al feed
      </button>
      <article className="detail-card">
        <div className="detail-top">
          <div className="post-meta">
            <div className={`avatar tone-${post.id % 4}`}>{post.initials}</div>
            <div>
              <strong>{post.author}</strong>
              <span>{post.time}</span>
            </div>
          </div>
          {post.own && (
            <div className="owner-actions">
              <button onClick={() => go("edit")}>
                <Icon name="edit" size={17} /> Editar
              </button>
              <button className="danger" onClick={() => setConfirm(true)}>
                <Icon name="trash" size={17} /> Eliminar
              </button>
            </div>
          )}
        </div>
        <div className="detail-title">
          <div className={`format ${post.format}`}>
            {post.format === "abc" ? ".ABC" : "TEXTO"}
          </div>
          <span className="instrument">{post.instrument}</span>
          <h1>{post.title}</h1>
          <p>{post.description}</p>
        </div>
        <div className={`score ${post.format}`}>
          <div className="score-bar">
            <span>
              {post.format === "abc" ? "Notación ABC" : "Texto plano"}
            </span>
            <span>Saltos de línea preservados</span>
          </div>
          <pre>{post.content}</pre>
        </div>
        <div className="detail-reactions">
          <button
            className={liked ? "liked" : ""}
            onClick={() => {
              setLiked(!liked)
              updatePost({ ...post, likes: post.likes + (liked ? -1 : 1) })
            }}
          >
            <Icon name="heart" size={19} />
            {liked ? "Te gusta" : "Me gusta"} · {post.likes}
          </button>
          <span>
            <Icon name="message" size={18} />
            {comments.length} comentarios
          </span>
        </div>
      </article>
      <section className="comments-card">
        <h2>Conversación</h2>
        <form className="comment-form" onSubmit={sendComment}>
          <div className="avatar tone-1">LM</div>
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comparte una observación o pregunta…"
              aria-label="Escribe un comentario"
            />
            <button className="button primary small" disabled={!comment.trim()}>
              Comentar
            </button>
          </div>
        </form>
        <div className="comments">
          {comments.map((c, i) => (
            <div className="comment" key={i}>
              <div className={`avatar tone-${(i + 2) % 4}`}>{c.initials}</div>
              <div>
                <p>
                  <strong>{c.name}</strong>
                  <span>{c.time}</span>
                </p>
                <div>{c.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {confirm && (
        <ConfirmDelete
          post={post}
          cancel={() => setConfirm(false)}
          confirm={removePost}
        />
      )}
    </div>
  )
}

function Profile({
  logout,
  go,
  posts,
}: {
  logout: () => void
  go: (s: Screen) => void
  posts: Post[]
}) {
  const [tab, setTab] = useState<"profile" | "password">("profile")
  const [saved, setSaved] = useState(false)
  const save = (e: FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2800)
  }
  return (
    <div className="content profile-page">
      {saved && (
        <div className="toast">
          <span>
            <Icon name="check" size={17} />
          </span>
          Cambios guardados correctamente.
        </div>
      )}
      <div className="page-heading">
        <div>
          <span className="eyebrow">Tu espacio</span>
          <h1>Mi perfil</h1>
          <p>Gestiona tu información personal y seguridad.</p>
        </div>
        <button
          className="button secondary small"
          onClick={() => go("dashboard")}
        >
          <Icon name="arrow" size={16} /> Volver al Dashboard
        </button>
      </div>
      <div className="profile-layout">
        <aside className="profile-summary">
          <div className="avatar big tone-1">LM</div>
          <h2>Laura Martínez</h2>
          <p>@laura.music · Piano</p>
          <span>Miembro desde abril de 2025</span>
          <hr />
          <div>
            <strong>{posts.filter((post) => post.own).length}</strong>
            <span>Partituras</span>
          </div>
          <div>
            <strong>48</strong>
            <span>Me gusta recibidos</span>
          </div>
        </aside>
        <section className="settings-card">
          <div className="tabs">
            <button
              className={tab === "profile" ? "active" : ""}
              onClick={() => setTab("profile")}
            >
              Información personal
            </button>
            <button
              className={tab === "password" ? "active" : ""}
              onClick={() => setTab("password")}
            >
              Contraseña
            </button>
          </div>
          {tab === "profile" ? (
            <form onSubmit={save}>
              <h2>Información personal</h2>
              <p className="form-lead">
                Actualiza los datos visibles en tus publicaciones.
              </p>
              <Field
                label="Nombre de usuario"
                defaultValue="laura.music"
                required
              />
              <Field label="Nombre" defaultValue="Laura Martínez" required />
              <label className="field">
                <span>
                  Instrumento principal <b> *</b>
                </span>
                <div className="input-wrap">
                  <select defaultValue="Piano">
                    {instruments.slice(1).map((instrument) => (
                      <option key={instrument}>{instrument}</option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="field">
                <span>Descripción</span>
                <textarea
                  defaultValue="Estudiante de piano interesada en armonía y composición."
                  maxLength={160}
                />
              </label>
              <div className="form-actions">
                <button className="button primary">Guardar cambios</button>
              </div>
              <div className="profile-posts">
                <h3>Mis publicaciones</h3>
                {posts
                  .filter((post) => post.own)
                  .slice(0, 3)
                  .map((post) => (
                    <button key={post.id} type="button">
                      <span>{post.title}</span>
                      <small>
                        {post.instrument} ·{" "}
                        {post.format === "abc" ? ".abc" : "Texto plano"}
                      </small>
                    </button>
                  ))}
              </div>
            </form>
          ) : (
            <form onSubmit={save}>
              <h2>Cambiar contraseña</h2>
              <p className="form-lead">
                Usa al menos 8 caracteres para proteger tu cuenta.
              </p>
              <Field
                label="Contraseña actual"
                type="password"
                placeholder="Tu contraseña actual"
                required
              />
              <Field
                label="Nueva contraseña"
                type="password"
                placeholder="Mínimo 8 caracteres"
                required
              />
              <Field
                label="Confirmar nueva contraseña"
                type="password"
                placeholder="Repite la contraseña"
                required
              />
              <div className="form-actions">
                <button className="button primary">
                  Actualizar contraseña
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
      <button className="mobile-logout" onClick={logout}>
        <Icon name="logout" /> Cerrar sesión
      </button>
    </div>
  )
}

function Home({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="home-page">
      <PublicHeader go={go} />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="dot" /> Donde las ideas musicales toman forma
            </span>
            <h1>
              Escribe una idea.
              <br />
              <em>Compártela.</em>
              <br />
              Hazla crecer.
            </h1>
            <p>
              Una comunidad académica para compartir partituras textuales
              breves, conversar y aprender juntos.
            </p>
            <div className="hero-actions">
              <button className="button primary" onClick={() => go("register")}>
                Crear cuenta gratis <Icon name="chevron" size={17} />
              </button>
              <button className="button secondary" onClick={() => go("login")}>
                Ya tengo una cuenta
              </button>
            </div>
            <span className="hero-note">
              <Icon name="check" size={15} /> Gratuito · Sin archivos ni
              software adicional
            </span>
          </div>
          <div className="hero-visual">
            <div className="paper-shadow" />
            <div className="score-paper">
              <div className="paper-head">
                <span className="format abc">.ABC</span>
                <span>Guitarra</span>
              </div>
              <h2>Estudio en Sol mayor</h2>
              <p>
                Pequeño estudio de arpegios para practicar cambios de posición.
              </p>
              <div className="notation">
                <span>𝄞</span>
                <div>
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
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
                  <Icon name="heart" size={17} /> 24
                </span>
                <span>
                  <Icon name="message" size={17} /> 5
                </span>
              </div>
            </div>
            <span className="floating-note note-one">♪</span>
            <span className="floating-note note-two">♩</span>
          </div>
        </section>
        <section className="how">
          <span className="eyebrow">Simple por naturaleza</span>
          <h2>De la idea a la conversación</h2>
          <p>Tres pasos para compartir lo que estás creando.</p>
          <div className="steps">
            <div>
              <span>01</span>
              <i>
                <Icon name="edit" />
              </i>
              <h3>Escribe</h3>
              <p>
                Usa formato .abc o texto plano para capturar tu idea musical.
              </p>
            </div>
            <div>
              <span>02</span>
              <i>
                <Icon name="music" />
              </i>
              <h3>Comparte</h3>
              <p>
                Publica tu fragmento y hazlo visible para toda la comunidad.
              </p>
            </div>
            <div>
              <span>03</span>
              <i>
                <Icon name="message" />
              </i>
              <h3>Conversa</h3>
              <p>Recibe reacciones, comentarios y nuevas perspectivas.</p>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <Logo onClick={() => go("home")} />
        <p>Un espacio para aprender música compartiendo.</p>
        <span>© 2025 Notara</span>
      </footer>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home")
  const [authenticated, setAuthenticated] = useState(false)
  const [posts, setPosts] = useState(initialPosts)
  const [selectedId, setSelectedId] = useState(1)
  const [toast, setToast] = useState("")
  const go = (next: Screen) => {
    const protectedScreens: Screen[] = [
      "dashboard",
      "create",
      "detail",
      "edit",
      "profile",
    ]
    if (protectedScreens.includes(next) && !authenticated) {
      setScreen("login")
      return
    }
    setScreen(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const authenticate = () => {
    setAuthenticated(true)
    setScreen("dashboard")
  }
  const logout = () => {
    setAuthenticated(false)
    setScreen("home")
  }
  const openPost = (id: number) => {
    setSelectedId(id)
    go("detail")
  }
  const selected = posts.find((p) => p.id === selectedId) || posts[0]
  const notify = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(""), 3000)
  }
  const createPost = (data: Partial<Post>) => {
    const post: Post = {
      id: Date.now(),
      title: data.title!,
      instrument: data.instrument!,
      description: data.description || "Sin descripción.",
      format: data.format!,
      content: data.content!,
      author: "Laura Martínez",
      initials: "LM",
      time: "Ahora",
      likes: 0,
      comments: 0,
      own: true,
    }
    setPosts([post, ...posts])
    setSelectedId(post.id)
    setScreen("detail")
    notify("Partitura publicada correctamente.")
  }
  const editPost = (data: Partial<Post>) => {
    setPosts(posts.map((p) => (p.id === selectedId ? { ...p, ...data } : p)))
    setScreen("detail")
    notify("Cambios guardados correctamente.")
  }
  const removePost = () => {
    setPosts(posts.filter((p) => p.id !== selectedId))
    setScreen("dashboard")
    notify("La partitura se eliminó correctamente.")
  }
  if (screen === "home") return <Home go={go} />
  if (screen === "register" || screen === "login")
    return <AuthShell type={screen} go={go} authenticate={authenticate} />
  return (
    <AppShell screen={screen} go={go} logout={logout}>
      {toast && (
        <div className="toast global">
          <span>
            <Icon name="check" size={17} />
          </span>
          {toast}
        </div>
      )}
      {screen === "dashboard" && (
        <Dashboard
          posts={posts}
          go={go}
          openPost={openPost}
          editPost={(id) => {
            setSelectedId(id)
            go("edit")
          }}
          removePost={(id) => {
            setPosts(posts.filter((post) => post.id !== id))
            notify("La publicación se eliminó correctamente.")
          }}
        />
      )}
      {screen === "create" && (
        <Editor
          mode="create"
          onSave={createPost}
          cancel={() => go("dashboard")}
        />
      )}
      {screen === "detail" && (
        <Detail
          post={selected}
          go={go}
          updatePost={(p) =>
            setPosts(posts.map((item) => (item.id === p.id ? p : item)))
          }
          removePost={removePost}
        />
      )}
      {screen === "edit" && (
        <Editor
          mode="edit"
          existing={selected}
          onSave={editPost}
          cancel={() => go("detail")}
        />
      )}
      {screen === "profile" && (
        <Profile logout={logout} go={go} posts={posts} />
      )}
    </AppShell>
  )
>>>>>>> origin/Arch-Front-end
}
