import { createContext, useContext, useState, useEffect } from "react";

const API_URL = "http://localhost:4000/api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const restoreSession = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (response.status === 401) {
          setUser(null);
          return;
        }
        if (!response.ok) {
          throw new Error("Could Not Restore Your Session.");
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        if (error.name !== "AbortError") {
          setUser(null);
          setSessionError(
            "Could Not Connect To Server. Make Sure Backend Is Running.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    restoreSession();
    return () => controller.abort();
  }, []);

  const login = async (email, password) => {
    setSessionError(null);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login Failed." };
      }
      const loggedInUser = data.user;
      setUser(loggedInUser);
      setSessionError(null);
      return { success: true, user: loggedInUser };
    } catch (err) {
      return { success: false, error: "Could Not Connect To Server. Make Sure Backend Is Running." };
    }
  };

  const signup = async (name, email, password) => {
    setSessionError(null);
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Signup Failed." };
      }
      const newUser = data.user;
      setUser(newUser);
      setSessionError(null);
      return { success: true, user: newUser };
    } catch (err) {
      return { success: false, error: "Could Not Connect To Server. Make Sure Backend Is Running." };
    }
  };

  const updateProfile = async (name, email) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Could Not Update Account Details.",
        };
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return {
        success: false,
        error: "Could Not Connect To Server. Make Sure Backend Is Running.",
      };
    }
  };

  const logout = async () => {
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Could Not Log Out. Please Try Again.");
    }
    setUser(null);
    setSessionError(null);
  };

  const value = {
    user,
    loading,
    sessionError,
    login,
    signup,
    updateProfile,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
