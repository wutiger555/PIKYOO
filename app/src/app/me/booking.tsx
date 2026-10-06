import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { bookingDays } from "@pikyoo/core/data/coaches";
import { money } from "@pikyoo/core/format";
import type { BookingStatus } from "@pikyoo/core/types";
import { bookingTotal } from "@/data/booking";
import { addEventToCalendar, lessonDates } from "@/data/phone";
import { useSession } from "@/data/session";
import { Num, Tag } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { Photo } from "@/ui/CoachCard";
import { Icon } from "@/ui/Icon";
import { Sheet } from "@/ui/Sheet";
import { Status, type StatusTone } from "@/ui/Status";
import { color, radius } from "@/ui/theme";
import { toast } from "@/ui/Toast";
import { TransferPay } from "@/ui/TransferPay";

const STEPS = ["送出申請", "教練確認", "付款", "上課"];

/** 我的預約 (website: BookingStatusScreen, docs/PRD.md §6.3): 送出申請 → 教練確認 → 付款 → 上課; payment only after the coach confirms.
 *  The app's demo booking for now; live bookings, with the coach's real payment details, come with sign-in (step 17). */
export default function BookingStatusPage() {
  const { booking: b, setBookingStatus, reportPayment, cancelBooking, coaches, payout } = useSession();
  const c = coaches.find((x) => x.id === b?.coachId);
  const [last5, setLast5] = useState("");
  const [change, setChange] = useState(false);
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
  const setStatus = (status: BookingStatus) => setBookingStatus(status);
  const venue = p.venues[0]?.name ?? "";
  const offset = Number(b.dayKey.replace("d", ""));
  const toCalendar = async () => {
    const { start } = lessonDates({ offset, start: b.slot!, end: b.slot! });
    const ok = await addEventToCalendar({ title: `PIKYOO｜${plan.name}・${c.name}`, start, end: new Date(start.getTime() + plan.durationMin * 60e3), location: venue, notes: "記得帶球拍、穿運動鞋，提早 10 分鐘到。" });
    if (ok) toast("已加入手機行事曆");
  };

  const card = (tone: StatusTone, label: string, title: string, text: string, extra?: React.ReactNode, tip?: string) => (
    <View style={s.state}>
      <Status tone={tone}>{label}</Status>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>{title}</Text>
      <Text style={{ color: color.muted, fontSize: 15, lineHeight: 22 }}>{text}</Text>
      {extra}
      {tip && <Text style={{ fontSize: 13, color: color.muted, lineHeight: 19 }}>{tip}</Text>}
    </View>
  );
  let main: React.ReactNode;
  if (st === "pending") {
    main = card("almost", "待教練確認", "預約已送出", `${c.name} ${p.reply}。確認後會用 LINE 通知你，48 小時未處理會自動取消。`,
      <Pressable onPress={() => { setStatus("confirmed"); toast(`${c.name} 確認了你的預約`, "通知也會出現在「我的 → 通知」"); }} style={s.demoBtn}>
        <Text style={{ fontWeight: "700" }}>示範：模擬教練按下確認</Text>
      </Pressable>,
      c.id === "mia" ? "也可以到「我的 → 我是教練：教練後台」，以 Mia 的身分在「行事曆 → 待處理」按確認。" : undefined);
  } else if (st === "confirmed") {
    main = (
      <>
        {card("open", "教練已確認", "完成付款就搞定了", "錢直接付給教練，付好後按一下，教練就知道了。上課前 24 小時可免費改期。")}
        <View style={s.paybox}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}><Text style={{ color: color.muted }}>應付金額</Text><Num style={{ fontSize: 28 }}>{money(total)}</Num></View>
          {b.pay === "LINE Pay" && (
            <>
              <Btn kind="primary" icon="wallet" label="打開 LINE Pay 付款" onPress={() => toast("示範：這裡會打開教練的 LINE Pay 收款連結")} />
              <Btn label="付好了，通知教練" onPress={() => { reportPayment(""); toast("已通知教練", "教練確認收到後會通知你"); }} />
            </>
          )}
          {b.pay === "銀行轉帳" && (
            <TransferPay {...payout} amount={total} onReport={(l5) => { setLast5(l5); reportPayment(l5); toast("已通知教練", "教練對帳後會通知你"); }} />
          )}
          {b.pay === "現場付現" && <Text style={{ fontSize: 16 }}>上課當天付 <Text style={{ fontWeight: "800" }}>{money(total)}</Text> 給教練即可。</Text>}
        </View>
      </>
    );
  } else if (st === "reported") {
    main = card("info", "等待教練對帳", "已回報付款", `${b.pay === "LINE Pay" ? "你回報已用 LINE Pay 付款" : `轉帳末五碼 ${last5}`}。教練確認收到後會通知你。`,
      <Pressable onPress={() => setStatus("paid")} style={s.demoBtn}><Text style={{ fontWeight: "700" }}>示範：模擬教練確認收到</Text></Pressable>);
  } else {
    main = card("open", "已付款", "準備好上課了！", "前一天 20:00 會用 LINE 提醒你，記得穿運動鞋。");
  }
  const booked = st !== "pending";

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
      {booked && (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Btn icon="cal" label="加入手機行事曆" lg={false} style={{ flex: 1, borderRadius: 999 }} onPress={toCalendar} />
          <Btn icon="pin" label="導航" lg={false} style={{ borderRadius: 999 }} onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`)} />
        </View>
      )}
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
      <Btn kind="ghost" label="改期或取消" onPress={() => setChange(true)} />
      {change && (
        <Sheet title="改期或取消" onClose={() => setChange(false)}>
          <Text style={{ fontSize: 15, color: color.n700, lineHeight: 22 }}>{p.policy}</Text>
          <Btn kind="primary" label="改到別的時段" onPress={() => { setChange(false); router.push({ pathname: "/coaches/[id]/book", params: { id: c.id, plan: b.planId } }); }} />
          <Btn label="取消這次預約" onPress={() => Alert.alert("取消這次預約？", `會通知 ${c.name}。`, [
            { text: "先不要", style: "cancel" },
            { text: "取消預約", style: "destructive", onPress: () => { setChange(false); cancelBooking(); toast("已取消預約", `已通知 ${c.name}`); router.back(); } },
          ])} />
        </Sheet>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: color.n300, backgroundColor: color.surface, alignItems: "center", justifyContent: "center" },
  state: { backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: color.line, padding: 18, gap: 8 },
  demoBtn: { marginTop: 6, alignSelf: "flex-start", borderWidth: 1.5, borderStyle: "dashed", borderColor: color.n500, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  paybox: { backgroundColor: color.surface, borderRadius: radius.lg, borderWidth: 1.5, borderColor: color.text, padding: 18, gap: 12 },
  sum: { borderRadius: radius.lg, overflow: "hidden", backgroundColor: color.surface, borderWidth: 1, borderColor: color.line },
  sumTop: { backgroundColor: color.carbon, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sumRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: color.n100 },
});
