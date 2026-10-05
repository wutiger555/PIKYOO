import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { demoDay } from "@pikyoo/core/data/today";
import type { Attendance } from "@pikyoo/core/data/schedule";
import { addLessonToCalendar, nowHHMM } from "@/data/phone";
import { useSession } from "@/data/session";
import { Num } from "@/ui/badges";
import { Btn } from "@/ui/Btn";
import { KIND } from "@/ui/calendar";
import { Avatar, c, SecHead } from "@/ui/console";
import { Field, Segmented } from "@/ui/form";
import { Icon } from "@/ui/Icon";
import { Sheet } from "@/ui/Sheet";
import { Status } from "@/ui/Status";
import { color, radius } from "@/ui/theme";

const ATT: [Attendance, string][] = [["present", "到"], ["late", "遲到"], ["absent", "未到"]];

/** 一堂課: everything the coach needs on court — who's coming, who has paid, roll call, the prep note, notes after class,
 *  and the two things that happen at short notice (move indoors, cancel). */
export default function LessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lessons, students, attendance, setAttendance, setLesson, seatPay, markSeatPaid, addNote } = useSession();
  const l = lessons.find((x) => x.id === id);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  if (!l) return <Text style={{ padding: 16 }}>找不到這堂課</Text>;
  const d = demoDay(l.offset);
  const seats = l.seats.map((x) => ({ ...x, st: students.find((y) => y.id === x.sid) }));
  const names = seats.map((x) => x.st?.name ?? "").join("、");
  const past = l.offset < 0 || (l.offset === 0 && l.end <= nowHHMM());
  const off = l.status === "cancelled";
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.venue)}`;

  return (
    <View style={{ flex: 1, backgroundColor: color.bg }}>
      <Stack.Screen options={{ title: l.plan }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <View style={st.head}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: color.onCarbonMuted, fontSize: 14 }}>{d.date}（{d.weekday}）{l.offset === 0 ? "今天" : ""}</Text>
            <Text style={[st.kind, { backgroundColor: KIND[l.kind].color }]}>{KIND[l.kind].label}</Text>
          </View>
          <Num style={{ color: "#fff", fontSize: 36, textDecorationLine: off ? "line-through" : "none" }}>{l.start}–{l.end}</Num>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>{l.plan}・{seats.length} 人</Text>
          <Text style={{ color: color.onCarbonMuted, fontSize: 14 }}>{[l.venue, l.court].filter(Boolean).join("・")}</Text>
          {off && <View style={{ marginTop: 6 }}><Status tone="ended">已取消，已通知學生</Status></View>}
          {l.notice && <Text style={{ color: color.accent, fontSize: 14, marginTop: 4 }}>已通知學生：{l.notice}</Text>}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <Btn kind="onCarbon" lg={false} icon="cal" label="加入手機行事曆" style={{ flex: 1, borderRadius: 999 }}
              onPress={async () => { if (await addLessonToCalendar(l, names)) Alert.alert("已加入手機行事曆"); }} />
            <Btn kind="onCarbon" lg={false} icon="pin" label="導航" style={{ borderRadius: 999 }} onPress={() => Linking.openURL(maps)} />
          </View>
        </View>

        <View style={c.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Icon name="msg" size={15} tint={color.olive} /><Text style={{ fontWeight: "800", fontSize: 16 }}>課前備註</Text><Text style={c.hint}>只有你看得到</Text></View>
          <TextInput value={l.prep} onChangeText={(prep) => setLesson(l.id, { prep })} multiline placeholder="例：帶練習球 20 顆、這堂要錄影、場地 3 號場" placeholderTextColor={color.n500}
            style={[c.input, { minHeight: 70, textAlignVertical: "top" }]} />
          <Text style={c.hint}>上課前的提醒通知會帶上這段備註。</Text>
        </View>

        <SecHead en="Roster" title={past ? "點名與付款" : "學生與付款"} right={<Text style={c.hint}>點名字看學生紀錄</Text>} />
        {seats.map(({ sid, st: x }) => {
          const pay = seatPay(l.id, sid);
          const a = attendance[`${l.id}:${sid}`];
          return (
            <View key={sid} style={c.card}>
              <Pressable onPress={() => router.push(`/coach-student/${sid}`)} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Avatar t={x?.initial ?? "?"} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "800" }}>{x?.name}</Text>
                  <Text style={c.hint}>{x?.level}・{x?.times ? `上過 ${x.times} 堂` : "第一次上課"}{x?.pack ? `・套票 ${x.pack.used}/${x.pack.total}` : ""}</Text>
                </View>
                <Status tone={pay === "paid" ? "open" : pay === "reported" ? "info" : "almost"}>{pay === "paid" ? "已付款" : pay === "reported" ? "已回報" : "未付款"}</Status>
              </Pressable>
              {x?.notes[0] && <Text style={st.lastNote} numberOfLines={2}>上次：{x.notes[0].text}</Text>}
              {pay !== "paid" && !off && (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Btn label="已收到" lg={false} style={{ flex: 1, borderRadius: 999 }} onPress={() => markSeatPaid(l.id, sid)} />
                  <Btn label="LINE 提醒付款" icon="bell" lg={false} style={{ flex: 1, borderRadius: 999 }} onPress={() => Alert.alert(`已用 LINE 傳付款提醒給 ${x?.name}`)} />
                </View>
              )}
              {!off && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[c.label, { width: 36 }]}>點名</Text>
                  <View style={{ flex: 1 }}><Segmented value={a ?? ("" as Attendance)} options={ATT.map((z) => z[0])} format={(v) => ATT.find((z) => z[0] === v)![1]} tint={(v) => (v === "present" ? color.accent : v === "late" ? color.warningBg : color.n200)} onChange={(v) => setAttendance(l.id, sid, v)} /></View>
                </View>
              )}
              <Pressable onPress={() => setNoteFor(sid)} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Icon name="plus" size={13} tint={color.olive} /><Text style={{ fontSize: 14, fontWeight: "700", color: color.olive }}>寫課後筆記</Text>
              </Pressable>
            </View>
          );
        })}

        {!off && !past && (
          <>
            <SecHead en="Changes" title="臨時狀況" />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Btn label="下雨改室內" lg={false} style={{ flex: 1, borderRadius: 999 }} onPress={() => Alert.alert("通知學生改到室內？", `會用 LINE 通知 ${names}`, [
                { text: "先不要", style: "cancel" },
                { text: "通知", onPress: () => { setLesson(l.id, { notice: "下雨改到室內場，時間不變" }); Alert.alert(`已通知 ${seats.length} 位學生`); } },
              ])} />
              <Btn label="取消這堂課" lg={false} style={{ flex: 1, borderRadius: 999 }} onPress={() => Alert.alert("取消這堂課？", `會通知 ${names}，已付款的學生之後退款或改期。`, [
                { text: "先不要", style: "cancel" },
                { text: "取消並通知", style: "destructive", onPress: () => setLesson(l.id, { status: "cancelled" }) },
              ])} />
            </View>
          </>
        )}
      </ScrollView>
      {noteFor && <NoteSheet sid={noteFor} onSave={(t) => { addNote(noteFor, t); setNoteFor(null); Alert.alert("已存到學生紀錄"); }} onClose={() => setNoteFor(null)} />}
    </View>
  );
}

function NoteSheet({ sid, onSave, onClose }: { sid: string; onSave: (t: string) => void; onClose: () => void }) {
  const st = useSession().students.find((x) => x.id === sid);
  const [t, setT] = useState("");
  return (
    <Sheet title={`${st?.name} 的課後筆記`} onClose={onClose}>
      <Field value={t} onChange={setT} multiline placeholder="今天練了什麼、下次要加強什麼（只有你看得到）" />
      <Btn kind="primary" label="存到學生紀錄" disabled={!t.trim()} onPress={() => onSave(t.trim())} />
    </Sheet>
  );
}

const st = StyleSheet.create({
  head: { backgroundColor: color.carbon, borderRadius: radius.lg, padding: 16, gap: 4 },
  kind: { fontSize: 12, fontWeight: "800", color: "#fff", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, overflow: "hidden" },
  lastNote: { fontSize: 13, color: color.n700, backgroundColor: color.bg, borderRadius: 8, padding: 8, overflow: "hidden" },
});
