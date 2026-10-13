import { useState, type ReactNode } from "react";
import type { NotaraUser } from "./lib/api";
import { logoutAccount } from "./lib/api";

export default function AppShell({
  user,
  children,
  onLoggedOut,
}: {
  user: NotaraUser;
  children: ReactNode;
  onLoggedOut: () => void;
}) {
  const [logoutError, setLogoutError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
  const currentPath = window.location.pathname;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="logo" href="/" aria-label="Inicio de Notara">
          <span className="logo-mark" aria-hidden="true">♫</span>
          <span>Notara</span>
        </a>
        <div className="sidebar-user">
          <div className="avatar tone-1">{initials || "N"}</div>
          <div>
            <strong>{user.name}</strong>
            <span>{user.main_instrument || "Músico de Notara"}</span>
          </div>
        </div>
        <nav aria-label="Navegación principal">
          <a className={currentPath === "/" ? "active" : ""} href="/"><span aria-hidden="true">⌂</span><span>Inicio</span></a>
          <a className={currentPath === "/scores/new" ? "active" : ""} href="/scores/new"><span aria-hidden="true">＋</span><span>Crear partitura</span></a>
          <a className={currentPath === "/profile" ? "active" : ""} href="/profile"><span aria-hidden="true">◉</span><span>Mi perfil</span></a>
        </nav>
        <section className="sidebar-note">
          <span aria-hidden="true">♫</span>
          <strong>Un espacio para tu música</strong>
          <p>Comparte una idea musical e inspírate con la comunidad.</p>
        </section>
        {logoutError ? <p className="logout-error" role="alert">{logoutError}</p> : null}
        <button className="logout" type="button" onClick={handleLogout} disabled={isLoggingOut}>↪ <span>{isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}</span></button>
      </aside>
      <div className="app-main">
        <header className="mobile-top">
          <a className="logo" href="/" aria-label="Inicio de Notara">
            <span className="logo-mark" aria-hidden="true">♫</span>
            <span>Notara</span>
          </a>
          <a href="/profile" aria-label="Mi perfil">{initials || "N"}</a>
        </header>
        <main className="content">{children}</main>
        <nav className="bottom-nav" aria-label="Navegación móvil">
          <a className={currentPath === "/" ? "active" : ""} href="/"><span aria-hidden="true">⌂</span><span>Inicio</span></a>
          <a className="create-mobile" href="/scores/new" aria-label="Crear partitura">＋</a>
          <a className={currentPath === "/profile" ? "active" : ""} href="/profile"><span aria-hidden="true">◉</span><span>Perfil</span></a>
        </nav>
      </div>
    </div>
  );
}
