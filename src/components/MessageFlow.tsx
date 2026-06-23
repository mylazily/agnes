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

            case "ai_message": {
              const msg = item.message;

              // -- Image generation message --
              if (msg.multimodalType === "image") {
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      animation: "fadeIn 0.2s ease",
                    }}
                  >
                    <div style={{ maxWidth: "90%" }}>
                      {msg.generationStatus === "generating" && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            padding: 20,
                            background: "var(--dbx-bg-surface)",
                            border: "1px solid var(--dbx-line-7)",
                            borderRadius: "var(--radius-2xl)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--dbx-text-tertiary)" }}>
                            <svg width="16" height="16" style={{ animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {t.imageGenerating}
                          </div>
                          {/* Placeholder skeleton */}
                          <div
                            style={{
                              width: "100%",
                              aspectRatio: "1/1",
                              maxWidth: 400,
                              borderRadius: "var(--radius-xl)",
                              background: "var(--dbx-fill-trans-10)",
                              animation: "pulse 2s ease-in-out infinite",
                            }}
                          />
                        </div>
                      )}

                      {msg.generationStatus === "ready" && msg.imageUrl && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            padding: 20,
                            background: "var(--dbx-bg-surface)",
                            border: "1px solid var(--dbx-line-7)",
                            borderRadius: "var(--radius-2xl)",
                          }}
                        >
                          <img
                            src={msg.imageUrl}
                            alt="generated"
                            style={{ width: "100%", maxWidth: 400, borderRadius: "var(--radius-xl)", objectFit: "contain" }}
                          />
                          <a
                            href={msg.imageUrl}
                            download
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              cursor: "pointer",
                              padding: "8px 16px",
                              fontSize: 12,
                              fontWeight: 600,
                              borderRadius: "var(--radius-xl)",
                              background: "var(--dbx-text-primary)",
                              color: "var(--dbx-bg-surface)",
                              textDecoration: "none",
                              transition: "opacity 0.15s ease",
                              width: "fit-content",
                            }}
                          >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {t.downloadButton}
                          </a>
                        </div>
                      )}

                      {msg.generationStatus === "error" && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            borderRadius: "var(--radius-lg)",
                            border: "1px solid rgba(255,59,48,0.15)",
                            background: "rgba(255,59,48,0.06)",
                            padding: "10px 16px",
                            fontSize: 13,
                            color: "var(--dbx-function-danger)",
                          }}
                        >
                          <svg width="16" height="16" style={{ flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {msg.generationError || t.generationError}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // -- Video generation message --
              if (msg.multimodalType === "video") {
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      animation: "fadeIn 0.2s ease",
                    }}
                  >
                    <div style={{ maxWidth: "90%" }}>
                      {(msg.generationStatus === "generating" || msg.generationStatus === "polling") && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            padding: 20,
                            background: "var(--dbx-bg-surface)",
                            border: "1px solid var(--dbx-line-7)",
                            borderRadius: "var(--radius-2xl)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--dbx-text-tertiary)" }}>
                            <svg width="16" height="16" style={{ animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {msg.generationStatus === "generating" ? t.videoGenerating : t.videoPollingChat}
                          </div>
                          {/* Placeholder skeleton */}
                          <div
                            style={{
                              width: "100%",
                              aspectRatio: "16/9",
                              maxWidth: 480,
                              borderRadius: "var(--radius-xl)",
                              background: "var(--dbx-fill-trans-10)",
                              animation: "pulse 2s ease-in-out infinite",
                            }}
                          />
                        </div>
                      )}

                      {msg.generationStatus === "ready" && msg.videoUrl && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                            padding: 20,
                            background: "var(--dbx-bg-surface)",
                            border: "1px solid var(--dbx-line-7)",
                            borderRadius: "var(--radius-2xl)",
                          }}
                        >
                          <video
                            src={msg.videoUrl}
                            controls
                            style={{ width: "100%", maxWidth: 480, borderRadius: "var(--radius-xl)" }}
                          />
                          <a
                            href={msg.videoUrl}
                            download
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              cursor: "pointer",
                              padding: "8px 16px",
                              fontSize: 12,
                              fontWeight: 600,
                              borderRadius: "var(--radius-xl)",
                              background: "var(--dbx-text-primary)",
                              color: "var(--dbx-bg-surface)",
                              textDecoration: "none",
                              transition: "opacity 0.15s ease",
                              width: "fit-content",
                            }}
                          >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {t.downloadButton}
                          </a>
                        </div>
                      )}

                      {msg.generationStatus === "error" && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            borderRadius: "var(--radius-lg)",
                            border: "1px solid rgba(255,59,48,0.15)",
                            background: "rgba(255,59,48,0.06)",
                            padding: "10px 16px",
                            fontSize: 13,
                            color: "var(--dbx-function-danger)",
                          }}
                        >
                          <svg width="16" height="16" style={{ flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {msg.generationError || t.generationError}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // -- Normal text message --
              if (msg.content === "__STOPPED__") {
                return (
                  <div
                    key={msg.id}
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
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  <div style={{ maxWidth: "90%" }}>
                    {/* Content - no bubble, plain text with markdown */}
                    <div style={{ color: "var(--bot-msg-color)" }}>
                      {msg.content ? (
                        <>
                          <Markdown content={msg.content} />
                          {isStreaming &&
                            idx === items.length - 1 &&
                            !msg.hasSubAgents && (
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
            }

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
