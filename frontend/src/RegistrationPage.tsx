import { useState, type FormEvent } from "react";
import { registerAccount } from "./lib/api";

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
    if (!name) localErrors.name = ["Enter your name."];
    if (!email) localErrors.email = ["Enter your email address."];
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      localErrors.email = ["Enter a valid email address."];
    }
    if (!password) localErrors.password = ["Enter a password."];
    else if (password.length < 8) {
      localErrors.password = ["Password must be at least 8 characters long."];
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
    <main className="page-shell">
      <section className="form-panel" aria-labelledby="register-heading">
        <p className="eyebrow">Notara account</p>
        <h1 id="register-heading">Create your account</h1>
        <p className="intro">Join Notara to share and discover musical ideas.</p>
        <form className="registration-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="name">Name</label>
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
          {fieldErrors.name?.length ? <FieldError id="name-error" text={fieldErrors.name[0]} /> : null}

          <label htmlFor="email">Email</label>
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
          {fieldErrors.email?.length ? <FieldError id="email-error" text={fieldErrors.email[0]} /> : null}

          <label htmlFor="password">Password</label>
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
          {fieldErrors.password?.length ? (
            <FieldError id="password-error" text={fieldErrors.password[0]} />
          ) : null}

          {formError ? <p className="form-error" role="alert">{formError}</p> : null}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="form-footer">
          Already registered? <a href="/login">Log in</a>
        </p>
      </section>
    </main>
  );
}

function FieldError({ id, text }: { id: string; text: string }) {
  return <span className="field-error" id={id}>{text}</span>;
}
