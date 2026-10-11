import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { PAYOUT_METHODS, RECEIVED_BEFORE } from "@pikyoo/core/data/coaches";
import { money } from "@pikyoo/core/format";
import type { PaymentRow } from "@pikyoo/core/types";
import { useSession } from "@/data/session";
import { Num, Tag } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { SwitchRow } from "@/ui/form";
import { CollectQRSheet } from "@/ui/CollectQR";
import { Avatar, c, ConsolePage } from "@/ui/console";
import { Icon } from "@/ui/Icon";
import { Sheet } from "@/ui/Sheet";
import { Status } from "@/ui/Status";
import { color, photo, radius } from "@/ui/theme";
import { toast } from "@/ui/Toast";

const PAY_LABEL: Record<PaymentRow["status"], [string, "almost" | "info" | "open"]> = { wait: ["待付款", "almost"], reported: ["學生已回報", "info"], paid: ["已收款", "open"] };

/** 收款對帳 (website: CoachPaymentsScreen): received vs due, filter by state, check each report against its 對帳截圖 or
 *  last five digits, and confirm several reports at once. */
export default function CoachPayments() {
  const { payments, markPaid, rejectReport, remindPayment } = useSession();
  const [collect, setCollect] = useState<PaymentRow | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const reported = payments.filter((p) => p.status === "reported");
  const pickedRows = reported.filter((p) => picked.includes(p.id));
  const togglePick = (id: string) => setPicked((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id]));
  const confirmPicked = () => {
    pickedRows.forEach((p) => markPaid(p.id));
    toast(`已確認收到 ${pickedRows.length} 筆`, "學生都會收到通知");
    setPicked([]);
  };
  const [filter, setFilter] = useState<"all" | PaymentRow["status"]>("all");
  const [settings, setSettings] = useState(false);
  const list = payments.filter((p) => filter === "all" || p.status === filter);
  const got = payments.filter((p) => p.status === "paid").reduce((a, p) => a + p.amount, 0) + RECEIVED_BEFORE;
  const due = payments.filter((p) => p.status !== "paid").reduce((a, p) => a + p.amount, 0);
  const cnt = (k: PaymentRow["status"]) => payments.filter((p) => p.status === k).length;
  const opts: [typeof filter, string][] = [["all", "全部"], ["reported", `已回報 ${cnt("reported")}`], ["wait", `待付款 ${cnt("wait")}`], ["paid", "已收"]];

  return (
    <ConsolePage title="收款" action={<Pressable onPress={() => setSettings(true)} accessibilityLabel="收款設定" hitSlop={8}><Icon name="settings" size={22} /></Pressable>}>
      <View style={{ backgroundColor: color.carbon, borderRadius: radius.lg, padding: 18, gap: 10 }}>
        <Text style={{ color: color.onCarbonMuted, fontSize: 13 }}>{new Date().getMonth() + 1} 月</Text>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1 }}><Text style={{ color: color.onCarbonMuted, fontSize: 13 }}>已收</Text><Num style={{ color: "#fff", fontSize: 28 }}>{money(got)}</Num></View>
          <View style={{ flex: 1 }}><Text style={{ color: color.onCarbonMuted, fontSize: 13 }}>待收</Text><Num style={{ color: color.accent, fontSize: 28 }}>{money(due)}</Num></View>
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,.14)", overflow: "hidden" }}>
          <View style={{ height: 6, width: `${got + due ? Math.round((got / (got + due)) * 100) : 0}%`, backgroundColor: color.accent }} />
        </View>
      </View>

      <View style={{ flexDirection: "row", backgroundColor: color.n100, borderRadius: 999, padding: 4 }}>
        {opts.map(([k, l]) => (
          <Pressable key={k} onPress={() => setFilter(k)} style={[{ flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 999 }, filter === k && { backgroundColor: color.surface }]}>
            <Text style={{ fontWeight: "700", fontSize: 13 }}>{l}</Text>
          </Pressable>
        ))}
      </View>

      {reported.length > 1 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: color.accentSoft, borderRadius: radius.md, padding: 12 }}>
          {pickedRows.length ? (
            <>
              <Text style={{ flex: 1, fontSize: 14 }}>已選 <Num style={{ fontSize: 16 }}>{pickedRows.length}</Num> 筆・<Num style={{ fontSize: 16 }}>{money(pickedRows.reduce((a, p) => a + p.amount, 0))}</Num></Text>
              <Pressable onPress={() => setPicked([])} hitSlop={8}><Text style={{ fontSize: 14, fontWeight: "700", textDecorationLine: "underline" }}>取消</Text></Pressable>
              <Btn kind="primary" label={`確認收到 ${pickedRows.length} 筆`} lg={false} style={{ borderRadius: 999 }} onPress={confirmPicked} />
            </>
          ) : (
            <>
              <Text style={{ flex: 1, fontSize: 13, color: color.n700 }}>{reported.length} 筆學生已回報，對過銀行入帳後可以一次確認</Text>
              <Btn label="全選已回報" lg={false} style={{ borderRadius: 999 }} onPress={() => setPicked(reported.map((p) => p.id))} />
            </>
          )}
        </View>
      )}

      {list.map((p) => (
        <View key={p.id} style={[c.card, p.id === "nmine" && { borderColor: color.accent700, borderWidth: 1.5 }, picked.includes(p.id) && { borderColor: color.text, borderWidth: 1.5 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {p.status === "reported" && (
              <Pressable onPress={() => togglePick(p.id)} hitSlop={10} accessibilityRole="checkbox" accessibilityState={{ checked: picked.includes(p.id) }} accessibilityLabel={`選取 ${p.name}`}
                style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: color.text, alignItems: "center", justifyContent: "center", backgroundColor: picked.includes(p.id) ? color.text : color.surface }}>
                {picked.includes(p.id) && <Icon name="check" size={13} tint="#fff" />}
              </Pressable>
            )}
            <Avatar t={p.initial} />
            <View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "800" }}>{p.name}</Text><Text style={{ fontSize: 13, color: color.muted }}>{p.what}</Text></View>
            <View style={{ alignItems: "flex-end", gap: 4 }}><Num style={{ fontSize: 21 }}>{money(p.amount)}</Num><Status tone={PAY_LABEL[p.status][1]}>{PAY_LABEL[p.status][0]}</Status></View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Tag>{p.via}</Tag>
            <Text style={{ fontSize: 13, color: color.muted }}>{p.status === "reported" ? (p.ref ? <>末五碼 <Num style={{ fontSize: 15 }}>{p.ref}</Num>・{p.at}</> : p.at) : p.status === "paid" ? `${p.at} 入帳` : p.at}</Text>
          </View>
          {p.status === "reported" && p.proof && (
            <Pressable onPress={() => setViewing(p.proof!)} style={{ flexDirection: "row", alignItems: "center", gap: 10 }} accessibilityLabel={`看 ${p.name} 的轉帳截圖`}>
              <Image source={{ uri: photo(p.proof) }} style={{ width: 44, height: 72, borderRadius: 6, borderWidth: 1, borderColor: color.line }} contentFit="cover" />
              <Text style={{ fontSize: 14, fontWeight: "700", textDecorationLine: "underline" }}>轉帳截圖（點開看）</Text>
            </Pressable>
          )}
          {p.status === "reported" && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Btn label="還沒收到" lg={false} style={{ flex: 1, borderRadius: 999 }} onPress={() => { rejectReport(p.id); toast("已請學生重新確認", `${p.name} 會收到通知`); }} />
              <Btn kind="primary" label="確認收到" lg={false} style={{ flex: 1, borderRadius: 999 }} onPress={() => { markPaid(p.id); toast("已確認收款", "學生會收到通知"); }} />
            </View>
          )}
          {p.status === "wait" && (
            <>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Btn kind="primary" label="現場收款 QR" icon="qr" lg={false} style={{ flex: 1, borderRadius: 999 }} onPress={() => setCollect(p)} />
                <Btn label="LINE 提醒" icon="bell" lg={false} style={{ flex: 1, borderRadius: 999 }} onPress={() => { remindPayment(p.id); toast(`已用 LINE 提醒 ${p.name} 付款`, "點開就是付款頁"); }} />
              </View>
              <Pressable onPress={() => { markPaid(p.id); toast("已記錄收款"); }} hitSlop={6}><Text style={{ fontSize: 13, fontWeight: "700", textDecorationLine: "underline" }}>已收到（例如現場收現金）</Text></Pressable>
            </>
          )}
        </View>
      ))}
      {!list.length && <Text style={c.hint}>這個分類沒有款項。</Text>}
      <Text style={c.hint}>錢直接進你自己的帳戶，PIKYOO 幫你把付款資訊給學生、記錄對帳。</Text>
      {settings && <PayoutSheet onClose={() => setSettings(false)} />}
      {viewing && (
        <Modal visible animationType="fade" onRequestClose={() => setViewing(null)}>
          <Pressable onPress={() => setViewing(null)} style={{ flex: 1, backgroundColor: "#000" }} accessibilityLabel="關閉截圖">
            <Image source={{ uri: photo(viewing) }} style={{ flex: 1, margin: 16, marginTop: 60 }} contentFit="contain" />
            <Text style={{ color: "#fff", textAlign: "center", fontSize: 14, paddingBottom: 40 }}>點一下關閉</Text>
          </Pressable>
        </Modal>
      )}
      {collect && <CollectQRSheet who={collect.name} amount={collect.amount} onClose={() => setCollect(null)} onReceived={() => { markPaid(collect.id); toast(`已記錄 ${collect.name} 付款`); setCollect(null); }} />}
    </ConsolePage>
  );
}

/** 收款設定 (website: PayoutSettingsSheet): each method on / off, an automatic reminder before class. */
function PayoutSheet({ onClose }: { onClose: () => void }) {
  const [on, setOn] = useState(() => Object.fromEntries(PAYOUT_METHODS.map((m) => [m.name, m.on])));
  const { payout, remindUnpaid, setRemindUnpaid } = useSession();
  // the whole row toggles (form.tsx SwitchRow): a tap on the bare native switch was easy to miss
  const row = (title: string, sub: string, value: boolean, set: (v: boolean) => void) => <SwitchRow key={title} label={title} sub={sub} value={value} onChange={set} />;
  return (
    <Sheet title="收款方式" onClose={onClose}>
      <Text style={c.hint}>學生預約時會看到你開啟的方式，確認預約後自動傳付款資訊。</Text>
      {PAYOUT_METHODS.map((m) => row(m.name, m.name === "銀行轉帳" ? `${payout.bank}・尾號 ${payout.account.replace(/\D/g, "").slice(-4)}` : m.sub, on[m.name], (v) => setOn((p) => ({ ...p, [m.name]: v }))))}
      <Pressable onPress={() => { onClose(); router.push("/coach-bank"); }} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: color.n100 }}>
        <Icon name="wallet" size={18} />
        <View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "700" }}>收款帳戶</Text><Text style={{ fontSize: 13, color: color.muted }}>學生會用它產生轉帳 QR code</Text></View>
        <Icon name="right" size={14} tint={color.muted} />
      </Pressable>
      {row("自動提醒未付款", "上課前一晚 20:00 用 LINE 提醒，附轉帳 QR", remindUnpaid, (v) => { setRemindUnpaid(v); toast(v ? "已開啟自動提醒未付款" : "已關閉自動提醒未付款"); })}
      <Btn kind="primary" label="完成" onPress={onClose} />
    </Sheet>
  );
}
