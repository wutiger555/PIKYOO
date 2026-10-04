import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { levelText, money } from "@pikyoo/core/format";
import { useCatalog } from "@/data/catalog";
import { Page, WithCatalog } from "@/ui/Page";
import { Card, Heading, s } from "@/ui/parts";

export default function GamePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const g = useCatalog().catalog?.games.find((x) => x.id === id);
  if (!g) return <Page><WithCatalog>{() => <Text style={s.body}>找不到這個球局</Text>}</WithCatalog></Page>;
  return (
    <Page>
      <Text style={[{ fontSize: 26, fontWeight: "800" }, s.num]}>{g.dayLabel} {g.date} {g.startsAt}–{g.endsAt}</Text>
      <Text style={s.body}>{g.venue}・{g.courtKind}</Text>
      <Text style={s.muted}>{g.address}</Text>
      <Card>
        <Text style={s.body}>程度 {levelText(g.levelMin, g.levelMax)}・每人 {money(g.fee)}</Text>
        <Text style={s.body}>已報名 {g.participants.length}／{g.capacity}{g.waitlist ? `・候補 ${g.waitlist}` : ""}</Text>
        <Text style={s.muted}>團主 {g.host.name}・{g.host.summary}</Text>
      </Card>
      {!!g.notes && <><Heading>團主說明</Heading><Text style={s.body}>{g.notes}</Text></>}
    </Page>
  );
}
