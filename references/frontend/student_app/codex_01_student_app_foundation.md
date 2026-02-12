# Student App Foundation

## ST0.1 Routing + Layout
- [x] Create route group `(student)` with `/student` root + full route map.
- [x] Add `layout.tsx` that wraps student pages with auth + layout shell.
- [x] Create `/student/forbidden` page for unauthorized access.

## ST0.2 Student Shell
- [x] Mobile-first layout with topbar + bottom nav.
- [x] Desktop: left rail + content area.
- [x] Header includes announcement icon + quick actions.
- [x] Global page padding, safe bottom spacing for nav.

## ST0.3 Auth + Entitlement Bootstrap
- [x] Add `RequireStudent` guard (user.type === `STUDENT`).
- [x] Unauthenticated or wrong type -> `/student/forbidden`.
- [x] Expose hooks placeholders for `useStudentAuth`, `useEntitlements`.

## ST0.4 Shared UI
- [x] Student placeholder/skeleton component for unfinished routes.
- [x] Toasts + global loading states.

## Definition of Done
- `/student` loads with new shell.
- Student routes mount without runtime errors.
- Auth guard blocks non-students.
