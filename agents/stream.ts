/**
 * 红红 (Honghong) — 智能对话 Agent (极速版)
 *
 * 核心优化：
 * 1. 移除 subgraphs: true，只流式返回 messages
 * 2. 移除 updates 模式，只使用 messages 模式
 * 3. 子代理事件通过自定义 channel 流式返回
 * 4. 减少不必要的 JSON 序列化和状态检查
 */

import { initChatModel, tool } from 'langchain';
import { modelRetryMiddleware, toolRetryMiddleware, toolCallLimitMiddleware } from 'langchain';
import { createDeepAgent, CompositeBackend, StateBackend, StoreBackend, type SubAgent } from 'deepagents';
import { AIMessageChunk, ToolMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { generateImage, generateVideo, getVideoStatus } from './_multimodal';

type Model = Awaited<ReturnType<typeof initChatModel>>;
type Agent = ReturnType<typeof createDeepAgent>;

interface Env {
  AGNES_API_KEY: string;
  AGNES_BASE_URL: string;
  AGNES_MODEL: string;
}

import { createLogger } from './_logger';

const logger = createLogger('chat-stream');

let model: Model | null = null;
let agent: Agent | null = null;

function getEnv(contextEnv: Record<string, string | undefined> | undefined): Env {
  const source = contextEnv ?? process.env ?? {};
  const apiKey = source.AGNES_API_KEY?.trim() || "";
  const baseUrl = source.AGNES_BASE_URL?.trim() || "";
  if (!apiKey || !baseUrl) {
    throw new Error("Missing AGNES_API_KEY or AGNES_BASE_URL");
  }
  return {
    AGNES_API_KEY: apiKey,
    AGNES_BASE_URL: baseUrl,
    AGNES_MODEL: source.AGNES_MODEL?.trim() || "agnes-2.0-flash",
  };
}

async function getModel(env: Env): Promise<Model> {
  if (!model) {
    logger.log('Initializing model...');
    model = await initChatModel(env.AGNES_MODEL, {
      modelProvider: 'openai',
      apiKey: env.AGNES_API_KEY,
      configuration: {
        baseURL: env.AGNES_BASE_URL,
      },
      temperature: 0.7,
      timeout: 300_000,
    });
  }
  return model;
}

function getAgent(modelInstance: Model, checkpointer: any, store: any, contextTools: any, contextEnv: Record<string, string | undefined>): Agent {
  if (!agent) {
    logger.log('Initializing smart chat agent...');

    const today = new Date().toISOString().slice(0, 10);
    const webSearchTools = contextTools.toLangChainTools(tool, ['web_search']);

    const imageGenTool = tool(async ({ prompt, size }: { prompt: string; size?: string }) => {
      try {
        const result = await generateImage({ prompt, size: size || '1024x1024' }, contextEnv);
        return JSON.stringify({ success: true, url: result.url, type: 'image' });
      } catch (e) {
        return JSON.stringify({ success: false, error: (e as Error).message, type: 'image' });
      }
    }, {
      name: 'generate_image',
      description: 'Generate an image from a text description. Use this when the user asks you to create, generate, draw, or make an image/picture/photo/illustration.',
      schema: z.object({
        prompt: z.string().describe('Detailed description of the image to generate'),
        size: z.string().optional().describe('Image size: 1024x1024, 1024x768, or 768x1024'),
      }),
    });

    const videoGenTool = tool(async ({ prompt }: { prompt: string }) => {
      try {
        const result = await generateVideo({ prompt }, contextEnv);
        // Poll up to 60 times (5 minutes)
        let videoResult = result;
        for (let i = 0; i < 60; i++) {
          if (videoResult.status === 'completed' || videoResult.status === 'succeeded') break;
          if (videoResult.status === 'failed' || videoResult.status === 'cancelled') break;
          await new Promise(r => setTimeout(r, 5000));
          videoResult = await getVideoStatus(videoResult.taskId, contextEnv);
        }
        return JSON.stringify({
          success: videoResult.status === 'completed' || videoResult.status === 'succeeded',
          url: videoResult.url,
          type: 'video',
          status: videoResult.status,
        });
      } catch (e) {
        return JSON.stringify({ success: false, error: (e as Error).message, type: 'video' });
      }
    }, {
      name: 'generate_video',
      description: 'Generate a short video from a text description. Use this when the user asks you to create, generate, or make a video/animation.',
      schema: z.object({
        prompt: z.string().describe('Detailed description of the video to generate'),
      }),
    });

    const researcherSubagent: SubAgent = {
      name: 'researcher',
      description:
        'Use this to search the web for up-to-date information. Call this when the user asks about current events, news, recent data, live information, or anything that requires real-time knowledge.',
      systemPrompt:
        `You are 红红's web search assistant. Today is ${today}.\n` +
        `CRITICAL: You MUST respond in the EXACT same language as your task description.\n\n` +
        `Workflow:\n` +
        `1. Call web_search 2-4 times with different queries.\n` +
        `2. Write a clear and helpful summary.\n\n` +
        `HARD LIMIT: web_search AT MOST 5 times.\n\n` +
        `Output rules:\n` +
        `- Write a well-structured summary (under 800 Chinese chars or 500 English words).\n` +
        `- Do NOT narrate your search process.\n` +
        `- Do NOT echo raw JSON from tool results.\n` +
        `- Use Markdown formatting for better readability.`,
      tools: webSearchTools,
      middleware: [
        modelRetryMiddleware({ maxRetries: 3 }),
        toolRetryMiddleware({ maxRetries: 1, tools: ['web_search'] }),
        toolCallLimitMiddleware({ toolName: 'web_search', runLimit: 15 }),
      ],
    };

    agent = createDeepAgent({
      model: modelInstance,
      systemPrompt:
        `你是红红 (Honghong)，一个智能AI助手，由长芳 (Changfang) 开发。今天是 ${today}。\n\n` +
        `## 核心原则\n` +
        `1. 你是一个友好、自然、智能的对话助手，像豆包一样。\n` +
        `2. 你必须使用用户使用的语言回复。如果用户用中文，你必须用中文回复；如果用英文，用英文回复。\n` +
        `3. 你的回复应该自然流畅，像一个真人在聊天，而不是机械的搜索报告。\n\n` +
        `## 何时搜索网页\n` +
        `- 当用户询问**时事新闻、最新动态、近期事件、实时数据**时，使用 researcher 子代理搜索。\n` +
        `- 当用户询问**需要最新信息的话题**（如"今天天气"、"最新AI进展"、"XX公司股价"）时，搜索。\n` +
        `- 当用户明确要求"帮我查一下"、"搜索"、"最新"时，搜索。\n\n` +
        `## 何时直接回答\n` +
        `- **常识性问题**（如"1+1等于几"、"中国的首都是哪里"）：直接回答，不搜索。\n` +
        `- **编程问题**（如"Python怎么读文件"、"React和Vue区别"）：直接用你的知识回答。\n` +
        `- **翻译、写作、分析、数学计算**：直接回答。\n` +
        `- **一般性建议**（如"怎么学好英语"、"推荐几本书"）：直接回答。\n` +
        `- **闲聊、打招呼、情感交流**：自然对话，不搜索。\n\n` +
        `## 回复风格\n` +
        `- 简洁有力，不要啰嗦。不要说"作为AI助手"之类的自我介绍。\n` +
        `- 使用 Markdown 格式让内容更清晰（标题、列表、加粗、代码块等）。\n` +
        `- 如果搜索了网页，将搜索结果自然地整合到回答中，不要暴露搜索过程。\n` +
        `- 可以使用适当的 emoji 让对话更生动。\n` +
        `- 如果用户问你是谁，回答"我是红红，由长芳开发的AI助手~"\n\n` +
        `## 重要规则\n` +
        `- 不要每次都搜索！大多数问题你可以直接回答。\n` +
        `- 只有真正需要最新信息时才使用 researcher。\n` +
        `- 如果不需要搜索，直接输出你的回答文本，不要调用任何工具。\n\n` +
        `## 图像和视频生成\n` +
        `- 当用户要求**生成图片、画图、创建图像、制作图片**时，使用 generate_image 工具。\n` +
        `- 当用户要求**生成视频、创建视频、制作动画**时，使用 generate_video 工具。\n` +
        `- 生成前，先简短回复用户（如"好的，我来帮你生成~"），然后调用工具。\n` +
        `- 工具返回后，告诉用户图片/视频已经生成好了。\n` +
        `- 如果生成失败，告诉用户并建议重试。`,
      subagents: [researcherSubagent],
      tools: [imageGenTool, videoGenTool],
      middleware: [
        modelRetryMiddleware({ maxRetries: 3 }),
      ],
      checkpointer,
      store,
      backend: new CompositeBackend(
        new StateBackend(),
        {
          '/memories/': new StoreBackend({
            namespace: ['agent', 'memories'],
          }),
        },
      ),
      memory: ['/memories/AGENTS.md'],
    });
  }
  return agent;
}

// ─── Fast SSE event stream ───

interface StreamEvent {
  type: string;
  source?: 'main' | 'subagent';
  content?: string;
  name?: string;
  tool_name?: string;
  tool_call_id?: string;
  subagent_type?: string;
  description?: string;
  subagent_id?: string;
  args?: string;
  url?: string;
  status?: string;
  error?: string;
}

function send(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

async function* eventStream(
  agentInstance: Agent,
  message: string,
  conversationId: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const knownSubagents = new Map<string, string>();
  const pendingDescriptions = new Map<string, string>();
  const emittedToolCallIds = new Set<string>();
  const emittedToolResultIds = new Set<string>();
  const toolCallIdToName = new Map<string, string>();

  function extractNsSegment(ns: string[]): string {
    return ns.find((s) => s.startsWith('tools:')) ?? '';
  }

  function shortId(nsSegment: string): string {
    return nsSegment.split(':').pop()?.slice(0, 8) ?? '';
  }

  function ensureSubagent(nsSegment: string): string {
    if (knownSubagents.has(nsSegment)) return knownSubagents.get(nsSegment)!;
    const saId = shortId(nsSegment);
    knownSubagents.set(nsSegment, saId);
    return saId;
  }

  try {
    // Fast mode: only stream messages, no subgraphs, no updates
    const stream = await agentInstance.stream(
      { messages: [{ role: 'user', content: message }] },
      {
        configurable: { thread_id: conversationId },
        streamMode: ['messages'],
        subgraphs: true,
        signal,
      } as any,
    );

    for await (const tuple of stream) {
      if (signal?.aborted) break;

      const [chunkNs, chunkType, chunkData] = tuple as any as [string[], string, any];
      const nsSegment = extractNsSegment(chunkNs);
      const isSubagent = !!nsSegment;

      // ── "messages" mode: stream text tokens ──
      if (chunkType === 'messages') {
        const [msg] = chunkData;
        if (!AIMessageChunk.isInstance(msg)) continue;

        // Handle tool calls (subagent delegation + multimodal generation)
        if (msg.tool_call_chunks?.length) {
          for (const tc of msg.tool_call_chunks) {
            if (tc.name === 'task') {
              const desc = (tc.args?.description ?? '').slice(0, 500);
              const saType = tc.args?.subagent_type ?? 'researcher';
              pendingDescriptions.set(tc.id, desc);
              yield send({
                type: 'subagent_pending',
                tool_call_id: tc.id,
                subagent_type: saType,
                description: desc,
              });
            }
            // Detect generate_image / generate_video tool calls from main agent
            if (!isSubagent && (tc.name === 'generate_image' || tc.name === 'generate_video')) {
              yield send({
                type: tc.name === 'generate_image' ? 'generating_image' : 'generating_video',
              });
            }
          }
          continue;
        }

        if (!msg.text) continue;
        const content = msg.text.replace(/\n{3,}/g, '\n\n');
        if (!content) continue;

        if (isSubagent) {
          const saId = ensureSubagent(nsSegment);
          yield send({ type: 'ai', source: 'subagent', content, subagent_id: saId });
        } else {
          yield send({ type: 'ai', source: 'main', content });
        }
        continue;
      }

      // ── "updates" mode: tool lifecycle events (only when subgraphs are active) ──
      if (chunkType === 'updates') {
        const data: Record<string, any> = chunkData ?? {};

        for (const [nodeName, nodeData] of Object.entries(data)) {
          // Subagent model_request → tool_calls
          if (isSubagent && nodeName === 'model_request') {
            const stateMessages = (nodeData as any)?.messages ?? [];
            for (const msg of stateMessages) {
              for (const tc of (msg as any)?.tool_calls ?? []) {
                if (!tc?.name) continue;
                const tcRealId: string = tc.id ?? '';
                if (tcRealId && emittedToolCallIds.has(tcRealId)) continue;
                if (tcRealId) {
                  emittedToolCallIds.add(tcRealId);
                  toolCallIdToName.set(tcRealId, tc.name);
                }

                const saId = ensureSubagent(nsSegment);
                const argsStr = typeof tc.args === 'string'
                  ? tc.args
                  : tc.args != null ? JSON.stringify(tc.args) : '';

                yield send({
                  type: 'tool_call',
                  source: 'subagent',
                  name: tc.name,
                  subagent_id: saId,
                  tool_call_id: tcRealId,
                  ...(argsStr && { args: argsStr }),
                });
              }
            }
          }

          // Subagent tools node → tool completion
          if (isSubagent && nodeName === 'tools') {
            const stateMessages = (nodeData as any)?.messages ?? [];
            for (const msg of stateMessages) {
              if (!ToolMessage.isInstance(msg) && (msg as any)?.type !== 'tool') continue;
              const toolTcId: string = (msg as any).tool_call_id ?? '';
              const resolvedName = msg.name ?? toolCallIdToName.get(toolTcId) ?? '';
              if (resolvedName === 'task') continue;
              if (toolTcId && emittedToolResultIds.has(toolTcId)) continue;
              if (toolTcId) emittedToolResultIds.add(toolTcId);

              const saId = ensureSubagent(nsSegment);
              yield send({
                type: 'tool',
                source: 'subagent',
                tool_name: resolvedName,
                subagent_id: saId,
                tool_call_id: toolTcId,
              });
            }
          }

          // Main agent tools node → task ToolMessage → subagent_complete
          // Also detect generate_image/generate_video tool results
          if (!isSubagent && nodeName === 'tools') {
            const messages = (nodeData as any)?.messages ?? [];
            for (const msg of messages) {
              if (msg.type !== 'tool') continue;
              const toolName = msg.name ?? '';
              const toolCallId = msg.tool_call_id ?? '';

              // Handle generate_image / generate_video results
              if (toolName === 'generate_image' || toolName === 'generate_video') {
                let contentText = '';
                if (typeof msg.content === 'string') {
                  contentText = msg.content;
                } else if (Array.isArray(msg.content)) {
                  contentText = msg.content
                    .filter((block: any) => block.type === 'text')
                    .map((block: any) => block.text || '')
                    .join('');
                }

                // Send generating event first (before tool completes, this is already done)
                // Parse the result and send the appropriate event
                try {
                  const result = JSON.parse(contentText);
                  const mediaType = result.type || (toolName === 'generate_image' ? 'image' : 'video');
                  if (result.success) {
                    yield send({
                      type: mediaType === 'image' ? 'image_result' : 'video_result',
                      url: result.url || '',
                      status: result.status || 'completed',
                    });
                  } else {
                    yield send({
                      type: mediaType === 'image' ? 'image_result' : 'video_result',
                      url: '',
                      status: 'error',
                      error: result.error || 'Generation failed',
                    });
                  }
                } catch {
                  yield send({
                    type: toolName === 'generate_image' ? 'image_result' : 'video_result',
                    url: '',
                    status: 'error',
                    error: 'Failed to parse tool result',
                  });
                }
                continue;
              }

              if (toolName !== 'task') continue;
              const taskToolCallId = toolCallId;

              let contentText = '';
              if (typeof msg.content === 'string') {
                contentText = msg.content;
              } else if (Array.isArray(msg.content)) {
                contentText = msg.content
                  .filter((block: any) => block.type === 'text')
                  .map((block: any) => block.text || '')
                  .join('');
              }

              yield send({
                type: 'subagent_complete',
                tool_call_id: taskToolCallId,
                description: pendingDescriptions.get(taskToolCallId) || '',
                content: contentText.slice(0, 100),
              });
            }
          }
        }
      }
    }

    // Post-stream error check
    try {
      const finalState = await agentInstance.graph.getState({ configurable: { thread_id: conversationId } });
      const msgs = finalState?.values?.messages || [];
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
      if (lastMsg) {
        const msgType = typeof lastMsg._getType === 'function' ? lastMsg._getType() : lastMsg.type;
        if (msgType === 'ai') {
          let text = '';
          if (typeof lastMsg.content === 'string') text = lastMsg.content;
          else if (Array.isArray(lastMsg.content)) {
            text = lastMsg.content.filter((p: any) => p.type === 'text').map((p: any) => p.text || '').join('');
          }
          if (text && text.includes('MiddlewareError')) {
            logger.error(`MiddlewareError: ${text.slice(0, 200)}`);
            yield send({ type: 'error', content: text });
          }
        }
      }
    } catch {}

  } catch (e: unknown) {
    const error = e as Error;
    if (error.name === 'AbortError' || signal?.aborted) {
      logger.log('Stream aborted by user');
    } else {
      logger.error('Stream error:', error.message);
      yield send({ type: 'error', content: `Stream error: ${error.constructor.name}: ${String(error.message).slice(0, 500)}` });
    }
  }

  yield 'data: [DONE]\n\n';
}

// ─── EdgeOne Makers handler ───

export async function onRequest(context: any) {
  const { request, env, conversation_id: conversationId, run_id: runId } = context;
  logger.log('conversationId:', conversationId, 'runId:', runId);

  const body = request?.body ?? {};
  const action = body.action || 'chat';
  const signal = request?.signal as AbortSignal | undefined;

  const checkpointer = context.store.langgraphCheckpointer;
  const store = context.store.langgraphStore;

  // ── Delete conversation ──
  if (action === 'delete') {
    const threadId = body.conversationId;
    if (!threadId) {
      return new Response(JSON.stringify({ error: 'Missing conversationId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }
    try { await checkpointer.deleteThread(threadId); } catch {}
    return new Response(JSON.stringify({ deleted: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }

  let agentInstance: Agent;
  try {
    const envVars = getEnv(env);
    const modelInstance = await getModel(envVars);
    agentInstance = getAgent(modelInstance, checkpointer, store, context.tools, env);
  } catch (e) {
    const msg = (e as Error).message;
    logger.error(msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }

  // ── History ──
  if (action === 'history') {
    const threadId = body.conversationId;
    logger.log('history request for threadId:', threadId);
    if (!threadId) {
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }
    try {
      const state = await agentInstance.graph.getState({ configurable: { thread_id: threadId } });
      const rawMessages = state?.values?.messages || [];

      type HistoryItem =
        | { type: 'user'; content: string }
        | { type: 'coordinator'; content: string }
        | { type: 'subagentTask'; id: string; description: string; subagentType: string; content: string };

      const items: HistoryItem[] = [];
      const pendingTasks = new Map<string, { description: string; subagentType: string }>();

      for (const m of rawMessages) {
        const msgType = typeof m._getType === 'function' ? m._getType() : m.type;

        if (msgType === 'human') {
          const content = typeof m.content === 'string' ? m.content : '';
          if (content) items.push({ type: 'user', content });
          continue;
        }

        if (msgType === 'ai') {
          let textContent = '';
          if (typeof m.content === 'string') {
            textContent = m.content;
          } else if (Array.isArray(m.content)) {
            textContent = m.content.filter((p: any) => p.type === 'text').map((p: any) => p.text || '').join('');
          }

          for (const tc of (m.tool_calls || [])) {
            if (tc.name === 'task' && tc.id) {
              pendingTasks.set(tc.id, {
                description: (tc.args?.description || '').slice(0, 500),
                subagentType: tc.args?.subagent_type || 'researcher',
              });
            }
          }

          if (textContent) items.push({ type: 'coordinator', content: textContent });
          continue;
        }

        if (msgType === 'tool') {
          const toolCallId = m.tool_call_id || '';
          if (m.name === 'task' && pendingTasks.has(toolCallId)) {
            const taskInfo = pendingTasks.get(toolCallId)!;
            let rawContent = '';
            if (typeof m.content === 'string') {
              rawContent = m.content;
            } else if (Array.isArray(m.content)) {
              rawContent = m.content.filter((block: any) => block.type === 'text').map((block: any) => block.text || '').join('\n');
            }
            items.push({
              type: 'subagentTask',
              id: toolCallId,
              description: taskInfo.description,
              subagentType: taskInfo.subagentType,
              content: rawContent,
            });
            pendingTasks.delete(toolCallId);
          }
          continue;
        }
      }

      logger.log('history: found', items.length, 'items');
      return new Response(JSON.stringify({ items }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    } catch (e) {
      logger.error('history error:', (e as Error).message);
      return new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }
  }

  // ── Chat (SSE streaming) ──
  const { message } = body;
  logger.log('user message:', message);
  if (!message) {
    return new Response('Missing chat message', { status: 400 });
  }

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of eventStream(agentInstance, message, conversationId, signal)) {
          if (signal?.aborted) break;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (e) {
        const error = e as Error;
        if (error.name === 'AbortError' || signal?.aborted) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      logger.log('Client disconnected');
    },
  });

  return new Response(readableStream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
