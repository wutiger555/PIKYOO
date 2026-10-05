import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { demoDay } from "@pikyoo/core/data/today";
import { nowHHMM } from "@/data/phone";
import { useSession } from "@/data/session";
import { Num } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { KIND } from "@/ui/calendar";
import { Avatar, c, SecHead } from "@/ui/console";
import { Field } from "@/ui/form";
import { Icon } from "@/ui/Icon";
import { color } from "@/ui/theme";

const when = (n: number) => `${demoDay(n).date}（${demoDay(n).weekday}）`;

/** 學生紀錄: what the coach wants before the next lesson — level, package left, notes from past lessons, what's coming. */
export default function StudentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, lessons, attendance, addNote } = useSession();
  const [draft, setDraft] = useState("");
  const x = students.find((s) => s.id === id);
  if (!x) return <Text style={{ padding: 16 }}>找不到這位學生</Text>;
  const mine = lessons.filter((l) => l.status === "confirmed" && l.seats.some((s) => s.sid === x.id)).sort((a, b) => a.offset - b.offset || a.start.localeCompare(b.start));
  const upcoming = (l: (typeof mine)[number]) => l.offset > 0 || (l.offset === 0 && l.end > nowHHMM());
  const next = mine.filter(upcoming);
  const past = mine.filter((l) => !upcoming(l)).reverse();
  const left = x.pack ? x.pack.total - x.pack.used : 0;

  return (
    <ScrollView style={{ backgroundColor: color.bg }} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
      <Stack.Screen options={{ title: x.name }} />
      <View style={[c.card, { flexDirection: "row", alignItems: "center", gap: 12 }]}>
        <Avatar t={x.initial} size={52} />
        <View style={{ flex: 1 }}><Text style={{ fontSize: 22, fontWeight: "800" }}>{x.name}</Text><Text style={c.hint}>程度 {x.level}・{x.times ? `上過 ${x.times} 堂` : "還沒上過課"}</Text></View>
      </View>

      {x.pack && (
        <View style={c.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <Text style={{ fontWeight: "800", fontSize: 16 }}>一對一 10 堂套票</Text>
            <Text><Num style={{ fontSize: 24 }}>{left}</Num><Text style={c.hint}> 堂剩下</Text></Text>
          </View>
          <View style={{ flexDirection: "row", gap: 3 }}>
            {Array.from({ length: x.pack.total }, (_, i) => <View key={i} style={{ flex: 1, height: 10, borderRadius: 3, backgroundColor: i < x.pack!.used ? color.olive : color.n100 }} />)}
          </View>
          <Text style={c.hint}>已上 {x.pack.used} 堂{left <= 2 ? "・快用完了，可以提醒續購" : ""}</Text>
        </View>
      )}

      <SecHead en="Notes" title="課後筆記" right={<Text style={c.hint}>只有你看得到</Text>} />
      <View style={c.card}>
        <Field value={draft} onChange={setDraft} multiline placeholder="新增一則：今天練了什麼、下次要加強什麼" />
        <Btn kind="primary" lg={false} label="新增筆記" disabled={!draft.trim()} style={{ alignSelf: "flex-end", borderRadius: 999 }} onPress={() => { addNote(x.id, draft.trim()); setDraft(""); }} />
        {x.notes.map((n, i) => (
          <View key={i} style={{ borderTopWidth: 1, borderTopColor: color.n100, paddingTop: 10, gap: 2 }}>
            <Text style={c.hint}>{n.offset === 0 ? "今天" : when(n.offset)}</Text>
            <Text style={{ fontSize: 15, lineHeight: 22 }}>{n.text}</Text>
          </View>
        ))}
        {!x.notes.length && <Text style={c.hint}>還沒有筆記。</Text>}
      </View>

      <SecHead en="Upcoming" title={`接下來的課 ${next.length}`} />
      {next.slice(0, 6).map((l) => <LessonRow key={l.id} id={l.id} label={`${when(l.offset)} ${l.start}`} plan={l.plan} color={KIND[l.kind].color} />)}
      {!next.length && <Text style={c.hint}>沒有排定的課。</Text>}

      <SecHead en="History" title="上課紀錄" />
      {past.slice(0, 8).map((l) => {
        const a = attendance[`${l.id}:${x.id}`];
        return <LessonRow key={l.id} id={l.id} label={`${when(l.offset)} ${l.start}`} plan={l.plan} color={KIND[l.kind].color} tail={a === "absent" ? "未到" : a === "late" ? "遲到" : "已上課"} />;
      })}
      {!past.length && <Text style={c.hint}>還沒有上課紀錄。</Text>}
    </ScrollView>
  );
}

function LessonRow({ id, label, plan, color: k, tail }: { id: string; label: string; plan: string; color: string; tail?: string }) {
  return (
    <Pressable onPress={() => router.push(`/coach-lesson/${id}`)} style={[c.card, { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 }]}>
      <View style={{ width: 4, height: 30, borderRadius: 2, backgroundColor: k }} />
      <View style={{ flex: 1 }}><Num style={{ fontSize: 16 }}>{label}</Num><Text style={c.hint}>{plan}</Text></View>
      {tail && <Text style={{ fontSize: 13, color: tail === "已上課" ? color.muted : color.warning, fontWeight: "700" }}>{tail}</Text>}
      <Icon name="right" size={13} tint={color.muted} />
    </Pressable>
  );
}
