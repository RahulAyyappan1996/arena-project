# TASKS & DECISIONS

## Open Tasks
- [ ] Add explicit build/version badge in app header (example: `EDC-FARO-v1.x`)
- [ ] Create a compact stakeholder demo mode switch for scripted walkthroughs
- [ ] Add a lightweight in-app help overlay for each lifecycle phase
- [ ] Improve empty states for non-primary Faro sections (Objectives, Compare, etc.)

## In-Progress Tasks
- [ ] Stabilize deployment behavior across Arena preview sessions

## Completed Tasks
- [x] Restore full 6-step lifecycle flow
- [x] Embed FARO in Setup Phase instead of replacing the app shell
- [x] Preserve clickable navigation between lifecycle stages
- [x] Keep prototype backend-free with static JSON/state

## Key Decisions Log

### D-001
- Decision: Keep lifecycle flow as the top-level app state machine.
- Why: Prevent module-level screens (like FARO) from replacing required journey stages.

### D-002
- Decision: Place FARO after protocol ingestion in Setup Phase.
- Why: Matches clinical workflow and stakeholder expectation.

### D-003
- Decision: Use static mock data and click-driven transitions for pilot.
- Why: Faster stakeholder validation and lower implementation overhead.

### D-004
- Decision: Maintain red as platform primary, with role/category accents.
- Why: Keeps brand consistency while improving user-type clarity.

## Change Control Note
When adding new features, update this file with:
1. Task description
2. Decision (if architectural/product impact exists)
3. Verification method
