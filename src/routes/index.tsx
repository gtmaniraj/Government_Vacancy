import { createFileRoute } from "@tanstack/react-router";
import { VacancyBoard } from "@/components/vacancy-board";
import snapshot from "@/data/board.snapshot.json";
import { extraBundle } from "@/data/openings";
import { formatBs, todayBsIso } from "@/lib/bs";
import { getBoard } from "@/lib/board.functions";
import { annotateVacancy } from "@/lib/translate";
import type { Board } from "@/lib/vacancies";

function fallbackBoard(): Board {
  const today = todayBsIso();
  const extra = extraBundle(today);
  return {
    fetchedAt: new Date().toISOString(),
    todayBs: today,
    todayLabel: formatBs(today),
    sources: extra.sources,
    items: extra.items.map(annotateVacancy),
  };
}

async function loadInitial(): Promise<Board> {
  if (import.meta.env.VITE_STATIC_BOARD === "true") {
    return snapshot as Board;
  }
  try {
    return await getBoard();
  } catch {
    return fallbackBoard();
  }
}

export const Route = createFileRoute("/")({
  loader: () => loadInitial(),
  component: Home,
});

function Home() {
  const board = Route.useLoaderData();
  return <VacancyBoard initial={board} />;
}
