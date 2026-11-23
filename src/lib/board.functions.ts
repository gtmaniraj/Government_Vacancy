import { createServerFn } from "@tanstack/react-start";
import { daysFromToday, formatBs, todayBsIso } from "@/lib/bs";
import type { Board, SourceHealth, SourceId, Vacancy, VacancyStatus } from "@/lib/vacancies";

const UA = "GautamManirajVacancyDesk/1.0 (+https://gautammaniraj.com.np)";
const TTL_MS = 15 * 60 * 1000;

type Cache = { at: number; data: Board };
let cache: Cache | null = null;

type PscAd = {
  organizationName?: string;
  className?: string;
  post?: string;
  totalOpenings?: number;
  advertisementCode?: string;
  singlePaymentLastDate?: string;
  doublePaymentLastDate?: string;
  paidApplications?: number;
};

type PscHighlight = {
  urltype?: string;
  title?: string;
  title_np?: string;
  new_url?: string;
  udate?: string;
};

function vacancyStatus(
  kind: Vacancy["kind"],
  deadlineBs: string | undefined,
  doubleDeadlineBs: string | undefined,
  today: string,
): { status: VacancyStatus; daysLeft: number | null } {
  if (kind === "notice" || !deadlineBs) {
    return { status: "notice", daysLeft: deadlineBs ? daysFromToday(deadlineBs, today) : null };
  }
  if (deadlineBs >= today) {
    return { status: "open", daysLeft: daysFromToday(deadlineBs, today) };
  }
  if (doubleDeadlineBs && doubleDeadlineBs >= today) {
    return { status: "double", daysLeft: daysFromToday(doubleDeadlineBs, today) };
  }
  return { status: "closed", daysLeft: daysFromToday(deadlineBs, today) };
}

function kindFromTitle(title: string): Vacancy["kind"] {
  return /विज्ञापन|भर्ना|vacancy|advertisement/i.test(title) ? "vacancy" : "notice";
}

function pscHref(item: PscHighlight): string {
  const slug = item.new_url ?? "";
  switch (item.urltype) {
    case "1":
      return `https://psc.gov.np/file/${slug}`;
    case "2":
      return `https://psc.gov.np/category/advertisement/${slug}`;
    case "3":
      return `https://psc.gov.np/category/exam_center/${slug}`;
    case "4":
      return `https://psc.gov.np/category/recommendation/${slug}`;
    case "5":
      return `https://psc.gov.np/category/written_result/${slug}`;
    default:
      return "https://psc.gov.np/";
  }
}

async function getText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { Accept: "text/html,application/json", "User-Agent": UA },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": UA,
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as T;
}

function decodeHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPscAds(today: string): Promise<Vacancy[]> {
  const header = await getJson<{
    data?: { fiscalyear?: { id: number }[] };
  }>("https://psc.gov.np/front/header");
  const fiscalId = header.data?.fiscalyear?.[0]?.id;
  if (!fiscalId) throw new Error("Fiscal year missing");

  const pageUrl = (page: number) =>
    `https://psc.gov.np/front/branch-details/advertisement?branch_id=&fiscal_year_id=${fiscalId}&per_page=50&current_page=${page}`;

  type Page = {
    data?: {
      data?: { totalPages?: number; content?: PscAd[] };
    };
  };

  const first = await getJson<Page>(pageUrl(0));
  const totalPages = Math.min(first.data?.data?.totalPages ?? 1, 4);
  const rows = [...(first.data?.data?.content ?? [])];
  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => getJson<Page>(pageUrl(index + 1))),
    );
    for (const page of rest) rows.push(...(page.data?.data?.content ?? []));
  }

  return rows.map((row, index) => {
    const deadlineBs = row.singlePaymentLastDate || undefined;
    const doubleDeadlineBs = row.doublePaymentLastDate || undefined;
    const title = row.post?.trim() || "Untitled post";
    const timing = vacancyStatus("vacancy", deadlineBs, doubleDeadlineBs, today);
    return {
      id: `psc-ad-${row.advertisementCode ?? index}-${index}`,
      sourceId: "psc" as const,
      source: "Lok Sewa Aayog",
      title,
      organization: row.organizationName?.trim() || "Public Service Commission",
      post: title,
      level: row.className?.trim() || undefined,
      openings: typeof row.totalOpenings === "number" ? row.totalOpenings : undefined,
      code: row.advertisementCode?.trim() || undefined,
      applications: typeof row.paidApplications === "number" ? row.paidApplications : undefined,
      deadlineBs,
      doubleDeadlineBs,
      href: "https://psc.gov.np/category/advertisement/all",
      applyUrl: "https://psconline1.psc.gov.np",
      kind: "vacancy" as const,
      status: timing.status,
      daysLeft: timing.daysLeft,
    };
  });
}

async function fetchPscHighlights(today: string): Promise<Vacancy[]> {
  const payload = await getJson<{ data?: { highlights?: PscHighlight[] } }>(
    "https://psc.gov.np/front/highlight",
  );
  const highlights = payload.data?.highlights ?? [];
  return highlights
    .filter((item) => item.title_np || item.title)
    .map((item, index) => {
      const title = (item.title_np || item.title || "Notice").trim();
      const kind = kindFromTitle(title);
      const timing = vacancyStatus(kind, undefined, undefined, today);
      return {
        id: `psc-hl-${item.new_url ?? index}`,
        sourceId: "psc" as const,
        source: "Lok Sewa Aayog",
        title,
        organization: "Public Service Commission",
        publishedLabel: item.udate || undefined,
        href: pscHref(item),
        kind,
        status: timing.status,
        daysLeft: timing.daysLeft,
      };
    });
}

export function parseTscHtml(html: string): Vacancy[] {
  const dated = new Map<string, string>();
  const datedPattern =
    /<h3 class="card__title">\s*<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]{0,240}?<div class="date">([^<]+)<\/div>/g;
  for (const match of html.matchAll(datedPattern)) {
    const href = match[1].trim();
    const label = decodeHtml(match[3]);
    if (href && label) dated.set(href, label);
  }

  const cards: Vacancy[] = [];
  const seen = new Set<string>();
  const chunks = html.split('class="grid__card');
  for (const chunk of chunks) {
    const link = chunk.match(/<a href="([^"]+)" class="card__group">/);
    const titleMatch = chunk.match(/<h3 class="card__title"><span>([\s\S]*?)<\/span><\/h3>/);
    if (!link || !titleMatch) continue;
    const path = link[1].trim();
    if (!path.startsWith("/content/")) continue;
    const title = decodeHtml(titleMatch[1]);
    if (!title || seen.has(path)) continue;
    seen.add(path);
    const pdf = chunk.match(/href="(https:\/\/giwmscdnone\.gov\.np\/media\/[^"]+)"/);
    const label = dated.get(path);
    const kind = kindFromTitle(title);
    cards.push({
      id: `tsc-${path}`,
      sourceId: "tsc",
      source: "Teachers Service Commission",
      title,
      organization: "शिक्षक सेवा आयोग",
      publishedLabel: label || undefined,
      href: `https://tsc.gov.np${path}`,
      pdfUrl: pdf?.[1],
      kind,
      status: "notice",
      daysLeft: null,
    });
  }

  for (const [path, label] of dated) {
    if (seen.has(path) || !path.startsWith("/content/")) continue;
    const titleMatch = html.match(
      new RegExp(
        `<a href="${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>([\\s\\S]*?)<\\/a>`,
      ),
    );
    const title = titleMatch ? decodeHtml(titleMatch[1]) : "Notice";
    const kind = kindFromTitle(title);
    cards.push({
      id: `tsc-${path}`,
      sourceId: "tsc",
      source: "Teachers Service Commission",
      title,
      organization: "शिक्षक सेवा आयोग",
      publishedLabel: label,
      href: path.startsWith("http") ? path : `https://tsc.gov.np${path}`,
      kind,
      status: "notice",
      daysLeft: null,
    });
  }

  return cards;
}

async function fetchTsc(): Promise<Vacancy[]> {
  const html = await getText("https://tsc.gov.np/");
  const items = parseTscHtml(html);
  if (items.length === 0) throw new Error("No notices found");
  return items;
}

function rank(item: Vacancy): number {
  if (item.kind === "vacancy" && item.status === "open") return 0;
  if (item.kind === "vacancy" && item.status === "double") return 1;
  if (item.kind === "notice") return 2;
  return 3;
}

function sortItems(items: Vacancy[]): Vacancy[] {
  return [...items].sort((a, b) => {
    const byRank = rank(a) - rank(b);
    if (byRank !== 0) return byRank;
    if (a.status === "open" || a.status === "double") {
      return (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999);
    }
    const aDate = a.publishedLabel ?? a.deadlineBs ?? "";
    const bDate = b.publishedLabel ?? b.deadlineBs ?? "";
    return bDate.localeCompare(aDate);
  });
}

async function attempt(
  id: SourceId,
  name: string,
  homepage: string,
  run: () => Promise<Vacancy[]>,
): Promise<{ health: SourceHealth; items: Vacancy[] }> {
  try {
    const items = await run();
    return { health: { id, name, homepage, ok: true, count: items.length }, items };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach the site";
    return {
      health: { id, name, homepage, ok: false, count: 0, error: message },
      items: [],
    };
  }
}

export async function loadBoard(fresh: boolean): Promise<Board> {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.data;

  const todayBs = todayBsIso();
  const [pscAds, pscNotes, tsc] = await Promise.all([
    attempt("psc", "Lok Sewa Aayog", "https://psc.gov.np", () => fetchPscAds(todayBs)),
    attempt("psc", "Lok Sewa Aayog", "https://psc.gov.np", () => fetchPscHighlights(todayBs)),
    attempt("tsc", "Teachers Service Commission", "https://tsc.gov.np", () => fetchTsc()),
  ]);

  const pscCount = pscAds.health.count + pscNotes.health.count;
  const pscOk = pscAds.health.ok || pscNotes.health.ok;
  const pscError = [pscAds.health.error, pscNotes.health.error].filter(Boolean).join("; ");

  const sources: SourceHealth[] = [
    {
      id: "psc",
      name: "Lok Sewa Aayog",
      homepage: "https://psc.gov.np",
      ok: pscOk,
      count: pscCount,
      error: pscOk ? undefined : pscError || "Could not reach psc.gov.np",
    },
    tsc.health,
  ];

  const board: Board = {
    fetchedAt: new Date().toISOString(),
    todayBs,
    todayLabel: formatBs(todayBs),
    sources,
    items: sortItems([...pscAds.items, ...pscNotes.items, ...tsc.items]),
  };

  if (sources.some((source) => source.ok)) {
    cache = { at: Date.now(), data: board };
  }
  return board;
}

export const getBoard = createServerFn({ method: "GET" }).handler(async () => loadBoard(false));

export const refreshBoard = createServerFn({ method: "POST" }).handler(async () => loadBoard(true));
