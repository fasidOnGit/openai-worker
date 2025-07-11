export interface Env {
	OPENAI_API_KEY: string;
	SUPABASE_URL: string;
	SUPABASE_ANON_KEY: string;
}

export interface CreateDocument {
	content: string;
	embedding: number[];
}

export interface Document extends CreateDocument {
	id: number;
	created_at: string;
}

export type Documents = Document[];