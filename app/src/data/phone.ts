import * as Calendar from "expo-calendar/legacy";
import * as Notifications from "expo-notifications";
import type { CoachLesson } from "@pikyoo/core/data/schedule";

// The coach's phone: lessons into the phone's calendar, and local reminders (docs/APP.md §4, coach calendar).
// Live lessons later come from the database; a subscribable calendar link (ICS) is the second batch.

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

/** Now as HH:MM on the phone's clock (Hermes' toTimeString isn't HH:MM-first). */
export const nowHHMM = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

/** The lesson's start / end as phone-local dates (the phone is in Taipei). */
export function lessonDates(l: Pick<CoachLesson, "offset" | "start" | "end">) {
  const at = (hhmm: string) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + l.offset);
    d.setHours(Number(hhmm.slice(0, 2)), Number(hhmm.slice(3, 5)));
    return d;
  };
  return { start: at(l.start), end: at(l.end) };
}

const title = (l: CoachLesson, names: string) => `PIKYOO｜${l.plan}・${names}`;
const place = (l: CoachLesson) => [l.venue, l.court].filter(Boolean).join(" ");

/** One lesson: the system's own add-event sheet, so no permission prompt is needed. */
export async function addLessonToCalendar(l: CoachLesson, names: string) {
  const { start, end } = lessonDates(l);
  const r = await Calendar.createEventInCalendarAsync({ title: title(l, names), startDate: start, endDate: end, location: place(l), notes: l.prep || undefined });
  return r.action === "saved";
}

/** Every upcoming lesson straight into the default calendar, each with a 1-hour alarm. */
export async function addAllToCalendar(ls: { lesson: CoachLesson; names: string }[]) {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== "granted") return -1;
  const cal = await Calendar.getDefaultCalendarAsync();
  for (const { lesson, names } of ls) {
    const { start, end } = lessonDates(lesson);
    await Calendar.createEventAsync(cal.id, { title: title(lesson, names), startDate: start, endDate: end, location: place(lesson), notes: lesson.prep || undefined, alarms: [{ relativeOffset: -60 }] });
  }
  return ls.length;
}

async function allowed() {
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export type ReminderPrefs = { before: number | null; nightly: boolean; courtBooking: boolean };

/** Replaces all PIKYOO reminders with the coach's choice: before each lesson, 21:00 tomorrow's schedule, Monday court booking. */
export async function scheduleReminders(prefs: ReminderPrefs, upcoming: { lesson: CoachLesson; names: string }[]) {
  if (!(await allowed())) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = Date.now();
  if (prefs.before != null) {
    for (const { lesson, names } of upcoming) {
      const at = lessonDates(lesson).start.getTime() - prefs.before * 60e3;
      if (at <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title: `${prefs.before >= 60 ? `${prefs.before / 60} 小時` : `${prefs.before} 分鐘`}後上課：${lesson.plan}`, body: `${lesson.start} ${place(lesson)}・${names}${lesson.prep ? `\n${lesson.prep}` : ""}` },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at) },
      });
    }
  }
  if (prefs.nightly) {
    await Notifications.scheduleNotificationAsync({
      content: { title: "明天的課表", body: "打開 PIKYOO 看明天要上的課與備註" },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 21, minute: 0 },
    });
  }
  if (prefs.courtBooking) {
    await Notifications.scheduleNotificationAsync({
      content: { title: "公立球場開放預約了", body: "記得幫下週的課訂場地" },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 2, hour: 0, minute: 0 },
    });
  }
  return true;
}

/** Shows what a reminder looks like, 5 seconds from now (for demos). */
export async function sendTestReminder(lesson: CoachLesson | undefined, names: string) {
  if (!(await allowed())) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: lesson ? `1 小時後上課：${lesson.plan}` : "PIKYOO 提醒", body: lesson ? `${lesson.start} ${place(lesson)}・${names}${lesson.prep ? `\n${lesson.prep}` : ""}` : "這是一則測試提醒" },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
  });
  return true;
}
