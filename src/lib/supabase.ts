import { createClient } from '@supabase/supabase-js';
import type { Env, CreateDocument } from '../types';

export function createSupabaseClient(env: Env) {
	return createClient<{
		documents: Document;
	}>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

export async function insertDocument(documents: CreateDocument[], env: Env) {
	const supabase = createSupabaseClient(env);

	const { error } = await supabase
		.from('documents')
		.insert(documents);

	if (error) {
		throw new Error(`Failed to insert document: ${error.message}`);
	}
} 