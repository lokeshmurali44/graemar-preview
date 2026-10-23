import { submitJetpack } from "./jetpack.mjs";
import { renderMetadata } from "./metadata.mjs";
import http from "node:http";
import { stat, readFile } from "node:fs/promises";
import { createGzip } from "node:zlib";
import { createReadStream, existsSync } from "node:fs";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
if (existsSync(resolve(root, ".env.local")))
  process.loadEnvFile(resolve(root, ".env.local"));
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "127.0.0.1";
const attributionKeys = [
  "gclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
function json(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(data));
}
async function quote(request, response) {
  const origin = request.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.host)
        return json(response, 403, { error: "Request origin is not allowed." });
    } catch {
      return json(response, 403, { error: "Request origin is not allowed." });
    }
  }
  if (!request.headers["content-type"]?.includes("application/json"))
    return json(response, 415, { error: "JSON required." });
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > 24000)
      return json(response, 413, { error: "Your request is too long." });
  }
  let raw;
  try {
    raw = JSON.parse(body);
    if (!raw || Array.isArray(raw) || typeof raw !== "object")
      throw new Error();
  } catch {
    return json(response, 400, { error: "Invalid request." });
  }
  const value = (key) => (typeof raw[key] === "string" ? raw[key].trim() : "");
  if (value("website"))
    return json(response, 400, { error: "Unable to submit this request." });
  if (
    !value("name") ||
    value("name").length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email")) ||
    value("email").length > 254 ||
    !/^[+\d\s().-]{7,40}$/.test(value("phone")) ||
    !/^\d{7,15}$/.test(value("phone").replace(/\D/g, "")) ||
    !["Entry Door", "Interior Doors", "Heritage or Millwork", "Other"].includes(
      value("projectType"),
    ) ||
    !["entry", "interior", "heritage"].includes(value("service")) ||
    value("description").length > 5000 ||
    value("location").length > 160
  )
    return json(response, 400, {
      error: "Please check your name, email, phone number and project type.",
    });
  const lead = Object.fromEntries(
    [
      "name",
      "email",
      "phone",
      "projectType",
      "location",
      "description",
      "service",
      ...attributionKeys,
    ].map((key) => [
      key,
      value(key).slice(0, key === "description" ? 5000 : 2048),
    ]),
  );
  try {
    await submitJetpack(lead, { fillDuration: raw.fillDuration });
    return json(response, 200, { ok: true });
  } catch {
    return json(response, 502, {
      error:
        "Your request could not be delivered. Please call 613-795-7875 or email info@graemar.com.",
    });
  }
}
const server = http.createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  try {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname === "/api/quote" && request.method === "POST")
      return await quote(request, response);
    if (!["GET", "HEAD"].includes(request.method))
      return json(response, 405, { error: "Method not allowed." });
    let name = decodeURIComponent(url.pathname);
    if (name === "/" || name === "/index.html") name = "/index.html";
    if (name === "/favicon.ico") {
      response.writeHead(302, {
        Location: "/assets/images/favicon/graemar-icon-32.jpg",
      });
      return response.end();
    }
    if (
      name !== "/index.html" &&
      !name.startsWith("/assets/") &&
      !name.startsWith("/public/images/graemar/")
    )
      return json(response, 404, { error: "Not found." });
    const path = resolve(root, "." + name);
    const assets = resolve(root, "assets") + sep;
    const images = resolve(root, "public/images/graemar") + sep;
    if (
      path !== resolve(root, "index.html") &&
      !path.startsWith(assets) &&
      !path.startsWith(images)
    )
      return json(response, 404, { error: "Not found." });
    if (!types[extname(path)] || !(await stat(path)).isFile())
      return json(response, 404, { error: "Not found." });
    if (name === "/index.html" && process.env.SITE_URL) {
      const html = renderMetadata(await readFile(path, "utf8"), process.env.SITE_URL);
      response.writeHead(200, { "Content-Type": types[".html"], "Cache-Control": "no-cache" });
      return response.end(request.method === "HEAD" ? undefined : html);
    }
    const compress =
      /gzip/.test(request.headers["accept-encoding"] || "") &&
      [".html", ".css", ".js", ".svg"].includes(extname(path));
    response.writeHead(200, {
      ...(compress
        ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" }
        : {}),
      "Content-Type": types[extname(path)],
      "Cache-Control":
        name.endsWith(".webp") || name.endsWith(".woff2")
          ? "public, max-age=604800"
          : "no-cache",
    });
    if (request.method === "HEAD") return response.end();
    const stream = createReadStream(path);
    stream.on("error", () => response.destroy());
    if (compress) stream.pipe(createGzip()).pipe(response);
    else stream.pipe(response);
  } catch (error) {
    if (!response.headersSent)
      json(response, error.code === "ENOENT" ? 404 : 400, {
        error: "Unable to process this request.",
      });
    else response.end();
  }
});
server.listen(port, host, () =>
  console.log(`Graemar HTML5 + Bootstrap: http://${host}:${port}`),
);
