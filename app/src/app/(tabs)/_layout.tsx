import { NativeTabs } from "expo-router/unstable-native-tabs";
import { color } from "@/ui/theme";

// The same four tabs as the website's phone tab bar (web/src/components/pk/Shell.tsx).
export default function TabLayout() {
  return (
    <NativeTabs tintColor={color.text}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>首頁</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "safari", selected: "safari.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="coaches">
        <NativeTabs.Trigger.Label>找教練</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="figure.pickleball" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="lessons">
        <NativeTabs.Trigger.Label>我的課</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "calendar", selected: "calendar" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="me">
        <NativeTabs.Trigger.Label>我的</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
