import { mkdir, cp, readFile, access } from "node:fs/promises";
import assert from "node:assert/strict";
import "./styles.mjs";
import { renderMetadata } from "../metadata.mjs";
import { writeFile } from "node:fs/promises";
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
await writeFile("dist/index.html", renderMetadata(html, process.env.SITE_URL));
await cp("assets", "dist/assets", { recursive: true });

console.log(
  "Validated HTML5, local Bootstrap 5.3.8 and referenced files. Static site packaged in dist/.",
);
