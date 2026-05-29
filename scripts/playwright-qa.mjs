import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const targetUrl = process.env.QA_TARGET_URL ?? "http://127.0.0.1:5173";
const outDir = new URL("../.logs/", import.meta.url);

const clickSequence = ["rock", "scissors", "paper", "rock", "scissors"];

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const getFit = async (page) =>
  page.evaluate(() => {
    const readRect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        bottom: Math.round(rect.bottom),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    };

    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
      canScrollX:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
      canScrollY:
        document.documentElement.scrollHeight >
        document.documentElement.clientHeight,
      regions: {
        duel: readRect(".duel-panel"),
        moves: readRect(".move-buttons"),
        history: readRect(".history-panel"),
        opponent: readRect(".opponent-card"),
      },
    };
  });

const playFiveRounds = async (page) => {
  for (const move of clickSequence) {
    await page.getByTestId(`move-${move}`).click();
  }
};

const runViewport = async ({ browser, name, viewport, isMobile = false }) => {
  const context = await browser.newContext({
    viewport,
    isMobile,
    hasTouch: isMobile,
  });
  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: "domcontentloaded" });

  const title = await page.title();
  assert(title === "道場じゃんけん", `${name}: unexpected title`);

  const buttons = await page.locator(".move-button").allTextContents();
  assert(buttons.length === 3, `${name}: move buttons missing`);
  assert(
    buttons.join(" ").includes("グー") &&
      buttons.join(" ").includes("チョキ") &&
      buttons.join(" ").includes("パー"),
    `${name}: move labels missing`,
  );

  const initialFit = await getFit(page);
  assert(!initialFit.canScrollX, `${name}: horizontal scroll on initial view`);
  assert(initialFit.regions.moves.bottom <= viewport.height, `${name}: moves clipped`);

  await page.screenshot({
    path: new URL(`${name}-initial.png`, outDir).pathname,
    fullPage: false,
  });

  await playFiveRounds(page);

  const resultText = await page.getByTestId("match-result").textContent();
  assert(resultText.includes("最終結果"), `${name}: final result missing`);

  const historyCount = await page.locator(".history-panel li").count();
  assert(historyCount === 5, `${name}: history length mismatch`);

  const disabledCount = await page.locator(".move-button:disabled").count();
  assert(disabledCount === 3, `${name}: move buttons should be disabled`);

  const finishedFit = await getFit(page);
  assert(!finishedFit.canScrollX, `${name}: horizontal scroll after match`);
  if (!isMobile) {
    assert(!finishedFit.canScrollY, `${name}: desktop vertical scroll after match`);
  }

  await page.screenshot({
    path: new URL(`${name}-finished.png`, outDir).pathname,
    fullPage: false,
  });

  await page.locator(".reset-button").click();
  const finalResultCount = await page.getByTestId("match-result").count();
  assert(finalResultCount === 0, `${name}: reset did not clear result`);

  const enabledCount = await page.locator(".move-button:not(:disabled)").count();
  assert(enabledCount === 3, `${name}: reset did not re-enable moves`);

  await context.close();

  return {
    name,
    initialFit,
    finishedFit,
    resultText: resultText.replace(/\s+/g, " ").trim(),
  };
};

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const results = [];
  results.push(
    await runViewport({
      browser,
      name: "desktop",
      viewport: { width: 1600, height: 900 },
    }),
  );
  results.push(
    await runViewport({
      browser,
      name: "mobile",
      viewport: { width: 390, height: 844 },
      isMobile: true,
    }),
  );

  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
