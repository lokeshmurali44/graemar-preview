import assert from "node:assert/strict";
import { readFile, readdir, stat, mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { readForm, submitJetpack } from "../jetpack.mjs";
import { renderMetadata } from "../metadata.mjs";

const fixture = `<form><input name="g48-name"><input type="hidden" name="contact-form-id" value="48">
<input type="hidden" name="contact-form-hash" value="test-hash">
<input type="hidden" name="action" value="grunion-contact-form">
<input type="hidden" name="jetpack_contact_form_jwt" value="mock-token"></form>`;
assert.equal(readForm(fixture).get("contact-form-id"), "48");
assert.throws(() => readForm("<form></form>"));
const lead = { name: "Test", email: "test@example.com", phone: "6135550100", projectType: "Entry Door", service: "entry", gclid: "test-click" };
const accepted = {success: true, refreshArgs: {"contact-form-id":48, "contact-form-sent":123, "contact-form-hash":"test-hash"}};
const mock = (status, receipt, type = "application/json") => async (url, options) => {
  if (options.method !== "POST") return new Response(fixture);
  assert.equal(url, "https://graemar.com/wp-admin/admin-ajax.php?action=grunion-contact-form");
  assert.equal(options.headers.Accept, "application/json");
  const fields = new URLSearchParams(options.body);
  assert.equal(fields.get("g48-name"), lead.name);
  assert.equal(fields.get("g48-email"), lead.email);
  assert.match(fields.get("g48-comment"), /Phone: 6135550100/);
  assert.match(fields.get("g48-comment"), /Sent from: Graemar doors landing page/);
  assert.match(fields.get("g48-comment"), /gclid: test-click/);
  assert.equal(fields.get("jetpack_form_fill_duration"), "12");
  return new Response(JSON.stringify(receipt), {status, headers: {"content-type":type}});
};
await submitJetpack(lead, {fetchImpl:mock(200, accepted), fillDuration:12});
for (const [status, receipt, type] of [[200,{success:false}], [500,accepted], [200,{}], [200,accepted,"text/html"], [200,{...accepted,refreshArgs:{...accepted.refreshArgs,"contact-form-id":99}}]]) {
  await assert.rejects(submitJetpack(lead, {fetchImpl:mock(status,receipt,type), fillDuration:12}));
}
const html = await readFile("index.html", "utf8");
assert.doesNotMatch(html, /data:image\/[^;]+;base64/);
assert.match(html, /GTM-NDWWT247/);
assert.match(html, /name="robots" content="noindex, nofollow"/);
assert.doesNotMatch(html, /<noscript><iframe/);
assert.equal(renderMetadata(html), html);
const live = renderMetadata(html, "https://example.com/doors/");
assert.match(live, /rel="canonical" href="https:\/\/example.com\/doors\/"/);
assert.match(live, /window.GRAEMAR_LIVE = true/);
assert.match(live, /name="robots" content="index, follow"/);
assert.match(live, /https:\/\/example.com\/doors\/assets\/images/);
assert.throws(() => renderMetadata(html, "https://lokeshmurali44.github.io/graemar-preview/"));
for (const name of await readdir("assets/images/projects")) {
  assert.ok((await stat(`assets/images/projects/${name}`)).size < 100000, name);
}
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(process.env.TEST_URL || "http://127.0.0.1:3001");
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('script[src*="googletagmanager.com"]').count(), 0);
  assert.ok(await page.locator('select').evaluate(e => getComputedStyle(e).backgroundImage !== "none"));
  for (const width of [320, 360, 375, 390, 430, 599, 600, 768, 820, 899, 900, 1024, 1180, 1280, 1366, 1440, 1600, 1920, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    const smallText = await page.locator('body *').evaluateAll(es => es.filter(e =>
      e.getBoundingClientRect().width && getComputedStyle(e).visibility !== "hidden" &&
      [...e.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim()) &&
      parseFloat(getComputedStyle(e).fontSize) < 13).map(e => e.textContent.trim()));
    assert.deepEqual(smallText, [], `Text below 13px at ${width}`);
    if (width < 600) assert.ok(await page.locator('.mobile-single-line').evaluateAll(es => es.every(e =>
      e.scrollWidth <= e.clientWidth && Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)) === 1)));
    assert.deepEqual(await page.locator(".benefit-grid p").evaluateAll(es => es.map(e => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)))), [3, 3, 3, 3], `Benefit lines at ${width}`);
    assert.deepEqual(await page.locator(".steps p").evaluateAll(es => es.map(e => Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)))), [2, 2, 2], `Process lines at ${width}`);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  for (const link of await page.locator('a[href^="tel:"],a[href^="mailto:"]').all()) {
    assert.ok((await link.boundingBox()).height >= 44);
  }
  assert.equal(await page.locator("img:not(#hero-photo):not(.brand-logo)").evaluateAll(es => es.every(e => e.loading === "lazy")), true);
  const phone = page.locator('input[name="phone"]');
  for (const value of ["-------", "123456", "1234567890123456"]) {
    await phone.fill(value);
    assert.equal(await phone.evaluate(e => e.checkValidity()), false);
  }
  await phone.fill("+1 (613) 555-0100");
  assert.equal(await phone.evaluate(e => e.checkValidity()), true);
  for (const slider of await page.locator(".comparison-control").all()) {
    await slider.scrollIntoViewIfNeeded();
    const r = await slider.boundingBox();
    await page.mouse.move(r.x + r.width * .5, r.y + r.height * .5);
    await page.mouse.down();
    await page.mouse.move(r.x + r.width * .75, r.y + r.height * .5);
    await page.mouse.up();
    assert.equal(await slider.inputValue(), "75");
    await slider.press("Home"); assert.equal(await slider.inputValue(), "0");
    await slider.press("End"); assert.equal(await slider.inputValue(), "100");
  }
  await mkdir("test-results", { recursive: true });
  await page.goto(process.env.TEST_URL || "http://127.0.0.1:3001");
  await page.screenshot({ path: "test-results/pm-mobile.png" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "test-results/pm-desktop.png" });
} finally {
  await browser.close();
}
console.log("PM checks passed: image budgets, lazy loading, GTM ID, two-line descriptions, 44px contact targets, phone validation, six sliders, and mocked Jetpack acceptance/rejection.");
