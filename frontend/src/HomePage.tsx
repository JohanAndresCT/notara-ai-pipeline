import { useState } from "react";
import type { NotaraUser } from "./lib/api";
import { logoutAccount } from "./lib/api";

export default function HomePage({
  user,
  onLoggedOut,
}: {
  user: NotaraUser | null;
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
            {logoutError ? <p className="form-error" role="alert">{logoutError}</p> : null}
            <button type="button" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
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
