import type { ModuleDef } from './types';

export const modules: ModuleDef[] = [
  {
    key: 'leads',
    title: 'Lead Inbox',
    automationCase: 'Входящая заявка превращается в карточку со score, summary, draft reply и follow-up.',
    flow: 'Telegram/web intake → LLM triage → human approve → follow-up → CRM sync.',
    apis: ['Telegram Bot API', 'OpenAI/Anthropic', 'Google Sheets'],
    guardrail: 'Нет auto-send: ответ уходит только после approve.',
    actions: [
      { id: 'approve', label: 'Approve draft', nextStatus: 'approved' },
      { id: 'snooze', label: 'Snooze 48h', nextStatus: 'snoozed' },
      { id: 'lose', label: 'Mark lost', nextStatus: 'lost', dangerous: true }
    ]
  },
  {
    key: 'content',
    title: 'Content Pipeline',
    automationCase: 'Тема превращается в 3 варианта поста, проходит approve и попадает в очередь публикации.',
    flow: 'Topic → generate variants → choose/edit → approve → schedule export.',
    apis: ['OpenAI/Anthropic', 'Telegram digest'],
    guardrail: 'Нет авто-постинга в Threads/Meta: только export/schedule payload.',
    actions: [
      { id: 'approve', label: 'Approve variant', nextStatus: 'approved' },
      { id: 'schedule', label: 'Schedule', nextStatus: 'scheduled' },
      { id: 'lose', label: 'Kill topic', nextStatus: 'lost', dangerous: true }
    ]
  },
  {
    key: 'proposals',
    title: 'Proposal Generator',
    automationCase: 'Из лида собирается one-page offer: scope, сроки, цена вилка, риски, следующий шаг.',
    flow: 'Lead context → generate proposal → edit → approve → export markdown.',
    apis: ['OpenAI/Anthropic', 'Google Drive/Sheets optional'],
    guardrail: 'Цена и сроки не выдумываются молча: поля помечаются как estimate.',
    actions: [
      { id: 'generate', label: 'Generate', nextStatus: 'triaged' },
      { id: 'approve', label: 'Approve', nextStatus: 'approved' },
      { id: 'done', label: 'Sent', nextStatus: 'done' }
    ]
  },
  {
    key: 'invoices',
    title: 'Invoice Chaser',
    automationCase: 'Счёт получает due date, статус и автоматическое напоминание, когда просрочен.',
    flow: 'Invoice draft → sent → due date watcher → overdue reminder → paid.',
    apis: ['Telegram digest', 'Google Sheets'],
    guardrail: 'Нет юридических угроз в тексте: напоминание вежливое и фактологичное.',
    actions: [
      { id: 'approve', label: 'Mark sent', nextStatus: 'approved' },
      { id: 'paid', label: 'Mark paid', nextStatus: 'paid' },
      { id: 'overdue', label: 'Flag overdue', nextStatus: 'overdue', dangerous: true }
    ]
  },
  {
    key: 'bookings',
    title: 'Booking Ops',
    automationCase: 'Запрос на созвон превращается в слот, conflict check и подтверждение.',
    flow: 'Request → propose slot → approve → Calendar event → reminder.',
    apis: ['Google Calendar', 'Telegram Bot API'],
    guardrail: 'Без OAuth-кашмара: service account создаёт событие только в явно указанном календаре.',
    actions: [
      { id: 'approve', label: 'Confirm slot', nextStatus: 'approved' },
      { id: 'schedule', label: 'Create event', nextStatus: 'scheduled' },
      { id: 'done', label: 'Held', nextStatus: 'done' }
    ]
  },
  {
    key: 'digest',
    title: 'Ops Digest',
    automationCase: 'Вечером собирается сводка по всем модулям: горячие лиды, просрочки, деньги, завтрашние действия.',
    flow: 'All modules → aggregate → rank by risk → Telegram digest.',
    apis: ['Telegram Bot API', 'Postgres/Drizzle'],
    guardrail: 'Digest не шлётся наружу без CRON_SECRET и Telegram env.',
    actions: [
      { id: 'generate', label: 'Build digest', nextStatus: 'triaged' },
      { id: 'approve', label: 'Send digest', nextStatus: 'done' }
    ]
  }
];

export function moduleDef(key: string): ModuleDef {
  return modules.find((item) => item.key === key) ?? modules[0];
}
