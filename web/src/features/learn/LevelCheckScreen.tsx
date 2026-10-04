"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LevelChip } from "@/components/pk/Badges";
import { Crumbs } from "@/components/pk/Crumbs";
import { AppBar } from "@/components/pk/Shell";
import { TopNav } from "@/components/pk/TopNav";
import { GameTicket } from "@/components/pk/Ticket";
import { useToast } from "@/components/pk/Toast";
import { useAllGames, useCoaches, useDemo } from "@/lib/demo-store";
import { useAccount } from "@/lib/use-account";
import { LEVELS } from "@pikyoo/core/format";
import type { Level } from "@pikyoo/core/types";
import { CoachCard } from "../coaches/CoachCard";

// F3-2 程度自評. Each answer scores 0–3; the total maps onto the 7-step ladder (新手 … 3.5).
// Self-assessment only suggests a starting point — DUPR stays the real rating (PRD F11).
const QUESTIONS: { q: string; a: string[] }[] = [
  { q: "你打過匹克球幾次？", a: ["還沒打過", "1–3 次", "每個月會打幾次", "每週都打"] },
  { q: "有其他球拍運動的經驗嗎？", a: ["沒有", "羽球、桌球偶爾玩", "網球、羽球或桌球有練過"] },
  { q: "發球的狀況？", a: ["還沒試過", "偶爾發得進", "大多發得進", "可以控制深淺和落點"] },
  { q: "來回對打可以連續幾拍？", a: ["還接不太到", "大約 5 拍", "10 拍以上", "可以穩定在網前小球（dink）來回"] },
  { q: "規則熟嗎？", a: ["還不太懂", "知道雙彈跳和廚房區", "會自己報分、當裁判"] },
  { q: "比賽經驗？", a: ["沒比過", "跟朋友打過", "固定參加揪團", "參加過積分賽或比賽"] },
];

const toLevel = (score: number): Level => (score <= 3 ? 0 : score <= 7 ? 1 : score <= 10 ? 2 : score <= 13 ? 3 : 4);

const ADVICE: Record<number, string> = {
  0: "從體驗課開始最快：教練會先帶握拍、發球和規則，一堂課就能上場對打。",
  1: "已經能打了！上一兩堂小班課把發球和第三拍練穩，新手友善局會打得更開心。",
  2: "可以固定參加 2.0–3.0 的局了。想進步，找教練練網前小球和站位。",
  3: "3.0 左右的局都很適合你。可以開始挑戰積分賽，或找教練練比賽策略。",
  4: "程度不錯！3.5 以上的局可以直接報。想確認實力，可以打 DUPR 積分賽。",
};

export function LevelCheckScreen() {
  const router = useRouter();
  const toast = useToast();
  const { profile } = useDemo();
  const account = useAccount();
  const games = useAllGames();
  const allCoaches = useCoaches();
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUESTIONS.map(() => null));
  const [i, setI] = useState(0);
  const done = i >= QUESTIONS.length;

  if (done) {
    const lv = toLevel(answers.reduce<number>((s, a) => s + (a ?? 0), 0));
    const fit = games.filter((g) => lv >= g.levelMin && lv <= g.levelMax).slice(0, 2);
    const coaches = allCoaches.filter((c) => lv >= c.levelMin && lv <= c.levelMax).slice(0, 2);
    return (
      <>
        <AppBar title="程度自評" back="/learn" />
        <div className="scroll dk dk-narrow" style={{ paddingBottom: "var(--space-6)" }}>
          <TopNav active="learn" />
          <Crumbs items={[["首頁", "/"], ["第一次打", "/learn"], ["程度自評"]]} />
          <div className="home-hero carbon" style={{ marginTop: "var(--space-3)", textAlign: "center" }}>
            <span className="en">Your level</span>
            <div style={{ display: "flex", justifyContent: "center", margin: "var(--space-3) 0" }}>
              <LevelChip min={lv} lg />
            </div>
            <h1 style={{ margin: 0, fontSize: 26 }}>{lv === 0 ? "你是新手，剛剛好" : `建議從 ${LEVELS[lv]} 開始`}</h1>
            <p style={{ margin: "var(--space-2) auto 0", color: "var(--color-on-carbon-muted)", maxWidth: "30ch" }}>{ADVICE[lv]}</p>
          </div>
          <div className="pad" style={{ marginTop: "var(--space-4)" }}>
            <button className="btn btn-primary btn-lg btn-block" onClick={() => account.saveProfile({ ...profile, level: lv }).then(() => { toast("已存到你的檔案"); router.push("/me"); }, (e: Error) => toast(e.message))}>存到我的檔案</button>
            <button className="btn btn-ghost btn-block" style={{ marginTop: "var(--space-2)" }} onClick={() => { setAnswers(QUESTIONS.map(() => null)); setI(0); }}>重新作答</button>
          </div>
          {lv <= 1 && coaches.length > 0 && (
            <div className="sec">
              <div className="sec-head"><h2><span className="en">Lessons</span>適合你的課</h2><Link href="/coaches">看全部</Link></div>
              <div className="stack">{coaches.map((c) => <CoachCard key={c.id} coach={c} />)}</div>
            </div>
          )}
          {fit.length > 0 && (
            <div className="sec">
              <div className="sec-head"><h2><span className="en">Games</span>你可以打的局</h2><Link href="/games">看全部</Link></div>
              <div className="stack">{fit.map((g) => <GameTicket key={g.id} game={g} />)}</div>
            </div>
          )}
          <p className="fine pad" style={{ marginTop: "var(--space-6)" }}>自評只是起點，團主會看到你的程度。有 DUPR 分數的話，可以在「我的」填上。</p>
        </div>
      </>
    );
  }

  const q = QUESTIONS[i];
  return (
    <>
      <AppBar title="程度自評" back="/learn" />
      <div className="scroll dk dk-narrow dk-float">
        <TopNav active="learn" />
        <Crumbs items={[["首頁", "/"], ["第一次打", "/learn"], ["程度自評"]]} />
        <div className="sec" style={{ paddingTop: "var(--space-4)" }}>
          <div className="quiz-progress" role="progressbar" aria-valuemin={1} aria-valuemax={QUESTIONS.length} aria-valuenow={i + 1} aria-label="作答進度">
            {QUESTIONS.map((_, k) => <i key={k} className={k <= i ? "on" : ""} />)}
          </div>
          <span className="en" style={{ marginTop: "var(--space-4)" }}>Question {i + 1} / {QUESTIONS.length}</span>
          <h2 style={{ margin: "0 0 var(--space-4)" }}>{q.q}</h2>
          <div className="quiz-opts" role="radiogroup" aria-label={q.q}>
            {q.a.map((a, k) => (
              <label key={a} className="quiz-opt">
                <input
                  type="radio"
                  name={`q${i}`}
                  checked={answers[i] === k}
                  onChange={() => {
                    setAnswers((p) => p.map((x, j) => (j === i ? k : x)));
                    setTimeout(() => setI((n) => n + 1), 180);
                  }}
                />
                <span className="dot" aria-hidden="true" />
                {a}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="sticky-cta">
        <div className="sticky-cta-info">
          <span className="sticky-cta-sub">選好會自動到下一題</span>
        </div>
        <button className="btn btn-secondary" disabled={i === 0} onClick={() => setI((n) => n - 1)}>上一題</button>
      </div>
    </>
  );
}
