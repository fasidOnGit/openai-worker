import type { Env } from '../types';
import { searchDocuments } from '../lib/supabase';
import { cors } from '../lib/cors';
import { createChatCompletion, createEmbedding } from '../lib/openai';

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
		const matchedDocuments = await searchDocuments(
			embedding,
			{
				...(matchThreshold && { match_threshold: parseFloat(matchThreshold) }),
				...(matchCount && { match_count: parseInt(matchCount, 10) }),
			},
			env
		);

        const results = await createChatCompletion([
            {
                role: 'system',
                content: `
                You are an enthusiastic podcast expert who loves recommending podcasts to people. You will be given two pieces of information - some context about podcasts episodes and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.
                `,
            },
            {
                role: 'user',
                content: `
                Here is the context about podcasts episodes:
                ${matchedDocuments.map((doc) => doc.content).join('\n')}

                Here is the question:
                ${query}
                `
            }
        ], env)

		return new Response(JSON.stringify({ response: results }), { headers: cors });
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
	}
} 