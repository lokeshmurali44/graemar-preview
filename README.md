# Graemar landing page

HTML5 and Bootstrap 5.3.8 landing page. This folder is the only working copy and matches the GitHub repository https://github.com/lokeshmurali44/graemar-preview. It implements Graemar_LP_Feedback.md supplied on 23 October 2026.

## Preview and editing

Use Node.js 22 or newer. Run `npm install`, then `npm start`; open http://127.0.0.1:3001/.
Edit index.html, assets/css/styles.css and assets/js/main.js. After CSS, HTML or JavaScript changes run `npm run styles` to regenerate assets/css/site.min.css. `npm run build` also does this and packages the static page in dist/.

The GitHub preview is https://lokeshmurali44.github.io/graemar-preview/. It shows the complete local form for PM review. Valid submissions there display a preview notice, make no API request and record no lead conversion. GitHub Pages cannot execute the Node form receiver.

## Changes from the PM checklist

- Separate WebP photographs, responsive 480/640px tiles and larger hero variants. Every image stays below 100 KB. The original entry-door photograph is only 715px wide; its largest variant preserves that native resolution instead of upscaling. Interior/heritage hero variants reach 900px.
- Non-hero images lazy-load and decode asynchronously; hero has high priority and a responsive head preload. Image dimensions and full-photo proportions are retained.
- PurgeCSS removes unused CSS and clean-css minifies it: approximately 257 KB becomes 34 KB. Source CSS and the Bootstrap license are retained. No web fonts need downloading.
- White/light-grey/dark-grey palette, Arial typography and uppercase, spaced main headings follow the PM's brand specification. Existing layout, reviews, project grid and six comparison sliders remain.
- Text is at least 13px, excluding lettering inside the supplied logo image. Contact links remain at least 44px high. The sticky Call/Quote bar stays available across the mobile page.
- Below 900px, benefit descriptions keep three lines and process descriptions two lines; on desktop (900px and wider) both flow as continuous sentences without forced breaks. Mobile FAQ and quote headings stay on one line, and the project selector has a visible arrow.
- Preview noindex/nofollow, Open Graph sharing tags and basic LocalBusiness data are included. The final canonical is intentionally absent until the final live URL is supplied.

## Quote delivery

The browser posts validated JSON to this server's `/api/quote`. `jetpack.mjs` fetches fresh hidden fields and cookies from https://graemar.com/home/contact-us/ and posts to https://graemar.com/wp-admin/admin-ajax.php?action=grunion-contact-form.

The adapter uses form 48, g48-name, g48-email and g48-comment. It combines phone, project, area, the landing-page source, message and campaign attribution into the comment. The fill duration is measured in seconds; the spam trap remains empty. JWT/hash values are refreshed per enquiry, never hard-coded or committed.

The response must be JSON with success=true, form ID 48, the matching hash and a positive feedback ID. Rejected requests, HTML error pages and timeouts cannot show success or trigger a lead conversion. There are no automatic POST retries. This intentionally differs from the PM sample's no-cors request, whose opaque response cannot prove delivery.

No real test enquiry was sent. Tests use mocked upstream responses. Bhargav should run the agreed live test after deployment and confirm both inbox/WordPress Feedback receipt and conversion recording.

## Tracking and launch configuration

GTM-NDWWT247 appears once in the head. It is disabled by default, skips local/GitHub previews and checks for an existing container to avoid loading it twice. The unnecessary noscript iframe was removed. If integrating into WordPress, use the theme's GTM installation instead of including this standalone snippet again.

The current published form trigger is gtm.formSubmit with trigger 231529446_9. The initial submit is stopped from bubbling, and the compatibility event is emitted once only after confirmed acceptance. lead_form_submit is also available. Do not configure both as separate conversions. Phone and email links use tel:+16137957875 and mailto:info@graemar.com. No visitor contact details enter the data layer.

The final landing-page URL is not known yet. On the live host only, set `SITE_URL` to the final HTTPS landing-page URL (no campaign query or fragment). `metadata.mjs` then adds the canonical/og:url, uses the live image URL, replaces noindex with index/follow and enables the standalone GTM snippet. Both the Node server and `npm run build` apply this configuration. Do not set SITE_URL for previews. Do not deploy a production-configured dist to GitHub Pages.

Deploy to a Node-capable host behind HTTPS, with outbound access to graemar.com. Set HOST=0.0.0.0 and PORT as required. For a static/CDN frontend, route `/api/quote` to the Node receiver. A landing page under a subdirectory may need the host's reverse-proxy mount configured. Apply production rate limiting/spam protection at the host. Hosting and the final URL remain launch tasks.

Before ad traffic: Bhargav should verify the live form, GTM/Ads conversion counts and call forwarding in Tag Assistant. Contact-page views depend on the final URL containing “contact”; no artificial URL change has been introduced.

## Validation

With the server running: `npm run build`, `npm run check`, `npm run verify:pm`, `npm run accessibility`. Tests use Playwright Chromium and mock all valid quote requests. `npm audit` reports zero vulnerabilities for the locked dependencies.

See validation.md for results and limits. Reports, screenshots (test-results/) and build output (dist/) are not kept; the build and test commands regenerate them.
