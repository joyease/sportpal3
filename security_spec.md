# Security Specification: 愛動咖 SportPal

## Data Invariants
1. A Check-In or Sport Record must belong to the authenticated user who created it (`userId == request.auth.uid`).
2. Users can only read and write their own profile document.
3. Check-ins are public to read (for the home page discovery if needed, though currently the user requested private records, I'll stick to private for now as per "Your sports records and location information are only saved in this device" logic, but I'll move it to Cloud). Wait, the user said "After log-in, '打卡' page will show a map for user to reply its GPS".
4. Let's make Check-ins and Sport Records strictly private to the owner.

## The "Dirty Dozen" Payloads
1. **P1 (Identity Spoofing)**: Create a sport record with `userId` of another user.
2. **P2 (Identity Spoofing)**: Update someone else's sport record.
3. **P3 (State Poisoning)**: Create a record with a negative duration.
4. **P4 (State Poisoning)**: Create a record with a massive string in `notes` (>1000 chars).
5. **P5 (Identity Integrity)**: Set `id` field in document to mismatch the document ID.
6. **P6 (Type Safety)**: Set `lat` or `lng` to a string.
7. **P7 (Bypass Schema)**: Add a `isVerified: true` ghost field to a user profile.
8. **P8 (Unauthenticated Access)**: Read sport records without being logged in.
9. **P9 (Resource Exhaustion)**: Create 100,000 records in a single batch (protected by quotas, but rules should help).
10. **P10 (PII Leak)**: Read another user's email from the `users` collection.
11. **P11 (Admin Escalation)**: Attempt to write to a hypothetical `admins` collection.
12. **P12 (Orphaned Record)**: Create a check-in for a non-existent user.

## Test Runner (Conceptual)
The `firestore.rules.test.ts` would verify that all above attempts return `PERMISSION_DENIED`.
