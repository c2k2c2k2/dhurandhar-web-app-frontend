# THEME IMPLEMENTATION TASKS (Next.js App Router + Tailwind + shadcn)

## TH0) Install deps

**TASK TH0.1 — Install theme dependency**

```bash
pnpm add next-themes
```

**TASK TH0.2 — (If not done yet) Tailwind + shadcn**

```txt
Ensure tailwindcss is installed and configured.
Ensure shadcn/ui is installed in this repo.
If shadcn is not set, initialize it with "neutral" base and css variables enabled.
```

---

## TH1) Add design tokens (Light + Dark)

**TASK TH1.1 — Update global CSS tokens**

```txt
Edit: src/app/globals.css
Add tokens exactly:

:root {
  --brand-navy: 8 49 103;
  --brand-navy-2: 27 59 105;
  --brand-crimson: 227 27 76;
  --brand-red: 222 34 36;
  --brand-gold: 253 218 21;
  --brand-purple: 57 48 131;

  --background: 255 255 255;
  --foreground: 15 23 42;

  --card: 255 255 255;
  --card-foreground: 15 23 42;

  --muted: 248 250 252;
  --muted-foreground: 100 116 139;

  --border: 226 232 240;
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

.dark {
  --background: 9 12 18;
  --foreground: 226 232 240;

  --card: 12 17 26;
  --card-foreground: 226 232 240;

  --muted: 18 24 36;
  --muted-foreground: 148 163 184;

  --border: 30 41 59;
  --input: 30 41 59;

  --primary: var(--brand-navy-2);
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

**TASK TH1.2 — Ensure base styles use tokens**

```txt
In globals.css, ensure body uses:
- background: bg-background
- text color: text-foreground
- font-smoothing, selection styles optional
No hardcoded background colors in body/html.
```

---

## TH2) Tailwind config mapping

**TASK TH2.1 — Map semantic tokens in tailwind.config.ts**

```txt
Edit tailwind.config.ts to include:

extend: {
  colors: {
    brand: {
      navy: "rgb(var(--brand-navy))",
      navy2: "rgb(var(--brand-navy-2))",
      crimson: "rgb(var(--brand-crimson))",
      red: "rgb(var(--brand-red))",
      gold: "rgb(var(--brand-gold))",
      purple: "rgb(var(--brand-purple))",
    },
    background: "rgb(var(--background))",
    foreground: "rgb(var(--foreground))",
    card: "rgb(var(--card))",
    "card-foreground": "rgb(var(--card-foreground))",
    muted: "rgb(var(--muted))",
    "muted-foreground": "rgb(var(--muted-foreground))",
    border: "rgb(var(--border))",
    input: "rgb(var(--input))",
    primary: "rgb(var(--primary))",
    "primary-foreground": "rgb(var(--primary-foreground))",
    secondary: "rgb(var(--secondary))",
    "secondary-foreground": "rgb(var(--secondary-foreground))",
    accent: "rgb(var(--accent))",
    "accent-foreground": "rgb(var(--accent-foreground))",
    destructive: "rgb(var(--destructive))",
    "destructive-foreground": "rgb(var(--destructive-foreground))",
    ring: "rgb(var(--ring))",
  },
  borderRadius: {
    xl: "calc(var(--radius) - 4px)",
    "2xl": "var(--radius)",
  },
}
```

**TASK TH2.2 — Ensure dark mode is class-based**

```txt
In tailwind.config.ts:
darkMode: ["class"]
```

---

## TH3) Theme provider (next-themes)

**TASK TH3.1 — Create ThemeProvider wrapper**

```txt
Create: src/components/theme-provider.tsx

"use client";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

**TASK TH3.2 — Wrap root layout**

```txt
Edit: src/app/layout.tsx
Wrap <body> content with <ThemeProvider>.

Also ensure body has:
className="min-h-screen bg-background text-foreground antialiased"
```

---

## TH4) Fonts (Inter + Poppins + Devanagari fallback)

**TASK TH4.1 — Add next/font setup**

```txt
In src/app/layout.tsx, configure next/font:
- Inter as --font-sans
- Poppins as --font-display
If you can: add Noto Sans Devanagari as fallback (optional v1)
Set body class to include:
font-sans
and expose display font via utility class (e.g. font-display).
```

**TASK TH4.2 — Define font utilities**

```txt
Add in globals.css:
.font-display { font-family: var(--font-display); }
Ensure headings use font-display in key components (PageHeader etc.)
```

---

## TH5) Update shadcn base to use tokens (important)

**TASK TH5.1 — Verify shadcn components use semantic classes**

```txt
Audit core shadcn components used:
- button.tsx
- card.tsx
- badge.tsx
- input.tsx
- dialog.tsx
Ensure no hardcoded colors. They should use:
bg-background, text-foreground, bg-primary, bg-accent, border-border, etc.
```

**TASK TH5.2 — Define button variants aligned to brand**

```txt
In button.tsx variants:
- default -> primary
- secondary -> secondary
- destructive -> destructive
- outline -> border-border text-foreground
- ghost -> text-foreground hover:bg-muted
Add variant "cta" -> bg-accent text-accent-foreground hover:opacity-90
Use cta for subscription/purchase actions.
```

---

## TH6) Theme toggle component

**TASK TH6.1 — Build ThemeToggle**

```txt
Create: src/components/theme-toggle.tsx
- useTheme() from next-themes
- toggle between "light" and "dark"
- show an icon (lucide-react Sun/Moon)
- use shadcn Button variant="ghost" size="icon"
```

**TASK TH6.2 — Place toggles**

```txt
Add ThemeToggle to:
- Admin Topbar (right side)
- Student Topbar (later)
- Landing navbar/footer (later)
```

---

## TH7) Brand primitives (reusable styles)

**TASK TH7.1 — Create BrandBadge for premium**

```txt
Create: src/components/brand/PremiumBadge.tsx
- className="bg-brand-gold text-brand-navy font-semibold"
Use only for premium marks.
```

**TASK TH7.2 — Create Page container utility**

```txt
Create: src/components/layout/PageContainer.tsx
- className="mx-auto w-full max-w-7xl px-4 md:px-8"
Use across admin/student.
Landing uses max-w-6xl.
```

---

## TH8) “Executive” visual rules baked into defaults

**TASK TH8.1 — Card defaults**

```txt
Ensure Card uses:
bg-card text-card-foreground border border-border rounded-2xl
Shadow very subtle or none (prefer border in dark).
```

**TASK TH8.2 — Focus + ring**

```txt
Ensure inputs/buttons show focus ring:
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
and ring-offset uses bg-background
```

---

## TH9) Quick verification pages (smoke test)

**TASK TH9.1 — Create /theme-preview route**

```txt
Create a temporary page: /app/theme-preview/page.tsx
Show:
- Buttons (primary/secondary/cta/destructive/outline/ghost)
- Inputs + Select + Switch
- Card + Table + Dialog
- PremiumBadge
Test in light and dark.
Remove later or keep behind admin perm.
```

**TASK TH9.2 — Validate admin pages quickly**

```txt
Open:
- /admin/login
- /admin
- /admin/notes
- /admin/questions/new
Toggle light/dark and verify:
- text readable
- borders visible
- CTA contrast works
- no weird hardcoded whites/blacks
```

---

## TH10) Team rules (for Codex + devs)

**TASK TH10.1 — Add lintable “no hex” rule (optional)**

```txt
Add a simple convention:
- forbid "#xxxxxx" in .tsx via eslint regex rule or PR checklist.
If too much, add a docs rule instead.
```

**TASK TH10.2 — Add /references/design-system.md**

```txt
Paste the Design System doc (the one we wrote) into /references.
Codex must follow:
- no hex in components
- use tokens only
- keep spacing scale
```

---

# Definition of Done (Theme)

- Light + Dark toggle works everywhere
- No hardcoded hex colors in UI components
- shadcn uses semantic token classes
- Core pages look consistent (admin login/dashboard/forms)
- Theme preview page looks correct in both themes

---
