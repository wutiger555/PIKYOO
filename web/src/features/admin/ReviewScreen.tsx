"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { AppBar } from "@/components/pk/Shell";
import { useToast } from "@/components/pk/Toast";
import { TopNav } from "@/components/pk/TopNav";
import type { CoachToReview, CredentialToReview } from "@pikyoo/core/source/review";
import { reviewCoachAction, reviewCredentialAction } from "@/lib/admin";

const when = (iso: string) => new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });

/** PIKYOO 審核 (B4): coach pages waiting to go public, certificates waiting to be checked against the issuer's list. */
export function ReviewScreen({ queue }: { queue: { coaches: CoachToReview[]; credentials: CredentialToReview[] } }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const act = async (id: string, f: () => Promise<{ error?: string }>, done: string) => {
    setBusy(id);
    const r = await f();
    setBusy(null);
    if (r.error) return toast(r.error);
    toast(done);
    router.refresh();
  };
  const returnCoach = (c: CoachToReview) => {
    const note = prompt(`退回「${c.name}」的教練頁：寫一句要補什麼（會通知教練）`, "請補上課照片與證照");
    if (note !== null) act(c.id, () => reviewCoachAction(c.id, false, note), "已退回，教練會收到通知");
  };

  return (
    <>
      <AppBar title="PIKYOO 審核" back="/me" />
      <div className="scroll dk dk-narrow">
        <TopNav />
        <h1 className="dk-only" style={{ margin: "var(--space-4) 0" }}>PIKYOO 審核</h1>

        <section className="sec">
          <div className="sec-head"><h2>教練頁待審核</h2><span className="text-muted">{queue.coaches.length} 筆</span></div>
          {!queue.coaches.length && <p className="text-muted">目前沒有待審核的教練頁。</p>}
          {queue.coaches.map((c) => (
            <div key={c.id} className="ed-card" style={{ marginBottom: 12 }}>
              <b>{c.name}</b> <span className="text-muted">pikyoo.tw/c/{c.slug}</span>
              <p style={{ margin: "4px 0" }}>{c.tagline || <span className="text-muted">（還沒寫一句話介紹）</span>}</p>
              <p className="fine" style={{ margin: 0 }}>
                {c.areas.join("、") || "未填區域"}・照片 {c.photoCount} 張・方案 {c.planCount} 個・{when(c.submittedAt)} 送出
              </p>
              <div className="btnrow" style={{ marginTop: 10 }}>
                <Link className="btn btn-secondary" href={`/admin/coaches/${c.slug}`}>看頁面</Link>
                <button className="btn btn-primary" disabled={busy === c.id} onClick={() => act(c.id, () => reviewCoachAction(c.id, true, ""), "已核准，教練頁公開了")}>核准公開</button>
                <button className="btn btn-ghost" disabled={busy === c.id} onClick={() => returnCoach(c)}>退回修改</button>
              </div>
            </div>
          ))}
        </section>

        <section className="sec">
          <div className="sec-head"><h2>證照待查驗</h2><span className="text-muted">{queue.credentials.length} 筆</span></div>
          <p className="fine" style={{ marginTop: 0 }}>打開檔案，和協會／總會的公開名單比對姓名與等級。檔案連結 1 小時後失效，重新整理即可。</p>
          {!queue.credentials.length && <p className="text-muted">目前沒有待查驗的證照。</p>}
          {queue.credentials.map((x) => (
            <div key={x.id} className="ed-card" style={{ marginBottom: 12 }}>
              <b><Icon name="medal" size={16} /> {x.issuer} {x.level}</b>
              <p className="fine" style={{ margin: "4px 0 0" }}>{x.coachName}（{x.coachSlug}）・{when(x.createdAt)} 上傳</p>
              <div className="btnrow" style={{ marginTop: 10 }}>
                {x.fileUrl
                  ? <a className="btn btn-secondary" href={x.fileUrl} target="_blank" rel="noopener noreferrer">{x.isPdf ? "開啟 PDF" : "看證照照片"}</a>
                  : <span className="text-muted">沒有附檔</span>}
                <button className="btn btn-primary" disabled={busy === x.id} onClick={() => act(x.id, () => reviewCredentialAction(x.id, true), "已標記為已查驗")}>已查驗</button>
                <button className="btn btn-ghost" disabled={busy === x.id} onClick={() => act(x.id, () => reviewCredentialAction(x.id, false), "已標記為未通過")}>未通過</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
