"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginSheet } from "@/components/pk/LoginSheet";
import { useToast } from "@/components/pk/Toast";
import { applyCoachAction, saveCoachAction, submitCoachAction } from "@/lib/coach";
import { useCatalog, useDemo } from "@/lib/demo-store";
import { realAuth } from "@/lib/env";

// 教練後台 with real sign-in (B4): sign in → 申請成為教練 (draft) → edit and 儲存 → 送出審核 → PIKYOO approves.
// The demo skips all of this and edits Mia's page in memory.

/** Stands in for the console page until the visitor is signed in and has a coach page. */
export function CoachGate({ children }: { children: React.ReactNode }) {
  const { signedIn } = useDemo();
  const { myCoach } = useCatalog();
  const [login, setLogin] = useState(false);
  if (!realAuth || (signedIn && myCoach)) return <>{children}</>;
  if (!signedIn) {
    return (
      <div className="ed-card" style={{ margin: "var(--space-4)" }}>
        <h2>教練後台</h2>
        <p className="text-muted">登入後就能建立你的教練頁，學生可以直接看方案、預約上課。</p>
        <button className="btn btn-primary btn-lg btn-block" onClick={() => setLogin(true)}>用 LINE 登入</button>
        {login && <LoginSheet reason="登入後就能建立教練頁" onClose={() => setLogin(false)} />}
      </div>
    );
  }
  return <ApplyCoach />;
}

/** 申請成為教練: the public link and name; everything else is filled in the editor before review. */
function ApplyCoach() {
  const { profile } = useDemo();
  const toast = useToast();
  const [name, setName] = useState(profile.name);
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const ok = /^[a-z0-9-]{2,30}$/.test(slug) && name.trim().length > 0;
  const apply = async () => {
    setBusy(true);
    const r = await applyCoachAction(slug, name);
    if (r.error) {
      toast(r.error);
      setBusy(false);
    } else location.reload(); // the console's state starts from the new page
  };
  return (
    <div className="ed-card" style={{ margin: "var(--space-4)" }}>
      <h2>申請成為教練</h2>
      <p className="text-muted">先建立教練頁草稿，填好照片、證照和課程方案後送出審核。PIKYOO 確認證照後就會公開。</p>
      <div className="field">
        <label htmlFor="coach-name">教練名稱</label>
        <input id="coach-name" className="input" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="coach-slug">專屬連結</label>
        <input id="coach-slug" className="input" value={slug} maxLength={30} placeholder="例如 mia-lin" autoCapitalize="off"
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
        <p className="fine">pikyoo.tw/c/{slug || "你的名字"}・小寫英文、數字和 -，之後不能改</p>
      </div>
      <button className="btn btn-primary btn-lg btn-block" disabled={!ok || busy} onClick={apply}>{busy ? "建立中…" : "建立教練頁草稿"}</button>
    </div>
  );
}

const STATUS: Record<string, [string, string]> = {
  draft: ["草稿", "還沒公開。填好後送出審核"],
  pending: ["審核中", "PIKYOO 正在確認你的證照，通常 1–2 個工作天"],
  approved: ["已公開", "學生看得到你的頁面，修改儲存後馬上更新"],
  suspended: ["暫停中", "頁面暫時不公開，請聯絡 PIKYOO"],
};

/** 儲存 / 送出審核 for the editor screens. The demo saves nothing (edits apply as you type), so it renders nothing. */
export function CoachSaveBar() {
  const { myCoach: c } = useDemo();
  const { myCoach: mine } = useCatalog();
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(() => JSON.stringify(mine?.coach ?? null));
  const [busy, setBusy] = useState(false);
  if (!realAuth || !mine) return null;
  const dirty = JSON.stringify(c) !== saved;
  const [label, hint] = STATUS[mine.status] ?? [mine.status, ""];
  const act = async (f: () => Promise<{ error?: string }>, done: string) => {
    setBusy(true);
    const r = await f();
    setBusy(false);
    if (r.error) return toast(r.error);
    toast(done);
    router.refresh();
  };
  return (
    <div className="ed-card" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 180 }}>
        <b>{label}</b>
        <div className="fine" style={{ margin: 0 }}>{dirty ? "有還沒儲存的修改" : hint}</div>
      </div>
      <button className="btn btn-primary" disabled={!dirty || busy} onClick={() => act(async () => {
        const r = await saveCoachAction(mine.id, c);
        if (!r.error) setSaved(JSON.stringify(c));
        return r;
      }, "已儲存")}>儲存</button>
      {mine.status === "draft" && (
        <button className="btn btn-secondary" disabled={dirty || busy} title={dirty ? "先儲存再送出" : undefined}
          onClick={() => act(() => submitCoachAction(mine.id), "已送出審核")}>送出審核</button>
      )}
    </div>
  );
}
