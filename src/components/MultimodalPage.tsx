import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { Header } from "./Header";

export type MultimodalTab = "image" | "video";

interface MultimodalPageProps {
  defaultTab: MultimodalTab;
  currentMode?: "chat" | "image" | "video";
  onChangeMode?: (mode: "chat" | "image" | "video") => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Image generation                                                    */
/* ------------------------------------------------------------------ */
function ImageTab() {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<"1024x1024" | "1024x768" | "768x1024">("1024x1024");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const convIdRef = useRef<string>(crypto.randomUUID());

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);
    try {
      const res = await fetch("/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "makers-conversation-id": convIdRef.current,
        },
        body: JSON.stringify({ action: "generate", prompt: prompt.trim(), size }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Image generation failed");
      }
      setResultUrl(data.url || data.imageUrl || null);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 680, margin: "0 auto", width: "100%" }}>
      {/* Input card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 20,
          background: "var(--dbx-bg-surface)",
          border: "1px solid var(--dbx-line-7)",
          borderRadius: "var(--radius-2xl)",
        }}
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.imagePlaceholder}
          rows={4}
          style={{
            width: "100%",
            resize: "none",
            outline: "none",
            fontSize: 14,
            fontFamily: "var(--font-sans)",
            background: "var(--dbx-bg-elevated)",
            borderRadius: "var(--radius-xl)",
            padding: "12px 14px",
            color: "var(--dbx-text-primary)",
            border: "none",
            lineHeight: 1.5,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--dbx-text-tertiary)" }}>
            {t.sizeLabel}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {(["1024x1024", "1024x768", "768x1024"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                style={{
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  background: size === s ? "var(--dbx-fill-primary)" : "var(--dbx-bg-elevated)",
                  color: size === s ? "var(--dbx-bg-surface)" : "var(--dbx-text-tertiary)",
                  border: "none",
                  transition: "all 0.15s ease",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          style={{
            cursor: loading || !prompt.trim() ? "default" : "pointer",
            width: "100%",
            padding: "10px 0",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: "var(--radius-xl)",
            background: loading || !prompt.trim() ? "var(--dbx-neutral-200)" : "var(--dbx-text-primary)",
            color: loading || !prompt.trim() ? "var(--dbx-text-quaternary)" : "var(--dbx-bg-surface)",
            border: "none",
            transition: "all 0.15s ease",
          }}
        >
          {loading ? t.generating : t.generateButton}
        </button>
      </div>

      {/* Error */}
      {error && (
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
          {error}
        </div>
      )}

      {/* Result */}
      {resultUrl && (
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
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--dbx-text-primary)" }}>
            {t.imageResultTitle}
          </h3>
          <img
            src={resultUrl}
            alt="generated"
            style={{ width: "100%", borderRadius: "var(--radius-xl)", maxHeight: 480, objectFit: "contain" }}
          />
          <a
            href={resultUrl}
            download
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              cursor: "pointer",
              padding: "8px 0",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: "var(--radius-xl)",
              background: "var(--dbx-text-primary)",
              color: "var(--dbx-bg-surface)",
              textDecoration: "none",
              transition: "opacity 0.15s ease",
            }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t.downloadButton}
          </a>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Video generation                                                    */
/* ------------------------------------------------------------------ */
function VideoTab() {
  const { t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState<5 | 10>(5);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "polling" | "ready" | "error">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const convIdRef = useRef<string>(crypto.randomUUID());

  const clearPoll = () => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
  };

  useEffect(() => {
    return () => clearPoll();
  }, []);

  const pollStatus = async (id: string) => {
    try {
      const res = await fetch("/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "makers-conversation-id": convIdRef.current,
        },
        body: JSON.stringify({ action: "status", taskId: id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Polling failed");
      }

      if (data.status === "ready" || data.status === "completed" || data.url) {
        setStatus("ready");
        setResultUrl(data.url || data.videoUrl || null);
        setLoading(false);
        return;
      }

      if (data.status === "failed" || data.status === "error") {
        throw new Error(data.message || "Video generation failed");
      }

      // Still processing
      pollTimer.current = setTimeout(() => pollStatus(id), 3000);
    } catch (e: any) {
      setStatus("error");
      setError(e.message || "Unknown error");
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    clearPoll();
    setLoading(true);
    setError(null);
    setResultUrl(null);
    setTaskId(null);
    setStatus("idle");

    try {
      const res = await fetch("/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "makers-conversation-id": convIdRef.current,
        },
        body: JSON.stringify({
          action: "create",
          prompt: prompt.trim(),
          num_frames: duration === 5 ? 30 : 60,
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
      setTaskId(id);
      setStatus("polling");
      pollTimer.current = setTimeout(() => pollStatus(id), 3000);
    } catch (e: any) {
      setStatus("error");
      setError(e.message || "Unknown error");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 680, margin: "0 auto", width: "100%" }}>
      {/* Input card */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 20,
          background: "var(--dbx-bg-surface)",
          border: "1px solid var(--dbx-line-7)",
          borderRadius: "var(--radius-2xl)",
        }}
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.videoPlaceholder}
          rows={4}
          style={{
            width: "100%",
            resize: "none",
            outline: "none",
            fontSize: 14,
            fontFamily: "var(--font-sans)",
            background: "var(--dbx-bg-elevated)",
            borderRadius: "var(--radius-xl)",
            padding: "12px 14px",
            color: "var(--dbx-text-primary)",
            border: "none",
            lineHeight: 1.5,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--dbx-text-tertiary)" }}>
            {t.durationLabel}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {([5, 10] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                style={{
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  background: duration === d ? "var(--dbx-fill-primary)" : "var(--dbx-bg-elevated)",
                  color: duration === d ? "var(--dbx-bg-surface)" : "var(--dbx-text-tertiary)",
                  border: "none",
                  transition: "all 0.15s ease",
                }}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          style={{
            cursor: loading || !prompt.trim() ? "default" : "pointer",
            width: "100%",
            padding: "10px 0",
            fontSize: 14,
            fontWeight: 600,
            borderRadius: "var(--radius-xl)",
            background: loading || !prompt.trim() ? "var(--dbx-neutral-200)" : "var(--dbx-text-primary)",
            color: loading || !prompt.trim() ? "var(--dbx-text-quaternary)" : "var(--dbx-bg-surface)",
            border: "none",
            transition: "all 0.15s ease",
          }}
        >
          {loading ? t.generating : t.generateButton}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: "var(--radius-lg)", border: "1px solid rgba(255,59,48,0.15)", background: "rgba(255,59,48,0.06)", padding: "10px 16px", fontSize: 13, color: "var(--dbx-function-danger)" }}>
          <svg width="16" height="16" style={{ flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Polling / Ready */}
      {(status === "polling" || status === "ready") && (
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
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--dbx-text-primary)" }}>
            {t.videoResultTitle}
          </h3>

          {status === "polling" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--dbx-text-tertiary)" }}>
              <svg width="16" height="16" style={{ animation: "spin 1s linear infinite" }} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t.videoPolling}
            </div>
          )}

          {status === "ready" && resultUrl && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--dbx-function-success)" }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t.videoReady}
              </div>
              <video
                src={resultUrl}
                controls
                style={{ width: "100%", borderRadius: "var(--radius-xl)", maxHeight: 480 }}
              />
              <a
                href={resultUrl}
                download
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  cursor: "pointer",
                  padding: "8px 0",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: "var(--radius-xl)",
                  background: "var(--dbx-text-primary)",
                  color: "var(--dbx-bg-surface)",
                  textDecoration: "none",
                  transition: "opacity 0.15s ease",
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {t.downloadButton}
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page shell with header                                              */
/* ------------------------------------------------------------------ */
export function MultimodalPage({ defaultTab, currentMode = "image", onChangeMode, onToggleSidebar, sidebarOpen }: MultimodalPageProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<MultimodalTab>(defaultTab);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--dbx-bg-body)" }}>
      <Header
        phase="idle"
        hasMessages={false}
        onNewChat={() => {}}
        currentMode={currentMode}
        onChangeMode={onChangeMode}
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {tab === "image" ? <ImageTab /> : <VideoTab />}
      </div>
    </div>
  );
}
