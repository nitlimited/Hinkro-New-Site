import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import type { Profile, UserRole } from "../types";

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  profile: null,
  loading: true,
  isDemo: false,
  signOut: async () => {},
});

/* ---- Demo mode ---------------------------------------------------------
   Lets the team preview each dashboard with sample data before the
   Supabase backend is configured. Only available when no backend exists,
   so it can never mask or bypass real authentication. */

const DEMO_KEY = "hinkro-portal-demo-role";
const DEMO_ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "editor",
  "content_manager",
  "weaver",
  "client",
];

const DEMO_NAMES: Record<UserRole, string> = {
  super_admin: "Ama Serwaa (Demo)",
  admin: "Ama Serwaa (Demo)",
  editor: "Efua Mensima (Demo)",
  content_manager: "Efua Mensima (Demo)",
  weaver: "Kwabena Owusu (Demo)",
  client: "Deborah Adjei (Demo)",
};

export function startDemo(role: UserRole) {
  sessionStorage.setItem(DEMO_KEY, role);
}

function getDemoProfile(): Profile | null {
  if (isSupabaseConfigured) return null;
  const stored = sessionStorage.getItem(DEMO_KEY) as UserRole | null;
  if (!stored || !DEMO_ROLES.includes(stored)) return null;
  return {
    id: "demo-user",
    full_name: DEMO_NAMES[stored],
    email: "demo@hinkrokente.com",
    phone: null,
    role: stored,
    status: "active",
    avatar_url: null,
    created_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = !isSupabaseConfigured && profile?.id === "demo-user";

  useEffect(() => {
    if (!supabase) {
      setProfile(getDemoProfile());
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user) return;
    let cancelled = false;

    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        if (cancelled) return;
        setProfile((data as Profile) ?? null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const signOut = async () => {
    if (isDemo) {
      sessionStorage.removeItem(DEMO_KEY);
      window.location.assign("/portal");
      return;
    }
    await supabase?.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, isDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
