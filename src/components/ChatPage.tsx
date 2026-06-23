import { useState, useEffect, useRef, useCallback } from "react";
import { useAgentStream } from "../hooks/useAgentStream";
import { Header } from "./Header";
import { WelcomeScreen } from "./WelcomeScreen";
import { MessageFlow } from "./MessageFlow";
import { ChatInput } from "./ChatInput";
import { useLanguage } from "../hooks/useLanguage";
import type { MultimodalMode, ChatMessage } from "../lib/types";

interface ChatPageProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

/** Main chat page -- doubao-style layout with integrated multimodal generation. */
export function ChatPage({ onToggleSidebar, sidebarOpen }: ChatPageProps) {
  const { t } = useLanguage();
  const [multimodalMode, setMultimodalMode] = useState<MultimodalMode>("text");
  const [isGenerating, setIsGenerating] = useState(false);
  const videoPollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const convIdRef = useRef<string>(crypto.randomUUID());

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
    setMessages,
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

  // Cleanup video poll timer on unmount
  useEffect(() => {
    return () => {
      if (videoPollTimerRef.current) {
        clearTimeout(videoPollTimerRef.current);
      }
    };
  }, []);

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

  // -- Image generation --
  const generateImage = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    const assistantMsgId = `img-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      multimodalType: "image",
      orderIdx: Date.now(),
    };
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      multimodalType: "image",
      generationStatus: "generating",
      orderIdx: Date.now() + 1,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const res = await fetch("/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "makers-conversation-id": convIdRef.current,
        },
        body: JSON.stringify({ action: "generate", prompt, size: "1024x1024" }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Image generation failed");
      }
      const imageUrl = data.url || data.imageUrl || null;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, imageUrl: imageUrl || undefined, generationStatus: "ready" as const }
            : m
        )
      );
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, generationStatus: "error" as const, generationError: e.message || "Unknown error" }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  }, [setMessages]);

  // -- Video generation --
  const pollVideoStatus = useCallback((taskId: string, assistantMsgId: string) => {
    const poll = async () => {
      try {
        const res = await fetch("/video", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "makers-conversation-id": convIdRef.current,
          },
          body: JSON.stringify({ action: "status", taskId }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Polling failed");
        }

        if (data.status === "ready" || data.status === "completed" || data.url) {
          const videoUrl = data.url || data.videoUrl || null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, videoUrl: videoUrl || undefined, generationStatus: "ready" as const }
                : m
            )
          );
          setIsGenerating(false);
          return;
        }

        if (data.status === "failed" || data.status === "error") {
          throw new Error(data.message || "Video generation failed");
        }

        // Still processing
        videoPollTimerRef.current = setTimeout(() => poll(), 3000);
      } catch (e: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, generationStatus: "error" as const, generationError: e.message || "Unknown error" }
              : m
          )
        );
        setIsGenerating(false);
      }
    };
    poll();
  }, [setMessages]);

  const generateVideo = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    const assistantMsgId = `vid-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
      multimodalType: "video",
      orderIdx: Date.now(),
    };
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      multimodalType: "video",
      generationStatus: "generating",
      orderIdx: Date.now() + 1,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    try {
      const res = await fetch("/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "makers-conversation-id": convIdRef.current,
        },
        body: JSON.stringify({
          action: "create",
          prompt,
          num_frames: 30,
          frame_rate: 6,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Video creation failed");
      }
      const id = data.taskId || data.task_id || data.id;
      if (!id) {
        throw new Error("No task ID returned");
      }
      // Update to polling status
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, generationStatus: "polling" as const }
            : m
        )
      );
      videoPollTimerRef.current = setTimeout(() => pollVideoStatus(id, assistantMsgId), 3000);
    } catch (e: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, generationStatus: "error" as const, generationError: e.message || "Unknown error" }
            : m
        )
      );
      setIsGenerating(false);
    }
  }, [setMessages, pollVideoStatus]);

  // -- Unified send handler --
  const handleSend = useCallback(async (text: string) => {
    if (isStreaming || isGenerating) return;

    // Reset to text mode after sending
    const currentMode = multimodalMode;

    if (currentMode === "image") {
      await generateImage(text);
    } else if (currentMode === "video") {
      await generateVideo(text);
    } else {
      sendMessage(text);
    }
  }, [isStreaming, isGenerating, multimodalMode, generateImage, generateVideo, sendMessage]);

  // -- Unified stop handler --
  const handleStop = useCallback(() => {
    if (isStreaming) {
      stopStreaming();
    }
    if (isGenerating) {
      // Cancel video polling
      if (videoPollTimerRef.current) {
        clearTimeout(videoPollTimerRef.current);
        videoPollTimerRef.current = null;
      }
      setIsGenerating(false);
      // Mark last generating message as error
      setMessages((prev) => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (
            updated[i].role === "assistant" &&
            (updated[i].generationStatus === "generating" || updated[i].generationStatus === "polling")
          ) {
            updated[i] = { ...updated[i], generationStatus: "error", generationError: "Cancelled" };
            break;
          }
        }
        return updated;
      });
    }
  }, [isStreaming, isGenerating, stopStreaming, setMessages]);

  // -- Reset chat --
  const handleResetChat = useCallback(() => {
    resetChat();
    setMultimodalMode("text");
    setIsGenerating(false);
    if (videoPollTimerRef.current) {
      clearTimeout(videoPollTimerRef.current);
      videoPollTimerRef.current = null;
    }
  }, [resetChat]);

  const handleModeChange = useCallback((newMode: MultimodalMode) => {
    setMultimodalMode(newMode);
  }, []);

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
          isStreaming={isStreaming || isGenerating}
          mode={multimodalMode}
          onModeChange={handleModeChange}
        />
      </div>
    </div>
  );
}
