import { e as escape_html, a6 as store_get, a7 as unsubscribe_stores, a8 as ensure_array_like, a9 as attr_style, aa as stringify, ab as attr_class, a3 as derived$1, ac as attr } from "../../chunks/index.js";
import { w as writable, d as derived } from "../../chunks/index2.js";
import { marked } from "marked";
import "clsx";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
const en = {
  appTitle: "Honghong",
  appSubtitle: "Developed by Changfang",
  welcomeTitle: "What can I help you with?",
  welcomeSubtitle: "",
  presetQuestions: [
    "What's the latest news in the tech world?",
    "What are the most popular programming languages?",
    "What are the pros and cons of React vs Vue.js?",
    "When to use PostgreSQL vs MySQL vs MongoDB?"
  ],
  inputPlaceholder: "Send a message...",
  sendButton: "Send",
  stopButton: "Stop",
  newChatButton: "New Chat",
  phaseIdle: "Ready",
  phasePlanning: "Analyzing",
  phaseResearching: "Researching",
  phaseSynthesizing: "Synthesizing",
  phaseComplete: "Research Complete",
  specialistAgents: "Researchers",
  completed: "completed",
  taskPending: "Preparing research…",
  taskSummarizing: "Research done, writing summary…",
  taskCancelled: "Cancelled",
  noContentYet: "Waiting for research results…",
  synthesizingResults: "Synthesizing research findings…",
  researchStopped: "Research stopped",
  you: "You",
  coordinator: "AI Assistant",
  recentConversations: "Recent Conversations",
  loadingHistory: "Loading conversation...",
  deleteConversation: "Delete",
  loadHistoryEmpty: "This conversation has no history",
  loadHistoryFailed: "Failed to load conversation history",
  tabChat: "Chat",
  tabImage: "Image",
  tabVideo: "Video",
  imagePlaceholder: "Describe the image you want...",
  videoPlaceholder: "Describe the video you want...",
  generateButton: "Generate",
  generating: "Generating...",
  sizeLabel: "Size",
  durationLabel: "Duration",
  imageResultTitle: "Generated Image",
  videoResultTitle: "Generated Video",
  downloadButton: "Download",
  videoPolling: "Generating video, please wait...",
  videoReady: "Video is ready!",
  newChat: "New Chat",
  chatHistory: "Chat History",
  today: "Today",
  yesterday: "Yesterday",
  earlier: "Earlier",
  noHistory: "No conversations yet",
  sendMessage: "Send a message...",
  attachFile: "Attach file",
  imageGenPlaceholder: "Describe the image you want to generate...",
  videoGenPlaceholder: "Describe the video you want to generate...",
  toolImage: "Image",
  toolVideo: "Video",
  imageGenerating: "Generating image...",
  videoGenerating: "Generating video...",
  videoPollingChat: "Generating video, please wait...",
  videoReadyChat: "Video is ready",
  generationError: "Generation failed"
};
const zh = {
  appTitle: "红红",
  appSubtitle: "由长芳开发",
  welcomeTitle: "有什么我能帮你的吗？",
  welcomeSubtitle: "",
  presetQuestions: [
    "最近科技圈有什么新闻？",
    "世界上最受欢迎的编程语言有哪些？",
    "React 和 Vue.js 各有什么优劣势？",
    "PostgreSQL、MySQL 和 MongoDB 怎么选？"
  ],
  inputPlaceholder: "发消息...",
  sendButton: "发送",
  stopButton: "停止",
  newChatButton: "新对话",
  phaseIdle: "就绪",
  phasePlanning: "分析问题中",
  phaseResearching: "研究中",
  phaseSynthesizing: "汇总结论中",
  phaseComplete: "研究完成",
  specialistAgents: "研究员",
  completed: "已完成",
  taskPending: "正在准备研究…",
  taskSummarizing: "研究完成，正在整理结论…",
  taskCancelled: "已取消",
  noContentYet: "等待研究结果…",
  synthesizingResults: "正在汇总研究结论…",
  researchStopped: "研究已停止",
  you: "你",
  coordinator: "AI 助手",
  recentConversations: "近期会话",
  loadingHistory: "加载会话中...",
  deleteConversation: "删除",
  loadHistoryEmpty: "该对话暂无历史记录",
  loadHistoryFailed: "加载对话历史失败",
  tabChat: "对话",
  tabImage: "图像",
  tabVideo: "视频",
  imagePlaceholder: "描述你想要的图片...",
  videoPlaceholder: "描述你想要的视频...",
  generateButton: "生成",
  generating: "生成中...",
  sizeLabel: "尺寸",
  durationLabel: "时长",
  imageResultTitle: "生成的图片",
  videoResultTitle: "生成的视频",
  downloadButton: "下载",
  videoPolling: "视频生成中，请稍候...",
  videoReady: "视频已生成！",
  newChat: "新对话",
  chatHistory: "对话历史",
  today: "今天",
  yesterday: "昨天",
  earlier: "更早",
  noHistory: "暂无对话",
  sendMessage: "发消息...",
  attachFile: "添加附件",
  imageGenPlaceholder: "描述你想生成的图像...",
  videoGenPlaceholder: "描述你想生成的视频...",
  toolImage: "图像",
  toolVideo: "视频",
  imageGenerating: "正在生成图像...",
  videoGenerating: "正在生成视频...",
  videoPollingChat: "视频生成中，请稍候...",
  videoReadyChat: "视频已生成",
  generationError: "生成失败"
};
const translations = { en, zh };
function detectLocale() {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language || "";
  return lang.startsWith("zh") ? "zh" : "en";
}
const locale = writable(detectLocale());
const t = derived(locale, ($locale) => translations[$locale]);
const CONVERSATIONS_KEY = "deepagents-conversations";
function getStoredConversations() {
  try {
    return JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || "[]");
  } catch {
    return [];
  }
}
function getInitialConversationId() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlId = urlParams.get("id");
  if (urlId) return urlId;
  return crypto.randomUUID();
}
const messages = writable([]);
const subAgentGroups = writable([]);
const phase = writable("idle");
const isStreaming = writable(false);
const isLoadingHistory = writable(false);
const loadError = writable(null);
getInitialConversationId();
const flowItems = derived([messages, subAgentGroups], ([$messages, $subAgentGroups]) => {
  const ordered = [];
  for (const msg of $messages) {
    ordered.push({
      orderIdx: msg.orderIdx ?? 0,
      item: msg.role === "user" ? { type: "user_message", message: msg } : { type: "ai_message", message: msg }
    });
  }
  for (const group of $subAgentGroups) {
    ordered.push({
      orderIdx: group.orderIdx ?? 0,
      item: { type: "subagent_group", group }
    });
  }
  ordered.sort((a, b) => a.orderIdx - b.orderIdx);
  return ordered.map((o) => o.item);
});
function Header($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { hasMessages, onToggleSidebar } = $$props;
    $$renderer2.push(`<header class="header svelte-1elxaub">`);
    if (onToggleSidebar) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button class="header-btn svelte-1elxaub"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M3 6h18M3 18h18"></path></svg></button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div style="flex: 1; min-width: 0;"><h1 class="header-title svelte-1elxaub">${escape_html(store_get($$store_subs ??= {}, "$t", t).appTitle)}</h1></div> `);
    if (hasMessages) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button class="header-btn svelte-1elxaub"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg> ${escape_html(store_get($$store_subs ??= {}, "$t", t).newChatButton)}</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></header>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function WelcomeScreen($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<div class="welcome-screen svelte-vrf9as"><h2 class="welcome-title svelte-vrf9as">${escape_html(store_get($$store_subs ??= {}, "$t", t).welcomeTitle)}</h2> <div class="suggestion-grid svelte-vrf9as"><!--[-->`);
    const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$t", t).presetQuestions);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let q = each_array[i];
      $$renderer2.push(`<button class="suggestion-card"${attr_style(`animation: slideUp 0.3s ease ${stringify(i * 0.06)}s both;`)}>${escape_html(q)}</button>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function Markdown($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { content, className = "" } = $$props;
    function normalizeMarkdown(raw) {
      return raw.replace(/([^\n])(\n?)(#{1,6}\s)/g, "$1\n\n$3").replace(/\n{3,}/g, "\n\n");
    }
    let renderedHtml = derived$1(() => {
      const normalized = normalizeMarkdown(content);
      return marked(normalized, { breaks: true, gfm: true });
    });
    $$renderer2.push(`<div${attr_class(`markdown-content ${stringify(className)}`)}>${html(renderedHtml())}</div>`);
  });
}
function StatusBadge($$renderer, $$props) {
  let { status } = $$props;
  const statusLabels = {
    pending: "pending",
    running: "running",
    complete: "complete",
    error: "error",
    cancelled: "cancelled"
  };
  const statusColors = {
    pending: "var(--dbx-text-quaternary)",
    running: "var(--dbx-fill-primary)",
    complete: "var(--dbx-function-success)",
    error: "var(--dbx-function-danger)",
    cancelled: "var(--dbx-text-tertiary)"
  };
  let color = derived$1(() => statusColors[status]);
  let label = derived$1(() => statusLabels[status]);
  let pulse = derived$1(() => status === "running");
  $$renderer.push(`<span class="status-badge svelte-12nqn7t"${attr_style(`color: ${stringify(color())}; ${pulse() ? "animation: pulse 2s infinite;" : ""}`)}>`);
  if (status === "pending") {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<svg width="10" height="10" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="none" stroke="currentColor" stroke-width="1.5"></circle></svg>`);
  } else if (status === "running") {
    $$renderer.push("<!--[1-->");
    $$renderer.push(`<svg width="10" height="10" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3"></circle></svg>`);
  } else if (status === "complete") {
    $$renderer.push("<!--[2-->");
    $$renderer.push(`<svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 3)}><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg>`);
  } else if (status === "error") {
    $$renderer.push("<!--[3-->");
    $$renderer.push(`<svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 3)}><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>`);
  } else {
    $$renderer.push("<!--[-1-->");
    $$renderer.push(`<svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 3)}><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>`);
  }
  $$renderer.push(`<!--]--> ${escape_html(label())}</span>`);
}
function DurationDisplay($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let elapsedText = "0.0s";
    $$renderer2.push(`<span class="duration-display svelte-1gr1jzm">${escape_html(elapsedText)}</span>`);
  });
}
function SubAgentCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { task, isOpen, index } = $$props;
    function resolveDescription(desc) {
      if (desc === "__PENDING__") return store_get($$store_subs ??= {}, "$t", t).taskPending;
      if (desc === "__SUMMARIZING__") return store_get($$store_subs ??= {}, "$t", t).taskSummarizing;
      if (!desc) return `${task.subagentType || "researcher"} agent`;
      return stripMarkdown(desc);
    }
    function stripMarkdown(text) {
      return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/#{1,6}\s+/g, "").replace(/`(.+?)`/g, "$1").replace(/!\[.*?\]\(.*?\)/g, "").replace(/\[(.+?)\]\(.*?\)/g, "$1").trim();
    }
    const borderColorMap = {
      pending: "var(--dbx-line-7)",
      running: "var(--dbx-line-7)",
      complete: "var(--dbx-line-highlight)",
      error: "rgba(255,59,48,0.2)",
      cancelled: "var(--dbx-line-divider-5)"
    };
    let borderColor = derived$1(() => borderColorMap[task.status] || "var(--dbx-line-7)");
    $$renderer2.push(`<div class="subagent-card svelte-1bga6hn"${attr_style(`border-color: ${stringify(borderColor())};`)}><button class="subagent-card-header svelte-1bga6hn"><svg width="12" height="12" class="chevron svelte-1bga6hn"${attr_style(`transform: rotate(${stringify(isOpen ? 90 : 0)}deg);`)} fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 2.5)}><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg> <span class="card-index svelte-1bga6hn">${escape_html(index)}</span> `);
    if (task.description === "__PENDING__") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="spinner svelte-1bga6hn"></span>`);
    } else if (task.description === "__SUMMARIZING__") {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<svg width="14" height="14" style="color: var(--dbx-fill-primary); flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 1.5)}><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path></svg>`);
    } else if (task.status === "complete") {
      $$renderer2.push("<!--[2-->");
      $$renderer2.push(`<svg width="14" height="14" style="color: var(--dbx-fill-primary); flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 2)}><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<svg width="14" height="14" style="color: var(--dbx-text-quaternary); flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 1.5)}><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path></svg>`);
    }
    $$renderer2.push(`<!--]--> <span class="card-title svelte-1bga6hn"${attr("title", resolveDescription(task.description))}>${escape_html(resolveDescription(task.description))}</span> `);
    DurationDisplay($$renderer2, { startedAt: task.startedAt, duration: task.duration });
    $$renderer2.push(`<!----> `);
    StatusBadge($$renderer2, { status: task.status });
    $$renderer2.push(`<!----></button> `);
    if (isOpen) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="subagent-card-content-wrapper svelte-1bga6hn">`);
      if (task.toolCalls.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<ul class="tool-calls-list svelte-1bga6hn"><!--[-->`);
        const each_array = ensure_array_like(task.toolCalls);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let tc = each_array[$$index];
          $$renderer2.push(`<li class="tool-call-item svelte-1bga6hn"><span class="tool-call-icon svelte-1bga6hn">`);
          if (tc.status === "pending") {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<span class="spinner-sm svelte-1bga6hn"></span>`);
          } else if (tc.status === "completed") {
            $$renderer2.push("<!--[1-->");
            $$renderer2.push(`<svg width="14" height="14" style="color: var(--dbx-fill-primary);" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 2.5)}><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg>`);
          } else {
            $$renderer2.push("<!--[-1-->");
            $$renderer2.push(`<svg width="14" height="14" style="color: var(--dbx-function-danger);" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 2.5)}><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>`);
          }
          $$renderer2.push(`<!--]--></span> <span class="tool-call-name svelte-1bga6hn">${escape_html(tc.name)}</span> `);
          if (tc.argSummary) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<span class="tool-call-args svelte-1bga6hn"${attr("title", tc.argSummary)}>${escape_html(tc.argSummary)}</span>`);
          } else {
            $$renderer2.push("<!--[-1-->");
            $$renderer2.push(`<span style="min-width: 0; flex: 1;"></span>`);
          }
          $$renderer2.push(`<!--]--></li>`);
        }
        $$renderer2.push(`<!--]--></ul>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="subagent-card-content svelte-1bga6hn">`);
      if (task.content) {
        $$renderer2.push("<!--[0-->");
        Markdown($$renderer2, { content: task.content });
        $$renderer2.push(`<!----> `);
        if (task.status === "running") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="streaming-cursor svelte-1bga6hn"></span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="subagent-empty-content svelte-1bga6hn">`);
        if (task.status === "running" || task.status === "pending") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span style="display: flex; gap: 4px;"><!--[-->`);
          const each_array_1 = ensure_array_like([0, 1, 2]);
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let i = each_array_1[$$index_1];
            $$renderer2.push(`<span class="typing-dot svelte-1bga6hn"${attr_style(`animation-delay: ${stringify(i * 0.16)}s;`)}></span>`);
          }
          $$renderer2.push(`<!--]--></span>`);
        } else if (task.status === "cancelled") {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<span style="font-size: 12px; color: var(--dbx-text-quaternary);">${escape_html(store_get($$store_subs ??= {}, "$t", t).taskCancelled)}</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<span style="font-size: 12px;">${escape_html(store_get($$store_subs ??= {}, "$t", t).noContentYet)}</span>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function SubAgentCardGroup($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { group } = $$props;
    let total = derived$1(() => group.tasks.length);
    let completed = derived$1(() => group.tasks.filter((t2) => t2.status === "complete").length);
    let percent = derived$1(() => total() > 0 ? completed() / total() * 100 : 0);
    let expandedIds = /* @__PURE__ */ new Set();
    $$renderer2.push(`<div class="subagent-group svelte-1x8rdas"><div class="subagent-group-header svelte-1x8rdas"><svg width="12" height="12" class="chevron svelte-1x8rdas"${attr_style(`transform: rotate(${stringify(90)}deg);`)} fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 2.5)}><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg> <svg width="14" height="14" style="color: var(--dbx-fill-primary);" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 1.5)}><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path></svg> <span class="group-label svelte-1x8rdas">${escape_html(store_get($$store_subs ??= {}, "$t", t).specialistAgents)}</span> <span class="group-count svelte-1x8rdas">${escape_html(completed())}/${escape_html(total())} ${escape_html(store_get($$store_subs ??= {}, "$t", t).completed)}</span></div> <div class="progress-bar-track svelte-1x8rdas"><div class="progress-bar-fill svelte-1x8rdas"${attr_style(`width: ${stringify(percent())}%;`)}></div></div> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="subagent-cards svelte-1x8rdas"><!--[-->`);
      const each_array = ensure_array_like(group.tasks);
      for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
        let task = each_array[idx];
        SubAgentCard($$renderer2, {
          task,
          isOpen: expandedIds.has(task.id),
          index: idx + 1
        });
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function TypingIndicator($$renderer) {
  $$renderer.push(`<div class="typing-indicator svelte-ej4x60"><!--[-->`);
  const each_array = ensure_array_like([0, 1, 2]);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let i = each_array[$$index];
    $$renderer.push(`<span class="typing-dot svelte-ej4x60"${attr_style(`animation-delay: ${stringify(i * 0.16)}s;`)}></span>`);
  }
  $$renderer.push(`<!--]--></div>`);
}
function MessageFlow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { items, isStreaming: isStreaming2, phase: phase2 } = $$props;
    $$renderer2.push(`<div class="message-flow-scroll svelte-1sjcqar"><div class="message-flow-content svelte-1sjcqar"><!--[-->`);
    const each_array = ensure_array_like(
      // Track items and isStreaming changes
      items
    );
    for (let idx = 0, $$length = each_array.length; idx < $$length; idx++) {
      let item = each_array[idx];
      if (item.type === "user_message") {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="msg-user svelte-1sjcqar" style="animation: fadeIn 0.2s ease;"><div class="msg-user-content svelte-1sjcqar">${escape_html(item.message.content)}</div></div>`);
      } else if (item.type === "ai_message") {
        $$renderer2.push("<!--[1-->");
        const msg = item.message;
        if (msg.multimodalType === "image") {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="msg-ai svelte-1sjcqar" style="animation: fadeIn 0.2s ease;"><div class="msg-ai-inner svelte-1sjcqar">`);
          if (msg.generationStatus === "generating") {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="gen-card svelte-1sjcqar"><div class="gen-card-status svelte-1sjcqar"><svg width="16" height="16" style="animation: spin 1s linear infinite;" fill="none" viewBox="0 0 24 24"><circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle><path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> ${escape_html(store_get($$store_subs ??= {}, "$t", t).imageGenerating)}</div> <div class="gen-skeleton gen-skeleton-square svelte-1sjcqar"></div></div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (msg.generationStatus === "ready" && msg.imageUrl) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="gen-card svelte-1sjcqar"><img${attr("src", msg.imageUrl)} alt="generated" class="gen-image svelte-1sjcqar"/> <a${attr("href", msg.imageUrl)} download="" class="gen-download-btn svelte-1sjcqar"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 2)}><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> ${escape_html(store_get($$store_subs ??= {}, "$t", t).downloadButton)}</a></div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (msg.generationStatus === "error") {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="gen-error svelte-1sjcqar"><svg width="16" height="16" style="flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 2)}><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> ${escape_html(msg.generationError || store_get($$store_subs ??= {}, "$t", t).generationError)}</div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></div></div>`);
        } else if (msg.multimodalType === "video") {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<div class="msg-ai svelte-1sjcqar" style="animation: fadeIn 0.2s ease;"><div class="msg-ai-inner svelte-1sjcqar">`);
          if (msg.generationStatus === "generating" || msg.generationStatus === "polling") {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="gen-card svelte-1sjcqar"><div class="gen-card-status svelte-1sjcqar"><svg width="16" height="16" style="animation: spin 1s linear infinite;" fill="none" viewBox="0 0 24 24"><circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle><path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> ${escape_html(msg.generationStatus === "generating" ? store_get($$store_subs ??= {}, "$t", t).videoGenerating : store_get($$store_subs ??= {}, "$t", t).videoPollingChat)}</div> <div class="gen-skeleton gen-skeleton-video svelte-1sjcqar"></div></div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (msg.generationStatus === "ready" && msg.videoUrl) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="gen-card svelte-1sjcqar"><video${attr("src", msg.videoUrl)} controls="" class="gen-video svelte-1sjcqar"></video> <a${attr("href", msg.videoUrl)} download="" class="gen-download-btn svelte-1sjcqar"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 2)}><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> ${escape_html(store_get($$store_subs ??= {}, "$t", t).downloadButton)}</a></div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (msg.generationStatus === "error") {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="gen-error svelte-1sjcqar"><svg width="16" height="16" style="flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 2)}><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> ${escape_html(msg.generationError || store_get($$store_subs ??= {}, "$t", t).generationError)}</div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></div></div>`);
        } else if (msg.content === "__STOPPED__") {
          $$renderer2.push("<!--[2-->");
          $$renderer2.push(`<div class="msg-stopped svelte-1sjcqar" style="animation: fadeIn 0.2s ease;"><svg width="16" height="16" style="color: var(--dbx-text-quaternary); flex-shrink: 0;" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg> ${escape_html(store_get($$store_subs ??= {}, "$t", t).researchStopped)}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div class="msg-ai svelte-1sjcqar" style="animation: fadeIn 0.2s ease;"><div class="msg-ai-inner svelte-1sjcqar"><div class="msg-bot-color svelte-1sjcqar">`);
          if (msg.content) {
            $$renderer2.push("<!--[0-->");
            Markdown($$renderer2, { content: msg.content });
            $$renderer2.push(`<!----> `);
            if (isStreaming2 && idx === items.length - 1 && !msg.hasSubAgents) {
              $$renderer2.push("<!--[0-->");
              $$renderer2.push(`<span class="streaming-cursor svelte-1sjcqar"></span>`);
            } else {
              $$renderer2.push("<!--[-1-->");
            }
            $$renderer2.push(`<!--]-->`);
          } else {
            $$renderer2.push("<!--[-1-->");
            TypingIndicator($$renderer2);
          }
          $$renderer2.push(`<!--]--></div></div></div>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else if (item.type === "subagent_group") {
        $$renderer2.push("<!--[2-->");
        $$renderer2.push(`<div style="animation: slideUp 0.3s ease;">`);
        SubAgentCardGroup($$renderer2, { group: item.group });
        $$renderer2.push(`<!----></div>`);
      } else if (item.type === "synthesizing") {
        $$renderer2.push("<!--[3-->");
        $$renderer2.push(`<div class="msg-synthesizing svelte-1sjcqar" style="animation: fadeIn 0.2s ease;"><svg width="16" height="16" style="color: var(--dbx-function-warning); animation: spin 1s linear infinite;" fill="none" viewBox="0 0 24 24"><circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle><path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> ${escape_html(store_get($$store_subs ??= {}, "$t", t).synthesizingResults)}</div>`);
      } else if (item.type === "typing") {
        $$renderer2.push("<!--[4-->");
        $$renderer2.push(`<div class="msg-typing svelte-1sjcqar">`);
        TypingIndicator($$renderer2);
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> `);
    if (isStreaming2 && items.length > 0 && items[items.length - 1].type === "user_message") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="msg-ai svelte-1sjcqar" style="animation: fadeIn 0.2s ease;"><div class="msg-bot-color svelte-1sjcqar">`);
      TypingIndicator($$renderer2);
      $$renderer2.push(`<!----></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (isStreaming2 && phase2 === "synthesizing" && items.length > 0 && items[items.length - 1].type !== "ai_message") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="msg-ai svelte-1sjcqar" style="animation: fadeIn 0.2s ease;"><div class="msg-bot-color svelte-1sjcqar">`);
      TypingIndicator($$renderer2);
      $$renderer2.push(`<!----></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function ChatInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { isStreaming: isStreaming2 } = $$props;
    let value = "";
    $$renderer2.push(`<div class="chat-input-container svelte-5wsbgm"><form class="chat-input-form svelte-5wsbgm"><div class="chat-input-wrapper"><textarea${attr("placeholder", store_get($$store_subs ??= {}, "$t", t).inputPlaceholder)}${attr("disabled", isStreaming2, true)}${attr("rows", 1)} class="chat-textarea svelte-5wsbgm">`);
    const $$body = escape_html(value);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea> <div class="chat-action-btn-container svelte-5wsbgm">`);
    if (isStreaming2) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button type="button" class="chat-action-btn chat-action-btn-stop svelte-5wsbgm"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg></button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<button type="submit"${attr("disabled", !value.trim(), true)}${attr_class(`chat-action-btn ${value.trim() ? "chat-action-btn-active" : "chat-action-btn-inactive"}`, "svelte-5wsbgm")}><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 2)}><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"></path></svg></button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="chat-toolbar svelte-5wsbgm"><div style="display: flex; align-items: center; gap: 4px;"><button type="button" class="chat-attach-btn svelte-5wsbgm"${attr("title", store_get($$store_subs ??= {}, "$t", t).attachFile)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"></path></svg></button></div> <span class="chat-hint svelte-5wsbgm">Enter ${escape_html(store_get($$store_subs ??= {}, "$t", t).sendButton)}, Shift + Enter</span></div></div></form></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function ChatInterface($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { onToggleSidebar } = $$props;
    let loadErrorText = derived$1(() => store_get($$store_subs ??= {}, "$loadError", loadError) ? store_get($$store_subs ??= {}, "$loadError", loadError) === "empty" ? store_get($$store_subs ??= {}, "$t", t).loadHistoryEmpty : `${store_get($$store_subs ??= {}, "$t", t).loadHistoryFailed}: ${store_get($$store_subs ??= {}, "$loadError", loadError)}` : null);
    let hasMessages = derived$1(() => store_get($$store_subs ??= {}, "$messages", messages).length > 0);
    $$renderer2.push(`<div style="display: flex; flex-direction: column; height: 100%; background: var(--dbx-bg-body);">`);
    Header($$renderer2, {
      phase: store_get($$store_subs ??= {}, "$phase", phase),
      hasMessages: hasMessages(),
      onToggleSidebar
    });
    $$renderer2.push(`<!----> `);
    if (loadErrorText()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div style="position: absolute; top: 64; left: 0; right: 0; display: flex; justify-content: center; z-index: 50;"><div class="error-toast svelte-1uimkef"><svg width="16" height="16" style="color: var(--dbx-function-danger); flex-shrink: 0;" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 2)}><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> <span style="font-size: 13; color: var(--dbx-function-danger);">${escape_html(loadErrorText())}</span> <button class="error-toast-close svelte-1uimkef"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"${attr("stroke-width", 2)}><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">`);
    if (store_get($$store_subs ??= {}, "$isLoadingHistory", isLoadingHistory)) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div style="flex: 1; display: flex; align-items: center; justify-content: center;"><div style="display: flex; align-items: center; gap: 10; font-size: 13; color: var(--dbx-text-tertiary);"><svg width="16" height="16" style="animation: spin 1s linear infinite;" fill="none" viewBox="0 0 24 24"><circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle><path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> ${escape_html(store_get($$store_subs ??= {}, "$t", t).loadingHistory)}</div></div>`);
    } else if (hasMessages()) {
      $$renderer2.push("<!--[1-->");
      MessageFlow($$renderer2, {
        items: store_get($$store_subs ??= {}, "$flowItems", flowItems),
        isStreaming: store_get($$store_subs ??= {}, "$isStreaming", isStreaming),
        phase: store_get($$store_subs ??= {}, "$phase", phase)
      });
    } else {
      $$renderer2.push("<!--[-1-->");
      WelcomeScreen($$renderer2, {
        storedConversations: getStoredConversations()
      });
    }
    $$renderer2.push(`<!--]--> `);
    ChatInput($$renderer2, {
      isStreaming: store_get($$store_subs ??= {}, "$isStreaming", isStreaming)
    });
    $$renderer2.push(`<!----></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let sidebarOpen = false;
    let storedConversations = getStoredConversations();
    $$renderer2.push(`<div style="display: flex; height: 100vh; width: 100vw; overflow: hidden;">`);
    if (sidebarOpen) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="sidebar-overlay" role="presentation"></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <aside${attr_class(`sidebar ${sidebarOpen ? "" : "collapsed"}`)}><div class="sidebar-header"><button class="sidebar-new-chat-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg> ${escape_html(store_get($$store_subs ??= {}, "$locale", locale) === "zh" ? "新对话" : "New Chat")}</button></div> <div class="sidebar-history"><div class="sidebar-section-label">${escape_html(store_get($$store_subs ??= {}, "$locale", locale) === "zh" ? "对话历史" : "Chat History")}</div> `);
    if (storedConversations.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(storedConversations);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let conv = each_array[$$index];
        $$renderer2.push(`<button class="sidebar-history-item"><span class="sidebar-history-item-title">${escape_html(conv.title)}</span> <span class="sidebar-history-item-delete" role="button" tabindex="0"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></span></button>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div style="padding: 8px 12px; color: var(--dbx-text-quaternary); font-size: 12px;">${escape_html(store_get($$store_subs ??= {}, "$locale", locale) === "zh" ? "暂无对话" : "No conversations yet")}</div>`);
    }
    $$renderer2.push(`<!--]--></div> <div style="padding: 12px 16px; border-top: 1px solid var(--dbx-line-7);"><button class="sidebar-lang-btn svelte-1uha8ag"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> ${escape_html(store_get($$store_subs ??= {}, "$locale", locale) === "en" ? "中文" : "English")}</button></div></aside> <main style="flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--dbx-bg-body);">`);
    ChatInterface($$renderer2, {
      onToggleSidebar: () => sidebarOpen = !sidebarOpen
    });
    $$renderer2.push(`<!----></main></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
