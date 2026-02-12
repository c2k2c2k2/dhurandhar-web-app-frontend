It’s built for **Light + Dark from day 1**, and it’s consistent across **Landing + Student + Admin**.

---

# Dhurandhar Career Academy — Design System & Theme Guidelines (v1)

## 0) Theme goals

**Executive** in our context means:

- clean, minimal, high-contrast, consistent
- premium spacing (more whitespace than borders)
- typography-led hierarchy (not too many colors)
- predictable components (same buttons/inputs everywhere)
- fast and readable on mobile

Non-goals:

- flashy gradients everywhere
- too many accent colors
- inconsistent card/border/shadow styles across apps

---

## 1) Brand palette (derived from logo)

### Core Brand

- **Brand Navy (primary):** `#083167`
- **Brand Navy 2 (hover/depth):** `#1B3B69`
- **Crimson (CTA/accent):** `#E31B4C`
- **Red (destructive/alerts):** `#DE2224`
- **Gold (premium highlight):** `#FDDA15`
- **Royal Purple (secondary accent):** `#393083`

### Neutrals (use system scale)

Use Tailwind neutral/slate via tokens. Avoid inventing extra greys.

**Rule:** Base UI = **Navy + neutral**. Crimson only for CTAs. Gold only for “Premium/Pro” tags.

---

## 2) Typography (multi-language safe)

### Fonts

- **Body:** Inter
- **Headings:** Poppins
- **Devanagari fallback:** Noto Sans Devanagari (must exist in font stack)

**Recommended font stack**

- `--font-sans: Inter, "Noto Sans Devanagari", system-ui, -apple-system, Segoe UI, Roboto, Arial`
- `--font-display: Poppins, Inter, "Noto Sans Devanagari", system-ui`

### Type scale (guideline)

- H1: 36–44 (landing hero)
- H2: 24–32
- H3: 18–22
- Body: 14–16
- Small: 12–13

### Typography rules

- Limit to 2 font families max.
- Use **font weight** for hierarchy (600/700 headings, 400/500 body).
- Keep line-height generous: 1.4–1.7.
- For Marathi/Hindi headings, avoid ultra-thin weights.

---

## 3) Spacing & layout rules (executive feel)

- Use **8pt grid**: spacing steps `2, 4, 6, 8, 10, 12, 16`
- Prefer whitespace over borders.
- Default page padding: `px-4 md:px-8` and `py-6 md:py-10`
- Max width:
  - Landing: `max-w-6xl`
  - Student/Admin: `max-w-7xl`

### Cards

- `rounded-2xl`
- subtle shadow (or border-only in dark)
- avoid heavy drop shadows

### Borders

- use 1px borders sparingly (tables/forms)
- never mix random border colors; always use token `--border`

---

## 4) Theme tokens (Light + Dark)

### 4.1 Token strategy

Use CSS variables for all semantic colors, then map them into Tailwind + shadcn.

**Hard rule:** No hex colors inside components. Only semantic tokens:

- `bg-background`, `text-foreground`, `border-border`
- `bg-primary`, `bg-accent`, `bg-destructive`
- `text-muted-foreground`, etc.

### 4.2 Light theme tokens

Use the following CSS variables (RGB triplets) in `globals.css`:

```css
:root {
  /* Brand */
  --brand-navy: 8 49 103; /* #083167 */
  --brand-navy-2: 27 59 105; /* #1B3B69 */
  --brand-crimson: 227 27 76; /* #E31B4C */
  --brand-red: 222 34 36; /* #DE2224 */
  --brand-gold: 253 218 21; /* #FDDA15 */
  --brand-purple: 57 48 131; /* #393083 */

  /* Semantic (light) */
  --background: 255 255 255;
  --foreground: 15 23 42; /* slate-900 */

  --card: 255 255 255;
  --card-foreground: 15 23 42;

  --muted: 248 250 252; /* slate-50 */
  --muted-foreground: 100 116 139; /* slate-500 */

  --border: 226 232 240; /* slate-200 */
  --input: 226 232 240;

  --primary: var(--brand-navy);
  --primary-foreground: 255 255 255;

  --secondary: 248 250 252;
  --secondary-foreground: var(--brand-navy);

  --accent: var(--brand-crimson);
  --accent-foreground: 255 255 255;

  --destructive: var(--brand-red);
  --destructive-foreground: 255 255 255;

  --ring: var(--brand-navy);

  --radius: 16px;
}
```

### 4.3 Dark theme tokens

Add `.dark` overrides:

```css
.dark {
  /* Semantic (dark) */
  --background: 9 12 18; /* deep slate/near-black */
  --foreground: 226 232 240; /* slate-200 */

  --card: 12 17 26;
  --card-foreground: 226 232 240;

  --muted: 18 24 36;
  --muted-foreground: 148 163 184; /* slate-400 */

  --border: 30 41 59; /* slate-800-ish */
  --input: 30 41 59;

  /* Keep brand semantics consistent */
  --primary: var(--brand-navy-2); /* slightly brighter navy for dark */
  --primary-foreground: 255 255 255;

  --secondary: 18 24 36;
  --secondary-foreground: 226 232 240;

  --accent: var(--brand-crimson);
  --accent-foreground: 255 255 255;

  --destructive: var(--brand-red);
  --destructive-foreground: 255 255 255;

  --ring: var(--brand-crimson);
}
```

### 4.4 Tailwind mapping (semantic)

In `tailwind.config.ts`, map:

- `background`, `foreground`
- `primary`, `secondary`, `accent`, `destructive`
- `muted`, `border`, `ring`
- add `brand.*` for special use cases (gold/purple)

---

## 5) Dark mode behavior

- Use `next-themes` with `attribute="class"`.
- Default theme: `system` (unless client insists)
- Provide a theme toggle in:
  - Student top bar
  - Admin top bar
  - Landing footer or navbar

**Rule:** Both themes must pass:

- readable text contrast
- visible border on cards/inputs
- clear CTA button contrast

---

## 6) Component guidelines (shadcn + Tailwind)

### Buttons

Define 4 button intents only:

- Primary: `bg-primary text-primary-foreground`
- Secondary: `bg-secondary text-secondary-foreground border border-border`
- Accent CTA: `bg-accent text-accent-foreground`
- Destructive: `bg-destructive text-destructive-foreground`

**Rules**

- Only 1 main CTA per screen.
- Crimson accent is for CTA/purchase actions, not random usage.

### Badges

- Premium: `bg-[brand-gold] text-brand-navy` (or `bg-brand-gold text-brand-navy`)
- Published/Success: green
- Pending: amber
- Draft: muted

### Inputs

- Always `bg-background border-border`
- Error state uses destructive border + helper text

### Cards

- Always use `bg-card text-card-foreground`
- Border optional in light; recommended in dark (`border-border`)

### Tables (Admin)

- Minimal grid lines
- Row hover highlight using `bg-muted/40`
- Sticky header optional

---

## 7) Visual style per app area

### Landing (Public)

- More visual freedom, but still executive:
  - navy hero section
  - clean typography
  - 1–2 hero illustrations max

- CTA should be crimson (Subscribe / Start Learning)
- Use gold only for “Premium / Bestseller” tag

### Student App

- Content-first:
  - strong readability
  - big tap targets
  - minimal clutter

- Notes viewer:
  - avoid side distractions
  - consistent watermark overlay style

- Practice/Test:
  - clear progress UI
  - consistent answer feedback

### Admin Panel

- Most “executive”:
  - neutral background
  - consistent tables/forms
  - minimal color usage
  - crimson only for primary action buttons

- Avoid “gaming” UI elements. Keep it serious.

---

## 8) Iconography

- Use a single icon set (lucide-react).
- Keep icons 16–20px in admin, 20–24px in student app.
- Avoid mixing filled/outline styles randomly.

---

## 9) Motion & micro-interactions (minimal)

- Transitions: 150–200ms
- Use subtle hover/active feedback
- Avoid heavy animations; keep professional

---

## 10) Imagery rules

- Use high-quality photos/illustrations (landing only).
- In student/admin, use minimal imagery.
- Any banner images should be aligned with brand palette (navy/purple/crimson tones preferred).

---

## 11) Accessibility rules (non-negotiable)

- All text contrasts must be readable in both themes.
- Buttons must have focus ring (`ring` token).
- Forms: label + helper/error text.
- Tappable targets on mobile: 44px min.

---

## 12) Maintainability rules (prevent theme drift)

1. **No hex colors in components** (use tokens only).
2. No custom shadows per component; standardize.
3. Every new component must use:
   - `bg-background`, `text-foreground`, `border-border`

4. Keep `Design Tokens` in one place (globals.css).
5. Review checklist before merge:
   - spacing consistent?
   - typography consistent?
   - uses tokens?
   - works in dark mode?
   - mobile layout ok?

---

## 13) Implementation checklist (what Codex should do)

- [ ] Install `next-themes`
- [ ] Add token CSS variables for light + dark
- [ ] Map tokens in Tailwind config
- [ ] Ensure shadcn components use semantic tokens
- [ ] Add `<ThemeToggle />` in admin/student navbars
- [ ] Verify 10–15 key pages in both themes:
  - login
  - dashboard
  - notes list/editor
  - questions editor
  - tests builder
  - cms pages

---

## 14) Optional (nice upgrade later)

- Add a “Brand gradient” utility:
  - background gradient in landing only (navy → navy2)

- Add chart library styling later (recharts) using tokens

---
