# 🗂️ Stage 5: Navigation & UI Overhaul

## Overview
As the portal grew from a single-page app to a multi-page information system, the existing Navbar (originally just Logo + Timeline/Verify/KYC links) needed a complete overhaul to support the new portal structure.

---

## Navbar Evolution

### Before (Original)
```
🗳️ MatdataMitra | Timeline | Verify | KYC | [Login]
```

### After (Portal)
```
🗳️ MatdataMitra | Home | Forms | Guidelines | Updates | [Language ▼] | [Login]
```

**Why remove Timeline/Verify/KYC?**
- Those were features from the AI-heavy version of the app
- The current priority is the information portal (ECI data + search)
- They can be re-added later as secondary features

---

## Sticky vs. Non-Sticky Decision

**User request:** "Don't make it sticky"  
**Reason:** On mobile (small screens), a sticky navbar takes up precious vertical space that the content needs. Since the portal is primarily informational (users read, scroll down), it's better to let the navbar scroll away.

```css
/* Before */
.navbar {
  position: sticky;
  top: 0;
}

/* After */
.navbar {
  position: relative;
  top: 0;
}
```

---

## Google Translate — Three-Attempt Journey

### Attempt 1: Default Google Widget (FAIL)
**What we tried:** Directly render the Google Translate widget in the Navbar.  
**Problem:** Google's widget injects its own `<iframe>` and CSS that can expand to full-width, completely breaking the Navbar layout and pushing the entire page down.

```tsx
// Problem: Google's widget takes over the UI
<div id="google_translate_element"></div>
// Google injects: position:fixed iframe that moves the body down 40px
```

### Attempt 2: Custom Dropdown + DOM Event Proxy (FAIL)
**What we tried:** Hide the Google widget with `display:none` and build a custom `<select>`. On change, find the hidden `.goog-te-combo` element and dispatch a `change` event to it.

```tsx
// The proxy approach
const googleSelect = document.querySelector(".goog-te-combo");
googleSelect.value = lang;
googleSelect.dispatchEvent(new Event("change", { bubbles: true }));
```

**Problem 1:** `display:none` prevents Google's JavaScript from fully initializing the widget. The `.goog-te-combo` element never gets created.  
**Problem 2:** Even with `visibility:hidden`, the event dispatch alone doesn't reliably trigger Google's internal translation listeners in all browsers.

### Attempt 3: Cookie-Based Translation (SUCCESS ✅)
**Root cause discovered:** Google Translate doesn't rely on DOM events for its language selection. It reads a **browser cookie** called `googtrans` on page load.

```
Cookie format: googtrans=/en/hi
               └── from English to Hindi
```

**Implementation:**
```typescript
function triggerGoogleTranslate(lang: string) {
  if (lang === "en") {
    // Clear cookie → reload → page is back in English
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=...; path=/; domain=" + window.location.hostname;
    window.location.reload();
    return;
  }

  // Set cookie for Google to read on next load
  document.cookie = `googtrans=/en/${lang}; path=/`;
  document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;

  // Try DOM approach first (if widget is ready)
  const googleSelect = document.querySelector(".goog-te-combo") as HTMLSelectElement;
  if (googleSelect) {
    googleSelect.value = lang;
    googleSelect.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    window.location.reload(); // Cookie already set, reload applies it
  }
}
```

**Why set cookie on two domains?** Google Translate sometimes requires the cookie on both `localhost` and `.localhost` (or the actual domain). Setting it both ways ensures maximum compatibility.

---

## CSS Override Strategy

Google Translate's injected CSS creates several unwanted effects. We override all of them:

```css
/* Hide the floating translation banner (the bar that appears at top of page) */
.skiptranslate,
.goog-te-banner-frame {
  display: none !important;
}

/* Prevent Google from pushing the body down 40px (their default behavior) */
body {
  top: 0px !important;
}

/* Hide the Google tooltip */
#goog-gt-tt {
  display: none !important;
}

/* Make .goog-te-gadget text invisible (it renders "Powered by Google") */
.goog-te-gadget {
  color: transparent !important;
  font-size: 0px !important;
}

/* Style the hidden combo if it ever becomes visible */
.goog-te-gadget .goog-te-combo {
  color: var(--text-primary) !important;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border-color);
  padding: 5px 10px;
  border-radius: 8px;
}
```

---

## The Hidden Widget Pattern

The Google Translate script **must be allowed to initialize** even if we don't show its UI. The trick is:

```tsx
<div
  id="google_translate_element"
  style={{
    // NOT display:none — that kills the script init
    // Use visibility:hidden + zero size instead
    position: "absolute",
    visibility: "hidden",
    width: 0,
    height: 0,
    overflow: "hidden"
  }}
/>
```

| CSS Property | Effect on Google Script Init |
|-------------|------------------------------|
| `display: none` | ❌ Script won't initialize |
| `opacity: 0` | ❌ Script still initializes but the widget CSS injects anyway |
| `visibility: hidden` + `width/height: 0` | ✅ Script initializes, no UI shown |

---

## Language Dropdown — Final Implementation

```tsx
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "or", label: "ଓଡ଼ିଆ (Odia)" },
  { code: "as", label: "অসমীয়া (Assamese)" },
  { code: "ur", label: "اردو (Urdu)" },
];
```

**State persistence across reloads:**
```typescript
// On mount, read current language from cookie so dropdown stays in sync
useEffect(() => {
  const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
  if (match && match[1] !== "en") {
    setSelectedLanguage(match[1]);
  }
}, []);
```
