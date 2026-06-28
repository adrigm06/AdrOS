-- ============================================================
-- RAG Chatbot — AdrOS Portfolio
-- Migration: pgvector + documents + chat_logs
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Documents table (RAG corpus)
create table if not exists documents (
  id          bigserial   primary key,
  content     text        not null,
  metadata    jsonb       not null default '{}',
  embedding   vector(384),          -- all-MiniLM-L6-v2 dimensions
  source      text        not null, -- 'mdx' | 'pdf' | 'profile'
  created_at  timestamptz default now()
);

-- 3. IVFFlat index for fast cosine similarity search
--    (run AFTER ingesting data: CREATE INDEX needs rows to tune lists)
create index if not exists documents_embedding_idx
  on documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 4. Semantic search function
create or replace function match_documents(
  query_embedding  vector(384),
  match_threshold  float default 0.45,
  match_count      int   default 5
)
returns table (
  id         bigint,
  content    text,
  metadata   jsonb,
  similarity float
)
language sql stable
as $$
  select
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from documents d
  where 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
$$;

-- 5. Chat logs table (anonymous usage analytics)
create table if not exists chat_logs (
  id          bigserial   primary key,
  question    text        not null,
  answer      text        not null,
  lang        text,
  sources     jsonb,
  created_at  timestamptz default now()
);

-- 6. RLS: documents are public read, insert only via service_role
alter table documents  enable row level security;
alter table chat_logs  enable row level security;

create policy "documents_read_public"
  on documents for select
  using (true);

create policy "chat_logs_insert_service"
  on chat_logs for insert
  with check (true);

create policy "chat_logs_read_service"
  on chat_logs for select
  using (true);
