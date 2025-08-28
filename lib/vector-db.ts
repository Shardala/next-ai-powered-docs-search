import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE!;
export const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

// SQL you need to run once in Supabase (SQL editor):
// create extension if not exists vector;
// create table if not exists docs (
//   id uuid primary key default gen_random_uuid(),
//   source text,
//   page int,
//   chunk text,
//   embedding vector(1536)
// );
// create index on docs using ivfflat (embedding vector_cosine_ops) with (lists = 100);

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
