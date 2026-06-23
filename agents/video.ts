/**
 * Video Generation Agent — POST /video
 *
 * Generates videos using Agnes Video V2.0 API.
 * Step 1: POST /video → returns taskId
 * Step 2: GET /video?taskId=xxx → polls for completion
 * Or use SSE stream for real-time status updates.
 */

import { generateVideo, getVideoStatus, createVideoStatusStream } from './_multimodal';
import { createLogger } from './_logger';

const logger = createLogger('video-agent');

export async function onRequest(context: any) {
  const { request, env } = context;
  const body = request?.body ?? {};
  const action = body.action || 'create';

  const ctxEnv = env ?? process.env ?? {};

  try {
    // ── Create video task ──
    if (action === 'create') {
      const { prompt, width, height, num_frames, frame_rate, image, model } = body;
      if (!prompt || typeof prompt !== 'string') {
        return new Response(
          JSON.stringify({ error: "'prompt' is required" }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      logger.log(`[video] create prompt="${prompt.slice(0, 50)}..."`);
      const result = await generateVideo({
        prompt,
        width,
        height,
        num_frames,
        frame_rate,
        image,
        model,
      }, ctxEnv);

      return new Response(JSON.stringify({
        success: true,
        taskId: result.taskId,
        status: result.status,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ── Check video status ──
    if (action === 'status') {
      const { taskId } = body;
      if (!taskId) {
        return new Response(
          JSON.stringify({ error: "'taskId' is required" }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const result = await getVideoStatus(taskId, ctxEnv);
      return new Response(JSON.stringify({
        success: true,
        taskId: result.taskId,
        status: result.status,
        url: result.url,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' } },
      );
    }

    // ── SSE stream for video status ──
    if (action === 'stream') {
      const { taskId } = body;
      if (!taskId) {
        return new Response(
          JSON.stringify({ error: "'taskId' is required" }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const stream = createVideoStatusStream(taskId, ctxEnv);
      return new Response(stream, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use 'create', 'status', or 'stream'" }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    const error = e as Error;
    logger.error(`[video] error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
