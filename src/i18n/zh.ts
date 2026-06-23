import type { Translations } from "./types";

export const zh: Translations = {
  appTitle: "红红",
  appSubtitle: "由长芳开发",

  welcomeTitle: "有什么我能帮你的吗？",
  welcomeSubtitle: "",
  presetQuestions: [
    "最近科技圈有什么新闻？",
    "世界上最受欢迎的编程语言有哪些？",
    "React 和 Vue.js 各有什么优劣势？",
    "PostgreSQL、MySQL 和 MongoDB 怎么选？",
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
  generationError: "生成失败",
};
