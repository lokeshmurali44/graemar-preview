# PM checklist validation — 23 October 2026

## Outcome

Six checklist areas reviewed: three fully verified locally (speed/assets, mobile, brand styling); three have implemented code with production verification/configuration outstanding (SEO, form delivery, tracking). No code item is left unexplained. The final live URL is unknown, so previews remain noindex. No live enquiry or Ads conversion test was sent.

Local mobile Lighthouse: **100/100**, LCP **1.7 s**, FCP **1.0 s**, TBT **0 ms**, CLS **0**, initial page transfer **243 KiB**. This uses Lighthouse's default simulated mobile throttling against localhost with GTM off. It is a lab result, not a production performance guarantee.

CSS was reduced from 257,134 to 34,204 bytes. All 47 WebP photo variants are below 100,000 bytes; the largest is 93,200 bytes. The 715px entry-door hero preserves its original resolution, while the two larger originals have 900px hero variants.

## Fix records

### FIX-001 — Speed and assets (PM section 1)
- Files/components: index.html hero/preload/images; assets/css/styles.css and site.min.css; image assets/manifest; scripts/styles.mjs, prepare-images.mjs and build.mjs; package files.
- Root cause: original embedded photos; remaining full Bootstrap CSS, unminified custom CSS and missing preload.
- Implementation: retain external responsive WebPs, add larger hero variants, non-hero lazy/async loading, matching responsive preload, remove unused font downloads, purge and minify stylesheet with dynamic classes/touch rules preserved.
- Why: reduces first-load bytes without changing the image layout or interactive components.
- Before/after: 257 KB CSS becomes 34 KB; source CSS stays editable. Hero is preloaded; every non-hero image is lazy/async.
- Devices: mobile through desktop; all three service variants.
- Accessibility impact: image descriptions retained; focus/touch selectors explicitly preserved.
- Performance impact: local mobile score100, LCP1.7s; all photos under100KB.
- Regression risk: Medium (CSS pruning); responsive, image, slider and form tests passed.
- Validation status: Passed locally; final hosting performance must be rechecked.

### FIX-002 — SEO (PM section 2)
- Files/components: index.html metadata; metadata.mjs; server.mjs; scripts/build.mjs; .env.example.
- Root cause: absent sharing/canonical metadata and no explicit preview indexing protection.
- Implementation: preview noindex, Open Graph title/description/image, LocalBusiness with known Ottawa address fields only; final SITE_URL configuration inserts canonical/og:url and enables indexing.
- Why: avoids inventing the live URL or publishing a preview canonical as the permanent address.
- Before/after: sharing data and structured data now present; production URL can be set without editing multiple templates.
- Devices: all; metadata checked in source output, independent of JavaScript.
- Accessibility/performance impact: none material.
- Regression risk: Low; default, valid live URL and rejected GitHub URL cases tested.
- Validation status: Partially Passed; final URL not supplied. Do not remove noindex on the review preview.

### FIX-003 — Mobile usability (PM section 3 and retained user requests)
- Files/components: CSS, main.js sticky controls, index.html benefit copy, verify-pm.mjs and check.mjs.
- Root cause: 12px small text; sticky contact actions disappeared around hero/quote; font changes affect line wrapping.
- Implementation: minimum13px text, 44px contact targets, always-available mobile bar with bottom scroll clearance; explicit three-line benefit and two-line process descriptions; single-line mobile FAQ/quote headings and visible dropdown arrow retained.
- Why: improves readability and access while preserving the requested compact layout.
- Before/after: contact actions stay reachable; specified descriptions keep consistent line counts at all19 tested widths.
- Devices: 320–2560px, including tablet and intermediate breakpoints.
- Accessibility impact: no automated axe violations; native controls and keyboard slider support retained. Logo lettering is part of an image, not live text.
- Performance impact: sticky scroll listener removed in favour of a media-query listener.
- Regression risk: Low; touch sizing, dropdown, text size, line count, sticky and overflow assertions passed.
- Validation status: Passed in Chromium; physical keyboard/phone and screen-reader checks not performed.

### FIX-004 — Brand (PM section 4)
- Files/components: styles.css, generated site.min.css; headings, backgrounds, cards, buttons and accents.
- Root cause: preview navy/cream and serif typography differ from PM-specified live brand.
- Implementation: white/light-grey/#cccccc borders, #404040/#525252 text and buttons, Arial, uppercase spaced main headings. Supplied logo remains unchanged.
- Why: implements PM's stated visual direction while retaining layout, photos, sliders and reviews.
- Before/after: navy/cream/serif becomes monochrome/sans-serif; no new design or stock imagery.
- Devices: mobile and desktop screenshots visually reviewed, with responsive checks across19 widths.
- Accessibility impact: contrast passed automated scan; minimum text sizes retained.
- Performance impact: no font files loaded.
- Regression risk: Low; heading overflow and controls checked.
- Validation status: Passed locally.

### FIX-005 — Jetpack form (PM section 5)
- Files/components: jetpack.mjs, main.js, verify-pm.mjs; existing server validation retained.
- Root cause: detailed checklist specifies AJAX endpoint and seconds; prior bridge used classic redirect and milliseconds.
- Implementation: fresh form48 fields/JWT/hash, AJAX endpoint with Accept:application/json, duration in seconds, PM message format including source, campaign fields retained, strict acceptance receipt checks.
- Why: the supplied no-cors sample can report success on an opaque response even if delivery failed. The server bridge can inspect acceptance safely and avoids expiring hard-coded tokens.
- Before/after: AJAX receipt must have success=true, matching form48/hash and positive feedback ID. Error/HTML/wrong-form responses never count as leads. No automatic POST retries.
- Devices: browser validation/success/error/attribution tests; server adapter mocked acceptance and rejection.
- Accessibility impact: native required fields, focus behaviour and status announcement retained.
- Performance impact: submission-only upstream calls with timeouts.
- Regression risk: Medium; live third-party plugin behaviour and inbox delivery need Bhargav's agreed test.
- Validation status: Partially Passed: code and mocked tests passed; no live lead sent.
- API evidence: Jetpack's [submission response implementation](https://github.com/Automattic/jetpack/blob/trunk/projects/packages/forms/src/contact-form/class-contact-form.php) returns JSON success/refreshArgs when requested; its [AJAX handler](https://github.com/Automattic/jetpack/blob/trunk/projects/packages/forms/src/contact-form/class-contact-form-plugin.php) handles errors. Live contact-page configuration was read via GET only.

### FIX-006 — Tracking (PM section 6)
- Files/components: index.html GTM guard, metadata.mjs production flag; existing main.js confirmed-success event handling retained.
- Root cause: noscript fallback could contact live GTM on a preview; duplicate theme container needs guarding.
- Implementation: production opt-in through SITE_URL, local/GitHub guard, existing-container guard, no noscript iframe. Native submit does not bubble into the legacy conversion listener; confirmed acceptance emits one compatible event.
- Why: test visits and failed enquiries must not inflate live conversion totals.
- Before/after: preview remains visually complete but does not load live GTM. All phone/email links retain the required targets.
- Devices: all; mocked failure0/success1 lead events tested. No contact details in data layer.
- Accessibility/performance impact: no extra preview network tracking.
- Regression risk: Medium; account-side trigger changes can require updates. WordPress theme integration must omit the duplicate standalone snippet.
- Validation status: Partially Passed; real Ads recording, call forwarding and Tag Assistant production verification remain pending.

## Regression matrix

| Issue IDs | Page | Device | Viewport width | Browser | Result | Notes |
|---|---|---|---|---|---|---|
| FIX-001/003/004 | Landing page | Mobile | 320px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Mobile | 360px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Mobile | 375px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Mobile | 390px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Mobile | 430px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Mobile | 599px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Tablet/intermediate | 600px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Tablet/intermediate | 768px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Tablet/intermediate | 820px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Tablet/intermediate | 899px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Tablet/intermediate | 900px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Tablet/intermediate | 1024px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Tablet/intermediate | 1180px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Laptop/desktop | 1280px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Laptop/desktop | 1366px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Laptop/desktop | 1440px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Laptop/desktop | 1600px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Laptop/desktop | 1920px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |
| FIX-001/003/004 | Landing page | Laptop/desktop | 2560px | Chromium | Passed | No horizontal overflow; controls fit; minimum13px; benefit3/process2 lines |

| Check | Result |
|---|---|
| Build, single H1, referenced local files | Passed |
| Entry/interior/heritage variants and invalid-query fallback | Passed |
| All rendered images decode | Passed |
| Six comparison sliders, pointer and Home/End keys | Passed |
| FAQs, skip link, sticky bar, dropdown arrow | Passed |
| Phone validation, mocked form error/success, campaign attribution | Passed |
| Confirmed-success0/1 conversion counts | Passed |
| Preview noindex, absent GTM request, production metadata rendering | Passed |
| Contact links at least44px tall | Passed |
| Automated WCAG A/AA axe scan, 375px | Passed: zero violations |
| npm audit | Passed: zero vulnerabilities |
| Screenshots, mobile hero/benefits/quote and desktop hero/benefits | Visually reviewed |
| Inbox delivery and real Ads/call forwarding | Not Executed: Bhargav's live test pending |
| Safari, Firefox, physical phones, manual screen-reader testing | Not Executed |

There are no configured TypeScript or lint commands in this plain HTML/JavaScript project. Build and browser tests completed without JavaScript errors. Generated evidence (test-results/) is not kept; rerun the tests to regenerate it. Development dependencies remain recorded in package-lock.json; use npm install to restore them when needed.

## Remaining launch tasks

1. Obtain final live URL; set SITE_URL on the production host only. Confirm the canonical and sharing image resolve there and noindex is removed.
2. Deploy a working /api/quote receiver on Node-capable hosting (or integrate with WordPress hosting). GitHub Pages remains a design preview.
3. Bhargav runs one live test, verifies inbox/WordPress Feedback receipt and confirms GTM/Ads/call-forwarding behaviour before ad traffic.
4. Recheck performance on the final host with production tags enabled.
