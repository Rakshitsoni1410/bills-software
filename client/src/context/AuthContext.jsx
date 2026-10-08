import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "../api/client";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Wrapped in useCallback so it's stable across renders
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true); // ✅ always reset loading before fetch
      const data = await api.get("/auth/me");
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false); // ✅ always set false after
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async (reason = null) => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // ignore
    }
    setUser(null);
    if (reason) {
      toast.error(reason, { duration: 5000 });
    }
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, refreshUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
