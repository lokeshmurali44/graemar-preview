const contactUrl = "https://graemar.com/home/contact-us/";
const submitUrl = "https://graemar.com/wp-admin/admin-ajax.php?action=grunion-contact-form";

function decode(value) {
  return value.replace(/&#(x[0-9a-f]+|[0-9]+);|&(amp|quot|apos|lt|gt);/gi, (_, number, name) =>
    number ? String.fromCodePoint(number[0].toLowerCase() === "x" ? parseInt(number.slice(1), 16) : Number(number)) :
      ({ amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" })[name.toLowerCase()]);
}

export function readForm(html) {
  const form = [...html.matchAll(/<form\b[\s\S]*?<\/form>/gi)]
    .map(match => match[0]).find(text => /name=['"]g48-name['"]/.test(text));
  if (!form) throw new Error("Jetpack form 48 is unavailable.");
  const fields = new URLSearchParams();
  for (const [input] of form.matchAll(/<input\b[^>]*>/gi)) {
    const attrs = Object.fromEntries([...input.matchAll(/([\w-]+)\s*=\s*(['"])(.*?)\2/gs)]
      .map(([, name, , value]) => [name.toLowerCase(), decode(value)]));
    if (attrs.type === "hidden" && attrs.name) fields.set(attrs.name, attrs.value || "");
  }
  if (fields.get("contact-form-id") !== "48" || !fields.get("contact-form-hash") ||
      fields.get("action") !== "grunion-contact-form" || !fields.get("jetpack_contact_form_jwt")) {
    throw new Error("Jetpack form configuration has changed.");
  }
  return fields;
}

export async function submitJetpack(lead, { fetchImpl = fetch, fillDuration = 0 } = {}) {
  // Refresh public form tokens for each enquiry; do not embed expiring tokens in HTML.
  const page = await fetchImpl(contactUrl, { signal: AbortSignal.timeout(8000), redirect: "error" });
  if (!page.ok) throw new Error("Contact form unavailable.");
  const fields = readForm(await page.text());
  fields.set("g48-name", lead.name);
  fields.set("g48-email", lead.email);
  fields.set("g48-comment", [
    `Phone: ${lead.phone}`, `Project: ${lead.projectType}`, `Area: ${lead.location || "Not provided"}`,
    "Sent from: Graemar doors landing page", "",
    lead.description || "Please contact me to discuss my project.",
    "", "Landing-page attribution:",
    ...["service", "gclid", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]
      .filter(key => lead[key]).map(key => `${key}: ${lead[key]}`),
  ].join("\n"));
  fields.set("ak_hp_textarea", "");
  fields.set("ak_js", String(Date.now()));
  // The browser and Jetpack both use seconds, not milliseconds.
  fields.set("jetpack_form_fill_duration", String(Math.round(Math.max(0, Math.min(Number(fillDuration) || 0, 86400)))));
  const cookies = (page.headers.getSetCookie?.() || []).map(cookie => cookie.split(";")[0]).join("; ");
  const result = await fetchImpl(submitUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json", Referer: contactUrl,
      ...(cookies ? { Cookie: cookies } : {}) },
    body: fields.toString(),
    signal: AbortSignal.timeout(14000),
    redirect: "manual",
  });
  // Never treat a resolved fetch or generic HTML page as a successful lead.
  // Jetpack's JSON response confirms the form, hash and created feedback ID.
  if (!result.ok || !result.headers.get("content-type")?.includes("application/json")) {
    throw new Error("Jetpack did not confirm acceptance.");
  }
  const receipt = await result.json();
  const args = receipt?.refreshArgs;
  if (receipt.success !== true || String(args?.["contact-form-id"]) !== "48" ||
      !/^[1-9]\d*$/.test(String(args?.["contact-form-sent"] || "")) ||
      args?.["contact-form-hash"] !== fields.get("contact-form-hash")) {
    throw new Error("Jetpack did not confirm acceptance.");
  }
}
