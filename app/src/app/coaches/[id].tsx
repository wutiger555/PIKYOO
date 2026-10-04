import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { getCoach } from "@pikyoo/core/data/coaches";
import { levelText, money } from "@pikyoo/core/format";
import { Page } from "@/ui/Page";
import { Card, Heading, Tag, s } from "@/ui/parts";
import { photo } from "@/ui/theme";

/** 教練頁: what a visitor sees on the website (CLAUDE.md "Visitors see only the basics"); booking comes with sign-in. */
export default function CoachPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = getCoach(id);
  if (!c) return <Page><Text style={s.body}>找不到這位教練</Text></Page>;
  const cover = c.profile.photos[0];
  return (
    <Page>
      <Stack.Screen options={{ title: c.name }} />
      {cover && <Image source={photo(cover.src)} style={{ width: "100%", aspectRatio: 4 / 3, borderRadius: 16 }} contentFit="cover" accessibilityLabel={cover.alt} />}
      {cover && <Tag>示意照</Tag>}
      <Text style={{ fontSize: 26, fontWeight: "800" }}>{c.name}</Text>
      <Text style={s.body}>{c.tagline}</Text>
      <View style={[s.row, { flexWrap: "wrap" }]}>
        {c.creds.map((x) => <Tag key={x.issuer + x.level} strong={x.verified}>{x.issuer} {x.level}</Tag>)}
      </View>
      <Text style={s.muted}>{c.areas.join("・")}・程度 {levelText(c.levelMin, c.levelMax)}・教學 {c.years} 年</Text>
      <Heading>課程方案</Heading>
      {c.profile.plans.map((p) => (
        <Card key={p.id}>
          <View style={s.row}><Text style={[s.title, { flex: 1 }]}>{p.name}</Text><Text style={[s.title, s.num]}>{money(p.price)}{p.unit}</Text></View>
          <Text style={s.muted}>{p.durationMin} 分鐘・{p.size}{p.note ? `・${p.note}` : ""}</Text>
        </Card>
      ))}
      <Heading>關於教練</Heading>
      <Text style={s.body}>{c.profile.bio}</Text>
    </Page>
  );
}
