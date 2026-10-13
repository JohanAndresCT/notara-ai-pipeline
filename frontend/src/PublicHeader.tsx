type PublicPage = "home" | "login" | "register";

export default function PublicHeader({ current }: { current: PublicPage }) {
  const link = (page: PublicPage, href: string, label: string, primary = false) => (
    <a
      className={`button small ${primary ? "primary" : "ghost"}${current === page ? " current" : ""}`}
      href={href}
      aria-current={current === page ? "page" : undefined}
    >
      {label}
    </a>
  );

  return (
    <header className="public-header">
      <nav className="public-nav" aria-label="Navegación principal">
        <a className="logo" href="/" aria-label="Inicio de Notara">
          <span className="logo-mark" aria-hidden="true">♫</span>
          <span>Notara</span>
        </a>
        <div className="public-actions">
          {link("home", "/", "Inicio")}
          {link("login", "/login", "Iniciar sesión")}
          {link("register", "/register", "Crear cuenta", true)}
        </div>
      </nav>
    </header>
  );
}
