import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiFetch,
  clearAdminToken,
  getAdminToken,
  setAdminToken,
  type AdminLoginResponse,
} from "@/lib/api";

interface AuthContextValue {
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiFetch<{ email: string }>("/api/admin/me")
      .then((me) => setEmail(me.email))
      .catch(() => clearAdminToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (emailInput: string, password: string) => {
    const data = await apiFetch<AdminLoginResponse>("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ email: emailInput, password }),
    });
    setAdminToken(data.access_token);
    setEmail(data.email);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* token already invalid — still clear local state */
    }
    clearAdminToken();
    setEmail(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      email,
      isAuthenticated: email !== null,
      isLoading,
      login,
      logout,
    }),
    [email, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
