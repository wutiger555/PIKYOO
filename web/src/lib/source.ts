import { connection } from "next/server";
import { cache } from "react";
import { demo } from "@pikyoo/core/source/demo";
import { createLive } from "@pikyoo/core/source/live";
import type { Catalog } from "@pikyoo/core/source/types";

// NEXT_PUBLIC_DATA_SOURCE picks where the screens' data comes from: unset or "demo" = mock data, "live" = Supabase.
// Unset means demo so the demo site can never reach the real database by accident (docs/BACKEND.md §1.1).
// next.config.ts fails the build when live mode is missing its Supabase settings.

export const isLive = process.env.NEXT_PUBLIC_DATA_SOURCE === "live";
const source = isLive
  ? createLive({ url: process.env.NEXT_PUBLIC_SUPABASE_URL!, publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! })
  : demo;

/** One load per request, shared by the layout, the page and its metadata. Live never prerenders database rows into the build. */
export const getCatalog = cache(async (): Promise<Catalog> => {
  if (isLive) await connection();
  return source.catalog();
});

export const getCourt = async (id: string) => (await getCatalog()).courts.find((c) => c.id === id);
export const getCoach = async (id: string) => (await getCatalog()).coaches.find((c) => c.id === id);
export const getGame = async (id: string) => (await getCatalog()).games.find((g) => g.id === id);
