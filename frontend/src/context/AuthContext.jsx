import { createContext, useContext, useEffect, useState } from "react";

import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      try {
        const { data } = await axiosClient.get("/api/auth/verify");
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, []);

  async function register(payload) {
    const { data } = await axiosClient.post("/api/auth/register", payload);
    setUser(data.user);
    return data.user;
  }

  async function login(payload) {
    const { data } = await axiosClient.post("/api/auth/login", payload);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await axiosClient.post("/api/auth/logout");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
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
