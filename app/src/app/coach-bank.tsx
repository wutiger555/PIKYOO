import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { BANKS, bankCode, bankLabel } from "@pikyoo/core/twqr";
import { useSession } from "@/data/session";
import { Btn } from "@/ui/Btn";
import { Field, PickerRow } from "@/ui/form";
import { color, radius } from "@/ui/theme";
import { toast } from "@/ui/Toast";

const OPTIONS = BANKS.map(([c, n]) => `${c} ${n}`);

/** 收款帳戶 (website: PayoutSettingsSheet's bank fields): the account students transfer to; their payment page turns it
 *  into a TWQR code (docs/PAYMENTS.md §1.5). Picking the bank from a list keeps the 3-digit code right. */
export default function CoachBank() {
  const { payout, setPayout } = useSession();
  const [p, setP] = useState(payout);
  const code = bankCode(p.bank);
  const ok = !!code && /^\d{6,16}$/.test(p.account.replace(/\D/g, "")) && !!p.name.trim();
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <View style={{ backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, padding: 16, gap: 14 }}>
        <PickerRow label="銀行" values={code ? [OPTIONS.find((o) => o.startsWith(code)) ?? ""] : []} options={OPTIONS} onChange={([o]) => setP({ ...p, bank: bankLabel(o.slice(0, 3)) })} />
        <Field label="帳號" value={p.account} onChange={(account) => setP({ ...p, account: account.replace(/[^\d ]/g, "") })} keyboard="number-pad" />
        <Field label="戶名" value={p.name} onChange={(name) => setP({ ...p, name })} hint="學生轉帳時會看到，可以只露出部分（例：林＊亞）" />
      </View>
      <Text style={{ fontSize: 13, color: color.muted, lineHeight: 20 }}>學生付款頁會用這個帳號產生轉帳 QR code，用任何銀行 App 掃描就帶入帳號和金額，錢直接進你的帳戶，PIKYOO 不經手。</Text>
      <Btn kind="primary" label="儲存" disabled={!ok} onPress={() => { setPayout({ ...p, name: p.name.trim() }); toast("已儲存收款帳戶"); router.back(); }} />
    </ScrollView>
  );
}
