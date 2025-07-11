import type { Env } from '../types';
import { cors } from '../lib/cors';
import { createEmbedding } from '../lib/openai';

export async function handleEmbeddingGeneration(request: Request, env: Env): Promise<Response> {
	let input: string | undefined;
	try {
		const body = await request.json();
		console.log(`Starting to handle ${request.url}`, { body });
		if (!body || typeof body !== 'object' || !('input' in body) || typeof body.input !== 'string') {
			return new Response(JSON.stringify({ error: 'Request body must contain an "input" field with a string value' }), {
				status: 400,
				headers: cors,
			});
		}
		input = body.input;
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid or missing JSON in request body' }), { status: 400, headers: cors });
	}

	try {
		console.log(`Creating embedding for ${input}`, { env });
		const embedding = await createEmbedding(input, env);
		return new Response(
			JSON.stringify({
				input,
				embedding,
				dimensions: embedding.length,
			}),
			{ headers: cors }
		);
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
	}
}
