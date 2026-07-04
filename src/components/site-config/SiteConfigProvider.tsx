import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DEFAULT_SITE_CONFIG,
  mergeConfig,
  type SiteConfig,
} from "@/lib/site-config";
import { supabase } from "@/integrations/supabase/client";
import { SITE_CONFIG_ROW_ID } from "@/integrations/supabase/site-config";

type Ctx = {
  config: SiteConfig;
  setConfig: (next: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => void;
  reset: () => void;
  loaded: boolean;
};

const SiteConfigContext = createContext<Ctx | null>(null);

const BROADCAST_CHANNEL = "ayuniqa.siteConfig.v1";

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

    // Cross-tab live updates via BroadcastChannel (no backend realtime needed).
    let bc: BroadcastChannel | null = null;
    const handleMessage = (ev: MessageEvent) => {
      const value = ev.data;
      if (cancelled || !value) return;
      setConfigState(mergeConfig(value));
    };
    try {
      bc = new BroadcastChannel(BROADCAST_CHANNEL);
      bc.addEventListener("message", handleMessage);
    } catch {
      // BroadcastChannel unsupported — same-tab updates still work via setState.
    }

    return () => {
      cancelled = true;
      if (bc) {
        bc.removeEventListener("message", handleMessage);
        bc.close();
        bc = null;
      }
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
      // Notify other tabs in the same browser instantly.
      try {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL);
        bc.postMessage(value);
        bc.close();
      } catch {
        // ignore
      }
      return value;
    });
  }, []);

  const reset = useCallback(() => {
    setConfigState(DEFAULT_SITE_CONFIG);
    void supabase
      .from("site_config")
      .upsert({ id: SITE_CONFIG_ROW_ID, data: {} as Record<string, unknown>, updated_at: new Date().toISOString() });
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL);
      bc.postMessage(DEFAULT_SITE_CONFIG);
      bc.close();
    } catch {
      // ignore
    }
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