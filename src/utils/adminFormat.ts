/** Palette stable par id (prestations / clients) — tons salon, pas néon. */
const PALETTE = [
  { bg: '#f3e4d8', border: '#c17f59', text: '#5c3a28' },
  { bg: '#e8eee8', border: '#6b8f71', text: '#2f4a35' },
  { bg: '#e8e4f0', border: '#7a6b9a', text: '#3a3150' },
  { bg: '#f0e6e8', border: '#a86b7a', text: '#523038' },
  { bg: '#e4eef0', border: '#5f8a95', text: '#2a4550' },
  { bg: '#f0ebe0', border: '#b0894a', text: '#5a4320' },
  { bg: '#ebe8e4', border: '#8a7a6b', text: '#3f3830' },
  { bg: '#e6f0ea', border: '#4f9a7e', text: '#214a3a' },
];

export function serviceColor(id: number | string | null | undefined) {
  const n = Math.abs(Number(id) || 0);
  return PALETTE[n % PALETTE.length];
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatTime(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatLongDate(isoOrDate: string | Date) {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate.includes('T') ? isoOrDate : `${isoOrDate}T12:00:00`) : isoOrDate;
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function toDateKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseLocalDate(key: string) {
  return new Date(`${key}T12:00:00`);
}

export function toLocalInput(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // lundi = 0
  x.setDate(x.getDate() - day);
  x.setHours(12, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function minutesSince(iso: string, dayStartHour = 8) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes() - dayStartHour * 60;
}

export function durationMinutes(start: string, end: string) {
  return Math.max(15, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
}

/** ISO week number (approx FR) */
export function isoWeekKey(d: Date) {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${String(week).padStart(2, '0')}-${tmp.getUTCFullYear()}`;
}
