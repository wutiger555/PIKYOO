import * as WebBrowser from "expo-web-browser";
import { Pressable, Text } from "react-native";
import { isLive } from "@/data/catalog";
import { useSession } from "@/data/session";
import { Sheet } from "./Sheet";
import { Btn } from "./Btn";
import { color } from "./theme";

/** 用 LINE 登入／註冊 (website: LoginSheet). Live sign-in in the app comes with step 17; until then it sends people to the
 *  website, where the same account works. The demo signs in at once, like the demo website. */
export function LoginSheet({ reason, webPath = "/", onClose }: { reason: string; webPath?: string; onClose: () => void }) {
  const { signIn } = useSession();
  return (
    <Sheet title="登入 PIKYOO" onClose={onClose}>
      <Text style={{ fontSize: 16, color: color.text }}>{reason}</Text>
      {isLive ? (
        <>
          <Text style={{ fontSize: 15, color: color.muted, lineHeight: 22 }}>App 的 LINE／Apple 登入即將推出。現在可以先在網站用 LINE 登入，帳號之後在 App 也能用。</Text>
          <Btn kind="primary" label="到網站登入" onPress={() => { WebBrowser.openBrowserAsync(`https://pikyoo.vercel.app${webPath}`); onClose(); }} />
        </>
      ) : (
        <>
          <Btn kind="line" label="用 LINE 登入／註冊" onPress={() => { signIn(); onClose(); }} />
          <Text style={{ fontSize: 13, color: color.muted }}>示範版：按下就會以示範帳號登入。</Text>
        </>
      )}
      <Pressable onPress={onClose}><Text style={{ textAlign: "center", color: color.muted, padding: 8 }}>先不要</Text></Pressable>
    </Sheet>
  );
}
