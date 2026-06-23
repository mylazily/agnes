/**
 * 红红 (Honghong) — 智能对话 Agent (极速版 v3)
 *
 * 核心优化：
 * 1. 超短 system prompt — 减少 token 开销
 * 2. 移除 memory 和复杂 backend — 减少状态管理开销
 * 3. 移除 modelRetryMiddleware — 减少包装层
 * 4. 直接调用模型 streaming — 绕过 deepagents 框架开销
 * 5.  researcher 子代理保留但简化
 */

import { initChatModel, tool } from 'langchain';
import { toolRetryMiddleware, toolCallLimitMiddleware } from 'langchain';
import { createDeepAgent, type SubAgent } from 'deepagents';
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

    const researcherSubagent: SubAgent = {
      name: 'researcher',
      description:
        'Search the web for up-to-date information. Use for current events, news, or real-time data.',
      systemPrompt:
        `You are 红红's web search assistant. Today is ${today}.\n` +
        `Respond in the SAME language as the task description.\n` +
        `Call web_search 2-4 times, then write a concise summary (under 500 words).\n` +
        `Do NOT narrate your search process. Use Markdown formatting.`,
      tools: webSearchTools,
      middleware: [
        toolRetryMiddleware({ maxRetries: 1, tools: ['web_search'] }),
        toolCallLimitMiddleware({ toolName: 'web_search', runLimit: 15 }),
      ],
    };

    const imageGenTool = tool(async ({ prompt, size }: { prompt: string; size?: string }) => {
      try {
        const result = await generateImage({ prompt, size: size || '1024x1024' }, contextEnv);
        return JSON.stringify({ success: true, url: result.url, type: 'image' });
      } catch (e) {
        return JSON.stringify({ success: false, error: (e as Error).message, type: 'image' });
      }
    }, {
      name: 'generate_image',
      description: 'Generate an image from a text description.',
      schema: z.object({
        prompt: z.string().describe('Detailed description of the image'),
        size: z.string().optional().describe('Image size: 1024x1024, 1024x768, or 768x1024'),
      }),
    });

    const videoGenTool = tool(async ({ prompt }: { prompt: string }) => {
      try {
        const result = await generateVideo({ prompt }, contextEnv);
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
      description: 'Generate a short video from a text description.',
      schema: z.object({
        prompt: z.string().describe('Detailed description of the video'),
      }),
    });

    // Ultra-short system prompt for minimal token overhead
    agent = createDeepAgent({
      model: modelInstance,
      systemPrompt:
        `你是红红，由长芳开发的AI助手。今天是${today}。\n` +
        `规则：\n` +
        `1. 用用户语言回复\n` +
        `2. 时事/新闻/实时数据 → 用researcher搜索\n` +
        `3. 常识/编程/翻译/数学/闲聊 → 直接回答\n` +
        `4. 生成图片 → generate_image工具\n` +
        `5. 生成视频 → generate_video工具\n` +
        `6. 简洁自然，可用emoji，Markdown格式\n` +
        `7. 问你是谁 → "我是红红，由长芳开发的AI助手~"`,
      subagents: [researcherSubagent],
      tools: [imageGenTool, videoGenTool],
      checkpointer,
      store,
    });
  }
  return agent;
}

// ─── SSE event shape ───

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

// ─── Fast SSE event stream ───

async function* eventStream(
  agentInstance: Agent,
  message: string,
  conversationId: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const knownSubagents = new Map<string, string>();
  const pendingDescriptions = new Map<string, string>();

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
    const stream = await agentInstance.stream(
      { messages: [{ role: 'user', content: message }] },
      {
        configurable: { thread_id: conversationId },
        streamMode: ['messages'],
        signal,
      } as any,
    );

    for await (const tuple of stream) {
      if (signal?.aborted) break;

      let chunkType: string;
      let chunkData: any;
      let isSubagent = false;

      if (Array.isArray(tuple) && tuple.length === 2) {
        [chunkType, chunkData] = tuple as [string, any];
      } else if (Array.isArray(tuple) && tuple.length >= 3) {
        const [chunkNs, ct, cd] = tuple as [string[], string, any];
        chunkType = ct;
        chunkData = cd;
        const nsSegment = extractNsSegment(chunkNs);
        isSubagent = !!nsSegment;
      } else {
        continue;
      }

      if (chunkType === 'messages') {
        const [msg] = chunkData;
        if (!AIMessageChunk.isInstance(msg)) continue;

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

        yield send({ type: 'ai', source: isSubagent ? 'subagent' : 'main', content });
        continue;
      }

      if (chunkType === 'updates') {
        const data: Record<string, any> = chunkData ?? {};

        for (const [nodeName, nodeData] of Object.entries(data)) {
          if (!isSubagent && nodeName === 'tools') {
            const messages = (nodeData as any)?.messages ?? [];
            for (const msg of messages) {
              if (msg.type !== 'tool') continue;
              const toolName = msg.name ?? '';
              const toolCallId = msg.tool_call_id ?? '';

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
                tool_call_id: toolCallId,
                description: pendingDescriptions.get(toolCallId) || '',
                content: contentText.slice(0, 100),
              });
            }
          }
        }
      }
    }

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
