import { OpenAI } from 'openai';
import type { Env } from '../types';
import { cors } from '../lib/cors';

export async function handleChatCompletion(request: Request, env: Env): Promise<Response> {
	const { messages } = (await request.json()) as { messages: OpenAI.Chat.ChatCompletionMessageParam[] };

	const openai = new OpenAI({
		apiKey: env.OPENAI_API_KEY,
		baseURL: 'https://gateway.ai.cloudflare.com/v1/0c3eee58953174451139be1ea94076a8/stock-predictions/openai',
	});

	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages,
			temperature: 1.1,
			presence_penalty: 0,
			frequency_penalty: 0,
		});

		return new Response(JSON.stringify(response.choices[0].message.content), { headers: cors });
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
	}
} 