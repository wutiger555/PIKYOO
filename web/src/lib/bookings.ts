"use server";

import { cancelBooking, decideBooking, requestBooking } from "@pikyoo/core/source/bookings";
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
