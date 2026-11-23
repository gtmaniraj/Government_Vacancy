import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
await page.goto("file:///workspace/.grok/og-card.html", { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const metrics = await page.evaluate(() => {
  const title = document.querySelector("h1");
  const tag = document.querySelector(".tag");
  const colo = document.querySelector(".colophon");
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return {
      text: el.textContent,
      w: Math.round(r.width),
      h: Math.round(r.height),
      x: Math.round(r.x),
      y: Math.round(r.y),
      right: Math.round(r.right),
      bottom: Math.round(r.bottom),
    };
  };
  return {
    fonts: document.fonts.size,
    title: box(title),
    tag: box(tag),
    colophon: box(colo),
  };
});
console.log(JSON.stringify(metrics, null, 2));
await page.screenshot({
  path: "/workspace/.grok/og-raw.png",
  type: "png",
  clip: { x: 0, y: 0, width: 1200, height: 630 },
});

const iconPage = await browser.newPage({
  viewport: { width: 220, height: 120 },
  deviceScaleFactor: 2,
});
await iconPage.setContent(`<!DOCTYPE html><html><body style="margin:0;background:#ddd;display:flex;gap:16px;align-items:center;padding:12px">
<img id="s" src="file:///workspace/public/favicon.svg" width="16" height="16" />
<img id="m" src="file:///workspace/public/favicon.svg" width="32" height="32" />
<canvas id="c" width="160" height="160"></canvas>
<script>
  const img = document.getElementById("s");
  img.onload = () => {
    const c = document.getElementById("c");
    const ctx = c.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const tmp = document.createElement("canvas");
    tmp.width = 16; tmp.height = 16;
    tmp.getContext("2d").drawImage(img, 0, 0, 16, 16);
    ctx.drawImage(tmp, 0, 0, 160, 160);
  };
</script>
</body></html>`, { waitUntil: "load" });
await iconPage.waitForTimeout(200);
await iconPage.screenshot({ path: "/workspace/.grok/favicon-preview.png", type: "png" });
await browser.close();
writeFileSync("/workspace/.grok/og-metrics.json", JSON.stringify(metrics, null, 2));
