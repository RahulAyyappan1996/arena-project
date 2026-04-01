# REFERENCE

## Documents Map
- `INSTRUCTIONS.md`: quick pointer to permanent instruction set
- `FARO_CDM_ARCHITECT_README.md`: canonical CDM/Part 11 execution charter
- `AGENT_CONTEXT.md`: current architecture and behavior baseline
- `PROGRESS.md`: delivery status snapshot
- `TASKS&DECISIONS.md`: backlog and architectural decisions

## Run And Build
1. `npm install`
2. `npm run dev`
3. `npm run build`

## Entrypoints
- `src/main.tsx` imports `./App`
- Main shell: `src/App.tsx`

## Critical Functional Checks
1. Login appears first and requires environment selection.
2. Project hub routes into setup flow.
3. FARO appears after ingestion only.
4. Edit checks follow FARO completion.
5. TMF follows edit-check finalization.
6. Phase 2 unlocks only after TMF sign completion.

## Role/Permission Checks
1. Enrollment tab visible only to CRA/CRC.
2. Data Entry tab visible only to CRA/CRC.
3. DM/PI/Sponsor can review data outputs.
4. DM DataHub shows chronological review lens.

## Data And TMF Checks
1. TMF is study-specific and includes Study Name column.
2. TMF supports assign, preview, sign, print, upload signed copy.
3. DataHub exports work (CSV/PDF).
4. QueryManager actions and status transitions are functional.

## UI And System Checks
1. CMD+K opens command search.
2. `Insights & Faro Predict` is the single intelligence module label.
3. Dark/Light toggle works with schedule options.
4. Global font renders in Times New Roman.

## If Hosted Preview Looks Old
1. Confirm workspace/repo is correct.
2. Confirm `src/main.tsx` -> `import App from "./App"`.
3. Rebuild/restart preview session.
4. Hard refresh cache.
