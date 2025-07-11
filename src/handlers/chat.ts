import type { OpenAI } from 'openai';
import type { Env } from '../types';
import { cors } from '../lib/cors';
import { createChatCompletion } from '../lib/openai';

export async function handleChatCompletion(request: Request, env: Env): Promise<Response> {
	const { messages } = (await request.json()) as { messages: OpenAI.Chat.ChatCompletionMessageParam[] };

	try {
		const content = await createChatCompletion(messages, env);
		return new Response(JSON.stringify(content), { headers: cors });
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
	}
} 