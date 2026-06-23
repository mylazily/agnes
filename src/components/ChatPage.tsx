import { useState, useEffect, useRef, useCallback } from "react";
import { useAgentStream } from "../hooks/useAgentStream";
import { Header } from "./Header";
import { WelcomeScreen } from "./WelcomeScreen";
import { MessageFlow } from "./MessageFlow";
import { ChatInput } from "./ChatInput";
import { useLanguage } from "../hooks/useLanguage";
import type { ChatMessage } from "../lib/types";

interface ChatPageProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

/** Main chat page -- doubao-style layout with integrated multimodal generation. */
export function ChatPage({ onToggleSidebar, sidebarOpen }: ChatPageProps) {
  const { t } = useLanguage();

  const {
    messages,
    phase,
    isStreaming,
    isLoadingHistory,
    loadError,
    dismissLoadError,
    sendMessage,
    stopStreaming,
    resetChat,
    buildFlowItems,
    loadConversation,
    getStoredConversations,
    removeConversationFromStorage,
  } = useAgentStream();

  const hasMessages = messages.length > 0;
  const flowItems = buildFlowItems();

  // Auto-dismiss load error after 3s
  useEffect(() => {
    if (loadError) {
      const timer = setTimeout(() => dismissLoadError(), 3000);
      return () => clearTimeout(timer);
    }
  }, [loadError, dismissLoadError]);

  const loadErrorText = loadError
    ? loadError === "empty"
      ? t.loadHistoryEmpty
      : `${t.loadHistoryFailed}: ${loadError}`
    : null;

  // Force re-render when conversations change (after removal)
  const [, forceUpdate] = useState(0);
  const handleRemoveConversation = (id: string) => {
    removeConversationFromStorage(id);
    forceUpdate((n: number) => n + 1);
  };

  // -- Unified send handler: AI auto-detects intent --
  const handleSend = useCallback(async (text: string) => {
    if (isStreaming) return;
    sendMessage(text);
  }, [isStreaming, sendMessage]);

  // -- Unified stop handler --
  const handleStop = useCallback(() => {
    if (isStreaming) {
      stopStreaming();
    }
  }, [isStreaming, stopStreaming]);

  // -- Reset chat --
  const handleResetChat = useCallback(() => {
    resetChat();
  }, [resetChat]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--dbx-bg-body)" }}>
      <Header
        phase={phase}
        hasMessages={hasMessages}
        onNewChat={handleResetChat}
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      {/* Floating error toast */}
      {loadErrorText && (
        <div style={{ position: "absolute", top: 64, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 50 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderRadius: "var(--radius-lg)",
              border: "1px solid rgba(255,59,48,0.15)",
              background: "rgba(255,59,48,0.06)",
              padding: "10px 16px",
              boxShadow: "var(--shadow-md)",
              animation: "fade-in-up 0.3s ease",
            }}
          >
            <svg width="16" height="16" style={{ color: "var(--dbx-function-danger)", flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span style={{ fontSize: 13, color: "var(--dbx-function-danger)" }}>{loadErrorText}</span>
            <button
              onClick={dismissLoadError}
              style={{
                cursor: "pointer",
                marginLeft: 4,
                borderRadius: "var(--radius-xs)",
                padding: 2,
                background: "transparent",
                border: "none",
                color: "rgba(255,59,48,0.4)",
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {isLoadingHistory ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--dbx-text-tertiary)" }}>
              <svg width="16" height="16" style={{ animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t.loadingHistory}
            </div>
          </div>
        ) : hasMessages ? (
          <MessageFlow items={flowItems} isStreaming={isStreaming} phase={phase} />
        ) : (
          <WelcomeScreen
            onSelect={sendMessage}
            onLoadConversation={loadConversation}
            storedConversations={getStoredConversations()}
            onRemoveConversation={handleRemoveConversation}
          />
        )}

        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
