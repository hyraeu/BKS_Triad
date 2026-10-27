import { useEffect } from "react";
import "./App.css";
import AuthPage from "./components/AuthPage.jsx";
import Dashboard from "./components/Dashboard.jsx";
import "./index.css";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { user, loading, logout, updateProfile } = useAuth();

  useEffect(() => {
    if (loading) return;

    const route = user ? "/dashboard" : "/login";
    if (window.location.pathname !== route) {
      window.history.replaceState(null, "", route);
    }
  }, [loading, user]);

  if (loading) {
    return <main className="app-loading">Loading...</main>;
  }

  return (
    <div className="App">
      {user ? (
        <Dashboard
          user={user}
          onLogout={logout}
          onUpdateProfile={updateProfile}
        />
      ) : (
        <AuthPage />
      )}
    </div>
  );
}
export default App;
