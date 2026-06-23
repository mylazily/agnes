import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../hooks/useLanguage";

export type MultimodalTab = "image" | "video";

interface MultimodalPageProps {
  defaultTab: MultimodalTab;
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

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);
    try {
      const res = await fetch("/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
      {/* Input card */}
      <div
        className="flex flex-col gap-4 p-5"
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.07)",
          borderRadius: "16px",
        }}
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.imagePlaceholder}
          rows={4}
          className="w-full resize-none outline-none text-sm"
          style={{
            background: "#f4f4f4",
            borderRadius: "12px",
            padding: "12px 14px",
            color: "#000",
            border: "none",
          }}
        />

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.5)" }}>
            {t.sizeLabel}
          </span>
          <div className="flex gap-2">
            {(["1024x1024", "1024x768", "768x1024"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className="cursor-pointer text-xs font-medium px-3 py-1.5 transition-colors"
                style={{
                  borderRadius: "8px",
                  background: size === s ? "#0065fd" : "#f4f4f4",
                  color: size === s ? "#fff" : "rgba(0,0,0,0.6)",
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
          className="cursor-pointer w-full py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
          style={{
            background: "#0065fd",
            color: "#fff",
            borderRadius: "12px",
          }}
        >
          {loading ? t.generating : t.generateButton}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Result */}
      {resultUrl && (
        <div
          className="flex flex-col gap-3 p-5"
          style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: "16px",
          }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "#000" }}>
            {t.imageResultTitle}
          </h3>
          <img
            src={resultUrl}
            alt="generated"
            className="w-full rounded-xl"
            style={{ maxHeight: "480px", objectFit: "contain" }}
          />
          <a
            href={resultUrl}
            download
            className="inline-flex items-center justify-center gap-1.5 cursor-pointer py-2 text-xs font-semibold transition-colors"
            style={{
              background: "#0065fd",
              color: "#fff",
              borderRadius: "12px",
            }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
    <div className="flex flex-col gap-5 max-w-2xl mx-auto w-full">
      {/* Input card */}
      <div
        className="flex flex-col gap-4 p-5"
        style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.07)",
          borderRadius: "16px",
        }}
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t.videoPlaceholder}
          rows={4}
          className="w-full resize-none outline-none text-sm"
          style={{
            background: "#f4f4f4",
            borderRadius: "12px",
            padding: "12px 14px",
            color: "#000",
            border: "none",
          }}
        />

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.5)" }}>
            {t.durationLabel}
          </span>
          <div className="flex gap-2">
            {([5, 10] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className="cursor-pointer text-xs font-medium px-3 py-1.5 transition-colors"
                style={{
                  borderRadius: "8px",
                  background: duration === d ? "#0065fd" : "#f4f4f4",
                  color: duration === d ? "#fff" : "rgba(0,0,0,0.6)",
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
          className="cursor-pointer w-full py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
          style={{
            background: "#0065fd",
            color: "#fff",
            borderRadius: "12px",
          }}
        >
          {loading ? t.generating : t.generateButton}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Polling / Ready */}
      {(status === "polling" || status === "ready") && (
        <div
          className="flex flex-col gap-3 p-5"
          style={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.07)",
            borderRadius: "16px",
          }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "#000" }}>
            {t.videoResultTitle}
          </h3>

          {status === "polling" && (
            <div className="flex items-center gap-2.5 text-sm" style={{ color: "rgba(0,0,0,0.5)" }}>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t.videoPolling}
            </div>
          )}

          {status === "ready" && resultUrl && (
            <>
              <div className="flex items-center gap-2 text-sm" style={{ color: "#34c759" }}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t.videoReady}
              </div>
              <video
                src={resultUrl}
                controls
                className="w-full rounded-xl"
                style={{ maxHeight: "480px" }}
              />
              <a
                href={resultUrl}
                download
                className="inline-flex items-center justify-center gap-1.5 cursor-pointer py-2 text-xs font-semibold transition-colors"
                style={{
                  background: "#0065fd",
                  color: "#fff",
                  borderRadius: "12px",
                }}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
/*  Page shell with tabs                                                */
/* ------------------------------------------------------------------ */
export function MultimodalPage({ defaultTab }: MultimodalPageProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<MultimodalTab>(defaultTab);

  const tabs: { key: MultimodalTab; label: string }[] = [
    { key: "image", label: t.tabImage },
    { key: "video", label: t.tabVideo },
  ];

  return (
    <div className="flex h-screen flex-col" style={{ background: "#f9f9f9" }}>
      {/* Tab bar */}
      <div
        className="flex items-center justify-center gap-1 px-4"
        style={{
          height: 52,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        {tabs.map((item) => {
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className="cursor-pointer relative px-5 py-3 text-sm font-medium transition-colors"
              style={{
                color: active ? "#0065fd" : "rgba(0,0,0,0.5)",
              }}
            >
              {item.label}
              {active && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 block"
                  style={{
                    width: 20,
                    height: 2,
                    background: "#0065fd",
                    borderRadius: 1,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {tab === "image" ? <ImageTab /> : <VideoTab />}
      </div>
    </div>
  );
}
