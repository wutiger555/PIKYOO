import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";
import { readMe, type Me } from "@pikyoo/core/source/me";
import type { Database } from "@pikyoo/core/source/db.types";
import { realAuth, SUPABASE_KEY, SUPABASE_URL } from "./env";

// Server-only Supabase clients. The browser never gets the secret key; it only holds the session cookie.

/** Acts as the signed-in visitor (RLS applies). Server Components can't write cookies; proxy.ts refreshes them. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // called from a Server Component: proxy.ts already refreshed the session
        }
      },
    },
  });
}

/** Bypasses RLS: only for /api/auth/line and account deletion. */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient<Database>(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** The signed-in person, null for a visitor, undefined when sign-in is the demo toggle (see env.ts). */
export const getMe = cache(async (): Promise<Me | null | undefined> => {
  if (!realAuth) return undefined;
  const sb = await supabaseServer();
  const { data } = await sb.auth.getClaims();
  const id = data?.claims.sub;
  return id ? readMe(sb, id) : null;
});
