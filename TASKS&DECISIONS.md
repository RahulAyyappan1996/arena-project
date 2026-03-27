# TASKS & DECISIONS

## Open Tasks
- [ ] Add explicit build/version badge in app header (example: `EDC-FARO-v1.x`)
- [ ] Create a compact stakeholder demo mode switch for scripted walkthroughs
- [ ] Add a lightweight in-app help overlay for each lifecycle phase
- [ ] Improve empty states for non-primary Faro sections (Objectives, Compare, etc.)
- [ ] Add import/export for reusable rule templates (edit checks and custom functions)
- [ ] Add therapeutic-area-specific CRF libraries (oncology/cardiology/endocrine packs)

## In-Progress Tasks
- [ ] Stabilize deployment behavior across Arena preview sessions

## Completed Tasks
- [x] Restore full 6-step lifecycle flow
- [x] Embed FARO in Setup Phase instead of replacing the app shell
- [x] Preserve clickable navigation between lifecycle stages
- [x] Keep prototype backend-free with static JSON/state
- [x] Add CRF field label/type controls in Case Report Form Manager
- [x] Make edit checks CRF-aware based on finalized FARO CRFs
- [x] Add custom function builder for cross-form logic at edit-check stage
- [x] Add formula-based rule composition with `@FieldLabel` syntax
- [x] Add plain-English AI draft for edit checks/custom functions
- [x] Link FARO study-definition CRF templates to CRF Manager and Edit Checks
- [x] Move CRF Manager before Schedule of Activities in Study Definition
- [x] Implement CRF-first setup with finalize-to-schedule gating
- [x] Add multi-form custom function comparisons with `+ Add Form`
- [x] Add bulk rule actions in Edit Checks (select many + approve selected)
- [x] Add explicit CRF selector in Edit Check composer before field selector
- [x] Expand AI Align All to preload full predefined CRF library and route to CRF Manager review
- [x] Add `AI Align All` control inside edit-check platform
- [x] Generate expanded TMF document package from FARO + Edit Checks outputs
- [x] Add assign-to-TMF controls at document level and bulk level
- [x] Add TMF repository landing page with user-specific signature queue
- [x] Add preview/print/digital-sign/upload-sign flows for document completion
- [x] Gate Phase 2 promotion on fully signed assigned TMF package
- [x] Add study-scoped TMF repositories (one document set per study)
- [x] Add Study Name column in TMF repository table
- [x] Add role-aware Phase 2 Data Entry Portal (site entry + DM/Sponsor review)
- [x] Add Phase 2 audit trail feed for key actions
- [x] Add permanent CDM architect instruction file (`FARO_CDM_ARCHITECT_README.md`)

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

### D-005
- Decision: Use finalized CRFs as the source of truth for AI rule proposal generation.
- Why: Aligns validation logic directly to configured data collection design.

### D-006
- Decision: Keep custom function builder client-side and schema-light for prototype speed.
- Why: Enables realistic pilot interactions without backend dependency.

### D-007
- Decision: Add controlled terminology fields (`allowedValues` + `allowOther`) at CRF field level.
- Why: Reflects real EDC field behavior and supports non-predefined values safely.

### D-008
- Decision: Group Edit Checks by CRF label while preserving field-level rules.
- Why: Users think in CRFs first, then fields; this improves usability without changing data model complexity.

### D-009
- Decision: Gate Schedule of Activities to only finalized CRFs from Case Report Form Manager.
- Why: Mirrors real build sequence and avoids ambiguous schedule selections.

### D-010
- Decision: Extend custom-function builder to support more than two forms in one expression.
- Why: Cross-form reconciliation often spans multiple CRFs, not only pairwise checks.

### D-011
- Decision: Add bulk approval controls in Edit Checks.
- Why: Review teams commonly approve many low-risk AI checks together.

### D-012
- Decision: Require explicit CRF selection in the rule composer before field/logic entry.
- Why: Prevents ambiguity when similarly named fields appear across multiple CRFs.

### D-013
- Decision: `AI Align All` now preloads the entire standard CRF set and redirects to CRF Manager.
- Why: Users wanted one-click baseline population before manual refinement and schedule mapping.

### D-014
- Decision: Treat TMF as a first-class landing page with assign-and-sign workflow instead of a single confirmation step.
- Why: Stakeholders need realistic e-sign process simulation and per-user pending signature visibility.

### D-015
- Decision: Expand document package to include standards and submission-oriented artifacts (metadata maps, Define/reviewer guides, SAP/DMP).
- Why: Better reflects real clinical study startup and inspection readiness expectations.

### D-016
- Decision: Keep TMF repositories scoped by project/study rather than a global flat store.
- Why: Signatures and document readiness are study-specific and should not cross-contaminate go-live gates.

### D-017
- Decision: Introduce role-gated Phase 2 Data Entry Portal with clear producer/reviewer split.
- Why: Mimics clinical operating model where sites enter data and DM/Sponsor perform oversight review.

### D-018
- Decision: Include audit trail entries for enrollment, data submission, and review actions.
- Why: Aligns with 21 CFR Part 11 design expectations in prototype behavior.

## Change Control Note
When adding new features, update this file with:
1. Task description
2. Decision (if architectural/product impact exists)
3. Verification method
