/**
 * Agnes AI Multi-modal API Service Layer
 * Supports: Text (agnes-2.0-flash), Image (agnes-image-2.1-flash), Video (agnes-video-v2.0)
 */

import { createLogger } from './_logger';

const logger = createLogger('multimodal');

interface Env {
  AGNES_API_KEY: string;
  AGNES_BASE_URL: string;
}

function getEnv(contextEnv: Record<string, string | undefined> | undefined): Env {
  const source = contextEnv ?? process.env ?? {};
  const apiKey = source.AGNES_API_KEY?.trim() || "";
  const baseUrl = source.AGNES_BASE_URL?.trim() || "";
  if (!apiKey || !baseUrl) {
    throw new Error("Missing AGNES_API_KEY or AGNES_BASE_URL");
  }
  return { AGNES_API_KEY: apiKey, AGNES_BASE_URL: baseUrl };
}

// ─── Image Generation ──────────────────────────────────────────────

export interface ImageGenParams {
  prompt: string;
  model?: string;
  size?: string; // e.g. "1024x1024", "1024x768", "768x1024"
  n?: number;
}

export interface ImageGenResult {
  url: string;
  revised_prompt?: string;
}

export async function generateImage(
  params: ImageGenParams,
  contextEnv?: Record<string, string | undefined>,
): Promise<ImageGenResult> {
  const env = getEnv(contextEnv);
  const model = params.model || 'agnes-image-2.1-flash';
  const size = params.size || '1024x1024';

  logger.log(`[image] generating with model=${model}, size=${size}`);

  const response = await fetch(`${env.AGNES_BASE_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.AGNES_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      prompt: params.prompt,
      size,
      n: params.n || 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    logger.error(`[image] API error: HTTP ${response.status}, body: ${errorText}`);
    throw new Error(`Image generation failed: HTTP ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const url = data.data?.[0]?.url;
  if (!url) {
    throw new Error('Image generation returned no URL');
  }

  logger.log(`[image] generated: ${url.slice(0, 80)}...`);
  return {
    url,
    revised_prompt: data.data?.[0]?.revised_prompt,
  };
}

// ─── Image Edit (img2img) ──────────────────────────────────────────

export interface ImageEditParams {
  image: string; // URL or base64 data URI
  prompt: string;
  model?: string;
  size?: string;
}

export async function editImage(
  params: ImageEditParams,
  contextEnv?: Record<string, string | undefined>,
): Promise<ImageGenResult> {
  const env = getEnv(contextEnv);
  const model = params.model || 'agnes-image-2.0-flash';

  logger.log(`[image-edit] editing with model=${model}`);

  const response = await fetch(`${env.AGNES_BASE_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.AGNES_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      prompt: params.prompt,
      size: params.size || '1024x1024',
      extra_body: {
        tags: ['img2img'],
        image: [params.image],
        response_format: 'url',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Image edit failed: HTTP ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const url = data.data?.[0]?.url;
  if (!url) {
    throw new Error('Image edit returned no URL');
  }

  return { url };
}

// ─── Video Generation ──────────────────────────────────────────────

export interface VideoGenParams {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  num_frames?: number;
  frame_rate?: number;
  image?: string; // Optional: first frame image URL
}

export interface VideoGenResult {
  taskId: string;
  status: string;
  url?: string;
}

export async function generateVideo(
  params: VideoGenParams,
  contextEnv?: Record<string, string | undefined>,
): Promise<VideoGenResult> {
  const env = getEnv(contextEnv);

  logger.log(`[video] creating task`);

  const payload: Record<string, any> = {
    model: params.model || 'agnes-video-v2.0',
    prompt: params.prompt,
  };

  if (params.width) payload.width = params.width;
  if (params.height) payload.height = params.height;
  if (params.num_frames) payload.num_frames = params.num_frames;
  if (params.frame_rate) payload.frame_rate = params.frame_rate;
  if (params.image) payload.image = params.image;

  const response = await fetch(`${env.AGNES_BASE_URL}/videos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.AGNES_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Video generation failed: HTTP ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const taskId = data.id || data.task_id;
  if (!taskId) {
    throw new Error('Video generation returned no task ID');
  }

  logger.log(`[video] task created: ${taskId}`);
  return { taskId, status: data.status || 'pending' };
}

// ─── Video Status Polling ──────────────────────────────────────────

export async function getVideoStatus(
  taskId: string,
  contextEnv?: Record<string, string | undefined>,
): Promise<VideoGenResult> {
  const env = getEnv(contextEnv);

  const response = await fetch(`${env.AGNES_BASE_URL}/videos/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${env.AGNES_API_KEY}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Video status check failed: HTTP ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const status = data.status;

  // Video URL may be in different fields
  const url = data.video_url || data.remixed_from_video_id || data.url ||
    (data.data && data.data[0]?.url);

  return {
    taskId,
    status,
    url: status === 'completed' || status === 'succeeded' ? url : undefined,
  };
}

// ─── SSE Stream for Video Polling ──────────────────────────────────

export function createVideoStatusStream(
  taskId: string,
  contextEnv?: Record<string, string | undefined>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let completed = false;
      let attempts = 0;
      const maxAttempts = 120; // ~10 minutes at 5s interval

      function send(event: string, data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }

      try {
        while (!completed && attempts < maxAttempts) {
          attempts++;
          const result = await getVideoStatus(taskId, contextEnv);

          send('status', { taskId, status: result.status, attempts });

          if (result.status === 'completed' || result.status === 'succeeded') {
            completed = true;
            send('complete', { taskId, url: result.url });
            break;
          }

          if (result.status === 'failed' || result.status === 'cancelled') {
            send('error', { taskId, status: result.status, message: 'Video generation failed' });
            break;
          }

          // Wait 5 seconds before next poll
          await new Promise(r => setTimeout(r, 5000));
        }

        if (!completed && attempts >= maxAttempts) {
          send('error', { taskId, message: 'Video generation timed out' });
        }
      } catch (e) {
        const error = e as Error;
        logger.error(`[video-stream] error: ${error.message}`);
        send('error', { taskId, message: error.message });
      } finally {
        send('done', { taskId, completed });
        controller.close();
      }
    },
  });
}
