# Learn Dari Mobile App Guide and Roadmap

## 1. Product Vision

Learn Dari should become a calm, practical language-learning app for beginners who want to learn useful Dari words, phrases, script, pronunciation, and conversation patterns.

The app should feel:

- Clear enough for a total beginner
- Respectful of Dari and Afghan culture
- Useful in real conversations
- Simple to open for five minutes a day
- Structured enough to grow into a serious learning product

The first strong version should work offline on iOS and Android, using the current website content as the foundation.

## 2. Current Project State

The existing project is a full-stack web app.

Current files:

- `server.mjs`: Node backend and lesson data
- `public/index.html`: app layout
- `public/styles.css`: visual design
- `public/app.js`: frontend behavior
- `data/progress.json`: server-side saved progress
- `HANDOVER.md`: current project handover

Current features:

- Dashboard
- Lesson cards
- Practice quiz
- Searchable phrasebook
- Category filters
- 15 lesson groups
- 187 Dari words and phrases
- Basic progress tracking

Main limitation:

The app currently depends on a local Node server. A mobile app should not require the user to run `node server.mjs`.

## 3. Recommended Mobile Strategy

Use Capacitor to package the app for iOS and Android.

Capacitor lets a web app run inside native iOS and Android shells while still using HTML, CSS, and JavaScript.

Recommended approach:

1. Convert the app to work offline first.
2. Move lessons out of `server.mjs` into a frontend data file.
3. Replace `/api/progress` calls with local device storage.
4. Package the offline web app with Capacitor.
5. Add native features gradually.

Why this is best:

- Faster to build
- Less backend complexity
- Works without internet
- Easier App Store and Play Store testing
- Good fit for a language-learning app

## 4. Final Target Architecture

The app should eventually have this structure:

```txt
learn-dari/
  public/
    index.html
    styles.css
    app.js
    data/
      lessons.js
      quiz.js
    assets/
      icons/
      audio/
      images/
  ios/
  android/
  capacitor.config.js
  package.json
  README.md
  HANDOVER.md
  MOBILE_APP_ROADMAP.md
```

For the first mobile version, the app should be static:

```txt
lessons.js -> frontend renders lessons
localStorage -> saves progress
Capacitor -> creates iOS and Android apps
```

Later versions can add:

```txt
Hosted backend
User accounts
Cloud progress sync
Admin content editor
Audio content pipeline
Push reminders
```

## 5. Phase 1: Make The App Offline-Ready

Goal:

Remove the need for `server.mjs` in the mobile app.

Tasks:

1. Create `public/data/lessons.js`
2. Move the `lessons` array from `server.mjs` into that file
3. Export the lessons:

```js
export const lessons = [
  // existing lesson data
];
```

4. In `public/app.js`, import lessons directly:

```js
import { lessons } from "./data/lessons.js";
```

5. Generate quiz data in the frontend:

```js
const quiz = lessons.flatMap((lesson) =>
  lesson.items.map((item) => ({
    lessonId: lesson.id,
    prompt: item.dari,
    answer: item.meaning,
    latin: item.latin
  }))
);
```

6. Replace API calls with local functions:

```js
function readProgress() {
  return JSON.parse(localStorage.getItem("learnDariProgress")) || {
    completedLessons: [],
    quizAttempts: [],
    streak: 0
  };
}

function saveProgress(progress) {
  localStorage.setItem("learnDariProgress", JSON.stringify(progress));
}
```

7. Remove dependency on these endpoints for the app:

```txt
/api/lessons
/api/quiz
/api/progress
/api/progress/lesson
/api/progress/quiz
```

Definition of done:

- Opening `public/index.html` directly works
- Lessons render
- Phrasebook renders
- Quiz works
- Progress saves after refresh
- No local Node server is required for app use

## 6. Phase 2: Improve The Learning Design

Goal:

Make the product feel like a real learning app, not just a phrase list.

Core learning flows:

1. Learn
2. Review
3. Practice
4. Search
5. Track progress

Recommended screens:

- Home
- Lessons
- Lesson Detail
- Practice
- Phrasebook
- Progress
- Settings

### Home Screen

Purpose:

Give the learner a clear next action.

Should include:

- Current streak
- Continue lesson button
- Review due button
- Daily phrase
- Progress summary

Avoid:

- Marketing copy
- Huge hero sections
- Decorative content that does not help learning

### Lessons Screen

Purpose:

Show the course path.

Each lesson card should show:

- Lesson title
- Category
- Estimated time
- Completion status
- Number of words/phrases

Recommended categories:

- Script
- Greetings
- People
- Learning
- Questions
- Numbers
- Food
- Travel
- Shopping
- Home
- Health
- Verbs
- Descriptions
- Conversation

### Lesson Detail Screen

Purpose:

Teach one focused group.

Each entry should show:

- Dari text
- Transliteration
- English meaning
- Usage note
- Audio button when available
- Save/favorite button later

Lesson actions:

- Mark complete
- Practice this lesson
- Add difficult words to review

### Practice Screen

Purpose:

Make recall stronger.

Practice modes:

- Dari to English
- English to Dari
- Transliteration to meaning
- Listening mode later
- Multiple choice
- Flashcards
- Typing mode later

First version:

- Multiple choice quiz
- 8 questions per round
- Save score

Later version:

- Spaced repetition
- Mistake review
- Daily review queue

### Phrasebook Screen

Purpose:

Be a fast reference.

Must include:

- Search by Dari
- Search by transliteration
- Search by English
- Category filters
- Favorites later

### Progress Screen

Purpose:

Help users feel momentum.

Should include:

- Lessons completed
- Quiz average
- Study streak
- Words learned
- Review accuracy
- Recent quiz scores

## 7. Visual Design Direction

Design personality:

- Warm
- Focused
- Practical
- Respectful
- Not childish
- Not overloaded

Suggested design principles:

- Use large Dari text for learning content
- Keep controls simple
- Make lesson content scannable
- Avoid clutter
- Use readable contrast
- Make touch targets large enough for mobile

Suggested palette:

- Deep green for primary actions
- Warm off-white for background
- Soft blue for practice sections
- Gold for tips and highlights
- Rose/red only for errors or incorrect answers

Existing palette:

```css
--ink: #18201d;
--muted: #65716b;
--paper: #fbfaf6;
--line: #d9d6c9;
--mint: #d9eee5;
--leaf: #1d6b56;
--rose: #c85f5a;
--gold: #e3b64b;
--sky: #d9e7f4;
```

Mobile UI rules:

- Minimum touch target: 44px high
- Avoid tiny text in buttons
- Keep lesson cards simple
- Use bottom navigation instead of desktop sidebar
- Avoid nested cards
- Keep Dari script large and readable
- Do not use viewport-width font scaling

Recommended mobile navigation:

```txt
Home | Lessons | Practice | Phrasebook | Progress
```

Desktop can keep sidebar navigation. Mobile should use bottom tabs.

## 8. Engineering Plan

### Step 1: Preserve Current Web Version

Before major changes:

- Keep `server.mjs` working
- Add offline/mobile files separately
- Avoid deleting useful backend code

Suggested branch naming:

```txt
mobile-offline-v1
```

### Step 2: Extract Data

Create:

```txt
public/data/lessons.js
```

Move lesson content there.

Keep lesson object shape:

```js
{
  id: "greetings",
  title: "Greetings and Courtesy",
  category: "Greetings",
  level: "Beginner",
  minutes: 10,
  summary: "Meet people politely...",
  items: [
    {
      dari: "سلام",
      latin: "salaam",
      meaning: "hello",
      note: "The safest greeting in almost every setting."
    }
  ],
  tip: "Use tashakor for thanks..."
}
```

### Step 3: Create Storage Layer

Create:

```txt
public/storage.js
```

Responsibilities:

- Read progress
- Save progress
- Mark lesson complete
- Save quiz attempt
- Reset progress
- Export progress later

Suggested API:

```js
export function getProgress() {}
export function saveProgress(progress) {}
export function completeLesson(lessonId) {}
export function saveQuizAttempt(score, total) {}
export function resetProgress() {}
```

### Step 4: Create Learning Logic Layer

Create:

```txt
public/learning.js
```

Responsibilities:

- Generate quiz questions
- Shuffle options
- Calculate progress stats
- Filter phrasebook entries
- Get lesson by ID

Suggested API:

```js
export function buildQuiz(lessons) {}
export function getAllPhrases(lessons) {}
export function filterPhrases(phrases, query, category) {}
export function calculateStats(progress) {}
```

### Step 5: Refactor UI

Split `public/app.js` into clearer modules later:

```txt
public/app.js
public/render.js
public/storage.js
public/learning.js
public/data/lessons.js
```

Do not over-refactor too early. First make the app offline-ready, then split files.

### Step 6: Add Capacitor

Install Capacitor:

```sh
npm install @capacitor/core @capacitor/cli
```

Initialize:

```sh
npx cap init "Learn Dari" "com.shahrukhi.learndari"
```

Add platforms:

```sh
npx cap add ios
npx cap add android
```

Create or update:

```txt
capacitor.config.js
```

Use:

```js
export default {
  appId: "com.shahrukhi.learndari",
  appName: "Learn Dari",
  webDir: "public"
};
```

Sync:

```sh
npx cap sync
```

Open iOS:

```sh
npx cap open ios
```

Open Android:

```sh
npx cap open android
```

## 9. iOS Build Steps

Requirements:

- macOS
- Xcode
- Apple Developer account for device/App Store release
- Capacitor iOS platform installed

Steps:

1. Run:

```sh
npx cap sync ios
```

2. Open Xcode:

```sh
npx cap open ios
```

3. In Xcode:

- Select the app project
- Set Bundle Identifier:

```txt
com.shahrukhi.learndari
```

- Set signing team
- Choose simulator or connected iPhone
- Press Run

4. Test:

- App launches
- All screens fit mobile
- Progress saves after closing app
- Quiz works
- Search works
- No horizontal overflow

5. For App Store:

- Add app icon
- Add launch screen
- Add privacy details
- Archive build
- Upload through Xcode Organizer

## 10. Android Build Steps

Requirements:

- Android Studio
- Android SDK
- Java/Kotlin toolchain through Android Studio
- Capacitor Android platform installed

Steps:

1. Run:

```sh
npx cap sync android
```

2. Open Android Studio:

```sh
npx cap open android
```

3. In Android Studio:

- Let Gradle sync
- Choose emulator or connected Android phone
- Press Run

4. Test:

- App launches
- Back button behavior is sensible
- Text does not overlap
- Progress persists
- Search and filters work
- Quiz works

5. For Play Store:

- Generate signed app bundle
- Add app icon
- Add feature graphic
- Complete Play Console listing
- Upload `.aab`

## 11. App Store Preparation

### App Name

Recommended:

```txt
Learn Dari
```

Possible subtitle:

```txt
Beginner Afghan Persian
```

### App Description

Draft:

```txt
Learn Dari is a beginner-friendly app for studying useful Dari words, phrases, script, and conversation patterns. Practice greetings, questions, travel phrases, food words, verbs, and everyday expressions with searchable lessons and quick quizzes.
```

### Keywords

```txt
Dari, Afghan Persian, Afghanistan, language, learn Dari, Persian, phrases, vocabulary
```

### Privacy

For offline version:

- No account required
- No personal data collected
- Progress stored locally on device

If analytics or accounts are added later, privacy policy must be updated.

## 12. Testing Checklist

### Core Functionality

- App loads without server
- Lessons display
- Lesson completion saves
- Quiz starts
- Quiz answers show correct/incorrect feedback
- Quiz score saves
- Phrasebook search works
- Category filters work
- Progress stats update
- Progress persists after app restart

### Mobile Layout

- Works at 320px width
- Works on iPhone SE size
- Works on modern iPhone sizes
- Works on Android small screen
- Works on tablet
- No horizontal scroll
- Buttons are easy to tap
- Dari text is readable
- Long transliterations wrap cleanly

### Accessibility

- Buttons have readable labels
- Contrast is sufficient
- Text is not too small
- Inputs have labels
- RTL Dari text uses `dir="rtl"`
- App can be navigated with screen reader basics

### Content Quality

- Dari text displays correctly
- Transliteration is consistent
- Meanings are clear
- Notes are helpful
- No duplicate entries unless intentional
- Categories make sense

## 13. Delegation Plan For Multiple Agents

Use separate agents with clear ownership. Each agent should write down what files it changed and what it verified.

### Agent 1: Product Lead

Ownership:

- Product requirements
- User journey
- Feature priority
- Roadmap

Tasks:

- Define target learner
- Define first release scope
- Create user stories
- Decide what must be offline
- Decide what waits for v2

Deliverables:

- `PRODUCT_SPEC.md`
- Prioritized feature list
- Release criteria

### Agent 2: Content Lead

Ownership:

- Dari lessons
- Vocabulary
- Transliteration consistency
- Usage notes

Tasks:

- Review all 187 entries
- Fix unclear meanings
- Add missing categories
- Add more examples
- Create beginner/intermediate levels
- Prepare audio script

Deliverables:

- Clean `public/data/lessons.js`
- `CONTENT_GUIDE.md`
- Audio recording script

### Agent 3: Frontend Engineer

Ownership:

- HTML/CSS/JS app behavior
- Offline frontend
- Responsive UI

Tasks:

- Remove dependency on backend APIs
- Import local lesson data
- Add mobile bottom navigation
- Improve lesson detail flow
- Make progress screen
- Ensure app works directly from static files

Deliverables:

- Updated `public/`
- Offline-ready app
- Browser verification notes

### Agent 4: Storage Engineer

Ownership:

- Progress persistence
- Local storage schema
- Future migration path

Tasks:

- Create storage module
- Save completed lessons
- Save quiz history
- Save favorites later
- Add reset progress feature
- Document schema

Deliverables:

- `public/storage.js`
- `STORAGE_SCHEMA.md`
- Persistence tests/checklist

### Agent 5: Learning Systems Engineer

Ownership:

- Quiz logic
- Review logic
- Spaced repetition later

Tasks:

- Improve quiz generation
- Avoid repeated questions too often
- Track incorrect answers
- Add review queue
- Design spaced repetition model

Deliverables:

- `public/learning.js`
- Quiz logic documentation
- Review roadmap

### Agent 6: Mobile Engineer

Ownership:

- Capacitor setup
- iOS project
- Android project
- Native build testing

Tasks:

- Install Capacitor
- Add iOS and Android platforms
- Configure app ID
- Configure app name
- Verify app launches on simulator/emulator
- Document native build steps

Deliverables:

- `capacitor.config.js`
- `ios/`
- `android/`
- `MOBILE_BUILD_NOTES.md`

### Agent 7: Designer

Ownership:

- Visual system
- Mobile layout
- Interaction polish

Tasks:

- Define mobile layout rules
- Design bottom navigation
- Improve lesson cards
- Design progress screen
- Design empty states
- Design icon and launch screen direction

Deliverables:

- `DESIGN_SYSTEM.md`
- Updated CSS
- App icon concept
- Screen-by-screen design notes

### Agent 8: QA Engineer

Ownership:

- Testing
- Bug reports
- Release checklist

Tasks:

- Test web app
- Test iOS simulator
- Test Android emulator
- Test offline behavior
- Test progress persistence
- Test small screens

Deliverables:

- `QA_REPORT.md`
- Bug list
- Release approval checklist

## 14. How Agents Should Coordinate

Use this order:

1. Product Lead defines scope
2. Content Lead cleans content
3. Frontend Engineer makes app offline
4. Storage Engineer adds persistence
5. Learning Systems Engineer improves quiz/review
6. Designer improves mobile interface
7. Mobile Engineer packages with Capacitor
8. QA Engineer verifies everything

Rules:

- No agent should rewrite unrelated files
- Each agent must list changed files
- Each agent must preserve existing working behavior
- UI changes should be tested at mobile sizes
- Content changes should keep the same data shape
- Mobile packaging should happen after offline mode works

## 15. Version Roadmap

### Version 0.1: Current Web Prototype

Already done:

- Web app
- Lessons
- Quiz
- Phrasebook
- Progress API
- Expanded content

### Version 0.2: Offline Web App

Goal:

Works without Node server.

Features:

- Static lessons data
- Local progress
- Local quiz history
- Search and filters
- Mobile-friendly layout

### Version 0.3: Mobile Shell

Goal:

Runs on iOS and Android through Capacitor.

Features:

- Capacitor setup
- iOS project
- Android project
- App icon
- Launch screen
- Offline storage

### Version 0.4: Better Learning

Goal:

Make practice smarter.

Features:

- Flashcards
- Mistake review
- Favorite words
- Lesson-specific quiz
- Progress screen

### Version 0.5: Audio

Goal:

Teach pronunciation.

Features:

- Audio for key entries
- Play button per phrase
- Listening quiz
- Pronunciation notes

### Version 0.6: Spaced Repetition

Goal:

Help learners remember long-term.

Features:

- Review due queue
- Ease scores
- Last reviewed date
- Correct/incorrect history
- Daily review target

### Version 1.0: Store-Ready App

Goal:

Publishable iOS and Android app.

Features:

- Polished mobile UI
- Offline lessons
- Practice modes
- Progress tracking
- App icon
- Launch screen
- Privacy policy
- App Store screenshots
- Play Store screenshots

### Version 2.0: Cloud and Community

Goal:

Grow beyond one-device offline learning.

Possible features:

- User accounts
- Cloud progress sync
- Admin content editor
- More levels
- Native audio downloads
- Daily reminders
- Cultural notes
- Placement quiz

## 16. Suggested Immediate Next Tasks

Start with these, in order:

1. Move lesson data from `server.mjs` to `public/data/lessons.js`
2. Convert progress from API calls to `localStorage`
3. Verify app works without `node server.mjs`
4. Add mobile bottom navigation
5. Add Capacitor
6. Test in iOS simulator
7. Test in Android emulator

## 17. Definition Of A Cohesive First Mobile App

The first mobile release is cohesive when:

- The app opens directly on iOS and Android
- It does not need a server
- The learner can complete lessons
- The learner can practice quizzes
- Progress is saved locally
- The phrasebook is searchable
- The UI feels designed for a phone
- Dari text is readable and correctly right-to-left
- The app has an icon and launch screen
- There is a clear path for adding audio and review later

