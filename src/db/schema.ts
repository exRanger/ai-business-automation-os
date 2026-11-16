import { integer, jsonb, pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';

export const records = pgTable('records', {
  id: text('id').primaryKey(),
  module: text('module').notNull(),
  status: text('status').notNull().default('new'),
  title: text('title').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
  score: integer('score').notNull().default(0),
  nextActionAt: timestamp('next_action_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  moduleIdx: index('records_module_idx').on(table.module),
  statusIdx: index('records_status_idx').on(table.status)
}));

export const events = pgTable('events', {
  id: text('id').primaryKey(),
  recordId: text('record_id').references(() => records.id),
  type: text('type').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export type AutomationRow = typeof records.$inferSelect;
