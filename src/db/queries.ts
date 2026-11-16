import { desc, eq } from 'drizzle-orm';
import { db } from './client';
import { records } from './schema';
import type { AutomationRecord, ModuleKey, RecordStatus } from '@/lib/types';
import { demoRecords } from '@/lib/demo';
import { hasDb } from '@/env';

function map(row: typeof records.$inferSelect): AutomationRecord {
  return {
    id: row.id,
    module: row.module as ModuleKey,
    status: row.status as RecordStatus,
    title: row.title,
    payload: row.payload ?? {},
    score: row.score ?? 0,
    nextActionAt: row.nextActionAt ? row.nextActionAt.toISOString() : null,
    createdAt: row.createdAt.toISOString()
  };
}

export async function listRecords(module?: ModuleKey): Promise<AutomationRecord[]> {
  if (!hasDb || !db) return module ? demoRecords.filter((item) => item.module === module) : demoRecords;
  const rows = module
    ? await db.select().from(records).where(eq(records.module, module)).orderBy(desc(records.createdAt)).limit(100)
    : await db.select().from(records).orderBy(desc(records.createdAt)).limit(100);
  return rows.map(map);
}

export async function getRecord(id: string): Promise<AutomationRecord | null> {
  if (!hasDb || !db) return demoRecords.find((item) => item.id === id) ?? null;
  const rows = await db.select().from(records).where(eq(records.id, id)).limit(1);
  return rows[0] ? map(rows[0]) : null;
}

export async function stats() {
  const all = await listRecords();
  const byModule: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let overdue = 0;
  for (const item of all) {
    byModule[item.module] = (byModule[item.module] ?? 0) + 1;
    byStatus[item.status] = (byStatus[item.status] ?? 0) + 1;
    if (item.nextActionAt && new Date(item.nextActionAt).getTime() < Date.now() && !['done', 'lost', 'paid'].includes(item.status)) overdue++;
  }
  return { total: all.length, byModule, byStatus, overdue };
}
