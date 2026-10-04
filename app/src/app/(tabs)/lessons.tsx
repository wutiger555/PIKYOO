import { Text } from "react-native";
import { lessons } from "@pikyoo/core/data/games";
import { money } from "@pikyoo/core/format";
import { Page } from "@/ui/Page";
import { Card, s } from "@/ui/parts";

export default function Lessons() {
  return (
    <Page title="我的課">
      {lessons().map((l) => (
        <Card key={l.id} href={`/coaches/${l.coachId}`}>
          <Text style={[s.muted, s.num]}>{l.when}</Text>
          <Text style={s.title}>{l.title}</Text>
          <Text style={s.muted}>{l.coach}・{l.where}・{money(l.price)}</Text>
        </Card>
      ))}
    </Page>
  );
}
