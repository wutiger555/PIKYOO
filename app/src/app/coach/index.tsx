import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { demoDay } from "@pikyoo/core/data/today";
import { money } from "@pikyoo/core/format";
import { addAllToCalendar, nowHHMM, scheduleReminders, sendTestReminder, type ReminderPrefs } from "@/data/phone";
import { useSession } from "@/data/session";
import { Num } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { DayAgenda, KIND, mondayOf, WeekStrip } from "@/ui/calendar";
import { c, ConsolePage, RolePill, ToStudent } from "@/ui/console";
import { Field, Segmented, SwitchRow } from "@/ui/form";
import { Icon, type IconName } from "@/ui/Icon";
import { Sheet } from "@/ui/Sheet";
import { color, radius } from "@/ui/theme";

const label = (n: number) => `${demoDay(n).date}（${demoDay(n).weekday}）${n === 0 ? "今天" : n === 1 ? "明天" : ""}`;

/** 行事曆: the coach's home. Every lesson by day or week, pending requests and blocked time on the same calendar,
 *  and the phone's own calendar and reminders one tap away. Requests and questions sit behind 待處理. */
export default function CoachCalendar() {
  const s = useSession();
  const { lessons, requests, questions, myCoach, payments, students, blocks } = s;
  const [mode, setMode] = useState<"日" | "週">("日");
  const [week, setWeek] = useState(0);
  const [day, setDay] = useState(0);
  const [sheet, setSheet] = useState<"block" | "remind" | null>(null);
  const monday = mondayOf(week);
  const live = lessons.filter((l) => l.status === "confirmed");
  const pend = requests.filter((r) => r.status === "pending").length;
  const ask = questions.filter((q) => q.coachId === myCoach?.id && !q.answer).length;
  const today = live.filter((l) => l.offset === 0).sort((a, b) => a.start.localeCompare(b.start));
  const nowHM = nowHHMM();
  const next = today.find((l) => l.end > nowHM);
  const weekCount = live.filter((l) => l.offset >= mondayOf(0) && l.offset < mondayOf(0) + 7).length;
  const due = payments.filter((p) => p.status !== "paid").reduce((a, p) => a + p.amount, 0);
  const names = (sids: string[]) => sids.map((x) => students.find((y) => y.id === x)?.name ?? "").join("、");
  const upcoming = live.filter((l) => l.offset >= 0 && l.offset <= 14).map((l) => ({ lesson: l, names: names(l.seats.map((x) => x.sid)) }));
  const counts = (n: number) => ({ n: live.filter((l) => l.offset === n).length + s.pendingSlots.filter((p) => p.offset === n).length, blocked: blocks.some((b) => b.offset === n && b.start === "00:00") });
  const go = (w: number) => { setWeek(w); setDay(w === 0 ? 0 : mondayOf(w)); };
  const addAll = async () => {
    const n = await addAllToCalendar(upcoming);
    Alert.alert(n < 0 ? "需要行事曆權限" : `已加入 ${n} 堂課`, n < 0 ? "請到 iPhone 設定 → Expo Go → 行事曆 打開權限" : "未來兩週的課都在手機行事曆裡了，每堂課前 1 小時會提醒。");
  };

  return (
    <ConsolePage hero={
      <>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <RolePill />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <ToStudent />
            <Pressable onPress={() => router.push("/me/notifications")} accessibilityLabel="通知"><Icon name="bell" size={20} tint="#fff" /></Pressable>
          </View>
        </View>
        <Text style={{ color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 16 }}>早安，{myCoach?.name.split(" ")[0]}</Text>
        <Text style={{ color: color.onCarbonMuted, fontSize: 15, marginTop: 2 }}>
          今天 {today.length} 堂課{next ? `，下一堂 ${next.start} ${next.plan}（${next.venue.replace("運動中心", "")}）` : "，都上完了"}
        </Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,.14)" }}>
          <Stat n={String(today.length)} label="今天的課" />
          <Stat n={String(weekCount)} label="本週課" />
          <Stat n={money(due)} label="待收款 ›" onPress={() => router.push("/coach/payments")} last />
        </View>
      </>
    }>
      {pend + ask > 0 && (
        <Pressable onPress={() => router.push("/coach-inbox")} style={st.inbox}>
          <View style={st.inboxDot}><Num style={{ fontSize: 16 }}>{pend + ask}</Num></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "800" }}>待處理</Text>
            <Text style={{ fontSize: 13, color: color.n700 }}>{[pend && `${pend} 筆預約待確認`, ask && `${ask} 則提問待回覆`].filter(Boolean).join("・")}</Text>
          </View>
          <Icon name="right" size={15} />
        </Pressable>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ width: 110 }}><Segmented value={mode} options={["日", "週"] as const} onChange={setMode} /></View>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
          <Pressable onPress={() => go(week - 1)} hitSlop={8} style={st.nav} accessibilityLabel="上一週"><Icon name="left" size={14} /></Pressable>
          <Pressable onPress={() => go(0)} hitSlop={4}><Text style={{ fontSize: 15, fontWeight: "800", minWidth: 96, textAlign: "center" }}>{week === 0 ? "本週" : `${demoDay(monday).date}–${demoDay(monday + 6).date}`}</Text></Pressable>
          <Pressable onPress={() => go(week + 1)} hitSlop={8} style={st.nav} accessibilityLabel="下一週"><Icon name="right" size={14} /></Pressable>
        </View>
      </View>

      {mode === "日" ? (
        <>
          <WeekStrip monday={monday} selected={day} onSelect={setDay} counts={counts} />
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 19, fontWeight: "800" }}>{label(day)}</Text>
            <Text style={c.hint}>{live.filter((l) => l.offset === day).length} 堂</Text>
          </View>
          <DayAgenda offset={day} />
        </>
      ) : (
        Array.from({ length: 7 }, (_, i) => monday + i).map((n) => (
          <View key={n} style={{ gap: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: n === 0 ? color.text : n < 0 ? color.n500 : color.n700 }}>{label(n)}</Text>
            <DayAgenda offset={n} compact />
          </View>
        ))
      )}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
        {(Object.keys(KIND) as (keyof typeof KIND)[]).map((k) => (
          <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: KIND[k].color }} /><Text style={c.hint}>{KIND[k].label}</Text></View>
        ))}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}><View style={{ width: 10, height: 10, borderRadius: 3, borderWidth: 1.5, borderStyle: "dashed", borderColor: color.accent700 }} /><Text style={c.hint}>待確認</Text></View>
      </View>

      <View style={{ gap: 8 }}>
        <Tool icon="lock" title="擋掉時間" sub="請假、比賽、出國：學生就預約不到" onPress={() => setSheet("block")} />
        <Tool icon="cal" title="加入手機行事曆" sub="未來兩週的課一次加入，每堂前 1 小時提醒" onPress={addAll} />
        <Tool icon="bell" title="提醒設定" sub="上課前提醒、每晚明天課表、訂場提醒" onPress={() => setSheet("remind")} />
      </View>

      {sheet === "block" && <BlockSheet day={day} onClose={() => setSheet(null)} />}
      {sheet === "remind" && <RemindSheet upcoming={upcoming} onClose={() => setSheet(null)} />}
    </ConsolePage>
  );
}

function Stat({ n, label: l, onPress, last }: { n: string; label: string; onPress?: () => void; last?: boolean }) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={[{ flex: 1, gap: 2 }, !last && { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,.14)" }]}>
      <Num style={{ fontSize: 22, color: "#fff" }}>{n}</Num><Text style={{ fontSize: 12, color: color.onCarbonMuted }}>{l}</Text>
    </Pressable>
  );
}

function Tool({ icon, title, sub, onPress }: { icon: IconName; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={st.tool}>
      <View style={st.toolIc}><Icon name={icon} size={17} /></View>
      <View style={{ flex: 1 }}><Text style={{ fontSize: 15, fontWeight: "800" }}>{title}</Text><Text style={c.hint}>{sub}</Text></View>
      <Icon name="right" size={13} tint={color.muted} />
    </Pressable>
  );
}

const hm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
const at = (h: number) => { const d = new Date(); d.setHours(h, 0, 0, 0); return d; };

/** 擋掉時間: a whole day or a time range, with a reason only the coach sees. */
function BlockSheet({ day, onClose }: { day: number; onClose: () => void }) {
  const { addBlock, lessons } = useSession();
  const [d, setD] = useState(() => { const x = new Date(); x.setHours(12, 0, 0, 0); x.setDate(x.getDate() + Math.max(day, 0)); return x; });
  const [all, setAll] = useState(true);
  const [from, setFrom] = useState(at(9));
  const [to, setTo] = useState(at(12));
  const [reason, setReason] = useState("");
  const offset = Math.round((new Date(d).setHours(12, 0, 0, 0) - new Date().setHours(12, 0, 0, 0)) / 864e5);
  const start = all ? "00:00" : hm(from);
  const end = all ? "24:00" : hm(to);
  const clash = lessons.filter((l) => l.status === "confirmed" && l.offset === offset && l.start < end && l.end > start);
  return (
    <Sheet title="擋掉時間" onClose={onClose}>
      <View style={st.pickRow}><Text style={c.label}>日期</Text><DateTimePicker value={d} mode="date" display="compact" locale="zh-TW" minimumDate={new Date()} onValueChange={(_, v) => setD(v)} /></View>
      <SwitchRow first label="整天" value={all} onChange={setAll} />
      {!all && (
        <View style={st.pickRow}>
          <Text style={c.label}>時間</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <DateTimePicker value={from} mode="time" display="compact" minuteInterval={30} locale="zh-TW" onValueChange={(_, v) => setFrom(v)} />
            <Text>–</Text>
            <DateTimePicker value={to} mode="time" display="compact" minuteInterval={30} locale="zh-TW" onValueChange={(_, v) => setTo(v)} />
          </View>
        </View>
      )}
      <Field label="原因（只有你看得到）" value={reason} onChange={setReason} placeholder="例：比賽、出國、看牙醫" />
      {clash.length > 0 && <Text style={{ color: color.warning, fontSize: 13 }}>這段時間已經有 {clash.length} 堂課，擋掉不會取消它們；要取消請點進那堂課。</Text>}
      <Btn kind="primary" label="擋掉這段時間" disabled={!all && start >= end} onPress={() => { addBlock({ offset, start, end, reason }); onClose(); Alert.alert("已擋掉", "學生預約頁不會再出現這段時間。"); }} />
    </Sheet>
  );
}

/** 提醒設定: local notifications on the coach's phone. */
function RemindSheet({ upcoming, onClose }: { upcoming: Parameters<typeof scheduleReminders>[1]; onClose: () => void }) {
  const [p, setP] = useState<ReminderPrefs>({ before: 60, nightly: true, courtBooking: false });
  const save = async () => {
    const ok = await scheduleReminders(p, upcoming);
    onClose();
    Alert.alert(ok ? "提醒已設定" : "需要通知權限", ok ? "會用手機通知提醒你。" : "請到 iPhone 設定 → Expo Go → 通知 打開權限");
  };
  return (
    <Sheet title="提醒設定" onClose={onClose}>
      <Segmented label="上課前提醒" value={p.before ?? 0} options={[0, 30, 60, 120] as const} format={(m) => (m === 0 ? "不提醒" : m < 60 ? `${m} 分` : `${m / 60} 小時`)} onChange={(m) => setP({ ...p, before: m || null })} />
      <View>
        <SwitchRow first label="每晚 21:00 明天課表" sub="睡前看一眼明天要去哪、帶什麼" value={p.nightly} onChange={(nightly) => setP({ ...p, nightly })} />
        <SwitchRow label="每週一 00:00 訂場提醒" sub="公立球場開放預約時提醒你搶場地" value={p.courtBooking} onChange={(courtBooking) => setP({ ...p, courtBooking })} />
      </View>
      <Btn kind="primary" label="儲存" onPress={save} />
      <Pressable onPress={async () => { const ok = await sendTestReminder(upcoming[0]?.lesson, upcoming[0]?.names ?? ""); if (ok) Alert.alert("5 秒後會收到一則測試提醒", "可以先回到桌面看看"); }}>
        <Text style={[c.hint, { textAlign: "center", textDecorationLine: "underline" }]}>傳一則測試提醒給自己</Text>
      </Pressable>
    </Sheet>
  );
}

const st = StyleSheet.create({
  inbox: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.accent, borderRadius: radius.md, padding: 14 },
  inboxDot: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  nav: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: color.n300, alignItems: "center", justifyContent: "center", backgroundColor: color.surface },
  tool: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: 12 },
  toolIc: { width: 34, height: 34, borderRadius: 17, backgroundColor: color.n100, alignItems: "center", justifyContent: "center" },
  pickRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 },
});
