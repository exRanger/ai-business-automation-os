import { z } from 'zod';
import { generateText } from '@/lib/llm';

export const runtime = 'nodejs';

const schema = z.object({ kind: z.enum(['proposal', 'content', 'digest']), context: z.record(z.unknown()).default({}) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: 'Invalid payload' }, { status: 400 });
  const text = await generateText(parsed.data.kind, parsed.data.context);
  return Response.json({ ok: true, text });
}
