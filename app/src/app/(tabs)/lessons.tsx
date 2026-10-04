import { Text } from "react-native";
import { lessons } from "@pikyoo/core/data/games";
import { money } from "@pikyoo/core/format";
import { isLive } from "@/data/catalog";
import { Page } from "@/ui/Page";
import { Card, s } from "@/ui/parts";

/** 我的課: your bookings need sign-in (step 17); the demo shows its sample lessons. */
export default function Lessons() {
  return (
    <Page title="我的課">
      {isLive ? (
        <Card>
          <Text style={s.title}>登入後就看得到你的課</Text>
          <Text style={s.muted}>預約、付款狀態、上課提醒都會在這裡。App 登入即將推出，現在可以先在網站 pikyoo.vercel.app 預約。</Text>
        </Card>
      ) : lessons().map((l) => (
        <Card key={l.id} href={`/coaches/${l.coachId}`}>
          <Text style={[s.muted, s.num]}>{l.when}</Text>
          <Text style={s.title}>{l.title}</Text>
          <Text style={s.muted}>{l.coach}・{l.where}・{money(l.price)}</Text>
        </Card>
      ))}
    </Page>
  );
}
