import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem("fitarena_token");
    const storedUser = localStorage.getItem("fitarena_user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        const response = await api.get("/auth/me");
        setUser(response.data);
        localStorage.setItem("fitarena_user", JSON.stringify(response.data));
      } catch {
        localStorage.removeItem("fitarena_token");
        localStorage.removeItem("fitarena_user");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem("fitarena_token", access_token);
    localStorage.setItem("fitarena_user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const response = await api.post("/auth/register", data);
    localStorage.removeItem("fitarena_token");
    localStorage.removeItem("fitarena_user");
    setUser(null);
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem("fitarena_token");
    localStorage.removeItem("fitarena_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
