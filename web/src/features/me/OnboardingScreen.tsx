"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { LevelPicker } from "@/components/pk/LevelPicker";
import { PkMark } from "@/components/pk/Logo";
import { DISTRICTS } from "@pikyoo/core/data/courts";
import { useDemo } from "@/lib/demo-store";
import { useAccount } from "@/lib/use-account";
import { useToast } from "@/components/pk/Toast";
import type { Level } from "@pikyoo/core/types";

const STEPS = ["暱稱", "程度", "常打區域"];

/** F1-3 首次登入設定: 暱稱（帶入 LINE 暱稱）→ 程度（自評或「我是新手」）→ 常打區域. Every step can be skipped. */
export function OnboardingScreen() {
  const router = useRouter();
  const { profile } = useDemo();
  const account = useAccount();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name);
  const [level, setLevel] = useState<Level>(profile.level);
  const [areas, setAreas] = useState<string[]>(profile.areas);

  // saved on every step, so leaving midway (e.g. to 程度自評) keeps what was filled in
  const save = () => account.saveProfile({ name: name.trim() || profile.name, level, areas });
  const finish = () => save().then(() => router.push("/"), (e: Error) => toast(e.message));
  const next = () => (step < STEPS.length - 1 ? save().then(() => setStep(step + 1), (e: Error) => toast(e.message)) : finish());

  return (
    <>
      <div className="onb-top">
        {step > 0 ? (
          <button className="btn btn-ghost btn-icon" aria-label="上一步" onClick={() => setStep(step - 1)}><Icon name="left" size={24} /></button>
        ) : (
          <span className="appbar-spacer" />
        )}
        <div className="quiz-progress" style={{ flex: 1 }} role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="設定進度">
          {STEPS.map((s, k) => <i key={s} className={k <= step ? "on" : ""} />)}
        </div>
        <button className="btn btn-ghost" onClick={finish}>略過</button>
      </div>

      <div className="scroll dk dk-narrow dk-float onb">
        <div className="sec" style={{ paddingTop: "var(--space-6)" }}>
          {step === 0 && (
            <>
              <PkMark size={40} />
              <h1 style={{ margin: "var(--space-4) 0 4px" }}>嗨！大家怎麼叫你？</h1>
              <p className="text-muted" style={{ margin: "0 0 var(--space-4)" }}>名單上會顯示這個名字，不會顯示你的 LINE ID。</p>
              <div className="field">
                <label htmlFor="nick">暱稱</label>
                <input id="nick" className="input" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
              </div>
              <p className="fine">已帶入你的 LINE 暱稱，可以改。</p>
            </>
          )}

          {step === 1 && (
            <>
              <h1 style={{ margin: "0 0 4px" }}>你現在打到哪裡？</h1>
              <p className="text-muted" style={{ margin: "0 0 var(--space-4)" }}>用來幫你找程度差不多的局，之後隨時可以改。</p>
              <button className="btn btn-secondary btn-lg btn-block" aria-pressed={level === 0} onClick={() => setLevel(0)} style={level === 0 ? { background: "var(--color-accent)" } : undefined}>
                <Icon name="sprout" size={20} />我是新手
              </button>
              <p className="text-muted" style={{ fontSize: 14, margin: "var(--space-4) 0 var(--space-2)" }}>或選一個程度：</p>
              <LevelPicker value={level} onPick={setLevel} lg />
              <p className="fine">不確定？<Link href="/learn/level-check">做 3 分鐘程度自評</Link></p>
            </>
          )}

          {step === 2 && (
            <>
              <h1 style={{ margin: "0 0 4px" }}>常在哪裡打？</h1>
              <p className="text-muted" style={{ margin: "0 0 var(--space-4)" }}>首頁會先給你看這些區域的局。可以多選。</p>
              <div className="wrapchips">
                {DISTRICTS.map((a) => (
                  <button key={a} className="chip" aria-pressed={areas.includes(a)} onClick={() => setAreas((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]))}>{a}</button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="sticky-cta">
        <div className="sticky-cta-info">
          <span className="sticky-cta-sub">第 {step + 1} 步，共 {STEPS.length} 步</span>
        </div>
        <button className="btn btn-primary btn-lg" onClick={next}>{step < STEPS.length - 1 ? "下一步" : "開始找局"}</button>
      </div>
    </>
  );
}
