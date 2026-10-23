import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const base = process.env.TEST_URL || "http://127.0.0.1:3001";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await mkdir("test-results", { recursive: true });
const widths = [
  320, 360, 375, 390, 430, 599, 600, 768, 820, 899, 900, 1024, 1180, 1280, 1366,
  1440, 1600, 1920, 2560,
];
const results = [];
for (const width of widths) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator("h1").count(), 1);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    `Overflow at ${width}`,
  );
  const broken = await page
    .locator(
      "input:not([type=hidden]):not([name=website]),select,textarea,.button",
    )
    .evaluateAll((elements) =>
      elements
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.left < 0 || r.right > innerWidth + 1);
        })
        .map((el) => el.outerHTML),
    );
  assert.deepEqual(broken, [], `Clipped controls at ${width}`);
  results.push({ width, result: "passed" });
}
for (const [service, heading, image, title] of [
  [
    "entry",
    "Custom Solid Wood Entry Doors in Ottawa",
    "rideau-street-new",
    "Custom Solid Wood Doors Ottawa | Graemar",
  ],
  [
    "interior",
    "Solid Wood Interior Doors in Ottawa",
    "rockliffe-interior-new",
    "Solid Wood Interior Doors Ottawa | Graemar",
  ],
  [
    "heritage",
    "Heritage Carpentry & Reproduction Millwork",
    "cathedral-hill-after",
    "Heritage Carpentry Ottawa | Graemar",
  ],
  [
    "invalid",
    "Custom Solid Wood Entry Doors in Ottawa",
    "rideau-street-new",
    "Custom Solid Wood Doors Ottawa | Graemar",
  ],
]) {
  await page.goto(`${base}/?s=${service}`);
  assert.equal(await page.locator("h1").textContent(), heading);
  assert.match(
    await page.locator(".hero img").getAttribute("src"),
    new RegExp(image),
  );
  assert.equal(await page.title(), title);
}
await page.goto(base);
assert.equal(await page.locator('#reviews .review-card').count(), 3);
assert.deepEqual(await page.locator('#reviews .review-author').allTextContents(), ['nhill55','lisadkjohnson','Jamie McMillan']);
assert.equal(await page.locator('#reviews [aria-label="5 out of 5 stars"]').count(),3);
assert.match(await page.locator('#reviews .review-source').getAttribute('href'), /houzz\.com.*1762334131/);
assert.equal(await page.locator('script[src*="_next"]').count(),0);
assert.equal(await page.evaluate(() => bootstrap.Collapse.VERSION),'5.3.8');
await page.keyboard.press('Tab');
assert.equal(await page.locator(':focus').textContent().then(text=>text.trim()),'Skip to content');
await page.keyboard.press('Enter');
assert.equal(await page.locator(':focus').getAttribute('id'),'main');
assert.equal(await page.locator(".comparison-grid > .comparison").count(), 6);
assert.equal(await page.locator(".comparison-grid details").count(), 0);
for (const image of await page.locator("img").all()) {
  await image.scrollIntoViewIfNeeded();
  await image.evaluate((img) => img.decode());
  assert.ok(await image.evaluate((img) => img.naturalWidth > 0));
}
await page.locator(".faq summary").first().click();
assert.equal(
  await page.locator(".faq details").first().getAttribute("open"),
  "",
);
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(base);
assert.equal(
  await page
    .locator(".mobile-sticky")
    .evaluate((el) => getComputedStyle(el).visibility),
  "visible",
);
await page.locator("#projects").scrollIntoViewIfNeeded();
await page.waitForFunction(() =>
  document.querySelector(".mobile-sticky").classList.contains("is-visible"),
);
await page.locator(".mobile-sticky .button").click();
await page.waitForFunction(
  () =>
    document.querySelector(".mobile-sticky").classList.contains("is-visible"),
);
await page.goto(
  `${base}/?s=interior&gclid=test-click&utm_source=google&utm_medium=cpc&utm_campaign=doors&utm_term=custom&utm_content=ad1`,
);
assert.equal(
  await page.locator("input[name=gclid]").inputValue(),
  "test-click",
);
assert.equal(await page.locator("select").inputValue(), "Interior Doors");
await page.locator("form button").click();
assert.equal(
  await page
    .locator("input[name=name]")
    .evaluate((el) => el.validity.valueMissing),
  true,
);
await page.locator('form').getByLabel("Name", { exact: false }).fill("Test Person");
await page.getByLabel("Email", { exact: false }).fill("test@example.com");
await page.getByLabel("Phone", { exact: false }).fill("6135550100");
await page.route("**/api/quote", route => route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: "Delivery rejected in test." }) }));
await page.locator("form button").click();
await page.locator(".form-error").waitFor();
assert.equal(await page.evaluate(() => (window.dataLayer || []).filter(e => e.event === "gtm.formSubmit").length), 0);
assert.equal(
  await page.evaluate(
    () =>
      (window.dataLayer || []).filter(
        (event) => event.event === "lead_form_submit",
      ).length,
  ),
  0,
);
await page.route("**/api/quote", async (route) => {
  const data = route.request().postDataJSON();
  assert.equal(data.gclid, "test-click");
  assert.equal(data.utm_campaign, "doors");
  assert.equal(data.service, "interior");
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true }),
  });
});
await page.locator("form button").click();
await page.locator(".form-success").waitFor();
assert.equal(await page.evaluate(() => window.dataLayer.filter(e => e.event === "gtm.formSubmit").length), 1);
assert.equal(
  await page.evaluate(
    () =>
      window.dataLayer.filter(
        (event) =>
          event.event === "lead_form_submit" && event.service === "interior",
      ).length,
  ),
  1,
);
await page.evaluate(() => {
  document.addEventListener(
    "click",
    (e) => {
      if (e.target.closest('a[href^="tel:"],a[href^="mailto:"]'))
        e.preventDefault();
    },
    true,
  );
});
await page.locator('.contact a[href^="tel:"]').click();
await page.locator('.contact a[href^="mailto:"]').click();
assert.deepEqual(
  await page.evaluate(() =>
    window.dataLayer.slice(-2).map((event) => event.event),
  ),
  ["phone_click", "email_click"],
);
await page.goto(base);
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({ path: "test-results/desktop.png" });
await page.setViewportSize({ width: 375, height: 812 });
await page.screenshot({ path: "test-results/mobile.png" });
assert.deepEqual(errors, []);
await writeFile(
  "test-results/results.json",
  JSON.stringify(
    {
      responsive: results,
      browserErrors: errors,
      variants: "passed",
      images: "passed",
      form: "passed (success mocked)",
      tracking: "passed",
    },
    null,
    2,
  ),
);
await browser.close();
console.log(
  `Passed ${widths.length} responsive widths, service variants, all rendered images, accordions, sticky controls, form states, attribution and tracking.`,
);
