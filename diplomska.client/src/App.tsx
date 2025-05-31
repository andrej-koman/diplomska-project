import { Routes, Route, Navigate } from "react-router";
import Home from "./components/pages/home";
import Dashboard from "./components/pages/dashboard";
import Login from "./components/pages/login"; // Ensure you have this component for the login form
import { useUser } from "./contexts/UserContext";

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
            element={user ? <Dashboard /> : <Home />}
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
