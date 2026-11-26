import { useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Search } from "lucide-react";
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

export function VacancyBoard({ initial }: { initial: Board }) {
  const [board, setBoard] = useState(initial);
  const [view, setView] = useState<View>("open");
  const [source, setSource] = useState<SourceId | "all">("all");
  const [category, setCategory] = useState<PostCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [visible, setVisible] = useState(12);

  const counts = useMemo(() => {
    const open = board.items.filter((item) => item.status === "open" || item.status === "double");
    const soon = open.filter((item) => item.daysLeft != null && item.daysLeft <= 7);
    const closed = board.items.filter((item) => item.status === "closed");
    const notices = board.items.filter((item) => item.status === "notice");
    return { open: open.length, soon: soon.length, closed: closed.length, notices: notices.length };
  }, [board.items]);

  const categoryCounts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const map = new Map<PostCategory, number>();
    for (const item of board.items) {
      if (source !== "all" && item.sourceId !== source) continue;
      if (view === "open" && item.status !== "open" && item.status !== "double") continue;
      if (view === "closed" && item.status !== "closed") continue;
      if (view === "notices" && item.status !== "notice") continue;
      if (view === "posts" && item.kind !== "vacancy") continue;
      if (needle) {
        const blob = [item.title, item.titleEn, item.titleNp, item.organization, item.post, item.code, item.source]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!blob.includes(needle)) continue;
      }
      const key = item.category ?? "other";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [board.items, query, source, view]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return board.items.filter((item) => {
      if (source !== "all" && item.sourceId !== source) return false;
      if (category !== "all" && item.category !== category) return false;
      if (view === "open" && item.status !== "open" && item.status !== "double") return false;
      if (view === "closed" && item.status !== "closed") return false;
      if (view === "notices" && item.status !== "notice") return false;
      if (view === "posts" && item.kind !== "vacancy") return false;
      if (!needle) return true;
      const blob = [
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
      return blob.includes(needle);
    });
  }, [board.items, category, query, source, view]);

  const page = shown.slice(0, visible);

  const groups = useMemo(() => {
    if (view !== "posts" && view !== "closed") return [];
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
  }, [page, view]);

  function resetPage() {
    setVisible(12);
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
      <div className="h-1 bg-crimson" />
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-5">
          <div>
            <p className="text-sm font-semibold text-crimson">Nepal vacancy desk</p>
            <p className="font-display text-3xl leading-tight">Gautam Maniraj</p>
            <p className="text-sm text-muted">Lok Sewa, province PSCs, teachers and A-class banks</p>
          </div>
          <p className="text-sm text-muted">
            Today <span className="font-medium text-ink">{board.todayLabel}</span>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="max-w-3xl">
          <h1 className="font-display text-4xl leading-tight">
            Posts by service, in English, with the Nepali title kept underneath.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            Nepal Rastra Bank, Rastriya Banijya Bank, Agricultural Development Bank and Nepal Bank
            are listed post by post. Closed advertisements sit in their own list, still sorted by the
            kind of post. Each card carries an English reading of the official syllabus.
          </p>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Accepting applications" value={counts.open} />
          <Stat label="Closing within 7 days" value={counts.soon} />
          <Stat label="Closed vacancies" value={counts.closed} />
          <Stat label="Notices and updates" value={counts.notices} />
        </section>

        <section className="mt-8 flex flex-col gap-3" id="board">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="What to show">
              {VIEWS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={view === item.id}
                  onClick={() => {
                    setView(item.id);
                    resetPage();
                  }}
                  className={
                    view === item.id
                      ? "min-h-11 rounded-full bg-ink px-4 text-sm font-medium text-card"
                      : "min-h-11 rounded-full border border-line bg-card px-4 text-sm font-medium text-ink"
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
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-medium text-ink disabled:opacity-60"
            >
              <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
              {pending ? "Updating" : "Refresh from source"}
            </button>
          </div>

          <div className="chip-row -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Post category">
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
                label={`${CATEGORY_LABEL[id]}${categoryCounts.get(id) ? ` ${categoryCounts.get(id)}` : ""}`}
                onClick={() => {
                  setCategory(id);
                  resetPage();
                }}
              />
            ))}
          </div>

          <div className="chip-row -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Office">
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

          <label className="relative min-w-0">
            <span className="sr-only">Search posts and notices</span>
            <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetPage();
              }}
              placeholder="Search post, office, province, or advertisement number"
              className="min-h-11 w-full rounded-2xl border border-line bg-card pr-4 pl-10 text-base text-ink outline-none focus:border-crimson"
            />
          </label>

          <p className="text-sm text-muted">
            {shown.length} shown · read {whenFetched(board.fetchedAt)} NPT
            {view === "posts" ? " · grouped by the kind of post" : ""}
            {view === "closed" ? " · closed posts grouped by category" : ""}
            {refreshError ? ` · ${refreshError}` : ""}
          </p>
        </section>

        {board.sources.some((item) => !item.ok) ? (
          <ul className="mt-4 space-y-2">
            {board.sources
              .filter((item) => !item.ok)
              .map((item) => (
                <li key={item.id} className="rounded-2xl border border-line bg-card px-4 py-3 text-sm text-ink">
                  {item.name} did not respond ({item.error}). Other offices are still listed.
                </li>
              ))}
          </ul>
        ) : null}

        {shown.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-line bg-card px-5 py-10 text-center">
            <p className="font-display text-2xl">Nothing matches</p>
            <p className="mt-2 text-sm text-muted">
              Closed bank advertisements are under Closed, grouped by the kind of post. Notices from the commissions are under Notices.
            </p>
          </div>
        ) : view === "posts" || view === "closed" ? (
          <div className="mt-4 flex flex-col gap-8">
            {groups.map((group) => (
              <section key={group.id}>
                <h2 className="font-display text-2xl">
                  {CATEGORY_LABEL[group.id]}
                  {view === "closed" ? " · closed" : ""}
                </h2>
                <ul className="mt-3 flex flex-col gap-3">
                  {group.items.map((item) => (
                    <Row key={item.id} item={item} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {page.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </ul>
        )}

        {shown.length > page.length ? (
          <button
            type="button"
            onClick={() => setVisible((count) => count + 12)}
            className="mt-4 min-h-11 w-full rounded-full border border-line bg-card text-sm font-medium text-ink"
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
                <a className="font-medium text-crimson underline-offset-2 hover:underline" href={item.homepage}>
                  {item.name}
                </a>{" "}
                ({item.ok ? `${item.count}` : "unavailable"})
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
    <div className="mt-3 rounded-xl bg-paper px-3 py-3">
      <p className="text-sm font-medium text-ink">Syllabus in English · {syllabus.publisher}</p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-ink">
        {syllabus.english.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        {syllabus.papers.map((paper) => (
          <a
            key={`${paper.label}-${paper.url}`}
            href={paper.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-medium text-ink"
          >
            {paper.label}
          </a>
        ))}
        <a
          href={syllabus.indexUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-medium text-crimson"
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
          ? "min-h-11 shrink-0 rounded-full bg-crimson px-4 text-sm font-medium text-card"
          : "min-h-11 shrink-0 rounded-full border border-line bg-card px-4 text-sm font-medium text-ink"
      }
    >
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-card px-4 py-4">
      <p className="font-display text-4xl leading-none">{value}</p>
      <p className="mt-2 text-sm text-muted">{label}</p>
    </div>
  );
}

function Row({ item }: { item: Vacancy }) {
  const english = englishTitle(item);
  const nepali = item.titleNp && item.titleNp !== english ? item.titleNp : null;
  return (
    <li className="rounded-2xl border border-line bg-card px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status, item.kind)}`}>
          {statusLabel(item)}
        </span>
        {item.category ? (
          <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink">
            {CATEGORY_LABEL[item.category]}
          </span>
        ) : null}
        <span className="text-xs font-medium text-muted">{item.source}</span>
        {item.province ? <span className="text-xs text-muted">{item.province}</span> : null}
        {item.level ? <span className="text-xs text-muted">{item.level}</span> : null}
      </div>
      <h3 className="mt-2 font-display text-xl leading-snug">{english}</h3>
      {nepali ? <p className="mt-1 text-sm leading-relaxed text-ink">{nepali}</p> : null}
      <p className="mt-1 text-sm text-muted">{item.organization}</p>
      {item.note ? <p className="mt-2 text-sm leading-relaxed text-muted">{item.note}</p> : null}
      <SyllabusBlock item={item} />
      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {typeof item.openings === "number" ? (
          <div>
            <dt className="inline text-muted">Openings </dt>
            <dd className="inline font-medium">{item.openings}</dd>
          </div>
        ) : null}
        {item.code ? (
          <div>
            <dt className="inline text-muted">Ad no. </dt>
            <dd className="inline font-medium">{item.code}</dd>
          </div>
        ) : null}
        {item.deadlineBs ? (
          <div>
            <dt className="inline text-muted">Deadline </dt>
            <dd className="inline font-medium">{formatBs(item.deadlineBs)}</dd>
          </div>
        ) : null}
        {item.doubleDeadlineBs ? (
          <div>
            <dt className="inline text-muted">Double fee until </dt>
            <dd className="inline font-medium">{formatBs(item.doubleDeadlineBs)}</dd>
          </div>
        ) : null}
        {item.publishedLabel && !item.deadlineBs ? (
          <div>
            <dt className="inline text-muted">Published </dt>
            <dd className="inline font-medium">{item.publishedLabel}</dd>
          </div>
        ) : null}
        {typeof item.applications === "number" && item.applications > 0 ? (
          <div>
            <dt className="inline text-muted">Paid forms </dt>
            <dd className="inline font-medium">{item.applications}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-crimson px-4 text-sm font-medium text-card"
        >
          Official notice
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
        {item.applyUrl ? (
          <a
            href={item.applyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-medium text-ink"
          >
            {applyLabel(item.applyUrl)}
          </a>
        ) : null}
        {item.pdfUrl ? (
          <a
            href={item.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-medium text-ink"
          >
            Download PDF
          </a>
        ) : null}
      </div>
    </li>
  );
}
