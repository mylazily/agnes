import { useState, useEffect } from "react";
import { ChatPage } from "./components/ChatPage";
import { MultimodalPage } from "./components/MultimodalPage";
import type { MultimodalTab } from "./components/MultimodalPage";

type Route = "chat" | "image" | "video";

function getRouteFromPath(): Route {
  const path = window.location.pathname;
  if (path === "/image") return "image";
  if (path === "/video") return "video";
  return "chat";
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRouteFromPath);

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

  if (route === "chat") {
    return <ChatPage />;
  }

  const defaultTab: MultimodalTab = route === "video" ? "video" : "image";
  return (
    <div className="flex h-screen flex-col">
      {/* Shared tab navigation */}
      <nav
        className="flex items-center justify-center gap-1 px-4 shrink-0"
        style={{
          height: 52,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        {(
          [
            { key: "chat" as Route, label: "对话" },
            { key: "image" as Route, label: "图像" },
            { key: "video" as Route, label: "视频" },
          ] as const
        ).map((item) => {
          const active = route === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setRoute(item.key)}
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
      </nav>

      <div className="flex-1 overflow-hidden">
        <MultimodalPage defaultTab={defaultTab} />
      </div>
    </div>
  );
}
