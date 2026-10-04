"use server";

import { answerQuestion, askQuestion } from "@pikyoo/core/source/questions";
import { supabaseServer } from "./supabase";

// 問與答 for real sign-in (B5). Errors come back as values: Next.js hides thrown messages in production.

const run = async (f: () => Promise<void>) => {
  try {
    await f();
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
};

export const askQuestionAction = async (coachSlug: string, text: string) =>
  run(async () => {
    const sb = await supabaseServer();
    const { data } = await sb.auth.getClaims();
    if (!data?.claims.sub) throw new Error("請先登入");
    await askQuestion(sb, data.claims.sub, String(coachSlug), String(text));
  });

export const answerQuestionAction = async (questionId: string, text: string) =>
  run(async () => answerQuestion(await supabaseServer(), String(questionId), String(text)));
