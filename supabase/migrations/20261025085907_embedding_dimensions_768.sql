-- Match the 768-dimensional Gemini requests in ingestion and chat.
-- Never coerce, pad, truncate or discard previously stored vectors.
begin;

lock table public.documents in access exclusive mode;

do $$
begin
  if exists (
    select 1 from public.documents
    where embedding is not null and vector_dims(embedding) <> 768
  ) then
    raise exception 'Cannot migrate documents.embedding to 768: incompatible stored vectors exist'
      using hint = 'Back up the corpus and plan an explicit re-embedding migration before retrying. No rows were changed.';
  end if;
end;
$$;

drop index if exists public.documents_embedding_idx;
alter table public.documents alter column embedding type vector(768)
  using embedding::vector(768);

create index documents_embedding_idx
  on public.documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function public.match_documents(
  query_embedding vector(768),
  match_threshold float default 0.45,
  match_count int default 5
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select d.id, d.content, d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

commit;
