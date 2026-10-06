import { router } from "expo-router";
import { Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { money } from "@pikyoo/core/format";
import { twqrTransfer } from "@pikyoo/core/twqr";
import { useSession } from "@/data/session";
import { Btn } from "./Btn";
import { Sheet } from "./Sheet";
import { color, radius } from "./theme";

/** 現場收款 (website: CollectQRSheet, docs/PAYMENTS.md §1.5): on court the coach shows the transfer QR for one student's
 *  amount, the student scans it with any bank app, and the money goes straight to the coach's account. */
export function CollectQRSheet({ who, amount, onReceived, onClose }: { who: string; amount: number; onReceived: () => void; onClose: () => void }) {
  const { payout } = useSession();
  const code = twqrTransfer({ ...payout, amount });
  return (
    <Sheet title={`${who}・${money(amount)}`} onClose={onClose}>
      {code ? (
        <>
          <Text style={{ fontSize: 15, color: color.n700, lineHeight: 22 }}>請學生打開銀行 App →「掃描」，帳號和金額會自動帶入，錢直接進你的帳戶。</Text>
          <View style={{ alignSelf: "center", backgroundColor: "#fff", padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line }}>
            <QRCode value={code} size={240} ecl="M" />
          </View>
          <Text style={{ fontSize: 13, color: color.muted, textAlign: "center" }}>{payout.bank}・{payout.account}・{payout.name}</Text>
          <Btn kind="primary" label={`已收到 ${money(amount)}`} onPress={onReceived} />
        </>
      ) : (
        <>
          <Text style={{ fontSize: 15, color: color.n700, lineHeight: 22 }}>先填好收款銀行帳戶，這裡就會出現學生可以掃的轉帳 QR。</Text>
          <Btn kind="primary" label="填銀行帳戶" onPress={() => { onClose(); router.push("/coach-bank"); }} />
        </>
      )}
    </Sheet>
  );
}
