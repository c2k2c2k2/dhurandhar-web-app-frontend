# Student Home (CMS-driven)

## ST1.1 Home API
- [x] `GET /student/home` returns banners, announcements, sections.
- [x] Wire `api.ts` + `useStudentHome()` hook.

## ST1.2 Home UI
- [x] Banner carousel (horizontal scroll).
- [x] Pinned announcements strip.
- [x] Sections render by type:
  - `NOTES` -> notes cards
  - `TESTS` -> upcoming tests
  - `PRACTICE` -> drills
  - `CUSTOM` -> configJson-based render

## ST1.3 Auth Bootstrap Data
- [x] On app load, read `/me` and store:
  - userId
  - entitlements
  - activeSubscription
- [x] Expose helpers: `canAccessNote`, `canAccessPractice`, `canAccessTests`.

## Definition of Done
- Home renders without hardcoded content when API is available.
- CMS changes reflect in student home.
- Loading + empty states look intentional.
