import Constants from "expo-constants";
import { Text } from "react-native";
import { Page } from "@/ui/Page";
import { Card, s } from "@/ui/parts";

/** 我的: sign-in (LINE + Apple) comes in step 17; for now it says this is the demo. */
export default function Me() {
  return (
    <Page title="我的">
      <Card>
        <Text style={s.title}>示範版</Text>
        <Text style={s.body}>目前是示範資料，登入（LINE、Apple）會在下一步接上，跟網站同一個帳號。</Text>
      </Card>
      <Text style={[s.muted, { textAlign: "center" }]}>PIKYOO {Constants.expoConfig?.version}</Text>
    </Page>
  );
}
