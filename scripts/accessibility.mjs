import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 375, height: 812 },
});
const page = await context.newPage();
await page.goto(process.env.TEST_URL || "http://127.0.0.1:3001");
const results = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
  .analyze();
console.log(
  JSON.stringify(
    results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
    null,
    2,
  ),
);
await browser.close();
await mkdir('test-results', { recursive: true });
await writeFile('test-results/accessibility.json', JSON.stringify(results.violations, null, 2));
assert.equal(results.violations.length, 0);
