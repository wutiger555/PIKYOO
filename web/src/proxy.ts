import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { realAuth, SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";

/** Refreshes the Supabase session cookie on each request (Server Components can't). Does nothing until real sign-in is on. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!realAuth) return response;
  const sb = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });
  // nothing between createServerClient and getClaims, or sessions drop at random (Supabase SSR guide)
  await sb.auth.getClaims();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|photos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
