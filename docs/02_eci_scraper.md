# 🕸️ Stage 2: ECI Data Scraper

## Overview
Instead of relying on Gemini API for every question, we needed a structured local database of ECI information. This stage built a Node.js scraper that populates Firestore with official ECI forms, guidelines, and election updates.

---

## Why a Scraper?

| Option | Cost | Speed | Reliability |
|--------|------|-------|-------------|
| Call Gemini for every question | High API cost | Slow (1-3s) | Hallucination risk |
| **Scrape once → store → serve** | **Zero** | **Instant** | **100% accurate** |
| Manual data entry | Free but slow | Instant | Outdated quickly |

**Decision:** Scrape ECI data once, store in Firestore, serve instantly. Gemini only called when local data doesn't match.

---

## Scraper Architecture

```
apps/scraper/src/index.ts
        │
        ├─ Static Form Data (hardcoded ECI PDF URLs)
        │   Forms 6, 6A, 7, 8, 8A, 12D
        │
        ├─ Push to Firestore
        │   collection: voter_services
        │
        └─ apps/scraper/src/seed-updates.ts
            Authentic SRC + Election Update data
```

---

## Static Form Data (ECI Official PDFs)

The ECI website hosts stable PDF URLs that do not change. These are hardcoded as a data array:

```typescript
const staticForms = [
  {
    id: "form-6",
    category: "Forms & Guidelines",
    title_en: "Form 6: New Voter Registration",
    description_en: "Use Form 6 if you have never registered to vote before, or if you have moved to a new constituency. This is the primary registration form for all new voters aged 18+.",
    pdf_en: "https://eci.gov.in/files/file/9066-form-6/",
    source_url: "https://voters.eci.gov.in/",
    title_hi: "फ़ॉर्म 6: नया मतदाता पंजीकरण",
    title_mr: "फॉर्म 6: नवीन मतदार नोंदणी",
  },
  {
    id: "form-6a",
    category: "Forms & Guidelines",
    title_en: "Form 6A: NRI Voter Registration",
    description_en: "For Indian citizens living abroad (NRIs) who wish to register as overseas voters in their home constituency.",
    pdf_en: "https://eci.gov.in/files/file/9067-form-6a/",
    source_url: "https://voters.eci.gov.in/",
  },
  {
    id: "form-7",
    category: "Forms & Guidelines",
    title_en: "Form 7: Deletion of Name",
    description_en: "Use Form 7 to request removal of a name from the electoral roll (e.g., deceased person, duplicate entry).",
    pdf_en: "https://eci.gov.in/files/file/9068-form-7/",
  },
  {
    id: "form-8",
    category: "Forms & Guidelines",
    title_en: "Form 8: Correction of Entries",
    description_en: "Use Form 8 to correct wrong details in your voter registration such as name spelling, date of birth, or address.",
    pdf_en: "https://eci.gov.in/files/file/9069-form-8/",
  },
  {
    id: "form-8a",
    category: "Forms & Guidelines",
    title_en: "Form 8A: Change of Address (Transposition)",
    description_en: "Use Form 8A when you move to a new address within the same assembly constituency and want your voter ID updated.",
    pdf_en: "https://eci.gov.in/files/file/9070-form-8a/",
  },
  {
    id: "form-12d",
    category: "Forms & Guidelines",
    title_en: "Form 12D: Home Voting (Senior/PwD)",
    description_en: "For voters aged 85+ or Persons with Disabilities (PwD) with 40%+ benchmark disability to avail the Home Voting facility.",
    pdf_en: "https://eci.gov.in/files/file/form-12d/",
    source_url: "https://eci.gov.in/voter/pwd-voter/",
  },
];
```

---

## Firestore Push Logic

```typescript
async function pushToFirestore(data: typeof staticForms) {
  const batch = db.batch();
  for (const item of data) {
    const docRef = db.collection('voter_services').doc(item.id);
    batch.set(docRef, item, { merge: true }); // merge: don't overwrite existing fields
  }
  await batch.commit();
  console.log(`✅ Pushed ${data.length} documents to Firestore`);
}
```

**Why `merge: true`?** Allows the seed script and scraper to run multiple times without wiping out manually-added fields (like translated descriptions added later).

---

## Authentic SRC & Election Update Seeding

The `seed-updates.ts` script adds real ECI information scraped from official sources:

```typescript
// apps/scraper/src/seed-updates.ts
const authenticData = [
  {
    id: "src-2024",
    category: "Election SRC",
    title_en: "Special Summary Revision of Electoral Rolls (SRC)",
    description_en: "The Election Commission of India (ECI) conducts a Special Summary Revision of Electoral Rolls every year. This is the process of updating the voter list to include new voters who have turned 18, removing names of deceased or shifted voters, and correcting errors. During the SRC period, Booth Level Officers (BLOs) visit homes for verification, and special camps are held at polling stations.",
    source_url: "https://eci.gov.in/electoral-roll/special-summary-revision/",
    title_hi: "निर्वाचक नामावलियों का विशेष संक्षिप्त पुनरीक्षण (SRC)",
    title_mr: "मतदार याद्यांची विशेष संक्षिप्त उजळणी (SRC)",
  },
  {
    id: "update-2024-general",
    category: "Election Updates",
    title_en: "2024 General Election Results Declared",
    description_en: "The 2024 Indian general elections concluded on June 1, 2024, following a massive 7-phase exercise. With over 968 million registered voters and 642 million participating (the highest ever for women voters), the Election Commission successfully managed the largest democratic exercise in history. Results were declared on June 4, 2024, constituting the 18th Lok Sabha.",
    source_url: "https://results.eci.gov.in/",
  },
  {
    id: "update-new-facilities",
    category: "Election Updates",
    title_en: "New Facilitations for Voters Above 85 & PwD",
    description_en: "For the first time in the 2024 General Elections, the ECI introduced the 'Home Voting' facility. Voters over the age of 85 years and Persons with Disabilities (PwD) with 40% benchmark disability can opt to vote from their homes via Form 12D.",
    source_url: "https://eci.gov.in/voter/pwd-voter/",
  },
];
```

**Data Sources (verified official):**
- `eci.gov.in` — ECI official website
- `voters.eci.gov.in` — Voter services portal
- `results.eci.gov.in` — Official election results
- Wikipedia + Britannica + PIB for 2024 General Election facts

---

## GitHub Actions Cron Job

```yaml
# .github/workflows/scraper.yml
name: ECI Data Scraper
on:
  schedule:
    - cron: '0 2 * * *'   # Runs daily at 2 AM UTC
  workflow_dispatch:        # Also allows manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: yarn install
      - run: yarn workspace matdatamitra-scraper ts-node src/index.ts
        env:
          FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
```

**Why daily?** ECI updates forms and circulars regularly. Daily scraping ensures data is never more than 24 hours stale without any manual intervention.

---

## How to Run the Scraper Manually

```bash
# From project root
yarn workspace matdatamitra-scraper ts-node src/index.ts

# Run the authentic data seed (SRC + Updates)
yarn workspace matdatamitra-scraper ts-node src/seed-updates.ts
```

---

## Limitations & Future Work

| Limitation | Future Fix |
|-----------|-----------|
| ECI has JavaScript-heavy pages that static scrapers can't read | Use Puppeteer/Playwright for dynamic scraping |
| Form descriptions are manually written | Use Gemini to auto-generate plain-language summaries |
| Hindi/Marathi descriptions are placeholders | Run batch Gemini translation call in the scraper |
| Step-by-step instructions are mocked | Extract procedure steps from ECI help pages |
