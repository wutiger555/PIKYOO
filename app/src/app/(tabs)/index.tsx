import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Page, WithCatalog } from "@/ui/Page";
import { Card, Heading, s as parts } from "@/ui/parts";
import { Icon, type IconName } from "@/ui/Icon";
import { GameTicket } from "@/ui/Ticket";
import { color, radius } from "@/ui/theme";

/** 首頁: the three ways in (課、球局、球場) and the games you can join soon. */
export default function Home() {
  return (
    <Page title="PIKYOO 匹友">
      <Text style={parts.muted}>雙北匹克球：找課、找球局、找球場</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Entry href="/coaches" icon="cap" label="找教練" />
        <Entry href="/games" icon="users" label="找球局" />
        <Entry href="/courts" icon="pin" label="找球場" />
      </View>
      <WithCatalog>{(c) => (
        <>
          <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
            <Heading>這週可以打</Heading>
            <Link href="/games" asChild><Pressable><Text style={{ fontWeight: "700", textDecorationLine: "underline" }}>看全部 {c.games.length} 局</Text></Pressable></Link>
          </View>
          {!c.games.length && <Text style={parts.muted}>這兩週還沒有球局。</Text>}
          {c.games.slice(0, 4).map((g) => <GameTicket key={g.id} game={g} />)}
          <Heading>找教練</Heading>
          <Card href="/coaches">
            <Text style={parts.title}>{c.coaches.length} 位教練，看證照、價格與時段</Text>
            <Text style={parts.muted}>從第一次拿拍到比賽都有</Text>
          </Card>
        </>
      )}</WithCatalog>
    </Page>
  );
}

function Entry({ href, icon, label }: { href: "/coaches" | "/games" | "/courts"; icon: IconName; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable style={st.entry}><View style={st.ic}><Icon name={icon} size={20} /></View><Text style={{ fontSize: 15, fontWeight: "800" }}>{label}</Text></Pressable>
    </Link>
  );
}
const st = StyleSheet.create({
  entry: { flex: 1, alignItems: "center", gap: 8, paddingVertical: 14, backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line },
  ic: { width: 40, height: 40, borderRadius: 20, backgroundColor: color.accent, alignItems: "center", justifyContent: "center" },
});
