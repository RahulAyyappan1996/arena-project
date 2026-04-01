# TASKS & DECISIONS

## Open Tasks
- [ ] Add explicit build/version badge in header for deployment confidence
- [ ] Extract `src/App.tsx` into modular views/components
- [ ] Add query SLA analytics (median close time, escalation trends)
- [ ] Add signer matrix by role for TMF docs (PI/DM/Sponsor requirements)
- [ ] Add saved DataHub review presets by role

## In-Progress
- [ ] Arena deployment stability and cache hygiene checks

## Completed Tasks
- [x] Re-established full 6-step lifecycle flow
- [x] Embedded FARO in Setup after ingestion
- [x] Implemented CRF-first manager and schedule gating
- [x] Implemented CRF-aware edit checks and custom function composer
- [x] Added formula and natural-language draft logic support
- [x] Added multi-form custom logic (`+ Add Form`)
- [x] Added bulk rule approval in edit checks
- [x] Added AI Align All in setup and edit-check stages
- [x] Implemented expanded TMF package + assign/sign workflow
- [x] Implemented study-specific TMF with Study Name column
- [x] Added signature queue and go-live gate
- [x] Added Phase 2 DataHub and QueryManager
- [x] Added role-gated Phase 2 tabs (Enrollment/Data Entry CRA+CRC only)
- [x] Restored DM chronological data review view in DataHub
- [x] Added global CMD+K command palette
- [x] Added merged `Insights & Faro Predict` intelligence module
- [x] Added dark/light mode controls with schedule options
- [x] Set global font to Times New Roman

## Key Decisions

### D-001
- Decision: Lifecycle state machine is the top-level control surface.
- Why: Ensures compliance-style stage gates are always visible and testable.

### D-002
- Decision: FARO is a Setup sub-system, not app root.
- Why: Matches real startup workflow and prevents context loss.

### D-003
- Decision: Finalized CRFs are the single source of truth for schedule and checks.
- Why: Prevents drift between design and validation logic.

### D-004
- Decision: TMF is study-scoped and sign-off gated.
- Why: Live promotion must be document-complete per study.

### D-005
- Decision: Enrollment and entry permissions limited to CRA/CRC.
- Why: Mirrors site-owned source data capture model.

### D-006
- Decision: DM gets chronological review lens in DataHub.
- Why: DM review is visit-sequenced and audit-driven, not only aggregate.

### D-007
- Decision: Query management uses realistic lifecycle states and aging.
- Why: Reflects Oracle/Rave/Vault style operational CDM workflows.

### D-008
- Decision: Keep interactions mock-data based for pilot velocity.
- Why: Demo-first validation before backend investments.

### D-009
- Decision: Intelligence naming unified to `Insights & Faro Predict`.
- Why: Avoid feature duplication and reduce user confusion.

## Change Control Note
For each major feature change, update:
1. What changed
2. Why it changed
3. How it was verified (`npm run build` and functional spot checks)
