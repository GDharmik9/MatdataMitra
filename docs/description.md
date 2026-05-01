# Project Description & Impact

## What is MatdataMitra?
MatdataMitra is a modern, responsive web application that democratizes access to electoral information. Rather than forcing users to navigate complex government websites or download heavy PDFs, MatdataMitra brings the information to them through a conversational AI assistant.

## Target Audience
1. **First-Time Voters (18-21 years):** Need guidance on how to submit Form 6 and acquire their EPIC card.
2. **Elderly Citizens & PwD Voters:** Require accessibility features (high contrast, voice output, home-voting guidelines).
3. **Rural & Non-English Speakers:** Rely on regional language support and voice-first interfaces to access information.
4. **General Public:** Citizens looking for quick information regarding candidate backgrounds (KYC) or polling booth locations.

## Key Features in Detail

### 1. The Omnipresent AI Chatbot
Available as a floating widget on all pages, the assistant is scoped *strictly* to Indian electoral data. It refuses non-electoral questions, ensuring it remains a focused utility rather than a general-purpose toy. 

### 2. Know Your Candidate (KYC) & Affidavit OCR
Before stepping into the polling booth, voters deserve to know who they are voting for. MatdataMitra allows users to search for candidates and instantly view a comprehensive summary of their:
- Educational Qualifications
- Declared Financial Assets & Liabilities
- Criminal Antecedents (highlighted with strict visual warnings)
- Party Affiliation

Furthermore, users can upload the actual candidate affidavit PDFs, which Gemini Vision analyzes and summarizes instantly.

### 3. AI Document Pre-Verifier
Form rejections are a massive barrier. Voters can now take a picture of their application form or supporting ID document. Gemini Vision processes the image and immediately flags illegible handwriting, missing signatures, or improper formatting *before* the user submits it to the official portal.

### 4. Democracy Defender Quiz
Civic education made engaging. A dynamically generated quiz (via Gemini JSON mode) tests users on electoral laws, voter rights, and polling procedures, providing immediate, gamified feedback to increase awareness.

### 5. Live ECI Data Integration
A dedicated Python scraper ensures MatdataMitra is never out of date. It continuously monitors official ECI domains and streams live announcements, press releases, and forms directly into the dashboard via Firestore.

### 6. Interactive Voter Journey
A visual, interactive roadmap that removes the anxiety of the voting process. It outlines exactly what a voter should expect:
1. Registration & Verification
2. Election Schedule Announcement
3. Campaigning & Candidate Scrutiny
4. Polling Day Preparations
5. Casting the Vote (EVM/VVPAT)
This journey is personalized dynamically via Gemini JSON generation based on the user's selected demographic profile.

### 7. Accessibility First (PwD)
Democracy is for everyone. MatdataMitra includes a dedicated Accessibility Panel allowing users to:
- Enable High-Contrast Modes (now fully integrated across all components)
- Scale typography
- Reduce CSS motion
- Utilize screen-reader optimized DOM elements with ARIA labels

## Social Impact
MatdataMitra aims to directly increase voter turnout by reducing the friction of registration and information retrieval. By simplifying the language and providing voice-first interactions, it bridges the digital divide and fosters a more informed, confident, and participating electorate.
