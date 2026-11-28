import { useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Search } from "lucide-react";
import { NepalMap, type ProvinceId } from "@/components/nepal-map";
import { CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/categories";
import { refreshBoard } from "@/lib/board.functions";
import { formatBs } from "@/lib/bs";
import { matchSyllabus } from "@/lib/syllabus";
import type { Board, PostCategory, SourceId, Vacancy, VacancyStatus } from "@/lib/vacancies";
import { SOURCE_FILTERS } from "@/lib/vacancies";

type View = "all" | "open" | "closed" | "notices" | "posts";

const VIEWS: { id: View; label: string }[] = [
  { id: "open", label: "Accepting now" },
  { id: "closed", label: "Closed" },
  { id: "posts", label: "By post" },
  { id: "notices", label: "Notices" },
  { id: "all", label: "Everything" },
];

function statusLabel(item: Vacancy): string {
  if (item.status === "open") {
    if (item.daysLeft === 0) return "Closes today";
    if (item.daysLeft === 1) return "1 day left";
    if (item.daysLeft != null && item.daysLeft > 0) return `${item.daysLeft} days left`;
    return "Open";
  }
  if (item.status === "double") return "Double fee window";
  if (item.status === "closed") return "Applications closed";
  if (item.kind === "vacancy") return "Advertisement";
  return "Notice";
}

function statusTone(status: VacancyStatus, kind: Vacancy["kind"]): string {
  if (status === "open" || status === "double") return "bg-crimson text-card";
  if (status === "closed") return "bg-line text-muted";
  if (kind === "vacancy") return "bg-ink text-card";
  return "bg-line text-ink";
}

function isClosingSoon(item: Vacancy): boolean {
  return (
    (item.status === "open" || item.status === "double") &&
    item.daysLeft != null &&
    item.daysLeft <= 7
  );
}

function whenFetched(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kathmandu",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function applyLabel(url: string): string {
  if (/psc|ppsconline|psconline/i.test(url)) return "Apply on official portal";
  return "Apply on official site";
}

function englishTitle(item: Vacancy): string {
  return item.titleEn || item.title;
}

function searchBlob(item: Vacancy): string {
  return [
    item.title,
    item.titleEn,
    item.titleNp,
    item.organization,
    item.post,
    item.level,
    item.code,
    item.source,
    item.province,
    item.category ? CATEGORY_LABEL[item.category] : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function VacancyBoard({ initial }: { initial: Board }) {
  const [board, setBoard] = useState(initial);
  const [view, setView] = useState<View>("open");
  const [source, setSource] = useState<SourceId | "all">("all");
  const [category, setCategory] = useState<PostCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [visible, setVisible] = useState(12);
  const [soonOnly, setSoonOnly] = useState(false);
  const [province, setProvince] = useState<ProvinceId | "all">("all");

  const counts = useMemo(() => {
    const open = board.items.filter((item) => item.status === "open" || item.status === "double");
    const soon = open.filter(isClosingSoon);
    const closed = board.items.filter((item) => item.status === "closed");
    const notices = board.items.filter((item) => item.status === "notice");
    return { open: open.length, soon: soon.length, closed: closed.length, notices: notices.length };
  }, [board.items]);

  const provinceCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of board.items) {
      if (item.sourceId !== "ppsc" || !item.province) continue;
      map.set(item.province, (map.get(item.province) ?? 0) + 1);
    }
    return map;
  }, [board.items]);

  function inProvince(item: Vacancy): boolean {
    if (province === "all") return true;
    return item.sourceId === "ppsc" && item.province === province;
  }

  function matchesView(item: Vacancy): boolean {
    if (soonOnly && !isClosingSoon(item)) return false;
    if (view === "open" && item.status !== "open" && item.status !== "double") return false;
    if (view === "closed" && item.status !== "closed") return false;
    if (view === "notices" && item.status !== "notice") return false;
    if (view === "posts" && item.kind !== "vacancy") return false;
    return true;
  }

  const categoryCounts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const map = new Map<PostCategory, number>();
    for (const item of board.items) {
      if (source !== "all" && item.sourceId !== source) continue;
      if (!inProvince(item)) continue;
      if (!matchesView(item)) continue;
      if (needle && !searchBlob(item).includes(needle)) continue;
      const key = item.category ?? "other";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [board.items, query, source, view, soonOnly, province]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return board.items.filter((item) => {
      if (source !== "all" && item.sourceId !== source) return false;
      if (!inProvince(item)) return false;
      if (category !== "all" && item.category !== category) return false;
      if (!matchesView(item)) return false;
      if (!needle) return true;
      return searchBlob(item).includes(needle);
    });
  }, [board.items, category, query, source, view, soonOnly, province]);

  const page = shown.slice(0, visible);
  const grouped = view === "posts" || view === "closed";

  const groups = useMemo(() => {
    if (!grouped) return [];
    const buckets = new Map<PostCategory, Vacancy[]>();
    for (const item of page) {
      const key = item.category ?? "other";
      const list = buckets.get(key) ?? [];
      list.push(item);
      buckets.set(key, list);
    }
    return CATEGORY_ORDER.filter((id) => buckets.has(id)).map((id) => ({
      id,
      items: buckets.get(id) ?? [],
    }));
  }, [grouped, page]);

  function resetPage() {
    setVisible(12);
  }

  function pickView(next: View) {
    setView(next);
    setSoonOnly(false);
    resetPage();
  }

  async function onRefresh() {
    setPending(true);
    setRefreshError("");
    try {
      setBoard(await refreshBoard());
    } catch {
      setRefreshError("Could not refresh. Still showing the last copy.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-sm">
        <div className="h-1 bg-crimson" />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-crimson">Nepal vacancy desk</p>
            <p className="truncate font-display text-xl leading-tight sm:text-2xl">Gautam Maniraj</p>
          </div>
          <div className="shrink-0 rounded-full border border-line bg-card px-3 py-1.5 text-right">
            <p className="text-xs text-muted">Today</p>
            <p className="num text-sm font-semibold">{board.todayLabel}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="max-w-2xl">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">Open posts, in English.</h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Lok Sewa, province commissions, the teaching licence and A-class banks. The Nepali title
            stays under the English line. This desk does not take applications.
          </p>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Accepting applications"
            value={counts.open}
            active={view === "open" && !soonOnly}
            onClick={() => pickView("open")}
          />
          <Stat
            label="Closing within 7 days"
            value={counts.soon}
            alert
            active={soonOnly}
            onClick={() => {
              setView("open");
              setSoonOnly(true);
              resetPage();
            }}
          />
          <Stat
            label="Closed vacancies"
            value={counts.closed}
            active={view === "closed"}
            onClick={() => pickView("closed")}
          />
          <Stat
            label="Notices and updates"
            value={counts.notices}
            active={view === "notices"}
            onClick={() => pickView("notices")}
          />
        </section>

        <NepalMap
          selected={province}
          counts={provinceCounts}
          onSelect={(id) => {
            setProvince(id);
            resetPage();
          }}
        />

        <section className="mt-8 rounded-3xl border border-line bg-card p-3 shadow-(--shadow-rest) sm:p-4" id="board">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="chip-row -mx-1 flex gap-1 overflow-x-auto rounded-full bg-paper p-1"
              role="tablist"
              aria-label="What to show"
            >
              {VIEWS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={view === item.id && !soonOnly}
                  onClick={() => pickView(item.id)}
                  className={
                    view === item.id && !soonOnly
                      ? "min-h-11 shrink-0 rounded-full bg-ink px-4 text-sm font-medium text-card"
                      : "min-h-11 shrink-0 rounded-full px-4 text-sm font-medium text-ink"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={pending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-paper px-4 text-sm font-medium text-ink transition-opacity duration-150 disabled:opacity-60"
            >
              <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
              {pending ? "Updating" : "Refresh from source"}
            </button>
          </div>

          <label className="relative mt-3 block min-w-0">
            <span className="sr-only">Search posts and notices</span>
            <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetPage();
              }}
              placeholder="Search post, office, province, or advertisement number"
              className="min-h-11 w-full rounded-lg border border-line bg-paper pr-4 pl-10 text-base text-ink outline-none placeholder:text-muted focus:border-crimson"
            />
          </label>

          <div className="chip-row -mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1" aria-label="Post category">
            <Chip
              active={category === "all"}
              label="All posts"
              onClick={() => {
                setCategory("all");
                resetPage();
              }}
            />
            {CATEGORY_ORDER.filter((id) => (categoryCounts.get(id) ?? 0) > 0).map((id) => (
              <Chip
                key={id}
                active={category === id}
                label={`${CATEGORY_LABEL[id]} ${categoryCounts.get(id) ?? 0}`}
                onClick={() => {
                  setCategory(id);
                  resetPage();
                }}
              />
            ))}
          </div>

          <div className="chip-row -mx-3 mt-2 flex gap-2 overflow-x-auto px-3 pb-1" aria-label="Office">
            <Chip
              active={source === "all"}
              label="All offices"
              onClick={() => {
                setSource("all");
                resetPage();
              }}
            />
            {SOURCE_FILTERS.map((item) => (
              <Chip
                key={item.id}
                active={source === item.id}
                label={item.label}
                onClick={() => {
                  setSource(item.id);
                  resetPage();
                }}
              />
            ))}
          </div>

          <p className="mt-3 text-sm text-muted">
            <span className="num">{shown.length}</span> shown
            {soonOnly ? " · closing within 7 days" : ""}
            {view === "posts" && !soonOnly ? " · grouped by the kind of post" : ""}
            {view === "closed" ? " · closed posts grouped by category" : ""}
            {province !== "all" ? ` · ${province} Province PSC` : ""}
            {" · "}read {whenFetched(board.fetchedAt)} NPT
            {refreshError ? ` · ${refreshError}` : ""}
          </p>
        </section>

        {board.sources.some((item) => !item.ok) ? (
          <ul className="mt-4 space-y-2">
            {board.sources
              .filter((item) => !item.ok)
              .map((item) => (
                <li key={item.id} className="rounded-2xl border border-line bg-card px-4 py-3 text-sm">
                  {item.name} did not respond ({item.error}). Other offices are still listed.
                </li>
              ))}
          </ul>
        ) : null}

        {shown.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-line bg-card px-5 py-12 text-center">
            <p className="font-display text-2xl">Nothing matches</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              Closed bank advertisements are under Closed, grouped by the kind of post. Notices from
              the commissions are under Notices.
            </p>
          </div>
        ) : grouped ? (
          <div className="mt-6 flex flex-col gap-8">
            {groups.map((group) => (
              <section key={group.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-2xl">
                    {CATEGORY_LABEL[group.id]}
                    {view === "closed" ? " · closed" : ""}
                  </h2>
                  <p className="num text-sm text-muted">{group.items.length}</p>
                </div>
                <ul className="mt-3 flex flex-col gap-3">
                  {group.items.map((item) => (
                    <Row key={item.id} item={item} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {page.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </ul>
        )}

        {shown.length > page.length ? (
          <button
            type="button"
            onClick={() => setVisible((count) => count + 12)}
            className="mt-4 min-h-11 w-full rounded-full border border-line bg-card text-sm font-medium transition-colors duration-150 hover:border-ink"
          >
            Show more ({shown.length - page.length} left)
          </button>
        ) : null}

        <footer className="mt-12 border-t border-line py-8 text-sm leading-relaxed text-muted">
          <p>
            English lines are a reading aid. The Nepali title is the one the office published. Apply
            only on the linked official site, and check the PDF for seats, fees and age.
          </p>
          <p className="mt-3">
            Sources:{" "}
            {board.sources.map((item, index) => (
              <span key={item.id}>
                {index > 0 ? " · " : ""}
                <a className="font-medium text-ink underline-offset-2 hover:text-crimson hover:underline" href={item.homepage}>
                  {item.name}
                </a>{" "}
                <span className="num">({item.ok ? item.count : "unavailable"})</span>
              </span>
            ))}
          </p>
        </footer>
      </main>
    </div>
  );
}

function SyllabusBlock({ item }: { item: Vacancy }) {
  const syllabus = matchSyllabus(item);
  if (!syllabus) return null;
  return (
    <div className="mt-4 border-l-2 border-blush py-0.5 pl-3">
      <p className="text-xs font-semibold text-muted">Syllabus in English · {syllabus.publisher}</p>
      <ul className="mt-2 space-y-1 text-sm leading-relaxed">
        {syllabus.english.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {syllabus.papers.map((paper) => (
          <a
            key={`${paper.label}-${paper.url}`}
            href={paper.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center text-sm font-medium underline-offset-2 hover:text-crimson hover:underline"
          >
            {paper.label}
          </a>
        ))}
        <a
          href={syllabus.indexUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center text-sm font-medium text-crimson underline-offset-2 hover:underline"
        >
          Official syllabus list
        </a>
      </div>
    </div>
  );
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "num min-h-11 shrink-0 rounded-full bg-crimson px-4 text-sm font-medium text-card"
          : "num min-h-11 shrink-0 rounded-full border border-line bg-paper px-4 text-sm font-medium text-ink"
      }
    >
      {label}
    </button>
  );
}

function Stat({
  label,
  value,
  active,
  alert,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  alert?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "rounded-2xl border border-ink bg-ink px-4 py-4 text-left text-card"
          : "rounded-2xl border border-line bg-card px-4 py-4 text-left transition-colors duration-150 hover:border-ink"
      }
    >
      <p className={`num font-display text-4xl leading-none ${!active && alert ? "text-crimson" : ""}`}>{value}</p>
      <p className={`mt-2 text-sm ${active ? "text-card/80" : "text-muted"}`}>{label}</p>
    </button>
  );
}

function factRows(item: Vacancy): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (typeof item.openings === "number") rows.push({ label: "Openings", value: String(item.openings) });
  if (item.code) rows.push({ label: "Ad no.", value: item.code });
  if (item.deadlineBs) rows.push({ label: "Deadline", value: formatBs(item.deadlineBs) });
  if (item.doubleDeadlineBs) rows.push({ label: "Double fee", value: formatBs(item.doubleDeadlineBs) });
  if (item.publishedLabel && !item.deadlineBs) rows.push({ label: "Published", value: item.publishedLabel });
  if (typeof item.applications === "number" && item.applications > 0) {
    rows.push({ label: "Paid forms", value: String(item.applications) });
  }
  return rows;
}

function Row({ item }: { item: Vacancy }) {
  const english = englishTitle(item);
  const nepali = item.titleNp && item.titleNp !== english ? item.titleNp : null;
  const facts = factRows(item);
  const urgent = isClosingSoon(item);
  return (
    <li className="relative overflow-hidden rounded-3xl border border-line bg-card shadow-(--shadow-rest)">
      <span className={`absolute inset-y-0 left-0 w-1 ${urgent ? "bg-crimson" : "bg-line"}`} aria-hidden="true" />
      <div className="px-4 py-4 pl-5 sm:px-5 sm:pl-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status, item.kind)}`}>
            {statusLabel(item)}
          </span>
          {item.category ? (
            <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium">
              {CATEGORY_LABEL[item.category]}
            </span>
          ) : null}
          <span className="text-xs font-medium text-muted">{item.source}</span>
          {item.province ? <span className="text-xs text-muted">{item.province}</span> : null}
          {item.level ? <span className="text-xs text-muted">{item.level}</span> : null}
        </div>
        <h3 className="mt-2 font-display text-xl leading-snug">{english}</h3>
        {nepali ? <p className="mt-1 text-sm leading-relaxed">{nepali}</p> : null}
        <p className="mt-1 text-sm text-muted">{item.organization}</p>
        {item.note ? <p className="mt-2 text-sm leading-relaxed text-muted">{item.note}</p> : null}
        {facts.length > 0 ? (
          <dl className="mt-4 flex flex-wrap gap-2">
            {facts.map((fact) => (
              <div key={fact.label} className="min-w-28 rounded-lg border border-line bg-paper px-3 py-2">
                <dt className="text-xs text-muted">{fact.label}</dt>
                <dd className="num text-sm font-medium">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <SyllabusBlock item={item} />
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-crimson px-4 text-sm font-medium text-card transition-colors duration-150 hover:bg-crimson-deep"
          >
            Official notice
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
          {item.applyUrl ? (
            <a
              href={item.applyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-medium hover:border-ink"
            >
              {applyLabel(item.applyUrl)}
            </a>
          ) : null}
          {item.pdfUrl ? (
            <a
              href={item.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-medium hover:border-ink"
            >
              Download PDF
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}
