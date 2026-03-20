# Site Snipe

Site Snipe is a WXT browser extension that injects an in-page panel to:

1. Select an element on the page and schedule an automated click at a chosen time (with a given lead time to offset network latency).
2. Estimate network latency using a configurable endpoint and/or measurements to the current page's server.

The goal is to win a competition involving clicking a button on a webpage at the right time without clicking too early. There are situations where this would be an unfair advantage, but we display this interface in the page where it's visible to user session recording because it isn't for questionable purposes.

## Features

- Per-domain enable/disable toggle via the browser extension popup.
- Click-target selection with visual highlight.
- Scheduled click on the selected element with dual timing (coarse & fine) to compensate for Javascript's timing latency, bringing it down from potentially hundreds of milliseconds to typically under 5ms. Fine-grain timing involves entering a blocking loop about 500ms (whenever the JS runtime gets around to it) before the intended click time
- Latency calibration (Own server) lets you make a server/function in the same building as the target server (if it's on AWS, Azure, GCP, etc.) to send back request *received* times for gauging network latency.
- Latency calibration (Current page) measures latency to the current URL (estimates one-way as roundtrip/2) for simple HEAD requests.
- Histograms shown from collected latency samples to make judgements for appropriate lead time.

## Tech Stack

- WXT (extension framework)
- TypeScript
- React
- Tailwind CSS + shadcn-style components

## Installation

### Requirements

- Node.js (LTS recommended)

### Setup

1. Install dependencies: `npm install`
2. Configure latency calibration to own server (optional):
   Create a `.env` file in the project root and set `VITE_LATENCY_URL="https://<your-endpoint>/api/..."`.
   The endpoint should return JSON containing `serverReceiveTime` as a timestamp (e.g. an ISO string).
   This allows you to create a cloud resource *in the same platform/region* as the website whose button you're trying to click so you know your sent-received timing fairly accurately (assuming the system time is synchronized)
3. Start the extension in development mode: `npm run dev` (Firefox: `npm run dev:firefox`), or build and install it: `npm run build` (Firefox: `npm run build:firefox`) 

## Usage

1. Open the extension popup.
2. Check `Enable panel on this site` for the current tab.
3. On the page:
   Click `Select element on page`, then click the target element you want to schedule a click on.
   In `Schedule`, choose `Drop time` and `Lead (ms)`, then click `Schedule`.
4. Latency calibration (in the same injected panel): `Own server` calibrates mean offset/variability using `VITE_LATENCY_URL`, and `Current page` measures latency for the page you are currently viewing. That information can be used to guess a lead time that's unlikely to result in the click being too early.

### What does `Lead (ms)` mean?

The click is dispatched at the selected time minus `Lead (ms)`.

## Notes / Troubleshooting

- "Own server" latency calibration depends on `VITE_LATENCY_URL` being reachable from the browser and returning the expected JSON field (`serverReceiveTime`). *It must have CORS rules relaxed on the server side* which may just involve "Access-Control-Allow-Origin: *"
- If the site you are testing blocks synthetic events, scheduled clicks may not behave as expected.
- If elements on a webpage are positioned in a way that blocks the injected panel, move the panel somewhere clear on the page by selecting an element, configure/schedule it, then select the appropriate element to click
