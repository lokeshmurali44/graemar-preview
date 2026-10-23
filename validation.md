# PM revision validation — 23 October 2026

| Check | Result |
| --- | --- |
| Build, single H1, local HTML/assets | Passed |
| Responsive layout and controls at 19 widths, 320–2560px | Passed |
| Two-line process descriptions at all 19 widths | Passed |
| Six comparison sliders, pointer and keyboard | Passed |
| Service variants, fallback, all rendered images | Passed |
| FAQs, sticky CTA, form states, attribution | Passed |
| Phone punctuation-only and incorrect digit counts | Rejected; valid formatted number accepted |
| Server punctuation-only phone | HTTP 400 before contacting Jetpack |
| Contact links | At least 44px high on mobile |
| Mobile rendered text styles | No text styles below 12px; logo lettering excluded |
| Photos | 44 external WebPs; largest 84,716 bytes |
| Below-hero photos | Lazy loaded; no embedded base64 photos |
| Automated axe mobile scan | Zero violations |
| Live Jetpack form 48 discovery | Read-only GET confirmed fields and tokens |
| Jetpack mapping and accepted/rejected responses | Passed with mocked upstream |
| GTM container and form trigger | Public configuration inspected; snippet installed |
| Failed / successful form conversion | Zero / one in mocked browser checks |
| Inbox receipt, production Ads conversion, phone forwarding | Not tested; requires agreed live verification |

## Implementation

Files changed: index.html, CSS, JavaScript, photo assets/manifest, server.mjs, new jetpack.mjs, preparation/build/test scripts, configuration example and documentation. Original parent-folder files remain unchanged.

The PM audit appears to refer to the older standalone export. This revision uses the modular site and preserves its design and six visible comparison projects.

Form integration refreshes Jetpack tokens and requires explicit acceptance to avoid false success. Risk: medium, because the live third-party form can change and actual delivery remains unconfirmed. Description breaks, phone validation, contact targets and image budgets are low-risk changes. GTM integration matches the current published trigger, but account-side configuration requires production review.

## Limits

Checks use Chromium, not physical phones, Safari or Firefox. Automated accessibility scans do not replace screen-reader QA. Live delivery, the missing checklist attachment and Google account configuration are outside these local results. Lighthouse is a local lab measurement with the GTM preview guard active; final hosting and live marketing scripts can change performance.

## Local mobile Lighthouse result

Performance: 99/100. Largest contentful paint: 2.1 seconds. First contentful paint: 1.4 seconds. Total blocking time: 10 ms. Cumulative layout shift: 0.016. Measured with Lighthouse's default simulated mobile throttling, using the local preview without live GTM tags. Archived evidence: ../pm-revision-cleanup-archive/test-results/lighthouse-mobile.json. This is not a guarantee for production hosting.
