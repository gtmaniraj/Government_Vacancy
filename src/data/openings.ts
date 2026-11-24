import { vacancyTiming } from "@/lib/timing";
import type { SourceHealth, Vacancy } from "@/lib/vacancies";

/**
 * Notices checked on 8 Mangsir 2083 (24 November 2026).
 * Deadlines are Bikram Sambat YYYY-MM-DD. Seat counts are copied from one
 * published table only when that table's own total matches the figure widely
 * reported for the same notice. Where reposts disagree, the count is omitted.
 */

const NTC_DEADLINE = "2083-08-04";
const NTC_DOUBLE = "2083-08-10";
const NTC_APPLY = "https://recruit.ntc.net.np/";
const NTC_HOME = "https://www.ntc.net.np/";

/** Gorkhapatra, 13 Kartik 2083. Notice 06/2083-84. 14 ads, 80 posts. */
const NTC_POSTS: { code: string; title: string; level: string; openings: number }[] = [
  { code: "40/2083-84", title: "Deputy Manager (CA)", level: "Level 9", openings: 1 },
  { code: "41/2083-84", title: "Senior Engineer (Telecom)", level: "Level 8", openings: 1 },
  { code: "42/2083-84", title: "Senior Business Officer", level: "Level 8", openings: 1 },
  { code: "43/2083-84", title: "Senior Accounts Officer", level: "Level 8", openings: 1 },
  {
    code: "44/2083-84",
    title: "Telecom Engineer (Electronics and Communication)",
    level: "Level 7",
    openings: 3,
  },
  { code: "45/2083-84", title: "Telecom Engineer (Computer)", level: "Level 7", openings: 10 },
  { code: "46/2083-84", title: "Telecom Engineer (Electrical)", level: "Level 7", openings: 3 },
  { code: "47/2083-84", title: "Assistant Administrative Officer", level: "Level 6", openings: 9 },
  { code: "48/2083-84", title: "Assistant Business Officer", level: "Level 6", openings: 8 },
  { code: "49/2083-84", title: "Assistant Accounts Officer", level: "Level 6", openings: 2 },
  { code: "50/2083-84", title: "Overseer", level: "Level 5", openings: 3 },
  { code: "51/2083-84", title: "Telecom Technician", level: "Level 4", openings: 9 },
  { code: "52/2083-84", title: "Assistant", level: "Level 4", openings: 17 },
  { code: "53/2083-84", title: "Junior Technician", level: "Level 3", openings: 12 },
];

/** Official sites that answered when this list was checked, plus Nepal SBI's known domain. */
const CLASS_A_BANKS: { slug: string; name: string; href: string }[] = [
  { slug: "nbl", name: "Nepal Bank Limited", href: "https://jobs.nepalbank.com.np/" },
  { slug: "rbb", name: "Rastriya Banijya Bank", href: "https://www.rbb.com.np/career" },
  { slug: "adbl", name: "Agricultural Development Bank", href: "https://adbl.gov.np/en" },
  { slug: "nabil", name: "Nabil Bank", href: "https://www.nabilbank.com/career" },
  {
    slug: "nimb",
    name: "Nepal Investment Mega Bank",
    href: "https://www.nimb.com.np/personal-banking/career",
  },
  { slug: "scb", name: "Standard Chartered Bank Nepal", href: "https://www.sc.com/np/" },
  { slug: "hbl", name: "Himalayan Bank", href: "https://himalayanbank.com/" },
  { slug: "nsbi", name: "Nepal SBI Bank", href: "https://www.nepalsbi.com.np/" },
  { slug: "ebl", name: "Everest Bank", href: "https://everestbankltd.com/" },
  { slug: "nica", name: "NIC Asia Bank", href: "https://www.nicasiabank.com/" },
  { slug: "mbl", name: "Machhapuchchhre Bank", href: "https://www.machbank.com/" },
  { slug: "kbl", name: "Kumari Bank", href: "https://www.kumaribank.com/" },
  { slug: "lsb", name: "Laxmi Sunrise Bank", href: "https://www.laxmisunrise.com/" },
  { slug: "sbl", name: "Siddhartha Bank", href: "https://www.siddharthabank.com/" },
  { slug: "gime", name: "Global IME Bank", href: "https://www.globalimebank.com/" },
  { slug: "cbil", name: "Citizens Bank International", href: "https://www.ctznbank.com/" },
  { slug: "pcbl", name: "Prime Commercial Bank", href: "https://www.primebank.com.np/" },
  { slug: "nmb", name: "NMB Bank", href: "https://www.nmb.com.np/" },
  { slug: "prabhu", name: "Prabhu Bank", href: "https://www.prabhubank.com/" },
  { slug: "sanima", name: "Sanima Bank", href: "https://www.sanimabank.com/" },
];

function stamp(item: Omit<Vacancy, "status" | "daysLeft">, today: string): Vacancy {
  return { ...item, ...vacancyTiming(item.kind, item.deadlineBs, item.doubleDeadlineBs, today) };
}

export function extraBundle(today: string): { sources: SourceHealth[]; items: Vacancy[] } {
  const ntcPosts = NTC_POSTS.map((post) =>
    stamp(
      {
        id: `ntc-${post.code}`,
        sourceId: "ntc",
        source: "Nepal Telecom",
        title: post.title,
        organization: "Nepal Doorsanchar Company Limited",
        post: post.title,
        level: post.level,
        openings: post.openings,
        code: post.code,
        deadlineBs: NTC_DEADLINE,
        doubleDeadlineBs: NTC_DOUBLE,
        publishedLabel: "13 Kartik 2083",
        href: NTC_HOME,
        applyUrl: NTC_APPLY,
        kind: "vacancy",
      },
      today,
    ),
  );

  const neaOpen = stamp(
    {
      id: "nea-open-2083-84",
      sourceId: "nea",
      source: "Nepal Electricity Authority",
      title: "Open competition for permanent officer and assistant posts",
      organization: "Nepal Electricity Authority",
      level: "Officer and assistant",
      deadlineBs: "2083-08-10",
      doubleDeadlineBs: "2083-08-17",
      publishedLabel: "20 Kartik 2083",
      href: "https://www.nea.org.np/",
      applyUrl: "https://career.nea.org.np/",
      kind: "vacancy",
    },
    today,
  );

  const neaInternal = stamp(
    {
      id: "nea-internal-2083-84",
      sourceId: "nea",
      source: "Nepal Electricity Authority",
      title: "Internal promotion \u2014 current NEA staff only",
      organization: "Nepal Electricity Authority",
      publishedLabel: "20 Kartik 2083",
      deadlineBs: "2083-08-10",
      href: "https://www.nea.org.np/",
      applyUrl: "https://hris.nea.org.np/",
      kind: "notice",
    },
    today,
  );

  const bankOpen = stamp(
    {
      id: "bank-nbi-cro-2083",
      sourceId: "banks",
      source: "A-class banks",
      title: "Customer Relationship Officer (Junior Officer)",
      organization: "A-class commercial bank (the notice does not name the bank)",
      level: "Junior Officer",
      deadlineBs: "2083-08-16",
      href: "https://vacancy.nbi.com.np/jobs/customer-relationship-officer-junior-officer-level",
      applyUrl:
        "https://vacancy.nbi.com.np/apply-bank-vacancy/customer-relationship-officer-junior-officer-level",
      kind: "vacancy",
    },
    today,
  );

  const bankPages = CLASS_A_BANKS.map((bank) =>
    stamp(
      {
        id: `bank-page-${bank.slug}`,
        sourceId: "banks",
        source: "A-class banks",
        title: `${bank.name} career page`,
        organization: bank.name,
        href: bank.href,
        kind: "notice",
      },
      today,
    ),
  );

  const items = [...ntcPosts, neaOpen, neaInternal, bankOpen, ...bankPages];

  const count = (id: Vacancy["sourceId"]) => items.filter((item) => item.sourceId === id).length;

  const sources: SourceHealth[] = [
    {
      id: "banks",
      name: "A-class commercial banks",
      homepage: "https://www.nrb.org.np/",
      ok: true,
      count: count("banks"),
    },
    {
      id: "ntc",
      name: "Nepal Telecom",
      homepage: NTC_HOME,
      ok: true,
      count: count("ntc"),
    },
    {
      id: "nea",
      name: "Nepal Electricity Authority",
      homepage: "https://www.nea.org.np/",
      ok: true,
      count: count("nea"),
    },
  ];

  return { sources, items };
}
