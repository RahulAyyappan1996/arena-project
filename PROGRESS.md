# PROGRESS

## Current Build Status
- Build is green and functional (`npm run build` passes).
- Full 6-step lifecycle exists with FARO embedded in Setup Phase.
- Command-center style navigation, DataHub, QueryManager, TMF, and role-gated Phase 2 flows are active.

## Major Completed Workstreams

### Lifecycle And Navigation
- Login with environment selection and persistent badge.
- Project hub with enrolled projects and create flow.
- Sequential routing: Setup -> Edit Checks -> TMF -> Phase 2.
- Home navigation via clickable ClearTrial logo.

### FARO Study Build
- Protocol ingestion gate before FARO workspace.
- FARO modules include General Info, Objectives, Population, Study Design, Schedule, CRF Manager, Compare, Insights.
- CRF-first workflow implemented and linked to schedule availability.

### Edit Checks Platform
- Renamed to `AI-Driven Edit Checks & Custom functions`.
- CRF-aware suggestions from finalized forms.
- Edit Check and Custom Function drafting.
- Formula and plain-English draft support.
- Multi-form comparisons with `+ Add Form`.
- Bulk rule approval actions.
- AI Align All present in this stage.

### TMF Portal
- Study-specific TMF repositories with Study Name column.
- Rich document package generation and assign-to-TMF workflow.
- Signature queue by logged-in user.
- Preview, digital sign, print, upload signed copy.
- Go-live gating on complete signatures.

### Phase 2 Execution
- Strict role controls:
  - Subject Enrollment: CRA/CRC only.
  - Data Entry: CRA/CRC only.
  - Review visibility: DM/PI/Sponsor.
- Site-style chronological visit/form data entry with lock sequence.
- Form and visit statuses, inspection console, and audit trail.
- CRA controlled edit/resubmit behavior for submitted CRFs.
- Subject ID auto-sequencing by site format (`001-001`, `001-002`).

### DataHub And Query Operations
- DataHub added in Phase 2 navigation with aggregated records and exports.
- DM-focused chronological view restored and prioritized.
- QueryManager added with realistic status lifecycle, filters, aging, bulk actions, and detail thread.

### Intelligence
- Faro Predict module integrated under `Insights & Faro Predict`.
- Hypothesis input, pre-sim interview, swarm log, projection panel, and knowledge graph explorer.

### UI System Updates
- Global dark/light mode with manual and scheduled behavior.
- Header/top stripe and command-center visual refinements.
- Global font set to Times New Roman.

## Known Risk
- Arena preview can serve stale workspace/build.
- Mitigation:
  - verify `src/main.tsx` imports `./App`
  - rebuild and restart preview
  - hard refresh browser cache

## Deployment Verification Checklist
- Login appears first.
- FARO appears only after protocol ingestion in Setup.
- Edit Checks and TMF follow sequence and gates.
- Phase 2 only after TMF sign completion.
- TMF is study-scoped and includes Study Name column.
- Enrollment and data entry tabs are visible only to CRA/CRC.
- DM sees chronological review in DataHub.

## Next Candidate Iterations
- Add version watermark/badge for deployment certainty.
- Split `src/App.tsx` into modular views/components.
- Add persistence layer option (Supabase/local mock persistence toggle).
