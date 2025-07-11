import type { Env } from './types';
import { handleOptions, handleMethodNotAllowed, cors } from './lib/cors';
import { handleChatCompletion } from './handlers/chat';
import { handlePodcastEmbeddings } from './handlers/podcasts';
import { handlePodcastSearch } from './handlers/search';
import { handleEmbeddingGeneration } from './handlers/embeddings';
import { handleBeginInsightsEmbeddings, handleSearchInsights } from './handlers/professional_insights';

export async function handleRequest(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);

	// Handle preflight requests
	if (request.method === 'OPTIONS') {
		return handleOptions();
	}

	console.log(`Starting to handle ${url.pathname}`, { env });
	// Route handling
	switch (url.pathname) {
		case '/api/chat':
			if (request.method !== 'POST') {
				return handleMethodNotAllowed(request.method);
			}
			return handleChatCompletion(request, env);

		case '/api/podcasts':
			if (request.method !== 'POST') {
				return handleMethodNotAllowed(request.method);
			}
			return handlePodcastEmbeddings(request, env);

		case '/api/podcasts/search':
			if (request.method !== 'GET') {
				return handleMethodNotAllowed(request.method);
			}
			return handlePodcastSearch(request, env);

		case '/api/embeddings':
			if (request.method !== 'POST') {
				return handleMethodNotAllowed(request.method);
			}
			return handleEmbeddingGeneration(request, env);
		
		case `/api/begin-insights-embeddings`:
			if (request.method !== 'POST') {
				return handleMethodNotAllowed(request.method);
			}
			return handleBeginInsightsEmbeddings(request, env);

		case `/api/professional-insights/search`:
			if (request.method !== 'GET') {
				return handleMethodNotAllowed(request.method);
			}
			return handleSearchInsights(request, env);

		default:
			return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: cors });
	}
} 