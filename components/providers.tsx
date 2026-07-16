"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Language, SessionUser } from "@/lib/types";

type LanguageContextValue = { language: Language; toggleLanguage: () => void; pick: (en: string, ar: string) => string };
type AuthContextValue = { user: SessionUser | null; loading: boolean; refreshUser: () => Promise<void>; logout: () => Promise<void> };

const LanguageContext = createContext<LanguageContextValue | null>(null);
const AuthContext = createContext<AuthContextValue | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("smartstay-language") as Language | null;
    // Restore the browser preference after hydration so the server markup stays deterministic.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "ar") setLanguage("ar");
    document.documentElement.classList.toggle("capture-mode", new URLSearchParams(window.location.search).get("capture") === "1");
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("smartstay-language", language);
  }, [language]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await response.json() as { user?: SessionUser };
      setUser(data.user ?? null);
    } catch { setUser(null); }
    finally { setLoading(false); }
  }, []);

  // refreshUser updates state only after its asynchronous request has completed.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void refreshUser(); }, [refreshUser]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }, []);

  const languageValue = useMemo(() => ({ language, toggleLanguage: () => setLanguage((value) => value === "en" ? "ar" : "en"), pick: (en: string, ar: string) => language === "ar" ? ar : en }), [language]);
  const authValue = useMemo(() => ({ user, loading, refreshUser, logout }), [user, loading, refreshUser, logout]);

  return <LanguageContext.Provider value={languageValue}><AuthContext.Provider value={authValue}>{children}</AuthContext.Provider></LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used within Providers");
  return value;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within Providers");
  return value;
}
