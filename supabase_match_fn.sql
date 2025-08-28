-- Paste this in Supabase SQL editor to create the RPC used above

create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id uuid,
  source text,
  page int,
  chunk text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select d.id, d.source, d.page, d.chunk, 1 - (d.embedding <=> query_embedding) as similarity
  from docs d
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;
