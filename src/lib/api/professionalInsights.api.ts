import { Env } from '../../types';
import { createSupabaseClient } from '../supabase';

export interface ProfessionalInsightBase {
    content: string;
    embedding: number[];
}

export interface ProfessionalInsight extends ProfessionalInsightBase {
    id: string;
}

export interface CreateProfessionalInsight extends ProfessionalInsightBase {}

export interface InsertProfessionalInsightsParams {
    insights: CreateProfessionalInsight[];
}

export interface InsertProfessionalInsightsResult {
    success: boolean;
}

export interface SearchInsightsOptions {
    matchThreshold?: number;
    matchCount?: number;
}

export interface ProfessionalInsightSearchResult extends ProfessionalInsightBase {
    id: string;
    similarity: number;
}

export type ProfessionalInsightSearchResults = ProfessionalInsightSearchResult[];

/**
 * Inserts one or more professional insights into the professional_insights table.
 * @param params.insights - Array of insights to insert.
 * @param env - The environment containing Supabase credentials.
 * @throws Error if insertion fails.
 */
export async function insertProfessionalInsights(
    params: InsertProfessionalInsightsParams,
    env: Env
): Promise<InsertProfessionalInsightsResult> {
    if (!Array.isArray(params.insights) || params.insights.length === 0) {
        throw new Error('insights must be a non-empty array');
    }

    const supabase = createSupabaseClient(env);

    const { error } = await supabase
        .from('professional_insights')
        .insert(params.insights);

    if (error) {
        throw new Error(`Failed to insert professional insights: ${error.message}`);
    }

    return { success: true };
}

/**
 * Searches professional insights using the match_insights function in Supabase.
 * @param queryEmbedding - The embedding vector to search with.
 * @param options - Optional search parameters.
 * @param env - The environment containing Supabase credentials.
 * @returns Array of matching professional insights with similarity scores.
 * @throws Error if the search fails.
 */
export async function searchProfessionalInsights(
    queryEmbedding: number[],
    options: SearchInsightsOptions = {},
    env: Env
): Promise<ProfessionalInsightSearchResults> {
    if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
        throw new Error('queryEmbedding must be a non-empty array of numbers');
    }

    const DEFAULT_OPTIONS: Required<SearchInsightsOptions> = {
        matchThreshold: 0.7,
        matchCount: 10,
    };

    const { matchThreshold, matchCount } = { ...DEFAULT_OPTIONS, ...options };
    const supabase = createSupabaseClient(env);

    const { data, error } = await supabase
        .rpc('match_insights', {
            query_embedding: queryEmbedding,
            match_threshold: matchThreshold,
            match_count: matchCount,
        })
        .select('*');

    if (error) {
        throw new Error(`Failed to search professional insights: ${error.message}`);
    }

    return (data ?? []) as ProfessionalInsightSearchResults;
}