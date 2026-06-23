import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../hooks/useLanguage";

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
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
        <div className="chat-input-wrapper">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.inputPlaceholder}
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
                    ? "var(--dbx-text-primary)"
                    : "var(--dbx-neutral-200)",
                  color: value.trim() ? "var(--dbx-bg-surface)" : "var(--dbx-text-quaternary)",
                  cursor: value.trim() ? "pointer" : "default",
                  transition: "all var(--transition-fast)",
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
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
            {/* Left: attach button */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
