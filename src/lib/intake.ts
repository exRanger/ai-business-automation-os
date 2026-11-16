import { db } from '@/db/client';
import { events, records } from '@/db/schema';
import { sendTelegram } from './telegram';
import type { ModuleKey, RecordStatus } from './types';

function id(prefix = 'R') {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createRecord(input: { module: ModuleKey; title: string; payload?: Record<string, unknown>; score?: number; status?: RecordStatus; nextActionAt?: Date | null }) {
  const record = {
    id: id(input.module.slice(0, 1).toUpperCase()),
    module: input.module,
    status: input.status ?? 'new',
    title: input.title,
    payload: input.payload ?? {},
    score: input.score ?? 0,
    nextActionAt: input.nextActionAt ?? null
  };
  if (!db) return { persisted: false, record };
  await db.insert(records).values(record);
  await db.insert(events).values({ id: id('E'), recordId: record.id, type: 'record_created', payload: { module: record.module } });
  await sendTelegram(`Новая карточка ${record.id}\nМодуль: ${record.module}\nScore: ${record.score}\n${record.title}`);
  return { persisted: true, record };
}
