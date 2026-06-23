import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../hooks/useLanguage";
import type { MultimodalMode } from "../lib/types";

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  mode: MultimodalMode;
  onModeChange: (mode: MultimodalMode) => void;
}

export function ChatInput({ onSend, onStop, isStreaming, mode, onModeChange }: ChatInputProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, [value]);

  // Reset input when mode changes
  useEffect(() => {
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [mode]);

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const getPlaceholder = () => {
    switch (mode) {
      case "image":
        return t.imageGenPlaceholder;
      case "video":
        return t.videoGenPlaceholder;
      default:
        return t.inputPlaceholder;
    }
  };

  const isMultimodal = mode !== "text";

  return (
    <div
      style={{
        padding: "12px 16px 16px",
        flexShrink: 0,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 680,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Mode indicator bar (shown when in image/video mode) */}
        {isMultimodal && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              padding: "6px 12px",
              borderRadius: "var(--radius-lg)",
              background: mode === "image"
                ? "rgba(88, 101, 242, 0.08)"
                : "rgba(255, 149, 0, 0.08)",
              border: `1px solid ${mode === "image" ? "rgba(88, 101, 242, 0.15)" : "rgba(255, 149, 0, 0.15)"}`,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: mode === "image" ? "var(--dbx-fill-primary)" : "var(--dbx-function-warning)" }}
            >
              {mode === "image" ? (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </>
              ) : (
                <>
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </>
              )}
            </svg>
            <span style={{ fontSize: 12, fontWeight: 500, color: mode === "image" ? "var(--dbx-fill-primary)" : "var(--dbx-function-warning)" }}>
              {mode === "image" ? t.toolImage : t.toolVideo}
            </span>
            <button
              type="button"
              onClick={() => onModeChange("text")}
              style={{
                marginLeft: "auto",
                cursor: "pointer",
                padding: "2px 6px",
                borderRadius: "var(--radius-xs)",
                border: "none",
                background: "transparent",
                color: "var(--dbx-text-quaternary)",
                fontSize: 14,
                lineHeight: 1,
                transition: "color var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--dbx-text-secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--dbx-text-quaternary)")}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div
          className="chat-input-wrapper"
          style={isMultimodal ? {
            borderColor: mode === "image"
              ? "rgba(88, 101, 242, 0.3)"
              : "rgba(255, 149, 0, 0.3)",
          } : undefined}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={isStreaming}
            rows={1}
            style={{
              width: "100%",
              padding: "12px 52px 12px 16px",
              fontSize: 14,
              lineHeight: 1.5,
              color: "var(--dbx-text-primary)",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              fontFamily: "var(--font-sans)",
              minHeight: 44,
              maxHeight: 200,
            }}
          />

          {/* Action button (inside textarea, right side) */}
          <div
            style={{
              position: "absolute",
              right: 8,
              bottom: 6,
              display: "flex",
              alignItems: "center",
            }}
          >
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "var(--dbx-text-primary)",
                  color: "var(--dbx-bg-surface)",
                  cursor: "pointer",
                  transition: "opacity var(--transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!value.trim()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: value.trim()
                    ? (isMultimodal
                      ? (mode === "image" ? "var(--dbx-fill-primary)" : "var(--dbx-function-warning)")
                      : "var(--dbx-text-primary)")
                    : "var(--dbx-neutral-200)",
                  color: value.trim() ? "var(--dbx-bg-surface)" : "var(--dbx-text-quaternary)",
                  cursor: value.trim() ? "pointer" : "default",
                  transition: "all var(--transition-fast)",
                }}
              >
                {isMultimodal ? (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* Bottom toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 12px 8px",
            }}
          >
            {/* Left: tool buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {/* Image tool button */}
              <button
                type="button"
                onClick={() => onModeChange(mode === "image" ? "text" : "image")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: mode === "image" ? "rgba(88, 101, 242, 0.1)" : "transparent",
                  color: mode === "image" ? "var(--dbx-fill-primary)" : "var(--dbx-text-quaternary)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  if (mode !== "image") e.currentTarget.style.color = "var(--dbx-text-tertiary)";
                }}
                onMouseLeave={(e) => {
                  if (mode !== "image") e.currentTarget.style.color = "var(--dbx-text-quaternary)";
                }}
                title={t.toolImage}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </button>

              {/* Video tool button */}
              <button
                type="button"
                onClick={() => onModeChange(mode === "video" ? "text" : "video")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: mode === "video" ? "rgba(255, 149, 0, 0.1)" : "transparent",
                  color: mode === "video" ? "var(--dbx-function-warning)" : "var(--dbx-text-quaternary)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                onMouseEnter={(e) => {
                  if (mode !== "video") e.currentTarget.style.color = "var(--dbx-text-tertiary)";
                }}
                onMouseLeave={(e) => {
                  if (mode !== "video") e.currentTarget.style.color = "var(--dbx-text-quaternary)";
                }}
                title={t.toolVideo}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </button>

              {/* Attach button */}
              <button
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: "transparent",
                  color: "var(--dbx-text-quaternary)",
                  cursor: "pointer",
                  transition: "color var(--transition-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--dbx-text-tertiary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--dbx-text-quaternary)")}
                title={t.attachFile}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
            </div>

            {/* Right: hint text */}
            <span style={{ fontSize: 11, color: "var(--dbx-text-quaternary)" }}>
              Enter {t.sendButton}, Shift + Enter
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
