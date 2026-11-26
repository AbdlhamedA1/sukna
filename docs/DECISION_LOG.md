# SUKNA (سُكنا) — Architecture Decision Records (ADR) & Decision Log

> **Document Version:** 2.0.0  
> **Status:** Active Architectural Ledger  
> **Decision Status Categories:** `APPROVED`, `PROPOSED`, `PENDING`

---

## Index of Architectural Decisions & Recommendations

| ADR ID | Decision Title | Status | Date |
| :--- | :--- | :---: | :---: |
| **ADR-001** | Platform Brand Identity & Initial Geographic Scope | **APPROVED** | Nov 2026 |
| **ADR-002** | Selection of Monorepo with npm Workspaces | **APPROVED** | Nov 2026 |
| **ADR-003** | Frontend Stack Split (Next.js Website & React Vite Dashboard) | **APPROVED** | Nov 2026 |
| **ADR-004** | Exclusion of Self-Service Property Owner Accounts in MVP | **APPROVED** | Nov 2026 |
| **ADR-005** | Relational Separation of Physical Buildings and Apartments | **APPROVED** | Nov 2026 |
| **ADR-006** | External Google Maps Deep Links over Embedded Map SDKs | **APPROVED** | Nov 2026 |
| **ADR-007** | Independent Lifecycles for Listing, Availability, and Payment | **APPROVED** | Nov 2026 |
| **ADR-008** | Protected Server-Side Disclosure for Landlord Phone Numbers | **APPROVED** | Nov 2026 |
| **ADR-009** | Email-Based OTP Verification over SMS Gateways | **APPROVED** | Nov 2026 |
| **ADR-010** | Manual External Payment Verification (No Online Gateway in MVP) | **APPROVED** | Nov 2026 |
| **ADR-011** | Command-Line Seeding of Administrator Accounts | **APPROVED** | Nov 2026 |
| **ADR-012** | Immutable Package Snapshots & Apartment-Level Orders | **APPROVED** | Nov 2026 |
| **ADR-013** | Sequential Advertising Orders for Placements & Renewals | **APPROVED** | Nov 2026 |
| **ADR-014** | Mandatory RTK Query (Axios Strictly Prohibited) in Dashboard | **APPROVED** | Nov 2026 |
| **ADR-015** | Unified Brand Palette (Forest Green, Warm Orange, Warm Off-White) | **APPROVED** | Nov 2026 |
| **ADR-016** | End-to-End TypeScript Across All Subsystems | **PROPOSED** | Nov 2026 |
| **ADR-017** | State-Aware `tokenVersion` Database Session Revocation | **PROPOSED** | Nov 2026 |
| **ADR-018** | Unified Production Domain & Cross-Subdomain Cookie Strategy | **PROPOSED** | Nov 2026 |
| **ADR-019** | Server-Proxied Media Upload via Express to Cloudinary | **PROPOSED** | Nov 2026 |
| **ADR-020** | Transactional Email Provider Selection (Brevo vs. Resend) | **PENDING** | Nov 2026 |
| **ADR-021** | Commercial Pricing Schedule for Advertising Packages | **PENDING** | Nov 2026 |
| **ADR-022** | Commercial Listing Expiration & Publication Policy | **PENDING** | Nov 2026 |

---

## Detailed Architectural Decision Records

### ADR-001: Platform Brand Identity & Initial Geographic Scope
- **Status:** **APPROVED**
- **Context:** The platform targets university students and relocating residents in Upper Egypt.
- **Decision:** Officially name the platform **SUKNA (سُكنا)**. Launch initially across three strategic governorates: **Qena**, **Sohag**, and **Minya**, while engineering dynamic coverage in MongoDB to support future Egyptian governorates through the Admin Dashboard.
- **Consequences:** Provides clear regional product focus while preserving dynamic expansion capability.

---

### ADR-002: Selection of Monorepo with npm Workspaces
- **Status:** **APPROVED**
- **Context:** The project requires a public web app, an admin/user dashboard, and a central backend API developed by a solo engineer.
- **Decision:** Adopt standard npm workspaces inside a root repository (`apps/website`, `apps/dashboard`, `apps/server`). Avoid complex monorepo build tools (Turborepo, Nx, Lerna) that introduce steep configuration overhead.
- **Consequences:** Simple dependency management, atomic git commits, clear separation of frontend and backend codebases.

---

### ADR-003: Frontend Stack Split (Next.js Website & React Vite Dashboard)
- **Status:** **APPROVED**
- **Context:** The public website requires maximum SEO, indexability, and fast initial page loads for students searching on mobile devices. The dashboard requires complex data grids, drawers, modals, and rapid state management without SSR overhead.
- **Decision:** Use Next.js (App Router) for the public marketing & search website, and React.js + Vite with Ant Design for the authenticated Dashboard.
- **Consequences:** Maximizes SEO where it matters while providing a responsive, lightweight SPA development experience for administrative workflows.

---

### ADR-004: Exclusion of Self-Service Property Owner Accounts in MVP
- **Status:** **APPROVED**
- **Context:** Regional property owners in Upper Egypt often experience high friction with self-service software, resulting in incomplete listings and high onboarding drop-off.
- **Decision:** Adopt an admin-managed concierge onboarding model via WhatsApp. Administrators create, verify, and publish listings on behalf of landlords.
- **Consequences:** Eliminates an entire user-facing subsystem from the MVP (Owner Auth, Owner Dashboard, Listing Creation Wizard), streamlining scope while guaranteeing high listing authenticity.

---

### ADR-005: Relational Separation of Physical Buildings and Apartments
- **Status:** **APPROVED**
- **Context:** Many student apartments reside within the same physical building, sharing a street address, facade photo, and map coordinates.
- **Decision:** Model two distinct entities: `Building` ($1$) to `Apartment` ($N$).
- **Consequences:** Clean relational model, eliminates duplicate building data, allows students to view all available flats in a specific building.

---

### ADR-006: External Google Maps Deep Links over Embedded Map SDKs
- **Status:** **APPROVED**
- **Context:** Embedding Google Maps SDKs or Mapbox tiles requires billing accounts, API keys, adds heavy client JavaScript bundles, and risks unexpected API billing spikes.
- **Decision:** Store and expose verified Google Maps URLs opened externally (`target="_blank"`, `rel="noopener noreferrer"`).
- **Consequences:** Zero API costs, zero bundle bloat, maximum reliability across mobile devices where the native Google Maps app opens directly.

---

### ADR-007: Independent Lifecycles for Listing, Availability, and Payment
- **Status:** **APPROVED**
- **Context:** Real-world operations require approving listings before payment arrives, unpublishing a listing temporarily for repairs during an active ad, or marking a listing as rented.
- **Decision:** Strictly decouple `listingStatus` (`pending`, `published`, `rejected`, `unpublished`), `availabilityStatus` (`available`, `rented`), `paymentStatus` (`unpaid`, `paid`), and building operational state (`isActive`, `isArchived`).
- **Consequences:** Full administrative flexibility without business logic deadlocks.

---

### ADR-008: Protected Server-Side Disclosure for Landlord Phone Numbers
- **Status:** **APPROVED**
- **Context:** Publicly exposing landlord phone numbers invites automated web scrapers, cold callers, and telemarketing spam.
- **Decision:** Filter `ownerPhone` out of all public APIs. Disclose it only via `GET /api/v1/apartments/:id/contact` requiring an authenticated, email-verified user session, protected by rate limiting and audit logging.
- **Consequences:** Reduces automated scraping, protects landlord privacy, and drives user registration. *Caveat: Raises harvesting cost significantly but cannot completely prevent manual transcription by determined individuals.*

---

### ADR-009: Email-Based OTP Verification over SMS Gateways
- **Status:** **APPROVED**
- **Context:** Phone-based SMS verification incurs recurring gateway costs, regulatory approvals, and sender-ID registration delays in Egypt.
- **Decision:** Standardize on 6-digit email OTP verification for account activation and password recovery during the MVP.
- **Consequences:** Zero per-message telecommunications cost; streamlined student onboarding.

---

### ADR-010: Manual External Payment Verification (No Online Gateway in MVP)
- **Status:** **APPROVED**
- **Context:** Integrating local Egyptian payment gateways (Paymob, Fawry, Kashier) introduces complex merchant onboarding, commercial registration requirements, and transaction fees during initial discovery.
- **Decision:** Support external manual payment methods (InstaPay, Vodafone Cash, Bank Transfer). Administrators manually verify transactions and toggle payment status.
- **Consequences:** Eliminates payment gateway dependencies, compliance overhead, and complex webhook reconciliations for the MVP.

---

### ADR-011: Command-Line Seeding of Administrator Accounts
- **Status:** **APPROVED**
- **Context:** Public admin registration invites unauthorized privilege escalation if validation endpoints have subtle vulnerabilities.
- **Decision:** Prohibit admin registration via public APIs. Admin accounts are seeded exclusively via an offline CLI script (`seedAdmin.ts`) reading `.env` secrets.
- **Consequences:** Eliminates public registration attack vectors. Admin security relies on host security, strong credentials, and auditing.

---

### ADR-012: Immutable Package Snapshots & Apartment-Level Orders
- **Status:** **APPROVED**
- **Context:** Advertising packages are managed dynamically. If an admin edits a package price or duration, past orders must not mutate.
- **Decision:** Copy an immutable frozen JSON snapshot of the package into the `AdvertisingOrder` at booking time. In the MVP, advertising packages apply at the Apartment level.
- **Consequences:** Guarantees historical financial integrity and auditability.

---

### ADR-013: Sequential Advertising Orders for Placements & Renewals
- **Status:** **APPROVED**
- **Context:** Landlords renew property listings over time. Modeling an apartment with only one lifetime order breaks renewal tracking.
- **Decision:** Model a $1:N$ relationship between `Apartment` and `AdvertisingOrder`. Renewing an advertisement generates a fresh order document with a new package snapshot.
- **Consequences:** Supports full renewal history and cumulative monetization reporting per property.

---

### ADR-014: Mandatory RTK Query (Axios Strictly Prohibited) in Dashboard
- **Status:** **APPROVED**
- **Context:** Multiple competing data fetching libraries create inconsistent caching, token injection bugs, and duplicate state stores.
- **Decision:** Enforce Redux Toolkit Query (RTK Query) for all data fetching, caching, and mutations in `apps/dashboard`. Axios is explicitly disallowed.
- **Consequences:** Declarative cache invalidation (`providesTags`), standardized loading/error states, zero redundant boilerplate.

---

### ADR-015: Unified Brand Palette (Forest Green, Warm Orange, Warm Off-White)
- **Status:** **APPROVED**
- **Context:** Generic template visuals damage marketplace credibility in residential real estate.
- **Decision:** Adopt Deep Forest Green (`#123B35`) as primary brand anchor, Warm Orange (`#E88A35`) for high-priority CTAs and accents, Warm Off-White (`#F7F5F0`) for comfortable backgrounds, Charcoal (`#252B28`) for typography, White (`#FFFFFF`) for surfaces, and **Inter** as the default interface font (English LTR primary, with Arabic RTL as a future compatibility requirement).
- **Consequences:** Distinctive, trustworthy, warm aesthetic tailored specifically to Egyptian housing.

---

### ADR-016: End-to-End TypeScript Across All Subsystems
- **Status:** **PROPOSED**
- **Context:** Type safety prevents runtime property bugs and synchronizes data contracts across frontend and backend.
- **Recommendation:** Implement TypeScript across `apps/website`, `apps/dashboard`, and `apps/server`.
- **Status Note:** Awaiting final developer confirmation before repository initialization.

---

### ADR-017: State-Aware `tokenVersion` Database Session Revocation
- **Status:** **PROPOSED**
- **Context:** Stateless JWTs cannot be revoked simply by clearing a client cookie.
- **Recommendation:** Add `tokenVersion: Number` to the User schema and embed it in JWT claims. Incrementing `tokenVersion` on logout, password reset, or admin suspension terminates active sessions immediately.
- **Status Note:** Proposed as the standard session invalidation mechanism for the MVP.

---

### ADR-018: Unified Production Domain & Cross-Subdomain Cookie Strategy
- **Status:** **PROPOSED**
- **Context:** Browser third-party cookie restrictions block cross-site cookies between unrelated free-tier domains.
- **Recommendation:** Deploy under a unified apex domain (`sukna.com` for Website, `app.sukna.com` for Dashboard, `api.sukna.com` for API) with cookie domain set to `.sukna.com`.
- **Status Note:** Proposed architecture; pending domain purchase and hosting setup.

---

### ADR-019: Server-Proxied Media Upload via Express to Cloudinary
- **Status:** **PROPOSED**
- **Context:** Property images need to be uploaded to Cloudinary CDN with format and size validation.
- **Recommendation:** Use a server-proxied upload flow where the Express backend inspects binary magic bytes, enforces a 5MB size cap, and streams to Cloudinary.
- **Status Note:** Proposed for initial MVP simplicity; direct signed uploads remain an alternative.

---

### ADR-020: Transactional Email Provider Selection (Brevo vs. Resend)
- **Status:** **PENDING**
- **Context:** 6-digit OTP delivery requires a reliable transactional email service.
- **Status Note:** Brevo is evaluated as the initial prototyping option. Awaiting developer evaluation and account configuration.

---

### ADR-021: Commercial Pricing Schedule for Advertising Packages
- **Status:** **PENDING**
- **Context:** Pricing figures in documentation (e.g. 100, 250, 500 EGP) are illustrative examples.
- **Status Note:** All price numbers are explicit placeholders pending commercial and market consensus.

---

### ADR-022: Commercial Listing Expiration & Publication Policy
- **Status:** **PENDING**
- **Context:** Business policy is needed for handling listings when an advertising order expires (e.g. auto-unpublish vs. grace period vs. badge downgrade).
- **Status Note:** Awaiting business stakeholder decision.
