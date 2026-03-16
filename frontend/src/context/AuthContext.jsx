import { createContext, useContext, useEffect, useState } from "react";

import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

function persistAuth(token, user) {
  localStorage.setItem("plantogether_token", token);
  localStorage.setItem("plantogether_user", JSON.stringify(user));
}

function clearPersistedAuth() {
  localStorage.removeItem("plantogether_token");
  localStorage.removeItem("plantogether_user");
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("plantogether_token"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("plantogether_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axiosClient.get("/api/auth/verify");
        setUser(data);
        localStorage.setItem("plantogether_user", JSON.stringify(data));
      } catch {
        setToken(null);
        setUser(null);
        clearPersistedAuth();
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, [token]);

  async function register(payload) {
    const { data } = await axiosClient.post("/api/auth/register", payload);
    setToken(data.token);
    setUser(data.user);
    persistAuth(data.token, data.user);
    return data.user;
  }

  async function login(payload) {
    const { data } = await axiosClient.post("/api/auth/login", payload);
    setToken(data.token);
    setUser(data.user);
    persistAuth(data.token, data.user);
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
    clearPersistedAuth();
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: Boolean(token && user),
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
