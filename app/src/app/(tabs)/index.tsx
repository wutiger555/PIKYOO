import { Text } from "react-native";
import { demoGames } from "@pikyoo/core/data/games";
import { COACHES } from "@pikyoo/core/data/coaches";
import { GameCard } from "@/ui/GameCard";
import { Page } from "@/ui/Page";
import { Card, Heading, s } from "@/ui/parts";

/** 首頁: games you can join soon, and a way into the coaches (demo data for now, docs/APP.md §8 step 16). */
export default function Home() {
  const games = demoGames().slice(0, 4);
  return (
    <Page title="PIKYOO 匹友">
      <Text style={s.muted}>雙北匹克球：找課、找球局、找球場</Text>
      <Heading>這週可以打</Heading>
      {games.map((g) => <GameCard key={g.id} g={g} />)}
      <Heading>找教練</Heading>
      <Card href="/coaches">
        <Text style={s.title}>{COACHES.length} 位教練，看證照、價格與時段</Text>
        <Text style={s.muted}>從第一次拿拍到比賽都有</Text>
      </Card>
    </Page>
  );
}
