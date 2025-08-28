import { NextRequest, NextResponse } from "next/server";
import { embedTexts } from "lib/embeddings";
import { upsertChunks } from "lib/vector-db";
import pdf from "pdf-parse";

export const runtime = 'nodejs';

function chunkText(text:string, size=800, overlap=150) {
  const chunks:string[] = [];
  let i = 0;

  while (i < text.length) {
    const end = Math.min(text.length, i + size);
    chunks.push(text.slice(i, end));

    i = end - overlap;

    if (i < 0) i = 0;
  }

  return chunks;
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);

  let text = '';
  let source = file.name;
  let pages = 1;

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const parsed = await pdf(bytes);
    text = parsed.text;
    pages = parsed.numpages || 1;
  } else {
    text = bytes.toString('utf-8');
  }

  const chunks = chunkText(text);
  const embeddings = await embedTexts(chunks);
  const rows = chunks.map((chunk, i) => ({
    source,
    page: Math.floor((i / chunks.length) * pages) + 1,
    chunk,
    embedding: embeddings[i]
  }));

  await upsertChunks(rows);

  return NextResponse.json({ message: `Embedded ${rows.length} chunks from ${source}` });
}
