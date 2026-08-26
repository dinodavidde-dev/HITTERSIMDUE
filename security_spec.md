# Trauma Sim Director - Security Specification

## 1. Data Invariants
1. **Course State Invariant**: Only authenticated course coordinators/directors/faculty can update the live course state, timeline, timer, and schedule. Active day must be either 2 or 3.
2. **Broadcast Alerts Invariant**: Broadcast alerts must have a valid sender, valid alert type (`info`, `warning`, `emergency`, `phase_change`, `pause`), non-empty title/message, and boolean active status.
3. **Course Messages Invariant**: Field messages between faculty and direction must be structured, with valid sender role, content size within bounds, and explicit status (`pending` or `acknowledged`).
4. **Team Evaluations Invariant**: Evaluations must reference a valid team ID (1-12), course day (2 or 3), valid period, and all 5 ABCDE rubric scores must be numeric between 1 and 5.
5. **Simulator Patients Invariant**: Patient simulation records must be constrained to valid IDs (1-24), day (2 or 3), and period. Tech checklists must only be boolean values.
6. **Station Checklists Invariant**: Checklists must have valid string station IDs, valid day/period, and score between 0 and 100.
7. **Rosters Invariant**: Anagrafica collections (Discenti, Faculty, Technicians, Directors, Guests, Teams) must have valid ID strings, string lengths capped to prevent denial of wallet, and strict field typings.
8. **Immutability & Temporal Integrity**: Critical identifier fields cannot be tampered with or modified across entities.

---

## 2. The "Dirty Dozen" Payloads (Zero-Trust Validation)
1. **Unauthenticated Write to Course State**: Attempting to alter course day or start gate without authentication.
2. **Invalid Day in Course State**: Attempting to set `activeDay: 99`.
3. **Oversized Broadcast Alert**: An alert message with 50KB payload attempting Denial of Wallet.
4. **Invalid Broadcast Alert Type**: An alert with `type: 'hacked_exploit'`.
5. **Out of Range Evaluation Score**: Setting `scores.abcdeApproach: 15` instead of 1-5.
6. **Spoofed Author in Course Message**: Attempting to forge messages with invalid status or arbitrary data fields.
7. **Invalid Patient ID Injection**: Attempting to write a patient with malicious string ID or ID > 100.
8. **Shadow Field Injection on Discente**: Injecting an extra unauthorized field `isAdmin: true` into a student record.
9. **Negative Score in Station Checklist**: Attempting to set `readinessScore: -50`.
10. **Tampered Day on Evaluation**: Attempting to save an evaluation with `day: 5`.
11. **Malicious ID Characters**: Attempting to create a document with path containing `../` or invalid non-alphanumeric characters.
12. **Missing Mandatory Fields**: Attempting to create an evaluation without `scores` or `teamId`.

---

## 3. Test Runner Specification
All tests ensure that unauthorized or non-compliant writes return `PERMISSION_DENIED`.
