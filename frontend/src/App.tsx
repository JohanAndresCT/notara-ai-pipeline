import { useEffect, useState } from "react";
import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import ProfilePage from "./ProfilePage";
import RegistrationPage from "./RegistrationPage";
import ScoreCreatePage from "./ScoreCreatePage";
import ScoreDetailPage from "./ScoreDetailPage";
import { getCurrentUser, type NotaraUser } from "./lib/api";

// Keep route selection minimal for US-001; replace with the product router as flows grow.
export default function App() {
  const [user, setUser] = useState<NotaraUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const isRegistrationRoute = window.location.pathname === "/register";
  const isLoginRoute = window.location.pathname === "/login";
  const isProfileRoute = window.location.pathname === "/profile";
  const isCreateScoreRoute = window.location.pathname === "/scores/new";
  const scoreDetailMatch = window.location.pathname.match(/^\/scores\/(\d+)\/?$/);
  const scoreDetailId = scoreDetailMatch ? Number(scoreDetailMatch[1]) : null;

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  if (isCheckingSession) {
    return <main className="page-shell"><p role="status">Checking your session...</p></main>;
  }

  if (isRegistrationRoute && !user) {
    return <RegistrationPage onRegistered={() => window.location.assign("/")} />;
  }

  if (isLoginRoute && !user) {
    return <LoginPage onAuthenticated={() => window.location.assign("/")} />;
  }

  if (isProfileRoute && !user) {
    return <LoginPage onAuthenticated={() => window.location.assign("/profile")} />;
  }

  if (isProfileRoute && user) {
    return <ProfilePage user={user} onProfileUpdated={setUser} />;
  }

  if (isCreateScoreRoute && !user) {
    return <LoginPage onAuthenticated={() => window.location.assign("/scores/new")} />;
  }

  if (isCreateScoreRoute && user) {
    return <ScoreCreatePage />;
  }

  if (scoreDetailId !== null && !user) {
    return <LoginPage onAuthenticated={() => window.location.assign(`/scores/${scoreDetailId}`)} />;
  }

  if (scoreDetailId !== null && user) {
    return <ScoreDetailPage scoreId={scoreDetailId} currentUserId={user.id} />;
  }

  return <HomePage user={user} onLoggedOut={() => window.location.assign("/")} />;
}
