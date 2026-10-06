"use server";

import { markPaid, rejectReport, remindPayment, reportPayment, savePayout, type PayoutDetails } from "@pikyoo/core/source/payments";
import { supabaseServer } from "./supabase";

// 收款 for real sign-in (B5). Errors come back as values: Next.js hides thrown messages in production.

const run = async (f: () => Promise<void>) => {
  try {
    await f();
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
};

export const markPaidAction = async (paymentId: string) => run(async () => markPaid(await supabaseServer(), String(paymentId)));

export const reportPaymentAction = async (paymentId: string, last5: string) =>
  run(async () => reportPayment(await supabaseServer(), String(paymentId), String(last5 ?? "")));

export const savePayoutAction = async (coachRowId: string, details: PayoutDetails) =>
  run(async () => savePayout(await supabaseServer(), String(coachRowId), details));

export const rejectReportAction = async (paymentId: string) => run(async () => rejectReport(await supabaseServer(), String(paymentId)));

export const remindPaymentAction = async (paymentId: string) => run(async () => remindPayment(await supabaseServer(), String(paymentId)));
