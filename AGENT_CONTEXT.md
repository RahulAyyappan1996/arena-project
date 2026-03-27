# AGENT_CONTEXT

## Purpose
This document captures stable context for any AI or engineer working on the ClearTrial prototype so work can continue without losing decisions.

## Product Scope
- Product: ClearTrial (AI-powered Clinical Trial EDC prototype)
- Goal: High-fidelity clickable pilot, not production backend
- Core flow: End-to-end, state-driven clinical study lifecycle

## Mandatory Lifecycle Flow
1. Login / Registration Gateway
2. Project Hub (enrolled projects + create project)
3. FARO Study Build (protocol ingestion, then FARO workspace)
4. AI-Driven Edit Checks
5. TMF + Stakeholder Sign-off
6. Phase 2 Live Environment

## FARO Placement Rule
FARO is embedded **inside Setup Phase (Step 3)** and must come after protocol ingestion. FARO is not a standalone replacement for the lifecycle app.

## UI System
- Primary brand color: Red (`#DC2626`)
- User category accents:
  - Site roles: Orange
  - Sponsor: Blue
  - Data Manager: Green
- Visual style: Clean clinical, glass-like panels, clear hierarchy

## Technical Context
- Stack: React + TypeScript + Vite + Tailwind CSS
- Entrypoint: `src/main.tsx`
- Main app shell: `src/App.tsx`
- Current behavior: Clickable prototype with static/mock data and local state transitions
- Permanent operating charter: `FARO_CDM_ARCHITECT_README.md`

## FARO Data Modeling Additions
- CRF-first authoring is the Study Definition default:
  - Case Report Form Manager appears before Schedule of Activities.
  - User defines CRF containers first, then field list and field format.
  - Only finalized CRFs are available inside Schedule of Activities.
- Case Report Form Manager captures field-level metadata per CRF:
  - `fieldLabel`
  - `fieldType` (`time`, `date`, `number`, `text`, `restricted`, `other`)
  - `allowedValues` (for controlled lists)
  - `allowOther` (extensibility switch)
- FARO Study Definition now drives CRF field templates (including Demographics defaults like Gender and Ethnicity).
- Edit-check stage is CRF-aware and consumes finalized CRFs from Phase 1/FARO output.
- Edit-check stage supports 2 rule modes:
  - Edit Check (within-form)
  - Custom Function (cross-form; power-query style mapping)
- Custom Function composer supports comparing more than 2 forms through additive comparison rows (`+ Add Form`).
- Edit-check composer also supports:
  - Formula input with `@FieldLabel` references and math operators
  - Plain-English requirement input with AI draft simulation
- Edit-check composer now requires explicit CRF selection, then field selection, before adding a rule.
- Bulk review controls are available in edit checks for multi-select and "Approve Selected".
- FARO `AI Align All` now populates the full predefined regulatory CRF set and routes reviewers to CRF Manager for field-format finalization.
- Edit-check stage also has `AI Align All` to standardize and bulk-approve pending AI rules.

## TMF And Signature Workflow
- TMF is a separate EDC landing page and can be opened from dashboard/header.
- TMF is study-specific (one repository per study).
- Document packages are generated from finalized FARO + edit-check outputs.
- Required package includes setup, protocol, CRF, validation, metadata, standards, and statistics artifacts.
- Documents must be assigned to study TMF portal before signature completion.
- TMF repository table includes Study Name for cross-study clarity.
- Login email is used for user-specific signature queue.
- Signature options include:
  - Digital sign
  - Print, wet-ink sign, upload signed copy
- Study can move to Phase 2 only when all assigned TMF documents are fully signed.

## Non-Goals (Current Prototype)
- No complex backend API implementation
- No full auth/permission enforcement server-side
- No persistent database required for pilot behavior

## Working Rules
- Keep navigation deterministic and clickable
- Keep all lifecycle steps reachable with explicit buttons
- Preserve environment badge visibility across lifecycle views
- Avoid replacing existing lifecycle with single-module screens

## Phase 2 Data Entry Rule
- Data entry portal is role-aware:
  - Site roles (`CRA`, `PI`, `CRC`) can submit records.
  - Oversight roles (`DM`, `Sponsor`) review and set `reviewed/queried`.
- Data entry and review actions should append to an audit trail log (Part 11 mindset).
