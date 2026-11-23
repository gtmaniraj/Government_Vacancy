import NepaliDate from "nepali-date-converter";

const NEPALI_DIGITS: Record<string, string> = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

const BS_MONTHS: Record<string, number> = {
  बैशाख: 1,
  वैशाख: 1,
  जेठ: 2,
  जेष्ठ: 2,
  असार: 3,
  आषाढ: 3,
  साउन: 4,
  श्रावण: 4,
  सावन: 4,
  भदौ: 5,
  भाद्र: 5,
  असोज: 6,
  आश्विन: 6,
  अश्विन: 6,
  कात्तिक: 7,
  कार्तिक: 7,
  मंसिर: 8,
  मङ्सिर: 8,
  पुष: 9,
  पुस: 9,
  पौष: 9,
  माघ: 10,
  फागुन: 11,
  फाल्गुन: 11,
  चैत: 12,
  चैत्र: 12,
};

export function todayInNepal(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [year, month, day] = parts.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 6, 15));
}

export function todayBsIso(): string {
  return new NepaliDate(todayInNepal()).format("YYYY-MM-DD");
}

export function formatBs(iso: string): string {
  try {
    return new NepaliDate(iso).format("DD MMMM YYYY");
  } catch {
    return iso;
  }
}

export function daysFromToday(iso: string, todayIso: string): number | null {
  try {
    const from = new NepaliDate(todayIso).toJsDate().getTime();
    const to = new NepaliDate(iso).toJsDate().getTime();
    return Math.round((to - from) / 86_400_000);
  } catch {
    return null;
  }
}

export function asciiDigits(value: string): string {
  return value.replace(/[०-९]/g, (digit) => NEPALI_DIGITS[digit] ?? digit);
}

/** Parse labels like "५ मंसिर, २०८३" into YYYY-MM-DD. */
export function parseNepaliDateLabel(label: string): string | null {
  const clean = asciiDigits(label).replace(/\s+/g, " ").trim();
  const match = clean.match(/(\d{1,2})\s+([^\d,\s]+)\s*,?\s*(\d{4})/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = BS_MONTHS[match[2]];
  const year = Number(match[3]);
  if (!month || !year || !day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
