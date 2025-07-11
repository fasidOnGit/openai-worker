import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { cors } from '../lib/cors';
import { createChatCompletion, createEmbedding } from '../lib/openai';
import type { Env } from '../types';
import { insertProfessionalInsights, searchProfessionalInsights } from '../lib/api/professionalInsights.api';

export async function handleBeginInsightsEmbeddings(request: Request, env: Env): Promise<Response> {
	let body: { input: string } | undefined;
	try {
		body = await request.json();
        console.log(`Starting to handle ${request.url}`, {body});
	} catch {
		return new Response(
			JSON.stringify({ error: 'Invalid or missing JSON in request body' }),
			{ status: 400, headers: cors }
		);
	}

	if (!body || typeof body !== 'object' || !('input' in body) || typeof body.input !== 'string') {
		return new Response(
			JSON.stringify({ error: 'Request body must contain an "input" field with a string value' }),
			{ status: 400, headers: cors }
		);
	}

	try {
        const content = await import(`../assets/${body.input}.txt`).then(res => res.default);

		const splitter = new RecursiveCharacterTextSplitter({
			chunkSize: 150,
			chunkOverlap: 15,
		});

		const docs = await splitter.splitText(content);
		let success = true;

        console.log(`Splitting ${body.input} into ${docs.length} chunks`);

		for (const doc of docs) {
			try {
                console.log(`Creating embedding for ${doc}`);
				const embedding = await createEmbedding(doc, env);
				const result = await insertProfessionalInsights(
					{ insights: [{ content: doc, embedding }] },
					env
				);
				if (!result.success) {
                    console.log(`Failed to insert ${doc}`);
					success = false;
					break;
				}
			} catch (error) {
                console.error(`Error creating embedding for ${doc}`, error);
				success = false;
				break;
			}
		}

		return new Response(JSON.stringify({ success }), { headers: cors });
	} catch (error: any) {
		console.error(error);
		return new Response(
			JSON.stringify({ error: error?.message ?? 'Internal server error' }),
			{ status: 500, headers: cors }
		);
	}
}

export async function handleSearchInsights(request: Request, env: Env): Promise<Response> {
    let query: string | undefined;
    try {
        const url = new URL(request.url);
        query = url.searchParams.get('query') ?? undefined;
        console.log(`Starting to handle ${request.url}`, {query});
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid or missing JSON in request body' }), { status: 400, headers: cors });
    }

    if (!query || typeof query !== 'string') {
        return new Response(JSON.stringify({ error: 'Request body must contain a "query" field with a string value' }), { status: 400, headers: cors });
    }

    const embedding = await createEmbedding(query, env);
    const matchedChunks = await searchProfessionalInsights(embedding, { matchCount: 10, matchThreshold: 0.3 }, env);

    
		const results = await createChatCompletion(
			[
				{
					role: 'system',
					content: `You are an assistant to a software engineer who is constantly asked to tell talk about their experience. You will be given two pieces of information - some context about podcasts episodes and a question. Your main job is to formulate a short answer to the question from their careeer experience using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`,
				},
				{
					role: 'user',
					content: `Context: ${matchedChunks.map((doc) => doc.content).join('\n')}
                    Question: ${query}`,
				},
			],  
			env
		);
    return new Response(JSON.stringify({ results }), { headers: cors });
}