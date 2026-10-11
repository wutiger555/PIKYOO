import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useSession } from "@/data/session";
import { color } from "@/ui/theme";

/** 教練後台, three tabs (2026-10-11 simplification): 今天 (lessons plus every to-do: requests, 學生說付好了, questions),
 *  學生, 我的頁面 (the public page, with 課程與時段 and 收款紀錄 one tap in). */
export default function CoachLayout() {
  const { requests, payments, questions, myCoach } = useSession();
  const todo = requests.filter((r) => r.status === "pending").length + payments.filter((p) => p.status === "reported").length
    + questions.filter((q) => q.coachId === myCoach?.id && !q.answer).length;
  return (
    <NativeTabs tintColor={color.text}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>今天</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "calendar", selected: "calendar" }} />
        {todo > 0 && <NativeTabs.Trigger.Badge>{String(todo)}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="students">
        <NativeTabs.Trigger.Label>學生</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>我的頁面</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "person.text.rectangle", selected: "person.text.rectangle.fill" }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
