import { useState, type FormEvent } from "react";
import type { NotaraUser } from "./lib/api";
import { changePassword, instrumentOptions, updateProfile } from "./lib/api";

type ProfileTab = "profile" | "password";

export default function ProfilePage({
  user,
  onProfileUpdated,
}: {
  user: NotaraUser;
  onProfileUpdated: (user: NotaraUser) => void;
}) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
  const [username, setUsername] = useState(user.username);
  const [name, setName] = useState(user.name);
  const [description, setDescription] = useState(user.description ?? "");
  const [mainInstrument, setMainInstrument] = useState(
    instrumentOptions.includes(user.main_instrument ?? "") ? user.main_instrument ?? "" : "Otro",
  );
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>({});
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>({});
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileErrors({});
    setProfileError("");
    setProfileMessage("");
    setIsSavingProfile(true);
    try {
      const updatedUser = await updateProfile({ username, name, description, mainInstrument });
      onProfileUpdated(updatedUser);
      setUsername(updatedUser.username);
      setName(updatedUser.name);
      setDescription(updatedUser.description);
      setMainInstrument(updatedUser.main_instrument ?? "");
      setProfileMessage("Cambios guardados.");
    } catch (error) {
      const requestError = error as Error & { fieldErrors?: Record<string, string[]> };
      setProfileErrors(requestError.fieldErrors ?? {});
      setProfileError(requestError.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordErrors({});
    setPasswordError("");
    setPasswordMessage("");
    setIsSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Contraseña actualizada.");
    } catch (error) {
      const requestError = error as Error & { fieldErrors?: Record<string, string[]> };
      setPasswordErrors(requestError.fieldErrors ?? {});
      setPasswordError(requestError.message);
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setIsSavingPassword(false);
    }
  }

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <>
      <header className="page-heading">
        <div>
          <p className="eyebrow"><span className="dot" /> TU CUENTA</p>
          <h1>Mi perfil</h1>
          <p>Administra tu información y la seguridad de tu cuenta.</p>
        </div>
        <a className="button secondary small" href="/">← Volver al inicio</a>
      </header>
      <div className="profile-layout">
        <aside className="profile-summary">
          <div className="avatar big tone-1" aria-label="Iniciales del perfil">{initials || "N"}</div>
          <h2>{name || user.name}</h2>
          <p>@{username}</p>
          <span>{mainInstrument || "Elige tu instrumento"}</span>
          <hr />
          <div><strong>{user.score_count}</strong><span>Partituras</span></div>
          <div><strong>{user.likes_received}</strong><span>Me gusta recibidos</span></div>
        </aside>
        <section className="settings-card profile-settings" aria-label="Configuración de la cuenta">
          <div className="tabs" role="tablist" aria-label="Opciones del perfil">
            <button
              id="profile-tab"
              className={activeTab === "profile" ? "active" : ""}
              type="button"
              role="tab"
              aria-selected={activeTab === "profile"}
              aria-controls="profile-panel"
              onClick={() => setActiveTab("profile")}
            >
              Información personal
            </button>
            <button
              id="password-tab"
              className={activeTab === "password" ? "active" : ""}
              type="button"
              role="tab"
              aria-selected={activeTab === "password"}
              aria-controls="password-panel"
              onClick={() => setActiveTab("password")}
            >
              Contraseña
            </button>
          </div>
          {activeTab === "profile" ? (
            <div id="profile-panel" role="tabpanel" aria-labelledby="profile-tab">
              <header className="settings-title">
                <h2>Información personal</h2>
                <p>Así te verá el resto de la comunidad.</p>
              </header>
              <form onSubmit={handleProfileSubmit} noValidate>
                <div className="field">
                  <label htmlFor="profile-username">Nombre de usuario <b>*</b></label>
                  <div className="input-wrap">
                    <input
                      id="profile-username"
                      name="username"
                      autoComplete="username"
                      maxLength={30}
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                      aria-invalid={Boolean(profileErrors.username?.length)}
                      aria-describedby={profileErrors.username?.length ? "profile-username-error" : undefined}
                    />
                  </div>
                  {profileErrors.username?.length ? <span className="field-error" id="profile-username-error">{profileErrors.username[0]}</span> : null}
                </div>
                <div className="field">
                  <label htmlFor="profile-name">Nombre <b>*</b></label>
                  <div className="input-wrap">
                    <input
                      id="profile-name"
                      name="name"
                      autoComplete="name"
                      maxLength={150}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      aria-invalid={Boolean(profileErrors.name?.length)}
                      aria-describedby={profileErrors.name?.length ? "profile-name-error" : undefined}
                    />
                  </div>
                  {profileErrors.name?.length ? <span className="field-error" id="profile-name-error">{profileErrors.name[0]}</span> : null}
                </div>
                <div className="field">
                  <label htmlFor="main-instrument">Instrumento principal</label>
                  <div className="input-wrap">
                    <select
                      id="main-instrument"
                      name="main_instrument"
                      value={mainInstrument}
                      onChange={(event) => setMainInstrument(event.target.value)}
                      aria-invalid={Boolean(profileErrors.main_instrument?.length)}
                      aria-describedby={profileErrors.main_instrument?.length ? "instrument-error" : undefined}
                    >
                      <option value="">Selecciona tu instrumento</option>
                      {instrumentOptions.map((instrument) => <option key={instrument} value={instrument}>{instrument}</option>)}
                    </select>
                  </div>
                  {profileErrors.main_instrument?.length ? <span className="field-error" id="instrument-error">{profileErrors.main_instrument[0]}</span> : null}
                </div>
                <div className="field">
                  <label htmlFor="profile-description">Descripción</label>
                  <textarea
                    id="profile-description"
                    name="description"
                    maxLength={500}
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    aria-invalid={Boolean(profileErrors.description?.length)}
                    aria-describedby={profileErrors.description?.length ? "profile-description-error" : undefined}
                  />
                  <div className="field-help"><span>Cuéntale a la comunidad un poco sobre ti.</span><span>{description.length}/500</span></div>
                  {profileErrors.description?.length ? <span className="field-error" id="profile-description-error">{profileErrors.description[0]}</span> : null}
                </div>
                {profileError ? <p className="form-error" role="alert">{profileError}</p> : null}
                {profileMessage ? <p className="form-success" role="status">{profileMessage}</p> : null}
                <div className="form-actions">
                  <button className="button primary" type="submit" disabled={isSavingProfile}>
                    {isSavingProfile ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div id="password-panel" role="tabpanel" aria-labelledby="password-tab">
              <header className="settings-title">
                <h2>Cambiar contraseña</h2>
                <p>Elige una contraseña segura para proteger tu cuenta.</p>
              </header>
              <form onSubmit={handlePasswordSubmit} noValidate>
                <div className="field">
                  <label htmlFor="current-password">Contraseña actual <b>*</b></label>
                  <div className="input-wrap">
                    <input
                      id="current-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      aria-invalid={Boolean(passwordErrors.current_password?.length)}
                      aria-describedby={passwordErrors.current_password?.length ? "current-password-error" : undefined}
                    />
                  </div>
                  {passwordErrors.current_password?.length ? <span className="field-error" id="current-password-error">{passwordErrors.current_password[0]}</span> : null}
                </div>
                <div className="field">
                  <label htmlFor="new-password">Nueva contraseña <b>*</b></label>
                  <div className="input-wrap">
                    <input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      aria-invalid={Boolean(passwordErrors.new_password?.length)}
                      aria-describedby={passwordErrors.new_password?.length ? "new-password-error" : undefined}
                    />
                  </div>
                  {passwordErrors.new_password?.length ? <span className="field-error" id="new-password-error">{passwordErrors.new_password[0]}</span> : null}
                </div>
                {passwordError ? <p className="form-error" role="alert">{passwordError}</p> : null}
                {passwordMessage ? <p className="form-success" role="status">{passwordMessage}</p> : null}
                <div className="form-actions">
                  <button className="button secondary" type="submit" disabled={isSavingPassword}>
                    {isSavingPassword ? "Guardando..." : "Cambiar contraseña"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
