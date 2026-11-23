import { createFileRoute } from "@tanstack/react-router";
import { VacancyBoard } from "@/components/vacancy-board";
import { getBoard } from "@/lib/board.functions";

export const Route = createFileRoute("/")({
  loader: () => getBoard(),
  component: Home,
});

function Home() {
  const board = Route.useLoaderData();
  return <VacancyBoard initial={board} />;
}
