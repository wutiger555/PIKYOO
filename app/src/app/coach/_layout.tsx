import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useSession } from "@/data/session";
import { color } from "@/ui/theme";

/** 教練後台: 行事曆 · 學生 · 課程 · 教練頁 · 收款; 行事曆 carries the requests + questions badge, 收款 the reported payments. */
export default function CoachLayout() {
  const { requests, payments, questions, myCoach } = useSession();
  const today = requests.filter((r) => r.status === "pending").length + questions.filter((q) => q.coachId === myCoach?.id && !q.answer).length;
  const pay = payments.filter((p) => p.status === "reported").length;
  return (
    <NativeTabs tintColor={color.text}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>行事曆</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "calendar", selected: "calendar" }} />
        {today > 0 && <NativeTabs.Trigger.Badge>{String(today)}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="students">
        <NativeTabs.Trigger.Label>學生</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="lessons">
        <NativeTabs.Trigger.Label>課程</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "list.bullet.rectangle", selected: "list.bullet.rectangle.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>教練頁</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "person.text.rectangle", selected: "person.text.rectangle.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="payments">
        <NativeTabs.Trigger.Label>收款</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "creditcard", selected: "creditcard.fill" }} />
        {pay > 0 && <NativeTabs.Trigger.Badge>{String(pay)}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
