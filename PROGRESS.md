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
- TMF stage with document generation view + sign-off gate
- Phase 2 live view with role switch and dummy patient enrollment

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

## Next Suggested Iterations
- Add visible version marker in UI header for deployment sanity check
- Split monolithic app shell into `src/views/*` for maintainability
- Add local persistence (optional) for prototype sessions
