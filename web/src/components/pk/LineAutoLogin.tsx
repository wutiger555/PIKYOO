"use client";

import { useEffect, useRef } from "react";
import { useDemo } from "@/lib/demo-store";
import { realAuth } from "@/lib/env";
import { fromLine } from "@/lib/line";
import { useAccount } from "@/lib/use-account";
import { useToast } from "./Toast";

/** Inside LINE, or back from LINE's login page, a visitor is signed in without tapping anything (BACKEND.md §5). */
export function LineAutoLogin() {
  const { signedIn } = useDemo();
  const account = useAccount();
  const toast = useToast();
  const tried = useRef(false);
  useEffect(() => {
    if (!realAuth || signedIn || tried.current || !fromLine()) return;
    tried.current = true;
    account.login().catch((e: Error) => toast(e.message));
  }, [signedIn, account, toast]);
  return null;
}
