import { useState, type FormEvent } from "react";
import { loginAccount } from "./lib/api";
import PublicHeader from "./PublicHeader";

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
    <div className="auth-page">
      <PublicHeader current="login" />
      <main className="auth-main">
        <section className="auth-intro" aria-labelledby="login-intro-heading">
          <div className="auth-circles" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
          <p className="eyebrow"><span className="dot" /> COMPARTE TU MÚSICA. DESCUBRE LA DE OTROS.</p>
          <h1 id="login-intro-heading">Qué bueno verte.<br /><em>Tu música te espera.</em></h1>
          <p>Retoma donde te quedaste y sigue compartiendo la música que te inspira.</p>
          <div className="staff-lines" aria-hidden="true">
            <i /><i /><i /><i /><i /><span>♫</span>
          </div>
        </section>
        <section className="auth-card" aria-labelledby="login-heading">
          <div className="auth-heading">
            <span className="mini-icon" aria-hidden="true">♫</span>
            <div>
              <h2 id="login-heading">Inicia sesión</h2>
              <p>Entra para continuar en tu espacio musical.</p>
            </div>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="login-email">Correo electrónico <b>*</b></label>
              <div className="input-wrap">
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
              </div>
            </div>
            <div className="field">
              <label htmlFor="login-password">Contraseña <b>*</b></label>
              <div className="input-wrap">
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="button primary wide" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
          <p className="auth-switch">
            ¿Aún no tienes cuenta? <a href="/register">Crear cuenta</a>
          </p>
        </section>
      </main>
    </div>
  );
}
