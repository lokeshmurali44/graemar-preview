// The final landing-page URL is intentionally unset until the owner supplies it.
export function renderMetadata(html, siteUrl = "") {
  if (!siteUrl) return html;
  const url = new URL(siteUrl);
  if (url.protocol !== "https:" || url.search || url.hash || url.username || url.password ||
      /(^|\.)(localhost|github\.io)$/.test(url.hostname) || /^[\d.:\[\]]+$/.test(url.hostname)) {
    throw new Error("SITE_URL must be the final HTTPS landing-page URL, without query or fragment.");
  }
  if (!url.pathname.endsWith("/") && !url.pathname.endsWith(".html")) url.pathname += "/";
  const canonical = url.href.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
  const image = new URL("assets/images/projects/rideau-street-new-640.webp", url).href;
  return html
    .replace("window.GRAEMAR_LIVE = false", "window.GRAEMAR_LIVE = true")
    .replace('<meta name="robots" content="noindex, nofollow" />',
      `<meta name="robots" content="index, follow" />\n    <link rel="canonical" href="${canonical}" />\n    <meta property="og:url" content="${canonical}" />`)
    .replace(/(<meta property="og:image" content=")[^"]+/, `$1${image}`);
}
