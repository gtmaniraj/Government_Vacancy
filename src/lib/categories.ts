import type { PostCategory, Vacancy } from "@/lib/vacancies";

export const CATEGORY_ORDER: PostCategory[] = [
  "it",
  "teaching",
  "medical",
  "engineering",
  "agriculture",
  "administration",
  "accounts",
  "law",
  "forestry",
  "other",
];

export const CATEGORY_LABEL: Record<PostCategory, string> = {
  it: "IT",
  teaching: "Teaching",
  medical: "Medical",
  administration: "Administration",
  law: "Law",
  accounts: "Accounts",
  engineering: "Engineering",
  agriculture: "Agriculture",
  forestry: "Forestry",
  other: "Other",
};

const RULES: { id: PostCategory; pattern: RegExp }[] = [
  {
    id: "teaching",
    pattern:
      /teacher|शिक्षक|शिक्षण|प्राथमिक शिक्षक|निम्न माध्यमिक|माध्यमिक शिक्षक|education officer|शिक्षा अधिकृत|शिक्षा सेवा/i,
  },
  {
    id: "medical",
    pattern:
      /medical|health officer|नर्सि|nurse|स्वास्थ्य|अ\.?\s*न\.?\s*मी|अ\.?\s*हे\.?\s*व|anm|ahw|dental|दाँ?त|फार्मेस|lab technologist|public health|हेल्थ|मिडवाइफ|मेडिकल/i,
  },
  {
    id: "law",
    pattern: /कानुन|कानून|law officer|legal|वाणिज्य कानून|commercial law/i,
  },
  {
    id: "accounts",
    pattern:
      /लेखा|account|audit|अडिट|chartered|\bca\b|acca|cpa|राजस्व|revenue|cash|क्यास|cashier|finance officer/i,
  },
  {
    id: "it",
    pattern:
      /information technology|सूचना प्रविधि|computer|कम्प्युटर|कम्प्यूटर|\(it\)|आई\.?\s*टी|software|साइबर|cyber|system analyst|programmer/i,
  },
  {
    id: "engineering",
    pattern:
      /engineer|इन्जिनियर|ओभरसियर|overseer|surveyor|अमिन|amin|सिभिल|civil|electrical|विद्युत|sub-engineer|सब-इन्जिनियर|सव-इन्जिनियर|highway|sanitary|telecom|junior technician/i,
  },
  {
    id: "agriculture",
    pattern:
      /कृषि|agriculture|veterinary|भेटे?रि|livestock|पशु|मत्स्य|fisher|horticulture|बागवानी|बाली|agri|supply chain|animal health/i,
  },
  { id: "forestry", pattern: /वन |वन सेवा|forestry|forest officer|वन अधिकृत|रेंजर/i },
  {
    id: "administration",
    pattern:
      /प्रशासन|section officer|शाखा अधिकृत|नायब सुब्बा|नायब|खरिदार|assistant director|सहायक निर्देशक|office assistant|branch manager|business officer|शाखा प्रमुख|निजामती|administration|customer relationship|प्रबन्धक|प्रबंधक|सहायक(?!\s*निर्देशक\s*\(सूचना)/i,
  },
];

export function classify(item: Pick<Vacancy, "title" | "titleEn" | "post" | "organization" | "sourceId" | "note">): PostCategory {
  if (item.sourceId === "tsc") return "teaching";
  const blob = [item.title, item.titleEn, item.post, item.organization, item.note].filter(Boolean).join(" ");
  for (const rule of RULES) {
    if (rule.pattern.test(blob)) return rule.id;
  }
  return "other";
}
