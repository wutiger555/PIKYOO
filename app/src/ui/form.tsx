import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View, type KeyboardTypeOptions } from "react-native";
import { LEVELS, levelText } from "@pikyoo/core/format";
import type { Level } from "@pikyoo/core/types";
import { Num } from "./badges";
import { Btn } from "./Btn";
import { Icon } from "./Icon";
import { Sheet } from "./Sheet";
import { color, levelColor, radius } from "./theme";

// Form controls for the console editors, each matched to what it edits: free text in a field, a few options in a
// segmented control, a long list behind a row that opens a checklist, times on the native wheel, money with ± steps.

export function Field({ label, value, onChange, multiline, keyboard, placeholder, hint, max }: {
  label?: string; value: string; onChange: (v: string) => void; multiline?: boolean; keyboard?: KeyboardTypeOptions; placeholder?: string; hint?: string; max?: number;
}) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={f.label}>{label}{max ? <Text style={{ fontWeight: "400", color: color.muted }}>　{value.length}/{max}</Text> : null}</Text> : null}
      <TextInput value={value} onChangeText={onChange} multiline={multiline} keyboardType={keyboard} placeholder={placeholder} placeholderTextColor={color.n500} maxLength={max}
        style={[f.input, multiline && { minHeight: 100, textAlignVertical: "top" }]} />
      {hint && <Text style={f.hint}>{hint}</Text>}
    </View>
  );
}

/** 2–4 short options side by side (iOS segmented control). */
export function Segmented<T extends string | number>({ label, value, options, onChange, format = String }: { label?: string; value: T; options: readonly T[]; onChange: (v: T) => void; format?: (v: T) => string }) {
  return (
    <View style={{ gap: 6 }}>
      {label && <Text style={f.label}>{label}</Text>}
      <View style={f.seg}>
        {options.map((o) => {
          const on = o === value;
          return (
            <Pressable key={String(o)} onPress={() => onChange(o)} accessibilityRole="radio" accessibilityState={{ checked: on }} style={[f.segOpt, on && f.segOn]}>
              <Text style={{ fontSize: 14, fontWeight: on ? "800" : "600", color: on ? color.text : color.n700 }}>{format(o)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** A settings-style row showing the current value; tapping opens a list to pick from. `multi` picks several. */
export function PickerRow({ label, values, options, onChange, multi, summary }: {
  label: string; values: string[]; options: readonly string[]; onChange: (v: string[]) => void; multi?: boolean; summary?: (v: string[]) => string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(values);
  const all = [...new Set([...options, ...values])];
  const text = values.length ? (summary ? summary(values) : values.join("、")) : "未設定";
  const pick = (o: string) => {
    if (!multi) { onChange([o]); setOpen(false); return; }
    setDraft((d) => (d.includes(o) ? d.filter((x) => x !== o) : [...d, o]));
  };
  return (
    <>
      <Pressable onPress={() => { setDraft(values); setOpen(true); }} style={f.row} accessibilityRole="button" accessibilityLabel={`${label}：${text}`}>
        <Text style={[f.label, { width: 84 }]}>{label}</Text>
        <Text style={{ flex: 1, fontSize: 15, color: values.length ? color.text : color.muted, textAlign: "right" }} numberOfLines={2}>{text}</Text>
        <Icon name="right" size={13} tint={color.muted} />
      </Pressable>
      {open && (
        <Sheet title={label} onClose={() => setOpen(false)} action={multi ? (
          <Pressable onPress={() => { onChange(draft); setOpen(false); }} hitSlop={8} style={f.done}><Text style={{ fontWeight: "800" }}>完成（{draft.length}）</Text></Pressable>
        ) : undefined}>
          {multi && all.length > 8 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {all.map((o) => {
                const on = draft.includes(o);
                return (
                  <Pressable key={o} onPress={() => pick(o)} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
                    style={[f.cell, on && { borderColor: color.text, backgroundColor: color.accentSoft }]}>
                    <View style={[f.box, on && { backgroundColor: color.accent, borderColor: color.text }]}>{on && <Icon name="check" size={12} />}</View>
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: on ? "700" : "400" }} numberOfLines={2}>{o}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : <View style={f.list}>
            {all.map((o, i) => {
              const on = multi ? draft.includes(o) : values.includes(o);
              return (
                <Pressable key={o} onPress={() => pick(o)} style={[f.listRow, i > 0 && { borderTopWidth: 1, borderTopColor: color.n100 }]} accessibilityRole={multi ? "checkbox" : "radio"} accessibilityState={{ checked: on }}>
                  <Text style={{ flex: 1, fontSize: 16, fontWeight: on ? "700" : "400" }}>{o}</Text>
                  {multi
                    ? <View style={[f.box, on && { backgroundColor: color.accent, borderColor: color.text }]}>{on && <Icon name="check" size={12} />}</View>
                    : on && <Icon name="check" size={16} />}
                </Pressable>
              );
            })}
          </View>}
        </Sheet>
      )}
    </>
  );
}

/** NT$ amounts: type the number, or nudge it with − / + in steps of `step`. */
export function MoneyInput({ label, value, onChange, step = 50 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={f.label}>{label}</Text>
      <View style={f.money}>
        <Pressable onPress={() => onChange(Math.max(0, value - step))} style={f.round} accessibilityLabel={`減 ${step}`}><Icon name="minus" size={14} /></Pressable>
        <Num style={{ fontSize: 18, color: color.muted }}>NT$</Num>
        <TextInput value={String(value)} keyboardType="number-pad" onChangeText={(v) => onChange(Number(v.replace(/\D/g, "").slice(0, 6)) || 0)} accessibilityLabel={label}
          style={{ flex: 1, fontFamily: "BarlowCondensed_600SemiBold", fontSize: 26, color: color.text, paddingVertical: 4 }} selectTextOnFocus />
        <Pressable onPress={() => onChange(value + step)} style={f.round} accessibilityLabel={`加 ${step}`}><Icon name="plus" size={14} /></Pressable>
      </View>
    </View>
  );
}

/** 授課程度 as one control: tap a step on the 7-step ladder to move the nearer end of the range there. */
export function LevelRange({ label, min, max, onChange }: { label: string; min: Level; max: Level; onChange: (min: Level, max: Level) => void }) {
  const tap = (i: Level) => {
    if (i < min) return onChange(i, max);
    if (i > max) return onChange(min, i);
    if (i - min <= max - i) return onChange(i, max);
    onChange(min, i);
  };
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={f.label}>{label}</Text>
        <Num style={{ fontSize: 20 }}>{levelText(min, max)}</Num>
      </View>
      <View style={{ flexDirection: "row", gap: 4, alignItems: "flex-end" }}>
        {LEVELS.map((l, i) => {
          const on = i >= min && i <= max;
          return (
            <Pressable key={l} onPress={() => tap(i as Level)} style={{ flex: 1, alignItems: "center", gap: 6 }} accessibilityLabel={l} accessibilityState={{ selected: on }}>
              <View style={{ width: "100%", height: 10 + i * 5, borderRadius: 4, backgroundColor: on ? levelColor[Math.max(i, 2)] : color.n100, borderWidth: on ? 0 : 1, borderColor: color.n200 }} />
              <Text style={{ fontSize: 12, fontWeight: on ? "800" : "500", color: on ? color.text : color.muted }}>{l}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={f.hint}>點階梯調整最低或最高程度</Text>
    </View>
  );
}

/** An on / off row (iOS switch). */
export function SwitchRow({ label, sub, value, onChange, first }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; first?: boolean }) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }, !first && { borderTopWidth: 1, borderTopColor: color.n100 }]}>
      <View style={{ flex: 1 }}><Text style={{ fontSize: 16, fontWeight: "700" }}>{label}</Text>{sub && <Text style={f.hint}>{sub}</Text>}</View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: color.accent700 }} />
    </View>
  );
}

/** Pick a start time on the native wheel (30-minute steps), as the website's <input type="time" step=1800>. */
export function TimeSheet({ title, taken, onAdd, onClose }: { title: string; taken: string[]; onAdd: (hhmm: string) => void; onClose: () => void }) {
  const [t, setT] = useState(() => { const d = new Date(); d.setHours(19, 0, 0, 0); return d; });
  const hhmm = `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  const dup = taken.includes(hhmm);
  return (
    <Sheet title={title} onClose={onClose}>
      <DateTimePicker value={t} mode="time" display="spinner" minuteInterval={30} locale="zh-TW" onChange={(_, d) => d && setT(d)} style={{ alignSelf: "stretch" }} />
      <Btn kind="primary" label={dup ? `${hhmm} 已經開放了` : `開放 ${hhmm}`} disabled={dup} onPress={() => { onAdd(hhmm); onClose(); }} />
    </Sheet>
  );
}

export function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text style={{ fontSize: 14 }}>{label}</Text>
      <Pressable disabled={value <= min} onPress={() => onChange(value - 1)} style={[f.round, value <= min && { opacity: 0.4 }]} accessibilityLabel={`${label}少一人`}><Icon name="minus" size={14} /></Pressable>
      <Num style={{ fontSize: 20, minWidth: 20, textAlign: "center" }}>{value}</Num>
      <Pressable disabled={value >= max} onPress={() => onChange(value + 1)} style={[f.round, value >= max && { opacity: 0.4 }]} accessibilityLabel={`${label}多一人`}><Icon name="plus" size={14} /></Pressable>
    </View>
  );
}

const f = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "700", color: color.n700 },
  hint: { fontSize: 13, color: color.muted, lineHeight: 19 },
  input: { borderWidth: 1, borderColor: color.n300, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: color.text, backgroundColor: color.surface },
  seg: { flexDirection: "row", backgroundColor: color.n100, borderRadius: radius.md, padding: 3 },
  segOpt: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 8 },
  segOn: { backgroundColor: color.surface, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderTopWidth: 1, borderTopColor: color.n100 },
  list: { borderRadius: radius.md, borderWidth: 1, borderColor: color.line, paddingHorizontal: 14 },
  listRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13 },
  done: { backgroundColor: color.accent, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  cell: { width: "48.5%", flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: color.line, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 12 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: color.n300, alignItems: "center", justifyContent: "center" },
  money: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: color.n300, borderRadius: radius.md, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: color.surface },
  round: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: color.n100 },
});
