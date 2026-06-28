# AdrOS — Supabase Edge Functions

## Setup

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref mqsdjjuvuksmawlecamo
   ```

2. Set secrets (run once):
   ```bash
   supabase secrets set GROQ_API_KEY=gsk_...
   supabase secrets set HF_API_KEY=hf_...
   ```

3. Deploy the chat function:
   ```bash
   supabase functions deploy chat
   ```

4. Test locally (requires .env with service_role key):
   ```bash
   supabase functions serve --env-file .env
   # POST http://localhost:54321/functions/v1/chat
   ```

## Function: chat

**Endpoint:** `POST /functions/v1/chat`

**Headers:**
```
Authorization: Bearer <PUBLIC_SUPABASE_ANON_KEY>
Content-Type: application/json
```

**Body:**
```json
{
  "message": "Háblame de AndroBox",
  "history": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "¡Hola! ..." }
  ]
}
```

**Response:**
```json
{
  "answer": "AndroBox es una herramienta...",
  "sources": [...],
  "lang": "es"
}
```
