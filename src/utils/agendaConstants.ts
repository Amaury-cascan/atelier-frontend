/** Constantes agenda admin */
export const PX_PER_MIN = 1.2;
export const SNAP_MIN = 15;

/** @deprecated Prefer globalOpenBounds() from openingHours */
export const DAY_START = 8;
/** @deprecated Prefer globalOpenBounds() from openingHours */
export const DAY_END = 20;

export function snapMinutes(mins: number) {
  return Math.round(mins / SNAP_MIN) * SNAP_MIN;
}

export function minsToLocalInput(dayKey: string, minsFromMidnight: number) {
  const h = Math.floor(minsFromMidnight / 60);
  const m = minsFromMidnight % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dayKey}T${pad(h)}:${pad(m)}`;
}

export function topFromAbsoluteMin(mins: number, startMin: number) {
  return Math.max(0, mins - startMin) * PX_PER_MIN;
}

export function absoluteMinFromTop(top: number, startMin: number) {
  return snapMinutes(startMin + top / PX_PER_MIN);
}
