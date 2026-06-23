/**
 * Chat store — SSE streaming store for the DeepAgents chat.
 *
 * Consumes the EdgeOne Makers SSE endpoint (POST /stream) and manages:
 * - messages[]       : the linear chat history
 * - subAgentGroups[] : batches of SubAgent cards, each triggered by a coordinator message
 * - phase            : current research phase (idle -> planning -> researching -> synthesizing -> complete)
 * - isStreaming       : whether the stream is active
 */

import { writable, derived } from 'svelte/store';
import type {
	ChatMessage,
	FlowItem,
	ResearchPhase,
	StreamEvent,
	SubAgentGroup,
	SubAgentTask,
	ToolCallEntry
} from '../types';

let _id = 0;
function uid(): string {
	return `msg-${++_id}-${Date.now()}`;
}

function toolCallUid(): string {
	return `tc-${++_id}-${Date.now()}`;
}

// Build a short, human-readable summary from tool args.
function buildArgSummary(toolName: string, rawArgs: string): string | undefined {
	if (!rawArgs) return undefined;

	let parsed: unknown;
	try {
		parsed = JSON.parse(rawArgs);
	} catch {
		return undefined;
	}
	if (!parsed || typeof parsed !== 'object') return undefined;
	const args = parsed as Record<string, unknown>;

	const truncate = (s: string, n = 80) =>
		s.length > n ? s.slice(0, n - 1) + '…' : s;

	switch (toolName) {
		case 'internet_search': {
			const q = typeof args.query === 'string' ? args.query : '';
			return q ? `"${truncate(q)}"` : undefined;
		}
		case 'write_todos': {
			const todos = args.todos;
			if (Array.isArray(todos)) return `${todos.length} todos`;
			return undefined;
		}
		case 'read_file':
		case 'read':
		case 'write_file':
		case 'edit_file': {
			const p =
				(typeof args.file_path === 'string' && args.file_path) ||
				(typeof args.path === 'string' && args.path) ||
				'';
			return p ? truncate(p) : undefined;
		}
		case 'ls': {
			const p = typeof args.path === 'string' ? args.path : '/';
			return truncate(p);
		}
		default: {
			for (const v of Object.values(args)) {
				if (typeof v === 'string' && v.trim()) return `"${truncate(v)}"`;
			}
			return undefined;
		}
	}
}

// Global order counter for timeline rendering
let _orderIdx = 0;
function nextOrder(): number {
	return ++_orderIdx;
}

const CONVERSATIONS_KEY = 'deepagents-conversations';

export interface StoredConversation {
	id: string;
	title: string;
	timestamp: number;
}

function getStoredConversations(): StoredConversation[] {
	try {
		return JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || '[]');
	} catch {
		return [];
	}
}

function saveConversationToStorage(id: string, title: string) {
	const list = getStoredConversations();
	if (list.find((c) => c.id === id)) return;
	list.unshift({ id, title: title.slice(0, 50), timestamp: Date.now() });
	if (list.length > 20) list.pop();
	localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(list));
}

async function removeConversationFromStorage(id: string) {
	const list = getStoredConversations().filter((c) => c.id !== id);
	localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(list));
	try {
		await fetch('/stream', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'makers-conversation-id': id
			},
			body: JSON.stringify({ action: 'delete', conversationId: id })
		});
	} catch {
		// ignore
	}
}

function getInitialConversationId(): string {
	const urlParams = new URLSearchParams(window.location.search);
	const urlId = urlParams.get('id');
	if (urlId) return urlId;
	return crypto.randomUUID();
}

// ---- Store state ----

export const messages = writable<ChatMessage[]>([]);
export const subAgentGroups = writable<SubAgentGroup[]>([]);
export const phase = writable<ResearchPhase>('idle');
export const isStreaming = writable(false);
export const isLoadingHistory = writable(false);
export const loadError = writable<string | null>(null);

// ---- Internal refs ----

let abortController: AbortController | null = null;
let wasCancelled = false;
let conversationId = getInitialConversationId();
let conversationSaved = false;

const saToCard = new Map<string, string>();
const cardToGroup = new Map<string, string>();

function resolveCardId(
	event: StreamEvent,
	opts: { preferToolCallId?: boolean } = {}
): string | null {
	if (opts.preferToolCallId && event.tool_call_id) return event.tool_call_id;
	if (event.subagent_id) {
		const mapped = saToCard.get(event.subagent_id);
		if (mapped) return mapped;
	}
	return null;
}

function updateTask(cardId: string, updater: (task: SubAgentTask) => SubAgentTask) {
	subAgentGroups.update((prev) =>
		prev.map((group) => ({
			...group,
			tasks: group.tasks.map((task) => (task.id === cardId ? updater(task) : task))
		}))
	);
}

// ---- Build flow items ----

export const flowItems = derived([messages, subAgentGroups], ([$messages, $subAgentGroups]) => {
	const ordered: { orderIdx: number; item: FlowItem }[] = [];

	for (const msg of $messages) {
		ordered.push({
			orderIdx: msg.orderIdx ?? 0,
			item:
				msg.role === 'user'
					? { type: 'user_message', message: msg }
					: { type: 'ai_message', message: msg }
		});
	}

	for (const group of $subAgentGroups) {
		ordered.push({
			orderIdx: group.orderIdx ?? 0,
			item: { type: 'subagent_group', group }
		});
	}

	ordered.sort((a, b) => a.orderIdx - b.orderIdx);
	return ordered.map((o) => o.item);
});

// ---- Send message ----

export async function sendMessage(text: string) {
	let _isStreaming = false;
	const unsub = isStreaming.subscribe((v) => (_isStreaming = v));
	unsub();

	if (!text.trim() || _isStreaming) return;

	const userMsg: ChatMessage = {
		id: uid(),
		role: 'user',
		content: text,
		orderIdx: nextOrder()
	};

	messages.update((prev) => [...prev, userMsg]);
	phase.set('planning');
	isStreaming.set(true);

	if (!conversationSaved) {
		saveConversationToStorage(conversationId, text);
		conversationSaved = true;
		window.history.replaceState(null, '', '?id=' + conversationId);
	}

	const controller = new AbortController();
	abortController = controller;
	wasCancelled = false;

	saToCard.clear();
	cardToGroup.clear();

	let currentAssistantId: string | null = null;
	let synthesisAssistantId: string | null = null;
	let synthesisStarted = false;
	let currentGroupId: string | null = null;
	let lastGroupLinkedToMsgId: string | null = null;
	let hasSeenSubAgents = false;
	const unmappedCardIds: string[] = [];
	let generatingImageMsgId: string | null = null;
	let generatingVideoMsgId: string | null = null;

	function handleSubagentPending(event: StreamEvent) {
		const cardId = event.tool_call_id || uid();
		const description = '__PENDING__';
		const subagentType = event.subagent_type || 'researcher';

		if (synthesisStarted) {
			synthesisStarted = false;
			synthesisAssistantId = null;
		}

		hasSeenSubAgents = true;
		phase.set('researching');

		if (currentAssistantId) {
			const aid = currentAssistantId;
			messages.update((prev) =>
				prev.map((m) => (m.id === aid ? { ...m, hasSubAgents: true } : m))
			);
		}

		const newTask: SubAgentTask = {
			id: cardId,
			description,
			status: 'pending',
			content: '',
			toolCalls: [],
			startedAt: Date.now(),
			subagentType
		};

		unmappedCardIds.push(cardId);

		if (!currentGroupId || currentAssistantId !== lastGroupLinkedToMsgId) {
			currentGroupId = `group-${++_id}`;
			lastGroupLinkedToMsgId = currentAssistantId;
			const triggerMsgId = currentAssistantId || undefined;
			subAgentGroups.update((prev) => [
				...prev,
				{
					id: currentGroupId!,
					tasks: [newTask],
					triggeredByMessageId: triggerMsgId,
					orderIdx: nextOrder()
				}
			]);
		} else {
			const gid = currentGroupId;
			subAgentGroups.update((prev) =>
				prev.map((g) => (g.id === gid ? { ...g, tasks: [...g.tasks, newTask] } : g))
			);
		}

		cardToGroup.set(cardId, currentGroupId!);
	}

	function handleSubagentStep(event: StreamEvent) {
		const saId = event.subagent_id || '';

		if (saId && !saToCard.has(saId) && unmappedCardIds.length > 0) {
			const cardId = unmappedCardIds.shift()!;
			saToCard.set(saId, cardId);
		}

		const cardId = resolveCardId(event, { preferToolCallId: true });
		if (cardId) {
			updateTask(cardId, (t) =>
				t.status === 'pending'
					? { ...t, status: 'running', subagentId: saId, startedAt: Date.now() }
					: t
			);
		}
	}

	function handleSubagentComplete(event: StreamEvent) {
		const toolCallId = event.tool_call_id || '';
		const contentPrefix = event.content || '';
		const description = event.description || '';
		if (!toolCallId) return;

		subAgentGroups.update((prev) => {
			let matchedCardId: string | null = null;

			if (contentPrefix) {
				const prefix = contentPrefix.slice(0, 50);
				for (const group of prev) {
					for (const task of group.tasks) {
						if (task.content && task.content.startsWith(prefix)) {
							matchedCardId = task.id;
							break;
						}
					}
					if (matchedCardId) break;
				}
			}

			const targetCardId = matchedCardId || toolCallId;

			const updated = prev.map((group) => ({
				...group,
				tasks: group.tasks.map((task) =>
					task.id === targetCardId
						? {
								...task,
								description: description || task.description,
								status: 'complete' as const,
								duration: (Date.now() - task.startedAt) / 1000,
								toolCalls: task.toolCalls.map((tc) => ({
									...tc,
									status: 'completed' as const
								}))
							}
						: task
				)
			}));

			const allComplete = updated.every((g) =>
				g.tasks.every((t) => t.status === 'complete')
			);
			if (allComplete && hasSeenSubAgents) {
				synthesisStarted = true;
				phase.set('synthesizing');
			}

			return updated;
		});
	}

	function handleMainAI(event: StreamEvent) {
		const content = event.content || '';
		if (!content) return;

		if (hasSeenSubAgents) {
			if (!synthesisStarted) {
				synthesisStarted = true;
				phase.set('synthesizing');
				subAgentGroups.update((prev) =>
					prev.map((group) => ({
						...group,
						tasks: group.tasks.map((task) =>
							task.status === 'running' || task.status === 'pending'
								? {
										...task,
										status: 'complete' as const,
										duration: task.startedAt ? (Date.now() - task.startedAt) / 1000 : 0
									}
								: task
						)
					}))
				);
			}

			if (!synthesisAssistantId) {
				const newId = uid();
				synthesisAssistantId = newId;
				currentAssistantId = newId;
				currentGroupId = null;
				messages.update((prev) => [
					...prev,
					{ id: newId, role: 'assistant', content, orderIdx: nextOrder() }
				]);
			} else {
				const targetId = synthesisAssistantId;
				messages.update((prev) =>
					prev.map((m) => (m.id === targetId ? { ...m, content: m.content + content } : m))
				);
			}
			return;
		}

		if (!currentAssistantId) {
			const newId = uid();
			currentAssistantId = newId;
			messages.update((prev) => [
				...prev,
				{ id: newId, role: 'assistant', content, orderIdx: nextOrder() }
			]);
		} else {
			const targetId = currentAssistantId;
			messages.update((prev) =>
				prev.map((m) => (m.id === targetId ? { ...m, content: m.content + content } : m))
			);
		}
	}

	function handleMainToolCall(event: StreamEvent) {
		if (event.name === 'task') {
			hasSeenSubAgents = true;
			phase.set('researching');
		}
	}

	function handleSubagentAI(event: StreamEvent) {
		const cardId = resolveCardId(event, { preferToolCallId: false });
		const content = event.content || '';
		if (!cardId || !content) return;

		updateTask(cardId, (t) => {
			const allToolsDone =
				t.toolCalls.length > 0 && t.toolCalls.every((tc) => tc.status === 'completed');
			const shouldUpdateDesc = allToolsDone && !t.content;

			return {
				...t,
				content: t.content + content,
				status: t.status === 'pending' ? 'running' : t.status,
				...(shouldUpdateDesc && { description: '__SUMMARIZING__' })
			};
		});
	}

	function handleSubagentToolCall(event: StreamEvent) {
		const cardId = resolveCardId(event, { preferToolCallId: false });
		if (!cardId) return;

		const tcId = event.tool_call_id;
		const name = event.name;
		if (!name) return;

		const args = event.args ?? '';
		const entryId = tcId ? `tc:${tcId}` : toolCallUid();

		updateTask(cardId, (t) => {
			if (tcId && t.toolCalls.some((tc) => tc.id === entryId)) return t;

			const entry: ToolCallEntry = {
				id: entryId,
				name,
				status: 'pending',
				args: args || undefined,
				argSummary: args ? buildArgSummary(name, args) : undefined
			};

			const argSummary = args ? buildArgSummary(name, args) : undefined;
			const dynamicDesc = argSummary ? `${name} ${argSummary}` : name;

			return {
				...t,
				description: dynamicDesc,
				toolCalls: [...t.toolCalls, entry],
				status: t.status === 'pending' ? 'running' : t.status
			};
		});
	}

	function handleSubagentToolResult(event: StreamEvent) {
		const cardId = resolveCardId(event, { preferToolCallId: false });
		if (!cardId) return;
		const tcId = event.tool_call_id;
		const entryId = tcId ? `tc:${tcId}` : null;

		updateTask(cardId, (t) => {
			const toolCalls = [...t.toolCalls];
			let idx = entryId ? toolCalls.findIndex((tc) => tc.id === entryId) : -1;
			if (idx === -1) {
				idx = toolCalls.findIndex((tc) => tc.status === 'pending');
			}
			if (idx !== -1) {
				toolCalls[idx] = {
					...toolCalls[idx],
					status: 'completed'
				};
			}
			return { ...t, toolCalls };
		});
	}

	// ---- SSE stream consumption ----

	try {
		const resp = await fetch('/stream', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'makers-conversation-id': conversationId
			},
			body: JSON.stringify({ message: text }),
			signal: controller.signal
		});

		if (!resp.ok) {
			throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
		}

		const reader = resp.body?.getReader();
		if (!reader) throw new Error('No readable stream');

		const decoder = new TextDecoder();
		let buffer = '';

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n');
			buffer = lines.pop() || '';

			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed || !trimmed.startsWith('data: ')) continue;

				const payload = trimmed.slice(6);
				if (payload === '[DONE]') continue;

				let event: StreamEvent;
				try {
					event = JSON.parse(payload);
				} catch {
					continue;
				}

				switch (event.type) {
					case 'subagent_pending':
						handleSubagentPending(event);
						break;
					case 'subagent_step':
						handleSubagentStep(event);
						break;
					case 'subagent_complete':
						handleSubagentComplete(event);
						break;
					case 'ai':
						if (event.source === 'main') {
							handleMainAI(event);
						} else {
							handleSubagentAI(event);
						}
						break;
					case 'tool_call':
						if (event.source === 'main') {
							handleMainToolCall(event);
						} else {
							handleSubagentToolCall(event);
						}
						break;
					case 'tool':
						if (event.source === 'subagent') {
							handleSubagentToolResult(event);
						}
						break;
					case 'error':
						messages.update((prev) => [
							...prev,
							{
								id: uid(),
								role: 'assistant',
								content: `⚠️ ${event.content || 'Unknown error'}`,
								orderIdx: nextOrder()
							}
						]);
						break;
					case 'generating_image': {
						const msgId = `img-${Date.now()}`;
						generatingImageMsgId = msgId;
						messages.update((prev) => [
							...prev,
							{
								id: msgId,
								role: 'assistant',
								content: '',
								multimodalType: 'image' as const,
								generationStatus: 'generating' as const,
								orderIdx: nextOrder()
							}
						]);
						break;
					}
					case 'generating_video': {
						const msgId = `vid-${Date.now()}`;
						generatingVideoMsgId = msgId;
						messages.update((prev) => [
							...prev,
							{
								id: msgId,
								role: 'assistant',
								content: '',
								multimodalType: 'video' as const,
								generationStatus: 'generating' as const,
								orderIdx: nextOrder()
							}
						]);
						break;
					}
					case 'image_result': {
						const imgMsgId = generatingImageMsgId;
						generatingImageMsgId = null;
						if (imgMsgId) {
							if (event.status === 'error') {
								messages.update((prev) =>
									prev.map((m) =>
										m.id === imgMsgId
											? {
													...m,
													generationStatus: 'error' as const,
													generationError: event.error || 'Generation failed'
												}
											: m
									)
								);
							} else if (event.url) {
								messages.update((prev) =>
									prev.map((m) =>
										m.id === imgMsgId
											? {
													...m,
													imageUrl: event.url,
													generationStatus: 'ready' as const
												}
											: m
									)
								);
							} else {
								messages.update((prev) =>
									prev.map((m) =>
										m.id === imgMsgId
											? {
													...m,
													generationStatus: 'error' as const,
													generationError: 'No image URL returned'
												}
											: m
									)
								);
							}
						}
						break;
					}
					case 'video_result': {
						const vidMsgId = generatingVideoMsgId;
						generatingVideoMsgId = null;
						if (vidMsgId) {
							if (event.status === 'error') {
								messages.update((prev) =>
									prev.map((m) =>
										m.id === vidMsgId
											? {
													...m,
													generationStatus: 'error' as const,
													generationError: event.error || 'Generation failed'
												}
											: m
									)
								);
							} else if (event.url) {
								messages.update((prev) =>
									prev.map((m) =>
										m.id === vidMsgId
											? {
													...m,
													videoUrl: event.url,
													generationStatus: 'ready' as const
												}
											: m
									)
								);
							} else {
								messages.update((prev) =>
									prev.map((m) =>
										m.id === vidMsgId
											? {
													...m,
													generationStatus: 'error' as const,
													generationError: 'No video URL returned'
												}
											: m
									)
								);
							}
						}
						break;
					}
				}
			}
		}
	} catch (err: unknown) {
		if (err instanceof DOMException && err.name === 'AbortError') {
			wasCancelled = true;
		} else {
			const errorMsg =
				err instanceof Error ? err.message : 'Stream connection failed';
			messages.update((prev) => [
				...prev,
				{
					id: uid(),
					role: 'assistant',
					content: `⚠️ ${errorMsg}`,
					orderIdx: nextOrder()
				}
			]);
		}
	} finally {
		isStreaming.set(false);
		abortController = null;

		if (wasCancelled) {
			phase.set('idle');
			messages.update((prev) => [
				...prev,
				{ id: uid(), role: 'assistant', content: '__STOPPED__', orderIdx: nextOrder() }
			]);
			subAgentGroups.update((prev) =>
				prev.map((group) => ({
					...group,
					tasks: group.tasks.map((task) =>
						task.status === 'running' || task.status === 'pending'
							? {
									...task,
									status: 'cancelled' as const,
									duration: task.duration || (Date.now() - task.startedAt) / 1000
								}
							: task
					)
				}))
			);
		} else {
			phase.set('complete');
			subAgentGroups.update((prev) =>
				prev.map((group) => ({
					...group,
					tasks: group.tasks.map((task) =>
						task.status === 'running' || task.status === 'pending'
							? {
									...task,
									status: 'complete' as const,
									duration: task.duration || (Date.now() - task.startedAt) / 1000
								}
							: task
					)
				}))
			);
		}
	}
}

// ---- Stop streaming ----

export function stopStreaming() {
	wasCancelled = true;
	abortController?.abort();
	abortController = null;

	const convId = conversationId;
	fetch('/stop', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'makers-conversation-id': convId
		},
		body: JSON.stringify({ conversationId: convId })
	}).catch(() => {
		// ignore
	});
}

// ---- Reset for new conversation ----

export function resetChat() {
	stopStreaming();
	messages.set([]);
	subAgentGroups.set([]);
	phase.set('idle');
	isStreaming.set(false);
	isLoadingHistory.set(false);
	saToCard.clear();
	cardToGroup.clear();
	_orderIdx = 0;
	conversationId = crypto.randomUUID();
	conversationSaved = false;
	window.history.replaceState(null, '', window.location.pathname);
}

// ---- Load conversation from backend ----

export async function loadConversation(targetConversationId: string) {
	let _isStreaming = false;
	const unsub = isStreaming.subscribe((v) => (_isStreaming = v));
	unsub();

	if (_isStreaming) return;
	isLoadingHistory.set(true);
	loadError.set(null);
	messages.set([]);
	subAgentGroups.set([]);
	phase.set('idle');
	saToCard.clear();
	cardToGroup.clear();
	_orderIdx = 0;

	conversationId = targetConversationId;
	conversationSaved = true;
	window.history.replaceState(null, '', '?id=' + targetConversationId);

	try {
		const resp = await fetch('/stream', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'makers-conversation-id': targetConversationId
			},
			body: JSON.stringify({ action: 'history', conversationId: targetConversationId })
		});

		if (!resp.ok) {
			throw new Error(`HTTP ${resp.status}`);
		}
		const data = await resp.json();
		const items: Array<
			| { type: 'user'; content: string }
			| { type: 'coordinator'; content: string }
			| {
					type: 'subagentTask';
					id: string;
					description: string;
					subagentType: string;
					content: string;
				}
		> = data.items || [];

		const restoredMessages: ChatMessage[] = [];
		const restoredGroups: SubAgentGroup[] = [];
		let currentGroupTasks: SubAgentTask[] = [];
		let lastCoordinatorMsgId: string | null = null;

		for (const item of items) {
			if (item.type === 'user') {
				if (currentGroupTasks.length > 0) {
					restoredGroups.push({
						id: `group-restored-${restoredGroups.length}-${Date.now()}`,
						tasks: currentGroupTasks,
						triggeredByMessageId: lastCoordinatorMsgId || undefined,
						orderIdx: ++_orderIdx
					});
					if (lastCoordinatorMsgId) {
						const m = restoredMessages.find((msg) => msg.id === lastCoordinatorMsgId);
						if (m) m.hasSubAgents = true;
					}
					currentGroupTasks = [];
					lastCoordinatorMsgId = null;
				}

				const id = `restored-${restoredMessages.length}-${Date.now()}`;
				restoredMessages.push({
					id,
					role: 'user',
					content: item.content,
					orderIdx: ++_orderIdx
				});
			} else if (item.type === 'coordinator') {
				if (currentGroupTasks.length > 0) {
					restoredGroups.push({
						id: `group-restored-${restoredGroups.length}-${Date.now()}`,
						tasks: currentGroupTasks,
						triggeredByMessageId: lastCoordinatorMsgId || undefined,
						orderIdx: ++_orderIdx
					});
					if (lastCoordinatorMsgId) {
						const m = restoredMessages.find((msg) => msg.id === lastCoordinatorMsgId);
						if (m) m.hasSubAgents = true;
					}
					currentGroupTasks = [];
				}

				const id = `restored-${restoredMessages.length}-${Date.now()}`;
				lastCoordinatorMsgId = id;
				restoredMessages.push({
					id,
					role: 'assistant',
					content: item.content,
					orderIdx: ++_orderIdx
				});
			} else if (item.type === 'subagentTask') {
				currentGroupTasks.push({
					id: item.id,
					description: item.description,
					status: 'complete',
					content: item.content,
					toolCalls: [],
					startedAt: 0,
					subagentType: item.subagentType
				});
			}
		}

		if (currentGroupTasks.length > 0) {
			restoredGroups.push({
				id: `group-restored-${restoredGroups.length}-${Date.now()}`,
				tasks: currentGroupTasks,
				triggeredByMessageId: lastCoordinatorMsgId || undefined,
				orderIdx: ++_orderIdx
			});
			if (lastCoordinatorMsgId) {
				const m = restoredMessages.find((msg) => msg.id === lastCoordinatorMsgId);
				if (m) m.hasSubAgents = true;
			}
		}

		messages.set(restoredMessages);
		subAgentGroups.set(restoredGroups);
		if (restoredMessages.length > 0) {
			phase.set('complete');
		} else {
			loadError.set('empty');
		}
	} catch (err) {
		console.error('Failed to load conversation history:', err);
		loadError.set(err instanceof Error ? err.message : 'Unknown error');
	} finally {
		isLoadingHistory.set(false);
	}
}

// ---- Auto-restore conversation on mount if URL has ?id= ----

export function autoRestore() {
	const urlParams = new URLSearchParams(window.location.search);
	const urlId = urlParams.get('id');
	if (urlId) {
		loadConversation(urlId);
	}
}

// ---- Export helpers ----

export { getStoredConversations, removeConversationFromStorage };

export function dismissLoadError() {
	loadError.set(null);
}
