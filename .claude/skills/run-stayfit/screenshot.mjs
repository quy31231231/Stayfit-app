// Screenshot helper for StayFit verification.
// Usage: node screenshot.mjs <url> <outPath> [width] [height]
// Defaults to a mobile viewport (390x844) since StayFit is a mobile-first PWA.
import { chromium } from "playwright";

const [, , url, outPath, w = "390", h = "844"] = process.argv;
if (!url || !outPath) {
  console.error("Usage: node screenshot.mjs <url> <outPath> [width] [height]");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: 2,
});
await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
// settle entrance animations / fonts
await page.waitForTimeout(800);
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log("Saved screenshot:", outPath);
