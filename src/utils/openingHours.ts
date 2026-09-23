/**
 * Horaires d'ouverture — helpers purs.
 * Données injectées via setScheduleSnapshot() (API /api/schedule).
 * Fallback = grille historique tant que l'API n'a pas répondu.
 */

export type TimeRange = { startMin: number; endMin: number };
export type DayKind = 'open' | 'closed' | 'external';

export type DaySchedule = {
  jsDay: number;
  label: string;
  closed: boolean;
  special: boolean;
  kind: DayKind;
  ranges: TimeRange[];
  bookableRanges: TimeRange[];
  display: string;
  source: 'weekly' | 'exception' | 'fallback';
};

export type WeeklyDayPayload = {
  weekday: number;
  kind: DayKind;
  ranges: TimeRange[];
  label: string;
};

export type ScheduleVersionPayload = {
  id: number;
  effectiveFrom: string;
  name: string | null;
  weekly: WeeklyDayPayload[];
};

export type ScheduleExceptionPayload = {
  id: number;
  date: string;
  kind: DayKind;
  ranges: TimeRange[];
  label: string;
};

export type BlockedSlotPayload = {
  id: number;
  start: string;
  end: string;
  reason: string | null;
};

export type ScheduleSnapshot = {
  versions: ScheduleVersionPayload[];
  weekly: WeeklyDayPayload[];
  exceptions: ScheduleExceptionPayload[];
  blockedSlots: BlockedSlotPayload[];
};

const hm = (h: number, m = 0) => h * 60 + m;

const DAY_LABELS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

/** Fallback = horaires historiques du salon (avant chargement API). */
export const FALLBACK_WEEKLY: WeeklyDayPayload[] = [
  { weekday: 0, kind: 'closed', ranges: [], label: 'Fermé' },
  {
    weekday: 1,
    kind: 'open',
    ranges: [{ startMin: hm(9, 30), endMin: hm(16, 0) }, { startMin: hm(18, 30), endMin: hm(20, 0) }],
    label: '09h30 – 16h00 · 18h30 – 20h00',
  },
  { weekday: 2, kind: 'external', ranges: [], label: 'Prestation extérieure' },
  { weekday: 3, kind: 'closed', ranges: [], label: 'Fermé' },
  { weekday: 4, kind: 'external', ranges: [], label: 'Prestation extérieure' },
  { weekday: 5, kind: 'open', ranges: [{ startMin: hm(9, 30), endMin: hm(20, 0) }], label: '09h30 – 20h00' },
  { weekday: 6, kind: 'open', ranges: [{ startMin: hm(9, 30), endMin: hm(20, 0) }], label: '09h30 – 20h00' },
];

/** @deprecated Prefer snapshot.weekly — conservé pour imports existants */
export const WEEKLY_SCHEDULE: DaySchedule[] = FALLBACK_WEEKLY.map(weeklyToDaySchedule);

let snapshot: ScheduleSnapshot = {
  versions: [],
  weekly: FALLBACK_WEEKLY,
  exceptions: [],
  blockedSlots: [],
};

export function setScheduleSnapshot(data: Partial<ScheduleSnapshot> | null | undefined): void {
  snapshot = {
    versions: data?.versions?.length ? data.versions : [],
    weekly: data?.weekly?.length ? data.weekly : FALLBACK_WEEKLY,
    exceptions: data?.exceptions ?? [],
    blockedSlots: data?.blockedSlots ?? [],
  };
}

export function getScheduleSnapshot(): ScheduleSnapshot {
  return snapshot;
}

function weeklyToDaySchedule(day: WeeklyDayPayload): DaySchedule {
  return {
    jsDay: day.weekday,
    label: DAY_LABELS[day.weekday] ?? `Jour ${day.weekday}`,
    closed: day.kind !== 'open',
    special: day.kind === 'external',
    kind: day.kind,
    ranges: day.kind === 'open' ? day.ranges : [],
    bookableRanges: day.kind === 'open' ? day.ranges : [],
    display: day.label || defaultLabel(day.kind, day.ranges),
    source: 'fallback',
  };
}

function defaultLabel(kind: DayKind, ranges: TimeRange[]): string {
  if (kind === 'open' && ranges.length) {
    return ranges
      .map((r) => `${formatMin(r.startMin).replace(':', 'h')} – ${formatMin(r.endMin).replace(':', 'h')}`)
      .join(' · ');
  }
  if (kind === 'external') return 'Prestation extérieure';
  return 'Fermé';
}

function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function versionForDate(date: Date): ScheduleVersionPayload | null {
  const key = dateKey(date);
  const applicable = snapshot.versions
    .filter((v) => v.effectiveFrom <= key)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom));
  return applicable[0] ?? null;
}

function subtractRanges(sources: TimeRange[], holes: TimeRange[]): TimeRange[] {
  let result = [...sources];
  for (const hole of holes) {
    const next: TimeRange[] = [];
    for (const range of result) {
      if (hole.startMin >= range.endMin || hole.endMin <= range.startMin) {
        next.push(range);
        continue;
      }
      if (hole.startMin > range.startMin) {
        next.push({ startMin: range.startMin, endMin: Math.min(hole.startMin, range.endMin) });
      }
      if (hole.endMin < range.endMin) {
        next.push({ startMin: Math.max(hole.endMin, range.startMin), endMin: range.endMin });
      }
    }
    result = next.filter((r) => r.endMin > r.startMin);
  }
  return result;
}

function blocksForDate(date: Date): TimeRange[] {
  const key = dateKey(date);
  const ranges: TimeRange[] = [];
  for (const block of snapshot.blockedSlots) {
    const start = block.start.slice(0, 10);
    const end = block.end.slice(0, 10);
    if (end < key || start > key) continue;

    let startMin = 0;
    let endMin = 24 * 60;
    if (start === key) {
      const [hh, mm] = block.start.slice(11, 16).split(':').map(Number);
      startMin = hh * 60 + mm;
    }
    if (end === key) {
      const [hh, mm] = block.end.slice(11, 16).split(':').map(Number);
      endMin = hh * 60 + mm;
    }
    if (endMin > startMin) ranges.push({ startMin, endMin });
  }
  return ranges;
}

export function scheduleForJsDay(jsDay: number): DaySchedule {
  const weekly = snapshot.weekly.length ? snapshot.weekly : FALLBACK_WEEKLY;
  const day = weekly.find((d) => d.weekday === jsDay) ?? FALLBACK_WEEKLY[0];
  return { ...weeklyToDaySchedule(day), source: snapshot.versions.length ? 'weekly' : 'fallback' };
}

export function scheduleForDate(date: Date): DaySchedule {
  const key = dateKey(date);
  const jsDay = date.getDay();
  const exception = snapshot.exceptions.find((e) => e.date === key);

  let kind: DayKind;
  let ranges: TimeRange[];
  let display: string;
  let source: DaySchedule['source'];

  if (exception) {
    kind = exception.kind;
    ranges = kind === 'open' ? exception.ranges : [];
    display = exception.label || defaultLabel(kind, ranges);
    source = 'exception';
  } else {
    const version = versionForDate(date);
    const weekly = version?.weekly ?? snapshot.weekly ?? FALLBACK_WEEKLY;
    const day = weekly.find((d) => d.weekday === jsDay) ?? FALLBACK_WEEKLY.find((d) => d.weekday === jsDay)!;
    kind = day.kind;
    ranges = kind === 'open' ? day.ranges : [];
    display = day.label || defaultLabel(kind, ranges);
    source = version ? 'weekly' : 'fallback';
  }

  const bookableRanges = kind === 'open' ? subtractRanges(ranges, blocksForDate(date)) : [];

  return {
    jsDay,
    label: DAY_LABELS[jsDay],
    closed: kind !== 'open',
    special: kind === 'external',
    kind,
    ranges,
    bookableRanges,
    display,
    source,
  };
}

export function isOpenDate(date: Date): boolean {
  return !scheduleForDate(date).closed;
}

export function isOpenDayKey(dateKeyStr: string): boolean {
  return isOpenDate(new Date(`${dateKeyStr}T12:00:00`));
}

export function globalOpenBounds(): { startMin: number; endMin: number } {
  let startMin = 24 * 60;
  let endMin = 0;
  const sources = snapshot.versions.length
    ? snapshot.versions.flatMap((v) => v.weekly)
    : snapshot.weekly;
  for (const day of sources) {
    if (day.kind !== 'open') continue;
    for (const r of day.ranges) {
      startMin = Math.min(startMin, r.startMin);
      endMin = Math.max(endMin, r.endMin);
    }
  }
  return { startMin: startMin === 24 * 60 ? hm(9, 30) : startMin, endMin: endMin || hm(20, 0) };
}

export function minutesOfDate(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function isWithinOpening(dateIso: string): boolean {
  const d = new Date(dateIso.includes('T') ? dateIso : dateIso.replace(' ', 'T'));
  const sched = scheduleForDate(d);
  if (sched.closed) return false;
  const m = d.getHours() * 60 + d.getMinutes();
  return sched.bookableRanges.some((r) => m >= r.startMin && m < r.endMin);
}

export function openSlotsForDate(date: Date, stepMin = 30): number[] {
  const sched = scheduleForDate(date);
  if (sched.closed) return [];
  const slots: number[] = [];
  for (const r of sched.bookableRanges) {
    for (let t = r.startMin; t < r.endMin; t += stepMin) {
      slots.push(t);
    }
  }
  return slots;
}

export function hourMarksForDate(date: Date): number[] {
  const sched = scheduleForDate(date);
  const marks = new Set<number>();
  for (const r of sched.bookableRanges.length ? sched.bookableRanges : sched.ranges) {
    marks.add(Math.floor(r.startMin / 60));
    let h = Math.floor(r.startMin / 60);
    const endH = Math.ceil(r.endMin / 60);
    while (h < endH) {
      marks.add(h);
      h += 1;
    }
  }
  return [...marks].sort((a, b) => a - b);
}

export function formatMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function nextOpenDate(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  for (let i = 0; i < 60; i++) {
    if (isOpenDate(d)) return d;
    d.setDate(d.getDate() + 1);
  }
  return from;
}

export function openDaysInWeek(weekStart: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    d.setHours(12, 0, 0, 0);
    if (isOpenDate(d)) days.push(d);
  }
  return days;
}

export function openDaysInMonth(year: number, monthIndex: number): Date[] {
  const days: Date[] = [];
  const d = new Date(year, monthIndex, 1, 12, 0, 0, 0);
  while (d.getMonth() === monthIndex) {
    if (isOpenDate(d)) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

/** Créneaux de début pour une prestation (durée) sur les plages bookables. */
export function bookableSlotStarts(date: Date, durationMin: number, stepMin = 30): number[] {
  const sched = scheduleForDate(date);
  if (sched.closed || durationMin < 1) return [];
  const starts: number[] = [];
  for (const r of sched.bookableRanges) {
    for (let t = r.startMin; t + durationMin <= r.endMin; t += stepMin) {
      starts.push(t);
    }
  }
  return starts;
}
