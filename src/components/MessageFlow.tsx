import { useEffect, useRef, useCallback } from "react";
import type { FlowItem } from "../lib/types";
import { Markdown } from "./Markdown";
import { SubAgentCardGroup } from "./SubAgentCardGroup";
import { TypingIndicator } from "./TypingIndicator";
import { useLanguage } from "../hooks/useLanguage";

interface MessageFlowProps {
  items: FlowItem[];
  isStreaming: boolean;
  phase?: string;
}

/** Renders the vertical message flow with auto-scroll. Doubao-style: no bubbles. */
export function MessageFlow({ items, isStreaming, phase }: MessageFlowProps) {
  const { t } = useLanguage();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const isProgrammaticScrollRef = useRef(false);

  const checkIsAtBottom = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  }, []);

  useEffect(() => {
    if (isAtBottomRef.current && bottomRef.current) {
      isProgrammaticScrollRef.current = true;
      bottomRef.current.scrollIntoView({ behavior: "instant" });
      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = false;
      });
    }
  }, [items, isStreaming]);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={checkIsAtBottom}
      style={{ flex: 1, overflowY: "auto" }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24 }}>
        {items.map((item, idx) => {
          switch (item.type) {
            case "user_message":
              return (
                <div
                  key={item.message.id}
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      fontSize: 16,
                      lineHeight: 1.6,
                      color: "var(--user-msg-color)",
                      textAlign: "right",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.message.content}
                  </div>
                </div>
              );

            case "ai_message":
              if (item.message.content === "__STOPPED__") {
                return (
                  <div
                    key={item.message.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      borderRadius: "var(--radius-xl)",
                      padding: "10px 16px",
                      fontSize: 13,
                      background: "var(--dbx-fill-trans-10)",
                      color: "var(--dbx-text-tertiary)",
                      animation: "fadeIn 0.2s ease",
                    }}
                  >
                    <svg width="16" height="16" style={{ color: "var(--dbx-text-quaternary)", flexShrink: 0 }} fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    {t.researchStopped}
                  </div>
                );
              }
              return (
                <div
                  key={item.message.id}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  <div style={{ maxWidth: "90%" }}>
                    {/* Content - no bubble, plain text with markdown */}
                    <div style={{ color: "var(--bot-msg-color)" }}>
                      {item.message.content ? (
                        <>
                          <Markdown content={item.message.content} />
                          {isStreaming &&
                            idx === items.length - 1 &&
                            !item.message.hasSubAgents && (
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
                        <TypingIndicator />
                      )}
                    </div>
                  </div>
                </div>
              );

            case "subagent_group":
              return (
                <div
                  key={item.group.id}
                  style={{ animation: "slideUp 0.3s ease" }}
                >
                  <SubAgentCardGroup group={item.group} />
                </div>
              );

            case "synthesizing":
              return (
                <div
                  key={`synth-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderRadius: "var(--radius-xl)",
                    padding: "10px 16px",
                    fontSize: 13,
                    background: "rgba(255,149,0,0.06)",
                    color: "var(--dbx-function-warning)",
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  <svg width="16" height="16" style={{ color: "var(--dbx-function-warning)", animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.synthesizingResults}
                </div>
              );

            case "typing":
              return (
                <div key={`typing-${idx}`} style={{ display: "flex", justifyContent: "flex-start" }}>
                  <TypingIndicator />
                </div>
              );

            default:
              return null;
          }
        })}

        {/* Thinking indicator: shown when streaming but no AI response yet */}
        {isStreaming &&
          items.length > 0 &&
          items[items.length - 1].type === "user_message" && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                animation: "fadeIn 0.2s ease",
              }}
            >
              <div style={{ color: "var(--dbx-text-tertiary)" }}>
                <TypingIndicator />
              </div>
            </div>
          )}

        {/* Synthesizing indicator */}
        {isStreaming &&
          phase === "synthesizing" &&
          items.length > 0 &&
          items[items.length - 1].type !== "ai_message" && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                animation: "fadeIn 0.2s ease",
              }}
            >
              <div style={{ color: "var(--dbx-text-tertiary)" }}>
                <TypingIndicator />
              </div>
            </div>
          )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
