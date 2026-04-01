# MARKET_BENCHMARKS_2026

## Scope
This document summarizes 2025-2026 market signals for modern EDC/CDM UX patterns from Veeva Vault EDC/CDB, Medidata Rave/CDS, Oracle Clinical One/InForm, and adjacent agentic-CDM products.

## Method
- Web scan of vendor product briefs, product pages, training previews, and documentation portals.
- Focus areas requested:
  - Navigation patterns (global switchers)
  - Data reconciliation workbench layouts
  - Agentic helper overlays / AI-assisted workflows

## Source Highlights (2025-2026)
- Veeva EDC Features Brief (Dec 2025): role-specific interfaces, real-time UAT, zero-downtime amendments, Study Differences Report, direct data access.
- Veeva Clinical Database Features Brief (Dec 2025): centralized Data Workbench, clean patient tracker, auto-check/query automation, change detection, multi-source harmonization.
- Medidata Rave EDC page (Mar 2026): AI-assisted setup, real-time oversight, central/medical monitoring path into Clinical Data Studio.
- Medidata new Rave UI preview training (Apr 2025): updates across Study List, Site List, Tasks, Patient Page, lock/query operations.
- Medidata Clinical Data Studio page (Jan 2026): single review environment across sources, AI-assisted review, low-code reconciliation, faster review cycles.
- Oracle InForm docs (updated 2023+): subject/visit/query lifecycle and Data Viewer for real-time cross-site review.
- Oracle Clinical One Digital Gateway docs (2025-2026): ODM-style integration routes and near real-time inbound/outbound connectors.
- Agentic trend references (2025): human-in-loop AI assistants for discrepancy detection, assisted query generation, proactive risk signaling.

## 2026 UX Pattern Synthesis

### 1) Navigation Patterns (Global Switchers)
Common pattern across leading stacks:
- Top-level context switchers for:
  - Study
  - Site
  - Role/persona
  - Environment/tool mode (EDC vs Workbench/Analytics)
- Dense left nav for domain modules and task funnels.
- Command surfaces increasingly include:
  - task queues
  - lock/state indicators
  - quick jump to subject/patient page

Implication for ClearTrial:
- Keep persistent global header with environment, role, and agent/system status.
- Keep keyboard-first command palette and quick patient lookup.

### 2) Data Reconciliation Workbench Layouts
Modern CDB-like UX converges on:
- Unified data workbench for EDC + external feeds (labs, eCOA, RTSM, safety).
- Side-by-side and listing-first reconciliation (spreadsheet-like density).
- Automatic change detection (review-by-exception) to avoid re-reviewing unchanged records.
- Subject-centric readiness/clean tracker with drill-down.
- Embedded query lifecycle in same surface (create/assign/resolve/close).

Implication for ClearTrial:
- Continue split-view and patient ring tracker, but add stronger change-detection cues and exception-focused triage.

### 3) Agentic Helper Overlays
Observed direction:
- AI assistant used as copilot, not autonomous lock authority.
- AI suggests checks/queries, humans approve/post.
- Strong explainability and traceability expectations (who/why/when).

Implication for ClearTrial:
- Keep "AI Align All" and "Draft with AI" controls with explicit human confirmation gates.
- Add explainability text and audit linkage for every AI-assisted action.

## Competitive Benchmark Matrix (UX Capabilities)

| Capability | Veeva Vault EDC/CDB | Medidata Rave/CDS | Oracle Clinical One/InForm | ClearTrial Current |
|---|---|---|---|---|
| Study/Site task navigation | Strong | Strong | Moderate-Strong | Moderate |
| Centralized multi-source reconciliation | Strong (CDB Workbench) | Strong (CDS) | Moderate (integration-centric) | Moderate |
| Query automation & centralized handling | Strong | Strong | Moderate-Strong | Strong (prototype) |
| Clean patient tracker | Strong | Moderate | Moderate | Strong (prototype) |
| Zero-downtime amendment visibility | Strong (explicit) | Mentioned mid-study change support | Moderate | Partial |
| Study differences / build diff | Strong (explicit) | Partial | Partial | Present |
| Agentic helper overlays | Emerging, guided | Emerging, guided | Emerging | Strong (demo-oriented) |

## Compliance-Relevant Interaction Standards (UI Implications)
- Audit logs should preserve who/what/when and reason-for-change for critical edits.
- Query and review states require timestamped transitions.
- Human approval checkpoints remain mandatory for critical decisions.
- UI should support review-by-exception for scale and inspection readiness.

## Practical Recommendations For Next Iteration
1. Add explicit "change since last review" badges in reconciliation and DM timelines.
2. Add amendment impact strip (which forms/fields changed, what reopened).
3. Add AI explainability drawer for generated checks/queries with source rationale.
4. Tighten global switcher model: Study + Role + Phase + Module quick-jump.

## References
- https://www.veeva.com/resources/veeva-edc-product-brief/
- https://www.veeva.com/resources/veeva-clinical-database-product-brief/
- https://www.medidata.com/en/clinical-trial-products/clinical-data-management/edc-systems/
- https://www.medidata.com/en/clinical-trial-services/medidata-training/preview-new-rave-edc-user-interface-ui/
- https://www.medidata.com/en/clinical-data-studio/
- https://docs.oracle.com/en/industries/health-sciences/inform/index.html
- https://docs.oracle.com/en/industries/life-sciences/clinical-one/digitalgateway-guide/edc-systems.html
- https://docs.oracle.com/en/industries/life-sciences/clinical-one/digitalgateway-guide/data-collection.html