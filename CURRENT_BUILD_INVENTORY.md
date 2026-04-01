# CURRENT_BUILD_INVENTORY

## Scope
Inventory of current implemented capabilities from:
- `src/App.tsx`
- `src/components/QueryManager.tsx`
- `src/components/faro-predict/*`

## App Shell And Global State

### Top-level state machine
- `login`
- `dashboard`
- `faro`
- `editchecks`
- `tmf`
- `phase2`

### Global controls
- Environment selector (`UAT` / `Production`) persisted in UI context.
- Dark/Light scheduler with manual/custom time/sun cycle modes.
- `CMD+K` command palette with patient preview search.
- Header includes clickable ClearTrial logo returning to dashboard.
- Neural/agent status strip present.

### Primary data models in app state
- Projects and project status (`setup`, `pending`, `live`)
- Finalized CRFs and edit rules
- Study-specific TMF docs (`tmfDocsByProject`)
- Study-specific subjects, entries, and audit logs

## Lifecycle Views

### 1) Login View
- Inputs: email, username, password
- Required environment type selector
- Sign-in transition to dashboard

### 2) Dashboard View
- "Projects I'm Enrolled In"
- Project cards with status badges and metadata
- Create New Project modal
- TMF portal shortcut and pending signature count

### 3) FARO Setup Phase

#### Protocol Ingestion gate
- Upload/process mock protocol
- Processed output summary cards (forms + schedule)
- Buttons:
  - open FARO workspace
  - continue to form generation

#### FARO Workspace (Phase 1)

Sidebar groups currently visible:
- Design Hub:
  - General Info
  - Objectives
  - Population
  - Case Report Form Manager
  - Schedule of Activities
  - Study Design
- Intelligence Hub:
  - Insights & Faro Predict
  - Study Differences Report
- Data Views:
  - Activity Configuration
  - Compare

Top actions:
- AI Align All
- Export Excel
- Export PDF
- Finalize Phase 1

Command Hub context (inside FARO):
- readiness score
- open query count
- reconcile rows
- query approve action

## FARO Subscreens (Implemented)

### General Info
- Protocol metadata panel
- Drug overview
- Protocol PDF preview iframe + download
- Amendment history cards

### Objectives
- Primary and secondary objectives
- Linked CRF tags per objective

### Population
- Target population, age, sample size
- Inclusion and exclusion criteria lists

### CRF Manager
- CRF-first authoring
- Fields per CRF with types:
  - time/date/number/text/restricted/other
- Allowed values and allow-other support
- Template import from library and AI suggest
- Finalized CRFs become schedule-eligible

### Schedule Of Activities Matrix
- Horizontal day columns
- Assessment rows
- Row action menu:
  - Add Schedule Activity
  - Configure Activity
  - Delete
- Cell click tooltip

### Study Design
- CRF mapping surfaces including CDASH/ADaM/TFL alignment indicators

### Activity Configuration
- Checkbox/list-based activity panel member configuration
- Save and route behavior

### Compare
- AI-style benchmarking panel with simulated external trial comparison

### Data Hub (inside FARO command center)
- CDB-style split view:
  - raw lab data
  - EDC entries
- Auto-reconcile action
- Agent link SVG lines with mismatch color handling
- Clean patient tracker rings + narrative story pop

### Query Manager (inside FARO command center)
- Wrapper to full component with readiness sync callback

### Insights & Faro Predict
- Integrated predictive sandbox entry point

### Study Differences Report
- Side-by-side Human Design vs AI-Optimized Design

## 4) Edit Checks View
Screen title:
- `AI-Driven Edit Checks & Custom functions`

Capabilities:
- CRF-grouped rules
- Rule decisions (approve/reject)
- Bulk actions (select all, clear, approve selected)
- Composer with two modes:
  - Edit Check (within form)
  - Custom Function (cross-form)
- Formula support using `@Field` notation
- Plain-English requirement drafting (`Draft With AI`)
- Multi-form cross-comparison (`+ Add Form`)
- AI Align All action

## 5) TMF View
- Study selector and study-scoped repository
- Table columns include Study Name
- Generate/refresh docs
- Assign single/all docs
- Preview panel
- Digital sign / print / upload signed copy
- My signature queue
- Go-live gate: all assigned docs signed

## 6) Phase 2 View

### Role model
- Roles: CRA, CRC, PI, DM, Sponsor
- Enrollment and Data Entry visible only for CRA/CRC
- PI/DM/Sponsor review visibility

### Sections
- Subject Enrollment (CRA/CRC only)
- Data Entry Portal (CRA/CRC only)
- DataHub
- Operations Hub (7-9)

### Subject Enrollment
- Site/region/country predefined selectors
- Auto subject ID format: `site-sequence` (e.g., `001-001`)
- Subject table with actions

### Data Entry Portal
- Subject-scoped page
- Horizontal visit strip with chronological locking
- Vertical CRF list by selected visit
- Field entry with type-aware controls
- Duplicate prevention per subject/visit/crf/field
- CRA-controlled edit mode and resubmit pattern
- Unified inspection console (submitted values + scoped audit)
- Dynamic ascending timestamp ordering in console

### Phase 2 DataHub
- Aggregated multi-source records (EDC + RTSM/Labs/eCOA/Safety mock)
- Stats, source badges, row expansion, exports, add-source mock options
- DM chronological review lens retained

## Components Folder Inventory

### `src/components/QueryManager.tsx`
- Full query lifecycle module with:
  - summary cards
  - filters
  - bulk actions
  - aging highlights
  - detail modal with response thread
  - create query modal

### `src/components/faro-predict/FaroPredict.tsx`
- Hypothesis input
- Pre-sim interview modal
- Drip-fed live swarm log
- Dynamic probability/completion panel
- AI connector narrative panel linking modules

### `src/components/faro-predict/KnowledgeGraphExplorer.tsx`
- SVG node-link graph (patient/site/intervention)
- Dosage shift toggle and projection updates
- Narrative slide-out for patient nodes
- Live linkage panel synced to latest swarm signal

### Supporting Faro Predict files
- `FaroPredictContextModal.tsx`
- `FaroPredictSimulationLog.tsx`
- `FaroPredictResultPanel.tsx`
- `FaroPredict.types.ts`
- `faro-simulation-data.json`

## Branding Audit Snapshot
- No `Veeva` string found in `src/` code files.
- Product naming currently consistent with ClearTrial/Faro.

## Build/Runtime Note
- `src/App.tsx` is very large (single-file architecture) and still carries high coupling risk for future changes.