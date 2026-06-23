import { useState } from "react";
import { ChatPage } from "./components/ChatPage";
import { useLanguage } from "./hooks/useLanguage";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { locale, toggleLocale } = useLanguage();

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-new-chat-btn"
            onClick={() => {
              // Navigate to root
              window.history.pushState({}, "", "/");
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {locale === "zh" ? "新对话" : "New Chat"}
          </button>
        </div>

        <div className="sidebar-history">
          <div className="sidebar-section-label">{locale === "zh" ? "对话历史" : "Chat History"}</div>
          <div style={{ padding: "8px 12px", color: "var(--dbx-text-quaternary)", fontSize: 12 }}>
            {locale === "zh" ? "暂无对话" : "No conversations yet"}
          </div>
        </div>

        {/* Sidebar footer with language toggle */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--dbx-line-7)" }}>
          <button
            onClick={toggleLocale}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              borderRadius: "var(--radius-lg)",
              border: "none",
              background: "transparent",
              color: "var(--dbx-text-tertiary)",
              fontSize: 12,
              cursor: "pointer",
              width: "100%",
              transition: "background var(--transition-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--dbx-fill-trans-10)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {locale === "en" ? "中文" : "English"}
          </button>
        </div>
      </aside>

      {/* Main content - always ChatPage */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--dbx-bg-body)" }}>
        <ChatPage
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
        />
      </main>
    </div>
  );
}
