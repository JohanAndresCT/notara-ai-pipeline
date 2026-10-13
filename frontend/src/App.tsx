import { useEffect, useState } from "react";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import ProfilePage from "./ProfilePage";
import RegistrationPage from "./RegistrationPage";
import ScoreCreatePage from "./ScoreCreatePage";
import ScoreDetailPage from "./ScoreDetailPage";
import ScoreEditPage from "./ScoreEditPage";
import { getCurrentUser, type NotaraUser } from "./lib/api";

export default function App() {
  const [user, setUser] = useState<NotaraUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const path = window.location.pathname;
  const scoreMatch = path.match(/^\/scores\/(\d+)(?:\/(edit))?$/);
  const scoreId = scoreMatch ? Number(scoreMatch[1]) : null;
  const isEditScoreRoute = Boolean(scoreMatch?.[2]);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  if (isCheckingSession) {
    return (
      <main className="page-shell">
        <p role="status">Checking your session...</p>
      </main>
    );
  }

  if (path === "/register" && !user) {
    return <RegistrationPage onRegistered={() => window.location.assign("/")} />;
  }

  if (path === "/login" && !user) {
    return <LoginPage onAuthenticated={() => window.location.assign("/")} />;
  }

  if (path === "/profile" && !user) {
    return <LoginPage onAuthenticated={() => window.location.assign("/profile")} />;
  }

  if (path === "/profile" && user) {
    return <ProfilePage user={user} onProfileUpdated={setUser} />;
  }

  if (path === "/scores/new" && !user) {
    return <LoginPage onAuthenticated={() => window.location.assign("/scores/new")} />;
  }

  if (path === "/scores/new" && user) {
    return <ScoreCreatePage />;
  }

  if (scoreId !== null && !user) {
    return <LoginPage onAuthenticated={() => window.location.assign(path)} />;
  }

  if (scoreId !== null && user && isEditScoreRoute) {
    return <ScoreEditPage scoreId={scoreId} />;
  }

  if (scoreId !== null && user) {
    return <ScoreDetailPage scoreId={scoreId} user={user} />;
  }

  return <HomePage user={user} onLoggedOut={() => window.location.assign("/")} />;
}
