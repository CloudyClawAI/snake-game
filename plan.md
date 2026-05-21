# Plan: Investigate silent CTO run a0635b52

## Forensics Summary
- **Stop point**: CTO run `a0635b52-5739-441f-83ad-2aa43d6ae78b` (investigating `SYM-68`) stalled at `2026-05-20T00:20:01Z` after 3 simultaneous sub-task (Task tool) failures.
- **Root Cause**:
    1. **Agent Hang**: The CTO agent (`gpt-5.1-codex-mini`) appears to hang when multiple simultaneous sub-tasks fail, leaving the process "active" but silent.
    2. **Recursive Recovery**: The Paperclip watchdog detected the silence and created a new recovery issue (`SYM-72`), which triggered this investigation (`SYM-73`). This created a recursive recovery loop where a recovery run's failure triggered more recovery work.
- **Evidence**:
    - Process `445045` (run `a0635b52`) and `441608` (run `501b0a9e`) are still alive but silent for over 1 hour.
    - NDJSON logs show `task_notification` errors immediately preceding the silence.
    - Subsequent run `9f5bf6a1` successfully resolved the underlying Composer silence, but the previous CTO runs remained stalled.

## General Product Rule
- **Contract**: "Paperclip must not create silent-run recovery issues for runs that are already performing recovery on a parent silent-run issue (recursive recovery). Instead, it should escalate to a critical alert or human intervention after a higher threshold."
- **Contract**: "Agent processes should have a watchdog that terminates the process if it becomes unresponsive after tool errors."

## Phased Subtasks
- **Phase 0: Hygiene** (Assignee: Lead Engineer)
    - Kill stalled CTO processes `441608` and `445045`.
    - Mark `SYM-68` as `done` (Composer work is already verified complete).
    - Mark `SYM-72` as `done`.
- **Phase 1: Documentation** (Assignee: Lead Engineer)
    - Update `doc/execution-semantics.md` with the recursive recovery prevention rule.
- **Phase 2: Implementation** (Assignee: CodexCoder)
    - Implement depth-bounding or recursive-check in `recovery.scan_silent_active_runs`.

## Invariants Check
1. **Productive work continues**: Killing stalled processes allows the agent to be woken for new productive work without being blocked by "active" but hung runs.
2. **Only real blockers stop work**: Hung processes are pseudo-blockers. Detecting and killing them ensures only real blockers stop work.
3. **No infinite loops**: The proposed rule explicitly prevents the recursive recovery loop.
