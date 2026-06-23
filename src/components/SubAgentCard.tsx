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
      // Wait for exit animation, then swap text and enter
      const timer = setTimeout(() => {
        setDisplayText(text);
        setAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [text]);

  return (
    <span
      className="flex-1 truncate text-[13px] font-medium inline-block transition-all duration-300 ease-out"
      style={{
        color: "rgba(0,0,0,0.8)",
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

  // Resolve description: replace special markers with i18n text
  function resolveDescription(desc: string): string {
    if (desc === "__PENDING__") return t.taskPending;
    if (desc === "__SUMMARIZING__") return t.taskSummarizing;
    if (!desc) return `${task.subagentType || "researcher"} agent`;
    return stripMarkdown(desc);
  }

  const borderColor = {
    pending: "rgba(0,0,0,0.07)",
    running: "rgba(0,0,0,0.07)",
    complete: "rgba(0,101,253,0.15)",
    error: "rgba(255,59,48,0.2)",
    cancelled: "rgba(0,0,0,0.05)",
  }[task.status];

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${borderColor}`,
        background: "#ffffff",
      }}
    >
      {/* Card Header */}
      <button
        onClick={onToggle}
        className="cursor-pointer flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors duration-150"
        style={{ background: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <svg
          className={`h-3 w-3 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
          style={{ color: "rgba(0,0,0,0.2)" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>

        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold"
          style={{ background: "#f4f4f4", color: "rgba(0,0,0,0.4)" }}
        >
          {index}
        </span>

        {/* Phase-based icon */}
        {task.description === "__PENDING__" ? (
          <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-[1.5px]" style={{ borderColor: "rgba(0,0,0,0.08)", borderTopColor: "#0065fd" }} />
        ) : task.description === "__SUMMARIZING__" ? (
          <svg className="h-3.5 w-3.5 shrink-0" style={{ color: "#0065fd" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ) : task.status === "complete" ? (
          <svg className="h-3.5 w-3.5 shrink-0" style={{ color: "#0065fd" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5 shrink-0" style={{ color: "rgba(0,0,0,0.3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        )}

        <AnimatedTitle
          text={resolveDescription(task.description)}
        />

        <DurationDisplay startedAt={task.startedAt} duration={task.duration} />
        <StatusBadge status={task.status} />
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          {/* Tool calls — one bordered chip per row */}
          {task.toolCalls.length > 0 && (
            <ul className="flex flex-col gap-1.5 px-3 py-2 max-h-[88px] overflow-y-auto overscroll-contain" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
              {task.toolCalls.map((tc) => (
                <li
                  key={tc.id}
                  className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors"
                  style={{ borderColor: "rgba(0,0,0,0.05)", background: "#ffffff" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff")}
                >
                  {/* Status icon */}
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {tc.status === "pending" ? (
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-[1.5px]" style={{ borderColor: "rgba(0,0,0,0.08)", borderTopColor: "#0065fd" }} />
                    ) : tc.status === "completed" ? (
                      <svg className="h-3.5 w-3.5" style={{ color: "#0065fd" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="h-3.5 w-3.5" style={{ color: "#ff3b30" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>

                  {/* Tool name pill */}
                  <span
                    className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium"
                    style={{ background: "#f4f4f4", color: "rgba(0,0,0,0.6)" }}
                  >
                    {tc.name}
                  </span>

                  {/* Args summary fills remaining space */}
                  {tc.argSummary ? (
                    <span
                      className="min-w-0 flex-1 truncate"
                      style={{ color: "rgba(0,0,0,0.3)" }}
                      title={tc.argSummary}
                    >
                      {tc.argSummary}
                    </span>
                  ) : (
                    <span className="min-w-0 flex-1" />
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Content */}
          <div
            ref={contentRef}
            onScroll={checkIsAtBottom}
            className="max-h-64 overflow-y-auto overscroll-contain px-4 py-3 text-[13px] leading-relaxed"
            style={{ color: "rgba(0,0,0,0.7)" }}
          >
            {task.content ? (
              <>
                <Markdown content={task.content} />
                {task.status === "running" && (
                  <span
                    className="ml-0.5 inline-block h-4 w-[2px] animate-pulse align-middle"
                    style={{ background: "#0065fd" }}
                  />
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 py-2" style={{ color: "rgba(0,0,0,0.2)" }}>
                {(task.status === "running" || task.status === "pending") ? (
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{
                          background: "#0065fd",
                          animation: "bounce 1.4s infinite ease-in-out both",
                          animationDelay: `${i * 0.16}s`,
                        }}
                      />
                    ))}
                  </span>
                ) : task.status === "cancelled" ? (
                  <span className="text-xs" style={{ color: "rgba(0,0,0,0.3)" }}>{t.taskCancelled}</span>
                ) : (
                  <span className="text-xs">{t.noContentYet}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
