import { mkdir, cp, copyFile, readFile, access } from "node:fs/promises";
import assert from "node:assert/strict";
const html = await readFile("index.html", "utf8");
assert.match(html, /^<!doctype html>/i);
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.doesNotMatch(html, /_next\/|__next|react-dom/);
assert.match(
  await readFile("assets/vendor/bootstrap/bootstrap.min.css", "utf8"),
  /Bootstrap\s+v5\.3\.8/,
);
for (const [, file] of html.matchAll(
  /(?:src|href)="((?:assets|public)\/[^"?#]+)"/g,
))
  await access(file);
await mkdir("dist", { recursive: true });
await copyFile("index.html", "dist/index.html");
await cp("assets", "dist/assets", { recursive: true });

console.log(
  "Validated HTML5, local Bootstrap 5.3.8 and referenced files. Static site packaged in dist/.",
);
