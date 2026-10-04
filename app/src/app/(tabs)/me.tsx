import Constants from "expo-constants";
import { Text } from "react-native";
import { isLive } from "@/data/catalog";
import { Page } from "@/ui/Page";
import { Card, s } from "@/ui/parts";

/** 我的: sign-in (LINE + Apple) comes in step 17; for now it says this is the demo. */
export default function Me() {
  return (
    <Page title="我的">
      <Card>
        <Text style={s.title}>{isLive ? "登入即將推出" : "示範版"}</Text>
        <Text style={s.body}>{isLive ? "可以先看教練與球局。用 LINE 或 Apple 登入後，就能預約、報名，跟網站同一個帳號。" : "目前是示範資料，登入（LINE、Apple）會在下一步接上，跟網站同一個帳號。"}</Text>
      </Card>
      <Text style={[s.muted, { textAlign: "center" }]}>PIKYOO {Constants.expoConfig?.version}</Text>
    </Page>
  );
}
