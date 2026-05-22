# ANSWERS.md

## 1. How to run

**Prerequisites:** Node.js ≥ 18

```bash
git clone https://github.com/TaibaAsif123/tipsplit.git
cd tipsplit
npm install
npm run dev
# → open http://localhost:5173
```

No environment variables. No other setup.

---

## 2. Stack & design choices

**Stack:** React 18 + Vite + CSS Modules.

I chose React because the live-update requirement maps naturally to controlled inputs and derived state — every result is just a pure function of `(bill, tipPct, people)` computed on every render, no side effects, no event-driven recalculation. Vite gives instant HMR during development and a fast, minimal production bundle. CSS Modules keep styles scoped without the runtime cost of CSS-in-JS.

**Visual decision 1 — Two-column split layout (inputs left, results right).**
The shell is a single card divided into two halves by a 1px border. This isn't the default stacked layout most calculators use. The reason: the user's primary action (entering numbers) and the primary output (per-person share) need to be visible simultaneously without scrolling. On mobile where the two-column layout collapses to single-column, results appear directly below inputs so the user can see them after the keyboard dismisses. Putting results in a permanently visible right panel on desktop means the number updates are peripheral — you sense the change without having to look away from where you're typing.

**Visual decision 2 — The per-person amount is typeset in an italic serif, 2× larger than the other result values.**
`Fraunces` (optical-size italic) is used only for that one number and the wordmark. Everything else is `DM Mono`. This hierarchy means the most important output — the answer the user actually needs to act on at the restaurant table — is immediately scannable without reading. The supporting numbers (tip amount, grand total) are present but visually subordinate. I deliberately did not use color to distinguish the values; the size and typeface do the work instead.

---

## 3. Responsive & accessibility

**360px vs 1440px:**
At 360px, the two-column grid collapses to a single column. The preset tip buttons reflow from 4 columns (3 presets + custom) to 3 columns with custom spanning full width. Font sizes reduce slightly. The input padding tightens. The results panel sits below the inputs, so the keyboard (which covers ~40% of viewport on mobile) dismisses naturally when the user tabs away — the result is already rendered and scrolls into view. At 1440px, the shell is capped at 740px width and centred, so the layout doesn't stretch awkwardly.

**Accessibility handled — focus management and ARIA:**
Every interactive element is keyboard reachable in a logical tab order (bill → preset buttons → custom tip → stepper − button → people input → stepper + button → reset). The preset buttons use `aria-pressed` to communicate selection state to screen readers. Error messages use `role="alert"` so they're announced immediately when they appear. The results section uses `aria-live="polite"` so updated values are read out after the user pauses typing. The stepper +/− buttons have explicit `aria-label` attributes since they're icon-only. All inputs have associated `<label>` elements via `htmlFor`/`id`. Focus rings use `outline: 2px solid var(--accent)` via `:focus-visible` — keyboard users see them, mouse users don't.

**Accessibility skipped — color contrast on muted text:**
The muted annotation text (e.g., "Rounded up to nearest paisa") and placeholder text use low-contrast colors (`#55556a` on `#1f1f24`) that likely fail WCAG AA for small text. I kept them because they're supplementary — not error states, not labels, not required to use the app. With another day I'd audit every color pair against WCAG 4.5:1 and bump the muted values up.

---

## 4. AI usage

I used Claude (claude.ai) as a development assistant during this project to speed up iteration and validate implementation decisions, especially around React patterns and state handling. Since I am still strengthening my React proficiency, I treated AI output as a reference rather than final code.

**Where I used it:**

1. **Initial scaffolding prompt:** Asked for a Vite + React + CSS Modules project structure for a tip calculator. It gave me a working skeleton with `useState` for bill, tip, and people — and a single `calculate()` function called on button click.

2. **Validation logic:** Asked it to write inline validation for the three fields. It returned a `validate()` function that checked each field independently and returned an error map. I used this structure directly but changed two things: (a) it validated `tip` as required even when a preset was selected — I rewrote that branch so custom tip validation only fires when `useCustom` is true, because blocking submission over a blank custom field when the user picked a preset button is wrong UX; (b) it used `Number()` coercion to check the people field, which accepts `"1.5"` as valid. I switched to `parseInt` + a `/^\d+$/` regex guard so fractional people are caught.

3. **Rounding policy decision:** Asked it to explain rounding options for bill-splitting. It listed round-half-up, round-down, and ceiling rounding. I chose `Math.ceil(raw * 100) / 100` (ceiling to 2 decimal places) based on its explanation that restaurants expect to be paid in full, never less.

4. **CSS layout:** Asked for a two-column card layout in CSS Modules. It gave me `grid-template-columns: 1fr 1fr` with a gap. I changed the gap to `1px` with the parent background set to `var(--border)` — a common CSS trick to make the gap appear as a dividing line rather than whitespace. The AI output would have produced a visible gap between the panels; this approach makes it look like a single card with an internal border.

---

## 5. Honest gap

The stepper buttons (−/+) for the people count behave slightly wrong on rapid clicks — if you hold down the button and click fast, the state update can lag behind because `setPeople` is reading stale closure values instead of using the functional updater form (`setPeople(prev => ...)` with a ref for the current parsed value). In practice it catches up, but it can flicker on fast input.

With another day I'd refactor the stepper to use `useReducer` instead of individual `useState` calls — the whole form state (bill, tip, people, useCustom) would live in one reducer, making derived state and resets cleaner, eliminating the stale closure issue, and making it easier to test the logic independently of the UI. 