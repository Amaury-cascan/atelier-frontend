/**
 * Horaires d'ouverture du salon — source unique (alignée réservation / HomeView).
 * Ouvert sur place : lundi, vendredi, samedi.
 * Mardi & jeudi : prestations extérieures (pas de créneaux salon).
 * Dimanche & mercredi : fermé.
 */

export type TimeRange = { startMin: number; endMin: number };

export type DaySchedule = {
  jsDay: number;
  label: string;
  closed: boolean;
  special: boolean;
  ranges: TimeRange[];
  display: string;
};

const hm = (h: number, m = 0) => h * 60 + m;

export const WEEKLY_SCHEDULE: DaySchedule[] = [
  { jsDay: 0, label: 'Dimanche', closed: true, special: false, ranges: [], display: 'Fermé' },
  {
    jsDay: 1,
    label: 'Lundi',
    closed: false,
    special: false,
    ranges: [{ startMin: hm(9, 30), endMin: hm(16, 0) }, { startMin: hm(18, 30), endMin: hm(20, 0) }],
    display: '09h30 – 16h00 · 18h30 – 20h00',
  },
  {
    jsDay: 2,
    label: 'Mardi',
    closed: true,
    special: true,
    ranges: [],
    display: 'Prestation extérieure',
  },
  { jsDay: 3, label: 'Mercredi', closed: true, special: false, ranges: [], display: 'Fermé' },
  {
    jsDay: 4,
    label: 'Jeudi',
    closed: true,
    special: true,
    ranges: [],
    display: 'Prestation extérieure',
  },
  {
    jsDay: 5,
    label: 'Vendredi',
    closed: false,
    special: false,
    ranges: [{ startMin: hm(9, 30), endMin: hm(20, 0) }],
    display: '09h30 – 20h00',
  },
  {
    jsDay: 6,
    label: 'Samedi',
    closed: false,
    special: false,
    ranges: [{ startMin: hm(9, 30), endMin: hm(20, 0) }],
    display: '09h30 – 20h00',
  },
];

export function scheduleForJsDay(jsDay: number): DaySchedule {
  return WEEKLY_SCHEDULE.find((d) => d.jsDay === jsDay) ?? WEEKLY_SCHEDULE[0];
}

export function scheduleForDate(date: Date): DaySchedule {
  return scheduleForJsDay(date.getDay());
}

export function isOpenDate(date: Date): boolean {
  return !scheduleForDate(date).closed;
}

export function isOpenDayKey(dateKey: string): boolean {
  return isOpenDate(new Date(`${dateKey}T12:00:00`));
}

/** Bornes globales pour positionner les événements (plus tôt / plus tard des jours ouverts). */
export function globalOpenBounds(): { startMin: number; endMin: number } {
  let startMin = 24 * 60;
  let endMin = 0;
  for (const day of WEEKLY_SCHEDULE) {
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
  const d = new Date(dateIso);
  const sched = scheduleForDate(d);
  if (sched.closed) return false;
  const m = d.getHours() * 60 + d.getMinutes();
  return sched.ranges.some((r) => m >= r.startMin && m < r.endMin);
}

/** Créneaux horaires (pas de 30 min) pour un jour ouvert. */
export function openSlotsForDate(date: Date, stepMin = 30): number[] {
  const sched = scheduleForDate(date);
  if (sched.closed) return [];
  const slots: number[] = [];
  for (const r of sched.ranges) {
    for (let t = r.startMin; t < r.endMin; t += stepMin) {
      slots.push(t);
    }
  }
  return slots;
}

/** Heures "pleines" à afficher sur une timeline (labels), dérivées des plages. */
export function hourMarksForDate(date: Date): number[] {
  const slots = openSlotsForDate(date, 60);
  // aussi inclure le début exact si :30
  const sched = scheduleForDate(date);
  const marks = new Set<number>();
  for (const r of sched.ranges) {
    marks.add(Math.floor(r.startMin / 60));
    let h = Math.floor(r.startMin / 60);
    const endH = Math.ceil(r.endMin / 60);
    while (h < endH) {
      marks.add(h);
      h += 1;
    }
  }
  for (const s of slots) marks.add(Math.floor(s / 60));
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
  for (let i = 0; i < 14; i++) {
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
