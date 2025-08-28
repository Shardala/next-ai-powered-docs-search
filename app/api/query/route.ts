import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { embedTexts } from 'lib/embeddings';
import { supabase } from "lib/vector-db";
import { noQuestion, noResponse } from 'app/consts';

export const runtime = 'nodejs';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question) return NextResponse.json({ error: noQuestion }, { status: 400 });

    // Embed the question
    const [qEmbedding] = await embedTexts([question]);

    // similarity search via SQL (inline to avoid RPC requirement)
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: qEmbedding,
      match_count: 5
    });
    if (error) throw error;

    const context = (data || []).map((d:any, i:number) => `SOURCE ${i+1} (${d.source} p.{${'{'}d.page{'}'}}):\n${'${d.chunk}'}`).join("\n\n");

    const prompt = `You are a helpful assistant. Use the CONTEXT to answer the QUESTION. If unsure, say you don't know. Include brief citations like (S1) (S2) where appropriate.
CONTEXT:\n${'${context}'}
QUESTION: ${'${question}'}`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });
    const answer = completion.choices[0]?.message?.content ?? noResponse;

    const citations = (data || []).map((d:any) => ({
      source: d.source, page: d.page, snippet: d.chunk.slice(0, 200) + '...'
    }));

    return NextResponse.json({ answer, citations });
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
