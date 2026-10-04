"use server";

import { reviewCoach, reviewCredential } from "@pikyoo/core/source/review";
import { supabaseServer } from "./supabase";

// 審核 actions for PIKYOO admins. review_coach / review_credential check is_admin() in the database.
// Errors come back as values: Next.js hides thrown messages in production.

const run = async (f: () => Promise<void>) => {
  try {
    await f();
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
};

export const reviewCoachAction = async (coachId: string, approve: boolean, note: string) =>
  run(async () => reviewCoach(await supabaseServer(), String(coachId), !!approve, String(note ?? "")));

export const reviewCredentialAction = async (credentialId: string, verified: boolean) =>
  run(async () => reviewCredential(await supabaseServer(), String(credentialId), !!verified));
