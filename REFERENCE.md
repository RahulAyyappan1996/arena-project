# REFERENCE

## How To Use These Docs
- `AGENT_CONTEXT.md`: Stable context, scope, and guardrails.
- `PROGRESS.md`: What is done, what is verified, what is next.
- `TASKS&DECISIONS.md`: Backlog and architecture/product decisions.
- `REFERENCE.md` (this file): Quick operational runbook.

## Quick Local Run
1. Install dependencies: `npm install`
2. Start dev mode: `npm run dev`
3. Build for verification: `npm run build`

## Entry Points
- App entry: `src/main.tsx`
- Main implementation: `src/App.tsx`

## Deployment Sanity Checks
After deployment, verify in browser:
1. Login screen is first.
2. Environment selector is required.
3. Project Hub appears after sign-in.
4. FARO appears in Setup Phase after ingestion.
5. Edit Checks -> TMF -> Phase 2 remain sequential.

## If Deployed UI Looks Old
1. Confirm active workspace/repo is the expected one.
2. Confirm `src/main.tsx` imports `./App`.
3. Rebuild and restart deployment preview.
4. Hard refresh browser cache.
