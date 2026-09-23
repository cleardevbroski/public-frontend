# Responsive Checks

`responsive-check.cjs` checks employee queues, partner forms, dashboards, public pages and admin layouts against a local Vite server. It intercepts API requests with synthetic data and blocks external requests. It does not authenticate against production or modify real contacts.

Start the frontend with `npm run dev -- --host 127.0.0.1 --port 5173`. With Playwright available to Node, run:

```sh
node scripts/responsive-check.cjs
```

For an existing external Playwright installation, set `PLAYWRIGHT_MODULE` to its module path. The default browser is `/usr/bin/google-chrome`; override it with `CHROME_PATH`.

Options:

- `BASE_URL`: local frontend URL.
- `WIDTHS`: comma-separated viewport widths; defaults to 360, 430, 768, 1280, 1440 and 1920.
- `ROUTES`: comma-separated paths for a focused run.
- `SCREENSHOT_DIR`: defaults to `/tmp/cleartitle-responsive`.

The checks cover document overflow, rendering errors, 305 assigned contacts, serial search, navigation, mobile client tabs, signature pixels after resizing, property image loading, and enquiry-button clearance. Editable or complex tables retain horizontal scrolling; simple record tables become labelled rows on phones.

These are Chromium checks with mocked responses, not end-to-end verification of live login, WhatsApp delivery, uploads or deployment.
