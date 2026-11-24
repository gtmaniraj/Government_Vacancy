import { createFileRoute } from "@tanstack/react-router";
import { VacancyBoard } from "@/components/vacancy-board";
import snapshot from "@/data/board.snapshot.json";
import { getBoard } from "@/lib/board.functions";
import type { Board } from "@/lib/vacancies";

async function loadInitial(): Promise<Board> {
  if (import.meta.env.VITE_STATIC_BOARD === "true") {
    return snapshot as Board;
  }
  try {
    return await getBoard();
  } catch {
    return snapshot as Board;
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
