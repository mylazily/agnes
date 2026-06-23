import { useLanguage } from "../hooks/useLanguage";
import type { ResearchPhase } from "../lib/types";

interface HeaderProps {
  phase: ResearchPhase;
  hasMessages: boolean;
  onNewChat: () => void;
  currentMode?: "chat" | "image" | "video";
  onChangeMode?: (mode: "chat" | "image" | "video") => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function Header({
  phase,
  hasMessages,
  onNewChat,
  currentMode = "chat",
  onChangeMode,
  onToggleSidebar,
}: HeaderProps) {
  const { t } = useLanguage();

  return (
    <header
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        borderBottom: "1px solid var(--dbx-line-7)",
        background: "transparent",
        flexShrink: 0,
      }}
    >
      {/* Sidebar toggle (hamburger) */}
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "transparent",
            color: "var(--dbx-text-tertiary)",
            cursor: "pointer",
            transition: "background var(--transition-fast), color var(--transition-fast)",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--dbx-fill-trans-10)";
            e.currentTarget.style.color = "var(--dbx-text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--dbx-text-tertiary)";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      )}

      {/* Current conversation title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--dbx-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {t.appTitle}
        </h1>
      </div>

      {/* Mode tabs - doubao style */}
      {onChangeMode && (
        <div style={{ display: "flex", alignItems: "center", gap: 2, background: "var(--dbx-fill-trans-10)", borderRadius: "var(--radius-xl)", padding: 3 }}>
          {(
            [
              { key: "chat" as const, label: t.tabChat },
              { key: "image" as const, label: t.tabImage },
              { key: "video" as const, label: t.tabVideo },
            ] as const
          ).map((item) => {
            const active = currentMode === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onChangeMode(item.key)}
                style={{
                  cursor: "pointer",
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--dbx-text-primary)" : "var(--dbx-text-tertiary)",
                  background: active ? "var(--dbx-bg-surface)" : "transparent",
                  borderRadius: "calc(var(--radius-xl) - 2px)",
                  border: "none",
                  transition: "all var(--transition-fast)",
                  boxShadow: active ? "var(--shadow-xs)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* New chat button */}
      {hasMessages && (
        <button
          onClick={onNewChat}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: "var(--radius-lg)",
            border: "none",
            background: "transparent",
            color: "var(--dbx-text-tertiary)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "background var(--transition-fast), color var(--transition-fast)",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--dbx-fill-trans-10)";
            e.currentTarget.style.color = "var(--dbx-text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--dbx-text-tertiary)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t.newChatButton}
        </button>
      )}
    </header>
  );
}
