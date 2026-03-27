# PROGRESS

## Current Build Status
- Lifecycle app restored and aligned with requested sequence.
- FARO workspace integrated under Setup Phase after protocol ingestion.
- UI is clickable with static data and route-like state changes.

## Completed Items
- Gateway with environment selection (UAT / Production)
- Project Hub with enrolled projects and create-project flow
- Setup Phase with protocol ingestion and FARO workspace entry
- FARO screens:
  - General Info
  - Schedule of Activities (clickable matrix)
  - Activity Configuration
  - Insights
  - Case Report Form Manager
- AI Edit Checks stage with approve/reject workflow
- AI edit checks upgraded to CRF-driven rule generation
- AI edit checks renamed to `AI-Driven Edit Checks & Custom functions`
- Custom rule creation per CRF via `+ Add Check`
- Cross-form custom function builder added (power-query style)
- TMF stage with document generation view + sign-off gate
- Phase 2 live view with role switch and dummy patient enrollment
- CRF Manager updated with field metadata capture (`field label` + `field type`)
- CRF Manager expanded with controlled value support (`allowed values`, `allow other`)
- CRF templates generated from FARO Study Definition workspace (field-level)
- Demographics template now includes protocol-style fields (Gender, Ethnicity, Date of Birth)
- CRF Manager refactored to CRF-first flow:
  - choose/create CRF
  - add field list with format and codelist settings
  - finalize CRF for schedule availability
- Schedule of Activities now only lists finalized CRFs from CRF Manager
- CRF view now renders as multi-level CRF -> fields structure to reduce duplicate form-name repetition
- Edit Checks composer upgraded with:
  - Formula entry (`@Field +/-/* @OtherField`)
  - Plain-English AI draft input
  - CRF-grouped field selection across finalized forms
- Custom Function composer now supports >2 form comparisons using `+ Add Form`
- AI Align All now auto-populates the full predefined CRF library and opens CRF Manager for final field-format review
- Edit Checks composer now supports explicit CRF selection for rule target before field logic selection
- Edit Checks now supports bulk workflow: Select All, Clear Selection, and Approve Selected
- Added `AI Align All` control inside `AI-Driven Edit Checks & Custom functions`
- Added TMF document package generator with broader artifact coverage:
  - Study setup configuration
  - Protocol synopsis/amendment log
  - CRF config + aCRF + CRF instructions
  - Edit check + custom function specs
  - DMP + SAP
  - Metadata spec + metadata traceability map (CDASH->SDTM->ADaM->TLF)
  - SDTM/ADaM specs, TLF shells, Define.xml + reviewer guides
- Added assign-to-TMF workflow per document and bulk assign option
- Added separate TMF landing behavior with repository table and signature queue
- Added document preview/sign workflow with:
  - Digital signature
  - Print preview
  - Wet-ink upload submit
- Added go-live gate: Phase 2 unlocks only when all assigned documents are signed
- Added dashboard visibility for user-specific pending signature tasks via login email
- Added study-scoped TMF repositories (documents now separated by study)
- Added Study Name column in TMF repository table
- Added study selector inside TMF page to switch study repositories
- Added Phase 2 role `Sponsor` for oversight workflows
- Added role-based Data Entry Portal in Phase 2:
  - Site roles (CRA/PI/CRC) submit entries
  - DM/Sponsor review entries and mark reviewed or queried
- Added audit trail feed for enrollment/data-entry/review actions
- Added permanent operating charter file: `FARO_CDM_ARCHITECT_README.md`

## Known Operational Risk
- Hosted previews (Arena/Vercel) may show stale UI if old workspace/build is still active.
- Mitigation:
  - Confirm `src/main.tsx` imports `./App`
  - Rebuild and restart preview
  - Hard refresh browser

## Verification Checklist (Use Per Deployment)
- Login appears first
- Project Hub appears after sign-in
- FARO appears only after ingestion in setup
- Edit Checks follows setup approval
- TMF follows edit check finalization
- Phase 2 unlocks only after sign-off
- TMF shows study-scoped documents and Study Name column
- Site role can submit data entries and DM/Sponsor can review/query those entries

## Next Suggested Iterations
- Add visible version marker in UI header for deployment sanity check
- Split monolithic app shell into `src/views/*` for maintainability
- Add local persistence (optional) for prototype sessions
- Expand field libraries for additional therapeutic areas beyond current baseline set
