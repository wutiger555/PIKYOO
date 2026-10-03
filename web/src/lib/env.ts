// Public settings, inlined at build time (safe to import from client code).

export const isLive = process.env.NEXT_PUBLIC_DATA_SOURCE === "live";
/** Trimmed, no trailing / — next.config.ts checks the same cleaned value. */
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID ?? "";
/** Real sign-in (LINE → Supabase) only in live mode with a LIFF app set; otherwise 登入／登出 stays the demo toggle. */
export const realAuth = isLive && !!LIFF_ID;
