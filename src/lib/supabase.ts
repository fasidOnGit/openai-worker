import { createClient } from '@supabase/supabase-js';
import type { CreateDocument, Document, DocumentSearchResults, Env, SearchOptions } from '../types';

const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {
	match_threshold: 0.7,
	match_count: 10,
};

export function createSupabaseClient(env: Env) {
	return createClient<{
		documents: Document;
	}>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

export async function insertDocument(documents: CreateDocument[], env: Env) {
	const supabase = createSupabaseClient(env);

	const { error } = await supabase.from('documents').insert(documents);

	if (error) {
		throw new Error(`Failed to insert documents: ${error.message}`);
	}
}

export async function searchDocuments(
	queryEmbedding: number[],
	options: SearchOptions = {},
	env: Env
): Promise<DocumentSearchResults> {
	const supabase = createSupabaseClient(env);
	const { match_threshold, match_count } = { ...DEFAULT_SEARCH_OPTIONS, ...options };

	const { data, error } = await supabase
		.rpc('match_documents', {
			query_embedding: queryEmbedding,
			match_threshold,
			match_count,
		})
		.select('*');

	if (error) {
		throw new Error(`Failed to search documents: ${error.message}`);
	}

	return data as DocumentSearchResults;
} 