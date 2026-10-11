import type { NotaraUser } from "./lib/api";

export default function HomePage({ user }: { user: NotaraUser | null }) {
  return (
    <main className="page-shell">
      <section className="home-panel">
        <p className="eyebrow">Notara</p>
        {user ? (
          <>
            <h1>Welcome, {user.name}</h1>
            <p className="intro">Your account is registered and your session is active.</p>
            <p className="account-email">{user.email}</p>
          </>
        ) : (
          <>
            <h1>A place for musical ideas.</h1>
            <p className="intro">Create an account to join the Notara community.</p>
            <a className="primary-link" href="/register">Create account</a>
          </>
        )}
      </section>
    </main>
  );
}
