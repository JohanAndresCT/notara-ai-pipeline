import { useState, type FormEvent } from "react";
import { registerAccount } from "./lib/api";
import PublicHeader from "./PublicHeader";

const emptyErrors: Record<string, string[]> = {};

export default function RegistrationPage({ onRegistered }: { onRegistered: () => void }) {
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors(emptyErrors);
    setFormError("");
    setIsSubmitting(true);

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const localErrors: Record<string, string[]> = {};
    if (!name) localErrors.name = ["Escribe tu nombre."];
    if (!email) localErrors.email = ["Escribe tu correo electrónico."];
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      localErrors.email = ["Escribe un correo electrónico válido."];
    }
    if (!password) localErrors.password = ["Escribe una contraseña."];
    else if (password.length < 8) {
      localErrors.password = ["La contraseña debe tener al menos 8 caracteres."];
    }
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await registerAccount({
        name,
        email,
        password,
      });
      onRegistered();
    } catch (error) {
      const registrationError = error as Error & {
        fieldErrors?: Record<string, string[]>;
      };
      setFieldErrors(registrationError.fieldErrors ?? emptyErrors);
      setFormError(registrationError.message);
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <PublicHeader current="register" />
      <main className="auth-main">
        <section className="auth-intro" aria-labelledby="register-intro-heading">
          <div className="auth-circles" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
          <p className="eyebrow"><span className="dot" /> COMPARTE TU MÚSICA. DESCUBRE LA DE OTROS.</p>
          <h1 id="register-intro-heading">Comparte tus ideas.<br /><em>Encuentra tu sonido.</em></h1>
          <p>Un lugar para las melodías, los bocetos y las ideas musicales que quieras compartir.</p>
          <div className="staff-lines" aria-hidden="true">
            <i /><i /><i /><i /><i /><span>♫</span>
          </div>
        </section>
        <section className="auth-card" aria-labelledby="register-heading">
          <div className="auth-heading">
            <span className="mini-icon" aria-hidden="true">♫</span>
            <div>
              <h2 id="register-heading">Crea tu cuenta</h2>
              <p>Únete a Notara para compartir y descubrir ideas musicales.</p>
            </div>
          </div>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="name">Nombre <b>*</b></label>
              <div className="input-wrap">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  maxLength={150}
                  required
                  aria-invalid={Boolean(fieldErrors.name?.length)}
                  aria-describedby={fieldErrors.name?.length ? "name-error" : undefined}
                />
              </div>
              {fieldErrors.name?.length ? <FieldError id="name-error" text={fieldErrors.name[0]} /> : null}
            </div>
            <div className="field">
              <label htmlFor="email">Correo electrónico <b>*</b></label>
              <div className="input-wrap">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  aria-invalid={Boolean(fieldErrors.email?.length)}
                  aria-describedby={fieldErrors.email?.length ? "email-error" : undefined}
                />
              </div>
              {fieldErrors.email?.length ? <FieldError id="email-error" text={fieldErrors.email[0]} /> : null}
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña <b>*</b></label>
              <div className="input-wrap">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.password?.length)}
                  aria-describedby={fieldErrors.password?.length ? "password-error" : undefined}
                />
              </div>
              {fieldErrors.password?.length ? (
                <FieldError id="password-error" text={fieldErrors.password[0]} />
              ) : null}
            </div>
            {formError ? <p className="form-error" role="alert">{formError}</p> : null}
            <button className="button primary wide" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
          <p className="auth-switch">
            ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
          </p>
        </section>
      </main>
    </div>
  );
}

function FieldError({ id, text }: { id: string; text: string }) {
  return <span className="field-error" id={id}>{text}</span>;
}
