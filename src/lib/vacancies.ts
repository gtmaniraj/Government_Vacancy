export type SourceId =
  | "psc"
  | "ppsc"
  | "tsc"
  | "nrb"
  | "rbb"
  | "adbl"
  | "nbl"
  | "banks"
  | "ntc"
  | "nea";

export type VacancyStatus = "open" | "double" | "closed" | "notice";

export type PostCategory =
  | "it"
  | "teaching"
  | "medical"
  | "administration"
  | "law"
  | "accounts"
  | "engineering"
  | "agriculture"
  | "forestry"
  | "other";

export type Vacancy = {
  id: string;
  sourceId: SourceId;
  source: string;
  title: string;
  titleEn?: string;
  titleNp?: string;
  organization: string;
  post?: string;
  level?: string;
  openings?: number;
  code?: string;
  applications?: number;
  category?: PostCategory;
  province?: string;
  note?: string;
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
  { id: "ppsc", label: "Province PSC" },
  { id: "tsc", label: "Teachers" },
  { id: "nrb", label: "Nepal Rastra Bank" },
  { id: "rbb", label: "Rastriya Banijya Bank" },
  { id: "adbl", label: "ADBL" },
  { id: "nbl", label: "Nepal Bank" },
  { id: "banks", label: "Other A-class banks" },
  { id: "ntc", label: "Nepal Telecom" },
  { id: "nea", label: "Nepal Electricity Authority" },
];
