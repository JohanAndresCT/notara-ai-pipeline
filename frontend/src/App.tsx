import { useEffect, useState } from "react";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import ProfilePage from "./ProfilePage";
import RegistrationPage from "./RegistrationPage";
import ScoreCreatePage from "./ScoreCreatePage";
import ScoreDetailPage from "./ScoreDetailPage";
import ScoreEditPage from "./ScoreEditPage";
import AppShell from "./AppShell";
import { getCurrentUser, type NotaraUser } from "./lib/api";

export default function App() {
  const [user, setUser] = useState<NotaraUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const path = window.location.pathname;
  const scoreMatch = path.match(/^\/scores\/(\d+)(?:\/edit)?\/?$/);
  const scoreId = scoreMatch ? Number(scoreMatch[1]) : null;
  const isEditScoreRoute = /^\/scores\/\d+\/edit\/?$/.test(path);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  if (isCheckingSession) {
    return (
      <main className="app-loading" role="status">
        <span className="logo-mark" aria-hidden="true">♫</span>
        <p>Buscando tu espacio en la comunidad...</p>
      </main>
    );
  }

  if (path === "/register" && !user) {
    return <RegistrationPage onRegistered={() => window.location.assign("/")} />;
  }

  if (path === "/login" && !user) {
    return <LoginPage onAuthenticated={() => window.location.assign("/")} />;
  }

  if ((path === "/profile" || path === "/scores/new" || scoreId !== null) && !user) {
    if (path === "/profile") {
      return <LoginPage onAuthenticated={() => window.location.assign("/profile")} />;
    }
    if (path === "/scores/new") {
      return <LoginPage onAuthenticated={() => window.location.assign("/scores/new")} />;
    }
    return <LoginPage onAuthenticated={() => window.location.assign(path)} />;
  }

  if (!user) {
    return <HomePage user={null} />;
  }

  let page;
  if (path === "/profile") {
    page = <ProfilePage user={user} onProfileUpdated={setUser} />;
  } else if (path === "/scores/new") {
    page = <ScoreCreatePage />;
  } else if (scoreId !== null && isEditScoreRoute) {
    page = <ScoreEditPage scoreId={scoreId} />;
  } else if (scoreId !== null) {
    page = <ScoreDetailPage scoreId={scoreId} currentUserId={user.id} currentUserName={user.name} />;
  } else {
    page = <HomePage user={user} />;
  }

  return (
    <AppShell user={user} onLoggedOut={() => window.location.assign("/")}>
      {page}
    </AppShell>
  );
}
