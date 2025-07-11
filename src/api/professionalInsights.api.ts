import { createSupabaseClient } from "../lib/supabase";
import { Env } from "../types";

interface CreateProfessionalInsight {
    content: string;
    embedding: number[];
}

/**
 * Inserts one or more professional insights into the professional_insights table.
 * @param params.content - The content of the insight.
 * @param params.embedding - The embedding vector for the insight.
 * @param env - The environment containing Supabase credentials.
 * @throws Error if insertion fails.
 */
export async function insertProfessionalInsights(
    params: { insights: CreateProfessionalInsight[] },
    env: Env
): Promise<{ success: boolean }> {
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
