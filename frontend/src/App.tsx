import { useEffect, useState } from "react";
import HomePage from "./HomePage";
import RegistrationPage from "./RegistrationPage";
import { getCurrentUser, type NotaraUser } from "./lib/api";

// Keep route selection minimal for US-001; replace with the product router as flows grow.
export default function App() {
  const [user, setUser] = useState<NotaraUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const isRegistrationRoute = window.location.pathname === "/register";

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

  return <HomePage user={user} />;
}
