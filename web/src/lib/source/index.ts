import { cache } from "react";
import { demo } from "./demo";
import { live } from "./live";
import type { Catalog } from "./types";

// NEXT_PUBLIC_DATA_SOURCE picks where the screens' data comes from: unset or "demo" = mock data, "live" = Supabase.
// Unset means demo so the demo site can never reach the real database by accident (docs/BACKEND.md §1.1).

export const isLive = process.env.NEXT_PUBLIC_DATA_SOURCE === "live";
const source = isLive ? live : demo;

/** One load per request, shared by the layout, the page and its metadata. */
export const getCatalog = cache((): Promise<Catalog> => source.catalog());

export const getCourt = async (id: string) => (await getCatalog()).courts.find((c) => c.id === id);
export const getCoach = async (id: string) => (await getCatalog()).coaches.find((c) => c.id === id);
export const getGame = async (id: string) => (await getCatalog()).games.find((g) => g.id === id);
