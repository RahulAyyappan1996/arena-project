# STRATEGIC_UPGRADE_PLAN

## Objective
Compare current ClearTrial build against 2026 benchmark patterns and roadmap intent, then define a high-value upgrade sequence for the Developer agent.

Inputs used:
- `MARKET_BENCHMARKS_2026.md`
- `CURRENT_BUILD_INVENTORY.md`
- Existing internal docs (`AGENT_CONTEXT.md`, `PROGRESS.md`, `TASKS&DECISIONS.md`)

## Executive Summary
ClearTrial already demonstrates a strong prototype foundation: lifecycle gating, CRF-first setup, query workflow, TMF sign-off, Phase 2 role controls, and predictive sandboxing.

Main gaps vs 2026 enterprise CDM benchmarks are not core function absence, but:
1. Exception-based operations depth (change detection and delta-focused review)
2. Operational coherence between workbenches (DataHub, Query, TMF, Predict)
3. Compliance evidence granularity (reason-for-change + audit trace coupling in all critical actions)

## Gap Analysis

### A) Missing Critical Features

1. Zero-Downtime Amendment Impact Layer
- Gap: Amendment list exists in FARO General Info, but no explicit impact propagation across schedule/forms/checks.
- Benchmark signal: 2026 market emphasizes no-downtime amendments and study difference traceability.
- Value proposition: Reduces amendment rework risk and review delays by making impacted artifacts explicit.

2. Live Lab Sync/Exception Indicators
- Gap: DataHub supports reconciliation but lacks true "new/changed since last review" surfacing and sync freshness badges.
- Benchmark signal: change detection and review-by-exception are now primary productivity levers.
- Value proposition: Cuts DM reconciliation overhead and focuses effort on high-risk deltas.

3. Query SLA + Cycle-Time Telemetry
- Gap: Query lifecycle exists, but no SLA medians, escalation funnel, or closure velocity by role/site.
- Benchmark signal: operational dashboards are now expected in centralized CDM workbenches.
- Value proposition: Improves study-level risk forecasting and shortens query closure time.

4. Explainable AI Action Trace
- Gap: AI suggestions exist (align/draft), but no standardized explainability panel with source rationale + confidence provenance.
- Benchmark signal: agentic assistants are human-in-loop with auditable rationale.
- Value proposition: Improves trust and inspection-readiness for AI-assisted configuration.

5. Global Switcher Maturity
- Gap: Strong current header/command palette, but no explicit persistent study/role/module switcher model akin to enterprise multi-study operations.
- Benchmark signal: top-level switchers reduce navigation friction in portfolio-scale operations.
- Value proposition: Faster context switching for DM/oversight teams.

### B) Branding Errors
- Code scan result: No leftover `Veeva` strings in `src/`.
- Action: Keep automated naming lint checks in QA routine (Reality Checker step).

### C) UX Improvements
1. Cohesive operations rail
- Add unified operations rail linking DataHub discrepancies -> Query creation -> TMF impact tasks.

2. Density-first table ergonomics
- Add compact row mode, sticky headers, and keyboard navigation in Query/DataHub tables.

3. Visual state consistency
- Normalize status semantics across modules:
  - Green = complete/verified
  - Amber = pending/missing
  - Blue/neutral = untouched
  - Purple = escalated

4. Optional 2026 visual accent
- Add subtle AI-active edge glow only around active AI regions (not whole app), preserving clinical readability.

## Product Prioritization (PM + Domain Lens)

### Priority 1: Module 7 Data Engine hardening (highest value)
Scope:
- Change-detection badges
- Exception queue
- lab feed freshness + source sync timestamps
- reconciliation-to-query one-click bridge

Value proposition:
- Expected to reduce manual reconciliation time by 30-40% in demo narrative.

### Priority 2: Query SLA intelligence
Scope:
- SLA clocks by status
- overdue trend and escalation matrix
- closure velocity by site/role

Value proposition:
- Improves intervention timing and reduces long-tail open query backlog.

### Priority 3: Amendment impact graph
Scope:
- amendment diff card + impacted artifacts
- reopen markers on affected CRFs/edit checks/visits
- confirmation workflow before returning to live execution

Value proposition:
- Prevents hidden downstream misalignment after protocol changes.

## Clinical Logic Document (Domain Expert Refinement)

### Data Engine Canonical Terms (ClearTrial-aligned)
- Informed Consent
- Inclusion/Exclusion Criteria
- Demographics
- Vital Signs
- Adverse Events
- Concomitant Medication
- Laboratory Results
- Query Status: Open, Pending, Closed, Escalated
- Reconciliation Status: Pending, Verified, Mismatch

### Edit Check classes to keep standard
- Range checks
- Cross-field consistency
- Date sequencing
- Conditional requiredness
- Cross-form reconciliation checks

### Audit Trail minimum for every critical action
- who (user id/role)
- what (field/rule/doc/action)
- when (system timestamp)
- previous value -> new value (when applicable)
- reason for change (mandatory for edits)

## Storyline For Demo (Academic Division)

Persona:
- "Dr. Sarah, Lead Data Manager"

Narrative:
1. Sarah opens DataHub and sees an ALT mismatch between Labs and EDC.
2. She creates/escalates a query directly from mismatch context.
3. Site responds; Sarah closes the query; readiness improves.
4. Amendment arrives; impact panel shows exactly which CRFs and checks were affected.
5. TMF sign-off finalizes, enabling Phase 2 progression.

Pain-to-solution tension:
- Pain: fragmented tools and stale reconciliation.
- Solution: unified workbench + explainable AI + gated compliance flow.

## Delivery Plan (Developer Agent)

### Sprint A
- Implement Data Engine exception lane and sync freshness indicators.
- Add mismatch -> query quick action and trace links.

### Sprint B
- Add query SLA analytics widgets and escalation trend table.

### Sprint C
- Add amendment impact graph and downstream artifact status updates.

## Reality Checker Final Audit Checklist
1. All prototype buttons trigger visible state change.
2. No forbidden competitor naming appears in UI/code.
3. AI-assisted actions always show human-approval checkpoint.
4. Audit entries are generated for create/edit/close/sign actions.
5. Data Engine story can be demoed end-to-end in under 3 minutes.