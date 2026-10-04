import { Text, View } from "react-native";
import type { Game } from "@pikyoo/core/types";
import { levelText, money } from "@pikyoo/core/format";
import { Card, Tag, s } from "./parts";

export function GameCard({ g }: { g: Game }) {
  const spots = g.capacity - g.participants.length;
  return (
    <Card href={`/games/${g.id}`}>
      <View style={s.row}>
        <Text style={[s.title, s.num]}>{g.dayLabel} {g.startsAt}</Text>
        <Tag strong={spots > 0}>{spots > 0 ? `缺 ${spots}` : "額滿可候補"}</Tag>
      </View>
      <Text style={s.body}>{g.venue}・{g.district}</Text>
      <Text style={s.muted}>程度 {levelText(g.levelMin, g.levelMax)}・每人 {money(g.fee)}{g.beginnerFriendly ? "・新手友善" : ""}</Text>
    </Card>
  );
}
