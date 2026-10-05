import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { demoDay } from "@pikyoo/core/data/today";
import { nowHHMM } from "@/data/phone";
import { useSession } from "@/data/session";
import { Avatar, c, ConsolePage } from "@/ui/console";
import { Icon } from "@/ui/Icon";
import { color } from "@/ui/theme";

/** 學生: everyone who has booked this coach, soonest lesson first; packages running low stand out. */
export default function Students() {
  const { students, lessons } = useSession();
  const [q, setQ] = useState("");
  const nextOf = (sid: string) => lessons.filter((l) => l.status === "confirmed" && (l.offset > 0 || (l.offset === 0 && l.end > nowHHMM())) && l.seats.some((s) => s.sid === sid))
    .sort((a, b) => a.offset - b.offset || a.start.localeCompare(b.start))[0];
  const rows = students.filter((s) => !q || s.name.includes(q)).map((s) => ({ s, next: nextOf(s.id) }))
    .sort((a, b) => (a.next ? a.next.offset : 99) - (b.next ? b.next.offset : 99));
  return (
    <ConsolePage title="學生">
      <View style={[c.input, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
        <Icon name="users" size={15} tint={color.muted} />
        <TextInput value={q} onChangeText={setQ} placeholder="搜尋學生" placeholderTextColor={color.n500} style={{ flex: 1, fontSize: 16, color: color.text }} />
      </View>
      <Text style={c.hint}>{students.length} 位學生・依下一堂課排序</Text>
      <View style={[c.card, { gap: 0, paddingVertical: 2 }]}>
        {rows.map(({ s, next }, i) => {
          const left = s.pack ? s.pack.total - s.pack.used : null;
          return (
            <Pressable key={s.id} onPress={() => router.push(`/coach-student/${s.id}`)} style={[{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }, i > 0 && { borderTopWidth: 1, borderTopColor: color.n100 }]}>
              <Avatar t={s.initial} />
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 16, fontWeight: "800" }}>{s.name}</Text>
                  <Text style={c.hint}>{s.level}</Text>
                  {left != null && <Text style={{ fontSize: 11, fontWeight: "800", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: "hidden", backgroundColor: left <= 2 ? color.warningBg : color.oliveSoft, color: left <= 2 ? color.warning : color.olive }}>套票剩 {left} 堂</Text>}
                </View>
                <Text style={c.hint} numberOfLines={1}>{next ? `下一堂 ${next.offset === 0 ? "今天" : next.offset === 1 ? "明天" : `${demoDay(next.offset).date}（${demoDay(next.offset).weekday}）`} ${next.start} ${next.plan}` : "沒有排定的課"}</Text>
              </View>
              <Icon name="right" size={13} tint={color.muted} />
            </Pressable>
          );
        })}
      </View>
    </ConsolePage>
  );
}
