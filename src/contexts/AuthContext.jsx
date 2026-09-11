import { createContext, useContext, useState, useEffect } from "react";

const API_URL = "http://localhost:4000/api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed." };
      }

      const loggedInUser = { name: data.name, email: data.email };
      setUser(loggedInUser);
      localStorage.setItem("auth_user", JSON.stringify(loggedInUser));
      return { success: true, user: loggedInUser };

    } catch (err) {
      return { success: false, error: "Could not connect to server. Make sure backend is running." };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || "Signup failed." };
      }

      const newUser = { name, email };
      setUser(newUser);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
      return { success: true, user: newUser };

    } catch (err) {
      return { success: false, error: "Could not connect to server. Make sure backend is running." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  const value = {
    user,
    loading,
    login,
    signup,
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