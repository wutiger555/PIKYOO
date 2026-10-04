"use client";

import { useRouter } from "next/navigation";
import type { Profile } from "@pikyoo/core/types";
import { deleteAccountAction, saveProfileAction, signOutAction } from "./account";
import { useDemo } from "./demo-store";
import { realAuth } from "./env";
import { lineLogin, lineLogout } from "./line";

/** The current page without the params LINE adds when it sends the browser back. */
const cleanHere = () => {
  const u = new URL(location.href);
  for (const k of ["code", "state", "liffClientId", "liffRedirectUri", "liff.state"]) u.searchParams.delete(k);
  return u.toString();
};

/** 登入／登出／刪除帳號／存個人資料: real LINE + Supabase when realAuth (env.ts), the demo toggle otherwise. */
export function useAccount() {
  const router = useRouter();
  const { setSignedIn, setProfile } = useDemo();
  return {
    real: realAuth,
    /** true once signed in; false when the browser left for LINE's login page */
    async login() {
      if (!realAuth) {
        setSignedIn(true);
        return true;
      }
      const r = await lineLogin();
      if (!r) return false;
      // a full load: client navigation keeps the root layout, which holds the signed-in state (TopNav, 我的)
      location.assign(r.onboarded ? cleanHere() : "/welcome");
      return true;
    },
    async logout() {
      if (!realAuth) return setSignedIn(false);
      await signOutAction();
      await lineLogout();
      router.refresh();
    },
    async deleteAccount() {
      await deleteAccountAction();
      await lineLogout();
      location.assign("/");
    },
    async saveProfile(p: Profile) {
      setProfile(p);
      if (realAuth) await saveProfileAction(p);
    },
  };
}
