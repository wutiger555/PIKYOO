"use client";

import { useDemo } from "@/lib/demo-store";
import { Icon } from "./Icon";
import { Sheet, SoonButton } from "./Shell";
import { useToast } from "./Toast";

const UNLOCKS = ["教練的可約時段，直接預約", "學生評價與問與答", "經歷、證照與授課地點", "揪朋友一起上課"];

/** Sign-in prompt for visitors (F1-1). LINE login signs up on first use; the demo just flips `signedIn`. */
export function LoginSheet({ onClose, reason = "登入後可以看完整的教練頁" }: { onClose: () => void; reason?: string }) {
  const { setSignedIn } = useDemo();
  const toast = useToast();
  return (
    <Sheet onClose={onClose} className="login-sheet">
      <h2>登入 PIKYOO</h2>
      <p className="text-muted" style={{ margin: "0 0 12px" }}>{reason}，還能：</p>
      <ul className="fit">
        {UNLOCKS.map((u) => <li key={u}><Icon name="check" size={16} stroke={2.2} />{u}</li>)}
      </ul>
      <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: 16 }} onClick={() => { setSignedIn(true); toast("已用 LINE 登入（Demo）"); onClose(); }}>
        <Icon name="msg" size={18} />用 LINE 登入／註冊
      </button>
      <SoonButton className="btn btn-ghost btn-block" style={{ marginTop: 8 }} msg="Email 登入（P1，下一輪）">用 Email 登入</SoonButton>
      <p className="fine" style={{ textAlign: "center" }}>第一次用 LINE 登入就會自動建立帳號，免費、不用填表。</p>
    </Sheet>
  );
}
