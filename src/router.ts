import type { Env } from './types';
import { handleOptions, handleMethodNotAllowed, cors } from './lib/cors';
import { handleChatCompletion } from './handlers/chat';
import { handlePodcastEmbeddings } from './handlers/podcasts';

export async function handleRequest(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);

	// Handle preflight requests
	if (request.method === 'OPTIONS') {
		return handleOptions();
	}

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

		default:
			return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: cors });
	}
} 