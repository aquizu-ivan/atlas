export function parseDateParts(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) {
    return null;
  }
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function buildSlots({ year, month, day }) {
  const startHour = 9;
  const endHour = 17;
  const intervalMinutes = 30;
  const startMs = Date.UTC(year, month - 1, day, startHour, 0, 0, 0);
  const totalMinutes = (endHour - startHour) * 60;
  const slots = [];
  for (let offset = 0; offset < totalMinutes; offset += intervalMinutes) {
    const date = new Date(startMs + offset * 60 * 1000);
    slots.push({ startAt: date.toISOString() });
  }
  return slots;
}

export function datePartsFromIso(iso) {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return {
    year: parsed.getUTCFullYear(),
    month: parsed.getUTCMonth() + 1,
    day: parsed.getUTCDate(),
  };
}

export function formatDateParts({ year, month, day }) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function slotMatches(startAtIso, slots) {
  const normalized = new Date(startAtIso).toISOString();
  return slots.some((slot) => slot.startAt === normalized);
}
