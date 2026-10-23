(() => {
  "use strict";
  document.querySelectorAll(".comparison-pair").forEach((pair, index) => {
    const project = pair.closest(".comparison").querySelector("h3").textContent;
    const control = document.createElement("input");
    control.type = "range";
    control.min = "0";
    control.max = "100";
    control.value = "50";
    control.className = "comparison-control";
    control.setAttribute("aria-label", `${project}: reveal before and after`);
    const hint = document.createElement("p");
    hint.className = "comparison-hint";
    hint.id = `comparison-hint-${index}`;
    hint.textContent = "Drag to compare · Use arrow keys when focused";
    control.setAttribute("aria-describedby", hint.id);
    const divider = document.createElement("span");
    divider.className = "comparison-divider";
    divider.setAttribute("aria-hidden", "true");
    divider.innerHTML = '<span class="comparison-handle">‹<span></span>›</span>';
    function update() {
      pair.style.setProperty("--reveal", `${control.value}%`);
      control.setAttribute("aria-valuetext", `${control.value}% before, ${100 - Number(control.value)}% after`);
    }
    function move(event) {
      const bounds = pair.getBoundingClientRect();
      control.value = String(Math.round(Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100))));
      update();
    }
    control.addEventListener("input", update);
    control.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      event.preventDefault();
      control.focus({ preventScroll: true });
      control.setPointerCapture(event.pointerId);
      move(event);
    });
    control.addEventListener("pointermove", (event) => {
      if (control.hasPointerCapture(event.pointerId)) move(event);
    });
    control.addEventListener("pointerup", (event) => {
      if (control.hasPointerCapture(event.pointerId)) control.releasePointerCapture(event.pointerId);
    });
    pair.append(divider, control);
    pair.after(hint);
    pair.classList.add("is-slider");
    pair.closest(".comparison").classList.add("comparison-interactive");
    update();
  });
  const marquee = document.getElementById("client-marquee");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const originalClients = marquee.querySelector(".client-grid");
  const names = [...originalClients.children].map((node) => node.textContent);
  function setClientMotion() {
    marquee.replaceChildren();
    marquee.classList.toggle("is-animated", !reducedMotion.matches);
    if (reducedMotion.matches) {
      marquee.append(originalClients);
      return;
    }
    const track = document.createElement("div");
    track.className = "client-track";
    const group = document.createElement("div");
    group.className = "client-group";
    for (const name of names) {
      const label = document.createElement("span");
      label.textContent = name;
      const bullet = document.createElement("span");
      bullet.className = "client-bullet";
      bullet.textContent = "•";
      bullet.setAttribute("aria-hidden", "true");
      label.append(bullet);
      group.append(label);
    }
    const repeat = group.cloneNode(true);
    repeat.setAttribute("aria-hidden", "true");
    track.append(group, repeat);
    marquee.append(track);
  }
  new ResizeObserver(() =>
    marquee.style.setProperty("--client-width", `${marquee.clientWidth}px`),
  ).observe(marquee);
  reducedMotion.addEventListener("change", setClientMotion);
  setClientMotion();
  const services = {
    entry: {
      headline: "Custom Solid Wood Entry Doors in Ottawa",
      copy: "Custom-built in Ottawa with precision craftsmanship, insulated construction and detailing tailored to your home.",
      image: "rideau-street-new",
      caption: "Rideau Street · Custom wood entry doors",
      alt: "Panelled oak double entry doors set within a stone surround on Rideau Street",
      title: "Custom Solid Wood Doors Ottawa | Graemar",
      description:
        "Custom solid wood entry doors built in Ottawa. Explore Graemar projects and request a quote for your custom door project.",
      projectType: "Entry Door",
    },
    interior: {
      headline: "Solid Wood Interior Doors in Ottawa",
      copy: "Custom-built interior doors, pocket doors and coordinated door sets crafted for residential and architectural projects.",
      image: "rockliffe-interior-new",
      caption: "Rockliffe · Custom interior doors",
      alt: "Natural wood French interior doors with a curved glazed transom in a dining room",
      title: "Solid Wood Interior Doors Ottawa | Graemar",
      description:
        "Custom solid wood interior doors, pocket doors and coordinated door sets made in Ottawa. Request a Graemar project quote.",
      projectType: "Interior Doors",
    },
    heritage: {
      headline: "Heritage Carpentry & Reproduction Millwork",
      copy: "Precision reproduction woodwork crafted for Ottawa heritage properties and architecturally distinctive projects.",
      image: "cathedral-hill-after",
      caption: "Cathedral Hill · Heritage woodwork",
      alt: "Cathedral Hill heritage brick building with reproduced decorative gables and woodwork",
      title: "Heritage Carpentry Ottawa | Graemar",
      description:
        "Heritage carpentry and precision reproduction millwork crafted in Ottawa. Explore Graemar projects and request a quote.",
      projectType: "Heritage or Millwork",
    },
  };
  const heroDimensions = {
    "rideau-street-new": {
      width: 715,
      height: 1258,
      widths: [480, 640, 715],
      source: "RIDEAU STREET NEW.jpg",
    },
    "rockliffe-interior-new": {
      width: 7650,
      height: 5464,
      widths: [480, 640, 900],
      source: "ROCKLIFFE INTERIOR NEW.jpg",
    },
    "cathedral-hill-after": {
      width: 6500,
      height: 4349,
      widths: [480, 640, 900],
      source: "CATHEDRAL HILL AFTER.jpg",
    },
  };
  const query = new URLSearchParams(window.location.search);
  const service = ["entry", "interior", "heritage"].includes(query.get("s"))
    ? query.get("s")
    : "entry";
  const config = services[service];
  const hero = document.getElementById("hero");
  hero.className = `hero wrap hero-${service}`;
  document.getElementById("hero-heading").textContent = config.headline;
  document.getElementById("hero-description").textContent = config.copy;
  document.getElementById("hero-caption").textContent = config.caption;
  document.title = config.title;
  document.querySelector('meta[name="description"]').content =
    config.description;
  const photo = document.getElementById("hero-photo");
  const dimensions = heroDimensions[config.image];
  photo.alt = config.alt;
  photo.width = dimensions.width;
  photo.height = dimensions.height;
  photo.sizes =
    service === "entry"
      ? "(min-width: 1500px) 302px, (min-width: 900px) 275px, (min-width: 600px) 293px, (min-width: 340px) 273px, calc(100vw - 58px)"
      : "(min-width: 900px) 480px, (min-width: 600px) 540px, calc(100vw - 58px)";
  photo.srcset = dimensions.widths
    .map(
      (width) =>
        `assets/images/projects/${config.image}-${width}.webp ${width}w`,
    )
    .join(", ");
  photo.src = `assets/images/projects/${config.image}-640.webp`;
  const form = document.getElementById("quote-form");
  form.elements.service.value = service;
  form.elements.projectType.value = config.projectType;
  const attributionKeys = [
    "gclid",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];
  for (const key of attributionKeys)
    form.elements[key].value = (query.get(key) || "").slice(0, 2048);
  function track(event) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, service });
  }
  document.addEventListener("click", (event) => {
    const anchor =
      event.target instanceof Element ? event.target.closest("a") : null;
    if (anchor?.getAttribute("href")?.startsWith("tel:")) track("phone_click");
    if (anchor?.getAttribute("href")?.startsWith("mailto:"))
      track("email_click");
  });
  const sticky = document.querySelector(".mobile-sticky");
  // Keep contact actions available throughout the mobile page.
  const mobile = window.matchMedia("(max-width: 599px)");
  function updateSticky() {
    sticky.classList.toggle("is-visible", mobile.matches);
    sticky.inert = !mobile.matches;
  }
  mobile.addEventListener("change", updateSticky);
  updateSticky();
  const formStartedAt = Date.now();
  let status = "idle";
  const button = form.querySelector("button[type=submit]");
  const message = document.getElementById("form-status");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    // GTM's legacy form trigger must only see confirmed submissions.
    event.stopPropagation();
    if (status === "sending" || status === "success") return;
    if (!form.reportValidity()) return;
    if (location.hostname === "lokeshmurali44.github.io") {
      const notice = document.createElement("p");
      notice.className = "form-note";
      notice.textContent = "This is a design preview. Your enquiry has not been sent.";
      message.replaceChildren(notice);
      return;
    }
    status = "sending";
    button.disabled = true;
    button.textContent = "Sending…";
    form.setAttribute("aria-busy", "true");
    message.replaceChildren();
    try {
      if (location.protocol === "file:")
        throw new Error(
          "Online quote requests require the website server. Please call 613-795-7875 or email info@graemar.com.",
        );
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), fillDuration: Math.round((Date.now() - formStartedAt) / 1000) }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok !== true)
        throw new Error(
          data.error ||
            "Your request could not be delivered. Please call 613-795-7875 or email info@graemar.com.",
        );
      status = "success";
      button.textContent = "Request received";
      const text = document.createElement("p");
      text.className = "form-success";
      text.textContent = "Thank you. Your project details have been received.";
      message.append(text);
      track("lead_form_submit");
      // Compatibility with the existing published Graemar GTM form trigger.
      window.dataLayer.push({
        event: "gtm.formSubmit",
        "gtm.triggers": "231529446_9",
        "gtm.elementId": form.id,
        "gtm.elementUrl": form.action,
        service,
      });
    } catch (error) {
      status = "error";
      button.disabled = false;
      button.textContent = "Request a quote ↗";
      const text = document.createElement("p");
      text.className = "form-error";
      text.textContent =
        error.name === "TimeoutError"
          ? "The request timed out. Please call 613-795-7875 or email info@graemar.com."
          : error.message;
      message.append(text);
    } finally {
      form.removeAttribute("aria-busy");
    }
  });
})();
