import { OpenAI } from 'openai';
import type { CreateDocument, Env } from '../types';
import { insertDocument } from '../lib/supabase';
import { cors } from '../lib/cors';

export async function handlePodcastEmbeddings(request: Request, env: Env): Promise<Response> {
	let contents: string[] | undefined;
	try {
		const body = await request.json();
		if (!body || typeof body !== 'object' || !('contents' in body)) {
			return new Response(
				JSON.stringify({ error: 'Missing "contents" field in request body' }),
				{ status: 400, headers: cors }
			);
		}
		contents = body.contents as string[];

	} catch {
		return new Response(
			JSON.stringify({ error: 'Invalid or missing JSON in request body' }),
			{ status: 400, headers: cors }
		);
	}

	if (!Array.isArray(contents) || contents.length === 0) {
		return new Response(
			JSON.stringify({ error: 'Request body must contain a non-empty array of strings in the "contents" field' }),
			{ status: 400, headers: cors }
		);
	}

	const openai = new OpenAI({
		apiKey: env.OPENAI_API_KEY,
		baseURL: 'https://gateway.ai.cloudflare.com/v1/0c3eee58953174451139be1ea94076a8/stock-predictions/openai',
	});

	try {
		const results = await Promise.all(
			contents.map(async (content) => {
				const embeddingResponse = await openai.embeddings.create({
					model: 'text-embedding-3-small',
					input: content,
					encoding_format: 'float',
				});

				return {
					content,
					embedding: embeddingResponse.data[0].embedding,
				} satisfies CreateDocument;
			})
		);
        await insertDocument(results, env);

		return new Response(null, { status: 201, headers: cors });
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
	}
} 