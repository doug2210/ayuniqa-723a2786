import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DEFAULT_SITE_CONFIG,
  SITE_CONFIG_KEY,
  loadConfig,
  saveConfig,
  resetConfig as clearStoredConfig,
  type SiteConfig,
} from "@/lib/site-config";

type Ctx = {
  config: SiteConfig;
  setConfig: (next: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => void;
  reset: () => void;
};

const SiteConfigContext = createContext<Ctx | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  // SSR-safe: start with defaults, hydrate from localStorage on mount.
  const [config, setConfigState] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  useEffect(() => {
    setConfigState(loadConfig());
    const onStorage = (e: StorageEvent) => {
      if (e.key === SITE_CONFIG_KEY) setConfigState(loadConfig());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setConfig = useCallback((next: SiteConfig | ((prev: SiteConfig) => SiteConfig)) => {
    setConfigState((prev) => {
      const value = typeof next === "function" ? (next as (p: SiteConfig) => SiteConfig)(prev) : next;
      saveConfig(value);
      return value;
    });
  }, []);

  const reset = useCallback(() => {
    clearStoredConfig();
    setConfigState(DEFAULT_SITE_CONFIG);
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