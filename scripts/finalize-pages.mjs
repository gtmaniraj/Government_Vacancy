import { cpSync, existsSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function findIndexes(dir, found) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) findIndexes(path, found);
    else if (name === "index.html") found.push(path);
  }
}

const found = [];
for (const root of ["dist", ".output"]) findIndexes(root, found);
const index =
  found.find((path) => path.endsWith(`${join("client", "index.html")}`)) ??
  found.find((path) => !path.includes(`${join("server", "")}`)) ??
  found[0];

if (!index) {
  console.error("Pages build did not emit index.html.");
  process.exit(1);
}

const dir = join(index, "..");
writeFileSync(join(dir, ".nojekyll"), "");
cpSync(index, join(dir, "404.html"));

rmSync("pages", { recursive: true, force: true });
cpSync(dir, "pages", { recursive: true });
console.log(`GitHub Pages output: pages/ (from ${dir})`);
