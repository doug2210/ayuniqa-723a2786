import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DEFAULT_SITE_CONFIG,
  mergeConfig,
  type SiteConfig,
} from "@/lib/site-config";
import { supabase, SITE_CONFIG_ROW_ID } from "@/integrations/supabase/client";

type Ctx = {
  config: SiteConfig;
  setConfig: (next: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => void;
  reset: () => void;
};

const SiteConfigContext = createContext<Ctx | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  useEffect(() => {
    // Supabase is the single source of truth. No localStorage hydration —
    // stale cached icons must never override what admins saved.
    try {
      window.localStorage.removeItem("ayuniqa.siteConfig.v1");
    } catch {
      // ignore
    }
    supabase
      .from("site_config")
      .select("data")
      .eq("id", SITE_CONFIG_ROW_ID)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data?.data) return;
        const isEmpty =
          typeof data.data === "object" &&
          data.data !== null &&
          Object.keys(data.data as object).length === 0;
        if (isEmpty) return;
        setConfigState(mergeConfig(data.data));
      });
  }, []);

  const setConfig = useCallback((next: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => {
    setConfigState((prev) => {
      const value = typeof next === "function" ? (next as (p: SiteConfig) => SiteConfig)(prev) : next;
      // Persist to Supabase only — RLS restricts writes to admins.
      void supabase
        .from("site_config")
        .upsert({ id: SITE_CONFIG_ROW_ID, data: value as unknown as Record<string, unknown>, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.warn("[site_config] save failed:", error.message);
        });
      return value;
    });
  }, []);

  const reset = useCallback(() => {
    setConfigState(DEFAULT_SITE_CONFIG);
    void supabase
      .from("site_config")
      .upsert({ id: SITE_CONFIG_ROW_ID, data: {} as Record<string, unknown>, updated_at: new Date().toISOString() });
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, setConfig, reset }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): Ctx {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    // Fallback so components used outside the provider (e.g. early SSR) still work.
    return {
      config: DEFAULT_SITE_CONFIG,
      setConfig: () => {},
      reset: () => {},
    };
  }
  return ctx;
}