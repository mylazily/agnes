import type { ReactNode } from "react";
import type { SubAgentStatus } from "../lib/types";

const statusConfig: Record<
  SubAgentStatus,
  { color: string; labelKey: "taskPending" | "taskSummarizing" | "taskCancelled" | "noContentYet" | "specialistAgents"; pulse?: boolean }
> = {
  pending: { color: "var(--dbx-text-quaternary)", labelKey: "taskPending" },
  running: { color: "var(--dbx-fill-primary)", labelKey: "specialistAgents", pulse: true },
  complete: { color: "var(--dbx-function-success)", labelKey: "specialistAgents" },
  error: { color: "var(--dbx-function-danger)", labelKey: "specialistAgents" },
  cancelled: { color: "var(--dbx-text-tertiary)", labelKey: "taskCancelled" },
};

const statusLabels: Record<SubAgentStatus, string> = {
  pending: "pending",
  running: "running",
  complete: "complete",
  error: "error",
  cancelled: "cancelled",
};

const statusIcons: Record<SubAgentStatus, ReactNode> = {
  pending: (
    <svg width="10" height="10" fill="currentColor" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  running: (
    <svg width="10" height="10" fill="currentColor" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" />
    </svg>
  ),
  complete: (
    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  error: (
    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  cancelled: (
    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  ),
};

export function StatusBadge({ status }: { status: SubAgentStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        borderRadius: "var(--radius-sm)",
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 500,
        color: cfg.color,
        background: "var(--dbx-fill-trans-10)",
        animation: cfg.pulse ? "pulse 2s infinite" : undefined,
      }}
    >
      {statusIcons[status]}
      {statusLabels[status]}
    </span>
  );
}
