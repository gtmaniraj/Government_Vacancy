import { writeFileSync } from "node:fs";
import { createServer } from "vite";

const savedPages = process.env.GITHUB_PAGES;
const savedStatic = process.env.VITE_STATIC_BOARD;
delete process.env.GITHUB_PAGES;
delete process.env.VITE_STATIC_BOARD;

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});

try {
  const mod = await server.ssrLoadModule("/src/lib/board.functions.ts");
  const board = await mod.loadBoard(true);
  const json = `${JSON.stringify(board, null, 2)}\n`;
  writeFileSync(new URL("../src/data/board.snapshot.json", import.meta.url), json);
  writeFileSync(new URL("../public/board.json", import.meta.url), json);
  const open = board.items.filter((item) => item.status === "open" || item.status === "double").length;
  console.log(
    `board: ${board.items.length} items, ${open} open or in the double-fee window, today ${board.todayLabel}`,
  );
} finally {
  await server.close();
  if (savedPages === undefined) delete process.env.GITHUB_PAGES;
  else process.env.GITHUB_PAGES = savedPages;
  if (savedStatic === undefined) delete process.env.VITE_STATIC_BOARD;
  else process.env.VITE_STATIC_BOARD = savedStatic;
}
