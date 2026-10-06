import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { demoDay } from "@pikyoo/core/data/today";
import type { CoachLesson, LessonKind, TimeBlock } from "@pikyoo/core/data/schedule";
import { nowHHMM } from "@/data/phone";
import { useSession } from "@/data/session";
import { Num } from "./badges";
import { Icon } from "./Icon";
import { color, radius } from "./theme";

// The coach calendar's pieces: the week strip and the day agenda (lessons, pending requests, blocked time).

export const KIND: Record<LessonKind, { label: string; color: string }> = {
  private: { label: "一對一", color: color.accent700 },
  small: { label: "小班", color: color.olive },
  trial: { label: "體驗課", color: "#4F7CAC" },
};

const WEEK = ["一", "二", "三", "四", "五", "六", "日"] as const;
/** Day offset of this week's Monday, `w` weeks from now. */
export const mondayOf = (w: number) => -WEEK.indexOf(demoDay(0).weekday as (typeof WEEK)[number]) + w * 7;

export function WeekStrip({ monday, selected, onSelect, counts }: { monday: number; selected: number; onSelect: (n: number) => void; counts: (n: number) => { n: number; blocked: boolean } }) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {WEEK.map((wd, i) => {
        const n = monday + i;
        const on = n === selected;
        const today = n === 0;
        const { n: cnt, blocked } = counts(n);
        return (
          <Pressable key={wd} onPress={() => onSelect(n)} accessibilityLabel={`${demoDay(n).date} 週${wd}，${cnt} 堂課`}
            style={[s.day, on && { backgroundColor: color.text, borderColor: color.text }, today && !on && { borderColor: color.text }]}>
            <Text style={{ fontSize: 11, color: on ? color.onCarbonMuted : color.muted }}>{wd}</Text>
            <Num style={{ fontSize: 20, color: on ? "#fff" : n < 0 ? color.n500 : color.text }}>{demoDay(n).date.split("/")[1]}</Num>
            <View style={{ flexDirection: "row", gap: 2, height: 6 }}>
              {blocked ? <View style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: color.n500, marginTop: 1 }} />
                : Array.from({ length: Math.min(cnt, 3) }, (_, k) => <View key={k} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: on ? color.accent : color.accent700 }} />)}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** One day: lessons in time order with pending requests (dashed) and blocked time (grey) in between. */
export function DayAgenda({ offset, compact }: { offset: number; compact?: boolean }) {
  const { lessons, pendingSlots, blocks, students, seatPay, attendance } = useSession();
  const now = nowHHMM();
  /** finished today or yesterday, but someone has no roll call yet: the coach's after-class to-do */
  const todo = (l: CoachLesson) => l.status === "confirmed" && (l.offset === -1 || (l.offset === 0 && l.end <= now)) && l.seats.some((x) => !attendance[`${l.id}:${x.sid}`]);
  type Item = { at: string; el: React.ReactNode };
  const items: Item[] = [
    ...lessons.filter((l) => l.offset === offset).map((l) => ({ at: l.start, el: <LessonCard key={l.id} l={l} compact={compact} names={l.seats.map((x) => students.find((y) => y.id === x.sid)?.name ?? "").join("、")} unpaid={l.seats.filter((x) => seatPay(l.id, x.sid) !== "paid").length} todo={todo(l)} /> })),
    ...pendingSlots.filter((p) => p.offset === offset).map((p) => ({ at: p.start, el: (
      <Pressable key={p.id} onPress={() => router.push("/coach-inbox")} style={[s.card, s.pending]}>
        <Num style={s.time}>{p.start}</Num>
        <View style={{ flex: 1 }}><Text style={{ fontWeight: "800", fontSize: 15 }}>待確認：{p.plan}</Text><Text style={s.sub}>{p.name}・點這裡確認或婉拒</Text></View>
        <Icon name="right" size={13} tint={color.muted} />
      </Pressable>
    ) })),
    ...blocks.filter((b) => b.offset === offset).map((b) => ({ at: b.start, el: <BlockCard key={b.id} b={b} /> })),
  ].sort((a, b) => a.at.localeCompare(b.at));
  if (!items.length) return <Text style={[s.sub, { paddingVertical: compact ? 2 : 16, textAlign: compact ? "left" : "center" }]}>{compact ? "沒有課" : "這天沒有課。"}</Text>;
  return <View style={{ gap: 8 }}>{items.map((x) => x.el)}</View>;
}

function LessonCard({ l, names, unpaid, compact, todo }: { l: CoachLesson; names: string; unpaid: number; compact?: boolean; todo?: boolean }) {
  const k = KIND[l.kind];
  const off = l.status === "cancelled";
  return (
    <Pressable onPress={() => router.push(`/coach-lesson/${l.id}`)} style={[s.card, off && { opacity: 0.55 }]} accessibilityLabel={`${l.start} ${l.plan} ${names}`}>
      <View style={{ width: 4, alignSelf: "stretch", borderRadius: 2, backgroundColor: k.color }} />
      <View style={{ width: 50 }}><Num style={[s.time, off ? { textDecorationLine: "line-through" } : {}]}>{l.start}</Num><Num style={{ fontSize: 13, color: color.muted }}>{l.end}</Num></View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontWeight: "800", fontSize: 15 }} numberOfLines={1}>{l.plan}</Text>
          {off && <Text style={[s.badge, { backgroundColor: color.n100, color: color.n700 }]}>已取消</Text>}
          {todo && <Text style={[s.badge, { backgroundColor: color.text, color: color.accent }]}>待點名</Text>}
          {!off && unpaid > 0 && <Text style={[s.badge, { backgroundColor: color.warningBg, color: color.warning }]}>{unpaid} 人未付</Text>}
        </View>
        <Text style={s.sub} numberOfLines={1}>{names}</Text>
        {!compact && <Text style={s.sub} numberOfLines={1}>{[l.venue, l.court].filter(Boolean).join("・")}</Text>}
        {!compact && (l.notice || l.prep) ? (
          <View style={{ flexDirection: "row", gap: 4, alignItems: "center", marginTop: 2 }}>
            <Icon name="msg" size={11} tint={color.olive} />
            <Text style={{ fontSize: 12, color: color.olive, flex: 1 }} numberOfLines={1}>{l.notice ?? l.prep}</Text>
          </View>
        ) : null}
      </View>
      <Icon name="right" size={13} tint={color.muted} />
    </Pressable>
  );
}

function BlockCard({ b }: { b: TimeBlock }) {
  const { removeBlock } = useSession();
  const all = b.start === "00:00" && b.end === "24:00";
  return (
    <View style={[s.card, { backgroundColor: color.n100, borderStyle: "dashed", borderColor: color.n500 }]}>
      <Icon name="lock" size={15} tint={color.n700} />
      <View style={{ flex: 1 }}><Text style={{ fontWeight: "800", fontSize: 15 }}>{all ? "整天不開放" : `${b.start}–${b.end} 不開放`}</Text><Text style={s.sub}>{b.reason || "已擋掉，學生預約不到"}</Text></View>
      <Pressable onPress={() => removeBlock(b.id)} hitSlop={8}><Text style={{ fontSize: 13, fontWeight: "700", textDecorationLine: "underline" }}>取消</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  day: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 7, borderRadius: radius.md, borderWidth: 1.5, borderColor: color.line, backgroundColor: color.surface },
  card: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, padding: 12 },
  pending: { borderStyle: "dashed", borderWidth: 1.5, borderColor: color.accent700, backgroundColor: color.accentSoft },
  time: { fontSize: 20, color: color.text },
  sub: { fontSize: 13, color: color.muted },
  badge: { fontSize: 11, fontWeight: "800", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: "hidden" },
});
