# Graemar — PM revision

This separate HTML5/Bootstrap revision preserves the original parent folder. It retains the project grid, reviews, six before/after sliders, service variants and mobile Call / Request a quote bar.

## Preview

Use Node.js 22 or newer. In this folder run `npm install`, then `npm start`. Open http://127.0.0.1:3001/. The preview is running there for this editing session.

## Changes

- Photos are separate WebP assets in assets/images/projects, with 480px and 640px variants. All 44 variants are below 100,000 bytes; the largest is 84,716 bytes. Full photographs retain their aspect ratios instead of being cropped to a fixed rectangle.
- No embedded base64 photos. The hero loads eagerly with high priority; below-hero photos load lazily. The logo is also WebP.
- Phone/email links have at least 44px height. Text styles previously below 12px are now at least 12px. The supplied logo is an image, so its small lettering is unchanged.
- All three process descriptions have explicit two-line breaks across tested mobile, tablet and desktop widths.
- Browser and server phone validation require 7–15 digits, allowing normal spaces and punctuation.
- GTM-NDWWT247 is installed in the head with its noscript fallback. The script skips localhost, loopback and file previews to exclude local QA from live advertising data.

## Quote submission

The browser posts JSON to /api/quote on this server. jetpack.mjs reads https://graemar.com/home/contact-us/, obtains fresh hidden fields for Jetpack form 48, and posts to that contact page using g48-name, g48-email and g48-comment. Phone, project type, location, description and campaign attribution are included in the comment.

This avoids a cross-origin browser request and does not depend on an email application or a new webhook account. The adapter carries the live form hash, JWT, hidden fields and cookies from the form response. Tokens are not embedded in HTML or stored on disk.

Only an acceptance redirect with the expected form ID, matching hash and positive feedback ID produces success. Validation pages, timeouts and unconfirmed responses show an error and do not record a lead conversion. There are no automatic POST retries.

## Tracking

The public container was inspected on 23 October 2026. Its current form conversion listens for gtm.formSubmit with trigger 231529446_9. The landing form stops the initial submit event from bubbling to this listener, then emits that event once after confirmed acceptance. It also retains lead_form_submit. Failures emit neither success event. Phone/email anchors remain compatible with the link-click triggers, and phone text remains available to the forwarding-number tag.

No personal contact details enter the data layer. Campaign fields travel with the enquiry. If the container trigger changes, update the compatibility event in assets/js/main.js, or move its form conversion to lead_form_submit and remove the legacy event. Do not activate both as separate lead conversions.

The existing container also includes page-load conversion tags; this revision does not alter the Google Ads/GTM account. A production Tag Assistant review must confirm which actions are counted and prevent duplicates. Actual Ads recording and forwarding-number replacement were not certified by local QA.

## Deployment and handoff

Deploy this complete folder to a Node-capable host, install dependencies and run npm start. Set HOST=0.0.0.0 and the host-provided PORT where required, behind HTTPS. The server needs outbound access to graemar.com. Apply host-level request limits/spam protection.

npm run build creates a static dist directory. Uploading only dist does not deploy quote delivery: route /api/quote to this Node server when using a static/CDN frontend. Opening index.html directly is a design preview only.

The PM screenshot referenced a separate checklist/code attachment that was not supplied. Field mappings were verified from the live contact form instead. No live test enquiry was sent; acceptance/rejection tests mock the upstream response. Before ad traffic, perform one agreed live enquiry, confirm receipt, and validate conversions using Tag Assistant on the final domain.

## Checks

With the server running: npm run build, npm run check, npm run accessibility, npm run verify:pm.

Browser checks use Playwright Chromium (npx playwright install chromium if needed). Tests mock quote success and failure and do not send real enquiries. See validation.md for results and limits. Generated reports, screenshots, the duplicate dist folder and ZIP are archived in ../pm-revision-cleanup-archive. Build and test commands regenerate their outputs.

## GitHub Pages preview

The public preview is https://lokeshmurali44.github.io/graemar-preview/. GitHub Pages cannot execute the Node server. On that hostname, the quote area links visitors to Graemar's existing contact page rather than offering a non-working local submission. The full quote form remains active on localhost and Node-capable production hosting. The GTM script is also excluded on this preview hostname to avoid counting reviewer activity as live advertising traffic.
