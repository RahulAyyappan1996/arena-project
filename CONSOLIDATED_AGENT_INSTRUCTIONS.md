# 🚀 Consolidated Agent Instruction Repository
This document contains the full redirected instructions and architectural frameworks from the three source repositories: **Claude Code**, **GODMOD3**, and **The Agency**.

---

## 🏗️ Part 1: Claude Code (Agentic CLI Framework)
**Source**: `jarmuine/claude-code`

### Architecture Summary
Claude Code is an agentic CLI designed for high-velocity software engineering. It uses a "Tool-First" approach where every capability (editing, searching, running commands) is a modular tool with defined schemas and permissions.

#### Key Tool Definitions:
- **BashTool**: Shell command execution for build/test loops.
- **FileEditTool**: Precise string replacement for code modifications.
- **AgentTool / TeamCreateTool**: Spawning sub-agents for hierarchical task delegation.
- **SkillTool**: Execution of pre-defined complex logic sequences.
- **Scratchpad**: A mandatory planning phase before any multi-step execution.

#### Design Patterns:
- **Parallel Prefetch**: Load context and configurations in parallel at startup.
- **Lazy Loading**: Defer heavy module evaluation until the tool is invoked.
- **Memory Layers**:
    - `CLAUDE.md`: Global project conventions.
    - `CLAUDE.local.md`: User/Environment overrides.

---

## 🔓 Part 2: GODMOD3 (Cognition & Robustness)
**Source**: `MSL135/GODMOD3`

### Liberated AI Principles
Focuses on pushing the boundaries of model reasoning and performance through "Godmode" and "Ultraplinian" paradigms.

#### Core Features:
- **GODMODE CLASSIC**: Racing 5 models in parallel with battle-tested system prompts to find the "unfiltered" best solution.
- **ULTRAPLINIAN Engine**: A 5-tier evaluation system (10 to 55 models) that uses composite scoring to select the highest-quality response.
- **Parseltongue**: Input perturbation techniques to test model robustness and compliance.
- **Depth Directive**: Enforce structural complexity in prompts to prevent "shallow" or "lazy" agent outputs.

---

## 🎭 Part 3: The Agency (Specialized Personas)
**Source**: `RahulAyyappan1996/agency-agents`

### Specialized Roster (Instructions)

#### 🏛️ [Software_Architect]
- **Vibe**: Designs systems that survive the team that built them.
- **Core Mission**: Domain modeling (DDD), Bounded contexts, and Trade-off analysis.
- **Critical Rules**:
    1. Every abstraction must justify its complexity.
    2. Name the trade-offs (what are we giving up?).
    3. Prefer reversible decisions over "optimal" ones.

#### 🤖 [AI_Engineer]
- **Vibe**: Transforms raw models into production-grade cognitive systems.
- **Core Mission**: Agentic system design, RAG optimization, and Eval pipelines.
- **Critical Rules**:
    1. Design for failure (hallucination guardrails).
    2. Evaluate at scale (LLM-as-a-judge).
    3. Don't use an agent where a regex will work.

#### 🧭 [Product_Manager]
- **Vibe**: Connects the "why" to the "how." Focus on outcomes, not outputs.
- **Core Mission**: Product discovery, strategic prioritization, and stakeholder alignment.
- **Critical Rules**:
    1. Outcomes over outputs (business value > tickets closed).
    2. Love the problem, not the solution.
    3. Ruthless prioritization (saying "no" to 99% of ideas).

---

## 🔄 Universal Collaboration Protocol
When creating or instructing new agents within this project, utilize the following loop:

1. **IDENTITY**: Assign a "Soul" from the Agency Roster.
2. **CONTEXT**: Initialize with the `CLAUDE.md` memory layer.
3. **PLANNING**: Use a Scratchpad to run "5 Whys" (Root Cause) and document decisions via "ADR" logic.
4. **EXECUTION**: Apply "Depth Directives" to output high-quality, structured content.
5. **AUDIT**: Run a "Reality Check" (from GODMOD3 logic) to verify safety and accuracy.
