"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Icon } from "@/components/pk/Icon";
import { useToast } from "@/components/pk/Toast";
import { money } from "@pikyoo/core/format";
import { twqrTransfer } from "@pikyoo/core/twqr";

/** 銀行轉帳 in two steps (docs/PAYMENTS.md §1.5): ① transfer — scan the TWQR code with any bank app (on a phone: save it,
 *  then 從相簿掃描), or by hand with copy buttons; ② report the last five digits. Money goes straight to the coach. */
export function TransferPay({ bank, account, name, amount, busy, onReport }: {
  bank: string; account: string; name: string; amount: number; busy?: boolean; onReport: (last5: string) => void;
}) {
  const toast = useToast();
  const [last5, setLast5] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const code = twqrTransfer({ bank, account, amount });
  useEffect(() => {
    if (code) QRCode.toDataURL(code, { width: 480, margin: 1, errorCorrectionLevel: "M" }).then(setQr, () => setQr(null));
  }, [code]);
  const copy = (text: string, msg: string) => navigator.clipboard.writeText(text).then(() => toast(msg), () => toast(text));
  const save = async () => {
    if (!qr) return;
    const file = new File([await (await fetch(qr)).blob()], "PIKYOO-轉帳QR.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file] }); } catch { /* closed the share sheet */ }
      return;
    }
    const a = document.createElement("a");
    a.href = qr;
    a.download = file.name;
    a.click();
    toast("已存下 QR，到銀行 App 從相簿掃描");
  };

  return (
    <ol className="pay-steps">
      <li>
        <b>{qr ? "用銀行 App 掃碼轉帳" : "轉帳到教練的帳戶"}</b>
        {qr && <>
          <div className="pay-qr">
            {/* eslint-disable-next-line @next/next/no-img-element -- a data URL made on the page */}
            <img src={qr} alt={`轉帳 QR code：${bank} ${account}，${money(amount)}`} width={200} height={200} />
            {/* on a phone the student can't scan their own screen: save, then 從相簿掃描 (.touch-only / .fine-only) */}
            <p><span className="touch-only">按下面存到相簿，打開你的銀行 App →「掃描」→ 從相簿選這張，帳號和金額會自動帶入。</span>
              <span className="fine-only">打開手機的銀行 App →「掃描」，對準這個 QR，帳號和金額會自動帶入。</span>
              <small>台灣Pay 共通 QR，多數銀行與全支付、街口等都能掃。有些銀行只帶入帳號，金額請輸入 <b className="num">{amount}</b>。</small>
            </p>
          </div>
          <button className="btn btn-primary btn-lg btn-block touch-only" onClick={save}><Icon name="image" size={18} />存 QR 到相簿</button>
          <span className="pay-alt">不能掃？手動轉帳</span>
        </>}
        <dl className="bank">
          <dt>銀行</dt><dd>{bank}</dd>
          <dt>帳號</dt><dd className="num">{account} <button className="copy" onClick={() => copy(account.replace(/\D/g, ""), "已複製帳號")}><Icon name="copy" size={15} />複製</button></dd>
          <dt>戶名</dt><dd>{name}</dd>
          <dt>金額</dt><dd className="num">{money(amount)} <button className="copy" onClick={() => copy(String(amount), "已複製金額")}><Icon name="copy" size={15} />複製</button></dd>
        </dl>
      </li>
      <li>
        <b>轉好了，回報給教練</b>
        <div className="field">
          <label htmlFor="last5">你的轉出帳號末五碼</label>
          <input id="last5" className="input num" inputMode="numeric" maxLength={5} value={last5} onChange={(e) => setLast5(e.target.value.replace(/\D/g, ""))} />
        </div>
        <button className="btn btn-primary btn-lg btn-block" disabled={last5.length !== 5 || busy} onClick={() => onReport(last5)}>我已轉帳</button>
      </li>
    </ol>
  );
}
