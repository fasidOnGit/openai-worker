import { handleRequest } from './router';
import { Env } from './types';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return handleRequest(request, env);
	},
} satisfies ExportedHandler<Env>;
