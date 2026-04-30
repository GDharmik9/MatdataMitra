# 🖥️ Stage 4: Frontend Portal — Search & Dynamic Pages

## Overview
This stage transformed the frontend from a static marketing page into an interactive information portal. Users can now search ECI data in real-time, browse dedicated category pages, and follow interactive step-by-step guides.

---

## Homepage Redesign: Three-State UI

The homepage now has three distinct visual states:

```
State 1: Default (no search)
  → Shows hero section + "Everything You Need" feature grid (8 cards)
  → Search bar with keyword suggestion chips
  → "Ask AI Agent" button as fallback

State 2: Searching (query typed)
  → Feature grid disappears
  → Full-width search results appear in real-time
  → Each result: icon + title + category badge + description + action button
  → No results? → "Ask the AI Agent Instead" button

State 3: Result clicked
  → Navigates to /services/[id] for interactive guide
  → Or opens PDF directly in new tab (for form downloads)
```

---

## HomeContent Component

```tsx
// apps/frontend/src/components/HomeContent.tsx
"use client";

export default function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<VoterService[]>([]);

  // Real-time Firestore fetch on mount
  useEffect(() => {
    const db = getFirebaseDB();
    const q = query(collection(db, "voter_services"));
    getDocs(q).then(snapshot => {
      setServices(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Client-side filter — instant, no network call on search
  const filteredServices = services.filter(s =>
    s.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Search Bar + Keyword Chips + AI Fallback */}
      {/* Conditional render: feature grid OR search results */}
    </>
  );
}
```

**Key Design Decision:** Firestore data is fetched once on page load and filtered client-side. This makes search feel instant (no debouncing needed) and reduces Firestore read costs.

---

## Search Bar with Keyword Suggestion Chips

```tsx
{/* Keyword Suggestion Chips */}
<div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
  {["Form 6", "SRC", "Updates", "Address Change", "Voter ID"].map((keyword) => (
    <button
      key={keyword}
      type="button"
      onClick={() => setSearchQuery(keyword)}  // Instantly populates search
      style={{ padding: "5px 12px", borderRadius: "15px", border: "1px solid var(--border-color)" }}
    >
      {keyword}
    </button>
  ))}
</div>
```

**Why chips?** Remote users with limited literacy in English may not know what to type. Chips guide them to the most common queries.

---

## Full-Width Search Result Cards

When searching, results appear as large, descriptive full-width cards:

```tsx
<div style={{
  backgroundColor: "var(--card-bg)",
  padding: "1.5rem",
  borderRadius: "12px",
  border: "1px solid var(--border-color)",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
}}>
  {/* Icon + Title row */}
  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <span>{service.pdf_en ? "📄" : service.category === "Election Updates" ? "📰" : "📋"}</span>
    <h3>{service.title_en}</h3>
  </div>

  {/* Category badge */}
  <span className="category-badge">{service.category}</span>

  {/* Full description */}
  <p>{service.description_en}</p>

  {/* Contextual CTA */}
  {service.pdf_en
    ? <a href={service.pdf_en} target="_blank">Download Official PDF</a>
    : <Link href={`/services/${service.id}`}>View Information</Link>
  }
</div>
```

---

## Dynamic Service Pages: `/services/[id]`

Each ECI service gets its own interactive page:

```tsx
// apps/frontend/src/app/services/[id]/page.tsx
export default async function ServicePage({ params }: { params: { id: string } }) {
  // Fetch from Firestore server-side
  const docRef = doc(db, "voter_services", params.id);
  const docSnap = await getDoc(docRef);
  const service = { id: docSnap.id, ...docSnap.data() };

  return (
    <div className="service-page">
      <h1>{service.title_en}</h1>
      <p>{service.description_en}</p>

      {/* Official Links */}
      {service.source_url && (
        <a href={service.source_url} target="_blank">
          🏛️ View on Official ECI Website
        </a>
      )}
      {service.pdf_en && (
        <a href={service.pdf_en} target="_blank">
          📄 Download Official Form PDF
        </a>
      )}

      {/* Google Search Verified Link */}
      <a href={`https://www.google.com/search?q=${encodeURIComponent(service.title_en + " ECI")}`}>
        🔍 Verify on Google
      </a>
    </div>
  );
}
```

---

## Category Pages

Three dedicated pages for direct navigation:

### `/forms` — Download Forms
```tsx
// Filter: only items WITH a pdf_en link
const filtered = data.filter(s => !!s.pdf_en);
```

### `/guidelines` — Interactive Guides
```tsx
// Filter: all items WITHOUT a pdf_en link (interactive guides)
const filtered = data.filter(s => !s.pdf_en);
```

### `/updates` — Election Updates & SRC
```tsx
// Filter: Election Updates OR Election SRC category
const filtered = data.filter(s =>
  ["Election Updates", "Election SRC"].some(c => s.category.includes(c))
);
```

**Evolution of Filter Logic:**
1. **Attempt 1:** Used `s.category.includes("Forms & Guidelines")` — showed same items on both pages ❌
2. **Attempt 2:** Added `&& !s.pdf_en` condition — still empty because category names didn't match ❌  
3. **Attempt 3:** Changed to `!!s.pdf_en` for Forms and `!s.pdf_en` for Guidelines — works correctly ✅

---

## Reusable `CategoryList` Component

```tsx
// apps/frontend/src/components/CategoryList.tsx
export default function CategoryList({
  categoryFilter,
  title,
  description
}: {
  categoryFilter: string | string[]
  title: string
  description: string
}) {
  // Fetch all from Firestore, filter client-side
  // Renders full-width cards with appropriate CTAs
}
```

Used by all three category pages, keeping the rendering logic DRY.

---

## Firebase Client SDK Initialization

```typescript
// apps/frontend/src/lib/firebase.ts
let db: Firestore | null = null;

export function getFirebaseDB(): Firestore {
  if (db) return db;  // Singleton — only initialize once
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  return db;
}
```

**Why a function instead of a module-level variable?** Next.js may try to execute module code during static build on the server where `window` doesn't exist. The function pattern ensures Firebase only initializes in the browser.
