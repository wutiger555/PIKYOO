import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { bookingDays } from "@pikyoo/core/data/coaches";
import { money } from "@pikyoo/core/format";
import type { BookingStatus } from "@pikyoo/core/types";
import { bookingTotal } from "@/data/booking";
import { useCatalog } from "@/data/catalog";
import { useSession } from "@/data/session";
import { Num, Tag } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Photo } from "@/ui/CoachCard";
import { Icon } from "@/ui/Icon";
import { Status, type StatusTone } from "@/ui/Status";
import { color, radius } from "@/ui/theme";

const STEPS = ["送出申請", "教練確認", "付款", "上課"];

/** 我的預約 (website: BookingStatusScreen, docs/PRD.md §6.3): 送出申請 → 教練確認 → 付款 → 上課; payment only after the coach confirms.
 *  The app's demo booking for now; live bookings, with the coach's real payment details, come with sign-in (step 17). */
export default function BookingStatusPage() {
  const { booking: b, setBooking } = useSession();
  const c = useCatalog().catalog?.coaches.find((x) => x.id === b?.coachId);
  const [last5, setLast5] = useState("");
  if (!b || !b.slot || !c) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: "800" }}>還沒有預約</Text>
        <Text style={{ color: color.muted }}>先找一位教練，選好時段就能送出。</Text>
        <Btn kind="primary" label="找教練" onPress={() => router.replace("/coaches")} />
      </View>
    );
  }
  const p = c.profile;
  const { plan, total } = bookingTotal(b, p);
  const day = bookingDays().find((d) => d.key === b.dayKey) ?? { date: b.dayKey, weekday: "" };
  const st = b.status;
  const idx = { pending: 1, confirmed: 2, reported: 2, paid: 3 }[st];
  const setStatus = (status: BookingStatus) => setBooking({ ...b, status });

  const card = (tone: StatusTone, label: string, title: string, text: string, extra?: React.ReactNode) => (
    <View style={s.state}>
      <Status tone={tone}>{label}</Status>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>{title}</Text>
      <Text style={{ color: color.muted, fontSize: 15, lineHeight: 22 }}>{text}</Text>
      {extra}
    </View>
  );
  let main: React.ReactNode;
  if (st === "pending") {
    main = card("almost", "待教練確認", "預約已送出", `${c.name} ${p.reply}。確認後會用 LINE 通知你，48 小時未處理會自動取消。`,
      <Pressable onPress={() => { setStatus("confirmed"); Alert.alert(`${c.name} 已確認你的預約`); }} style={s.demoBtn}>
        <Text style={{ fontWeight: "700" }}>示範：模擬教練按下確認</Text>
      </Pressable>);
  } else if (st === "confirmed") {
    main = (
      <>
        {card("open", "教練已確認", "完成付款就搞定了", "錢直接付給教練。上課前 24 小時可免費改期。")}
        <View style={s.paybox}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}><Text style={{ color: color.muted }}>應付金額</Text><Num style={{ fontSize: 28 }}>{money(total)}</Num></View>
          {b.pay === "LINE Pay" && <Btn kind="primary" label="用 LINE Pay 付款" onPress={() => { setStatus("paid"); Alert.alert("LINE Pay 付款完成"); }} />}
          {b.pay === "銀行轉帳" && (
            <>
              <View style={{ gap: 4 }}>
                <Text style={s.kv}>銀行　台新銀行（812）</Text>
                <Text style={s.kv}>帳號　<Num style={{ fontSize: 17 }}>2888 1001 234 567</Num></Text>
                <Text style={s.kv}>戶名　林＊亞</Text>
              </View>
              <Text style={{ fontWeight: "700" }}>轉帳帳號末五碼</Text>
              <TextInput value={last5} onChangeText={(t) => setLast5(t.replace(/\D/g, "").slice(0, 5))} keyboardType="number-pad" style={s.input} placeholder="12345" placeholderTextColor={color.n500} />
              <Btn kind="primary" label="我已轉帳" disabled={last5.length !== 5} onPress={() => setStatus("reported")} />
            </>
          )}
          {b.pay === "現場付現" && <Text style={{ fontSize: 16 }}>上課當天付 <Text style={{ fontWeight: "800" }}>{money(total)}</Text> 給教練即可。</Text>}
        </View>
      </>
    );
  } else if (st === "reported") {
    main = card("info", "等待教練對帳", "已回報付款", `末五碼 ${last5}。教練確認收到後會通知你。`,
      <Pressable onPress={() => setStatus("paid")} style={s.demoBtn}><Text style={{ fontWeight: "700" }}>示範：模擬教練確認收到</Text></Pressable>);
  } else {
    main = card("open", "已付款", "準備好上課了！", "前一天 20:00 會用 LINE 提醒你，記得穿運動鞋。");
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }}>
      <View style={{ flexDirection: "row" }}>
        {STEPS.map((x, i) => (
          <View key={x} style={{ flex: 1, alignItems: "center", gap: 6 }}>
            <View style={[s.dot, i < idx && { backgroundColor: color.text, borderColor: color.text }, i === idx && { backgroundColor: color.accent, borderColor: color.text }]}>
              {i < idx && <Icon name="check" size={11} tint="#fff" />}
            </View>
            <Text style={{ fontSize: 13, fontWeight: i === idx ? "800" : "500", color: i <= idx ? color.text : color.muted }}>{x}</Text>
          </View>
        ))}
      </View>
      {main}
      <View style={s.sum}>
        <View style={s.sumTop}>
          <View><Text style={{ color: color.onCarbonMuted, fontSize: 13 }}>{day.date}（{day.weekday}）</Text><Num style={{ fontSize: 30, color: "#fff" }}>{b.slot}</Num></View>
          <Tag tone="accent">{plan.name}</Tag>
        </View>
        <Link href={`/coaches/${c.id}`} asChild>
          <Pressable style={s.sumRow}>
            {p.photos[0] && <Photo src={p.photos[0].src} alt={c.name} tag={false} style={{ width: 40, height: 40, borderRadius: 20 }} />}
            <View style={{ flex: 1 }}><Text style={{ fontWeight: "800", fontSize: 16 }}>{c.name}</Text><Text style={{ color: color.muted, fontSize: 13 }}>{p.venues[0]?.name}</Text></View>
            <Icon name="right" size={16} tint={color.muted} />
          </Pressable>
        </Link>
        <View style={[s.sumRow, { borderBottomWidth: 0 }]}>
          <Text style={{ flex: 1, color: color.muted }}>{plan.durationMin} 分鐘・{plan.unit === "/人" ? `${b.headcount} 人` : "1 人"}・{b.pay}</Text>
          <Num style={{ fontSize: 19 }}>{money(total)}</Num>
        </View>
      </View>
      <Btn kind="ghost" label="改期或取消" onPress={() => Alert.alert("改期或取消", p.policy)} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: color.n300, backgroundColor: color.surface, alignItems: "center", justifyContent: "center" },
  state: { backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, padding: 18, gap: 8 },
  demoBtn: { marginTop: 6, alignSelf: "flex-start", borderWidth: 1.5, borderStyle: "dashed", borderColor: color.n500, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  paybox: { backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: color.text, padding: 18, gap: 12 },
  kv: { fontSize: 15, color: color.text },
  input: { borderWidth: 1, borderColor: color.n300, borderRadius: radius.md, padding: 12, fontSize: 20, letterSpacing: 4, color: color.text },
  sum: { borderRadius: radius.lg, overflow: "hidden", backgroundColor: color.surface, borderWidth: 1, borderColor: color.line },
  sumTop: { backgroundColor: color.carbon, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sumRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: color.n100 },
});
