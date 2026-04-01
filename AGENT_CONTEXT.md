# AGENT_CONTEXT

## Purpose
Stable project memory for ClearTrial so any agent can continue work without losing domain rules, flow order, or UI conventions.

## Product Scope
- Product: ClearTrial EDC/CDM clickable prototype
- Stack: React + TypeScript + Vite + Tailwind CSS
- Main files: `src/main.tsx`, `src/App.tsx`
- Style baseline: clinical enterprise UI, high-density where relevant
- Typeface: global `Times New Roman` override in `src/index.css`

## Mandatory Lifecycle State Machine
1. Login gateway (email/password + environment)
2. Project hub (enrolled studies + create project)
3. Setup Phase (Protocol ingestion -> FARO workspace)
4. AI-Driven Edit Checks & Custom functions
5. TMF portal and sign-off
6. Phase 2 live environment

FARO is embedded inside Step 3 and must not replace lifecycle navigation.

## FARO Workspace Rules
- Sidebar hierarchy is clinical and command-oriented.
- CRF-first build logic:
  - CRF Manager appears before Schedule of Activities.
  - User defines CRFs and fields first.
  - Schedule can only use finalized CRFs.
- CRF field schema supports:
  - `fieldLabel`
  - `fieldType` (`time`, `date`, `number`, `text`, `restricted`, `other`)
  - `allowedValues`
  - `allowOther`
- AI Align All exists in CRF setup and in Edit Checks.

## Edit Checks And Custom Functions
- Screen name: `AI-Driven Edit Checks & Custom functions`
- Rules are CRF-aware and generated from finalized CRFs.
- Composer supports:
  - CRF and field targeting
  - formula syntax with `@Field`
  - plain-English drafting
  - custom cross-form logic with `+ Add Form` (more than 2 forms)
- Bulk workflow is available (select all, approve selected).

## TMF And Compliance
- TMF is a dedicated landing page in EDC.
- TMF storage is study-scoped.
- TMF table includes Study Name.
- Documents support assign, preview, digital sign, print, and upload signed copy.
- Phase 2 unlock gate: all assigned TMF docs signed.

## Phase 2 Permission Model
- Subject Enrollment: CRA/CRC only.
- Data Entry Portal: CRA/CRC only.
- Data visibility and oversight: DM/PI/Sponsor can review.
- DM has chronological review view in DataHub.
- Audit trail records enrollment, entry, edits, query/review transitions.

## Command Center And Intelligence
- Global CMD+K command search is active.
- Neural health and agent lines exist in header area.
- `Insights & Faro Predict` is the single merged intelligence module.
- Query Manager is integrated and can update readiness-related signals.

## Working Constraints
- Keep all interactions mock-data driven unless user asks for backend.
- Keep flows deterministic and clickable for demos.
- Preserve clinical traceability mindset (Part 11 style auditability) in UX.
