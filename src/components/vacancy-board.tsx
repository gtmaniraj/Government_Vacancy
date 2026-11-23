import { useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Search } from "lucide-react";
import { refreshBoard } from "@/lib/board.functions";
import { formatBs } from "@/lib/bs";
import type { Board, Vacancy, VacancyStatus } from "@/lib/vacancies";

type View = "all" | "open" | "notices";

const VIEWS: { id: View; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "open", label: "Open posts" },
  { id: "notices", label: "Notices" },
];

function statusLabel(item: Vacancy): string {
  if (item.status === "open") {
    if (item.daysLeft === 0) return "Closes today";
    if (item.daysLeft === 1) return "1 day left";
    if (item.daysLeft != null && item.daysLeft > 0) return `${item.daysLeft} days left`;
    return "Open";
  }
  if (item.status === "double") return "Double fee window";
  if (item.status === "closed") return "Closed";
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

export function VacancyBoard({ initial }: { initial: Board }) {
  const [board, setBoard] = useState(initial);
  const [view, setView] = useState<View>("open");
  const [source, setSource] = useState<"all" | "psc" | "tsc">("all");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [visible, setVisible] = useState(8);

  const counts = useMemo(() => {
    const open = board.items.filter((item) => item.status === "open" || item.status === "double");
    const soon = open.filter((item) => item.daysLeft != null && item.daysLeft <= 7);
    const notices = board.items.filter((item) => item.status === "notice");
    return { open: open.length, soon: soon.length, notices: notices.length };
  }, [board.items]);

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return board.items.filter((item) => {
      if (source !== "all" && item.sourceId !== source) return false;
      if (view === "open" && item.status !== "open" && item.status !== "double") return false;
      if (view === "notices" && item.status !== "notice") return false;
      if (!needle) return true;
      const blob = [item.title, item.organization, item.post, item.level, item.code, item.source]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    });
  }, [board.items, query, source, view]);

  const page = shown.slice(0, visible);

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
            <p className="text-sm font-semibold text-crimson">gautammaniraj.com.np</p>
            <p className="font-display text-3xl leading-tight">Gautam Maniraj</p>
            <p className="text-sm text-muted">Government vacancy desk</p>
          </div>
          <p className="text-sm text-muted">
            Today <span className="font-medium text-ink">{board.todayLabel}</span>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="max-w-3xl">
          <h1 className="font-display text-4xl leading-tight">
            Open government posts, read from the offices that publish them.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
            Lok Sewa advertisements come from psc.gov.np. Teacher notices come from tsc.gov.np.
            Apply only on the official site linked from each row.
          </p>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat label="Open or in double fee" value={counts.open} />
          <Stat label="Closing within 7 days" value={counts.soon} />
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
                setVisible(8);
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

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search posts and notices</span>
              <Search className="pointer-events-none absolute top-3.5 left-3 size-4 text-muted" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisible(8);
                }}
                placeholder="Search post, office, or advertisement number"
                className="min-h-11 w-full rounded-2xl border border-line bg-card pr-4 pl-10 text-base text-ink outline-none focus:border-crimson"
              />
            </label>
            <label className="min-h-11 sm:w-64">
              <span className="sr-only">Source</span>
              <select
                value={source}
                onChange={(event) => {
                  setSource(event.target.value as "all" | "psc" | "tsc");
                  setVisible(8);
                }}
                className="min-h-11 w-full rounded-2xl border border-line bg-card px-3 text-base text-ink outline-none focus:border-crimson"
              >
                <option value="all">All offices</option>
                <option value="psc">Lok Sewa Aayog</option>
                <option value="tsc">Teachers Service Commission</option>
              </select>
            </label>
          </div>

          <p className="text-sm text-muted">
            {shown.length} shown · read {whenFetched(board.fetchedAt)} NPT
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

        <ul className="mt-4 flex flex-col gap-3">
          {shown.length === 0 ? (
            <li className="rounded-2xl border border-line bg-card px-5 py-10 text-center">
              <p className="font-display text-2xl">Nothing matches</p>
              <p className="mt-2 text-sm text-muted">
                Try another office, or switch to Everything to see closed posts and notices.
              </p>
            </li>
          ) : (
            page.map((item) => <Row key={item.id} item={item} />)
          )}
        </ul>
        {shown.length > page.length ? (
          <button
            type="button"
            onClick={() => setVisible((count) => count + 8)}
            className="mt-4 min-h-11 w-full rounded-full border border-line bg-card text-sm font-medium text-ink"
          >
            Show more ({shown.length - page.length} left)
          </button>
        ) : null}

        <footer className="mt-12 border-t border-line py-8 text-sm leading-relaxed text-muted">
          <p>
            Sources:{" "}
            {board.sources.map((item, index) => (
              <span key={item.id}>
                {index > 0 ? " · " : ""}
                <a className="font-medium text-crimson underline-offset-2 hover:underline" href={item.homepage}>
                  {item.name}
                </a>{" "}
                ({item.ok ? `${item.count} items` : "unavailable"})
              </span>
            ))}
          </p>
          <p className="mt-2">
            Deadlines are the Bikram Sambat dates published by Lok Sewa. This desk does not take
            applications.
          </p>
        </footer>
      </main>
    </div>
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
  return (
    <li className="rounded-2xl border border-line bg-card px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone(item.status, item.kind)}`}>
          {statusLabel(item)}
        </span>
        <span className="text-xs font-medium text-muted">{item.source}</span>
        {item.level ? <span className="text-xs text-muted">{item.level}</span> : null}
      </div>
      <h2 className="mt-2 font-display text-xl leading-snug">{item.title}</h2>
      <p className="mt-1 text-sm text-muted">{item.organization}</p>
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
            Apply on PSC portal
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
