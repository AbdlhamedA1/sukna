# SUKNA (سُكنا) — Open Product & Architecture Questions

> **Document Version:** 2.0.0  
> **Status:** Active Question Ledger (Genuinely Unresolved Decisions)  
> **Purpose:** Document trade-offs, pending business decisions, and architectural proposals awaiting consensus before development starts.

---

## Index of Open & Pending Decisions

| Item | Topic | Nature | Current Status | Recommended Direction |
| :---: | :--- | :---: | :---: | :--- |
| **01** | Transactional Email Provider Selection | Technical | **PENDING** | Evaluate Brevo for early sandbox testing |
| **02** | Commercial Pricing Schedule for Packages | Business | **PENDING** | Defer finalized prices; keep placeholders |
| **03** | Commercial Ad Expiration & Unpublish Policy | Business | **PENDING** | Automatic transition to unpublished upon expiration |
| **04** | Production Hosting & Domain Infrastructure | Technical / Infra | **PROPOSED / PENDING** | Purchase `sukna.com` for unified cookie sharing |
| **05** | Adoption of TypeScript Across All Apps | Engineering | **PROPOSED** | Standardize on TypeScript for type safety |
| **06** | Cloudinary Upload Architecture | Engineering | **PROPOSED** | Server-proxied streaming via Express in MVP |
| **07** | Session Revocation Implementation | Security | **PROPOSED** | Implement `tokenVersion` counter on User model |

---

## Detailed Item Breakdowns

### Item 01: Transactional Email Provider Selection
- **The Issue:** The platform requires reliable, instantaneous delivery of 6-digit OTP codes for account activation and password recovery.
- **Evaluated Options:**
  - **Brevo (formerly Sendinblue):** Established delivery infrastructure in Egypt and the Middle East; sandbox testing does not strictly require an immediate custom domain.
  - **Resend:** Modern developer experience and clean React-Email templates, but strictly requires a verified custom domain with configured SPF/DKIM/DMARC records.
- **Constraints & Risks:** Email delivery failure blocks user registration. Provider delivery limits must not be assumed without active verification.
- **Proposed Recommendation:** Begin with **Brevo** for early development and testing; re-evaluate when a production domain is purchased.
- **Status:** **PENDING Developer Approval**

---

### Item 02: Commercial Pricing Schedule for Advertising Packages
- **The Issue:** Advertising packages currently contain placeholder numbers (e.g., 100 EGP / 15 days, 250 EGP / 30 days, 500 EGP / 60 days).
- **Constraints:** Pricing depends on local market willingness-to-pay in Qena, Sohag, and Minya, and competitor rates (local brokers and Facebook groups).
- **Proposed Recommendation:** Keep all pricing numbers in database seeds and documentation explicitly tagged as **PLACEHOLDERS**. Admins can dynamically adjust package prices via the Dashboard once the commercial schedule is determined.
- **Status:** **PENDING Business Decision**

---

### Item 03: Commercial Listing Expiration & Publication Policy
- **The Issue:** What should happen to a published apartment when its paid advertising order reaches its `endDate`?
- **Options Under Consideration:**
  - **Option A (Strict Auto-Unpublish):** The system automatically toggles `listingStatus` to `'unpublished'`. Landlords must renew to reappear.
  - **Option B (Grace Period):** A 3-day grace period where the listing remains visible with a "Renew Soon" warning sent to the admin via dashboard notification.
  - **Option C (Standard Listing Fallback):** The listing remains published in standard search results but loses any "Featured" badges or top-ranked placement.
- **Status:** **PENDING Business Decision**

---

### Item 04: Production Hosting & Unified Domain Infrastructure
- **The Issue:** Browser third-party cookie restrictions block cookies between different eTLD+1 origins (e.g. `sukna-web.vercel.app` and `sukna-api.onrender.com`).
- **Proposed Architecture:** Deploy all services under a unified apex domain (`sukna.com`, `app.sukna.com`, `api.sukna.com`) with `Domain=.sukna.com` cookie attribute.
- **Fallback Consideration:** If hosting on free subdomains during early academic evaluation, a hybrid token transport (passing token in Authorization header) would be required.
- **Status:** **PROPOSED / PENDING Domain Decision**

---

### Item 05: Adoption of TypeScript Across All Applications
- **The Issue:** Formalizing whether TypeScript is adopted across all three monorepo packages (`apps/website`, `apps/dashboard`, `apps/server`).
- **Proposed Recommendation:** Adopt TypeScript universally. Shared interfaces for property schemas, API envelopes, and user roles eliminate contract mismatches between frontend and backend.
- **Status:** **PROPOSED (Awaiting Developer Confirmation)**

---

### Item 06: Cloudinary Upload Architecture (Server-Proxied vs. Direct Signed)
- **The Issue:** How property photographs are uploaded to Cloudinary CDN.
- **Proposed Recommendation:** Use **Server-Proxied Upload** in the MVP. Because only administrators upload images, traffic volume is low. Server-side handling allows binary magic-byte inspection, file size validation, and centralized asset tracking without client-side signature complexity.
- **Status:** **PROPOSED (Awaiting Developer Confirmation)**

---

### Item 07: Session Revocation Implementation (`tokenVersion`)
- **The Issue:** Stateless JWTs cannot be revoked simply by clearing client cookies.
- **Proposed Recommendation:** Implement the `tokenVersion` pattern. Incrementing `user.tokenVersion` in the database immediately invalidates existing JWTs on subsequent API calls, supporting secure logout and admin account deactivation.
- **Status:** **PROPOSED (Awaiting Developer Confirmation)**
