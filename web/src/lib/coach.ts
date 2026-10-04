"use server";

import { addCredential, applyCoach, removeCredential, saveMyCoach, submitMyCoach } from "@pikyoo/core/source/me-coach";
import type { Coach } from "@pikyoo/core/types";
import { SUPABASE_URL } from "./env";
import { supabaseServer } from "./supabase";

// 教練後台 for real sign-in. Errors come back as values: Next.js hides thrown messages in production.

type Result = { error?: string };
const run = async (f: () => Promise<void>): Promise<Result> => {
  try {
    await f();
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
};

async function viewer() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getClaims();
  if (!data?.claims.sub) throw new Error("請先登入");
  return { sb, id: data.claims.sub };
}

export const applyCoachAction = async (slug: string, name: string) =>
  run(async () => { const { sb, id } = await viewer(); await applyCoach(sb, id, String(slug), String(name)); });

export const saveCoachAction = async (coachRowId: string, coach: Coach) =>
  run(async () => { const { sb } = await viewer(); await saveMyCoach(sb, SUPABASE_URL, String(coachRowId), coach); });

export const submitCoachAction = async (coachRowId: string) =>
  run(async () => { const { sb } = await viewer(); await submitMyCoach(sb, String(coachRowId)); });

export const addCredentialAction = async (coachRowId: string, issuer: string, level: string, documentPath: string) =>
  run(async () => { const { sb } = await viewer(); await addCredential(sb, String(coachRowId), String(issuer), String(level), String(documentPath)); });

export const removeCredentialAction = async (credentialId: string) =>
  run(async () => { const { sb } = await viewer(); await removeCredential(sb, String(credentialId)); });
