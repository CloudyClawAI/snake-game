# Execution Semantics

This document defines the liveness, recovery, and termination rules for agent heartbeat runs in Paperclip.

## Liveness and Watchdog

Paperclip monitors active heartbeat runs for output silence.

1.  **Suspicious Silence**: After 1 hour of no output, a run is considered suspicious. Paperclip creates a "Review silent active run" issue to investigate.
2.  **Critical Silence**: After 4 hour of no output, a run is considered critical.
3.  **Watchdog Termination Rule**: The control plane watchdog must forcefully terminate any heartbeat run that exceeds the critical silence threshold.

## Recursive Recovery Prevention

To prevent infinite recovery loops:

1.  **No Recursive Recovery Issues**: Paperclip must not create silent-run recovery issues for runs that are already performing recovery on a parent silent-run issue.
2.  **Escalation**: If a recovery run itself becomes silent, it should be escalated to a critical alert or human intervention instead of spawning another recovery issue.

## Agent Termination Contract

Every agent-owned heartbeat run must guarantee the termination of all child processes before exiting.

1.  **Process Groups**: Agents should spawn tool processes (e.g., browsers, servers) in a new process group.
2.  **Cleanup on Exit**: On heartbeat completion or termination, the agent must kill the entire process group to ensure no lingering zombie processes remain.
3.  **Force-kill & confirmation**: If the silent-run watchdog marks an active run as suspicious/critical while its process group is still alive and producing no output, treat the run as terminal—capture the PID/process-group metadata, kill the entire group immediately, and escalate via a single `request_confirmation` so the board sees the evidence before the follow-up child issue is resolved. This prevents recursive recovery issues.
