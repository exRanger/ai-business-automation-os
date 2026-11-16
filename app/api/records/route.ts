import { z } from 'zod';
import { listRecords } from '@/db/queries';
import { createRecord } from '@/lib/intake';
import { scoreInbound } from '@/lib/llm';
import type { ModuleKey } from '@/lib/types';

export const runtime = 'nodejs';

const createSchema = z.object({
  module: z.enum(['leads', 'content', 'proposals', 'invoices', 'bookings', 'digest']).default('leads'),
  title: z.string().min(2),
  text: z.string().min(3).optional(),
  payload: z.record(z.unknown()).optional()
});

export async function GET(req: Request) {
  const module = new URL(req.url).searchParams.get('module') as ModuleKey | null;
  const records = await listRecords(module ?? undefined);
  return Response.json({ records });
}

export async function POST(req: Request) {
  const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 });
  const text = parsed.data.text ?? parsed.data.title;
  const result = await createRecord({
    module: parsed.data.module,
    title: parsed.data.title,
    payload: { ...(parsed.data.payload ?? {}), inbound_untrusted: text.slice(0, 2000) },
    score: scoreInbound(text),
    nextActionAt: parsed.data.module === 'leads' ? new Date(Date.now() + 24 * 3600 * 1000) : null
  });
  return Response.json(result, { status: result.persisted ? 201 : 200 });
}
