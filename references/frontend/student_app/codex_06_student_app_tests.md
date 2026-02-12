# Tests Module (Timed)

## STT1 API Contract
- [x] `listTests`, `getTest`, `startAttempt`, `saveAnswer`, `submitAttempt`.

## STT2 Types + Schemas
- [x] `AttemptState`, `AttemptResult`, `SaveAnswerSchema`.

## STT3 Routes & Pages
- [x] `/student/tests` list with tabs.
- [x] `/student/tests/:id` details (optional).
- [x] `/student/tests/attempt/:id` attempt UI.

## STT4 Timer Strategy
- [x] Server-synced timer util.
- [x] Auto-submit on time end.

## STT5 Attempt UI
- [x] Question palette + actions.
- [x] Autosave answers (debounced).
- [x] Persist minimal state locally.

## Definition of Done
- Timer cannot be cheated by client clock.
- Autosave survives refresh.
- Submit shows results + analysis.
