import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { login as apiLogin, register as apiRegister } from "@/lib/api";

const STORAGE_KEY = "jobboard_auth";

interface StoredAuth {
  token: string;
  email: string;
}

interface AuthContextValue {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => readStoredAuth());

  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [auth]);

  async function login(email: string, password: string) {
    const response = await apiLogin(email, password);
    setAuth({ token: response.token, email: response.email });
  }

  async function register(email: string, password: string) {
    const response = await apiRegister(email, password);
    setAuth({ token: response.token, email: response.email });
  }

  function logout() {
    setAuth(null);
  }

  const value: AuthContextValue = {
    token: auth?.token ?? null,
    email: auth?.email ?? null,
    isAuthenticated: auth !== null,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
