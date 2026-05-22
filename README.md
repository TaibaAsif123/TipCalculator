# TipSplit — Tip Calculator & Bill Splitter

A live, single-screen tip calculator and bill splitter. No "Calculate" button — results update as you type.

## Run locally

**Prerequisites:** Node.js ≥ 18

```bash
https://github.com/TaibaAsif123/TipCalculator.git
cd TipCalculator
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build
npm run preview
```

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