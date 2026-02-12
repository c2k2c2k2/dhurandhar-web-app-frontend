# Analytics + Events

## ST8.1 Track Events
- [x] `note_open`, `note_close`
- [x] `practice_start`, `practice_answer`, `practice_finish`
- [x] `test_start`, `test_submit`
- [x] `payment_initiated`, `payment_success`, `payment_fail`

## ST8.2 Events API
- [x] `POST /student/events` with payload + metadata.

## Definition of Done
- Events fire silently without blocking UI.
- Failures handled gracefully.
