import { useLanguage } from "../hooks/useLanguage";
import type { ResearchPhase } from "../lib/types";

function getDeployUrl(): string {
  const deployParams = '?template=deepagents-research-starter-node&from=within&fromAgent=1&agentLang=typescript';
  const edgeoneDeployUrl = `https://edgeone.ai/makers/new${deployParams}`;
  const cloudDeployUrl = `https://console.cloud.tencent.com/edgeone/makers/new${deployParams}`;

  if (typeof window === 'undefined') return edgeoneDeployUrl;
  return window.location.hostname.endsWith('.edgeone.dev') ? edgeoneDeployUrl : cloudDeployUrl;
}

interface HeaderProps {
  phase: ResearchPhase;
  hasMessages: boolean;
  onNewChat: () => void;
}

export function Header({ phase, hasMessages, onNewChat }: HeaderProps) {
  const { t, locale, toggleLocale } = useLanguage();

  const phaseLabel: Record<ResearchPhase, string> = {
    idle: t.phaseIdle,
    planning: t.phasePlanning,
    researching: t.phaseResearching,
    synthesizing: t.phaseSynthesizing,
    complete: t.phaseComplete,
  };

  const phaseColor: Record<ResearchPhase, string> = {
    idle: "text-[rgba(0,0,0,0.3)]",
    planning: "text-[#0065fd]",
    researching: "text-[#0065fd]",
    synthesizing: "text-[#ff9500]",
    complete: "text-[#34c759]",
  };

  const phaseDotColor: Record<ResearchPhase, string> = {
    idle: "bg-[rgba(0,0,0,0.15)]",
    planning: "bg-[#0065fd]",
    researching: "bg-[#0065fd]",
    synthesizing: "bg-[#ff9500]",
    complete: "bg-[#34c759]",
  };

  return (
    <header
      className="flex items-center gap-3 border-b px-4"
      style={{
        height: 56,
        borderColor: "rgba(0,0,0,0.07)",
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Logo + Title */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: "#ebf2ff" }}
        >
          <svg
            className="h-4 w-4"
            style={{ color: "#0065fd" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
            />
          </svg>
        </div>
        <h1
          className="text-[15px] font-semibold tracking-tight"
          style={{ color: "#000" }}
        >
          {t.appTitle}
        </h1>
      </div>

      {/* Divider */}
      {(phase !== "idle" || hasMessages) && (
        <span className="h-4 w-px" style={{ background: "rgba(0,0,0,0.07)" }} />
      )}

      {/* Phase indicator + Back */}
      <div className="flex items-center gap-3 min-w-[130px]">
        {phase !== "idle" && (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full shrink-0 ${phaseDotColor[phase]} ${
                phase === "researching" || phase === "planning" || phase === "synthesizing"
                  ? "animate-pulse"
                  : ""
              }`}
            />
            <span className={`text-xs font-medium whitespace-nowrap ${phaseColor[phase]}`}>
              {phaseLabel[phase]}
            </span>
          </div>
        )}
        {hasMessages && (
          <button
            onClick={onNewChat}
            className="cursor-pointer flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: "rgba(0,0,0,0.5)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.5)")}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            {t.newChatButton}
          </button>
        )}
      </div>

      <div className="flex-1" />

      {/* Right actions */}
      <a
        href="https://github.com/TencentEdgeOne/deepagents-research-nodejs"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-medium transition-colors"
        style={{ color: "rgba(0,0,0,0.5)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.5)")}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        GitHub
      </a>
      <a
        href={getDeployUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-medium transition-colors"
        style={{ color: "rgba(0,0,0,0.5)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.5)")}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
        Deploy
      </a>

      {/* Divider */}
      <span className="h-4 w-px" style={{ background: "rgba(0,0,0,0.07)" }} />

      {/* Language toggle */}
      <button
        onClick={toggleLocale}
        className="cursor-pointer flex items-center gap-1 text-xs font-medium transition-colors"
        style={{ color: "rgba(0,0,0,0.5)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#000")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.5)")}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {locale === "en" ? "中文" : "EN"}
      </button>
    </header>
  );
}
