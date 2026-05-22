# TipSplit — Tip Calculator & Bill Splitter

A live, single-screen tip calculator and bill splitter. No "Calculate" button — results update as you type.

## Run locally

**Prerequisites:** Node.js ≥ 18

```bash
git clone https://github.com/TaibaAsif123/tipsplit.git
cd tipsplit
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build
npm run preview
```

## Deploy (Vercel — recommended)

```bash
npm i -g vercel
vercel
```

Or connect the repo to [vercel.com](https://vercel.com) and it auto-deploys on every push. Zero config needed — Vite is detected automatically.

## Stack

- **React 18** with Vite
- **CSS Modules** — scoped styles, no CSS-in-JS overhead
- No external UI libraries — all components hand-built
- Fonts: DM Mono + Fraunces via Google Fonts

## Project structure

```
src/
  App.jsx          # All logic and UI
  App.module.css   # Scoped styles
  index.css        # Global tokens + reset
  main.jsx         # React root
index.html
vite.config.js
ANSWERS.md
```