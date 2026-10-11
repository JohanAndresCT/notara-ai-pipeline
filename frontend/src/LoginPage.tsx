import { useState, type FormEvent } from "react";
import { loginAccount } from "./lib/api";

export default function LoginPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await loginAccount(email, password);
      onAuthenticated();
    } catch (requestError) {
      setPassword("");
      setError((requestError as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="form-panel" aria-labelledby="login-heading">
        <p className="eyebrow">Notara account</p>
        <h1 id="login-heading">Welcome back</h1>
        <p className="intro">Sign in to continue to your dashboard.</p>
        <form className="registration-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Log in"}
          </button>
        </form>
        <p className="form-footer">
          New to Notara? <a href="/register">Create an account</a>
        </p>
      </section>
    </main>
  );
}
