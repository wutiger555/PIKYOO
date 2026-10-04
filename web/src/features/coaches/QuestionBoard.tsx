"use client";

import { useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { Sheet } from "@/components/pk/Shell";
import { useToast } from "@/components/pk/Toast";
import { contactHint, findContact } from "@pikyoo/core/contact";
import { QUESTION_STARTERS } from "@pikyoo/core/data/questions";
import { useDemo, usePublicQuestions } from "@/lib/demo-store";
import type { Coach, Question } from "@pikyoo/core/types";
import { realAuth } from "@/lib/env";
import { answerQuestionAction, askQuestionAction } from "@/lib/questions";

const SHOWN = 3;

/** F3-11 問與答 on the coach page: public Q&A in place of "ask on LINE", so the conversation stays in PIKYOO.
 *  `onAsk` opens the AskSheet, which the page renders outside its scroller; without it (console preview) there's no ask button. */
export function QuestionBoard({ coach: c, onAsk }: { coach: Coach; onAsk?: () => void }) {
  const qs = usePublicQuestions(c.id);
  const [all, setAll] = useState(false);
  // newest first: my unanswered ones on top, then replies
  const list = [...qs].reverse().sort((a, b) => Number(!!a.answer) - Number(!!b.answer));
  const replied = qs.filter((q) => q.answer).length;
  return (
    <section className="blk" id="a-qa">
      <div className="blk-h"><h2>問與答</h2>{replied > 0 && <span className="text-muted" style={{ fontSize: 13 }}>{replied} 則回覆</span>}</div>
      {list.length ? (
        <ul className="qa">
          {(all ? list : list.slice(0, SHOWN)).map((q) => <QaItem key={q.id} q={q} coachName={c.name} />)}
        </ul>
      ) : (
        <p className="text-muted">還沒有人發問，上課前想確認的事都可以先問 {c.name}。</p>
      )}
      {!all && list.length > SHOWN && <button className="linkbtn qa-more" onClick={() => setAll(true)}>看全部 {list.length} 則</button>}
      {onAsk && (
        <button className="btn btn-secondary btn-block" style={{ marginTop: 12 }} onClick={onAsk}>
          <Icon name="msg" size={18} />問 {c.name} 問題
        </button>
      )}
      <p className="fine">問題和教練的回覆會公開在這一頁，其他學生也看得到。</p>
    </section>
  );
}

function QaItem({ q, coachName }: { q: Question; coachName: string }) {
  return (
    <li className="qa-item">
      <div className="qa-row">
        <span className="qa-mark" aria-label="問">問</span>
        <div>
          <p>{q.text}</p>
          <small>{[q.mine ? "你" : q.name, q.level, q.askedAt].filter(Boolean).join("・")}</small>
        </div>
      </div>
      {q.answer ? (
        <div className="qa-row qa-a">
          <span className="qa-mark" aria-label="答">答</span>
          <div>
            <p>{q.answer.text}</p>
            <small>{coachName}・{q.answer.at}</small>
          </div>
        </div>
      ) : (
        <div className="qa-wait"><Icon name="clock" size={14} />等 {coachName} 回覆，回覆後會通知你。只有你看得到這則。</div>
      )}
    </li>
  );
}

export function AskSheet({ coach: c, onClose, onSent }: { coach: Coach; onClose: () => void; onSent?: () => void }) {
  const { askQuestion } = useDemo();
  const toast = useToast();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const hit = findContact(text);
  const ok = text.trim().length >= 4 && !hit && !busy;
  const send = async () => {
    if (realAuth) {
      setBusy(true);
      const r = await askQuestionAction(c.id, text.trim());
      setBusy(false);
      if (r.error) return toast(r.error);
    }
    askQuestion(c.id, text.trim());
    toast(`已送出，${c.name} 回覆後會通知你`);
    onClose();
    onSent?.();
  };
  return (
    <Sheet onClose={onClose}>
      <h2>問 {c.name} 問題</h2>
      <div className="chips qa-starters">
        {QUESTION_STARTERS.map((s) => <button key={s} className="chip" onClick={() => setText(s)}>{s}</button>)}
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label htmlFor="qa-text">你的問題</label>
        <textarea id="qa-text" className="input" rows={4} value={text} onChange={(e) => setText(e.target.value)} aria-invalid={!!hit} aria-describedby="qa-help"
          placeholder="例：我打過羽球，第一堂適合上體驗課還是一對一？" />
        {hit ? <p className="field-err" id="qa-help">{contactHint(hit)}</p> : <p className="fine" id="qa-help" style={{ marginTop: 6 }}>會公開顯示在教練頁。{c.profile.reply}。</p>}
      </div>
      <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 12 }} disabled={!ok} onClick={send}>送出問題</button>
    </Sheet>
  );
}

/** Coach console: reply to a question; the reply goes public on the coach page. */
export function AnswerCard({ q }: { q: Question }) {
  const { answerQuestion } = useDemo();
  const toast = useToast();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const hit = findContact(text);
  const ok = text.trim().length >= 2 && !hit && !busy;
  const reply = async () => {
    if (realAuth) {
      setBusy(true);
      const r = await answerQuestionAction(q.id, text.trim());
      setBusy(false);
      if (r.error) return toast(r.error);
    }
    answerQuestion(q.id, text.trim());
    toast(`已回覆，會公開在你的教練頁${realAuth ? "" : `並通知 ${q.name}`}`);
  };
  return (
    <article className="req">
      <div className="req-top">
        <span className="avatar">{q.name.slice(0, 1)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>{q.name}</b>
          <div className="text-muted" style={{ fontSize: 13 }}>{[q.level, q.askedAt].filter(Boolean).join("・")}</div>
        </div>
      </div>
      <p className="req-note">「{q.text}」</p>
      <textarea className="input" rows={3} style={{ marginTop: 10 }} value={text} onChange={(e) => setText(e.target.value)} aria-label={`回覆 ${q.name}`} aria-invalid={!!hit}
        placeholder="回覆會公開在你的教練頁" />
      {hit && <p className="field-err">{contactHint(hit)}</p>}
      <div className="btnrow btnrow-tight" style={{ marginTop: 10 }}>
        <button className="btn btn-primary" disabled={!ok} onClick={reply}>公開回覆</button>
      </div>
    </article>
  );
}
