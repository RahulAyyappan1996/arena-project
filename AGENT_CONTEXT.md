# AGENT_CONTEXT

## Purpose
This document captures stable context for any AI or engineer working on the ClearTrial prototype so work can continue without losing decisions.

## Product Scope
- Product: ClearTrial (AI-powered Clinical Trial EDC prototype)
- Goal: High-fidelity clickable pilot, not production backend
- Core flow: End-to-end, state-driven clinical study lifecycle

## Mandatory Lifecycle Flow
1. Login / Registration Gateway
2. Project Hub (enrolled projects + create project)
3. FARO Study Build (protocol ingestion, then FARO workspace)
4. AI-Driven Edit Checks
5. TMF + Stakeholder Sign-off
6. Phase 2 Live Environment

## FARO Placement Rule
FARO is embedded **inside Setup Phase (Step 3)** and must come after protocol ingestion. FARO is not a standalone replacement for the lifecycle app.

## UI System
- Primary brand color: Red (`#DC2626`)
- User category accents:
  - Site roles: Orange
  - Sponsor: Blue
  - Data Manager: Green
- Visual style: Clean clinical, glass-like panels, clear hierarchy

## Technical Context
- Stack: React + TypeScript + Vite + Tailwind CSS
- Entrypoint: `src/main.tsx`
- Main app shell: `src/App.tsx`
- Current behavior: Clickable prototype with static/mock data and local state transitions

## Non-Goals (Current Prototype)
- No complex backend API implementation
- No full auth/permission enforcement server-side
- No persistent database required for pilot behavior

## Working Rules
- Keep navigation deterministic and clickable
- Keep all lifecycle steps reachable with explicit buttons
- Preserve environment badge visibility across lifecycle views
- Avoid replacing existing lifecycle with single-module screens
