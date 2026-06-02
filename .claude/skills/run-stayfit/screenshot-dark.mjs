// Screenshot helper that forces dark theme AFTER hydration (React reconciles <html>
// className on hydrate, so we must add `dark` post-load, not via addInitScript).
// Usage: node screenshot-dark.mjs <url> <outPath> [width] [height]
import { chromium } from "playwright";

const [, , url, outPath, w = "390", h = "844"] = process.argv;
if (!url || !outPath) {
  console.error("Usage: node screenshot-dark.mjs <url> <outPath> [width] [height]");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 2,
});
await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(1500); // let React hydrate + commit <html> className
await page.evaluate(() => document.documentElement.classList.add("dark"));
await page.waitForTimeout(500);
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log("Saved dark screenshot:", outPath);
