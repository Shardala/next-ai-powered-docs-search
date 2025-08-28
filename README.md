# AI Powered Documents Search (RAG)

![AI powered docs search logo](https://github.com/Shardala/next-ai-powered-docs-search/blob/main/assets/aidocsimg.png "AI powered docs search logo")

# Features:

- Upload a PDF/Markdown knowledge base
- Search using natural language queries
- AI answers with citations from your data

# Information
- Retrieval-Augmented Generation (RAG) is an AI framework that uses external data sources to enhance a large language model's (LLM) responses.

<br />

- This starter ingests PDFs/MD/TXT, embeds chunks into Supabase (pgvector), and answers questions with RAG.
1) Create a Supabase project and enable `vector` extension.
2) Run the SQL in `supabase_match_fn.sql` to create the `match_documents` RPC and create the `docs` table (see comments in `lib/vector-db.ts`).
3) Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, and `SUPABASE_ANON_KEY` in `.env.local`.

# Install and usage
```bash
clone git repository

npm i
npm run dev
```

Create `.env.local` based on `.env.example`.

# Technologies
- Next.js
- LangChain.js
- vector DB (Supabase)
