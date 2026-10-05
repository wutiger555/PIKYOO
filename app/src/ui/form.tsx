import { Pressable, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";
import { Chip } from "./badges";
import { c } from "./console";
import { Icon } from "./Icon";
import { color } from "./theme";

// Small form controls for the console editors.

export function Field({ label, value, onChange, multiline, keyboard, placeholder, hint, max }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; keyboard?: KeyboardTypeOptions; placeholder?: string; hint?: string; max?: number;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={c.label}>{label}{max ? <Text style={{ fontWeight: "400", color: color.muted }}>（{value.length}/{max}）</Text> : null}</Text>
      <TextInput value={value} onChangeText={onChange} multiline={multiline} keyboardType={keyboard} placeholder={placeholder} placeholderTextColor={color.n500} maxLength={max}
        style={[c.input, multiline && { minHeight: 100, textAlignVertical: "top" }]} />
      {hint && <Text style={c.hint}>{hint}</Text>}
    </View>
  );
}

/** Pick one of a few options, shown as chips (in place of the website's <select>). */
export function Choice<T extends string | number>({ label, value, options, onChange, format = String }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void; format?: (v: T) => string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={c.label}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{options.map((o) => <Chip key={String(o)} on={o === value} onPress={() => onChange(o)}>{format(o)}</Chip>)}</View>
    </View>
  );
}

export function Multi({ label, values, options, onChange }: { label: string; values: string[]; options: readonly string[]; onChange: (v: string[]) => void }) {
  const all = [...new Set([...values, ...options])];
  return (
    <View style={{ gap: 6 }}>
      <Text style={c.label}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {all.map((o) => <Chip key={o} on={values.includes(o)} onPress={() => onChange(values.includes(o) ? values.filter((x) => x !== o) : [...values, o])}>{o}</Chip>)}
      </View>
    </View>
  );
}

export function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const b = { width: 32, height: 32, borderRadius: 16, alignItems: "center" as const, justifyContent: "center" as const, backgroundColor: color.n100 };
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text style={{ fontSize: 14 }}>{label}</Text>
      <Pressable disabled={value <= min} onPress={() => onChange(value - 1)} style={[b, value <= min && { opacity: 0.4 }]} accessibilityLabel={`${label}少一人`}><Icon name="minus" size={14} /></Pressable>
      <Text style={{ fontSize: 17, fontWeight: "800", minWidth: 20, textAlign: "center" }}>{value}</Text>
      <Pressable disabled={value >= max} onPress={() => onChange(value + 1)} style={[b, value >= max && { opacity: 0.4 }]} accessibilityLabel={`${label}多一人`}><Icon name="plus" size={14} /></Pressable>
    </View>
  );
}
