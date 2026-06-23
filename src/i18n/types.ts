export type Locale = "en" | "zh";

export interface Translations {
  appTitle: string;
  appSubtitle: string;

  welcomeTitle: string;
  welcomeSubtitle: string;
  presetQuestions: string[];

  inputPlaceholder: string;
  sendButton: string;
  stopButton: string;
  newChatButton: string;

  phaseIdle: string;
  phasePlanning: string;
  phaseResearching: string;
  phaseSynthesizing: string;
  phaseComplete: string;

  specialistAgents: string;
  completed: string;
  taskPending: string;
  taskSummarizing: string;
  taskCancelled: string;
  noContentYet: string;
  synthesizingResults: string;
  researchStopped: string;

  you: string;
  coordinator: string;

  recentConversations: string;
  loadingHistory: string;
  deleteConversation: string;

  loadHistoryEmpty: string;
  loadHistoryFailed: string;

  tabChat: string;
  tabImage: string;
  tabVideo: string;
  imagePlaceholder: string;
  videoPlaceholder: string;
  generateButton: string;
  generating: string;
  sizeLabel: string;
  durationLabel: string;
  imageResultTitle: string;
  videoResultTitle: string;
  downloadButton: string;
  videoPolling: string;
  videoReady: string;

  // New keys for doubao-style UI
  newChat: string;
  chatHistory: string;
  today: string;
  yesterday: string;
  earlier: string;
  noHistory: string;
  sendMessage: string;
  attachFile: string;

  // Multimodal input placeholders
  imageGenPlaceholder: string;
  videoGenPlaceholder: string;

  // Tool button labels
  toolImage: string;
  toolVideo: string;

  // Generation status
  imageGenerating: string;
  videoGenerating: string;
  videoPollingChat: string;
  videoReadyChat: string;
  generationError: string;
}
