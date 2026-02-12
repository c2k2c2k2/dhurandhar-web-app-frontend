# Notes Module (Anti-piracy Core)

## SN0 Module Scaffolding
- [x] `src/modules/student-notes` with api/types/hooks/components/viewer.

## SN1 API Contract
- [x] `listNotes`, `getNote`, `createViewSession`, `getWatermark`, `streamPdf`.

## SN2 Entitlement Gating
- [x] `canAccessNote(note)` helper.
- [x] Paywall card with CTA to `/student/payments`.

## SN3 Notes Browsing UX
- [x] Filters bar: subject, topic, search.
- [x] Tree view for topic hierarchy.
- [x] Notes list + card grid.

## SN4 Secure Note Viewer
- [x] PDF.js viewer with range support.
- [x] Watermark overlay (user + masked contact + session).
- [x] Viewer hardening (disable download, best-effort).

## SN5 Heartbeat + Analytics
- [x] Heartbeat every 10-15s.
- [x] Close event on unmount.
- [x] Optional progress reporting.

## Definition of Done
- Premium gating works.
- PDF renders with watermark overlay.
- Heartbeat + close events fire reliably.
