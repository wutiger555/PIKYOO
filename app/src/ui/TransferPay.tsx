import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library/legacy";
import { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";
import { money } from "@pikyoo/core/format";
import { twqrTransfer } from "@pikyoo/core/twqr";
import { Num } from "./badges";
import { Btn } from "./Btn";
import { Icon } from "./Icon";
import { color, radius } from "./theme";
import { toast } from "./Toast";

/** 銀行轉帳 in two steps (website: TransferPay, docs/PAYMENTS.md §1.5): ① transfer — save the TWQR code and scan it
 *  from the photo library in any bank app (the student can't scan their own screen), or by hand with copy buttons;
 *  ② report with the bank app's screenshot or the last five digits (either is enough). The money goes to the coach. */
export function TransferPay({ bank, account, name, amount, onReport }: { bank: string; account: string; name: string; amount: number; onReport: (last5: string, proof: string | null) => void }) {
  const [last5, setLast5] = useState("");
  const [proof, setProof] = useState<string | null>(null);
  // the latest photo is usually the bank app's 轉帳成功 screen, so the library opens straight away
  const pickProof = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (!r.canceled && r.assets[0]) setProof(r.assets[0].uri);
  };
  const shot = useRef<View>(null);
  const code = twqrTransfer({ bank, account, amount });
  const copy = async (text: string, msg: string) => { await Clipboard.setStringAsync(text); toast(msg); };
  const save = async () => {
    const { granted } = await MediaLibrary.requestPermissionsAsync(true);
    if (!granted) return Alert.alert("需要照片權限", "請到 iPhone 設定 → Expo Go → 照片 打開「加入照片」，或改用下面的手動轉帳。");
    await MediaLibrary.saveToLibraryAsync(await captureRef(shot, { format: "png", quality: 1 }));
    toast("已存到相簿", "打開銀行 App →「掃描」→ 從相簿選這張");
  };
  const step = (n: number, title: string) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <View style={s.n}><Text style={{ fontSize: 13, fontWeight: "800" }}>{n}</Text></View><Text style={{ fontSize: 16, fontWeight: "800" }}>{title}</Text>
    </View>
  );
  return (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 10 }}>
      {step(1, code ? "用銀行 App 掃碼轉帳" : "轉帳到教練的帳戶")}
      {code && (
        <>
          <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
            {/* captured as the saved image: white margin and the amount, so it still makes sense in the photo library */}
            <View ref={shot} collapsable={false} style={s.qr}>
              <QRCode value={code} size={120} ecl="M" />
              <Text style={{ fontSize: 11, color: color.n700, marginTop: 4 }}>{money(amount)}・PIKYOO</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 14, lineHeight: 21, color: color.n700 }}>
              存到相簿後，打開你的銀行 App →「掃描」→ 從相簿選這張，帳號和金額會自動帶入。
              <Text style={{ fontSize: 12, color: color.muted }}>{"\n"}有些銀行只帶入帳號，金額請輸入 {amount}。</Text>
            </Text>
          </View>
          <Btn kind="primary" icon="image" label="存 QR 到相簿" onPress={save} />
          <Text style={{ fontSize: 13, fontWeight: "700", color: color.muted, marginTop: 4 }}>不能掃？手動轉帳</Text>
        </>
      )}
        <Text style={s.kv}>銀行　{bank}</Text>
        <Row label="帳號" value={account} onCopy={() => copy(account.replace(/\D/g, ""), "已複製帳號")} />
        <Text style={s.kv}>戶名　{name}</Text>
        <Row label="金額" value={money(amount)} onCopy={() => copy(String(amount), "已複製金額")} />
      </View>
      <View style={[{ gap: 8 }, s.split]}>
        {step(2, "轉好了，回報給教練")}
        <Text style={{ fontSize: 13, color: color.muted }}>附上銀行 App 的轉帳成功畫面，或填轉出帳號末五碼，擇一就可以。</Text>
        {proof ? (
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
            <Image source={{ uri: proof }} style={{ width: 90, height: 150, borderRadius: radius.md, borderWidth: 1, borderColor: color.line }} contentFit="cover" accessibilityLabel="轉帳截圖預覽" />
            <Pressable onPress={pickProof} hitSlop={8}><Text style={{ fontSize: 14, fontWeight: "700", textDecorationLine: "underline" }}>換一張</Text></Pressable>
          </View>
        ) : (
          <Btn icon="image" label="附上轉帳截圖" onPress={pickProof} />
        )}
        <Text style={{ fontSize: 13, color: color.muted }}>轉出帳號末五碼{proof ? "（選填）" : ""}</Text>
        <TextInput value={last5} onChangeText={(t) => setLast5(t.replace(/\D/g, "").slice(0, 5))} keyboardType="number-pad" style={s.input} placeholder="12345" placeholderTextColor={color.n500} />
        <Btn kind="primary" label="我已轉帳" disabled={!(proof || last5.length === 5) || (last5.length > 0 && last5.length !== 5)} onPress={() => onReport(last5, proof)} />
      </View>
    </View>
  );
}

function Row({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Text style={s.kv}>{label}　<Num style={{ fontSize: 17 }}>{value}</Num></Text>
      <Pressable onPress={onCopy} hitSlop={8} style={s.copy} accessibilityLabel={`複製${label}`}><Icon name="copy" size={13} /><Text style={{ fontSize: 13, fontWeight: "700" }}>複製</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  n: { width: 22, height: 22, borderRadius: 11, backgroundColor: color.accent, alignItems: "center", justifyContent: "center" },
  qr: { backgroundColor: "#fff", padding: 10, borderRadius: radius.md, borderWidth: 1, borderColor: color.line, alignItems: "center" },
  split: { borderTopWidth: 1, borderTopColor: color.line, paddingTop: 14 },
  kv: { fontSize: 15, color: color.text },
  copy: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: color.n300, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  input: { borderWidth: 1, borderColor: color.n300, borderRadius: radius.md, padding: 12, fontSize: 20, letterSpacing: 4, color: color.text },
});
