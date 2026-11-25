import { asciiDigits } from "@/lib/bs";
import { CATEGORY_LABEL, classify } from "@/lib/categories";
import type { PostCategory, Vacancy } from "@/lib/vacancies";

/** Longest phrases first so "सहायक निर्देशक" wins over "सहायक". */
const PHRASES: [string, string][] = [
  ["सहायक निर्देशक (सूचना प्रविधि)", "Assistant Director (Information Technology)"],
  ["सहायक निर्देशक (लेखा/लेखापरीक्षण)", "Assistant Director (Accounts and Audit)"],
  ["सहायक निर्देशक (वाणिज्य कानुन)", "Assistant Director (Commercial Law)"],
  ["सहायक निर्देशक (वाणिज्य कानून)", "Assistant Director (Commercial Law)"],
  ["सहायक निर्देशक", "Assistant Director"],
  ["मेडिकल ल्याब टेक्नोलोजिस्ट", "Medical Lab Technologist"],
  ["पब्लिक हेल्थ अधिकृत", "Public Health Officer"],
  ["जनस्वास्थ्य अधिकृत", "Public Health Officer"],
  ["मेडिकल अधिकृत", "Medical Officer"],
  ["डेन्टल सर्जन", "Dental Surgeon"],
  ["कृषि प्रसार अधिकृत", "Agriculture Extension Officer"],
  ["बाली विकास अधिकृत", "Crop Development Officer"],
  ["पशु विकास अधिकृत", "Livestock Development Officer"],
  ["भेटेरिनरी अधिकृत", "Veterinary Officer"],
  ["मत्स्य विकास अधिकृत", "Fisheries Development Officer"],
  ["शिक्षा अधिकृत", "Education Officer"],
  ["लेखा अधिकृत", "Accounts Officer"],
  ["राजस्व अधिकृत", "Revenue Officer"],
  ["कानून अधिकृत", "Law Officer"],
  ["कानुन अधिकृत", "Law Officer"],
  ["शाखा अधिकृत", "Section Officer"],
  ["नायब सुब्बा", "Nayab Subba"],
  ["खरिदार", "Kharidar"],
  ["सहायक सुब्बा", "Assistant Subba"],
  ["कार्यालय सहयोगी", "Office Helper"],
  ["अक्जिलियरी नर्स मिडवाइफ", "Auxiliary Nurse Midwife"],
  ["अ.न.मी.", "Auxiliary Nurse Midwife (ANM)"],
  ["अहेव", "Auxiliary Health Worker (AHW)"],
  ["अ.हे.व.", "Auxiliary Health Worker (AHW)"],
  ["सहायक सब-इन्जिनियर", "Assistant Sub-Engineer"],
  ["सव-इन्जिनियर", "Sub-Engineer"],
  ["सब-इन्जिनियर", "Sub-Engineer"],
  ["कनिष्ठ प्राविधिक सहायक", "Junior Technical Assistant"],
  ["कनिष्ठ पशु स्वास्थ्य प्राविधिक", "Junior Animal Health Technician"],
  ["कनिष्ठ पशु सेवा प्राविधिक", "Junior Livestock Service Technician"],
  ["खानेपानी तथा सरसफाइ प्राविधिक", "Water Supply and Sanitation Technician"],
  ["प्राविधिक सहायक", "Technical Assistant"],
  ["प्रशासन सहायक", "Administration Assistant"],
  ["लेखा सहायक", "Accounts Assistant"],
  ["सूचना प्रविधि", "Information Technology"],
  ["कम्प्युटर अधिकृत", "Computer Officer"],
  ["कम्प्यूटर अधिकृत", "Computer Officer"],
  ["इन्जिनियरिङ सेवा", "Engineering service"],
  ["इन्जिनियर", "Engineer"],
  ["ओभरसियर", "Overseer"],
  ["अमिन", "Amin (Surveyor)"],
  ["कृषि सेवा", "Agriculture service"],
  ["स्वास्थ्य सेवा", "Health service"],
  ["शिक्षा सेवा", "Education service"],
  ["प्रशासन सेवा", "Administration service"],
  ["वन सेवा", "Forest service"],
  ["लोक सेवा आयोग", "Public Service Commission"],
  ["शिक्षक सेवा आयोग", "Teachers Service Commission"],
  ["प्रदेश लोक सेवा आयोग", "Province Public Service Commission"],
  ["प्राथमिक शिक्षक", "Primary Teacher"],
  ["निम्न माध्यमिक शिक्षक", "Lower Secondary Teacher"],
  ["माध्यमिक शिक्षक", "Secondary Teacher"],
  ["शिक्षक", "Teacher"],
  ["विज्ञापन", "Advertisement"],
  ["दरखास्त आह्वान", "applications invited"],
  ["परीक्षा केन्द्र", "examination centre"],
  ["परीक्षा तालिका", "examination schedule"],
  ["लिखित परीक्षा", "written examination"],
  ["नतिजा", "result"],
  ["सिफारिस", "recommendation"],
  ["खुला प्रतियोगिता", "open competition"],
  ["खुला तथा समावेशी", "open and inclusive"],
  ["आन्तरिक प्रतियोगिता", "internal competition"],
  ["कार्यक्षमता मूल्यांकन", "performance evaluation"],
  ["स्थानीय सेवा", "local service"],
  ["प्रदेश निजामती सेवा", "provincial civil service"],
  ["अधिकृत स्तर", "officer level"],
  ["सहायक स्तर", "assistant level"],
  ["प्राविधिक", "technical"],
  ["अप्राविधिक", "non-technical"],
  ["सूचना", "notice"],
];

function hasDevanagari(value: string): boolean {
  return /[\u0900-\u097F]/.test(value);
}

function tidy(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/^[,.\s]+|[,.\s]+$/g, "")
    .trim();
}

export function toEnglish(title: string, category: PostCategory): string {
  if (!hasDevanagari(title)) return tidy(title);
  let out = asciiDigits(title);
  const found: string[] = [];
  for (const [nepali, english] of PHRASES) {
    if (out.includes(nepali)) {
      found.push(english);
      out = out.split(nepali).join(english);
    }
  }
  out = tidy(out);
  const devanagari = (out.match(/[\u0900-\u097F]/g) ?? []).length;
  const letters = out.replace(/\s/g, "").length || 1;
  if (devanagari / letters < 0.28) return out;
  if (found.length > 0) {
    const unique = [...new Set(found)];
    return `${CATEGORY_LABEL[category]}: ${unique.join(" · ")}`;
  }
  return `${CATEGORY_LABEL[category]} notice`;
}

export function annotateVacancy(item: Vacancy): Vacancy {
  const category = item.category ?? classify(item);
  const nepali = item.titleNp ?? (hasDevanagari(item.title) ? item.title : undefined);
  const titleEn =
    item.titleEn ?? (hasDevanagari(item.title) ? toEnglish(item.title, category) : item.title);
  return { ...item, category, titleNp: nepali, titleEn };
}
