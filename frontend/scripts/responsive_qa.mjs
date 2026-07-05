import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || "playwright");

const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:3010";
const outDir = process.env.QA_OUT_DIR || path.resolve(process.cwd(), "../qa/responsive");
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "ipad-landscape", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 1000 },
];

const routes = [
  { name: "landing", path: "/" },
  { name: "pitch", path: "/pitch" },
  { name: "app", path: "/app" },
];

function collectLayoutMetrics() {
  const vw = window.innerWidth;
  const doc = document.documentElement;
  const body = document.body;
  const horizontalOverflow = Math.max(doc.scrollWidth, body?.scrollWidth || 0) - vw;
  const visibleTextOverflows = [];
  const overlappingClickable = [];

  const nodes = Array.from(document.querySelectorAll("body *"));
  for (const el of nodes) {
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
      continue;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      continue;
    }
    const text = (el.textContent || "").trim().replace(/\s+/g, " ");
    if (text && el.scrollWidth > el.clientWidth + 3 && rect.width < vw - 4) {
      const tag = el.tagName.toLowerCase();
      if (["button", "a", "span", "p", "h1", "h2", "h3", "label", "div"].includes(tag)) {
        visibleTextOverflows.push({
          tag,
          text: text.slice(0, 90),
          clientWidth: el.clientWidth,
          scrollWidth: el.scrollWidth,
        });
      }
    }
  }

  const clickables = Array.from(document.querySelectorAll("a, button, input, select, textarea")).filter((el) => {
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  });

  for (let i = 0; i < clickables.length; i += 1) {
    const a = clickables[i];
    const ar = a.getBoundingClientRect();
    for (let j = i + 1; j < clickables.length; j += 1) {
      const b = clickables[j];
      const br = b.getBoundingClientRect();
      const xOverlap = Math.max(0, Math.min(ar.right, br.right) - Math.max(ar.left, br.left));
      const yOverlap = Math.max(0, Math.min(ar.bottom, br.bottom) - Math.max(ar.top, br.top));
      if (xOverlap > 8 && yOverlap > 8) {
        overlappingClickable.push({
          a: (a.textContent || a.getAttribute("aria-label") || a.tagName).trim().slice(0, 60),
          b: (b.textContent || b.getAttribute("aria-label") || b.tagName).trim().slice(0, 60),
          area: Math.round(xOverlap * yOverlap),
        });
      }
    }
  }

  return {
    title: document.title,
    path: location.pathname,
    bodySample: document.body.innerText.slice(0, 500),
    viewport: { width: vw, height: window.innerHeight },
    docSize: { scrollWidth: doc.scrollWidth, scrollHeight: doc.scrollHeight },
    horizontalOverflow,
    visibleTextOverflows: visibleTextOverflows.slice(0, 20),
    overlappingClickable: overlappingClickable.slice(0, 20),
  };
}

async function authenticateDemo(page) {
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const demoButton = page.getByRole("button", { name: /try sandbox demo|connect demo account|start live demo/i }).first();
  try {
    if (await demoButton.count()) {
      await demoButton.click();
      await page.waitForTimeout(1000);
    }
  } catch {
    // Some staging/offline surfaces intentionally hide demo controls.
  }
}

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
});

const results = [];
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      locale: "en-IN",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    await authenticateDemo(page);

    for (const route of routes) {
      await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const metrics = await page.evaluate(collectLayoutMetrics);
      const fileName = `${viewport.name}-${route.name}.png`;
      const filePath = path.join(outDir, fileName);
      await page.screenshot({ path: filePath, fullPage: true });
      results.push({
        viewport: viewport.name,
        route: route.name,
        filePath,
        ...metrics,
      });
    }

    await context.close();
  }
} finally {
  await browser.close();
}

await fs.writeFile(path.join(outDir, "responsive-report.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results.map((result) => ({
  viewport: result.viewport,
  route: result.route,
  horizontalOverflow: result.horizontalOverflow,
  textOverflowCount: result.visibleTextOverflows.length,
  overlapCount: result.overlappingClickable.length,
  filePath: result.filePath,
})), null, 2));
