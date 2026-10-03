"use client";

import type { Liff } from "@line/liff";
import { LIFF_ID } from "./env";

// LIFF in the browser (docs/SETUP.md §4.2). Loaded on demand: visitors who never sign in don't download it.

let ready: Promise<Liff> | null = null;
const liffReady = () => (ready ??= import("@line/liff").then(async ({ default: liff }) => {
  await liff.init({ liffId: LIFF_ID });
  return liff;
}).catch((e) => {
  ready = null; // let the next tap try again
  console.error("LIFF init failed", e);
  throw new Error("LINE 登入暫時無法使用，請稍後再試");
}));

/** Opened inside LINE, or just back from LINE's login page (LIFF adds liffClientId to the return URL). */
export const fromLine = () => /\bLine\//.test(navigator.userAgent) || new URLSearchParams(location.search).has("liffClientId");

/**
 * 用 LINE 登入. Inside LINE it signs in on the spot; in a browser it first goes to LINE and comes back (returns null then).
 * Resolves with whether 首次登入設定 is done.
 */
export async function lineLogin(): Promise<{ onboarded: boolean } | null> {
  const liff = await liffReady();
  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: location.href });
    return null;
  }
  const r = await fetch("/api/auth/line", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken: liff.getIDToken() }) });
  if (r.status === 401) {
    // the ID token is valid for an hour: log out of LIFF so the next try gets a fresh one
    liff.logout();
    throw new Error("LINE 登入逾時，請再按一次");
  }
  if (!r.ok) throw new Error("登入失敗，請稍後再試");
  return r.json();
}

export async function lineLogout() {
  if (ready) (await ready).logout();
}
