import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { demo } from "@pikyoo/core/source/demo";
import { createLive } from "@pikyoo/core/source/live";
import type { Catalog } from "@pikyoo/core/source/types";

// Where the screens' data comes from, the same rule as the website (web/src/lib/source.ts): EXPO_PUBLIC_DATA_SOURCE=live
// reads Supabase with the publishable key; unset or "demo" is the mock data, so a build can't reach the real database by accident.

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const isLive = process.env.EXPO_PUBLIC_DATA_SOURCE === "live" && !!url && !!key;
const source = isLive ? createLive({ url, publishableKey: key }) : demo;

interface State { catalog: Catalog | null; error: string | null; refreshing: boolean; refresh: () => Promise<void> }
const Ctx = createContext<State>({ catalog: null, error: null, refreshing: false, refresh: async () => {} });

/** Loads coaches, courts and games once at launch; lists pull to refresh. Signed-in extras (mine, myCoach) come with step 17. */
export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setCatalog(await source.catalog());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  return <Ctx.Provider value={{ catalog, error, refreshing, refresh }}>{children}</Ctx.Provider>;
}

export const useCatalog = () => useContext(Ctx);
