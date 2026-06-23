import { useRef, useEffect, useCallback, useState } from "react";
import type { SubAgentTask } from "../lib/types";
import { StatusBadge } from "./StatusBadge";
import { DurationDisplay } from "./DurationDisplay";
import { Markdown } from "./Markdown";
import { useLanguage } from "../hooks/useLanguage";

/** Strip common Markdown syntax for clean plain-text display. */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/`(.+?)`/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.+?)\]\(.*?\)/g, "$1")
    .trim();
}

/** Animated title that slides up on text change. */
function AnimatedTitle({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);
  const [animating, setAnimating] = useState(false);
  const prevTextRef = useRef(text);

  useEffect(() => {
    if (text !== prevTextRef.current) {
      prevTextRef.current = text;
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayText(text);
        setAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [text]);

  return (
    <span
      style={{
        flex: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: 13,
        fontWeight: 500,
        display: "inline-block",
        transition: "all 0.3s ease-out",
        color: "var(--dbx-text-secondary)",
        transform: animating ? "translateY(-8px)" : "translateY(0)",
        opacity: animating ? 0 : 1,
      }}
      title={displayText}
    >
      {displayText}
    </span>
  );
}

/** A single collapsible SubAgent card. */
export function SubAgentCard({
  task,
  isOpen,
  onToggle,
  index,
}: {
  task: SubAgentTask;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const { t } = useLanguage();
  const contentRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const isProgrammaticScrollRef = useRef(false);

  const checkIsAtBottom = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;
    const el = contentRef.current;
    if (!el) return;
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 30;
  }, []);

  useEffect(() => {
    if (task.status === "running" && isOpen && contentRef.current && isAtBottomRef.current) {
      isProgrammaticScrollRef.current = true;
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = false;
      });
    }
  }, [task.content, task.status, isOpen]);

  function resolveDescription(desc: string): string {
    if (desc === "__PENDING__") return t.taskPending;
    if (desc === "__SUMMARIZING__") return t.taskSummarizing;
    if (!desc) return `${task.subagentType || "researcher"} agent`;
    return stripMarkdown(desc);
  }

  const borderColor = {
    pending: "var(--dbx-line-7)",
    running: "var(--dbx-line-7)",
    complete: "var(--dbx-line-highlight)",
    error: "rgba(255,59,48,0.2)",
    cancelled: "var(--dbx-line-divider-5)",
  }[task.status];

  return (
    <div
      style={{
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        transition: "all 0.2s ease",
        border: `1px solid ${borderColor}`,
        background: "var(--dbx-bg-surface)",
      }}
    >
      {/* Card Header */}
      <button
        onClick={onToggle}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          textAlign: "left",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          transition: "background 0.15s ease",
          color: "inherit",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--dbx-fill-trans-10)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <svg
          width="12"
          height="12"
          style={{
            color: "var(--dbx-text-quaternary)",
            flexShrink: 0,
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        <span
          style={{
            display: "flex",
            width: 20,
            height: 20,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-sm)",
            background: "var(--dbx-bg-elevated)",
            color: "var(--dbx-text-quaternary)",
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          {index}
        </span>

        {/* Phase-based icon */}
        {task.description === "__PENDING__" ? (
          <span
            style={{
              display: "inline-block",
              width: 14,
              height: 14,
              flexShrink: 0,
              borderRadius: "50%",
              border: "1.5px solid var(--dbx-line-7)",
              borderTopColor: "var(--dbx-fill-primary)",
              animation: "spin 1s linear infinite",
            }}
          />
        ) : task.description === "__SUMMARIZING__" ? (
          <svg width="14" height="14" style={{ color: "var(--dbx-fill-primary)", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ) : task.status === "complete" ? (
          <svg width="14" height="14" style={{ color: "var(--dbx-fill-primary)", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg width="14" height="14" style={{ color: "var(--dbx-text-quaternary)", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        )}

        <AnimatedTitle text={resolveDescription(task.description)} />

        <DurationDisplay startedAt={task.startedAt} duration={task.duration} />
        <StatusBadge status={task.status} />
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div style={{ borderTop: "1px solid var(--dbx-line-divider-5)" }}>
          {/* Tool calls */}
          {task.toolCalls.length > 0 && (
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "8px 12px",
                maxHeight: 88,
                overflowY: "auto",
                overscrollBehavior: "contain",
                borderBottom: "1px solid var(--dbx-line-divider-5)",
                margin: 0,
                listStyle: "none",
              }}
            >
              {task.toolCalls.map((tc) => (
                <li
                  key={tc.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--dbx-line-divider-5)",
                    padding: "6px 10px",
                    fontSize: 12,
                    background: "var(--dbx-bg-surface)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--dbx-fill-trans-10)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--dbx-bg-surface)")}
                >
                  {/* Status icon */}
                  <span style={{ display: "flex", width: 16, height: 16, flexShrink: 0, alignItems: "center", justifyContent: "center" }}>
                    {tc.status === "pending" ? (
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          border: "1.5px solid var(--dbx-line-7)",
                          borderTopColor: "var(--dbx-fill-primary)",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    ) : tc.status === "completed" ? (
                      <svg width="14" height="14" style={{ color: "var(--dbx-fill-primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" style={{ color: "var(--dbx-function-danger)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>

                  {/* Tool name pill */}
                  <span
                    style={{
                      flexShrink: 0,
                      borderRadius: "var(--radius-sm)",
                      padding: "2px 6px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 500,
                      background: "var(--dbx-bg-elevated)",
                      color: "var(--dbx-text-tertiary)",
                    }}
                  >
                    {tc.name}
                  </span>

                  {/* Args summary */}
                  {tc.argSummary ? (
                    <span
                      style={{
                        minWidth: 0,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: "var(--dbx-text-quaternary)",
                      }}
                      title={tc.argSummary}
                    >
                      {tc.argSummary}
                    </span>
                  ) : (
                    <span style={{ minWidth: 0, flex: 1 }} />
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Content */}
          <div
            ref={contentRef}
            onScroll={checkIsAtBottom}
            style={{
              maxHeight: 256,
              overflowY: "auto",
              overscrollBehavior: "contain",
              padding: "12px 16px",
              fontSize: 13,
              lineHeight: 1.6,
              color: "var(--dbx-text-secondary)",
            }}
          >
            {task.content ? (
              <>
                <Markdown content={task.content} />
                {task.status === "running" && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: 16,
                      marginLeft: 2,
                      verticalAlign: "middle",
                      background: "var(--dbx-fill-primary)",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                )}
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", color: "var(--dbx-text-quaternary)" }}>
                {(task.status === "running" || task.status === "pending") ? (
                  <span style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-block",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--dbx-fill-primary)",
                          animation: "bounce 1.4s infinite ease-in-out both",
                          animationDelay: `${i * 0.16}s`,
                        }}
                      />
                    ))}
                  </span>
                ) : task.status === "cancelled" ? (
                  <span style={{ fontSize: 12, color: "var(--dbx-text-quaternary)" }}>{t.taskCancelled}</span>
                ) : (
                  <span style={{ fontSize: 12 }}>{t.noContentYet}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
