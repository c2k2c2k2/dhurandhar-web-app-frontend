# Payments + Subscription (PhonePe Redirect)

## PAY-S0 Module Scaffolding
- [x] `src/modules/student-payments` with api/types/hooks/components/utils.

## PAY-S1 API Contract
- [x] `listPlans`, `createOrder`, `getPaymentStatus`, `refreshMe`.

## PAY-S2 Routes
- [x] `/student/payments` plans page.
- [x] `/student/payments/return` return + polling.

## PAY-S3 UI
- [x] Plans grid + plan card.
- [x] Checkout summary + redirect.

## PAY-S4 Return Flow
- [x] Poll until success/fail.
- [x] Refresh `/me` on success.
- [x] Redirect back to locked content.

## Definition of Done
- Mobile-safe redirect.
- Return page resolves reliably.
- Subscription refresh updates entitlements.
