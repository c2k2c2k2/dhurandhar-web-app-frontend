```
start landing page
```

Perfect 👍
Let’s **start the Landing Page** properly—clean, executive, and conversion-focused, while
staying easy to wire with your existing backend + admin CMS.

I’ll break this into **what to build** , **how to structure it** , and **implementation tasks** so this can
directly go into your frontend backlog / Codex flow.

## 1️⃣ Landing Page Goal (very important)

The landing page has **one job** :

So everything revolves around:

```
Trust
Clarity
Credibility
Clear CTAs
```

No clutter. No “fancy for the sake of fancy”.

## 2️⃣ High-Level Sections (in order)

### 1. Header / Navigation

**Sticky, minimal**

```
Convert a visitor into a registered student (or at least a serious lead).
```

**Left**

```
Logo
```

**Right**

```
Exams
Courses
Pricing
About
Login
Primary CTA: Start Learning
```

Rules:

```
Transparent → solid on scroll
Same nav works for desktop + mobile (drawer)
```

### 2. Hero Section (Above the Fold)

This decides whether users stay or bounce.

**Left (content)**

```
Strong headline
```

```
Sub-text
```

```
CTAs
Get Started Free (primary)
Explore Exams (secondary)
```

**Right (visual)**

```
Product mock (dashboard / test screen)
Avoid stock photos of students
```

Design notes:

```
Light mode: white / soft gray background
Dark mode: deep navy / charcoal
Accent color only on CTAs
```

```
“Prepare Smarter. Perform Better.”
```

```
“Practice tests, notes, analytics, and performance tracking—built for serious
aspirants.”
```

### 3. Exams / Categories Section

**Grid of exam cards**

```
Exam Name
Level (Foundation / Advanced)
CTA: View Details
```

Example:

```
Banking
SSC
State Exams
Custom Institute Exams
```

This should later be **CMS-driven**.

### 4. Why Choose Us (USP Section)

3–5 cards max:

```
📘 Structured Notes
📝 Smart Tests & Practice
📊 Performance Analytics
🔒 Secure Content
📱 Mobile-First Experience
```

Each card:

```
Icon
1-line title
2-line explanation
```

No long paragraphs.

### 5. How It Works

Simple 3-step horizontal flow:

**1.** Register
**2.** Choose Exam
**3.** Practice → Analyze → Improve

This builds confidence and reduces friction.

### 6. Features Deep-Dive (Optional but Powerful)

Alternate layout:

```
Left: text
Right: screenshot / illustration
```

Features:

```
Test Engine
Notes Viewer
Progress Tracking
Payments & Subscriptions
```

Keep this skimmable.

### 7. Pricing / Plans (Very Important)

Even if payments are not live yet— **show intent**.

Cards:

```
Free
Standard
Premium
```

Each with:

```
What’s included
CTA: Start Free / Upgrade
```

This psychologically prepares users to pay later.

### 8. Trust & Credibility

One or more:

```
“Trusted by X+ students”
Institute logos
Testimonials (even placeholders initially)
```

Avoid fake testimonials—better to keep minimal.

### 9. Final CTA Strip

Strong closing message:

Button:

```
Create Free Account
```

This should be visually loud but clean.

### 10. Footer

Sections:

```
About
Contact
Privacy Policy
Terms
Refund Policy
```

Mandatory for payments later.

## 3️⃣ Design Rules (Executive Feel)

```
Typography
Heading: Inter / Poppins / Manrope
Body: Inter / Roboto
Spacing
Generous padding (no cramped UI)
Colors
Neutral base
1 accent color only
Animations
Subtle (fade / slide)
No flashy effects
```

Executive ≠ flashy
Executive = **confidence + restraint**

```
“Start your preparation today.”
```

## 4️⃣ Technical Structure (Frontend)

Suggested structure (React / Angular both apply):

Rules:

```
Each section = self-contained
No API dependency initially (mock data)
Replace with CMS data later
```

## 5️⃣ Landing Page Implementation Tasks

You can copy this directly into your task tracker 👇

### Phase 1 – Foundation

```
Setup landing route
Setup layout (header + footer)
Theme integration (light/dark)
```

### Phase 2 – Core Sections

```
Hero section
Exams section (static)
USP section
```

### Phase 3 – Conversion

```
Pricing section
CTA flows
Auth redirects (Login / Register)
```

```
objectivec
```

```
landing/
├── sections/
│ ├── HeroSection
│ ├── ExamsSection
│ ├── FeaturesSection
│ ├── HowItWorksSection
│ ├── PricingSection
│ ├── TrustSection
│ └── CTASection
├── LandingPage.tsx
└── landing.styles.ts Copy code
```

### Phase 4 – Polish

```
Responsive fixes
Accessibility checks
SEO basics (meta, headings)
```

## 6️⃣ What I Suggest Next

👉 **Next step:**
Shall we **design the Hero section in detail** (copy + layout + CTA logic), or do you want to
**wire the landing page to Admin CMS from day one**?

Both are valid—but choosing one now will save rework later.

```
go for next step
```

Cool — next step is **Hero section (copy + layout + CTA logic)**. This is the most important
block on the landing page, so we’ll lock a strong baseline that feels **executive + credible**.

## 1) Hero content (baseline copy)

### Headline options (pick one later, implement with option A by default)

**A.** _Prepare Smarter. Perform Better._
**B.** _Everything you need to crack your exam—one platform._
**C.** _Practice • Analyze • Improve—daily._

### Subheadline (supporting line)

“Notes, mock tests, practice sets, and performance analytics—built for serious aspirants.”

### CTA buttons

```
Primary: Get Started Free → goes to /auth/register
Secondary: Explore Exams → scrolls to Exams section (#exams) or route /exams
```

### Trust strip (one line + 3 bullets)

```
One line: “Trusted learning experience for focused preparation.”
Bullets:
“Mobile-first experience”
“Smart analytics”
“Secure content access”
```

(Keep numbers like “10,000+ students” out until you can prove it.)

## 2) Hero layout (executive look)

**Desktop (2-column):**

```
Left: headline + subheadline + CTAs + trust strip
Right: product visual placeholder (dashboard mock card, not stock photos)
```

**Mobile (stacked):**

```
Text first
Visual card below
CTAs full-width
```

**Key styling rules**

```
Background: subtle gradient / soft surface (theme-aware)
Use one accent color only for primary CTA
Very generous spacing (executive feel)
```

## 3) CTA logic (what should happen)

### Primary CTA: Get Started Free

Rules:

```
If user not logged in → /auth/register?from=landing
If user logged in → /student (or student dashboard route)
```

### Secondary CTA: Explore Exams

```
Scroll to #exams if on same page
If you plan separate exams listing → route /exams
```

### Optional: “Login” text link near CTA row

```
/auth/login?from=landing
```

## 4) Implementation tasks (Hero module)

Add these to your frontend tasks:

### HeroSection v

```
Create HeroSection component with:
Headline + subheadline
CTA buttons + login link
Trust strip (3 bullet chips)
Right-side “ProductPreviewCard” placeholder (theme-aware)
```

### Navigation behaviors

```
Implement smooth scroll to #exams
Add route helpers:
goRegisterFromLanding()
goLoginFromLanding()
goStudentHome()
```

### Auth-aware CTA

```
Read auth state from your existing auth store (token/user)
Decide CTA target based on isAuthenticated
```

### Responsiveness

```
Breakpoints:
Mobile: stacked, CTAs full width
Desktop: 55/45 split, preview card fixed width
```

### Accessibility + SEO

```
Hero headline as H
Buttons with clear labels
Ensure focus styles visible in both themes
```

## 5) Minimal data/config (so it’s CMS-ready later)

Create a simple config object (even if hardcoded now):

```
hero.title
hero.subtitle
hero.primaryCtaLabel
```

```
hero.secondaryCtaLabel
hero.trustBullets[]
```

Later this can come from CMS without refactor.

### Next after this

Once Hero is in place, the clean flow is:

**1. Exams section (grid + filters lite) 2. USP section (3–5 cards) 3.** Pricing + Footer policies

Say “next” and I’ll give you the **Exams Section spec + tasks** (CMS-ready + student-
friendly).

```
next
```

Great — next is **Exams Section (grid + lightweight filters + CMS-ready)**.

## 1) Exams Section goal

Let users instantly answer:

```
“Do you have my exam?”
“What do I get inside it?”
“How do I start?”
```

So the section must be:

```
fast to scan
searchable
CTA-driven
```

## 2) UI structure

### Section header

```
Title: “Choose your exam”
Subtitle: “Pick a category to explore notes, practice sets, and tests.”
```

### Controls row (keep minimal)

```
Search input : “Search exam (SSC, Banking...)”
Filter chips (optional v1): All, Popular, New, Free
```

### Exam cards grid

Each card shows:

```
Exam Name (primary)
Short description (1 line max)
Badges (optional): Popular, New
Meta row: Tests • Practice • Notes (counts optional, use placeholders if not
available)
CTA: View Exam
```

**Card click** should open details page route:

```
/exams/:slug (recommended)
```

### Empty state

If search has no results:

```
“No exams found. Try a different keyword.”
```

## 3) Data model (CMS-friendly)

Even if hardcoded now, structure it like CMS:

**Exam**

```
id
name
slug
shortDescription
isActive
tags: string[] (popular/new/free)
stats (optional)
testsCount
practiceCount
```

```
notesCount
```

## 4) Behavior

### Search

```
Debounced input (200–300ms)
Matches:
name
tags (optional)
Case-insensitive
```

### Filter chip

```
All = no filter
Popular = tag contains popular
New = tag contains new
Free = tag contains free
```

### CTA logic

```
If exam is active: go to /exams/:slug
If not active: show disabled CTA (“Coming soon”)
```

## 5) Implementation tasks (Exams module)

Copy to your tracker 👇

### ExamsSection v

```
Create ExamsSection component
Add id="exams" for smooth scroll targeting
Implement:
section header
search input (debounced)
filter chips (All/Popular/New/Free)
grid layout (responsive)
empty state
```

### ExamCard component

```
Build ExamCard UI with:
```

```
title + 1-line description
tags badges
stats row (optional)
CTA button
Entire card clickable (but keep CTA button too)
```

### Routing

```
Add route: /exams (optional listing page)
Add route: /exams/:slug (details page placeholder for now)
Implement navigation from card → details route
```

### Data source strategy

```
v1: use local examCatalog.ts mock list
v2: replace with API call from backend CMS/exams endpoint
Keep the UI unchanged by mapping API response → Exam model
```

### Responsiveness

```
Mobile: 1 column
Tablet: 2 columns
Desktop: 3–4 columns
```

### QA checklist

```
Search works
Filters work
Scroll from Hero “Explore Exams” lands correctly
Empty state renders correctly
```

## 6) What comes next

After Exams section, we should do the **USP / Why Choose Us section** , because it supports
the conversion flow and makes users trust the platform.

Say **“next”** and I’ll give you the **USP section spec + tasks** (executive style, minimal, high
impact).

```
next
```

Next up: **USP / “Why choose us” section** (high-impact, executive, minimal).

## 1) USP Section goal

Right after users see exams, they need confidence that your platform is:

```
serious
structured
better than random YouTube / PDFs
worth signing up for
```

So this section should be **5 cards max** , very clean.

## 2) UI structure

### Section header

```
Title: “Why Dhurandhar?” (or your brand name)
Subtitle: “Designed for focused preparation—content, practice, and progress in one
place.”
```

### USP cards (3–5)

**Recommended 5-card set (best for your app):**

**1. Structured Notes**
“Well-organized notes mapped to topics and difficulty.”
**2. Smart Practice & Tests**
“Practice sets + mock tests with instant solutions.”
**3. Performance Analytics**
“Track accuracy, speed, weak topics, and improvements.”
**4. Secure Content Access**
“Controlled viewing, watermarking, and protected materials.”
**5. Mobile-First Experience**
“Optimized for phone browsers and student workflows.”

Card layout:

```
Icon (simple)
Title (1 line)
Description (max 2 lines)
```

### Optional “Proof strip” (only if true)

```
“Instant access” • “Works on mobile” • “Fast checkout”
```

## 3) CMS-ready data model

Even if static now, define it like CMS:

**USPItem**

```
key
title
description
icon (string identifier)
```

## 4) Implementation tasks (USP module)

### USPSection v

```
Create USPSection component
Add section header (title + subtitle)
Render 3–5 USP cards from uspCatalog.ts
Ensure theme-aware surfaces:
light: soft cards
dark: elevated cards with subtle borders
```

### USPCard component

```
Icon + title + description
Hover state:
slight elevation / border highlight (subtle)
Must remain readable in dark mode
```

### Accessibility + UX

```
Titles as semantic headings (H2 for section, H3 for cards)
Don’t rely on color only for differentiation
```

```
Make spacing generous (executive feel)
```

### QA checklist

```
Looks clean on mobile (stacked cards)
Looks balanced on desktop (3 columns; if 5 cards, last row centered)
No text overflow; clamp descriptions
```

## 5) What comes next

After USP, the best conversion flow is:

✅ **How it works (3 steps)** → reduces confusion
✅ **Pricing** → primes users for paid subscription
✅ **Trust/Testimonial** (optional)
✅ Final CTA + Footer

Say **“next”** and I’ll give the **How It Works section spec + tasks** (very quick to implement,
big UX payoff).

```
next
```

Next: **How It Works section (3 steps)** — simple, clean, and it reduces “what do I do after
signup?” confusion.

## 1) Goal

Explain the journey in **10 seconds** :

```
Register
Choose exam
Practice + analyze
```

No fluff.

## 2) UI structure

### Section header

```
Title: “How it works”
Subtitle: “Start in minutes. Improve with daily practice.”
```

### 3-step layout

**Desktop:** horizontal 3 cards with connecting line/dots
**Mobile:** vertical stacked steps

Each step includes:

```
Step number badge (1, 2, 3)
Title
1–2 line description
```

Recommended steps:

**1. Create your account**
“Register in seconds and access free content instantly.”
**2. Select your exam**
“Pick an exam and start with notes, practice sets, and tests.”
**3. Practice & track progress**
“Get analytics on accuracy, speed, and weak topics.”

### Optional micro-CTA under steps

```
Button: Start Learning → /auth/register?from=landing
```

## 3) Data model (CMS-ready)

**HowItWorksStep**

```
stepNumber
title
description
```

Keep it in howItWorksCatalog.ts now, replace from CMS later.

## 4) Implementation tasks

### HowItWorksSection v

```
Create HowItWorksSection component
```

```
Add header (title/subtitle)
Render steps from config array
Implement:
Desktop horizontal layout with spacing and subtle connectors
Mobile stacked layout
Add optional CTA button below steps
```

### StepCard component

```
Step badge (circle/pill)
Title + short description (clamped)
Theme-aware border/surface
```

### Smooth flow integration

```
Place this section after USP and before Pricing
Ensure it matches page rhythm (padding top/bottom consistent)
```

### QA checklist

```
Steps readable on small screens
Connectors don’t break responsive layout
CTA button is visible but not competing with Hero CTA
```

## 5) Next

Now we should do the most conversion-critical part:

➡ **Pricing / Plans section** (even if payments aren’t live yet)

Say **“next”** and I’ll give you the Pricing section spec + tasks (mobile-first, PhonePe-friendly
flow, policies-ready).

```
next
```

Alright — **Pricing / Plans section**.
This is where visitors mentally switch from _“looks good”_ → _“I might pay for this”_. Even if

payments aren’t live yet, this section is **non-negotiable**.

## 1) Pricing section goal

```
Set expectation (this is a paid, serious platform)
Reduce fear (“free option exists”)
Make upgrade path obvious
```

Think **transparent, calm, confident** — not salesy.

## 2) Pricing structure (recommended for v1)

### Section header

```
Title: “Simple, transparent pricing”
Subtitle: “Start free. Upgrade when you’re ready.”
```

### Pricing cards (3 plans)

1️⃣ **Free**
For onboarding & trust-building

```
Price: ₹
Includes:
Limited notes
Limited practice sets
Basic progress view
CTA:
Start Free
CTA behavior:
/auth/register?plan=free
```

2️⃣ **Standard (Most Popular)**
Main revenue driver

```
Price: ₹XXX / month (use placeholder for now)
Includes:
Full notes access
```

```
Practice sets
Sectional tests
Performance analytics
Badge: Most Popular
CTA:
Upgrade to Standard
CTA behavior:
If not logged in → register
If logged in → /student/payments
```

3️⃣ **Premium**
For serious aspirants / institutes

```
Price: ₹XXX / month
Includes:
Everything in Standard
Full-length mocks
Advanced analytics
Priority updates
CTA:
Go Premium
```

## 3) Important pricing UX rules

```
Highlight Standard visually (scale / border / badge)
Do not overwhelm with features
Avoid yearly pricing for now (add later)
Always show Free first (psychological safety)
```

## 4) Plan comparison (optional, v2)

For v1:

```
Avoid big comparison tables
Keep content scannable
```

You can add a “Compare plans” link later.

## 5) CTA logic (very important)

### CTA decision matrix

**User state CTA click result**

Not logged in Redirect to /auth/register?plan=x

Logged in + free Go to /student/payments

Logged in + paid Go to /student

This logic should be centralized (helper function).

## 6) CMS / backend-ready data model

**Plan**

```
id
name
price
currency
interval (monthly)
features[]
isPopular
isActive
```

Even if static now, keep this shape.

## 7) Implementation tasks (Pricing module)

### PricingSection v1

```
Create PricingSection component
Add header (title + subtitle)
Render plans from pricingCatalog.ts
Highlight “Most Popular” plan
```

### PricingCard component

```
Plan name
Price + interval
```

```
Feature list (icons optional)
CTA button
Popular badge support
```

### CTA routing helpers

```
handlePlanSelect(planId)
Auth-aware redirection logic
Placeholder for future payment integration
```

### Responsiveness

```
Mobile: stacked cards
Desktop: 3-column grid
Popular card slightly elevated
```

### QA checklist

```
Prices readable in light & dark
CTAs clearly differentiated
No misleading claims
```

## 8) What comes next (final stretch)

After pricing, only **trust + closure** remain:

1️⃣ **Trust / credibility section** (lightweight)
2️⃣ **Final CTA strip**
3️⃣ **Footer (legal + policies)**

Say **“next”** and I’ll give you **Trust section + Final CTA** together (quick win, completes
landing page flow).

```
next
```

Perfect — we’ll **close the landing page** now with **Trust + Final CTA + Footer**.
After this, your landing page flow is structurally complete and production-ready.

# 1️⃣ Trust / Credibility Section

### Goal

Reduce the _last bit of doubt_ before signup or payment.

This is **not marketing fluff**. Keep it restrained and honest.

## Trust Section – v1 (recommended)

### Section header

```
Title: “Built for serious preparation”
Subtitle: “Focused features, secure access, and a clean learning experience.”
```

### Trust blocks (pick 2–3 max)

**Option A: Platform strengths (safe, no fake claims)**
Secure content delivery
Mobile-first performance
Clean analytics & progress tracking

**Option B: Process trust**
Transparent pricing
No forced upgrades
Cancel anytime

**Option C (only if true later)**
“Used by institutes”
“Thousands of students”
➡ **Skip numbers for now** unless verified.

### Layout

```
Horizontal cards (desktop)
Stacked cards (mobile)
Very light icons
Neutral colors
```

### Implementation tasks

```
Create TrustSection
Render 2–3 trust cards from config
No animations beyond subtle fade/slide
Place after Pricing , before Final CTA
```

# 2️⃣ Final CTA Section (Conversion closer)

This is the **last nudge**.

### Copy

**Headline:**

**Subtext:**
“Create a free account and explore the platform.”

### CTA

```
Primary button: Create Free Account
/auth/register?from=landing-final
Secondary (optional, text link):
“Explore exams” → #exams
```

### Design rules

```
Full-width section
Slight contrast background (theme-aware)
Center-aligned
One CTA only (keep focus)
```

### Implementation tasks

```
Create FinalCTASection
Add strong spacing top/bottom
Reuse same CTA logic as Hero
Ensure keyboard & focus accessibility
```

```
“Start your preparation today.”
```

# 3️⃣ Footer (Mandatory for scale & payments)

### Footer sections

**Column 1 – Brand**
Logo
Short line:

**Column 2 – Platform**
Exams
Pricing
Login
Register

**Column 3 – Legal (VERY IMPORTANT)**
Privacy Policy
Terms & Conditions
Refund Policy
Contact Us

_(Even if pages are placeholders now, routes must exist.)_

### Footer rules

```
No clutter
Small text
Clear contrast
Same footer across:
Landing
Student app
Admin app (optional)
```

### Implementation tasks

```
Create Footer component
Add routes for legal pages (static markdown or placeholders)
Ensure footer is responsive and accessible
```

```
“A focused platform for exam preparation.”
```

# 4️⃣ Landing Page Final Order (Checklist)

Your landing page should now be:

**1.** Header / Navigation
**2.** Hero
**3.** Exams
**4.** USP (Why choose us)
**5.** How it works
**6.** Pricing
**7.** Trust
**8.** Final CTA
**9.** Footer

✅ Conversion-ready
✅ CMS-ready
✅ Payment-ready
✅ Executive look

# 5️⃣ What I recommend next (important decision)

You now have **two smart next moves** :

### Option A (recommended)

➡ **Exams Details Page (** /exams/:slug **)**

```
Connects landing → actual content
Big impact on user engagement
```

### Option B

➡ **Auth pages UX polish**

```
Register / Login flow
Mobile-first friction removal
```

Tell me **A or B** , and we’ll continue cleanly without rework.

```
Need to go for both A and B
```

Got it — we’ll do **A (Exam Details page)** and **B (Auth UX polish)** in a way that they _fit
together_ (no rework):
**Landing → Exam Details → Register/Login → Back to where user came from**.

Below is the **combined step-by-step backlog**.

# A) Exam Details Page /exams/:slug

## A1) Page goals

```
Show exam overview clearly
Show what user gets (Notes / Practice / Tests)
Push conversion: Start Free / Continue
Be CMS-ready from day 1
```

## A2) Page sections (order)

**1. Breadcrumb + Title**
Home / Exams / {Exam}
**2. Exam Hero**
Exam name, 1-line description
CTA row:
Primary: Start Preparation (auth-aware)
Secondary: View Pricing (scroll / route)
**3. Content Tabs**
Tabs: Overview, Notes, Practice, Tests
v1: Overview implemented, others show “Login required” or “Coming soon”
based on your backend readiness
**4. Syllabus / Topics (Overview tab)**
Grouped list (static now, CMS later)
**5. What you get**
3 cards: Notes, Practice, Tests (+ counts if available)
**6. FAQ mini**

```
3 questions max (static)
```

## A3) Data model (CMS-ready)

**ExamDetails**

```
id, name, slug, description
tags[]
modulesAvailable: { notes, practice, tests }
counts?: { notes, practice, tests }
topics?: TopicGroup[]
faqs?: {q,a}[]
```

## A4) Routing + state behavior

```
Add route: /exams/:slug
Fetch by slug
Loading skeleton (don’t show blank page)
404 state (“Exam not found” + back button)
```

## A5) Auth-aware CTA (very important)

Primary CTA logic:

```
Not logged in → /auth/register?next=/exams/:slug
Logged in → /student/exams/:slug (or open module tabs)
```

## A6) Tasks (copy into tracker)

```
Create ExamDetailsPage
Add skeleton loader + error/404 UI
Implement ExamHero section + CTA logic
Implement Tabs component (Overview, Notes, Practice, Tests)
Overview tab: topics + what-you-get + FAQ
Add next redirect support (shared with Auth flow below)
Add mock examDetailsCatalog.ts fallback until API wired
Wire API later with mapping to ExamDetails model
```

# B) Auth Pages UX Polish (Login/Register)

## B1) Goal

Make auth **fast, mobile-first, and frictionless** , with correct redirects back to intent.

## B2) UX must-haves

```
Minimal form fields
Large touch targets
Clear errors
Loading state on submit
“Continue with phone/email” strategy (depending on your backend)
```

## B3) Routes

```
/auth/login
/auth/register
Both should accept query params:
next (where to redirect after auth)
from (for analytics/logging only)
plan (free/standard/premium)
```

Example:

```
/auth/register?next=/exams/banking&plan=free
```

## B4) Register page structure

```
Title: “Create your account”
Fields (v1 recommended):
Name
Phone (or Email)
Password
Checkbox: “I agree to Terms & Privacy”
CTA: Create account
Secondary:
“Already have an account? Login”
```

## B5) Login page structure

```
Title: “Welcome back”
Fields:
Phone/Email
Password
CTA: Login
Links:
“Forgot password” (placeholder route ok)
```

```
“Create account”
```

## B6) Redirect logic (shared utility)

After successful login/register:

**1.** If next exists → navigate to next
**2.** Else if plan exists → /student/payments?plan=...
**3.** Else → /student

**Also important:** preserve next when switching login ↔ register.

## B7) Tasks (copy into tracker)

```
Add getReturnUrl() helper to parse next
Implement AuthLayout (left minimal brand, right form; mobile stacked)
Register page with validation + submit loading + error states
Login page with validation + submit loading + error states
Preserve query params when toggling login/register
Post-auth redirect logic (priority: next > plan > default)
Add /auth/forgot-password placeholder (optional)
Add Terms/Privacy links + checkbox gating register submit
Add “show/hide password” toggle
```

# The best execution order (no rework)

**1. Implement** next **redirect utility + auth-aware CTA helper** (shared foundation)
**2.** Build **Exam Details page** with CTA that uses next
**3.** Polish **Register/Login** with the redirect behavior
**4.** Come back and wire “Notes/Practice/Tests” tabs to student app modules later

If you say **“go ahead”** , I’ll give you the **exact component/module breakdown** (folder
structure + route config + shared helpers) so you can start implementing immediately.

```
go ahead
```

Awesome — here’s the **exact component/module breakdown** you can implement
immediately, with **folder structure + routes + shared helpers** to make **Landing → Exam
Details → Auth → Return** seamless.

# 0) Recommended structure (frontend)

## If you’re using React (typical admin/student/landing split)

```
less
```

```
src/
app/
routes.tsx
providers/
layout/
features/
landing/
pages/LandingPage.tsx
sections/
Header.tsx
HeroSection.tsx
ExamsSection.tsx
USPSection.tsx
HowItWorksSection.tsx
PricingSection.tsx
TrustSection.tsx
FinalCTASection.tsx
Footer.tsx
data/
examCatalog.ts
uspCatalog.ts
pricingCatalog.ts
howItWorksCatalog.ts
exams/
pages/
ExamsListPage.tsx // optional
```

_(If you’re on Angular, same concept: feature modules + shared utilities. I can translate this
1:1 later.)_

```
ExamDetailsPage.tsx
components/
ExamHero.tsx
ExamTabs.tsx
TopicGroups.tsx
WhatYouGet.tsx
ExamFAQ.tsx
data/
examDetailsCatalog.ts
api/
examsApi.ts // later
types.ts
auth/
pages/
LoginPage.tsx
RegisterPage.tsx
ForgotPasswordPage.tsx // optional placeholder
components/
AuthLayout.tsx
AuthFormField.tsx
PasswordField.tsx
authRedirect.ts
validators.ts
student/
pages/
StudentHome.tsx
PaymentsPage.tsx
shared/
routing/
returnUrl.ts
query.ts
ui/
Button.tsx
Tabs.tsx
Card.tsx
Skeleton.tsx
auth/
useAuth.ts
authStore.ts Copy code
```

# 1) Routes you must add (minimum)

### Public

```
/ → LandingPage
/exams/:slug → ExamDetailsPage
```

### Auth

```
/auth/login
/auth/register
/auth/forgot-password (placeholder ok)
```

### Post-auth

```
/student (student home)
/student/payments (your payments flow)
```

# 2) Shared helpers (this prevents rework)

## 2.1 returnUrl.ts (source of truth)

Responsibilities:

```
Read query params: next, plan, from
Validate next is internal (security)
Decide redirect after auth
```

Rules:

**1.** If next exists → go there
**2.** Else if plan exists → /student/payments?plan=...
**3.** Else → /student

Also:

```
Helper to build auth URLs while preserving next
```

### You will use this in:

```
Hero CTA
ExamDetails CTA
Login/Register submit success
Login/Register toggle links
```

## 2.2 authRedirect.ts (auth-aware CTA)

A single function:

```
goToStart({ next, plan })
If not logged in → send to register with query
If logged in → send to next/plan/student
```

This keeps logic consistent everywhere.

# 3) Exam Details Page implementation (A)

## 3.1 ExamDetailsPage.tsx

Responsibilities:

```
Read slug from route
Load exam details (v1 from examDetailsCatalog.ts, later API)
Show:
Skeleton while loading
404 state if not found
Full page if found
```

### Must include:

```
<ExamHero />
<ExamTabs />
```

## 3.2 Components (clean, executive)

```
ExamHero.tsx
```

Props:

```
exam: ExamDetails
onPrimaryCTA()
onSecondaryCTA()
```

UI:

```
Breadcrumb
Title + description
Badges (Popular/New/Free)
CTA buttons:
```

```
Primary: Start Preparation
Secondary: View Pricing (scroll to pricing on landing OR route /#pricing)
```

CTA logic:

```
Primary uses shared authRedirect.goToStart({ next: currentUrl })
```

```
ExamTabs.tsx
```

Tabs:

```
Overview
Notes
Practice
Tests
```

Behavior:

```
Overview always visible
Notes/Practice/Tests:
If module not available → “Coming soon”
If available but not logged in → show “Login to access” with CTA button:
/auth/login?next=/exams/:slug
If logged in → either:
show placeholder now
later route into student module (recommended:
/student/exams/:slug/notes etc.)
```

```
TopicGroups.tsx
Grouped topics UI (accordion or grouped list)
Keep it short and readable
```

```
WhatYouGet.tsx
3 cards: Notes/Practice/Tests
Show counts if available else hide counts
```

```
ExamFAQ.tsx
3 Q&As max
```

## 3.3 Data (v1 mock, CMS-ready)

```
examDetailsCatalog.ts:
Map slug → ExamDetails
```

Later, replace with examsApi.getExamDetails(slug) and keep UI unchanged.

# 4) Auth UX polish implementation (B)

## 4.1 AuthLayout.tsx

```
Reusable layout for Login/Register
Left: brand panel (desktop only)
Right: form panel
Mobile: stacked
```

## 4.2 RegisterPage.tsx

Query params to support:

```
next
plan
from
```

Must have:

```
Name
Phone or Email
Password
Terms checkbox (required)
Submit loading state
Inline error messages
```

On success:

```
call resolvePostAuthRedirect() from returnUrl.ts
navigate accordingly
```

Also:

```
“Already have an account?” link must preserve next/plan
```

Example:
/auth/login?next=...&plan=...

## 4.3 LoginPage.tsx

Similar:

```
Identifier (phone/email)
Password
Submit loading
Errors
```

On success:

```
same redirect resolver
```

Also add:

```
Forgot password link (can be placeholder)
```

## 4.4 Validation rules (v1)

```
Phone/email required
Password min length (e.g., 6 or 8)
Name required for register
Terms checkbox required
```

# 5) Glue: landing + exams + auth must share intent

## 5.1 Landing “Get Started Free” CTA

```
Not logged in → /auth/register?from=landing&plan=free
Logged in → /student
```

## 5.2 Landing “Explore Exams”

```
#exams scroll
```

## 5.3 Exam details “Start Preparation”

```
Not logged in → /auth/register?next=/exams/:slug
Logged in → open student path OR allow tab content
```

# 6) Implementation order (do it exactly like this)

**1. Shared utilities**

```
returnUrl.ts
authRedirect.ts
```

**2. Auth Layout + Login/Register pages**
implement redirects fully
**3. ExamDetailsPage**
use mock examDetailsCatalog.ts
implement tabs + auth gating
**4.** Hook landing/exams CTAs to shared redirect helpers

This avoids any rework and gives you an end-to-end flow quickly.

If you want, I can now provide **the exact task list formatted as “Codex-friendly”** (short
atomic tasks, each with acceptance criteria) for:

```
features/exams
features/auth
shared/routing helpers
```

```
yes
```

Below is a **Codex-friendly, atomic task list** for **shared/routing** , **auth** , and **exams**.
Each task has **acceptance criteria** so you can track progress cleanly.

# 0) Shared / Routing Helpers (must do first)

### SH-01 — Create shared/routing/query.ts

**Scope**

```
Utility to read query params safely from current URL (string → string | null).
Acceptance
Can read next, plan, from from URL
Handles missing params (returns null)
```

```
Handles encoded values (decode safely)
```

### SH-02 — Create shared/routing/returnUrl.ts

**Scope**

```
Validate internal return URLs and resolve post-auth redirect.
Rules
Only allow internal paths starting with /
Disallow http://, https://, //, javascript:
Acceptance
getSafeNext() returns safe internal path or null
resolvePostAuthRedirect() returns:
```

**1.** next if safe
**2.** /student/payments?plan=... if plan exists
**3.** /student
Includes helper buildAuthUrl(base, params) preserving next/plan/from

### SH-03 — Create shared/auth/authRedirect.ts

**Scope**

```
Centralized CTA navigation logic (auth-aware).
Acceptance
Exposes goToStart({ next?, plan?, from? })
If !isAuthenticated → routes to /auth/register with proper query
If authenticated → routes to resolvePostAuthRedirect() (or next directly)
```

# 1) Auth Module (Login/Register UX polish)

### AU-01 — Create features/auth/components/AuthLayout.tsx

**Scope**

```
Shared layout for login/register pages.
Acceptance
Desktop: two-column layout (brand panel + form)
Mobile: stacked layout
Theme-aware surfaces (light/dark)
```

### AU-02 — Create features/auth/components/AuthFormField.tsx

**Scope**

```
Consistent input field wrapper with label + error text.
Acceptance
Shows label, input, helper/error
Works in both themes
Error state visibly distinct (but not harsh)
```

### AU-03 — Create features/auth/components/PasswordField.tsx

**Scope**

```
Password input with show/hide toggle.
Acceptance
Toggle shows/hides password
Accessible (button has aria-label)
Doesn’t break form layout on mobile
```

### AU-04 — Create features/auth/validators.ts

**Scope**

```
Lightweight validators for login/register.
Acceptance
validateRegister(payload) returns field-level errors
validateLogin(payload) returns field-level errors
Enforces required fields + min password length
Register enforces terms checkbox
```

### AU-05 — Implement features/auth/pages/RegisterPage.tsx

**Scope**

```
Register UI + submit flow + redirect behavior.
Acceptance
Reads query params: next, plan, from
On submit:
shows loading state
handles errors (inline)
On success:
redirects using resolvePostAuthRedirect() rules
“Already have an account? Login” link preserves query params
```

### AU-06 — Implement features/auth/pages/LoginPage.tsx

**Scope**

```
Login UI + submit flow + redirect behavior.
Acceptance
Reads query params: next, plan, from
On submit:
shows loading state
handles errors (inline)
On success:
redirects using resolver rules
“Create account” link preserves query params
Includes “Forgot password” link (route can be placeholder)
```

### AU-07 — Add features/auth/pages/ForgotPasswordPage.tsx (placeholder)

**Scope**

```
Minimal “Coming soon” page with a back-to-login button.
Acceptance
Route works
UI matches theme + layout
```

### AU-08 — Hook auth pages to auth store ( useAuth )

**Scope**

```
Use existing auth store to set authenticated state after login/register.
Acceptance
After success, isAuthenticated becomes true
Redirect happens after state set
No infinite loops
```

# 2) Exams Module (Exam Details Page)

### EX-01 — Create features/exams/types.ts

**Scope**

```
Define ExamDetails + supporting types.
Acceptance
Has fields: id,name,slug,description,tags,modulesAvailable,counts,topics,faqs
Types compile with no warnings
```

### EX-02 — Create features/exams/data/examDetailsCatalog.ts

**Scope**

```
Mock catalog keyed by slug for v1.
Acceptance
At least 3 example exams
Each exam has:
name/slug/description
modulesAvailable flags
2 topic groups
3 FAQ entries
```

### EX-03 — Create features/exams/components/ExamHero.tsx

**Scope**

```
Title + breadcrumb + CTAs.
Acceptance
Shows breadcrumb (Home / Exams / ExamName)
Shows title + short description + tag badges
Primary CTA: “Start Preparation”
Secondary CTA: “View Pricing” (route /#pricing or scroll handler)
Primary CTA uses shared auth redirect with next=/exams/:slug
```

### EX-04 — Create features/exams/components/TopicGroups.tsx

**Scope**

```
Render topic groups neatly.
Acceptance
Renders grouped topics
Supports long lists with collapsible/accordion OR clamped display
Mobile-friendly spacing
```

### EX-05 — Create features/exams/components/WhatYouGet.tsx

**Scope**

```
3 feature cards (Notes/Practice/Tests).
Acceptance
Shows available modules based on modulesAvailable
Shows counts only if provided
“Coming soon” state if module not available
```

### EX-06 — Create features/exams/components/ExamFAQ.tsx

**Scope**

```
Minimal FAQ list (accordion or stacked).
Acceptance
Renders 3 FAQs cleanly
Accessible expand/collapse if accordion
```

### EX-07 — Create features/exams/components/ExamTabs.tsx

**Scope**

```
Tabs: Overview/Notes/Practice/Tests with gating rules.
Acceptance
Overview tab shows: TopicGroups + WhatYouGet + FAQ
Notes/Practice/Tests tab behavior:
If module unavailable → “Coming soon”
If available but not logged in → show “Login to access” + CTA → /auth/login?
next=/exams/:slug
If logged in → show placeholder content (v1) without crashing
```

### EX-08 — Implement features/exams/pages/ExamDetailsPage.tsx

**Scope**

```
The page container that loads by slug.
Acceptance
Reads slug param
Loads data from mock catalog (v1)
Shows skeleton while loading (even if mock; simulate minimal)
If not found → 404 state + “Back to exams/home”
Renders ExamHero + ExamTabs
```

### EX-09 — Optional: features/exams/pages/ExamsListPage.tsx

**Scope**

```
Dedicated page listing all exams (optional).
Acceptance
Shows same cards as landing
Search works
Card click → /exams/:slug
```

# 3) Route Wiring (App-level)

### RT-01 — Add public routes

**Scope**

```
Wire routes for landing + exam details.
Acceptance
/ → LandingPage
/exams/:slug → ExamDetailsPage
/#exams and /#pricing anchors work (or equivalent scroll)
```

### RT-02 — Add auth routes

**Scope**

```
Wire login/register/forgot.
Acceptance
/auth/login, /auth/register, /auth/forgot-password render correctly
```

### RT-03 — Add student routes (placeholders allowed)

**Scope**

```
Ensure redirects have valid targets.
Acceptance
/student exists (even placeholder)
/student/payments exists (even placeholder)
```

# 4) Integration Checklist (end-to-end)

### IN-01 — Landing → Exam Details → Register → Return

**Acceptance**

```
From landing, open an exam card → /exams/:slug
Click “Start Preparation” while logged out
Lands on /auth/register?next=/exams/:slug
After register success, returns to /exams/:slug
```

### IN-02 — Login toggle preserves intent

**Acceptance**

```
From register page, clicking “Login” keeps next/plan/from
From login page, clicking “Create account” keeps next/plan/from
```

### IN-03 — Plan selection redirects properly

**Acceptance**

```
Visiting /auth/register?plan=standard with no next
After register success → /student/payments?plan=standard
```

If you want the next deliverable, say **“generate page placeholders”** and I’ll provide **ready-
to-paste placeholder copy** for:

```
Privacy Policy
Terms & Conditions
Refund Policy
Contact Us
```

```
sure
```

Below are **ready-to-paste placeholder pages** (copy content) for:

```
Privacy Policy
Terms & Conditions
Refund Policy
Contact Us
```

They’re written to be **safe, professional, and payments-ready** , but still generic enough for
v1. Replace bracketed placeholders like **[Company Name]** later.

## 1) Privacy Policy (Placeholder)

### Privacy Policy

**Effective Date:** [DD Month YYYY]
**Last Updated:** [DD Month YYYY]

This Privacy Policy describes how **[Company Name]** (“we”, “us”, “our”) collects, uses,
shares, and protects information when you use **[Platform Name]** (the “Service”), including
our website and apps.

### 1. Information We Collect

We may collect the following information:

**A. Account Information**

```
Name, phone number, email address
Password (stored in encrypted/hashed form)
```

**B. Usage Information**

```
Pages/screens visited, features used, click activity
Device information (browser type, device model, operating system), approximate
location (city/state)
```

**C. Payment Information**

```
Payment status, transaction identifiers, subscription details
```

**D. Content & Performance Data**

```
Tests attempted, answers selected, scores, progress analytics
Notes viewed and learning activity
```

### 2. How We Use Your Information

We use information to:

```
Create and manage your account
Provide access to content, tests, and subscriptions
Improve learning experience and platform performance
Provide analytics and progress tracking
Prevent fraud, misuse, and unauthorized access
Send service-related updates (e.g., subscription, important announcements)
```

### 3. Cookies and Tracking

We may use cookies/local storage to:

```
Keep you signed in
Store preferences (e.g., theme, language)
Understand usage patterns and improve the Service
```

You can control cookies via browser settings. Some features may not work without them.

### 4. Sharing of Information

```
Note: We do not store full card/bank details. Payments are processed by trusted
payment partners.
```

We may share information:

```
With service providers (hosting, analytics, payment processing) strictly to operate the
Service
When required by law or legal process
To protect rights, safety, or prevent misuse and fraud
```

We do not sell your personal information.

### 5. Data Security

We use reasonable security practices such as encryption, access controls, and monitoring
to protect your data. However, no system is 100% secure.

### 6. Data Retention

We retain data as long as needed to provide the Service, meet legal obligations, and
resolve disputes. You may request account deletion where applicable.

### 7. Your Rights

Depending on your jurisdiction, you may have rights to:

```
Access or correct your data
Request deletion of your data/account
Withdraw consent for certain communications
```

To request changes, contact us at: **[Support Email]**

### 8. Children’s Privacy

The Service is intended for users who can legally use online services in their region. If you
believe a minor has provided personal information, contact us for removal.

### 9. Changes to This Policy

We may update this policy from time to time. Updated versions will be posted with a
revised “Last Updated” date.

### 10. Contact Us

**[Company Name]**
Email: **[Support Email]**
Phone: **[Support Phone]**
Address: **[Business Address]**

## 2) Terms & Conditions (Placeholder)

### Terms & Conditions

**Effective Date:** [DD Month YYYY]
**Last Updated:** [DD Month YYYY]

Welcome to **[Platform Name]** operated by **[Company Name]**. By accessing or using our
Service, you agree to these Terms.

### 1. Eligibility and Account

```
You must provide accurate registration details.
You are responsible for maintaining the confidentiality of your account credentials.
You are responsible for all activity under your account.
```

### 2. Service Description

The Service provides educational content such as notes, practice sets, tests, and analytics.
Features may vary by plan and may change over time.

### 3. Subscriptions and Payments

```
Paid features require an active subscription or purchase.
Pricing, plan benefits, and validity will be displayed before checkout.
Taxes and payment gateway fees (if applicable) may apply.
```

### 4. Content Access and Usage Restrictions

All content is owned by **[Company Name]** or licensed to us. You agree that you will not:

```
Copy, reproduce, redistribute, sell, or commercially exploit content
Record screens, download restricted materials, or bypass security controls
Share accounts, resell access, or enable unauthorized access
```

Violation may lead to suspension or termination without refund.

### 5. User Conduct

You agree not to use the Service to:

```
Harass, abuse, or harm others
Upload malicious code or attempt unauthorized access
Misuse platform features or attempt fraud
```

### 6. Intellectual Property

All trademarks, logos, content, and platform design belong to **[Company Name]** (or
licensors). Unauthorized use is prohibited.

### 7. Availability and Changes

We aim to keep the Service available but do not guarantee uninterrupted access. We may
update, modify, or discontinue features.

### 8. Termination

We may suspend or terminate access if:

```
You violate these Terms
We suspect fraud or misuse
Required by law
```

You may stop using the Service anytime.

### 9. Disclaimers

The Service is provided “as is”. We do not guarantee exam results or specific outcomes.
Educational performance depends on individual effort and conditions.

### 10. Limitation of Liability

To the extent permitted by law, **[Company Name]** will not be liable for indirect or
consequential damages. Our total liability will not exceed the amount paid by you in the
last [X] months (if applicable).

### 11. Governing Law

These Terms are governed by the laws of **India** (or your applicable jurisdiction). Courts at
**[City/State]** shall have jurisdiction.

### 12. Contact

Email: **[Support Email]**
Phone: **[Support Phone]**
Address: **[Business Address]**

## 3) Refund Policy (Placeholder)

### Refund Policy

**Effective Date:** [DD Month YYYY]
**Last Updated:** [DD Month YYYY]

This Refund Policy describes refund and cancellation terms for purchases made on
**[Platform Name]**.

### 1. Subscription Plans

```
Subscriptions provide access to premium content and features for the period
purchased.
Subscription benefits are available immediately after successful payment.
```

### 2. Refund Eligibility

Refunds may be considered only if:

```
Payment was deducted but subscription was not activated, and support confirms the
issue
Duplicate payment occurred for the same purchase
A technical issue from our side prevents access and is not resolved within a
reasonable time
```

### 3. Non-Refundable Cases

Refunds will generally not be provided for:

```
Change of mind after purchase
Partial use of subscription period
Account sharing or violation of Terms
Issues caused by user device/network conditions outside our control
```

### 4. Cancellation

```
You may cancel renewal (if auto-renewal exists) from your account settings.
Cancellation stops future billing; current period access remains until expiry unless
stated otherwise.
```

### 5. Refund Processing Time

If approved:

```
Refunds are processed to the original payment method.
Timeline depends on payment partner/bank (typically 5–10 business days ).
```

### 6. How to Request a Refund

### ChatGPT 5.2

Email: **[Support Email]**
Include:

```
Registered phone/email
Transaction ID / order reference
Reason for request
Screenshot (if applicable)
```

## 4) Contact Us (Placeholder)

### Contact Us

We’re here to help with account, subscription, content access, and technical issues.

**Support Email:** [Support Email]
**Support Phone:** [Support Phone]
**Business Hours:** [e.g., Mon–Sat, 10:00 AM – 7:00 PM IST]

**Office Address:**
[Company Name]
[Full Address Line 1]
[City, State, PIN]
India

For faster support, please share:

```
Your registered phone/email
Screenshot of the issue (if any)
Order/transaction ID (for payment issues)
```

If you want, I can also provide **short versions** for footer modals (1-page compact) and a
**policy routes checklist** (so your router + footer links are consistent).

```
okay
```

Perfect 👍
You’re all set on **landing → exams → auth → policies**.
