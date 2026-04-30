# 🌍 Stage 6: Multilingual Translation System

## Status: 🔄 In Progress (Cookie-based fix deployed, verifying stability)

---

## Overview
MatdataMitra targets voters across India who speak 22+ regional languages. This stage implements a zero-cost, instant translation system accessible to users regardless of their language.

---

## Language Options Evaluated

| Option | Cost | Setup Time | Languages | Accuracy | Decision |
|--------|------|-----------|-----------|----------|----------|
| Manual JSON translation files | $0 | Weeks | 3-5 | 100% | ❌ Too slow for hackathon |
| Gemini API per-request translation | ~$0.001/req | 1 day | 100+ | 95% | ❌ Too expensive at scale |
| Google Cloud Translation API | ~$0.02/char | 1 day | 100+ | 98% | ❌ Adds billing complexity |
| Bhashini (Govt India API) | $0 | 2-3 days | 22 | 90% | ❌ Complex auth/setup |
| **Google Translate Website Widget** | **$0** | **2 hours** | **109** | **92%** | **✅ Chosen** |

---

## How Google Translate Works on Websites

Google Translate's website widget works differently from their Translation API:

```
1. User visits page
2. Google's script checks browser for cookie: `googtrans=/en/hi`
3. If cookie found: Google's proxy fetches page content → translates → renders
4. If no cookie: page renders in English (default)
```

This means translation is applied at the **DOM level** — it replaces text nodes across the entire rendered page, including:
- Static JSX text
- Dynamically fetched Firestore data
- Button labels
- Error messages
- Everything visible

---

## Implementation Architecture

```
Browser
  │
  ├── GoogleTranslate.tsx (React Component)
  │     ├── Injects Google Translate script into <body>
  │     ├── Initialises hidden widget (#google_translate_element)
  │     └── Renders custom <select> dropdown
  │
  ├── User selects language (e.g., "हिन्दी")
  │
  ├── triggerGoogleTranslate("hi") is called
  │     ├── Sets cookie: googtrans=/en/hi
  │     ├── Tries DOM widget trigger (fast path)
  │     └── Falls back to page.reload() (cookie applied on reload)
  │
  └── Page reloads with googtrans cookie
        └── Google's script translates entire DOM → Hindi
```

---

## The `googtrans` Cookie

This is the core mechanism:

```
Cookie name:  googtrans
Cookie value: /en/hi       (from English, to Hindi)
Cookie path:  /            (applies to all pages)
```

**Why set it on two domains?**
```javascript
// Domain 1: localhost or the actual hostname
document.cookie = `googtrans=/en/${lang}; path=/`;

// Domain 2: .localhost or .domain.com (with dot prefix)
document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
```
Google's script checks cookies on both the exact hostname and the dot-prefixed domain. Setting both ensures the translation applies in all environments (local, staging, production).

---

## Cookie Read on Mount (Persistence)

When the user reloads the page after selecting Hindi, the React component reads the cookie and syncs the dropdown:

```typescript
useEffect(() => {
  const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
  if (match && match[1] && match[1] !== "en") {
    setSelectedLanguage(match[1]);  // Dropdown shows "हिन्दी (Hindi)"
  }
}, []);
```

Without this, the dropdown would reset to "English" every page load while the content is actually in Hindi — confusing the user.

---

## Resetting to English

```typescript
if (lang === "en") {
  // Clear the cookie in all possible forms
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
  window.location.reload();
  // Page reloads with no googtrans cookie → Google doesn't translate → English shown
}
```

---

## Supported Languages (13 currently shown)

| Code | Language | Native Script |
|------|----------|---------------|
| en | English | English |
| hi | Hindi | हिन्दी |
| mr | Marathi | मराठी |
| bn | Bengali | বাংলা |
| te | Telugu | తెలుగు |
| ta | Tamil | தமிழ் |
| gu | Gujarati | ગુજરાતી |
| kn | Kannada | ಕನ್ನಡ |
| ml | Malayalam | മലയാളം |
| pa | Punjabi | ਪੰਜਾਬੀ |
| or | Odia | ଓଡ଼ିଆ |
| as | Assamese | অসমীয়া |
| ur | Urdu | اردو |

> Google Translate supports all 22 Scheduled Indian languages — more can be added by adding entries to the `LANGUAGES` array.

---

## Known Limitations

| Issue | Status | Workaround |
|-------|--------|------------|
| Translation requires page reload (cookie mechanism) | Known | Acceptable UX for remote users |
| Google banner CSS override needed | Fixed | `.skiptranslate { display:none }` |
| Body offset fix needed | Fixed | `body { top: 0px !important }` |
| Google may throttle translation for heavy pages | Possible | No fix needed yet |
| `display:none` kills widget init | Fixed | Use `visibility:hidden` instead |

---

## Future Roadmap

### Phase 2: Bhashini Integration
The Government of India's [Bhashini API](https://bhashini.gov.in) provides:
- 22 official Indian language translations
- Speech-to-text in regional dialects
- Zero cost for government/civic projects

**Integration Plan:**
1. Register for Bhashini API key
2. Create `bhashini.service.ts` in backend
3. Replace Gemini TTS calls with Bhashini TTS for better regional accent support
4. Use Bhashini STT for improved voice input in rural dialects

### Phase 3: Server-Side Translation
Pre-translate Firestore documents into all 22 languages when scraping:
```typescript
// In scraper — translate description at data collection time
const description_hi = await translateWithGemini(description_en, "Hindi");
const description_te = await translateWithGemini(description_en, "Telugu");
// Store in Firestore: description_hi, description_te, description_ta, etc.
```
This removes the dependency on Google Translate widget entirely for content — only UI strings need translation.

### Phase 4: RTL Support for Urdu
Urdu is written right-to-left. Full Urdu support requires:
```css
[lang="ur"] { direction: rtl; text-align: right; }
```
And font support:
```html
<link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap">
```
