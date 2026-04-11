import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; isAdmin: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  const checkAdminRole = useCallback(async (userId: string) => {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    return !error && !!data;
  }, []);

  const syncAuthState = useCallback(async (nextSession: Session | null) => {
    if (!isMountedRef.current) return;

    setSession(nextSession);

    const nextUser = nextSession?.user ?? null;
    setUser(nextUser);

    if (!nextUser) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const hasAdminRole = await checkAdminRole(nextUser.id);

    if (!isMountedRef.current) return;

    setIsAdmin(hasAdminRole);
    setLoading(false);
  }, [checkAdminRole]);

  useEffect(() => {
    isMountedRef.current = true;

    const handleSessionChange = (nextSession: Session | null) => {
      setLoading(true);
      void syncAuthState(nextSession);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => {
        if (isMountedRef.current) {
          handleSessionChange(nextSession);
        }
      }, 0);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        if (isMountedRef.current) {
          handleSessionChange(currentSession);
        }
      })
      .catch(() => {
        if (!isMountedRef.current) return;

        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [syncAuthState]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      return { error: error.message, isAdmin: false };
    }

    const signedInUser = data.user;
    const signedInSession = data.session;

    if (!signedInUser || !signedInSession) {
      setLoading(false);
      return { error: "SESSION_NOT_READY", isAdmin: false };
    }

    const hasAdminRole = await checkAdminRole(signedInUser.id);

    if (!hasAdminRole) {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      return { error: "ADMIN_ONLY", isAdmin: false };
    }

    setSession(signedInSession);
    setUser(signedInUser);
    setIsAdmin(true);
    setLoading(false);

    return { error: null, isAdmin: true };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
