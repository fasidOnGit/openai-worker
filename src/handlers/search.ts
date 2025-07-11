import type { Env } from '../types';
import { searchDocuments } from '../lib/supabase';
import { cors } from '../lib/cors';
import { createEmbedding } from '../lib/openai';

export async function handlePodcastSearch(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const query = url.searchParams.get('query');

	if (!query) {
		return new Response(
			JSON.stringify({ error: 'Missing required "query" parameter' }),
			{ status: 400, headers: cors }
		);
	}

	try {
		// Generate embedding for the search query
		const embedding = await createEmbedding(query, env);

		// Get optional search parameters
		const matchThreshold = url.searchParams.get('threshold');
		const matchCount = url.searchParams.get('limit');

		// Search documents using the query embedding
		const results = await searchDocuments(
			embedding,
			{
				...(matchThreshold && { match_threshold: parseFloat(matchThreshold) }),
				...(matchCount && { match_count: parseInt(matchCount, 10) }),
			},
			env
		);

		return new Response(JSON.stringify({ results }), { headers: cors });
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
	}
} 