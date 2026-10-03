"use client";

import { useRouter } from "next/navigation";
import type { Profile } from "@pikyoo/core/types";
import { deleteAccountAction, saveProfileAction, signOutAction } from "./account";
import { useDemo } from "./demo-store";
import { realAuth } from "./env";
import { lineLogin, lineLogout } from "./line";

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
      if (r.onboarded) router.refresh();
      else router.push("/welcome");
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
      router.push("/");
      router.refresh();
    },
    async saveProfile(p: Profile) {
      setProfile(p);
      if (realAuth) await saveProfileAction(p);
    },
  };
}
