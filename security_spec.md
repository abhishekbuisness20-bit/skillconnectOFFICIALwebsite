# Security Specification & Threat Model for SkillConnect Official

## Data Invariants
1. **Global Catch-All Default Deny**: Every undefined collection and root documents are strictly denied.
2. **Path Sanitization**: All single document ID path variables `{id}` must conform to `isValidId()` (`id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).
3. **Public Inquiries & Activity Submissions**:
   - `contact_inquiries` and `activity_reports` can be created by visitors/users, but MUST adhere strictly to key allowlists (`hasAll` & `hasOnly`), length constraints, and server timestamp enforcement (`createdAt == request.time`).
   - Status MUST default to initial valid states ('pending' for contact inquiries, 'new' for activity reports).
   - Only admin users can read, update, or delete customer inquiries or activity reports. Blanket client listing is strictly forbidden.
4. **Service Provider Registrations**:
   - Providers can submit registration with valid data keys, bounded length fields, and server timestamps.
   - Status MUST default to 'pending_verification'.
   - Unauthenticated reads and blanket client listings are disallowed.
5. **PII Isolation & User Accounts**:
   - `/users/{userId}` can only be read and written by the authenticated owner where `request.auth.uid == userId`.
   - Blanket listing of users is forbidden.
   - `userId` field inside document must match `request.auth.uid`.
   - `createdAt` is immutable on update; `updatedAt` must equal `request.time`.

## The Dirty Dozen Payloads (Designed to Fail)
1. **Ghost Field Poisoning**: Writing `{ fullName, email, subject, message, status, createdAt, isAdmin: true }` to `/contact_inquiries/abc`.
   - Rejected by: `data.keys().hasOnly(...)`.
2. **ID Injection Attack**: Path variable `/contact_inquiries/../../../hack` or oversized 2KB ID string.
   - Rejected by: `isValidId(inquiryId)`.
3. **Client Timestamp Forgery**: Setting `createdAt: "1999-01-01T00:00:00Z"` instead of `request.time`.
   - Rejected by: `incoming().createdAt == request.time`.
4. **Status Escalation on Inquiry Create**: Creating inquiry with `status: "resolved"`.
   - Rejected by: `incoming().status == 'pending'`.
5. **Status Escalation on Provider Create**: Creating provider with `status: "approved"`.
   - Rejected by: `incoming().status == 'pending_verification'`.
6. **Cross-User Profile Read (PII Snooping)**: User B trying to `get /users/userA`.
   - Rejected by: `isOwner(userId)`.
7. **Cross-User Profile Overwrite**: User B trying to `set /users/userA`.
   - Rejected by: `isOwner(userId)`.
8. **Blanket List of Inquiries**: Public or unauthenticated client querying `getDocs(collection(db, 'contact_inquiries'))`.
   - Rejected by: `allow list: if false`.
9. **Blanket List of Users**: Authenticated user trying to scrape `/users`.
   - Rejected by: `allow list: if false`.
10. **Denial-of-Wallet Long String**: Injecting a 500,000 character string into `message`.
    - Rejected by: `data.message.size() <= 2000`.
11. **Immutable Key Mutation**: User updating their profile attempting to alter `userId` or `createdAt`.
    - Rejected by: `incoming().userId == existing().userId && incoming().createdAt == existing().createdAt`.
12. **Unauthorized Document Deletion**: Non-admin user attempting to delete a registered provider record.
    - Rejected by: `allow delete: if false` / `isAdmin()`.
