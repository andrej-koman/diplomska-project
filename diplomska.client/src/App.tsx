import { Routes, Route, Navigate } from "react-router";
import Home from "./components/pages/home";
import Login from "./components/pages/login";
import Settings from "./components/pages/settings";
import Email2FA from "./components/pages/email-2fa";
import { useUser } from "./contexts/UserContext";
import { Toaster } from "./components/ui/toaster";

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <p>Nalaganje aplikacije...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Routes>
          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/email-2fa"
            element={user ? <Navigate to="/" replace /> : <Email2FA />}
          />
          <Route
            path="/settings"
            element={user ? <Settings /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </div>
  );
}

export default App;
