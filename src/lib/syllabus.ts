import orgSyllabi from "@/data/org-syllabi.json";
import pscCourses from "@/data/psc-courses.json";
import type { Syllabus, Vacancy } from "@/lib/vacancies";

type OrgRow = {
  publisher: string;
  indexUrl: string;
  papers: { label: string; url: string }[];
  note?: string;
};

type PscCourse = {
  service: string;
  level: string;
  post: string;
  group: string;
  date: string;
  papers: { label: string; url: string }[];
};

const ORG = orgSyllabi as Record<string, OrgRow>;
const COURSES = (pscCourses as { courses: PscCourse[] }).courses;

const PSC_INDEX = "https://psc.gov.np/category/course";
const NTC_910 = "https://www.ntc.net.np/post/syllabus-for-level-9-and-level-10";
const NTC_78 = "https://www.ntc.net.np/post/syllabus-for-level-7-and-level-8";
const NTC_56 = "https://www.ntc.net.np/post/syllabus-level-5-and-level-6";
const NRB_INDEX = "https://www.nrb.org.np/category/open-competition-syllabus/";
const NRB_AD =
  "https://www.nrb.org.np/hrm/%e0%a4%b8%e0%a4%b9%e0%a4%be%e0%a4%af%e0%a4%95-%e0%a4%a8%e0%a4%bf%e0%a4%b0%e0%a5%8d%e0%a4%a6%e0%a5%87%e0%a4%b6%e0%a4%95-%e0%a4%85%e0%a4%a7%e0%a4%bf%e0%a4%95%e0%a5%83%e0%a4%a4-%e0%a4%a4%e0%a5%83-19/";
const NRB_ASSISTANT =
  "https://www.nrb.org.np/hrm/%e0%a4%b8%e0%a4%b9%e0%a4%be%e0%a4%af%e0%a4%95-%e0%a4%b8%e0%a4%b9%e0%a4%be%e0%a4%af%e0%a4%95-%e0%a4%a6%e0%a5%8d%e0%a4%b5%e0%a4%bf%e0%a4%a4%e0%a5%80%e0%a4%af-%e0%a4%aa%e0%a4%a6%e0%a4%95%e0%a5%8b-5/";
const NRB_ACCOUNTS =
  "https://www.nrb.org.np/hrm/%e0%a4%b8%e0%a4%b9%e0%a4%be%e0%a4%af%e0%a4%95-%e0%a4%a8%e0%a4%bf%e0%a4%b0%e0%a5%8d%e0%a4%a6%e0%a5%87%e0%a4%b6%e0%a4%95-%e0%a4%b2%e0%a5%87%e0%a4%96%e0%a4%be-%e0%a4%b2%e0%a5%87%e0%a4%96%e0%a4%be-2/";
const NRB_LAW =
  "https://www.nrb.org.np/hrm/%e0%a4%b8%e0%a4%b9%e0%a4%be%e0%a4%af%e0%a4%95-%e0%a4%a8%e0%a4%bf%e0%a4%b0%e0%a5%8d%e0%a4%a6%e0%a5%87%e0%a4%b6%e0%a4%95-%e0%a4%b5%e0%a4%be%e0%a4%a3%e0%a4%bf%e0%a4%9c%e0%a5%8d%e0%a4%af-%e0%a4%95-2/";
const NRB_IT =
  "https://www.nrb.org.np/hrm/%e0%a4%b8%e0%a4%b9%e0%a4%be%e0%a4%af%e0%a4%95-%e0%a4%a8%e0%a4%bf%e0%a4%b0%e0%a5%8d%e0%a4%a6%e0%a5%87%e0%a4%b6%e0%a4%95-%e0%a4%b8%e0%a5%82%e0%a4%9a%e0%a4%a8%e0%a4%be-%e0%a4%aa%e0%a5%8d%e0%a4%b0-3/";

function fold(value: string): string {
  return value
    .toLowerCase()
    .replace(/नायब/g, "नायव")
    .replace(/वा सो सरह/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function syllabus(publisher: string, indexUrl: string, url: string, label: string, english: string[]): Syllabus {
  return { publisher, indexUrl, papers: [{ label, url }], english };
}

const NTC_TAIL =
  "Nepal Telecom prints the unit list in the PDF. These English lines are the exam shape taken from that file, not a substitute for it.";

const NTC_CA = [
  "Nepal Telecom, Level 9, Deputy Manager (Chartered Accountant). Administration service, accounts group. Open and internal.",
  "The syllabus is split into two stages. Stage 1 is a written exam of 200 marks. Stage 2 is an interview of 30 marks.",
  "Paper I is institutional and managerial knowledge: 100 marks, pass mark 40, 3 hours. Six analytical questions of 10 marks and two problem-solving questions of 20 marks.",
  "Paper II is the service subject (chartered accountancy): 100 marks, pass mark 40, 3 hours, with the same question pattern.",
  "The two papers are held separately. Questions may be in Nepali, English, or both, and answers may be in either language.",
  NTC_TAIL,
];

const NTC_ENGINEER = [
  "Nepal Telecom officer syllabus, open and internal. Written exam 200 marks, then an interview of 30 marks.",
  "Paper I is general awareness, management and institutional awareness: 100 marks, pass mark 40. Fifty multiple-choice questions of 1 mark (45 minutes), then six short questions of 5 marks and two long questions of 10 marks (1 hour 30 minutes).",
  "Paper II is the technical subject for this service: 100 marks, pass mark 40, 3 hours. Four short questions of 5 marks and eight long questions of 10 marks.",
  "A wrong multiple-choice answer costs 20 percent of that question. A blank answer is not penalised. Mark A, B, C or D in capital letters.",
  NTC_TAIL,
];

const NTC_ASSISTANT = [
  "Nepal Telecom assistant-level syllabus, open competition. Written exam 200 marks, then an interview of 30 marks.",
  "Paper I is general knowledge and mathematics: 100 marks, pass mark 40. Fifty multiple-choice questions of 2 marks, in 45 minutes.",
  "Paper II is institutional knowledge and the service: 100 marks, pass mark 40, 2 hours 30 minutes. Twelve short questions of 5 marks and four long questions of 10 marks.",
  "A wrong multiple-choice answer costs 20 percent of that question. A blank answer is not penalised. Calculators are not allowed on the multiple-choice paper.",
  NTC_TAIL,
];

const NTC_TECH_ASSISTANT = [
  "Nepal Telecom technical assistant syllabus. The advertisement also sets a practical test for Telecom Technician (level 4) and Junior Technician (level 3), on top of the written exam and interview.",
  "Read the official PDF for the mark split. The written papers follow the assistant-level pattern: a general-knowledge paper, then a service paper.",
  NTC_TAIL,
];

const NTC_FILES: Record<string, { url: string; index: string; english: string[]; label: string }> = {
  "40/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/3JSgN9iax7vk45Y8gGVgDYfFYGPc6Kow1XFDmqsm.pdf",
    index: NTC_910,
    english: NTC_CA,
    label: "Level 9 Deputy Manager (CA)",
  },
  "41/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/vEkLMtsro2nWcQof2xPHWOtcp2zQEyXUeYnMu4gb.pdf",
    index: NTC_78,
    english: NTC_ENGINEER,
    label: "Level 8 Senior Engineer (Telecom)",
  },
  "42/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/ro7L7JTyEk2DMx1a59sOSzE6N0mzliC2kWBvnbtx.pdf",
    index: NTC_78,
    english: NTC_ENGINEER,
    label: "Level 8 Senior Business Officer",
  },
  "43/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/UcO4DAzacnWMpey60m3nQiEMPOQC3MIYjahxsHnW.pdf",
    index: NTC_78,
    english: NTC_ENGINEER,
    label: "Level 8 Senior Accounts Officer",
  },
  "44/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/S13u1wsKvCZbTN6mblzwZQJ7hdU10XouX5LyBADi.pdf",
    index: NTC_78,
    english: NTC_ENGINEER,
    label: "Level 7 Electronics and Communication",
  },
  "45/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/BFF4YyBxf0jXNo9Ihl1wCelOUkpnu2zNcpaEDwJX.pdf",
    index: NTC_78,
    english: NTC_ENGINEER,
    label: "Level 7 Computer Engineer",
  },
  "46/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/yprWsFhAetmZyy97YAMPvABcKK3N6Umw6fZFb3fs.pdf",
    index: NTC_78,
    english: NTC_ENGINEER,
    label: "Level 7 Electrical Engineer",
  },
  "47/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/GnaaPCrifxs7ArnyaF27Viyiy2NLVH3d6AUWFI8h.pdf",
    index: NTC_56,
    english: NTC_ASSISTANT,
    label: "Level 6 Assistant Administrative Officer",
  },
  "48/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/40v8LXpJgWajxg9vvd03A51I3zC2KPNWQSYnrV9J.pdf",
    index: NTC_56,
    english: NTC_ASSISTANT,
    label: "Level 6 Assistant Business Officer",
  },
  "49/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/dTGBgc7X9mAmVyChthIuHwnjFsEidtHJByRDgWt9.pdf",
    index: NTC_56,
    english: NTC_ASSISTANT,
    label: "Level 6 Assistant Accounts Officer",
  },
  "50/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/wFQUgKMYErJ4xUpVgdPqfZmQQEfMFy1sgAN3gl8n.pdf",
    index: NTC_56,
    english: NTC_ASSISTANT,
    label: "Level 5 Overseer",
  },
  "51/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/4Bi6sgPoLMyxH3hFqvBixbMQUycUW5RFFj0xA0md.pdf",
    index: NTC_56,
    english: NTC_TECH_ASSISTANT,
    label: "Level 4 Telecom Technician",
  },
  "52/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/IBa7sY2GES4OPVBBxn2RPFZ18468LzqAXuTDIP9k.pdf",
    index: NTC_56,
    english: NTC_ASSISTANT,
    label: "Level 4 Assistant",
  },
  "53/2083-84": {
    url: "https://cms.ntc.net.np/storage/media/FXTRMyP1JQnnZyAJdegjdhr14Di5P5y9KlqRfM11.pdf",
    index: NTC_56,
    english: NTC_TECH_ASSISTANT,
    label: "Level 3 Junior Technician",
  },
};

const PROVINCE_ENGLISH: Record<string, string[]> = {
  "koshi-mo": [
    "Medical Officer, health service, general health services, officer 8th level.",
    "Koshi Province PSC published this syllabus for advertisements of fiscal year 2083/84.",
    "It is the written-exam curriculum for that post. The file is in Nepali.",
  ],
  "koshi-eng": [
    "Civil engineer, officer 7th level. The file covers the general, highway, hydropower, irrigation, sanitary and airport subgroups.",
    "Koshi Province PSC applies it from fiscal year 2083/84.",
  ],
  "koshi-arch": [
    "Engineer, civil group, building and architecture subgroup, officer 7th level.",
    "Koshi Province PSC applies it from fiscal year 2083/84.",
  ],
  "koshi-agri-ext": [
    "Agriculture extension, with plant protection, agronomy, horticulture, soil science, and agricultural economics and marketing. Officer 7th level.",
    "One Koshi syllabus covers this group of agriculture posts.",
  ],
  "koshi-crop": [
    "Crop development sits in the agronomy group of the same 7th-level agriculture syllabus (plant protection, agronomy, horticulture, extension, soil, agricultural economics).",
  ],
  "koshi-vet": ["Veterinary officer, agriculture service, veterinary group, officer 7th level. In force for 2083/84 advertisements."],
  "koshi-livestock": [
    "Livestock development officer. Agriculture service, livestock, poultry and dairy development group, officer 7th level.",
  ],
  "koshi-fish": ["Fisheries development officer, agriculture service, fisheries group, officer 7th level."],
  "koshi-edu": ["Education officer, education administration group, officer 7th level. The Koshi file is the inspection-officer curriculum for that group."],
  "koshi-pho": [
    "Public health track at officer 7th level. Koshi publishes this as the health inspection group syllabus.",
  ],
  "koshi-lab": ["Medical lab technologist, officer 7th level, medical laboratory technology group."],
  "koshi-so": [
    "Section officer, officer 7th level. The file covers general administration, accounts, revenue and internal audit in one curriculum.",
  ],
  "koshi-ao": [
    "Accounts officer uses the same 7th-level administration syllabus as the section officer: general administration, accounts, revenue and internal audit.",
  ],
  "koshi-law": ["Law officer, local law service, law group, officer 7th level."],
  "karnali-admin-asst": [
    "Administration assistant, 4th level, provincial civil service and local service, general administration group.",
    "The same Karnali file also covers the accounts assistant.",
  ],
  "karnali-accounts-asst": [
    "Accounts assistant, 4th level. Karnali published one syllabus for the administration assistant and the accounts assistant.",
  ],
  "karnali-jta": [
    "Junior technical assistant in agriculture, 4th level. The file covers crop protection, crop development, horticulture, extension, soil science, and agricultural economics.",
  ],
  "karnali-sub-eng": [
    "Assistant sub-engineer, civil, 4th level. Karnali’s file is the civil, sanitary, and water-supply and sanitation technician syllabus.",
  ],
  "karnali-wss": [
    "Water supply and sanitation technician, 4th level, included in Karnali’s civil and sanitary technician syllabus.",
  ],
  "karnali-anm": ["Auxiliary nurse midwife, 4th level. General nursing and public or community health nursing, open competition."],
  "karnali-ahw": ["Auxiliary health worker, 4th level. Health inspection group, open competition."],
  "karnali-amin": [
    "Amin (surveyor), 4th level technical. Use Karnali’s 4th-level technical list and confirm the surveyor row in the PDF before you study a civil paper.",
  ],
};

function provinceSyllabus(id: string): Syllabus | undefined {
  if (id === "karnali-jah" || id === "karnali-livestock") {
    return syllabus(
      "Karnali Province PSC",
      "https://ppsc.karnali.gov.np/category/the-fourth-layer/",
      "https://ppsc.karnali.gov.np/category/the-fourth-layer/",
      "4th-level syllabus list",
      [
        id === "karnali-jah"
          ? "Junior animal health technician, local service, 4th level technical."
          : "Junior livestock service technician, local service, 4th level technical.",
        "Karnali’s published 4th-level list has a crop and horticulture file, and separate health files. Animal health and livestock are not those crop papers.",
        "Open the commission’s 4th-level syllabus list and take the row that names this post. The list is the official source.",
      ],
    );
  }
  const row = ORG[id];
  if (!row) return undefined;
  const english = [
    ...(PROVINCE_ENGLISH[id] ?? [row.note ?? "Official syllabus published by the province commission."]),
    "Study the commission PDF. This English reading names the post and the service. It does not rewrite the Nepali units.",
  ];
  return { publisher: row.publisher, indexUrl: row.indexUrl, papers: row.papers, english };
}

function nrb(id: string): Syllabus | undefined {
  const common = [
    "Nepal Rastra Bank publishes a separate open-competition syllabus for each group. The link is the bank’s own page.",
    "Written exam, then interview. Paper-wise marks and the topic list are in that file, which is in Nepali and English depending on the group.",
  ];
  if (id === "nrb-11-2083") {
    return syllabus(
      "Nepal Rastra Bank",
      NRB_INDEX,
      NRB_AD,
      "Assistant Director syllabus",
      [
        "Assistant Director, officer third, open and inclusive. Administration stream: economics, management or public administration.",
        "The bank’s current open-competition file for this post is the 16 October 2026 syllabus.",
        ...common,
      ],
    );
  }
  if (id === "nrb-12-2083") {
    return syllabus("Nepal Rastra Bank", NRB_INDEX, NRB_ACCOUNTS, "Accounts and audit syllabus", [
      "Assistant Director (accounts and audit), officer third. Qualification on the advertisement is CA, ACCA or CPA.",
      "Use the bank’s accounts-and-audit open-competition syllabus, not the general administration file.",
      ...common,
    ]);
  }
  if (id === "nrb-13-2083") {
    return syllabus("Nepal Rastra Bank", NRB_INDEX, NRB_LAW, "Commercial law syllabus", [
      "Assistant Director (commercial law), officer third.",
      "Use the bank’s commercial-law open-competition syllabus.",
      ...common,
    ]);
  }
  if (id === "nrb-14-2083") {
    return syllabus("Nepal Rastra Bank", NRB_INDEX, NRB_IT, "Information technology syllabus", [
      "Assistant Director (information technology), officer third.",
      "Use the bank’s information-technology open-competition syllabus, not the cyber-security file unless the advertisement names that group.",
      ...common,
    ]);
  }
  if (id === "nrb-15-2083") {
    return syllabus("Nepal Rastra Bank", NRB_INDEX, NRB_ASSISTANT, "Assistant syllabus", [
      "Assistant, assistant second. The bank’s open-competition syllabus is dated 1 Kartik 2082 (17 November 2025).",
      "The advertisement also requires a valid Lok Sewa pre-qualification certificate.",
      ...common,
    ]);
  }
  return undefined;
}

function ntc(id: string): Syllabus | undefined {
  const code = id.replace(/^ntc-/, "");
  const file = NTC_FILES[code];
  if (!file) return undefined;
  return syllabus("Nepal Telecom", file.index, file.url, file.label, file.english);
}

function closedBank(item: Vacancy): Syllabus | undefined {
  if (item.sourceId === "rbb" && item.kind === "vacancy") {
    const law = /law|कानुन|कानून/i.test(`${item.title} ${item.titleNp ?? ""}`);
    return syllabus(
      "Rastriya Banijya Bank",
      "https://www.rbb.com.np/career",
      law
        ? "https://www.rbb.com.np/uploads/files/career/1771752254Level%206,%20Law%20(Assistant%20Manager-Law).pdf"
        : "https://www.rbb.com.np/career",
      law ? "Level 6 law syllabus" : "Syllabus on the career page",
      [
        `${item.title}, ${item.level ?? "officer or assistant"}. Applications for this advertisement are closed.`,
        law
          ? "Paper I is economics and banking (two sections of 50 marks). Paper II is banking and related laws, systems and precedent."
          : "Rastriya Banijya Bank’s officer papers are a written exam of 200 marks. The first paper on the published administration syllabus is banking, accounting, financial analysis and economic policy.",
        "The career page is where the bank files the syllabus PDF for each level. Study that file.",
      ],
    );
  }
  if (item.sourceId === "adbl" && item.kind === "vacancy") {
    return syllabus(
      "Agricultural Development Bank",
      "https://vacancy.adbl.gov.np/",
      "https://vacancy.adbl.gov.np/",
      "Syllabus on the recruitment portal",
      [
        `${item.title}. Applications are closed. The written exam is conducted with Lok Sewa.`,
        "ADBL posts the syllabus on its recruitment portal: branch manager (level 8), business officer (level 6), and account officer CA/ACCA (level 6).",
        "Open that portal and download the PDF for this row. The English here only identifies which file to open.",
      ],
    );
  }
  if (item.sourceId === "nbl" && item.kind === "vacancy") {
    return syllabus(
      "Nepal Bank Limited",
      "https://jobs.nepalbank.com.np/",
      "https://jobs.nepalbank.com.np/",
      "Recruitment portal",
      [
        `${item.title}. Applications are closed. Lok Sewa has published the written-exam centres.`,
        "Nepal Bank takes the application on its own portal. The written syllabus is the one Lok Sewa approved for that level and group.",
        "Start from the bank portal, then the Lok Sewa course list if the bank page does not attach a PDF.",
      ],
    );
  }
  if (item.id.startsWith("nea-")) {
    return syllabus(
      "Nepal Electricity Authority",
      "https://www.nea.org.np/recruitment_open",
      "https://www.nea.org.np/recruitment_open",
      "Open-competition syllabus shelf",
      [
        "NEA keeps an open-competition syllabus shelf on its recruitment page, separate from the advertisement.",
        "Officer and assistant technical syllabi approved in 2080 use two stages: a written exam of 200 marks, then an interview of 30.",
        "The first paper starts with general knowledge and an IQ section, then the service subject. Pick the level that matches this advertisement.",
      ],
    );
  }
  return undefined;
}

function pscMatch(item: Vacancy): Syllabus | undefined {
  if (item.sourceId !== "psc" || item.kind !== "vacancy") return undefined;
  const post = fold(item.post || item.title);
  const level = fold(item.level || "");
  if (post.length < 4) return undefined;
  let best: { score: number; course: PscCourse } | undefined;
  for (const course of COURSES) {
    const name = fold(course.post);
    if (name.length < 4) continue;
    let score = 0;
    if (post === name) score = 100;
    else if ((name.includes(post) || post.includes(name)) && Math.min(post.length, name.length) >= 8) score = 86;
    else continue;
    const courseLevel = fold(course.level);
    if (level && courseLevel) {
      if (level === courseLevel || courseLevel.includes(level) || level.includes(courseLevel)) score += 12;
      else score -= 20;
    }
    if (!best || score > best.score || (score === best.score && course.date > best.course.date)) {
      best = { score, course };
    }
  }
  if (!best || best.score < 80) return undefined;
  const course = best.course;
  const english = [
    `${course.post}. Level: ${course.level}. Service: ${course.service}${course.group ? `. Group: ${course.group}` : ""}.`,
    `Lok Sewa Aayog published this syllabus on ${course.date}. Each paper below is a file on psc.gov.np.`,
  ];
  if (/शाखा अधिकृत/.test(course.post)) {
    english.push(
      "On the joint officer exam the first paper is general knowledge and a general ability test. The second paper is contemporary studies and public service management. A third paper, when the file includes one, is the subject of the service group.",
    );
  } else if (/नायव सुब्बा|खरिदार/.test(course.post)) {
    english.push(
      "Assistant-level syllabi use a first paper of general knowledge and a second paper on the service. Pass marks are on the first page of the PDF.",
    );
  } else {
    english.push(
      "The first pages of the PDF are the exam scheme: full marks, pass marks, and whether the paper is multiple choice or long answer. The later pages are the topics.",
    );
  }
  english.push("The PDF is the official text. These lines only put the paper names and the exam shape in English.");
  return {
    publisher: "Lok Sewa Aayog",
    indexUrl: PSC_INDEX,
    papers: course.papers.map((paper) => ({ label: paper.label, url: paper.url })),
    english,
  };
}

const TSC_LICENSE_PDF =
  "https://giwmscdnone.gov.np/media/pdf_upload/%E0%A4%AE%E0%A4%BE%E0%A4%A7%E0%A5%8D%E0%A4%AF%E0%A4%AE%E0%A4%BF%E0%A4%95%20%E0%A4%A4%E0%A4%B9%20%E0%A4%B2%E0%A4%BE%E0%A4%87%E0%A4%B8%E0%A5%87%E0%A4%A8%E0%A5%8D%E0%A4%B8%20%E0%A4%AA%E0%A4%BE%E0%A4%A0%E0%A5%8D%E0%A4%AF%E0%A4%95%E0%A5%8D%E0%A4%B0%E0%A4%AE_4nkwjkw.pdf";
const TSC_SYLLABUS_INDEX = "https://tsc.gov.np/category/79/?page=2";

function tscLicense(item: Vacancy): Syllabus | undefined {
  if (item.sourceId !== "tsc") return undefined;
  const blob = `${item.id} ${item.title} ${item.titleNp ?? ""} ${item.post ?? ""}`;
  if (!/tsc-license|teaching licen[cs]e|अध्यापन अनुमति/i.test(blob)) return undefined;
  return syllabus(
    "Teachers Service Commission",
    TSC_SYLLABUS_INDEX,
    TSC_LICENSE_PDF,
    "Secondary teaching licence syllabus 2078",
    [
      "Secondary level teaching licence, advertisement 45/2083/84. The written exam is objective. The commission will publish the date later.",
      "The notice points to the syllabus published on 2078/12/02. The file on the commission site is the 2078 secondary teaching-licence curriculum: full marks 100, pass mark 50, time 1 hour.",
      "It is one paper on school education in Nepal: the education system, new thinking in teaching, child psychology, school and community, the teacher's professional role, classroom management, curriculum, methods, assessment, and current education issues. This file has no separate subject paper.",
      "The PDF is the official text. These lines only put the exam shape in English.",
    ],
  );
}

export function matchSyllabus(item: Vacancy): Syllabus | undefined {
  return (
    tscLicense(item) ?? provinceSyllabus(item.id) ?? nrb(item.id) ?? ntc(item.id) ?? closedBank(item) ?? pscMatch(item)
  );
}
