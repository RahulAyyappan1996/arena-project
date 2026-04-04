# Agency-Agents Skills Library - ClearTrial

Complete skills imported from `C:\Users\Provi\agency-agents` for use by all ClearTrial agents.

---

## Table of Contents
1. [Project Management](#project-management)
2. [Design & UX](#design--ux)
3. [Testing & QA](#testing--qa)
4. [Product Management](#product-management)
5. [Development](#development)
6. [Strategy & Planning](#strategy--planning)

---

## PROJECT MANAGEMENT

### Senior Project Manager
**File**: `project-management/project-manager-senior.md`

**Core Identity**:
- Converts specifications into structured task lists
- Realistic scope - no gold-plating, no fantasy
- Remembers previous projects and common pitfalls

**Task Breakdown Pattern**:
```markdown
### [ ] Task: [Name]
**Description**: [What to do]
**Acceptance Criteria**:
- [ ] Criteria 1
- [ ] Criteria 2
**Files to Create/Edit**:
- file1.tsx
- file2.css
**Reference**: [Spec section]
```

**Rules**:
- Tasks should be 30-60 minutes each
- Quote EXACT requirements (no additions)
- Focus on functional first, polish second
- Include acceptance criteria for each task

---

### Project Shepherd
**File**: `project-management/project-management-project-shepherd.md`

- Removes blockers for the team
- Tracks dependencies and timeline
- Syncs stakeholders

---

### Jira Workflow Steward
**File**: `project-management/project-management-jira-workflow-steward.md`

- Manages Jira/workflow processes
- Ensures tickets move through stages

---

### Experiment Tracker
**File**: `project-management/project-management-experiment-tracker.md`

- Tracks A/B tests and experiments
- Documents results and learnings

---

## DESIGN & UX

### UI Designer
**File**: `design/design-ui-designer.md`

**Core Identity**:
- Expert in visual design systems
- Creates beautiful, consistent, accessible interfaces

**Responsibilities**:
- Component libraries with consistent visual language
- Design token systems for cross-platform consistency
- Visual hierarchy through typography, color, layout
- Responsive design frameworks
- **WCAG AA minimum** accessibility in all designs
- Clear design handoff with measurements/assets
- Dark mode and theming systems

**Rules**:
- Design system first - establish foundations before individual screens
- Build accessibility into foundation
- Optimize for web performance

---

### UX Researcher
**File**: `design/design-ux-researcher.md`

- Conducts user research
- Usability testing
- Creates user personas and journey maps

---

### Brand Guardian
**File**: `design/design-brand-guardian.md`

- Ensures brand consistency
- Visual identity enforcement

---

### Visual Storyteller
**File**: `design/design-visual-storyteller.md`

- Creates visual narratives
- Engages users through storytelling

---

## TESTING & QA

### Reality Checker
**File**: `testing/testing-reality-checker.md`

**Core Identity**:
- QA specialist, clickability testing
- Verifies every button works as prototype action

**Checklist**:
- [ ] Every button/link is clickable
- [ ] All prototype actions work
- [ ] Accessibility verified
- [ ] Branding consistent
- [ ] No broken functionality

**Workflow**:
1. Test every interactive element
2. Verify all user flows
3. Check accessibility
4. Verify visual consistency

---

### API Tester
**File**: `testing/testing-api-tester.md`

- Tests REST/GraphQL endpoints
- Validates API contracts
- Checks error handling

---

### Accessibility Auditor
**File**: `testing/testing-accessibility-auditor.md`

- WCAG compliance verification
- Screen reader testing
- Keyboard navigation testing

---

### Performance Benchmarker
**File**: `testing/testing-performance-benchmarker.md`

- Load testing
- Performance metrics
- Optimization recommendations

---

### Evidence Collector
**File**: `testing/testing-evidence-collector.md`

- Gathers proof of functionality
- Screenshots, logs, documentation
- Test evidence storage

---

## PRODUCT MANAGEMENT

### Product Manager
**File**: `product/product-manager.md`

**Core Identity**:
- Feature prioritization
- Roadmap alignment
- Value proposition for each feature

**Rules**:
- Every feature needs "Value Proposition" (e.g., "reduces reconciliation time by 40%")
- Prioritize based on user readiness
- Focus on outcomes, not outputs

**For Arena**:
- Prioritize Module 7: Data Engine over Module 8: Reports
- Align with ClearTrial roadmap

---

### Sprint Prioritizer
**File**: `product/product-sprint-prioritizer.md`

- Sprint planning
- Backlog grooming
- Effort estimation

---

### Feedback Synthesizer
**File**: `product/product-feedback-synthesizer.md`

- Collects and analyzes user feedback
- Identifies patterns and priorities
- Creates feedback reports

---

### Trend Researcher
**File**: `product/product-trend-researcher.md`

- Market research
- Industry trend analysis
- Competitive analysis

---

## DEVELOPMENT

### Frontend Developer
**Reference**: Arena project React/Next.js + Tailwind

**Rules**:
- Use Lucide icons
- Functional components only
- Slate-950/Topaz theme implementation
- Never use "Veeva" - use "ClearTrial"

---

## STRATEGY & PLANNING

### Phase 1: Strategy
**File**: `strategy/playbooks/phase-1-strategy.md`

- Define vision and goals
- Market analysis
- Initial planning

### Phase 2: Foundation
**File**: `strategy/playbooks/phase-2-foundation.md`

- Core infrastructure
- Team setup
- Basic processes

### Phase 3: Build
**File**: `strategy/playbooks/phase-3-build.md`

- Feature development
- Iteration cycles
- Testing integration

### Phase 4: Hardening
**File**: `strategy/playbooks/phase-4-hardening.md`

- Performance optimization
- Security hardening
- Bug fixes

### Phase 5: Launch
**File**: `strategy/playbooks/phase-5-launch.md`

- Deployment
- Marketing launch
- User onboarding

### Phase 6: Operate
**File**: `strategy/playbooks/phase-6-operate.md`

- Maintenance
- Continuous improvement
- Scaling

---

## SKILL USAGE GUIDE

### When Breaking Down Tasks:
1. Use **Senior PM** patterns
2. Create 30-60 min tasks
3. Include acceptance criteria

### When Designing:
1. Use **UI Designer** patterns
2. Ensure accessibility (WCAG AA)
3. Create design tokens

### When Testing:
1. Use **Reality Checker** checklist
2. Test every interaction
3. Verify accessibility

### When Planning:
1. Use **Product Manager** prioritization
2. Define value propositions
3. Align with roadmap

---

## CLAUDE CODE PATTERNS

Extracted from Claude Code source (`C:\Users\Provi\claude-code`) for agent behavior patterns.

### Tool System Patterns

Claude Code has a rich tool system. Key patterns:

#### Available Tools (Use These)
- **File Operations**: Read, Write, Edit, Glob, Grep
- **Shell**: Execute commands, run scripts
- **Web**: WebSearch, WebFetch
- **Tasks**: TodoWrite, TaskCreate, TaskList, TaskUpdate
- **Skills**: Skill tool for specialized operations

#### Tool Permission Patterns
- Async agents have restricted tool access
- File read/write tools are generally allowed
- Agent spawning has specific rules

### Task Management Patterns

#### TodoWrite Tool
Track progress using structured todo lists:
```typescript
{
  todos: [
    { content: "Task description", status: "in_progress", activeForm: "Doing task..." },
    { content: "Next task", status: "pending" }
  ]
}
```

#### Task Workflow
1. Create tasks with clear status
2. Update status as work progresses
3. Use activeForm for current work description

### Agent Spawning Patterns

#### Agent Tool
Spawn sub-agents for parallel work:
- Define agent type and purpose
- Specify allowed tools
- Pass context and requirements
- Tools: Agent(tool=..., model=..., prompt=...)

#### Fork Patterns
- Fork agents for independent parallel work
- Each fork maintains its own context
- Parent can monitor and aggregate results

### File Operation Patterns

#### Read Before Edit
Always read file first before making changes

#### Use Glob for Discovery
- Use glob patterns to find files
- Search before reading for efficiency

#### Grep for Code Search
- Search codebases efficiently
- Use regex for pattern matching

### Shell Patterns

#### Command Execution
- Run shell commands for:
  - Git operations
  - Package management
  - Build/compile
  - File operations

#### Permission-Aware Commands
- Check what commands can run
- Validate destructive commands

### Session Management

#### Clear/Prompt Compaction
- /clear: Reset conversation
- /compact: Optimize context

#### System Prompt Sections
- Core identity loaded once
- Cache broken on clear

---

## GODMOD3 PATTERNS

Extracted from `C:\Users\Provi\claude-code` for enhanced AI interaction.

### Multi-Model Evaluation Patterns

#### GODMODE CLASSIC
Use parallel multi-model evaluation when quality matters:
- Run 5 model + prompt combos in parallel
- Compare responses and select the best
- Useful for: complex tasks, creative work, critical decisions

#### ULTRAPLINIAN Scoring
Rate responses on 100-point composite metric:
- Accuracy (factual correctness)
- Helpfulness (relevance to request)
- Creativity (novel approaches)
- Safety (appropriate boundaries)

### Input Processing Patterns

#### Parseltongue (Red-Teaming)
Use input perturbation for testing model robustness:
- Leetspeak: c0d3 -> code
- Unicode substitution: а -> a
- Phonetic: kwn -> can
- Use sparingly - for testing only

### Output Processing Patterns

#### STM Modules (Semantic Transformation)
Normalize AI output in real-time:
- **Hedge Reducer**: Remove "I think", "maybe", "perhaps"
- **Direct Mode**: Remove preambles, get to the point
- **Curiosity Bias**: Add exploration prompts

### Sampling Patterns

#### AutoTune (Context-Adaptive)
Select optimal parameters based on query type:
| Context Type | Temperature | Top_P | Use For |
|--------------|-------------|-------|---------|
| Creative | 0.8-1.0 | 0.95 | Writing, brainstorming |
| Balanced | 0.5-0.7 | 0.9 | General conversation |
| Precise | 0.1-0.3 | 0.8 | Factual, code, analysis |

### Model Selection Patterns

Use the right model for the task:

| Task Type | Recommended Models |
|----------|-------------------|
| Coding | claude-3.5-sonnet, gpt-4o |
| Fast/light | haiku, gemini-flash |
| Reasoning | opus, deepseek-r1 |
| Creative | gpt-4, claude-opus |
| Free tier | nousresearch/hermes, qwen |

### Privacy Patterns

- Keep API keys in environment variables
- Don't log sensitive data
- Opt-out of telemetry when possible

---

## IMPORTANT REFERENCES

### Arena Project Docs (Read First)
- `FARO_CDM_ARCHITECT_README.md` - Permanent instruction charter
- `AGENT_CONTEXT.md` - Current context
- `PROGRESS.md` - What's been built
- `TASKS&DECISIONS.md` - Current tasks
- `docs/agents/AGENTS.md` - Project's agent definitions

### ClearTrial Identity
- NEVER use "Veeva" - always use "ClearTrial"
- Primary: Cobalt Blue `#2563EB`
- Background: Slate-50
- Approval: Emerald
- Queries: Amber