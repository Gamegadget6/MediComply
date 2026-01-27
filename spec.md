# Project: MediComply - Automated Compliance Scanner for Dental Clinics
# Goal: A Micro SaaS that scans a URL, detects missing privacy elements, and generates a lead-magnet report.

## 1. Core Functionality
- **Input:** User pastes a website URL (e.g., `drsmithdental.com`).
- **Process:**
  - The app launches a headless browser (Puppeteer/Playwright).
  - Checks for the presence of a "Cookie Consent" banner.
  - Checks for a link containing the text "Privacy Policy".
  - (Optional AI Layer): Scrapes the text of the Privacy Policy and asks GPT-4o: "Does this mention patient data handling?"
- **Output:** A "Pass/Fail" dashboard and a downloadable PDF report.

## 2. Tech Stack (Cursor Optimized)
- **Frontend:** Next.js 14 (App Router), Tailwind CSS.
- **UI Component Library:** ShadCN UI (Clean, medical aesthetic).
- **Backend/API:** Next.js Server Actions.
- **Scanner Engine:** Puppeteer (Node.js library for controlling Chrome).
- **Database:** Supabase (PostgreSQL) to store scan results and captured emails.
- **Email:** Resend API (to send the alert).

## 3. Data Structure (Supabase)
Table: `scans`
- id (uuid)
- url (string)
- has_cookie_banner (boolean)
- has_privacy_policy (boolean)
- contact_email (string)
- created_at (timestamp)

## 4. User Flow
1. **Landing Page:** Simple header "Is Your Clinic's Website HIPAA/GDPR Compliant?" + URL Input Box.
2. **Loading State:** "Scanning [URL]... Checking for Cookie Banners... Checking Policy Links..." (Fake delay for perceived value).
3. **Results Gate:** "Scan Complete. We found 2 critical errors. Enter your email to view the report."
4. **Dashboard:** Shows Red X or Green Checkmarks for compliance items.

## 5. Design Guidelines
- Color Palette: Clinical Blue (#007AFF), White, and Warning Red.
- Typography: Inter or Roboto (Clean, professional).