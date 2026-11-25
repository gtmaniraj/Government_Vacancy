import { vacancyTiming } from "@/lib/timing";
import type { PostCategory, SourceHealth, SourceId, Vacancy } from "@/lib/vacancies";

/**
 * Checked 9 Mangsir 2083 (25 November 2026).
 * Deadlines are Bikram Sambat YYYY-MM-DD.
 * Seat counts are copied only when a single published table states them.
 * Where two reprints disagree, the count is left off and the official notice is linked.
 */

const NTC_DEADLINE = "2083-08-04";
const NTC_DOUBLE = "2083-08-10";
const NTC_APPLY = "https://recruit.ntc.net.np/";
const NTC_HOME = "https://www.ntc.net.np/";

type Seed = {
  id: string;
  sourceId: SourceId;
  source: string;
  title: string;
  titleNp?: string;
  organization: string;
  post?: string;
  level?: string;
  openings?: number;
  code?: string;
  category: PostCategory;
  province?: string;
  note?: string;
  deadlineBs?: string;
  doubleDeadlineBs?: string;
  publishedLabel?: string;
  href: string;
  applyUrl?: string;
  kind: "vacancy" | "notice";
};

const NTC_POSTS: {
  code: string;
  title: string;
  level: string;
  openings: number;
  category: PostCategory;
}[] = [
  { code: "40/2083-84", title: "Deputy Manager (CA)", level: "Level 9", openings: 1, category: "accounts" },
  {
    code: "41/2083-84",
    title: "Senior Engineer (Telecom)",
    level: "Level 8",
    openings: 1,
    category: "engineering",
  },
  {
    code: "42/2083-84",
    title: "Senior Business Officer",
    level: "Level 8",
    openings: 1,
    category: "administration",
  },
  {
    code: "43/2083-84",
    title: "Senior Accounts Officer",
    level: "Level 8",
    openings: 1,
    category: "accounts",
  },
  {
    code: "44/2083-84",
    title: "Telecom Engineer (Electronics and Communication)",
    level: "Level 7",
    openings: 3,
    category: "engineering",
  },
  {
    code: "45/2083-84",
    title: "Telecom Engineer (Computer)",
    level: "Level 7",
    openings: 10,
    category: "it",
  },
  {
    code: "46/2083-84",
    title: "Telecom Engineer (Electrical)",
    level: "Level 7",
    openings: 3,
    category: "engineering",
  },
  {
    code: "47/2083-84",
    title: "Assistant Administrative Officer",
    level: "Level 6",
    openings: 9,
    category: "administration",
  },
  {
    code: "48/2083-84",
    title: "Assistant Business Officer",
    level: "Level 6",
    openings: 8,
    category: "administration",
  },
  {
    code: "49/2083-84",
    title: "Assistant Accounts Officer",
    level: "Level 6",
    openings: 2,
    category: "accounts",
  },
  { code: "50/2083-84", title: "Overseer", level: "Level 5", openings: 3, category: "engineering" },
  {
    code: "51/2083-84",
    title: "Telecom Technician",
    level: "Level 4",
    openings: 9,
    category: "engineering",
  },
  { code: "52/2083-84", title: "Assistant", level: "Level 4", openings: 17, category: "administration" },
  {
    code: "53/2083-84",
    title: "Junior Technician",
    level: "Level 3",
    openings: 12,
    category: "engineering",
  },
];

const CLASS_A_BANKS: { slug: string; name: string; href: string }[] = [
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

const NRB_DEADLINE = "2083-08-17";
const NRB_DOUBLE = "2083-08-24";
const NRB_NOTICE = "https://www.nrb.org.np/category/notices/";
const NRB_APPLY = "https://jobs.nrb.org.np/";

const RBB_NOTICE = "https://www.rbb.com.np/career";
const RBB_APPLY = "https://recruitment.rbb.com.np/";

const ADBL_HOME = "https://adbl.gov.np/en";
const NBL_JOBS = "https://jobs.nepalbank.com.np/";

function stamp(item: Seed, today: string): Vacancy {
  return {
    ...item,
    titleEn: item.title,
    ...vacancyTiming(item.kind, item.deadlineBs, item.doubleDeadlineBs, today),
  };
}

export function extraBundle(today: string): { sources: SourceHealth[]; items: Vacancy[] } {
  const items: Vacancy[] = [];

  for (const post of NTC_POSTS) {
    items.push(
      stamp(
        {
          id: `ntc-${post.code}`,
          sourceId: "ntc",
          source: "Nepal Telecom",
          title: post.title,
          titleNp: "नेपाल दूरसञ्चार कम्पनी लिमिटेड",
          organization: "Nepal Doorsanchar Company Limited",
          post: post.title,
          level: post.level,
          openings: post.openings,
          code: post.code,
          category: post.category,
          deadlineBs: NTC_DEADLINE,
          doubleDeadlineBs: NTC_DOUBLE,
          publishedLabel: "13 Kartik 2083",
          href: NTC_HOME,
          applyUrl: NTC_APPLY,
          kind: "vacancy",
          note: "Notice 06/2083-84. 14 advertisements, 80 posts. Confirm the Gorkhapatra table before you pay.",
        },
        today,
      ),
    );
  }

  items.push(
    stamp(
      {
        id: "nea-open-2083-84",
        sourceId: "nea",
        source: "Nepal Electricity Authority",
        title: "Open competition for permanent officer and assistant posts",
        titleNp: "नेपाल विद्युत प्राधिकरण — खुला प्रतियोगिता",
        organization: "Nepal Electricity Authority",
        level: "Officer and assistant",
        category: "engineering",
        deadlineBs: "2083-08-10",
        doubleDeadlineBs: "2083-08-17",
        publishedLabel: "20 Kartik 2083",
        href: "https://www.nea.org.np/",
        applyUrl: "https://career.nea.org.np/",
        kind: "vacancy",
        note: "Covers engineering, technical and administration services. The post-wise table is on the NEA notice.",
      },
      today,
    ),
    stamp(
      {
        id: "nea-internal-2083-84",
        sourceId: "nea",
        source: "Nepal Electricity Authority",
        title: "Internal promotion — current NEA staff only",
        titleNp: "नेपाल विद्युत प्राधिकरण — आन्तरिक बढुवा",
        organization: "Nepal Electricity Authority",
        category: "administration",
        publishedLabel: "20 Kartik 2083",
        deadlineBs: "2083-08-10",
        href: "https://www.nea.org.np/",
        applyUrl: "https://hris.nea.org.np/",
        kind: "notice",
      },
      today,
    ),
  );

  const nrbPosts: Seed[] = [
    {
      id: "nrb-11-2083",
      sourceId: "nrb",
      source: "Nepal Rastra Bank",
      title: "Assistant Director",
      titleNp: "सहायक निर्देशक (खुला तथा समावेशी)",
      organization: "Nepal Rastra Bank",
      post: "Assistant Director",
      level: "Officer third",
      openings: 26,
      code: "11/2083",
      category: "administration",
      deadlineBs: NRB_DEADLINE,
      doubleDeadlineBs: NRB_DOUBLE,
      publishedLabel: "27 Kartik 2083",
      href: NRB_NOTICE,
      applyUrl: NRB_APPLY,
      kind: "vacancy",
      note: "Master's in Economics, Management or Public Administration. Fee Rs 1,000, plus Rs 400 for each extra inclusive group.",
    },
    {
      id: "nrb-12-2083",
      sourceId: "nrb",
      source: "Nepal Rastra Bank",
      title: "Assistant Director (Accounts and Audit)",
      titleNp: "सहायक निर्देशक (लेखा/लेखापरीक्षण)",
      organization: "Nepal Rastra Bank",
      post: "Assistant Director (Accounts and Audit)",
      level: "Officer third",
      openings: 3,
      code: "12/2083",
      category: "accounts",
      deadlineBs: NRB_DEADLINE,
      doubleDeadlineBs: NRB_DOUBLE,
      publishedLabel: "27 Kartik 2083",
      href: NRB_NOTICE,
      applyUrl: NRB_APPLY,
      kind: "vacancy",
      note: "CA, ACCA or CPA from a recognized institute.",
    },
    {
      id: "nrb-13-2083",
      sourceId: "nrb",
      source: "Nepal Rastra Bank",
      title: "Assistant Director (Commercial Law)",
      titleNp: "सहायक निर्देशक (वाणिज्य कानुन)",
      organization: "Nepal Rastra Bank",
      post: "Assistant Director (Commercial Law)",
      level: "Officer third",
      openings: 2,
      code: "13/2083",
      category: "law",
      deadlineBs: NRB_DEADLINE,
      doubleDeadlineBs: NRB_DOUBLE,
      publishedLabel: "27 Kartik 2083",
      href: NRB_NOTICE,
      applyUrl: NRB_APPLY,
      kind: "vacancy",
      note: "Master's in Law, or a master's in Economics, Management or Public Administration plus a bachelor's in Law.",
    },
    {
      id: "nrb-14-2083",
      sourceId: "nrb",
      source: "Nepal Rastra Bank",
      title: "Assistant Director (Information Technology)",
      titleNp: "सहायक निर्देशक (सूचना प्रविधि)",
      organization: "Nepal Rastra Bank",
      post: "Assistant Director (Information Technology)",
      level: "Officer third",
      openings: 4,
      code: "14/2083",
      category: "it",
      deadlineBs: NRB_DEADLINE,
      doubleDeadlineBs: NRB_DOUBLE,
      publishedLabel: "27 Kartik 2083",
      href: NRB_NOTICE,
      applyUrl: NRB_APPLY,
      kind: "vacancy",
      note: "Bachelor's or above in Computer, Information Technology, or Electronics and Communication.",
    },
    {
      id: "nrb-15-2083",
      sourceId: "nrb",
      source: "Nepal Rastra Bank",
      title: "Assistant",
      titleNp: "सहायक (सहायक द्वितीय)",
      organization: "Nepal Rastra Bank",
      post: "Assistant",
      level: "Assistant second",
      openings: 26,
      code: "15/2083",
      category: "administration",
      deadlineBs: NRB_DEADLINE,
      doubleDeadlineBs: NRB_DOUBLE,
      publishedLabel: "27 Kartik 2083",
      href: NRB_NOTICE,
      applyUrl: NRB_APPLY,
      kind: "vacancy",
      note: "10+2 or equivalent, plus a valid Lok Sewa pre-qualification certificate. Fee Rs 800, plus Rs 300 per extra group. 61 open seats in ads 11–15.",
    },
    {
      id: "nrb-internal-2083",
      sourceId: "nrb",
      source: "Nepal Rastra Bank",
      title: "Internal promotion and performance evaluation — NRB staff only",
      titleNp: "कार्यक्षमता मूल्याङ्कन र आन्तरिक प्रतियोगितात्मक परीक्षा",
      organization: "Nepal Rastra Bank",
      category: "administration",
      publishedLabel: "27 Kartik 2083",
      deadlineBs: NRB_DEADLINE,
      href: NRB_NOTICE,
      kind: "notice",
      note: "Not an open vacancy. Ads 1/2083 to 10/2083 are for current staff.",
    },
  ];

  const rbbNote =
    "Open competition published 19 Ashad 2083 (3 July 2026), 138 seats in the notice. Applications closed 14 Shrawan 2083. Exam centres are on the career page. Confirm each row against the Nepali PDF.";

  const rbbPosts: Seed[] = [
    ["Senior Manager", "वरिष्ठ प्रबन्धक", "Level 9", 1, "administration"],
    ["Manager", "प्रबन्धक", "Level 8", 2, "administration"],
    ["Deputy Manager", "उपप्रबन्धक", "Level 7", 3, "administration"],
    ["Assistant Manager", "सहायक प्रबन्धक", "Level 6", 51, "administration"],
    ["Assistant Manager (Information Technology)", "सहायक प्रबन्धक (सूचना प्रविधि)", "Level 6", 3, "it"],
    ["Assistant Manager (Cash)", "सहायक प्रबन्धक (क्यास)", "Level 6", 1, "accounts"],
    ["Assistant Manager (Law)", "सहायक प्रबन्धक (कानुन)", "Level 6", 2, "law"],
    ["Senior Assistant", "वरिष्ठ सहायक", "Level 5", 39, "administration"],
    ["Senior Assistant (Cash)", "वरिष्ठ सहायक (क्यास)", "Level 5", 10, "accounts"],
    ["Senior Assistant (Law)", "वरिष्ठ सहायक (कानुन)", "Level 5", 2, "law"],
    ["Senior Assistant (Information Technology)", "वरिष्ठ सहायक (सूचना प्रविधि)", "Level 4", 17, "it"],
  ].map(([title, titleNp, level, openings, category], index) => ({
    id: `rbb-2082-83-${index + 1}`,
    sourceId: "rbb" as const,
    source: "Rastriya Banijya Bank",
    title: title as string,
    titleNp: titleNp as string,
    organization: "Rastriya Banijya Bank",
    post: title as string,
    level: level as string,
    openings: openings as number,
    code: "2082/83 open",
    category: category as PostCategory,
    deadlineBs: "2083-04-07",
    doubleDeadlineBs: "2083-04-14",
    publishedLabel: "19 Ashad 2083",
    href: RBB_NOTICE,
    applyUrl: RBB_APPLY,
    kind: "vacancy" as const,
    note: rbbNote,
  }));

  rbbPosts.push({
    id: "rbb-level4-2082-83",
    sourceId: "rbb",
    source: "Rastriya Banijya Bank",
    title: "Assistant and Assistant (Cash), Level 4",
    titleNp: "सहायक तथा सहायक (क्यास), तह ४",
    organization: "Rastriya Banijya Bank",
    post: "Assistant and Assistant (Cash)",
    level: "Level 4",
    category: "administration",
    publishedLabel: "1 Falgun 2082",
    href: RBB_NOTICE,
    applyUrl: RBB_APPLY,
    kind: "notice",
    note: "Separate Level 4 advertisement of 1 Falgun 2082. Exam centres for ads 101–114 are on the career page. Seat split is in that PDF.",
  });

  const adblNote =
    "Notice of 1 Falgun 2082, 242 seats in total. Applications closed 28 Falgun 2082 (double fee). Written exams are run with Lok Sewa. Syllabus: adbl.gov.np.";

  const adblPosts: Seed[] = [
    {
      id: "adbl-12",
      sourceId: "adbl",
      source: "Agricultural Development Bank",
      title: "Branch Manager",
      titleNp: "शाखा प्रमुख",
      organization: "Agricultural Development Bank",
      level: "Officer 8th",
      openings: 1,
      code: "12/2082-83",
      category: "administration",
      deadlineBs: "2082-11-21",
      doubleDeadlineBs: "2082-11-28",
      publishedLabel: "1 Falgun 2082",
      href: ADBL_HOME,
      applyUrl: "https://vacancy.adbl.gov.np/",
      kind: "vacancy",
      note: adblNote,
    },
    {
      id: "adbl-13",
      sourceId: "adbl",
      source: "Agricultural Development Bank",
      title: "Business Officer",
      titleNp: "व्यवसाय अधिकृत",
      organization: "Agricultural Development Bank",
      level: "Officer 6th",
      code: "13/2082-83",
      category: "administration",
      deadlineBs: "2082-11-21",
      doubleDeadlineBs: "2082-11-28",
      publishedLabel: "1 Falgun 2082",
      href: ADBL_HOME,
      applyUrl: "https://vacancy.adbl.gov.np/",
      kind: "vacancy",
      note: `${adblNote} Seat count for this row is omitted because reprints disagree.`,
    },
    {
      id: "adbl-14",
      sourceId: "adbl",
      source: "Agricultural Development Bank",
      title: "Account Officer (CA / ACCA)",
      titleNp: "लेखा अधिकृत",
      organization: "Agricultural Development Bank",
      level: "Officer 6th",
      openings: 10,
      code: "14/2082-83",
      category: "accounts",
      deadlineBs: "2082-11-21",
      doubleDeadlineBs: "2082-11-28",
      publishedLabel: "1 Falgun 2082",
      href: ADBL_HOME,
      applyUrl: "https://vacancy.adbl.gov.np/",
      kind: "vacancy",
      note: adblNote,
    },
  ];

  const adblProvinces = [
    ["101/2082-83", "Koshi", "कोशी"],
    ["102/2082-83", "Madhesh", "मधेश"],
    ["103/2082-83", "Bagmati", "बागमती"],
    ["104/2082-83", "Gandaki", "गण्डकी"],
    ["105/2082-83", "Lumbini", "लुम्बिनी"],
    ["106/2082-83", "Karnali", "कर्णाली"],
    ["107/2082-83", "Sudurpashchim", "सुदूरपश्चिम"],
  ] as const;

  for (const [code, province, provinceNp] of adblProvinces) {
    adblPosts.push({
      id: `adbl-${code}`,
      sourceId: "adbl",
      source: "Agricultural Development Bank",
      title: `Accountant — ${province}`,
      titleNp: `लेखापाल (${provinceNp})`,
      organization: "Agricultural Development Bank",
      level: "Assistant 4th",
      code,
      category: "accounts",
      province,
      deadlineBs: "2082-11-21",
      doubleDeadlineBs: "2082-11-28",
      publishedLabel: "1 Falgun 2082",
      href: ADBL_HOME,
      applyUrl: "https://urp.nepalgovbanks.com/",
      kind: "vacancy",
      note: `${adblNote} Provincial seat split is in the bank PDF, so it is not repeated here.`,
    });
  }

  const nblPosts: Seed[] = [
    {
      id: "nbl-19",
      title: "Senior Manager",
      titleNp: "वरिष्ठ प्रबन्धक",
      level: "Officer",
      openings: 1,
      code: "19/2082-83",
      category: "administration",
    },
    {
      id: "nbl-20",
      title: "Assistant Manager",
      titleNp: "सहायक प्रबन्धक",
      level: "Officer",
      openings: 7,
      code: "20/2082-83",
      category: "administration",
      note: "Inclusive groups listed on the portal: women, Madheshi, backward area.",
    },
    {
      id: "nbl-21",
      title: "Assistant Manager (Information Technology)",
      titleNp: "सहायक प्रबन्धक (सूचना प्रविधि)",
      level: "Officer",
      openings: 1,
      code: "21/2082-83",
      category: "it",
    },
    {
      id: "nbl-22",
      title: "Assistant Manager (CA)",
      titleNp: "सहायक प्रबन्धक (चार्टर्ड एकाउन्टेन्ट)",
      level: "Officer",
      openings: 2,
      code: "22/2082-83",
      category: "accounts",
    },
    {
      id: "nbl-23",
      title: "Assistant (Information Technology) — Madhesh",
      titleNp: "सहायक (सूचना प्रविधि) — मधेश",
      level: "Assistant",
      openings: 1,
      code: "23/2082-83",
      category: "it",
      province: "Madhesh",
    },
    {
      id: "nbl-24",
      title: "Assistant (Information Technology) — Bagmati",
      titleNp: "सहायक (सूचना प्रविधि) — बागमती",
      level: "Assistant",
      openings: 4,
      code: "24/2082-83",
      category: "it",
      province: "Bagmati",
    },
    {
      id: "nbl-25",
      title: "Assistant (Information Technology) — Lumbini",
      titleNp: "सहायक (सूचना प्रविधि) — लुम्बिनी",
      level: "Assistant",
      openings: 1,
      code: "25/2082-83",
      category: "it",
      province: "Lumbini",
    },
  ].map((post) => ({
    sourceId: "nbl" as const,
    source: "Nepal Bank Limited",
    organization: "Nepal Bank Limited",
    post: post.title,
    deadlineBs: "2082-11-25",
    doubleDeadlineBs: "2082-11-28",
    publishedLabel: "1 Falgun 2082",
    href: NBL_JOBS,
    applyUrl: NBL_JOBS,
    kind: "vacancy" as const,
    ...post,
    category: post.category as PostCategory,
    note: [
      "Open-competition list on jobs.nepalbank.com.np. Applications closed 28 Falgun 2082. Lok Sewa has since published written-exam centres.",
      post.note,
    ]
      .filter(Boolean)
      .join(" "),
  }));

  const karnaliNote =
    "Karnali Province PSC notice 30/2083-84, local service, 4th level. Published 24 Kartik 2083. Regular deadline 14 Mangsir 2083, double fee until 21 Mangsir 2083. Preliminary exam 26 Poush 2083. Counts are open plus inclusive groups as reprinted — confirm the PDF.";

  const karnaliPosts: Seed[] = [
    {
      id: "karnali-admin-asst",
      title: "Administration Assistant",
      titleNp: "प्रशासन सहायक",
      level: "4th level, non-technical",
      openings: 49,
      category: "administration",
      post: "Administration Assistant",
    },
    {
      id: "karnali-accounts-asst",
      title: "Accounts Assistant",
      titleNp: "लेखा सहायक",
      level: "4th level, non-technical",
      openings: 1,
      category: "accounts",
      post: "Accounts Assistant",
    },
    {
      id: "karnali-jta",
      title: "Junior Technical Assistant (Agriculture)",
      titleNp: "कनिष्ठ प्राविधिक सहायक (कृषि)",
      level: "4th level, technical",
      openings: 10,
      category: "agriculture",
      post: "Junior Technical Assistant",
    },
    {
      id: "karnali-jah",
      title: "Junior Animal Health Technician",
      titleNp: "कनिष्ठ पशु स्वास्थ्य प्राविधिक",
      level: "4th level, technical",
      openings: 8,
      category: "agriculture",
      post: "Junior Animal Health Technician",
    },
    {
      id: "karnali-livestock",
      title: "Junior Livestock Service Technician",
      titleNp: "कनिष्ठ पशु सेवा प्राविधिक",
      level: "4th level, technical",
      openings: 5,
      category: "agriculture",
      post: "Junior Livestock Service Technician",
    },
    {
      id: "karnali-amin",
      title: "Amin (Surveyor)",
      titleNp: "अमिन",
      level: "4th level, technical",
      openings: 2,
      category: "engineering",
      post: "Amin",
    },
    {
      id: "karnali-sub-eng",
      title: "Assistant Sub-Engineer (Civil)",
      titleNp: "सहायक सव-इन्जिनियर (सिभिल)",
      level: "4th level, technical",
      openings: 47,
      category: "engineering",
      post: "Assistant Sub-Engineer",
    },
    {
      id: "karnali-wss",
      title: "Water Supply and Sanitation Technician",
      titleNp: "खानेपानी तथा सरसफाइ प्राविधिक",
      level: "4th level, technical",
      openings: 1,
      category: "engineering",
      post: "Water Supply and Sanitation Technician",
    },
    {
      id: "karnali-anm",
      title: "Auxiliary Nurse Midwife (ANM)",
      titleNp: "अ.न.मी.",
      level: "4th level, technical",
      openings: 16,
      category: "medical",
      post: "Auxiliary Nurse Midwife",
    },
    {
      id: "karnali-ahw",
      title: "Auxiliary Health Worker (AHW)",
      titleNp: "अ.हे.व.",
      level: "4th level, technical",
      openings: 14,
      category: "medical",
      post: "Auxiliary Health Worker",
    },
  ].map((post) => ({
    sourceId: "ppsc" as const,
    source: "Karnali Province PSC",
    organization: "Province Public Service Commission, Karnali",
    province: "Karnali",
    code: "30/2083-84",
    deadlineBs: "2083-08-14",
    doubleDeadlineBs: "2083-08-21",
    publishedLabel: "24 Kartik 2083",
    href: "https://ppsc.karnali.gov.np/",
    applyUrl: "https://ppsconline.karnali.gov.np/",
    kind: "vacancy" as const,
    note: karnaliNote,
    ...post,
    category: post.category as PostCategory,
  }));

  const koshiNote =
    "Koshi Province PSC notice 106/2083-84, local service, levels 7 and 8. Applications closed 22 Kartik 2083 (double fee). Seat figures are the reprinted open-plus-inclusive totals — confirm the PDF.";

  const koshiPosts: Seed[] = [
    ["koshi-mo", "Medical Officer", "मेडिकल अधिकृत", "Level 8", 4, "medical"],
    ["koshi-eng", "Engineer (Civil)", "इन्जिनियर (सिभिल)", "Level 7", 9, "engineering"],
    ["koshi-arch", "Engineer (Building and Architecture)", "इन्जिनियर (भवन तथा आर्किटेक्चर)", "Level 7", 1, "engineering"],
    ["koshi-agri-ext", "Agriculture Extension Officer", "कृषि प्रसार अधिकृत", "Level 7", 8, "agriculture"],
    ["koshi-crop", "Crop Development Officer", "बाली विकास अधिकृत", "Level 7", 1, "agriculture"],
    ["koshi-vet", "Veterinary Officer", "भेटेरिनरी अधिकृत", "Level 7", 6, "agriculture"],
    ["koshi-livestock", "Livestock Development Officer", "पशु विकास अधिकृत", "Level 7", 2, "agriculture"],
    ["koshi-fish", "Fisheries Development Officer", "मत्स्य विकास अधिकृत", "Level 7", 1, "agriculture"],
    ["koshi-edu", "Education Officer", "शिक्षा अधिकृत", "Level 7", 5, "teaching"],
    ["koshi-pho", "Public Health Officer", "जनस्वास्थ्य अधिकृत", "Level 7", 3, "medical"],
    ["koshi-lab", "Medical Lab Technologist", "मेडिकल ल्याब टेक्नोलोजिस्ट", "Level 7", 1, "medical"],
    ["koshi-so", "Section Officer", "शाखा अधिकृत", "Level 7", 10, "administration"],
    ["koshi-ao", "Accounts Officer", "लेखा अधिकृत", "Level 7", 8, "accounts"],
    ["koshi-law", "Law Officer", "कानुन अधिकृत", "Level 7", 2, "law"],
  ].map(([id, title, titleNp, level, openings, category]) => ({
    id: id as string,
    sourceId: "ppsc" as const,
    source: "Koshi Province PSC",
    title: title as string,
    titleNp: titleNp as string,
    organization: "Province Public Service Commission, Koshi",
    post: title as string,
    level: level as string,
    openings: openings as number,
    code: "106/2083-84",
    category: category as PostCategory,
    province: "Koshi",
    deadlineBs: "2083-07-15",
    doubleDeadlineBs: "2083-07-22",
    publishedLabel: "26 Asoj 2083",
    href: "https://psc.koshi.gov.np/",
    applyUrl: "https://psconline.p1.gov.np/",
    kind: "vacancy" as const,
    note: koshiNote,
  }));

  const provinceDoors: Seed[] = [
    {
      id: "ppsc-madhesh",
      title: "Madhesh Province PSC — advertisements and results",
      titleNp: "प्रदेश लोक सेवा आयोग, मधेश प्रदेश",
      href: "https://ppsc.madhesh.gov.np/",
      province: "Madhesh",
    },
    {
      id: "ppsc-bagmati",
      title: "Bagmati Province PSC — advertisements and results",
      titleNp: "प्रदेश लोक सेवा आयोग, बागमती प्रदेश",
      href: "https://ppsc.bagamati.gov.np/",
      province: "Bagmati",
    },
    {
      id: "ppsc-gandaki",
      title: "Gandaki Province PSC — advertisements and results",
      titleNp: "प्रदेश लोक सेवा आयोग, गण्डकी प्रदेश",
      href: "https://psc.gandaki.gov.np/",
      province: "Gandaki",
    },
    {
      id: "ppsc-lumbini",
      title: "Lumbini Province PSC — advertisements and results",
      titleNp: "प्रदेश लोक सेवा आयोग, लुम्बिनी प्रदेश",
      href: "https://ppsc.lumbini.gov.np/",
      applyUrl: "https://ppsconline.lumbini.gov.np/",
      province: "Lumbini",
    },
    {
      id: "ppsc-sudur",
      title: "Sudurpashchim Province PSC — advertisements and results",
      titleNp: "प्रदेश लोक सेवा आयोग, सुदूरपश्चिम प्रदेश",
      href: "https://psc.sudurpashchim.gov.np/",
      province: "Sudurpashchim",
    },
  ].map((door) => ({
    sourceId: "ppsc" as const,
    source: "Province PSC",
    organization: door.titleNp,
    category: "administration" as const,
    kind: "notice" as const,
    note: "Open the commission site for the full Nepali advertisement. This row is the door, not a seat count.",
    ...door,
  }));

  items.push(
    ...nrbPosts.map((item) => stamp(item, today)),
    ...rbbPosts.map((item) => stamp(item, today)),
    ...adblPosts.map((item) => stamp(item, today)),
    ...nblPosts.map((item) => stamp(item, today)),
    ...karnaliPosts.map((item) => stamp(item, today)),
    ...koshiPosts.map((item) => stamp(item, today)),
    ...provinceDoors.map((item) => stamp(item, today)),
  );

  for (const bank of CLASS_A_BANKS) {
    items.push(
      stamp(
        {
          id: `bank-page-${bank.slug}`,
          sourceId: "banks",
          source: "A-class banks",
          title: `${bank.name} career page`,
          organization: bank.name,
          category: "other",
          href: bank.href,
          kind: "notice",
          note: "Private A-class bank. Openings change on the bank's own page.",
        },
        today,
      ),
    );
  }

  const count = (id: SourceId) => items.filter((item) => item.sourceId === id).length;
  const sources: SourceHealth[] = [
    { id: "nrb", name: "Nepal Rastra Bank", homepage: "https://www.nrb.org.np/", ok: true, count: count("nrb") },
    { id: "rbb", name: "Rastriya Banijya Bank", homepage: RBB_NOTICE, ok: true, count: count("rbb") },
    { id: "adbl", name: "Agricultural Development Bank", homepage: ADBL_HOME, ok: true, count: count("adbl") },
    { id: "nbl", name: "Nepal Bank Limited", homepage: NBL_JOBS, ok: true, count: count("nbl") },
    { id: "ppsc", name: "Province public service commissions", homepage: "https://ppsc.karnali.gov.np/", ok: true, count: count("ppsc") },
    { id: "banks", name: "Other A-class banks", homepage: "https://www.nrb.org.np/", ok: true, count: count("banks") },
    { id: "ntc", name: "Nepal Telecom", homepage: NTC_HOME, ok: true, count: count("ntc") },
    { id: "nea", name: "Nepal Electricity Authority", homepage: "https://www.nea.org.np/", ok: true, count: count("nea") },
  ];

  return { sources, items };
}
