import { MAP_VIEWBOX, PROVINCE_LABELS, PROVINCE_PATHS } from "@/data/province-paths";

export const PROVINCES = [
  {
    id: "Koshi",
    name: "Koshi",
    short: "Koshi",
    nameNp: "कोशी",
    hq: "Biratnagar",
    href: "https://psc.koshi.gov.np/",
  },
  {
    id: "Madhesh",
    name: "Madhesh",
    short: "Madhesh",
    nameNp: "मधेश",
    hq: "Janakpur",
    href: "https://ppsc.madhesh.gov.np/",
  },
  {
    id: "Bagmati",
    name: "Bagmati",
    short: "Bagmati",
    nameNp: "बागमती",
    hq: "Hetauda",
    href: "https://ppsc.bagamati.gov.np/",
  },
  {
    id: "Gandaki",
    name: "Gandaki",
    short: "Gandaki",
    nameNp: "गण्डकी",
    hq: "Pokhara",
    href: "https://ppsc.gandaki.gov.np/",
  },
  {
    id: "Lumbini",
    name: "Lumbini",
    short: "Lumbini",
    nameNp: "लुम्बिनी",
    hq: "Butwal",
    href: "https://ppsc.lumbini.gov.np/",
  },
  {
    id: "Karnali",
    name: "Karnali",
    short: "Karnali",
    nameNp: "कर्णाली",
    hq: "Birendranagar",
    href: "https://ppsc.karnali.gov.np/",
  },
  {
    id: "Sudurpashchim",
    name: "Sudurpashchim",
    short: "Sudur",
    nameNp: "सुदूरपश्चिम",
    hq: "Dhangadhi",
    href: "https://psc.sudurpashchim.gov.np/",
  },
] as const;

export type ProvinceId = (typeof PROVINCES)[number]["id"];

export function NepalMap({
  selected,
  counts,
  onSelect,
}: {
  selected: ProvinceId | "all";
  counts: Map<string, number>;
  onSelect: (id: ProvinceId | "all") => void;
}) {
  const active = PROVINCES.find((item) => item.id === selected);
  return (
    <section className="mt-8" aria-labelledby="province-map-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="province-map-heading" className="font-display text-2xl">
            Seven provinces
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Tap a province for posts from that province’s Lok Sewa Aayog. The outline is the real
            admin boundary.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect("all")}
          className={
            selected === "all"
              ? "min-h-11 rounded-full bg-ink px-4 text-sm font-medium text-card"
              : "min-h-11 rounded-full border border-line bg-card px-4 text-sm font-medium"
          }
        >
          All Nepal
        </button>
      </div>

      <div className="mt-4 rounded-3xl border border-line bg-card p-3 shadow-(--shadow-rest) sm:p-5">
        <svg viewBox={MAP_VIEWBOX} role="img" aria-label="Map of Nepal’s seven provinces" className="h-auto w-full">
          {PROVINCES.map((province) => {
            const on = selected === province.id;
            const count = counts.get(province.id) ?? 0;
            return (
              <path
                key={province.id}
                d={PROVINCE_PATHS[province.id]}
                tabIndex={0}
                role="button"
                aria-pressed={on}
                aria-label={`${province.name}, ${count} provincial posts`}
                onClick={() => onSelect(on ? "all" : province.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(on ? "all" : province.id);
                  }
                }}
                strokeLinejoin="round"
                className={
                  on
                    ? "cursor-pointer fill-crimson stroke-card outline-none"
                    : "cursor-pointer fill-land stroke-card outline-none hover:fill-blush"
                }
                strokeWidth={on ? 2.4 : 1.4}
              />
            );
          })}
          {PROVINCES.map((province) => {
            const label = PROVINCE_LABELS[province.id];
            const on = selected === province.id;
            if (!label) return null;
            return (
              <text
                key={`${province.id}-label`}
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={on ? "pointer-events-none fill-card text-xs font-semibold" : "pointer-events-none fill-ink text-xs font-medium"}
              >
                {province.short}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="chip-row -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Province">
        {PROVINCES.map((province) => {
          const on = selected === province.id;
          const count = counts.get(province.id) ?? 0;
          return (
            <button
              key={province.id}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(on ? "all" : province.id)}
              className={
                on
                  ? "num min-h-11 shrink-0 rounded-full bg-crimson px-4 text-sm font-medium text-card"
                  : "num min-h-11 shrink-0 rounded-full border border-line bg-card px-4 text-sm font-medium"
              }
            >
              {province.name} {count}
            </button>
          );
        })}
      </div>
      {active ? (
        <p className="mt-2 text-sm text-muted">
          {active.nameNp} · headquarters {active.hq}.{" "}
          <a className="font-medium text-crimson" href={active.href} target="_blank" rel="noreferrer">
            Official commission site
          </a>
        </p>
      ) : null}
    </section>
  );
}
