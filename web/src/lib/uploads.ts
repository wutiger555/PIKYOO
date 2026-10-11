"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@pikyoo/core/source/db.types";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

// Uploads go from the browser straight to Supabase Storage with the visitor's own session (paths start with their
// user id, which the bucket policies require). Server Actions would cap the file at 1 MB.

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;
const sb = () => (client ??= createBrowserClient<Database>(SUPABASE_URL, SUPABASE_KEY));

async function myId() {
  const { data } = await sb().auth.getClaims();
  const id = data?.claims.sub;
  if (!id) throw new Error("請先登入");
  return id;
}
const stamp = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/** Phone photos run 5–12 MB and the buckets take 5–10 MB: re-encode as JPEG with the longest side at most `max` px. */
async function shrink(file: File, max: number): Promise<Blob> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error("這個檔案格式無法讀取，請改用 JPG 或 PNG");
  }
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error("照片處理失敗，請換一張試試"))), "image/jpeg", 0.85));
}

/** Coach page photos (public bucket). Returns their public URLs; the page stores them on 儲存. */
export async function uploadCoachPhotos(files: File[]): Promise<string[]> {
  const me = await myId();
  return Promise.all(files.map(async (f) => {
    const path = `${me}/${stamp()}.jpg`;
    const r = await sb().storage.from("coach-photos").upload(path, await shrink(f, 1600), { contentType: "image/jpeg" });
    if (r.error) throw new Error(`照片上傳失敗：${r.error.message}`);
    return sb().storage.from("coach-photos").getPublicUrl(path).data.publicUrl;
  }));
}

/** A certificate scan (private bucket: only the coach and PIKYOO admins can open it). Returns its storage path. */
export async function uploadCredentialScan(file: File): Promise<string> {
  const me = await myId();
  const pdf = file.type === "application/pdf";
  if (pdf && file.size > 10 * 1024 * 1024) throw new Error("PDF 請小於 10MB");
  const path = `${me}/${stamp()}.${pdf ? "pdf" : "jpg"}`;
  const r = await sb().storage.from("credentials").upload(path, pdf ? file : await shrink(file, 2400), { contentType: pdf ? "application/pdf" : "image/jpeg" });
  if (r.error) throw new Error(`證照上傳失敗：${r.error.message}`);
  return path;
}

/** 對帳截圖 for a payment (private bucket: only the student and that lesson's coach can open it). Returns its path. */
export async function uploadPaymentProof(paymentId: string, file: File): Promise<string> {
  const me = await myId();
  const path = `${me}/${paymentId}/${stamp()}.jpg`;
  const r = await sb().storage.from("payment-proofs").upload(path, await shrink(file, 1600), { contentType: "image/jpeg" });
  if (r.error) throw new Error(`截圖上傳失敗：${r.error.message}`);
  return path;
}
