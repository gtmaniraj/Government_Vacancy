export type SourceId = "psc" | "tsc" | "banks" | "ntc" | "nea";

export type VacancyStatus = "open" | "double" | "closed" | "notice";

export type Vacancy = {
  id: string;
  sourceId: SourceId;
  source: string;
  title: string;
  organization: string;
  post?: string;
  level?: string;
  openings?: number;
  code?: string;
  applications?: number;
  deadlineBs?: string;
  doubleDeadlineBs?: string;
  publishedLabel?: string;
  href: string;
  applyUrl?: string;
  pdfUrl?: string;
  kind: "vacancy" | "notice";
  status: VacancyStatus;
  daysLeft: number | null;
};

export type SourceHealth = {
  id: SourceId;
  name: string;
  homepage: string;
  ok: boolean;
  count: number;
  error?: string;
};

export type Board = {
  fetchedAt: string;
  todayBs: string;
  todayLabel: string;
  sources: SourceHealth[];
  items: Vacancy[];
};

export const SOURCE_FILTERS: { id: SourceId; label: string }[] = [
  { id: "psc", label: "Lok Sewa Aayog" },
  { id: "tsc", label: "Teachers Service Commission" },
  { id: "banks", label: "A-class banks" },
  { id: "ntc", label: "Nepal Telecom" },
  { id: "nea", label: "Nepal Electricity Authority" },
];
