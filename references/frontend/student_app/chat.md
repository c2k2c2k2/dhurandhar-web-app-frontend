#### start student app

#### Perfect. Now we move to the Student App — this is the heart of the product and where all

#### your backend + admin work starts paying off.

#### I’ll keep the same Codex-friendly, minute-level task format , and we’ll build it feature-first ,

#### not page-first, so nothing is wasted.

# STUDENT APP — v1 PLAN (Notes · Practice · Tests ·

# Payments)

## Guiding principles (important)

#### Mobile-first (90% usage)

#### Server-driven UI (home, sections, banners, announcements)


#### Strict entitlement gating

#### Anti-piracy by design (watermark + controlled viewer)

#### Analytics baked into every action

# ST0) Student App Foundation

## ST0.1 App routing & layout

## ST0.2 Student shell

```
txt
```
```
Routes under /(student):
```
```
/student
/layout.tsx // auth + entitlement bootstrap
/page.tsx // home
/subjects
/subjects/[id]
/topics/[id]
/notes
/notes/[id]
/practice
/practice/start
/practice/session/[id]
/tests
/tests/[id]
/tests/attempt/[id]
/payments
/payments/return
/profile
/forbidden Copy code
```
```
txt
```
```
Create StudentShell:
```
- Bottom navigation (Home, Notes, Practice, Tests, Profile)
- Header with announcement icon
- Global loaders + toasts
Mobile-first, desktop responsive. Copy code


## ST0.3 Auth + entitlement bootstrap

#### DoD

#### Student app loads only if userType=STUDENT

#### Unauthorized → /student/forbidden

# ST1) Student Home (CMS-driven)

## ST1.1 Home API

## ST1.2 Home UI

```
txt
```
```
On app load:
```
- call /me
- store:
userId
entitlements[]
activeSubscription
- expose hooks:
useStudentAuth()
useEntitlements()
canAccessNote(noteId)
canAccessPractice(subject/topic) Copy code

```
txt
```
```
GET /student/home
Returns:
```
- banners[]
- announcements[]
- sections[] // from Home Sections CMS Copy code

```
txt
```
```
Render in order:
```
- Banner carousel
- Pinned announcements
- Sections (switch by type):
NOTES → horizontal notes cards
TESTS → upcoming tests


#### DoD

#### Admin changes reflect instantly

#### No hardcoded content

# ST2) Subjects & Topics Navigation

## ST2.1 Subjects page

## ST2.2 Topics under subject

#### DoD

#### Student can browse syllabus easily

#### Topic hierarchy preserved

# ST3) Notes Module (Anti-Piracy Core)

## ST3.1 Notes list

```
TOPICS → quick links
CUSTOM → render based on configJson Copy code
```
```
txt
```
```
GET /student/subjects
Show cards:
```
- subject name
- progress indicator (optional v1)
Click → /student/subjects/:id Copy code

```
txt
```
```
GET /student/topics?subjectId=
Render:
```
- topic tree (same hierarchy as admin)
- each topic shows:
notes count
practice questions count Copy code

```
txt
```

## ST3.2 Notes entitlement gating

## ST3.3 Secure note viewer (VERY IMPORTANT)

## ST3.4 Watermark overlay strategy

```
GET /student/notes?subjectId=&topicId=
Filters:
```
- subject
- topic
- free/premium
    Copy code

```
txt
```
```
Before opening note:
```
- check entitlement OR subscription
If not allowed:
- show paywall CTA Copy code

```
txt
```
```
Flow:
1) POST /student/notes/:id/open
→ returns viewSessionId + watermarkPayload
2) Render PDF via PDF.js
3) Overlay watermark:
```
- userId
- masked phone/email
- timestamp
- sessionId
4) Disable:
- download
- right-click
- text selection (best effort)
5) Heartbeat:
POST /student/notes/:id/heartbeat every N seconds
6) On close/unmount:
POST /student/notes/:id/close Copy code

#### This works client-side , without modifying PDFs on server.

```
txt
```

#### DoD

#### PDF not downloadable

#### Watermark visible

#### Backend tracks sessions

# ST4) Practice Mode (Topic-wise, not time-based)

## ST4.1 Practice setup

## ST4.2 Start practice session

## ST4.3 Practice question UI

```
Canvas or absolutely-positioned div:
```
- repeated diagonal watermark
- random offset per session
- opacity ~0.
Changes per refresh → harder screenshots correlation Copy code

```
txt
```
```
/student/practice/start
Inputs:
```
- subject
- topic (optional)
- difficulty (optional)
- question count Copy code

```
txt
```
```
POST /student/practice/start
→ returns sessionId + questions[] Copy code
```
```
txt
```
```
Render:
```
- MCQ with text + image support
- no timer
- submit answer
POST /student/practice/:sessionId/answer
Track:


## ST4.4 Session end

#### DoD

#### Practice works independently of tests

#### Metadata stored for analytics

# ST5) Tests Module (Timed)

## ST5.1 Tests list

## ST5.2 Start test

## ST5.3 Test attempt UI

- correctness
- time spent
- attempts Copy code

```
txt
```
```
POST /student/practice/:sessionId/finish
Show:
```
- accuracy
- topic-wise stats
- weak areas Copy code

```
txt
```
```
GET /student/tests
Show:
```
- upcoming
- active
- past attempts Copy code

```
txt
```
```
POST /student/tests/:id/start
→ returns attemptId + questions + duration Copy code
```
```
txt
```

## ST5.4 Submit test

#### DoD

#### Test attempts resilient to refresh

#### Timer enforced server-side

# ST6) Payments & Subscription (Student side)

## ST6.1 Plans page

## ST6.2 PhonePe redirect flow

```
Features:
```
- timer
- question palette
- mark for review
- autosave answers
POST /student/tests/attempt/:id/answer

```
Copy code
```
```
txt
```
```
POST /student/tests/attempt/:id/submit
Show:
```
- score
- rank (if available)
- analysis Copy code

```
txt
```
```
GET /student/plans
Show:
```
- features
- price
- validity
CTA → Buy Copy code

```
txt
```
```
POST /student/payments/create
→ redirectUrl (PhonePe)
```

#### DoD

#### Works on mobile browsers

#### Handles refresh/back safely

# ST7) Profile & Progress

## ST7.1 Profile page

## ST7.2 Progress & analytics

# ST8) Global analytics hooks (silent but critical)

## ST8.1 Track events

```
After payment:
PhonePe → /student/payments/return?txnId=
Poll:
GET /student/payments/status?txnId=
Show success/failure UI Copy code
```
```
txt
```
```
GET /student/profile
Show:
```
- user info
- active subscription
- entitlements
- recent activity Copy code

```
txt
```
```
GET /student/progress
Show:
```
- subject-wise accuracy
- topic strengths/weaknesses
- practice vs test stats Copy code

```
txt
```

# Recommended build order (DO THIS)

#### 1. Student shell + auth bootstrap

#### 2. Home (CMS-driven)

#### 3. Subjects → Topics

#### 4. Notes viewer + watermark

#### 5. Practice mode

#### 6. Tests

#### 7. Payments

#### 8. Profile + progress

## What to do next

#### Reply with one :

#### “start student notes module in detail” (recommended next)

#### “start practice module”

#### “start tests module (student)”

#### “start payments flow (student)”

#### I’ll go just as deep as we did for admin — no hand-waving.

```
Track:
```
- note_open
- note_close
- practice_start/answer/finish
- test_start/submit
- payment_initiated/success/fail
POST /student/events

```
Copy code
```
#### yes, go ahead

#### Thought for a couple of seconds


#### Got it — I’ll start with the Student Notes module in full detail (best next step because it

#### validates entitlement gating + anti-piracy + analytics).

#### Quick note: one or more files you uploaded earlier have expired on my side, so I can’t re-

#### open them right now. If you want me to reference that doc again, please upload it again.

# STUDENT APP — Notes Module v1 (Detailed Tasks)

## SN0) Module scaffolding

#### TASK SN0.1 — Create student notes module files

## SN1) API contract (student-side)

## TASK SN1.1 — Notes APIs

```
txt
```
```
Create:
src/modules/student-notes
types.ts
api.ts
hooks.ts
schemas.ts
components/
NotesFiltersBar.tsx
NotesTreeView.tsx
NotesList.tsx
NoteCard.tsx
PaywallCard.tsx
viewer/
NoteViewerPage.tsx
PdfCanvasViewer.tsx
WatermarkOverlay.tsx
useNoteHeartbeat.ts
viewerGuards.ts Copy code
```
```
txt
```
```
Implement in api.ts:
```

## SN2) Entitlement gating logic (frontend)

### TASK SN2.1 — Build canAccessNote(note)

### TASK SN2.2 — UI PaywallCard

```
 
```
```
listNotes(params):
GET /notes?subjectId=&topicId=&q=
Return: [{ id, title, description?, subjectId, topicIds[], isPremium }]
```
```
getNote(id):
GET /notes/:id
Return: { id, title, description?, subjectId, topicIds[], isPremium, publishedAt
```
```
createViewSession(noteId):
POST /notes/:id/view-session
Return: { viewToken, expiresAt, viewSessionId }
```
```
getWatermark(noteId, viewToken):
GET /notes/:id/watermark
Headers: X-View-Token: viewToken
Return watermark payload:
{ displayName, maskedEmailOrPhone, userHash, issuedAt, viewSessionId, watermarkSe
```
```
streamPdf(noteId, viewToken, range?):
GET /notes/:id/content
Headers: X-View-Token: viewToken
Support Range requests (PDF.js uses them) Copy code
```
#### If your backend has student-prefixed routes, just adjust paths here only.

```
txt
```
```
In auth/entitlements module expose:
canAccessNote(note):
```
- if note.isPremium false -> true
- else:
- activeSubscription OR entitlement kind ALL/NOTES with scope match
Return:
{ allowed: boolean, reason?: "NO_SUBSCRIPTION"|"EXPIRED"|"SCOPE_MISMATCH" }Copy code


## SN3) Notes browsing UX (tree + filters)

### TASK SN3.1 — Notes page route

### TASK SN3.2 — Notes filters bar

### TASK SN3.3 — NotesTreeView

```
txt
PaywallCard.tsx:
```
- Shows premium note message
- CTA: “Buy Subscription”
- CTA routes to /student/payments/plans (or /student/payments)
- Optional: show plan highlights + price (later)
    Copy code

```
txt
```
```
Implement /app/(student)/notes/page.tsx
Layout:
```
- Filters bar: SubjectSelect, TopicSelect, Search q
- Two panes on desktop:
left: NotesTreeView (topics hierarchy)
right: NotesList (notes filtered)
On mobile:
- single column, tree collapsible Copy code

```
txt
```
```
NotesFiltersBar.tsx:
```
- Subject select (GET /subjects)
- Topic select (GET /topics?subjectId=)
- Search input q (debounced 300ms)
Persist filters in URL query string. Copy code

```
txt
```
```
NotesTreeView.tsx:
```
- Load taxonomy tree (subjects/topics)
- For chosen subject, render topics hierarchy
- Each topic row shows: topic name + note count (optional)


## TASK SN3.4 — NotesList + NoteCard

#### DoD SN

#### Student can browse notes by subject/topic

#### Premium notes show lock badge

#### Open works with correct gating

# SN4) Secure Note Viewer (PDF.js + watermark overlay)

## SN4A) Create view session & watermark

## TASK SN4.1 — NoteViewer route

## TASK SN4.2 — Store viewToken safely (memory only)

- Clicking topic sets topicId filter
Also show "Unassigned Notes" bucket.

```
Copy code
```
```
txt
```
```
NotesList.tsx loads listNotes(filters)
Render NoteCard:
```
- title, short description
- premium badge if isPremium
- “Open” button
On Open:
- if gated -> show PaywallCard
- else -> navigate /student/notes/:id Copy code

```
txt
```
```
Implement /app/(student)/notes/[id]/page.tsx
Steps on mount:
1) fetch note meta (getNote)
2) entitlement check
3) if allowed:
```
- createViewSession(noteId) -> viewToken
- getWatermark(noteId, viewToken)
4) render viewer
If not allowed -> PaywallCard Copy code

```
txt
```

## SN4B) PDF rendering (simple v1)

### TASK SN4.3 — Add PDF.js (viewer)

### TASK SN4.4 — Range support

## SN4C) Watermark overlay (client-side anti-piracy)

### TASK SN4.5 — Watermark overlay component

```
Do NOT store viewToken in localStorage.
Keep it in React state only.
On refresh, create a new view-session.
Copy code
```
```
txt
```
```
Install pdfjs-dist
Create PdfCanvasViewer.tsx:
Props: { noteId, viewToken }
```
- Use pdfjs getDocument with URL = /notes/:id/content
- Set request headers with X-View-Token:
pdfjs has "httpHeaders" option
- Render pages to <canvas> sequentially
Start with:
- show first page
- add pagination next/prev
Later upgrade to continuous scroll. Copy code

```
txt
```
```
Ensure pdfjs getDocument uses:
```
- withCredentials if needed
- httpHeaders: { "X-View-Token": viewToken }
Backend must support Range (206). Viewer expects this. Copy code

```
txt
```
```
WatermarkOverlay.tsx:
Props:
```

## TASK SN4.6 — Dynamic watermark motion (optional but strong)

## SN4D) Viewer hardening (best effort)

## TASK SN4.7 — Disable common download paths (best-effort)

# SN5) Heartbeat + analytics

## TASK SN5.1 — Heartbeat hook

```
 
```
```
{ displayName, maskedEmailOrPhone, userHash, issuedAt, viewSessionId, watermarkSe
```
```
Render:
```
- repeated diagonal watermark lines across viewport
- include:
displayName + masked contact + userHash + sessionId short + timestamp
- random offset derived from watermarkSeed so each session differs
- low opacity
- pointer-events: none Copy code

```
txt
```
```
Every 10–15 seconds:
```
- slightly shift watermark background position based on watermarkSeed + tick
This makes screen recording correlation easier. Copy code

```
txt
```
```
In viewerGuards.ts:
```
- prevent context menu (onContextMenu)
- prevent Ctrl+S / Ctrl+P / Ctrl+Shift+I (best effort)
- detect PrintScreen key and show warning toast (cannot block reliably)
- blur viewer if devtools open (optional heuristic) — keep simple v
Note: don’t overdo; avoid breaking usability. Copy code

```
txt
```
```
Implement useNoteHeartbeat(noteId, viewToken):
```
- every 15s call POST /notes/:id/heartbeat with viewSessionId


## TASK SN5.2 — Progress tracking (optional now, but recommended)

#### DoD SN

#### Heartbeat calls fire while reading

#### Close fires on exit

#### No UI glitches if network fails

# SN6) Error handling & edge cases

## TASK SN6.1 — Expired session recovery

## TASK SN6.2 — Offline behavior (v1)

# Definition of Done (Student Notes v1)

- on unmount call POST /notes/:id/close
Handle failures silently. Copy code

```
txt
```
```
If backend supports:
POST /notes/:id/progress { page, totalPages, percent, durationMs }
Throttle to once per 30s or on page change. Copy code
```
```
txt
```
```
If /content returns 401/403 (expired token):
```
- re-create view session
- re-fetch watermark
- reload PDF document
Show toast: “Session refreshed” Copy code

```
txt
```
```
If offline:
```
- show “Offline — notes require internet” (since streaming)
Later: cache last opened pages is complex; skip for v1. Copy code


#### ✅ Browse subjects/topics → see notes

#### ✅ Premium gating works

#### ✅ Opening note creates view session

#### ✅ PDF renders via PDF.js

#### ✅ Watermark overlays across pages

#### ✅ Heartbeat + close events fire

#### ✅ Session refresh works on expiry

## Next (after you implement this)

#### Reply with “next student practice module” and I’ll provide the same level of tasks for:

#### practice start (subject/topic)

#### fetch next questions

#### answer submission

#### progress analytics & weak topic insights

#### next please

#### Thought for a couple of seconds

#### Next up: Student Practice module (topic-wise, untimed) — with full minute-level tasks

#### like we did for Notes.

#### Also: a heads-up — one or more files you uploaded earlier have expired on my side, so I

#### can’t open/reference them right now. If you want me to align anything to that doc again,

#### please upload it again.

# STUDENT APP — Practice Module v1 (Detailed Tasks)

## SP0) Module scaffolding

#### TASK SP0.1 — Create practice module files

```
txt
```

## SP1) API contract (student-side)

### TASK SP1.1 — Practice APIs

```
Create:
src/modules/student-practice
types.ts
api.ts
hooks.ts
schemas.ts
components/
PracticeStartForm.tsx
PracticeSessionHeader.tsx
QuestionCard.tsx
OptionsRenderer.tsx
QuestionPalette.tsx
PracticeSummary.tsx
PracticeFiltersBar.tsx
session/
usePracticeTimer.ts // time spent per question (not countdown)
usePracticeAutosave.ts // optional
practiceTelemetry.ts // client-side telemetry builder
Copy code
```
```
txt
```
```
Implement in api.ts:
```
```
startPractice(dto):
POST /practice/start
Body:
{
subjectId: uuid,
topicId?: uuid|null,
difficulty?: "EASY"|"MEDIUM"|"HARD"|null,
count?: number (default 20),
mode?: "MIXED"|"UNSEEN_FIRST"|"WEAK_FIRST" (optional)
}
Return:
{
sessionId: uuid,
config: {...},
```

## SP2) Types + Zod schemas

### TASK SP2.1 — Define QuestionPayload type (same as admin editor output)

```
questions: QuestionPayload[] // first batch
}
```
```
getNextQuestions(sessionId, params):
GET /practice/:sessionId/next?count=
Return: QuestionPayload[]
```
```
submitAnswer(sessionId, dto):
POST /practice/:sessionId/answer
Body:
{
questionId: uuid,
selectedKey: "A"|"B"|"C"|"D"|null,
timeSpentMs: number,
eventMeta?: { isSkipped?:boolean }
}
Return:
{
correct: boolean,
correctKey: "A"|"B"|"C"|"D",
explanationJson?: ContentDoc
}
```
```
finishPractice(sessionId):
POST /practice/:sessionId/finish
Return:
{
sessionSummary: { answered, correct, skipped, accuracyPct, durationMs },
topicBreakdown: [...],
weakAreas: [...]
} Copy code
```
#### If your backend differs slightly, keep this shape internally and adjust URLs in api.ts only.

```
txt
```
```
In types.ts:
QuestionPayload:
```

### TASK SP2.2 — Zod validation for start form

## SP3) Routes & pages

### TASK SP3.1 — Practice start page

### TASK SP3.2 — Practice session page

##### {

```
id,
subjectId,
topicId?,
difficulty,
statementJson, // ContentDoc blocks
optionsJson, // {options:[{key, blocks:[]}]}
}
AnswerKey = "A"|"B"|"C"|"D" Copy code
```
```
txt
```
```
In schemas.ts:
PracticeStartSchema:
{
subjectId: uuid,
topicId?: uuid|null,
difficulty?: enum|null,
count: number int min 5 max 200,
mode?: enum
} Copy code
```
```
txt
```
```
Implement:
/app/(student)/practice/start/page.tsx
```
```
Renders <PracticeStartForm />
On submit:
```
- call startPractice
- navigate to /student/practice/session/:sessionId Copy code

```
txt
```

## SP4) PracticeStartForm (topic-wise filtering)

### TASK SP4.1 — Build Start Form UI

### TASK SP4.2 — Entitlement gating (if practice is premium)

```
Implement:
/app/(student)/practice/session/[id]/page.tsx
```
```
On mount:
```
- load session initial questions from start response (if you route via state)
OR
- call GET /practice/:id (if backend supports)
Render:
- header (progress + subject/topic)
- question card
- next/prev navigation
- explanation panel after answering Copy code

#### If you prefer simpler: store startPractice() response in a lightweight global store

#### keyed by sessionId and use it on session page.

```
txt
```
```
PracticeStartForm.tsx fields:
```
- Subject select (GET /subjects)
- Topic select (depends on subject; optional)
- Difficulty select (optional)
- Count (default 30)
- Mode select (optional): MIXED/UNSEEN_FIRST/WEAK_FIRST

```
CTA button: “Start Practice” Copy code
```
```
txt
```
```
Before calling startPractice:
```
- check entitlement canAccessTests/practice (based on your policy)
If not allowed:
- show PaywallCard (reuse from notes)
- route to /student/payments Copy code


#### DoD Start

#### Can start session for subject or subject+topic

#### Paywall blocks unauthorized users

## SP5) Question rendering (supports images)

### TASK SP5.1 — Content block renderer (reusable)

### TASK SP5.2 — QuestionCard

## SP6) Answer submission + telemetry

### TASK SP6.1 — Track timeSpent per question

```
txt
```
```
Create OptionsRenderer.tsx and shared ContentBlocksRenderer.tsx:
```
- For block type "text": render text
- For block type "image": render <img src={`/assets/${imageAssetId}`} />
Ensure images responsive, max-width 100% Copy code

```
txt
```
```
QuestionCard.tsx:
```
- statement renderer
- options list (A–D)
- option selection state
- Submit button
- Skip button
After submit:
- lock options
- show correct/incorrect indicator
- show explanationJson (if returned) Copy code

```
txt
```
```
usePracticeTimer.ts:
```
- start when question shown
- stop on submit/skip


### TASK SP6.2 — Submit answer mutation

### TASK SP6.3 — Skip behavior

#### DoD Session Core

#### Answer submission works

#### Correctness + correct answer shown

#### Explanation renders when available

#### Images in questions/options render fine

## SP7) Session flow: fetching more questions

### TASK SP7.1 — Prefetch next batch

### TASK SP7.2 — End session

- return timeSpentMs
Reset when moving to next question.

```
Copy code
```
```
txt
```
```
On submit:
POST /practice/:sessionId/answer
Payload includes timeSpentMs and selectedKey
Update local state:
```
- mark question answered
- store correctKey + correctness
Show explanation panel Copy code

```
txt
```
```
Skip sends selectedKey=null with eventMeta.isSkipped=true
Mark as skipped locally.
Move to next question. Copy code
```
```
txt
```
```
When remaining unanswered questions < 5:
```
- call GET /practice/:sessionId/next?count=10
- append to session list
Deduplicate by questionId. Copy code

### ChatGPT 5.2


## SP8) Practice summary UI

### TASK SP8.1 — PracticeSummary component

#### DoD Summary

#### Summary loads from backend

#### Weak areas displayed

#### Easy next actions

## SP9) UX polish (v1.1 optional)

### TASK SP9.1 — Palette / navigation

```
txt
```
```
Finish button:
POST /practice/:id/finish
Navigate to /student/practice/session/:id?view=summary
Render PracticeSummary component. Copy code
```
```
txt
```
```
Render:
```
- answered, correct, skipped
- accuracy %
- duration
- weak topics list (from backend)
CTA:
- “Practice weak topics” (prefill start form)
- “Go to Tests” Copy code

```
txt
```
```
QuestionPalette.tsx:
```
- shows dots for questions (unseen/answered/skipped)
- jump to question
Mobile: bottom sheet
Desktop: side panel Copy code


## TASK SP9.2 — Autosave (optional)

# Definition of Done (Practice v1)

#### ✅ Start practice by subject/topic

#### ✅ Render MCQs with images

#### ✅ Submit/skip records timeSpent + correctness

#### ✅ Prefetch next questions

#### ✅ Finish shows summary + weak areas

## Next module (your call)

#### Reply with one:

#### “next student tests module” (timed attempt UI)

#### “next student payments flow” (PhonePe return + polling)

#### “next student profile/progress”

```
txt
```
```
If you want resilience:
```
- local store session progress by sessionId
- restore if user refreshes page
Not required for v1. Copy code

#### next

#### Thought for a couple of seconds

#### Next up: Student Tests module (timed) — end-to-end attempt flow, autosave, palette,

#### submission, and results/analysis.

#### Also, quick note: one or more files you uploaded earlier have expired on my side, so I can’t

#### open/reference them right now. If you want me to align anything to that doc again, please


#### re-upload it.

# STUDENT APP — Tests Module v1 (Detailed Tasks)

## STT0) Module scaffolding

#### TASK STT0.1 — Create test module files

## STT1) API contract

## TASK STT1.1 — Tests APIs

```
txt
```
```
Create:
src/modules/student-tests
types.ts
api.ts
hooks.ts
schemas.ts
components/
TestsList.tsx
TestCard.tsx
TestDetailsHeader.tsx
AttemptShell.tsx
TimerBar.tsx
QuestionPalette.tsx
QuestionView.tsx
AttemptActions.tsx
SubmitDialog.tsx
AttemptSummary.tsx
AttemptAnalysis.tsx
utils/
attemptState.ts
timerSync.ts Copy code
```
```
txt
```
```
Implement in api.ts:
```
```
listTests(params):
```

 

```
GET /tests?status=upcoming|active|all
Return: [{ id, title, type, durationSec, startsAt?, endsAt?, isPremium?, attemptSt
```
```
getTest(id):
GET /tests/:id
Return: { id, title, durationSec, rules/metadata }
```
```
startAttempt(testId):
POST /tests/:id/start
Return:
{
attemptId: uuid,
testId: uuid,
durationSec: number,
startedAt: iso,
serverNow: iso, // for timer sync
questions: QuestionPayload[] // no answers
}
```
```
saveAnswer(attemptId, dto):
POST /attempts/:attemptId/save
Body:
{
questionId: uuid,
selectedKey: "A"|"B"|"C"|"D"|null,
markedForReview?: boolean,
timeSpentMsDelta?: number
}
Return: { ok: true }
```
```
submitAttempt(attemptId):
POST /attempts/:attemptId/submit
Return:
{
score: {...},
breakdown: {...},
answersReview: [...] // include correctKey + selectedKey
} Copy code
```
#### If your backend uses PATCH for save, adjust in api.ts only.


## STT2) Types + schemas

### TASK STT2.1 — Types

### TASK STT2.2 — Schemas (optional guards)

## STT3) Routes & pages

### TASK STT3.1 — Tests list page

```
 
```
```
txt
```
```
In types.ts:
AttemptState:
{
attemptId
testId
durationSec
startedAt
serverNow
questions: QuestionPayload[]
answers: Record<questionId, { selectedKey?:Key|null, markedForReview?:boolean }
timeSpentMs: Record<questionId, number>
}
```
```
AttemptResult:
{ score, breakdown, answersReview } Copy code
```
```
 
```
```
txt
```
```
In schemas.ts:
SaveAnswerSchema:
{ questionId: uuid, selectedKey?: enum|null, markedForReview?: boolean, timeSpentM
```
```
SubmitSchema: { attemptId: uuid }
Copy code
```
```
txt
```
```
Implement /app/(student)/tests/page.tsx
```
- show tabs: Upcoming | Active | All
- load listTests(tab)


### TASK STT3.2 — Test details page (optional)

### TASK STT3.3 — Attempt page

## STT4) Timer strategy (must be reliable)

### TASK STT4.1 — Timer sync utility

- render <TestCard> list
Each card shows title, duration, type, premium lock.
CTA:
- "Start" or "Continue" if attempt exists. Copy code

```
txt
```
```
Implement /app/(student)/tests/[id]/page.tsx
```
- show metadata (duration, rules)
- CTA startAttempt
If you want faster: skip this page and start attempt directly from list.Copy code

```
 
```
```
txt
```
```
Implement /app/(student)/tests/attempt/[id]/page.tsx
```
- load attempt state (from startAttempt response or GET attempt if backend exists
- render AttemptShell:
TimerBar
QuestionPalette
QuestionView
AttemptActions (save, mark review, next/prev, submit) Copy code

```
txt
```
```
Implement utils/timerSync.ts:
Given:
```
- startedAt (server time)
- serverNow (server time at response)
- clientNow (Date.now)
Compute offset and remainingSec accurately:
remaining = durationSec - ( (clientNow+offset) - startedAt )

```
Copy code
```

### TASK STT4.2 — Auto-submit on time end

## STT5) Attempt UI building blocks

### TASK STT5.1 — AttemptShell layout (mobile first)

### TASK STT5.2 — QuestionPalette

```
Clamp to >= 0.
Recompute every second.
```
```
txt
```
```
When remainingSec hits 0:
```
- lock UI
- call submitAttempt(attemptId)
- navigate to result screen
Prevent double submits. Copy code

```
txt
```
```
AttemptShell.tsx:
Mobile:
```
- TimerBar top
- QuestionView
- Bottom sticky actions (Prev, Next, Mark, Save)
- Palette opens as bottom sheet

```
Desktop:
```
- left palette
- center question
- right actions (optional) Copy code

```
txt
```
```
Show all questions:
States:
```
- UNSEEN
- ANSWERED
- MARKED
- ANSWERED+MARKED


### TASK STT5.3 — QuestionView (renders blocks + images)

### TASK STT5.4 — AttemptActions

## STT6) Autosave answers (critical)

### TASK STT6.1 — Save on every change (debounced)

### TASK STT6.2 — Persist attempt state locally (v1 recommended)

##### - CURRENT

```
Click navigates to question index.
```
```
Copy code
```
```
txt
```
```
Use same ContentBlocksRenderer used in practice:
```
- statement blocks
- option blocks A–D (text/image)
Selectable until submitted. Copy code

```
txt
```
```
Buttons:
```
- Prev / Next
- Mark for review toggle
- Clear answer
- Submit (opens SubmitDialog)
Also show "Saved" indicator. Copy code

```
txt
```
```
When selectedKey or markedForReview changes:
```
- debounce 500ms
- call saveAnswer(attemptId, payload)
Keep an in-memory queue to avoid race:
- cancel previous inflight for same question OR last-write-wins. Copy code

```
txt
```
```
Store minimal attempt state in localStorage:
```
- attemptId, currentIndex
- answers map


## STT7) Submit + Results + Analysis

### TASK STT7.1 — Submit dialog

### TASK STT7.2 — Results page/section

### TASK STT7.3 — Answer review

- markedForReview map
Restore on refresh:
- if attempt is active, rehydrate UI
Backend remains source of truth; local is convenience. Copy code

```
txt
```
```
SubmitDialog.tsx shows:
```
- answered count
- unanswered count
- marked count
Confirm -> submitAttempt(attemptId) Copy code

```
txt
```
```
After submit:
Render AttemptSummary:
```
- total score
- accuracy
- time used
- breakdown by subject/topic (if backend returns) Copy code

```
txt
```
```
AttemptAnalysis.tsx:
```
- list questions with:
selectedKey
correctKey
explanation blocks (if backend provides or via separate endpoint)
- allow filtering: incorrect only, marked only

```
Copy code
```

## STT8) Entitlement gating

## TASK STT8.1 — Gate test start

# Definition of Done (Student Tests v1)

#### ✅ Tests list loads and shows status

#### ✅ Start attempt returns attemptId + questions

#### ✅ Timer sync works and can’t be cheated by client clock

#### ✅ Answers autosave and survive refresh

#### ✅ Submit works + results/analysis render

#### ✅ Image questions work in stem/options

## Next module

#### Reply with:

#### “next student payments flow” (PhonePe redirect + return polling + subscription

#### refresh)

#### or

#### “next student profile/progress”

```
txt
```
```
Before startAttempt:
```
- check canAccessTests()
If not allowed:
- show paywall -> route to /student/payments

```
Copy code
```
#### next student payments flow

#### Thought for 4 seconds

#### Alright — Student Payments flow (PhonePe Standard Checkout) next, end-to-end.


#### Also: one or more files you uploaded earlier have expired on my side, so I can’t

#### open/reference them right now. If you want me to align the UI text/plan details to that

#### doc, please re-upload it.

# STUDENT APP — Payments Flow v1 (PhonePe Redirect +

# Return + Poll + Subscription Refresh)

## PAY-S0) Module scaffolding

#### TASK PAY-S0.1 — Create payment module files

## PAY-S1) API contract (student-side)

## TASK PAY-S1.1 — Payments APIs

```
txt
```
```
Create:
src/modules/student-payments
types.ts
api.ts
hooks.ts
schemas.ts
components/
PlansGrid.tsx
PlanCard.tsx
CheckoutSummary.tsx
PaymentStatusScreen.tsx
PaymentReturnHandler.tsx
PaymentCtaBanner.tsx
utils/
money.ts
poller.ts
```
```
Copy code
```
```
txt
```
```
Implement in api.ts:
```
```
listPlans():
GET /plans
```
```
Copy code
```

## PAY-S2) Routes & Pages

### TASK PAY-S2.1 — Plans page

```
Return: [{ key, name, pricePaise, durationDays, features[] }]
```
```
createOrder(dto):
POST /payments/create
Body:
{
planKey: string,
couponCode?: string|null,
returnUrl: string // /student/payments/return
}
Return:
{
merchantTransactionId: string,
redirectUrl: string, // PhonePe hosted checkout
amountPaise: number,
expiresAt?: string|null
}
```
```
getPaymentStatus(merchantTransactionId):
GET /payments/orders/:merchantTransactionId/status
Return:
{
status: "PENDING"|"SUCCESS"|"FAILED"|"EXPIRED",
message?: string
}
```
```
refreshMe():
GET /me (or /auth/me)
Return updated subscription/entitlements after payment success.
```
#### Keep all URLs centralized in api.ts so you can rename /student/... later without

#### touching UI.

```
txt
```
```
Implement /app/(student)/payments/page.tsx
(or /app/(student)/payments/plans/page.tsx if you prefer)
```
```
Copy code
```

### TASK PAY-S2.2 — Payment return page

## PAY-S3) Plans UI

### TASK PAY-S3.1 — Money util + PlanCard

### TASK PAY-S3.2 — PlansGrid

```
 
```
```
Renders:
```
- PlansGrid (PlanCard list)
- optional coupon input (v1.1)
- On select plan -> go to checkout confirm screen (modal or /payments/checkout)

```
txt
```
```
Implement /app/(student)/payments/return/page.tsx
```
```
Reads query params:
```
- merchantTransactionId OR txnId (decide and standardize)
Then:
- start polling getPaymentStatus(txnId)
- render PaymentStatusScreen (pending spinner / success / failure)
On success:
- call refreshMe()
- redirect to where user came from (notes/test), fallback /student

```
Copy code
```
```
txt
```
```
money.ts:
formatPaiseToINR(paise) -> "₹ 1,999"
```
```
PlanCard.tsx shows:
```
- name
- price
- duration
- features list (3-6 bullets)
CTA: "Buy"

```
Copy code
```
```
txt Copy code
```

#### DoD

#### Plans load from backend

#### Cards render correctly

## PAY-S4) Create order + redirect (mobile safe)

### TASK PAY-S4.1 — Checkout confirmation step

### TASK PAY-S4.2 — Persist intent (so return page knows what happened)

#### DoD

```
PlansGrid.tsx:
```
- loads plans via usePlans()
- skeleton loading
- error state
- responsive grid (1 col mobile, 2/3 desktop)

```
txt
```
```
Create CheckoutSummary.tsx:
```
- plan selected
- total price
- optional coupon
- "Proceed to Pay" button
On click:
- call createOrder({planKey, couponCode, returnUrl})
- persist merchantTransactionId locally
- redirect user to redirectUrl using window.location.href (NOT new tab)

```
Copy code
```
```
txt
```
```
In localStorage store:
payment_intent = {
merchantTransactionId,
planKey,
createdAt,
returnTo: current path (e.g. /student/notes/:id)
}
Clear after success/failure resolution.
```
```
Copy code
```

#### Clicking Buy creates order and sends user to PhonePe page

#### Works on mobile browsers

## PAY-S5) Return handler + polling strategy

### TASK PAY-S5.1 — Poller utility

### TASK PAY-S5.2 — PaymentReturnHandler component

### TASK PAY-S5.3 — PaymentStatusScreen

```
txt
```
```
poller.ts:
pollUntil(fn, stopCondition, {intervalMs, timeoutMs})
Defaults:
intervalMs=2000
timeoutMs=120000 (2 min)
Return last result.
```
```
Copy code
```
```
txt
```
```
PaymentReturnHandler.tsx:
Input: merchantTransactionId
Process:
```
- call getPaymentStatus immediately
- if PENDING -> poll every 2s up to 2 min
- if SUCCESS:
- refreshMe()
- show success UI
- redirect to stored returnTo after 2s
- if FAILED/EXPIRED:
- show failure UI with retry CTA to /student/payments

```
Copy code
```
```
txt
```
```
PaymentStatusScreen.tsx:
States:
```
- pending: spinner + “Confirming payment...”
- success: checkmark + “Subscription activated”

```
Copy code
```

#### DoD

#### Return page handles pending → success reliably

#### RefreshMe updates subscription in app context

## PAY-S6) Update app session after payment success

### TASK PAY-S6.1 — Refresh auth context after payment

### TASK PAY-S6.2 — Redirect logic

## PAY-S7) Paywall CTAs (reused by notes/tests/practice)

### TASK PAY-S7.1 — PaymentCtaBanner component

- failed: warning + reason + retry button
- expired: show “Payment expired”

```
txt
```
```
In AuthProvider:
Expose method auth.refreshMe()
On success return page:
await auth.refreshMe()
Then:
```
- student can immediately open premium notes/tests

```
Copy code
```
```
txt
```
```
If payment_intent.returnTo exists:
```
- redirect there
Else:
- redirect /student

```
Copy code
```
```
txt
```
```
PaymentCtaBanner.tsx:
```
- small banner shown in locked content
- “Unlock Premium” button -> /student/payments
Optional show price starting from plan[0]

```
Copy code
```

## TASK PAY-S7.2 — Centralize paywall navigation

## PAY-S8) Edge cases & hardening

## TASK PAY-S8.1 — Missing txnId on return

## TASK PAY-S8.2 — User hits back / refresh during payment

## TASK PAY-S8.3 — Duplicate success handling

# Definition of Done (Student Payments v1)

#### ✅ Plans page loads from backend

#### ✅ Create order redirects to PhonePe (mobile safe)

#### ✅ Return page polls and resolves payment state

```
txt
```
```
Create helper:
goToPaywall(returnTo=currentPath)
Stores returnTo and navigates /student/payments
```
```
Copy code
```
```
txt
```
```
If return page lacks merchantTransactionId in query:
```
- fallback to payment_intent from localStorage
If still missing:
- show error: “Could not identify payment”
CTA -> /student/payments

```
Copy code
```
```
txt
```
- keep payment_intent for 30 minutes
- return page can resume polling anytime

```
Copy code
```
```
txt
```
```
If status SUCCESS and intent already cleared:
```
- still call refreshMe()
- show success and go home

```
Copy code
```

#### ✅ On success, /me refresh updates entitlements immediately

#### ✅ Redirects back to locked content after success

#### ✅ Robust to refresh/back/missing txnId

## Next module

#### Reply with:

#### “next student profile/progress” (dashboard + subscription + analytics)

#### or if you want, “start landing page” (CMS-driven public marketing site).

#### next student profile/progress

#### Thought for a couple of seconds

#### Sure — Student Profile/Progress next.

#### Quick note first: a couple of the files you uploaded earlier have expired on my side , so I

#### can’t re-open/reference them right now. If you want the profile/progress screens to match

#### any exact content from those docs, please upload them again.

# STUDENT APP — Profile & Progress Module v1 (Detailed

# Tasks)

## PR0) Module scaffolding

#### TASK PR0.1 — Create files

```
txt
```
```
Create:
src/modules/student-profile
types.ts
api.ts
hooks.ts
```
```
Copy code
```

## PR1) API contract

### TASK PR1.1 — Student profile APIs

```
schemas.ts
components/
ProfileHeaderCard.tsx
SubscriptionCard.tsx
EntitlementsCard.tsx
ProgressOverviewCards.tsx
SubjectProgressList.tsx
TopicProgressDrawer.tsx
RecentActivityList.tsx
SettingsSection.tsx
utils/
format.ts
```
```
txt
```
```
Implement in api.ts:
```
```
getProfile():
GET /profile
Return:
{
user: { id, name, email?, phone?, createdAt },
subscription?: { planKey, status, startsAt, endsAt } | null,
entitlements?: [{ kind, startsAt, endsAt, scopeJson? }] | null
}
```
```
getProgressSummary(range?):
GET /progress/summary?from=&to=
Return:
{
notes: { readCount, lastReadAt?, completionPct? },
practice: { answered, correct, accuracyPct, weakTopics?: [] },
tests: { attempts, avgScore?, bestScore?, lastAttemptAt? }
}
```
```
getSubjectProgress(range?):
GET /progress/subjects?from=&to=
Return:
```
```
Copy code
```

## PR2) React Query hooks

### TASK PR2.1 — Hooks

## PR3) Routes & layout

### TASK PR3.1 — Profile page route

```
 
```
```
[{ subjectId, subjectName?, accuracyPct, answered, correct, notesRead, testsAttem
```
```
getTopicProgress(subjectId, range?):
GET /progress/topics?subjectId=&from=&to=
Return:
[{ topicId, topicName?, accuracyPct, answered, correct, lastAnsweredAt? }]
```
```
getRecentActivity(limit?):
GET /activity/recent?limit=
Return:
[{ type:"NOTE_VIEW"|"PRACTICE"|"TEST"|"PAYMENT", label, at, metaJson? }]
```
#### If your backend uses /analytics/me/*, keep these methods but point them there.

```
txt
```
```
In hooks.ts implement:
useProfile()
useProgressSummary(range)
useSubjectProgress(range)
useTopicProgress(subjectId, range, enabled)
useRecentActivity(limit)
```
```
Query keys:
["student","profile"]
["student","progress","summary",range]
["student","progress","subjects",range]
["student","progress","topics",subjectId,range]
["student","activity","recent",limit]
```
```
Copy code
```
```
txt Copy code
```

#### DoD

#### Page loads fast, renders even if subscription/entitlements are null

#### Good loading and empty states

## PR4) UI components

### TASK PR4.1 — ProfileHeaderCard

### TASK PR4.2 — SubscriptionCard

```
Implement /app/(student)/profile/page.tsx
```
```
Layout (mobile-first):
```
- ProfileHeaderCard (name/email/phone)
- SubscriptionCard
- EntitlementsCard (read-only)
- ProgressOverviewCards (quick KPIs)
- SubjectProgressList (tap subject -> open TopicProgressDrawer)
- RecentActivityList
- SettingsSection (logout, optional theme)

```
txt
```
```
Show:
```
- name (fallback: "Student")
- email/phone (masked optional)
- member since (createdAt)
Button: Edit profile (v1 optional; can skip)

```
Copy code
```
```
txt
```
```
If subscription exists:
```
- planKey/name
- status badge (ACTIVE/EXPIRED)
- validity dates
CTA:
- If expired: “Renew” -> /student/payments
If no subscription:
- show “No active plan” + “Buy subscription”

```
Copy code
```

### TASK PR4.3 — EntitlementsCard

## PR5) Progress views

### TASK PR5.1 — ProgressOverviewCards

### TASK PR5.2 — SubjectProgressList

### TASK PR5.3 — TopicProgressDrawer

```
txt
```
```
List entitlements:
```
- kind
- date range
- small “scope” summary:
- ALL => "Full access"
- NOTES scope => show subject/topic count if possible
This is read-only for student.

```
Copy code
```
```
txt
```
```
Use getProgressSummary(range)
Cards:
```
- Notes read (and completionPct if available)
- Practice accuracy + answered count
- Tests attempts + avg score
Add small “Last activity at” if available.

```
Copy code
```
```
txt
```
```
Use getSubjectProgress(range)
Render list of subjects:
```
- subject name
- accuracy %
- answered/correct
- notesRead
Tap subject -> open TopicProgressDrawer(subjectId)

```
Copy code
```
```
txt Copy code
```

## PR6) Recent activity

### TASK PR6.1 — RecentActivityList

## PR7) Settings (simple v1)

### TASK PR7.1 — SettingsSection

## PR8) Date range support (optional but very useful)

### TASK PR8.1 — DateRangeBar reuse

```
Drawer loads getTopicProgress(subjectId)
List topics:
```
- topic name
- accuracy %
- answered/correct
- lastAnsweredAt
Optional actions:
- “Practice this topic” button -> /student/practice/start prefilled

```
txt
```
```
Use getRecentActivity(20)
Show timeline entries:
```
- Note viewed: note title
- Practice session finished: accuracy
- Test submitted: score
- Payment success: plan
If empty -> show “No activity yet”

```
Copy code
```
```
txt
```
```
Include:
```
- Logout button (clears auth tokens, redirects to /)
- (Optional) Dark mode toggle if you implemented next-themes
- (Optional) “Contact support” link

```
Copy code
```

# Definition of Done (Student Profile/Progress v1)

#### ✅ Profile shows subscription + entitlements

#### ✅ Progress KPIs visible (notes/practice/tests)

#### ✅ Subject list + topic drill-down works

#### ✅ Recent activity timeline works

#### ✅ Clear CTAs for upgrading/renewing subscription

#### ✅ Handles empty states gracefully