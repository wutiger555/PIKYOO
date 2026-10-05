import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Game } from "@pikyoo/core/types";
import { useGameView } from "@/data/session";
import { LevelChip, Num, Tag } from "./badges";
import { Icon } from "./Icon";
import { Status } from "./Status";
import { color, radius } from "./theme";

// The website's 球局票卡 and 座位列 (web/src/components/pk/Ticket.tsx).

/** 座位列: taken seats are initials (host ringed), open seats are empty ball holes, 你 is optic. Always states 缺 N. */
export function Seats({ game: g, lg }: { game: Game; lg?: boolean }) {
  const { my, spots, waitN } = useGameView(g);
  const size = lg ? 32 : 20;
  const seat = { width: size, height: size, borderRadius: size / 2, alignItems: "center" as const, justifyContent: "center" as const };
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 3 }}>
        {g.participants.map((p, i) => (
          <View key={i} style={[seat, { backgroundColor: color.n800 }, i === 0 && { borderWidth: 2, borderColor: color.accent }]}>
            <Text style={{ color: "#fff", fontSize: lg ? 13 : 10, fontWeight: "700" }}>{p.initial}</Text>
          </View>
        ))}
        {my === "joined" && <View style={[seat, { backgroundColor: color.accent, borderWidth: 1.5, borderColor: color.text }]}><Text style={{ fontSize: lg ? 14 : 11, fontWeight: "800" }}>你</Text></View>}
        {Array.from({ length: Math.max(0, spots) }, (_, i) => <View key={"o" + i} style={[seat, { borderWidth: 1.5, borderStyle: "dashed", borderColor: color.n500 }]} />)}
        {waitN > 0 && <Text style={{ alignSelf: "center", fontSize: 12, color: color.muted }}>候補 {waitN}</Text>}
      </View>
      <Text style={[{ fontSize: lg ? 16 : 14, fontWeight: "800" }, spots > 0 && spots <= 2 && { backgroundColor: color.accent, paddingHorizontal: 4, overflow: "hidden" }]}>{spots > 0 ? `缺 ${spots}` : "額滿"}</Text>
    </View>
  );
}

export function GameStatus({ game: g }: { game: Game }) {
  const { spots } = useGameView(g);
  if (spots <= 0) return <Status tone="full">額滿可候補</Status>;
  if (spots === 1 || spots <= g.capacity / 4) return <Status tone="almost">快額滿</Status>;
  return null;
}

/** 球局票卡: carbon stub with the start time, venue / level / fee / seats on the right. `lg` is the detail page's header. */
export function GameTicket({ game: g, lg }: { game: Game; lg?: boolean }) {
  const { my, spots } = useGameView(g);
  const body = (
    <View style={[s.ticket, spots <= 0 && { opacity: 0.92 }]}>
      <View style={[s.stub, lg && { width: 104 }]}>
        <Text style={{ fontSize: 12, color: g.dayLabel === "今天" ? color.accent : color.onCarbonMuted, fontWeight: "700" }}>{g.dayLabel} {g.date}</Text>
        <Num style={{ fontSize: lg ? 34 : 28, color: "#fff", lineHeight: lg ? 38 : 32 }}>{g.startsAt}</Num>
        <Num style={{ fontSize: 14, color: color.onCarbonMuted }}>–{g.endsAt}</Num>
      </View>
      <View style={s.holes}>{Array.from({ length: 7 }, (_, i) => <View key={i} style={s.hole} />)}</View>
      <View style={{ flex: 1, padding: 12, gap: 8 }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "800", color: color.text }} numberOfLines={2}>{g.venue}</Text>
          <Text style={{ fontSize: 13, color: color.muted }}>{g.district}・{g.courtKind}</Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          <LevelChip min={g.levelMin} max={g.levelMax} />
          {g.beginnerFriendly && <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}><Icon name="sprout" size={12} tint={color.success} /><Text style={{ fontSize: 12, fontWeight: "700", color: color.success }}>新手友善</Text></View>}
          <GameStatus game={g} />
          {!lg && <Text style={{ marginLeft: "auto" }}><Text style={{ fontSize: 11, color: color.muted }}>每人 </Text><Num style={{ fontSize: 18 }}>NT${g.fee}</Num></Text>}
        </View>
        {!lg && <Seats game={g} />}
        {my && !lg && <Tag tone="accent">{my === "joined" ? "你已報名" : "你在候補"}</Tag>}
      </View>
    </View>
  );
  return lg ? body : <Link href={`/games/${g.id}`} asChild><Pressable>{body}</Pressable></Link>;
}

const s = StyleSheet.create({
  ticket: { flexDirection: "row", backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, overflow: "hidden" },
  stub: { width: 92, backgroundColor: color.carbon, paddingHorizontal: 10, paddingVertical: 12, gap: 2 },
  holes: { width: 10, backgroundColor: color.carbon, justifyContent: "space-evenly", alignItems: "flex-end" },
  hole: { width: 6, height: 6, borderRadius: 3, marginRight: -3, backgroundColor: color.bg },
});
