import { useEffect, useRef, useState, type FormEvent } from "react";
import type { NotaraUser } from "./lib/api";
import { changePassword, updateProfile } from "./lib/api";

export default function ProfilePage({
  user,
  onProfileUpdated,
}: {
  user: NotaraUser;
  onProfileUpdated: (user: NotaraUser) => void;
}) {
  const [name, setName] = useState(user.name);
  const [mainInstrument, setMainInstrument] = useState(user.main_instrument ?? "");
  const [photo, setPhoto] = useState<File | undefined>();
  const [photoPreview, setPhotoPreview] = useState("");
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>({});
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const profileForm = useRef<HTMLFormElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>({});
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileErrors({});
    setProfileError("");
    setProfileMessage("");
    setIsSavingProfile(true);
    try {
      const updatedUser = await updateProfile({ name, mainInstrument, photo });
      onProfileUpdated(updatedUser);
      setName(updatedUser.name);
      setMainInstrument(updatedUser.main_instrument ?? "");
      setPhoto(undefined);
      profileForm.current?.reset();
      setProfileMessage("Profile updated.");
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
      setPasswordMessage("Password changed.");
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

  const photoSource = photoPreview || user.photo_url || "";

  return (
    <main className="page-shell profile-page">
      <div className="profile-layout">
        <header className="profile-header">
          <p className="eyebrow">Notara account</p>
          <h1>My profile</h1>
          <p className="intro">Manage your identity and account security.</p>
          <a href="/">Back to home</a>
        </header>

        <section className="profile-section" aria-labelledby="profile-details-heading">
          <h2 id="profile-details-heading">Profile details</h2>
          <form ref={profileForm} className="registration-form" onSubmit={handleProfileSubmit}>
            <div className="photo-field">
              <div className="photo-preview" aria-label="Profile photo preview">
                {photoSource ? (
                  <img src={photoSource} alt={`${name || "Your"} profile`} />
                ) : (
                  <span>{(name.trim()[0] || "N").toUpperCase()}</span>
                )}
              </div>
              <div className="photo-controls">
                <label htmlFor="profile-photo">Profile photo</label>
                <input
                  id="profile-photo"
                  name="photo"
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={(event) => setPhoto(event.target.files?.[0])}
                  aria-invalid={Boolean(profileErrors.photo?.length)}
                  aria-describedby={profileErrors.photo?.length ? "profile-photo-error" : undefined}
                />
                {profileErrors.photo?.length ? (
                  <span className="field-error" id="profile-photo-error">{profileErrors.photo[0]}</span>
                ) : null}
              </div>
            </div>

            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={150}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(profileErrors.name?.length)}
              aria-describedby={profileErrors.name?.length ? "profile-name-error" : undefined}
            />
            {profileErrors.name?.length ? (
              <span className="field-error" id="profile-name-error">{profileErrors.name[0]}</span>
            ) : null}

            <label htmlFor="profile-email">Email</label>
            <input id="profile-email" type="email" value={user.email} readOnly />

            <label htmlFor="main-instrument">Main instrument</label>
            <input
              id="main-instrument"
              name="main_instrument"
              type="text"
              maxLength={100}
              value={mainInstrument}
              onChange={(event) => setMainInstrument(event.target.value)}
              aria-invalid={Boolean(profileErrors.main_instrument?.length)}
              aria-describedby={profileErrors.main_instrument?.length ? "instrument-error" : undefined}
            />
            {profileErrors.main_instrument?.length ? (
              <span className="field-error" id="instrument-error">
                {profileErrors.main_instrument[0]}
              </span>
            ) : null}

            {profileError ? <p className="form-error" role="alert">{profileError}</p> : null}
            {profileMessage ? <p className="form-success" role="status">{profileMessage}</p> : null}
            <button type="submit" disabled={isSavingProfile}>
              {isSavingProfile ? "Saving profile..." : "Save profile"}
            </button>
          </form>
        </section>

        <section className="profile-section" aria-labelledby="password-heading">
          <h2 id="password-heading">Change password</h2>
          <form className="registration-form" onSubmit={handlePasswordSubmit}>
            <label htmlFor="current-password">Current password</label>
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
            {passwordErrors.current_password?.length ? (
              <span className="field-error" id="current-password-error">
                {passwordErrors.current_password[0]}
              </span>
            ) : null}

            <label htmlFor="new-password">New password</label>
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
            {passwordErrors.new_password?.length ? (
              <span className="field-error" id="new-password-error">
                {passwordErrors.new_password[0]}
              </span>
            ) : null}

            {passwordError ? <p className="form-error" role="alert">{passwordError}</p> : null}
            {passwordMessage ? <p className="form-success" role="status">{passwordMessage}</p> : null}
            <button type="submit" disabled={isSavingPassword}>
              {isSavingPassword ? "Saving password..." : "Change password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
