# ✨ Daily Quotes AI

A production-grade, ultra-polished **Chrome Extension** delivering daily inspirational quotes, AI-powered quote generation, streaks, achievements, statistics, and six fully-realized visual themes.

Built with **Plasmo** (Manifest V3), **React 18**, **Framer Motion**, **CSS Modules**, and a centralized design-token system.

---

## Features

- 🌟 **Quote of the Day** — deterministic daily quote, rotated automatically at midnight via `chrome.alarms`.
- 💛 **Favorites** — save, remove, and manage favorites (deduplicated, persisted to `chrome.storage.local`).
- 🕘 **History** — review previously viewed quotes with search.
- 📊 **Statistics & Achievements** — streaks, best streak, top category, and unlockable badges.
- ✨ **AI Studio** — generate custom quotes via OpenAI (optional API key) with an offline fallback generator.
- 🎨 **6 Themes** — Light, Dark, AMOLED, Sunset Glow, Ocean Depth, Forest Chill.
- 🔔 **Notifications** — daily reminders and streak-milestone alerts via `chrome.notifications`.
- ⌨️ **Keyboard Commands** — global shortcuts for next quote and favorite.
- 🖱 **Context Menu** — "Save text as Daily Quote" on any text selection.
- 🔊 **Sound Effects** — Web Audio API feedback sounds, routed through an offscreen document when the popup is closed.
- 🔒 **Accessible** — ARIA roles, keyboard navigation, `aria-live`, focus rings, reduced-motion support.

---

## Tech Stack

- **[Plasmo](https://docs.plasmo.com/)** — Manifest V3 framework & bundler.
- **React 18** — UI.
- **Framer Motion** — GPU-accelerated animations with centralized motion tokens.
- **CSS Modules** — component-scoped styles + global design tokens (`styles/tokens.css`, `styles/themes.css`).
- **Jest + React Testing Library** — automated tests.
- **JavaScript (ES6+)** — no TypeScript.

---

## Project Structure

```
daily-quotes-ai/
├── assets/                 # Generated PNG icons
├── background/index.js     # MV3 service worker
├── offscreen/              # Offscreen audio document
├── components/             # Atomic UI components + CSS modules
├── context/QuoteContext.jsx# Global context (no prop drilling)
├── hooks/                  # Custom hooks (quotes, favorites, theme…)
├── pages/                  # Home, Favorites, History, Statistics, Settings, AIStudio
├── styles/                 # tokens.css, themes.css, globals.css, motion.js, motionVariants.js
├── utils/                  # constants, chromeStorage, soundEngine, aiGenerator
├── data/quotes.json        # 100-quote curated dataset
├── tests/                  # Jest + RTL suites
├── popup.jsx               # Popup entry
├── options.jsx             # Options entry
├── manifest.json
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js 18+**
- **npm**

### Install

```bash
npm install
```

### Generate icons (already committed, but reproducible)

```bash
node scripts/generateIcons.js
```

### Development (hot reload)

```bash
npm run dev
```

Plasmo will generate a `build/` folder containing the unpacked extension. Load it in Chrome:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `build/chrome-mv3-prod` (or `build/chrome-mv3-dev`) directory.

### Production build

```bash
npm run build
```

### Run tests

```bash
npm test
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/⌘ + Shift + Y` | Open the popup |
| `Ctrl/⌘ + Shift + U` | Next quote |
| `Ctrl/⌘ + Shift + F` | Favorite current quote |
| `F` / `C` | Favorite / Copy (within popup) |
| `Esc` | Clear search |

---

## Themes

Switch themes from **Settings** or the inline theme switcher. Themes persist via `chrome.storage.sync` and apply instantly across all extension surfaces.

| Theme | Accent |
| --- | --- |
| Light | Crisp indigo |
| Dark | Glowing cyan |
| AMOLED | Neon violet on pure black |
| Sunset Glow | Terracotta + golden amber |
| Ocean Depth | Teal on deep navy |
| Forest Chill | Mint on deep emerald |

---

## AI Studio (Optional)

If you add an **OpenAI API key** in Settings, the AI Studio will call the Chat Completions API to generate fresh quotes. Without a key, it gracefully falls back to a built-in offline generator—so the feature always works.

---

## Design System

All spacing (8px grid), radii, shadows, typography, and icon sizes are governed by CSS custom properties in `styles/tokens.css`. Themes override color tokens via `[data-theme="…"]` scopes in `styles/themes.css`. Motion constants and reusable variants live in `styles/motion.js` and `styles/motionVariants.js`.

---

## License

MIT © Daily Quotes AI
