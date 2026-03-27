# REFERENCE

## How To Use These Docs
- `AGENT_CONTEXT.md`: Stable context, scope, and guardrails.
- `PROGRESS.md`: What is done, what is verified, what is next.
- `TASKS&DECISIONS.md`: Backlog and architecture/product decisions.
- `REFERENCE.md` (this file): Quick operational runbook.
- `FARO_CDM_ARCHITECT_README.md`: Permanent CDM/Part-11 operating instruction.

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
5. FARO sidebar order in Study Definition shows CRF Manager before Schedule of Activities.
6. Schedule of Activities lists only finalized CRFs from CRF Manager.
7. `AI-Driven Edit Checks & Custom functions` shows CRF-grouped checks.
8. `+ Add Check` works for Edit Check and Custom Function modes.
9. In Custom Function mode, `+ Add Form` enables >2 CRF comparisons.
10. In Edit Check mode, CRF is explicitly selectable before field and logic.
11. Formula composer works with `@FieldLabel` and math operators.
12. Plain-English requirement can generate AI draft logic.
13. Bulk review controls work: Select All -> Approve Selected.
14. Edit-check screen includes `AI Align All`.
15. TMF repository can generate a full document package.
16. Documents can be assigned to TMF (single and bulk assign).
17. Login user sees pending signature queue from TMF assignments.
18. Document preview supports digital sign, print, and upload signed copy.
19. Study goes live only after all assigned docs are signed.
20. Edit Checks -> TMF -> Phase 2 remain sequential.
21. TMF table includes Study Name and reflects only the selected study repository.
22. Phase 2 Data Entry Portal allows submit only for site roles (CRA/PI/CRC).
23. DM/Sponsor can review submitted entries and mark reviewed or queried.
24. Audit trail updates when enrollment/data entry/review actions occur.

## Feature Verification (Latest)
1. In CRF Manager, choose/create CRF and add field list with `Field Label` and `Field Type`.
2. Finalize the CRF for schedule, then confirm it appears in Schedule of Activities.
3. Finalize Phase 1 from FARO.
4. In edit checks stage, confirm the new CRF appears with AI-suggested checks.
5. Click `+ Add Check` on a CRF:
   - Add an Edit Check (within-form)
   - Add a Custom Function (cross-form)
6. In Custom Function mode, use `+ Add Form` to include a third CRF in the same logic.
7. In CRF Manager, verify Demographics fields include controlled lists (Gender/Ethnicity) and `Other` support.
8. Click `AI Align All` and confirm full predefined CRF set is populated and CRF Manager opens for review.

## If Deployed UI Looks Old
1. Confirm active workspace/repo is the expected one.
2. Confirm `src/main.tsx` imports `./App`.
3. Rebuild and restart deployment preview.
4. Hard refresh browser cache.
