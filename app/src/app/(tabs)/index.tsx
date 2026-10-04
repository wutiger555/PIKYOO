import { Text } from "react-native";
import { GameCard } from "@/ui/GameCard";
import { Page, WithCatalog } from "@/ui/Page";
import { Card, Heading, s } from "@/ui/parts";

/** 首頁: games you can join soon, and a way into the coaches. */
export default function Home() {
  return (
    <Page title="PIKYOO 匹友">
      <Text style={s.muted}>雙北匹克球：找課、找球局、找球場</Text>
      <WithCatalog>{(c) => (
        <>
          <Heading>這週可以打</Heading>
          {!c.games.length && <Text style={s.muted}>這兩週還沒有球局。</Text>}
          {c.games.slice(0, 6).map((g) => <GameCard key={g.id} g={g} />)}
          <Heading>找教練</Heading>
          <Card href="/coaches">
            <Text style={s.title}>{c.coaches.length} 位教練，看證照、價格與時段</Text>
            <Text style={s.muted}>從第一次拿拍到比賽都有</Text>
          </Card>
        </>
      )}</WithCatalog>
    </Page>
  );
}
