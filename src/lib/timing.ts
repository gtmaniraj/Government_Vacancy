import { daysFromToday } from "@/lib/bs";
import type { Vacancy, VacancyStatus } from "@/lib/vacancies";

export function vacancyTiming(
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
