# Security Specification - Japan Explorer

## Data Invariants
- A Japan visit record must belong to a valid user.
- The `prefectureId` must be a valid ID from our data list.
- The `count` must be a valid number (1, 3, or 6 based on current implementation).

## The Dirty Dozen Payloads (Rejection Targets)
1. Unauthorized create: Create a visit for another user.
2. Unauthorized update: Change count of someone else's visit.
3. Invalid ID: Inject malicious strings into `prefectureId`.
4. Large Payload: Inject 1MB string into `notes`.
5. Spoofed Auth: Attempt write without `email_verified`.
6. Negative Count: Set `count` to -1.
7. Massive Count: Set `count` to 999999.
8. Orphaned Write: Write visit for non-existent user.
9. System Field Write: Attempt to overwrite `timestamp` with client time.
10. Blanket Read: Query all visits without filtering by email.
11. State Shortcut: Skip registration and write directly to visits.
12. Identity Spoof: Set `userEmail` to admin email.
