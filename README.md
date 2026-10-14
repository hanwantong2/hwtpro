# UI Component Control Panel · Personal Dashboard

A single-page application demonstrating widget creation, management and interaction with **OOP**. Theme: Personal Dashboard.

## Features

- Dynamically add / remove 4 widget types: To-Do, Quote, Weather, Cat
- Every widget keeps independent state (its own id, data, timers, requests)
- Per-widget actions: minimize, close, drag-and-drop reorder, ↑↓ button reorder (accessible alternative)
- API widgets expose four states: **loading / empty / error / success**
- Keyboard shortcuts: press `1`–`4` to quickly add the matching widget

## File Structure

```
index.html
main.js
js/
  UIComponent.js      # Base class: skeleton, states, minimize/close, resource cleanup
  ToDoWidget.js       # To-do list (local + localStorage)
  QuoteWidget.js      # Quote API
  WeatherWidget.js    # Weather API
  CatWidget.js        # Cat image API
  Dashboard.js        # Widget collection management + drag-and-drop reorder
styles/
  main.css
  components.css
```

## Architecture

```
main.js  ──creates──▶  Dashboard  ──manages──▶  Map<id, UIComponent>
                          │
                          └── factory registry: todo / quote / weather / cat
                                       │
                                       ▼
                              UIComponent (base class)
                              ├── render(container)
                              ├── destroy()   ← cleans listeners / timers / pending requests
                              ├── setLoading / setError / setEmpty / setContent
                              └── onMount()   ← subclass hook
```

- **UIComponent** encapsulates shared behavior; subclasses only handle their own rendering.
- **Dashboard** is decoupled from widgets through `onClose` / `onMove` callbacks.
- All dynamic content is built with `textContent` / `createElement`; **API responses are never concatenated into `innerHTML`**.

## Data Sources

| Widget  | Endpoint | API key required |
|---------|----------|------------------|
| Quote   | `https://api.quotable.io/random` → fallback `https://dummyjson.com/quotes/random` → local array | No |
| Weather | `https://api.open-meteo.com/v1/forecast` | No |
| Cat     | `https://api.thecatapi.com/v1/images/search` | No (free tier) |
| To-Do   | `localStorage` (data lives inside the class) | — |

All APIs support CORS, so no server-side proxy and no client-side API keys are needed.

## Getting Started

This is a pure static front-end with no build step.

```bash
# Option 1: a local static server (recommended)
npx serve .
# or
python -m http.server 8080

# Option 2: simply open index.html in a browser
```

Then visit `http://localhost:8080`.

## Deployment

Recommended platforms: **Vercel / Netlify / GitHub Pages / Cloudflare Pages**.

Vercel example:

```bash
npm i -g vercel
vercel --prod
```

GitHub Pages: push the repository to GitHub, then in Settings → Pages select the branch.

## Limitations

- Open-Meteo is a free public API and may be rate-limited under high concurrency.
- TheCatAPI enforces a per-IP rate limit without an API key; rapid "Another cat" clicks may return 429.
- Quotable is occasionally unavailable; DummyJSON and a local quote array are used as fallbacks.
- Drag-and-drop relies on HTML5 DnD and has limited mobile support; the ↑↓ buttons provide a full alternative.
- To-do data is stored in `localStorage` and does not sync across devices.

## Quality Guarantees

- **AbortController**: the previous request is aborted before each refresh, preventing stale responses from overwriting newer data.
- **destroy() cleanup**: aborts all requests, clears all timers, removes all event listeners, and detaches the DOM node.
- **XSS protection**: API data is always assigned via `textContent` / element properties, never via `innerHTML`.
- **Accessibility**: `aria-label`, `role="alert"`, visible `:focus-visible` outlines, and button alternatives to drag-and-drop.

## AI Usage Log

| Date | Purpose | Output |
|------|---------|--------|
| 2026-10-07 | Overall architecture design (OOP class structure, base class abstraction) | UIComponent / Dashboard skeleton |
| 2026-10-07 | API widget state machine (loading / error / empty / success) | QuoteWidget / WeatherWidget / CatWidget |
| 2026-10-07 | Resource cleanup strategy (AbortController + timers + listener registry) | UIComponent.destroy() |
| 2026-10-07 | Accessibility and drag-and-drop alternative design | ↑↓ buttons + HTML5 DnD |
| 2026-10-07 | Style system (CSS Grid layout + component styles) | main.css / components.css |

> AI was used only to assist with code scaffolding and API integration. All logic was reviewed manually, and all data sources are public, keyless APIs.
