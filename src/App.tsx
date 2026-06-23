import { useState, useEffect } from "react";
import { ChatPage } from "./components/ChatPage";
import { MultimodalPage } from "./components/MultimodalPage";
import { useLanguage } from "./hooks/useLanguage";

type Route = "chat" | "image" | "video";

function getRouteFromPath(): Route {
  const path = window.location.pathname;
  if (path === "/image") return "image";
  if (path === "/video") return "video";
  return "chat";
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRouteFromPath);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, locale, toggleLocale } = useLanguage();

  useEffect(() => {
    const onPop = () => setRoute(getRouteFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const path = route === "chat" ? "/" : `/${route}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  }, [route]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [route]);

  const handleRouteChange = (r: Route) => {
    setRoute(r);
  };

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
              handleRouteChange("chat");
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t.newChat}
          </button>
        </div>

        <div className="sidebar-history">
          <div className="sidebar-section-label">{t.chatHistory}</div>
          <div style={{ padding: "8px 12px", color: "var(--dbx-text-quaternary)", fontSize: 12 }}>
            {t.noHistory}
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

      {/* Main content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--dbx-bg-body)" }}>
        {route === "chat" ? (
          <ChatPage
            currentMode={route}
            onChangeMode={handleRouteChange}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            sidebarOpen={sidebarOpen}
          />
        ) : (
          <MultimodalPage
            defaultTab={route === "video" ? "video" : "image"}
            currentMode={route}
            onChangeMode={handleRouteChange}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
            sidebarOpen={sidebarOpen}
          />
        )}
      </main>
    </div>
  );
}
