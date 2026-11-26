# SUKNA (سُكنا) — RESTful API Architecture & Endpoint Specification

> **Document Version:** 2.0.0  
> **Protocol:** REST over HTTPS  
> **Base Path:** `/api/v1`  
> **Status:** Architectural Planning Baseline (Refined Business Logic & Security)

---

## 1. Global API Conventions

### 1.1. Standard Request Headers
- `Content-Type: application/json` (Required for all `POST`, `PUT`, `PATCH` mutation bodies).
- `Accept: application/json`
- `Cookie: sukna_token=<jwt>` (Transported automatically via browser credentials with `credentials: 'include'`).
- `X-Requested-With: XMLHttpRequest` (Custom header enforced for state-modifying endpoints as CSRF defense-in-depth).

### 1.2. Standard Response Envelope
All API responses follow a uniform, predictable JSON structure:

#### Success Envelope:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 36,
    "totalPages": 3
  }
}
```

#### Error Envelope:
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "email", "message": "Email is already registered." }
  ],
  "statusCode": 400
}
```

### 1.3. Standard Pagination & Filtering Constraints
- **Default Page:** `1`
- **Default Limit:** `12` items per page.
- **Maximum Limit:** Clamped at `50` items per page to prevent database denial-of-service.
- **Allowlisted Sorting Options (`sortBy`):**
  - `newest` (Default: `createdAt: -1`)
  - `price_asc` (`rentalPrice: 1`)
  - `price_desc` (`rentalPrice: -1`)

### 1.4. HTTP Status Code Conventions
- `200 OK`: Request succeeded.
- `201 Created`: Resource created successfully.
- `400 Bad Request`: Validation failure, invalid query parameter, or mismatched hierarchical relationships.
- `401 Unauthorized`: Missing, expired, or revoked authentication session.
- `403 Forbidden`: Authenticated user lacks authorization (e.g. non-admin accessing admin route, suspended user, unverified email).
- `404 Not Found`: Resource does not exist or has been soft-deleted.
- `409 Conflict`: Unique constraint violation (e.g. duplicate email, duplicate favorite).
- `422 Unprocessable Entity`: Business logic invariant failed (e.g. favoriting an unavailable/unpublished apartment).
- `429 Too Many Requests`: Rate limit threshold exceeded.
- `500 Internal Server Error`: Unhandled server exception.

---

## 2. Authentication & Identity Endpoints (`/api/v1/auth`)

### 2.1. `POST /api/v1/auth/register`
- **Access Level:** `[PUBLIC]`
- **Purpose:** Initiates regular user registration and dispatches a 6-digit email verification OTP.
- **Validation Rules:**
  - `fullName`: String, 3 to 100 characters.
  - `email`: Valid email format, lowercase, trimmed.
  - `password`: String, min 8 characters, must contain at least one uppercase letter, one lowercase letter, and one number.
  - `confirmPassword`: Must match `password`.
- **Request Body:**
  ```json
  {
    "fullName": "محمود أحمد",
    "email": "mahmoud.ahmed@example.com",
    "password": "StrongPassword123!",
    "confirmPassword": "StrongPassword123!"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "تم إنشاء الحساب بنجاح. تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني.",
    "data": {
      "email": "mahmoud.ahmed@example.com",
      "expiresInSeconds": 300
    }
  }
  ```

---

### 2.2. `POST /api/v1/auth/verify-email`
- **Access Level:** `[PUBLIC]`
- **Purpose:** Validates the 6-digit OTP code and marks user account as verified (`isVerified: true`).
- **Validation Rules:**
  - `email`: Required, valid email.
  - `code`: Exactly 6 numeric digits (preserves leading zeros, e.g. `"049182"`).
- **Request Body:**
  ```json
  {
    "email": "mahmoud.ahmed@example.com",
    "code": "049182"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "تم تفعيل بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.",
    "data": { "isVerified": true }
  }
  ```
- **Errors:**
  - `400 Bad Request`: Invalid code, expired code, or maximum attempts exceeded (5 failed attempts).

---

### 2.3. `POST /api/v1/auth/resend-verification`
- **Access Level:** `[PUBLIC]`
- **Purpose:** Invalidates existing pending verification code and issues a fresh 6-digit OTP (enforces 60-second cooldown).
- **Request Body:** `{ "email": "mahmoud.ahmed@example.com" }`
- **Response (200 OK):** `{ "success": true, "message": "تم إعادة إرسال رمز التحقق الجديد." }`
- **Errors:** `429 Too Many Requests` if cooldown timer is active.

---

### 2.4. `POST /api/v1/auth/login`
- **Access Level:** `[PUBLIC]`
- **Purpose:** Authenticates user or administrator credentials, validates account state, and sets an HttpOnly JWT cookie.
- **Request Body:**
  ```json
  {
    "email": "mahmoud.ahmed@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response (200 OK):**
  *Sets HttpOnly cookie `sukna_token` with `Path=/; HttpOnly; SameSite=Lax; Secure` (in production)*
  ```json
  {
    "success": true,
    "message": "تم تسجيل الدخول بنجاح.",
    "data": {
      "user": {
        "id": "65b9a8f2...",
        "fullName": "محمود أحمد",
        "email": "mahmoud.ahmed@example.com",
        "role": "user",
        "isVerified": true
      }
    }
  }
  ```
- **Errors:**
  - `401 Unauthorized`: Invalid email or password.
  - `403 Forbidden`: Account is unverified (`isVerified: false`) or administratively deactivated (`isActive: false`).

---

### 2.5. `POST /api/v1/auth/logout`
- **Access Level:** `[AUTHENTICATED: user, admin]`
- **Purpose:** Clears session cookie on client and increments `user.tokenVersion` in the database to invalidate all active JWT sessions across all devices.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "تم تسجيل الخروج بنجاح."
  }
  ```

---

### 2.6. `GET /api/v1/auth/me`
- **Access Level:** `[AUTHENTICATED: user, admin]`
- **Purpose:** Returns profile of current authenticated session.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "65b9a8f2...",
        "fullName": "محمود أحمد",
        "email": "mahmoud.ahmed@example.com",
        "role": "user",
        "isVerified": true
      }
    }
  }
  ```

---

### 2.7. `POST /api/v1/auth/forgot-password`
- **Access Level:** `[PUBLIC]`
- **Purpose:** Triggers password recovery OTP. Dispatches 6-digit code if email exists. Returns a generic success response to prevent email enumeration.
- **Request Body:** `{ "email": "mahmoud.ahmed@example.com" }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "إذا كان البريد الإلكتروني مسجلاً لدينا، فسيصلك رمز إعادة تعيين كلمة المرور."
  }
  ```

---

### 2.8. `POST /api/v1/auth/verify-reset-code`
- **Access Level:** `[PUBLIC]`
- **Purpose:** Verifies reset OTP code and returns an ephemeral reset ticket token (valid for 10 minutes) for password submission.
- **Request Body:** `{ "email": "mahmoud.ahmed@example.com", "code": "938210" }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": { "resetToken": "rst_9f82bc10..." }
  }
  ```

---

### 2.9. `POST /api/v1/auth/reset-password`
- **Access Level:** `[PUBLIC (Requires Valid Reset Token)]`
- **Purpose:** Commits new password, invalidates all existing user sessions by incrementing `tokenVersion`, and deletes reset ticket.
- **Request Body:**
  ```json
  {
    "email": "mahmoud.ahmed@example.com",
    "resetToken": "rst_9f82bc10...",
    "newPassword": "NewStrongPassword123!",
    "confirmNewPassword": "NewStrongPassword123!"
  }
  ```

---

### 2.10. `POST /api/v1/auth/change-password`
- **Access Level:** `[AUTHENTICATED: user, admin]`
- **Purpose:** Allows logged-in user or admin to update password upon supplying current password.
- **Request Body:**
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewStrongPassword123!",
    "confirmNewPassword": "NewStrongPassword123!"
  }
  ```

---

## 3. Geographic Coverage Endpoints (`/api/v1/locations`)

### 3.1. `GET /api/v1/locations/tree`
- **Access Level:** `[PUBLIC]`
- **Purpose:** Returns the active 3-tier geographic tree (`Governorates` $\to$ `Cities` $\to$ `Areas`) for public search dropdowns.
- **Filter Constraint:** Only returns documents where `isActive === true`.
- **Response (200 OK):** Nested array of active governorates with populated active child cities and areas.

---

### 3.2. `GET /api/v1/locations/admin/all`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Returns complete location catalog including deactivated items and counts of attached buildings.
- **Query Params:** `?type=governorate|city|area&parentId=...`

---

### 3.3. `POST /api/v1/locations`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Create a new geographic tier item.
- **Validation Rules:**
  - `type`: Enum `['governorate', 'city', 'area']`.
  - If `type === 'governorate'`: `parentId` must be `null`.
  - If `type === 'city'`: `parentId` must point to an existing `governorate`.
  - If `type === 'area'`: `parentId` must point to an existing `city`.
- **Request Body:**
  ```json
  {
    "nameAr": "قنا",
    "nameEn": "Qena",
    "type": "governorate",
    "parentId": null,
    "displayOrder": 1
  }
  ```

---

### 3.4. `PATCH /api/v1/locations/:id`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Update display names, `displayOrder`, or toggle `isActive`.
- **Audit:** Records `LOCATION_TIER_UPDATED` or `LOCATION_TIER_TOGGLED` in `audit_logs`.

---

## 4. Buildings Endpoints (`/api/v1/buildings`)

### 4.1. `GET /api/v1/buildings`
- **Access Level:** `[PUBLIC]`
- **Purpose:** Retrieve paginated list of active, unarchived, non-deleted buildings.
- **Query Params (Allowlisted):**
  - `page`: Integer $\ge 1$, default 1.
  - `limit`: Integer 1 to 50, default 12.
  - `governorateId`: Valid ObjectId.
  - `cityId`: Valid ObjectId.
  - `areaId`: Valid ObjectId.
- **Response (200 OK):** Paginated buildings list with populated location names.

---

### 4.2. `GET /api/v1/buildings/:id`
- **Access Level:** `[PUBLIC]`
- **Purpose:** Retrieve building details, Google Maps external link, and a list of published, available apartments inside.

---

### 4.3. `POST /api/v1/buildings`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Create a new physical building.
- **Hierarchy Validation:** Backend validates that `governorateId`, `cityId`, and `areaId` match the actual tree hierarchy. Inconsistent combinations are rejected with HTTP 400.
- **Request Body:**
  ```json
  {
    "name": "برج الصفا 3",
    "description": "مبنى سكني حديث بجوار جامعة جنوب الوادي",
    "mainImage": "https://res.cloudinary.com/sukna/image/upload/.../bldg1.webp",
    "mainImagePublicId": "sukna/buildings/bldg1",
    "additionalImages": [],
    "additionalImagePublicIds": [],
    "governorateId": "65b1...",
    "cityId": "65b2...",
    "areaId": "65b3...",
    "streetAddress": "شارع الجامعة - أمام بوابة كلية التجارة",
    "googleMapsUrl": "https://maps.app.goo.gl/example456"
  }
  ```

---

### 4.4. `PUT /api/v1/buildings/:id`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Update building details or location hierarchy.

---

### 4.5. `PATCH /api/v1/buildings/:id/archive`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Toggle building `isArchived` state.
- **Behavior:** Archiving prevents adding new apartments and suppresses the building and its apartments from public discovery, but strictly preserves all historical records.

---

### 4.6. `DELETE /api/v1/buildings/:id`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Soft-deletes building (`isDeleted: true`, `deletedAt: Date.now()`).
- **Validation:** Rejected with HTTP 400 if building contains active, published apartments that have not yet been unpublished or reassigned.
- **Cascade Rule:** Zero cascade deletion of historical orders or payments.

---

## 5. Apartments Endpoints (`/api/v1/apartments`)

### 5.1. `GET /api/v1/apartments`
- **Access Level:** `[PUBLIC]`
- **Purpose:** Search and filter published, available apartments.
- **Public Visibility Enforcement:** Strictly executes query:
  `{ isDeleted: false, listingStatus: 'published', availabilityStatus: 'available' }` joined with active, unarchived buildings.
- **Security Invariant:** `ownerPhone` is **strictly stripped** from every result item.
- **Allowlisted Query Parameters:**
  - `page`: Number, default 1.
  - `limit`: Number, default 12, max 50.
  - `governorateId`, `cityId`, `areaId`: Valid ObjectIds.
  - `minPrice`, `maxPrice`: Numbers in EGP.
  - `rentalType`: Enum `['entire', 'shared', 'private_room']`.
  - `bedrooms`: Number (1 to 15).
  - `bathrooms`: Number (1 to 10).
  - `floor`: Number.
  - `furnishedStatus`: Enum `['furnished', 'semi_furnished', 'unfurnished']`.
  - `sortBy`: Enum `['newest', 'price_asc', 'price_desc']`.

---

### 5.2. `GET /api/v1/apartments/:id`
- **Access Level:** `[PUBLIC]`
- **Purpose:** Retrieve public apartment details, photos, specifications, and building context.
- **Security Invariant:** `ownerPhone` is **strictly excluded** from response.

---

### 5.3. `GET /api/v1/apartments/:id/contact`
- **Access Level:** `[AUTHENTICATED: user, admin]`
- **Purpose:** **CRITICAL PROTECTED ENDPOINT.** Discloses verified landlord contact information to authenticated seekers.
- **Prerequisites & Guardrails:**
  1. User must be authenticated (`requireAuth`).
  2. User's email must be verified (`user.isVerified === true`).
  3. User account must be active (`user.isActive === true`).
  4. Apartment must be valid: `isDeleted === false`, `listingStatus === 'published'`, and `availabilityStatus === 'available'`.
  5. Rate limit: Max 20 reveals per user per hour.
  6. Audit logging: Triggers an `audit_logs` entry with `action: 'CONTACT_INFO_REVEALED'`, recording `actorId`, `ipAddress`, and `targetId`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "apartmentId": "65c01a...",
      "ownerName": "الحاج مصطفى",
      "ownerPhone": "+201012345678",
      "displayPhone": "010 1234 5678",
      "whatsAppLink": "https://wa.me/201012345678?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D8%A7%D9%84%D8%B4%D9%82%D8%A9"
    }
  }
  ```
- **Anti-Scraping Disclaimer:**  
  *These layered defenses (authentication, email verification, rate limiting, and audit logging) significantly raise the cost of data harvesting and eliminate passive web scrapers, but cannot guarantee 100% prevention against determined manual scrapers.*

---

### 5.4. `POST /api/v1/apartments`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Create a new apartment listing.
- **Phone Formatting:** Validates and normalizes `ownerPhone` to E.164 international standard (`+20...`).
- **Initial State:** `listingStatus: 'pending'`, `availabilityStatus: 'available'`, `isDeleted: false`.

---

### 5.5. `PUT /api/v1/apartments/:id`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Update apartment details, pricing, photos, or description.

---

### 5.6. `PATCH /api/v1/apartments/:id/status`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Update listing workflow state (`pending`, `published`, `rejected`, `unpublished`).
- **Separation of Notes:** Separates public `rejectionReason` (sent to landlord if applicable) from confidential `internalAdminNotes`.
- **Request Body:**
  ```json
  {
    "listingStatus": "published",
    "rejectionReason": "",
    "internalAdminNotes": "Verified photos and agreed terms via WhatsApp."
  }
  ```

---

### 5.7. `PATCH /api/v1/apartments/:id/availability`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Toggle availability state (`available` vs. `rented`).
- **Request Body:** `{ "availabilityStatus": "rented" }`

---

### 5.8. `DELETE /api/v1/apartments/:id`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Soft-deletes apartment (`isDeleted: true`, `deletedAt: Date.now()`).
- **Integrity Rule:** Advertising orders and payment records for this apartment are strictly preserved.

---

## 6. Favorites Endpoints (`/api/v1/favorites`)

### 6.1. `GET /api/v1/favorites`
- **Access Level:** `[AUTHENTICATED: user only]`
- **Purpose:** Retrieve the authenticated user's bookmarked apartments.
- **Handling Inactive Items:** If an apartment in the favorites list was soft-deleted or unpublished, the endpoint flags it as unavailable rather than crashing.

---

### 6.2. `POST /api/v1/favorites/:apartmentId`
- **Access Level:** `[AUTHENTICATED: user only]`
- **Purpose:** Adds an apartment to user's saved list.
- **Validation:**
  - Target apartment must exist, have `isDeleted === false`, and have `listingStatus === 'published'`.
  - Adding unpublished or deleted properties returns HTTP 422 Unprocessable Entity.
  - Idempotent via compound unique index `{ userId: 1, apartmentId: 1 }`.

---

### 6.3. `DELETE /api/v1/favorites/:apartmentId`
- **Access Level:** `[AUTHENTICATED: user only]`
- **Purpose:** Removes an apartment from user's bookmarks.

---

## 7. Advertising Packages & Monetization (`/api/v1/monetization`)

### 7.1. `GET /api/v1/monetization/packages`
- **Access Level:** `[PUBLIC]`
- **Purpose:** Retrieve active advertising package options for public pricing transparency.

---

### 7.2. `POST /api/v1/monetization/packages`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Create a new package tier. (All prices are placeholders until commercially approved).

---

### 7.3. `PUT /api/v1/monetization/packages/:id`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Update package attributes. Note: modifying a package never modifies historical snapshots in existing orders.

---

### 7.4. `POST /api/v1/monetization/orders`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Create an advertising placement order for an apartment (supports renewals).
- **Snapshot Logic:** Copies `{ nameAr, nameEn, price, durationDays, benefits }` into `packageSnapshot`.
- **Initial State:** `orderStatus: 'pending'`, `paymentStatus: 'unpaid'`.
- **Request Body:**
  ```json
  {
    "apartmentId": "65c01a...",
    "packageId": "65b820...",
    "adminNotes": "30-day renewal placement negotiated via WhatsApp"
  }
  ```

---

### 7.5. `GET /api/v1/monetization/apartments/:apartmentId/orders`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Retrieve the full historical order log and renewals for a specific apartment.

---

### 7.6. `POST /api/v1/monetization/orders/:orderId/payments`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Record and confirm manual external settlement (InstaPay, Vodafone Cash, Bank Transfer).
- **Payment Invariants:**
  - One full settlement per order (`1:1`).
  - `amountPaid` must match `order.packageSnapshot.price`.
  - Transitions `paymentStatus` to `'paid'` and `orderStatus` to `'active'`.
  - Calculates `startDate = Date.now()` and `endDate = startDate + durationDays`.
- **Request Body:**
  ```json
  {
    "amountPaid": 250,
    "paymentMethod": "instapay",
    "externalTransactionRef": "IP-20261124-984102",
    "paidAt": "2026-11-24T14:30:00.000Z",
    "notes": "Transfer confirmed from account ending in 4102"
  }
  ```

---

## 8. Admin Back-Office & User Management (`/api/v1/admin`)

### 8.1. `GET /api/v1/admin/stats`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Aggregates live system statistics for dashboard overview KPI cards.

---

### 8.2. `GET /api/v1/admin/users`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Paginated, searchable directory of registered users and admins.

---

### 8.3. `PATCH /api/v1/admin/users/:id/status`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Activate or deactivate a user account.
- **Critical Self-Protection Guardrails:**
  1. An administrator **cannot deactivate their own account**.
  2. An administrator **cannot deactivate the last remaining active administrator** in the system.
  Attempting either returns `400 Bad Request` with an explicit safety error message.
- **Revocation Effect:** Deactivating a user immediately increments their `tokenVersion`, invalidating all active JWT sessions on next API access.

---

### 8.4. `GET /api/v1/admin/audit-logs`
- **Access Level:** `[ADMIN ONLY]`
- **Purpose:** Paginated, filtered query of administrative and security events.
- **Filters:** `?action=...&actorId=...&targetEntity=...&startDate=...&endDate=...`
