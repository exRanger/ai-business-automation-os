import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/client';
import { events, records } from '@/db/schema';
import { getRecord } from '@/db/queries';
import { hasDb } from '@/env';
import { generateText } from '@/lib/llm';
import { syncRecordBestEffort } from '@/lib/google';
import { sendTelegram } from '@/lib/telegram';
import { moduleDef } from '@/lib/modules';
import type { RecordStatus } from '@/lib/types';

export const runtime = 'nodejs';

const schema = z.object({
  recordId: z.string().min(1),
  actionId: z.string().min(1),
  payloadPatch: z.record(z.unknown()).optional()
});

function nextStatus(module: string, actionId: string): RecordStatus {
  return moduleDef(module).actions.find((action) => action.id === actionId)?.nextStatus ?? 'done';
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: 'Invalid payload' }, { status: 400 });
  const { recordId, actionId, payloadPatch } = parsed.data;

  if (!hasDb || !db) {
    return Response.json({ ok: true, demo: true, recordId, actionId, note: 'Demo mode: apply this in local UI state. Connect DATABASE_URL for persistence.' });
  }

  const current = await getRecord(recordId);
  if (!current) return Response.json({ error: 'Record not found' }, { status: 404 });
  const status = nextStatus(current.module, actionId);
  let payload = { ...current.payload, ...(payloadPatch ?? {}) };

  if (actionId === 'generate') {
    const artifact = await generateText(current.module === 'proposals' ? 'proposal' : current.module === 'content' ? 'content' : 'digest', { record: current, payloadPatch });
    payload = { ...payload, artifact };
  }

  const nextActionAt = status === 'snoozed' ? new Date(Date.now() + 48 * 3600 * 1000) : status === 'approved' || status === 'scheduled' ? new Date(Date.now() + 24 * 3600 * 1000) : null;
  await db.update(records).set({ status, payload, nextActionAt, updatedAt: new Date() }).where(eq(records.id, recordId));
  await db.insert(events).values({ id: `E-${Date.now().toString(36)}`, recordId, type: `action_${actionId}`, payload: { status } });

  const updated = await getRecord(recordId);
  if (updated && (status === 'approved' || status === 'scheduled')) {
    try { await syncRecordBestEffort(updated); } catch { /* optional integrations */ }
    await sendTelegram(`Action ${actionId}\n${updated.id}\n${updated.title}\nStatus: ${updated.status}`);
  }
  return Response.json({ ok: true, record: updated });
}
