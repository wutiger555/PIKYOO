"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Sheet } from "@/components/pk/Shell";
import { money } from "@pikyoo/core/format";
import { twqrTransfer } from "@pikyoo/core/twqr";

/** 現場收款 (docs/PAYMENTS.md §1.5): on court, the coach shows the transfer QR for one student's amount; the student scans
 *  it with any bank app and the money goes straight to the coach's account. 已收到 then closes it out. */
export function CollectQRSheet({ who, amount, bank, onReceived, onSetup, onClose }: {
  who: string; amount: number; bank?: { bank: string; account: string; name: string }; onReceived: () => void; onSetup: () => void; onClose: () => void;
}) {
  const code = bank ? twqrTransfer({ ...bank, amount }) : null;
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => {
    if (code) QRCode.toDataURL(code, { width: 640, margin: 1, errorCorrectionLevel: "M" }).then(setQr, () => setQr(null));
  }, [code]);
  return (
    <Sheet className="sheet-coach" onClose={onClose}>
      <h2>{who}・{money(amount)}</h2>
      {code ? (
        <>
          <p className="text-muted" style={{ fontSize: 14, margin: "0 0 12px" }}>請學生打開銀行 App →「掃描」，帳號和金額會自動帶入，錢直接進你的帳戶。</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- a data URL made on the page */}
          {qr && <img className="collect-qr" src={qr} alt={`轉帳 QR code：${bank!.bank}，${money(amount)}`} width={280} height={280} />}
          <p className="fine" style={{ textAlign: "center" }}>{bank!.bank}・{bank!.account}・{bank!.name}</p>
          <button className="btn btn-primary btn-lg btn-block" onClick={onReceived}>已收到 {money(amount)}</button>
        </>
      ) : (
        <>
          <p className="text-muted" style={{ fontSize: 14 }}>先在收款設定填好銀行帳戶，這裡就會出現學生可以掃的轉帳 QR。</p>
          <button className="btn btn-primary btn-lg btn-block" onClick={onSetup}>填銀行帳戶</button>
        </>
      )}
    </Sheet>
  );
}
