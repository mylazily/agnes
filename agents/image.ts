/**
 * Image Generation Agent — POST /image
 *
 * Generates images using Agnes Image 2.1 Flash API.
 * Returns JSON with the generated image URL.
 */

import { generateImage, editImage } from './_multimodal';
import { createLogger } from './_logger';

const logger = createLogger('image-agent');

export async function onRequest(context: any) {
  const { request, env } = context;
  const body = request?.body ?? {};
  const action = body.action || 'generate';

  const ctxEnv = env ?? process.env ?? {};

  try {
    if (action === 'generate') {
      const { prompt, size, model } = body;
      if (!prompt || typeof prompt !== 'string') {
        return new Response(
          JSON.stringify({ error: "'prompt' is required" }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      logger.log(`[image] generate prompt="${prompt.slice(0, 50)}..."`);
      const result = await generateImage({ prompt, size, model }, ctxEnv);

      return new Response(JSON.stringify({
        success: true,
        url: result.url,
        revised_prompt: result.revised_prompt,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'edit') {
      const { image, prompt, size, model } = body;
      if (!image || !prompt) {
        return new Response(
          JSON.stringify({ error: "'image' and 'prompt' are required" }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      logger.log(`[image] edit prompt="${prompt.slice(0, 50)}..."`);
      const result = await editImage({ image, prompt, size, model }, ctxEnv);

      return new Response(JSON.stringify({
        success: true,
        url: result.url,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use 'generate' or 'edit'" }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    const error = e as Error;
    logger.error(`[image] error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
