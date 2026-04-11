import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserSession {
  token: string;
  entity_id: string;
  entity_type: "blogger" | "business";
  name: string;
  avatar_url: string | null;
}

interface UserAuthContextType {
  session: UserSession | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ error: string | null }>;
  logout: () => void;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

const STORAGE_KEY = "bloggerha_user_session";

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/verify-credentials`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          return { error: "RATE_LIMITED" };
        }
        return { error: data.error ?? "LOGIN_FAILED" };
      }

      const userSession: UserSession = {
        token: data.token,
        entity_id: data.entity_id,
        entity_type: data.entity_type,
        name: data.name,
        avatar_url: data.avatar_url,
      };

      setSession(userSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userSession));
      return { error: null };
    } catch {
      return { error: "NETWORK_ERROR" };
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <UserAuthContext.Provider value={{ session, loading, login, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within UserAuthProvider");
  return ctx;
};
