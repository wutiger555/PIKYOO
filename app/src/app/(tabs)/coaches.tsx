import { Image } from "expo-image";
import { Text, View } from "react-native";
import { COACHES, isCertified } from "@pikyoo/core/data/coaches";
import { levelText, money } from "@pikyoo/core/format";
import { Page } from "@/ui/Page";
import { Card, Tag, s } from "@/ui/parts";
import { photo } from "@/ui/theme";

export default function Coaches() {
  return (
    <Page title="找教練">
      {COACHES.map((c) => (
        <Card key={c.id} href={`/coaches/${c.id}`} style={{ flexDirection: "row", gap: 12 }}>
          {c.profile.photos[0] && <Image source={photo(c.profile.photos[0].src)} style={{ width: 72, height: 72, borderRadius: 12 }} contentFit="cover" />}
          <View style={{ flex: 1, gap: 4 }}>
            <View style={s.row}><Text style={s.title}>{c.name}</Text>{isCertified(c) && <Tag strong>認證教練</Tag>}</View>
            <Text style={s.muted} numberOfLines={2}>{c.tagline}</Text>
            <Text style={[s.muted, s.num]}>{c.areas.join("・")}・{levelText(c.levelMin, c.levelMax)}・{money(c.priceFrom)} 起</Text>
          </View>
        </Card>
      ))}
    </Page>
  );
}
