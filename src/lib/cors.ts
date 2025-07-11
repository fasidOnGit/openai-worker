export const cors = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
} as const;

export function handleOptions(): Response {
	return new Response(null, { status: 200, headers: cors });
}

export function handleMethodNotAllowed(method: string): Response {
	return new Response(JSON.stringify({ error: `${method} is not allowed` }), { status: 405, headers: cors });
} 