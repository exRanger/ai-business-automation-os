import type { AutomationRecord } from './types';

const now = Date.now();
const iso = (ms: number) => new Date(now + ms).toISOString();

export const demoRecords: AutomationRecord[] = [
  {
    id: 'R-lead-1', module: 'leads', status: 'new', score: 88,
    title: 'Анна — заявки теряются в личке',
    payload: { source: 'telegram', summary: 'Нужен бот для заявок + таблица, срок неделя.', draft: 'Привет! Вижу, что заявки разлетаются по личке. Давайте за неделю соберём intake → статусы → напоминания.' },
    nextActionAt: iso(24 * 3600 * 1000), createdAt: iso(-3600 * 1000)
  },
  {
    id: 'R-content-1', module: 'content', status: 'triaged', score: 74,
    title: 'Пост: почему AI-MVP умирает перед релизом',
    payload: { variants: ['Боль: демо есть, релиза нет.', 'Разбор 5 мест: auth, retries, logs, data loss, prompts.', 'CTA: напиши АУДИТ.'] },
    nextActionAt: iso(6 * 3600 * 1000), createdAt: iso(-2 * 3600 * 1000)
  },
  {
    id: 'R-proposal-1', module: 'proposals', status: 'new', score: 69,
    title: 'Offer: аудит потерянных заявок',
    payload: { leadId: 'R-lead-1', priceRange: '10–15k pilot', eta: '3–5 дней', risks: ['нет источников', 'статусы вручную', 'нет follow-up'] },
    nextActionAt: iso(12 * 3600 * 1000), createdAt: iso(-5 * 3600 * 1000)
  },
  {
    id: 'R-invoice-1', module: 'invoices', status: 'overdue', score: 91,
    title: 'Счёт #17 — пилот автоматизации',
    payload: { amount: '15000', currency: 'RUB', due: iso(-2 * 24 * 3600 * 1000), reminder: 'Добрый день! Напоминаю про счёт #17: пилот закрыт, доступы переданы. Подтвердите, пожалуйста, оплату или дату платежа.' },
    nextActionAt: iso(-4 * 3600 * 1000), createdAt: iso(-9 * 24 * 3600 * 1000)
  },
  {
    id: 'R-booking-1', module: 'bookings', status: 'new', score: 64,
    title: 'Созвон с Маратом — AI-MVP релиз',
    payload: { requested: 'завтра после 15:00', slot: iso(28 * 3600 * 1000), conflict: false },
    nextActionAt: iso(3 * 3600 * 1000), createdAt: iso(-90 * 60 * 1000)
  }
];
