"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/pk/Toast";
import { reviewLessonAction } from "@/lib/bookings";
import { realAuth } from "@/lib/env";

/** 評價 after a lesson (docs/FLOWS.md §1.7): tap the stars, add a line if you like. Public on the coach page; giving it
 *  again replaces it. With real sign-in it goes to review_lesson; the demo only says thanks. */
export function ReviewBox({ bookingId, coachName, initial, onDone }: {
  bookingId?: string; coachName: string; initial?: { stars: number; body: string }; onDone?: () => void;
}) {
  const toast = useToast();
  const router = useRouter();
  const [stars, setStars] = useState(initial?.stars ?? 0);
  const [body, setBody] = useState(initial?.body ?? "");
  const [busy, setBusy] = useState(false);
  const send = async () => {
    if (realAuth && bookingId) {
      setBusy(true);
      const r = await reviewLessonAction(bookingId, stars, body);
      setBusy(false);
      if (r.error) return toast(r.error);
      router.refresh();
    }
    toast("謝謝你的評價，會顯示在教練頁");
    onDone?.();
  };
  return (
    <div className="review-box">
      <b>{initial ? "你的評價" : `${coachName} 的課怎麼樣？`}</b>
      <div className="review-stars" role="radiogroup" aria-label="星等">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} 顆星`} className={n <= stars ? "on" : ""} onClick={() => setStars(n)}>★</button>
        ))}
      </div>
      <textarea className="input" rows={2} maxLength={300} placeholder="一句話就好（選填）：教得怎麼樣、適合什麼人" value={body} onChange={(e) => setBody(e.target.value)} />
      <button className="btn btn-primary btn-block" disabled={!stars || busy} onClick={send}>{busy ? "送出中…" : initial ? "更新評價" : "送出評價"}</button>
    </div>
  );
}
