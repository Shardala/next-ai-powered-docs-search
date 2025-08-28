import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE!;

export const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

export async function upsertChunks(rows: {source:string, page:number, chunk:string, embedding:number[]}[]) {
  const { error } = await supabase.from('docs').upsert(rows);
  if (error) throw error;
}

export async function searchSimilar(queryEmbedding: number[], limit=5) {
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: limit
  });
  if (error) throw error;
  return data;
}
