import { createContext, useContext, useState, useEffect } from "react";
const MOCK_USERS = [
  {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    password: "Password123!",
  },

  {
    id: 2,
    name: "Jamie Rivera",
    email: "jamie@marginal.com",
    password: "SecurePass456!",
  },
];

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

  const login = (email, password) => {

    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password,
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("auth_user", JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }

    return {
      success: false,
      error: "Invalid email or password. Please try again.",
    };
  };

  const signup = (name, email, password) => {
    const existingUser = MOCK_USERS.find((u) => u.email === email);

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }
    const newUser = {
      id: MOCK_USERS.length + 1,
      name,
      email,
      password,
    };

    MOCK_USERS.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem("auth_user", JSON.stringify(userWithoutPassword));
    return { success: true, user: userWithoutPassword };
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
