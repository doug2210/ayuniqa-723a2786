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
  loaded: boolean;
};

const SiteConfigContext = createContext<Ctx | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Supabase is the single source of truth. No localStorage hydration —
    // stale cached icons must never override what admins saved.
    try {
      window.localStorage.removeItem("ayuniqa.siteConfig.v1");
    } catch {
      // ignore
    }
    let cancelled = false;
    const applyRow = (row: { data: unknown } | null) => {
      if (cancelled) return;
      const value = row?.data;
      const isEmpty =
        typeof value === "object" && value !== null && Object.keys(value as object).length === 0;
      if (value && !isEmpty) {
        setConfigState(mergeConfig(value));
      }
      setLoaded(true);
    };

    supabase
      .from("site_config")
      .select("data")
      .eq("id", SITE_CONFIG_ROW_ID)
      .maybeSingle()
      .then(({ data }) => applyRow(data ?? null));

    // Live updates: any admin save in any tab/device propagates instantly here.
    const channel = supabase
      .channel("site_config_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_config", filter: `id=eq.${SITE_CONFIG_ROW_ID}` },
        (payload) => {
          const next = (payload.new as { data?: unknown } | null) ?? null;
          if (next && "data" in next) applyRow(next as { data: unknown });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
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
    <SiteConfigContext.Provider value={{ config, setConfig, reset, loaded }}>
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
      loaded: false,
    };
  }
  return ctx;
}