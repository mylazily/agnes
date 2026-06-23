import { useState, useEffect, useCallback, useRef } from "react";
import type { SubAgentGroup } from "../lib/types";
import { SubAgentCard } from "./SubAgentCard";
import { useLanguage } from "../hooks/useLanguage";

/** Accordion-style SubAgent card group with progress bar. */
export function SubAgentCardGroup({ group }: { group: SubAgentGroup }) {
  const { t } = useLanguage();
  const total = group.tasks.length;
  const completed = group.tasks.filter((t) => t.status === "complete").length;
  const percent = total > 0 ? (completed / total) * 100 : 0;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [groupExpanded, setGroupExpanded] = useState(true);
  const manuallyToggledRef = useRef<Set<string>>(new Set());
  const prevStatusRef = useRef<Map<string, string>>(new Map());

  // Auto-expand running cards, auto-collapse completed cards
  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      let changed = false;

      for (const task of group.tasks) {
        const prevStatus = prevStatusRef.current.get(task.id);
        const statusChanged = prevStatus !== undefined && prevStatus !== task.status;
        prevStatusRef.current.set(task.id, task.status);

        if (manuallyToggledRef.current.has(task.id)) continue;

        if (task.status === "running" && (statusChanged || prevStatus === undefined)) {
          if (!next.has(task.id)) {
            next.add(task.id);
            changed = true;
          }
        } else if (task.status === "complete" && statusChanged) {
          if (next.has(task.id)) {
            next.delete(task.id);
            changed = true;
          }
        }
      }

      return changed ? next : prev;
    });
  }, [group.tasks.map((t) => `${t.id}:${t.status}`).join(",")]);

  const toggleCard = useCallback((id: string) => {
    manuallyToggledRef.current.add(id);
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div
      style={{
        borderRadius: "var(--radius-xl)",
        padding: 12,
        background: "var(--dbx-fill-trans-10)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          cursor: "pointer",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
        onClick={() => setGroupExpanded((v) => !v)}
      >
        <svg
          width="12"
          height="12"
          style={{
            color: "var(--dbx-text-quaternary)",
            transition: "transform 0.2s ease",
            transform: groupExpanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <svg width="14" height="14" style={{ color: "var(--dbx-fill-primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--dbx-text-secondary)" }}>
          {t.specialistAgents}
        </span>
        <span style={{ fontSize: 12, color: "var(--dbx-text-quaternary)" }}>
          {completed}/{total} {t.completed}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, width: "100%", overflow: "hidden", borderRadius: 1, background: "var(--dbx-line-divider-5)", marginBottom: 12 }}>
        <div
          style={{
            height: "100%",
            borderRadius: 1,
            transition: "width 0.5s ease-out",
            width: `${percent}%`,
            background: "var(--dbx-fill-primary)",
          }}
        />
      </div>

      {/* Cards */}
      {groupExpanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {group.tasks.map((task, idx) => (
            <SubAgentCard
              key={task.id}
              task={task}
              isOpen={expandedIds.has(task.id)}
              onToggle={() => toggleCard(task.id)}
              index={idx + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
