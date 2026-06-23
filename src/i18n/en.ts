import type { Translations } from "./types";

export const en: Translations = {
  appTitle: "Honghong",
  appSubtitle: "Developed by Changfang",

  welcomeTitle: "What can I help you with?",
  welcomeSubtitle: "",
  presetQuestions: [
    "What's the latest news in the tech world?",
    "What are the most popular programming languages?",
    "What are the pros and cons of React vs Vue.js?",
    "When to use PostgreSQL vs MySQL vs MongoDB?",
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
  generationError: "Generation failed",
};
