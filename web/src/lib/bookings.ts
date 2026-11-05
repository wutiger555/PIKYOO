"use server";

import { cancelBooking, coachCancelBooking, decideBooking, requestBooking, reviewLesson } from "@pikyoo/core/source/bookings";
import type { Booking } from "@pikyoo/core/types";
import { supabaseServer } from "./supabase";

// 預約 for real sign-in (B5). The rules (seats, 48-hour window, who may decide) are in the database.
// Errors come back as values: Next.js hides thrown messages in production.

const fail = (e: unknown) => ({ error: (e as Error).message });

export async function requestBookingAction(b: Booking): Promise<{ id?: string; error?: string }> {
  try {
    return { id: await requestBooking(await supabaseServer(), b) };
  } catch (e) {
    return fail(e);
  }
}

export async function decideBookingAction(bookingId: string, accept: boolean): Promise<{ error?: string }> {
  try {
    await decideBooking(await supabaseServer(), String(bookingId), !!accept);
    return {};
  } catch (e) {
    return fail(e);
  }
}

export async function cancelBookingAction(bookingId: string): Promise<{ error?: string }> {
  try {
    await cancelBooking(await supabaseServer(), String(bookingId));
    return {};
  } catch (e) {
    return fail(e);
  }
}

/** 評價 a lesson the student has taken (1–5 stars, a line of text). */
export async function reviewLessonAction(bookingId: string, stars: number, body: string): Promise<{ error?: string }> {
  try {
    await reviewLesson(await supabaseServer(), String(bookingId), Number(stars), String(body ?? ""));
    return {};
  } catch (e) {
    return fail(e);
  }
}

/** 取消這堂 as the coach, with a short reason the student sees. */
export async function coachCancelAction(bookingId: string, reason: string): Promise<{ error?: string }> {
  try {
    await coachCancelBooking(await supabaseServer(), String(bookingId), String(reason ?? ""));
    return {};
  } catch (e) {
    return fail(e);
  }
}
