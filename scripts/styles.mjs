import { readFile, writeFile } from "node:fs/promises";
import { PurgeCSS } from "purgecss";
import CleanCSS from "clean-css";

// Keep the editable sources; publish only rules used by HTML or interactive JS.
const sources = ["assets/vendor/bootstrap/bootstrap.min.css", "assets/css/styles.css"];
const css = (await Promise.all(sources.map(file => readFile(file, "utf8")))).join("\n");
const [used] = await new PurgeCSS().purge({
  content: ["index.html", "assets/js/main.js"],
  css: [{ raw: css }],
  safelist: [/^hero-(entry|interior|heritage)$/, "is-visible", "is-animated", "is-slider", "comparison-interactive"],
});
const minified = new CleanCSS({ level: 1, rebase: false }).minify(used.css);
if (minified.errors.length) throw new Error(minified.errors.join("\n"));
await writeFile("assets/css/site.min.css", minified.styles + "\n");
console.log(`CSS: ${Buffer.byteLength(css)} → ${Buffer.byteLength(minified.styles)} bytes, with Bootstrap license retained.`);
