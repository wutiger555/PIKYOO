"use server";

import { deleteNote, writeNote } from "@pikyoo/core/source/notes";
import { supabaseServer } from "./supabase";

// 課後筆記 for real sign-in. Who may write, and the no-contact rule, are in the database (write_lesson_note).

const fail = (e: unknown) => ({ error: (e as Error).message });

export async function writeNoteAction(bookingId: string, body: string, shared: boolean, noteId?: string): Promise<{ id?: string; error?: string }> {
  try {
    return { id: await writeNote(await supabaseServer(), String(bookingId), String(body), !!shared, noteId ? String(noteId) : undefined) };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteNoteAction(noteId: string): Promise<{ error?: string }> {
  try {
    await deleteNote(await supabaseServer(), String(noteId));
    return {};
  } catch (e) {
    return fail(e);
  }
}
