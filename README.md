# Automated Playwright based HackerNews validator

## ⚙️ Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. For a debug view or single run:

```bash
node index.js
```

3. To run the full test suite:

```bash
npx playwright test
```

---
##  Article Sorting Validation

**Goal:**  
Ensure the first 100 articles on [Hacker News – Newest](https://news.ycombinator.com/newest) are sorted from newest to oldest based on their age (e.g., "2 minutes ago").

### Two Implementations:

#### 🔹 Script Version: `index.js`

- Uses Playwright to:
  - Navigate to Hacker News
  - Collect at least 100 unique articles (clicking “More” as needed)
  - Parse their timestamps
  - Verify correct descending order (newest → oldest)

Run it with:

```bash
node index.js
```

#### 🔹 Test Version: `tests/hackernews.spec.js`

- Same logic as above, wrapped in a Playwright test using `@playwright/test`
- Uses `expect()` to assert that the article order is correct

Run with:

```bash
npx playwright test tests/hackernews.spec.js
```

---



## 🔧 Playwright Configuration

- Located in `playwright.config.js`
- Supports multiple browsers and devices
- Includes HTML reporter for test results
- Can run tests in parallel (except in CI)

---

## 🧼 Clean Submission

Before uploading:

- `.gitignore` ensures `node_modules` and other files are excluded
- This folder is zipped **without** `node_modules` to reduce size

---
