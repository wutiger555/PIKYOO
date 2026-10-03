import type { NextConfig } from "next";

// Live mode reads Supabase through NEXT_PUBLIC_ values, which are baked in at build time. Missing or malformed ones
// took production down once (#11, every page 500), so fail the build instead: Vercel keeps serving the last good deploy.
if (process.env.NEXT_PUBLIC_DATA_SOURCE === "live") {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, ""); // same cleanup as lib/source.ts
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  const problems = [
    // Vercel redacts sensitive values in build logs, so describe what is wrong instead of printing the URL
    !/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url) &&
      `NEXT_PUBLIC_SUPABASE_URL should be https://<ref>.supabase.co (after trimming spaces and a trailing /). ` +
      `It ${url.startsWith("https://") ? "starts" : "does NOT start"} with https://, ` +
      `${url.endsWith(".supabase.co") ? "ends" : "does NOT end"} with .supabase.co, ` +
      `${/\s|"|'/.test(url) ? "contains spaces or quotes" : "has no spaces or quotes"}, ` +
      `${/[A-Z]/.test(url) ? "has capital letters" : "is lower-case"}, length ${url.length} (expected 40).`,
    (!key || key !== key.trim()) && "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing or has spaces around it",
    // a LIFF ID turns on real LINE sign-in (lib/env.ts), which needs these two on the server
    process.env.NEXT_PUBLIC_LIFF_ID && !process.env.LINE_CHANNEL_ID && "NEXT_PUBLIC_LIFF_ID is set but LINE_CHANNEL_ID is missing",
    process.env.NEXT_PUBLIC_LIFF_ID && !process.env.SUPABASE_SECRET_KEY && "NEXT_PUBLIC_LIFF_ID is set but SUPABASE_SECRET_KEY is missing",
  ].filter(Boolean);
  if (problems.length) throw new Error(`NEXT_PUBLIC_DATA_SOURCE=live, but:\n- ${problems.join("\n- ")}`);
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
