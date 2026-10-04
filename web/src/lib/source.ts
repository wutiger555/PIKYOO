import { connection } from "next/server";
import { cache } from "react";
import { demo } from "@pikyoo/core/source/demo";
import { createLive } from "@pikyoo/core/source/live";
import { readMyCoach } from "@pikyoo/core/source/me-coach";
import type { Catalog } from "@pikyoo/core/source/types";
import { isLive, SUPABASE_KEY, SUPABASE_URL } from "./env";
import { getMe, supabaseServer } from "./supabase";

// NEXT_PUBLIC_DATA_SOURCE picks where the screens' data comes from: unset or "demo" = mock data, "live" = Supabase.
// Unset means demo so the demo site can never reach the real database by accident (docs/BACKEND.md §1.1).
// next.config.ts fails the build when live mode is missing its Supabase settings.

const source = isLive ? createLive({ url: SUPABASE_URL, publishableKey: SUPABASE_KEY }) : demo;

/** One load per request, shared by the layout, the page and its metadata. Live never prerenders database rows into the build. */
export const getCatalog = cache(async (): Promise<Catalog> => {
  if (!isLive) return source.catalog();
  await connection();
  const me = await getMe();
  const catalog = await source.catalog(me?.id);
  // the coach's own page at any status needs their session (RLS), not the visitor client the catalog uses
  return me ? { ...catalog, myCoach: await readMyCoach(await supabaseServer(), SUPABASE_URL, me.id) } : catalog;
});

export const getCourt = async (id: string) => (await getCatalog()).courts.find((c) => c.id === id);
export const getCoach = async (id: string) => (await getCatalog()).coaches.find((c) => c.id === id);
export const getGame = async (id: string) => (await getCatalog()).games.find((g) => g.id === id);
