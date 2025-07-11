import type { CreateDocument, Env } from '../types';
import { insertDocument } from '../lib/supabase';
import { cors } from '../lib/cors';
import { createEmbedding } from '../lib/openai';

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

	try {
		const results = await Promise.all(
			contents.map(async (content): Promise<CreateDocument> => {
				const embedding = await createEmbedding(content, env);
				return { content, embedding };
			})
		);

		await insertDocument(results, env);
		return new Response(null, { status: 201, headers: cors });
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
	}
} 