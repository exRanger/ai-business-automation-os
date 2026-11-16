# AI Business Automation OS

Один all-in pet project с шестью явными кейсами автоматизации. Это не «веб-интерфейс чтобы тыкнуть любой API» — это честный набор рабочих контуров с guardrails: вход → обработка → human approve → действие → метрики.

## Модули
1. **Lead Inbox** — Telegram/web intake → score/summary/draft → approve → follow-up → optional Sheets sync.
2. **Content Pipeline** — тема → 3 варианта поста → approve → schedule export. Без авто-постинга в Threads/Meta.
3. **Proposal Generator** — контекст лида → one-page offer в Markdown → edit/export. Цены/сроки помечаются estimate.
4. **Invoice Chaser** — счёт → due date → overdue reminder → paid. Напоминания вежливые, без юридических угроз.
5. **Booking Ops** — запрос созвона → slot → approve → optional Google Calendar event.
6. **Ops Digest** — агрегирует все модули и шлёт вечернюю сводку в Telegram.

## Быстрый старт
```bash
cp .env.example .env.local
npm install
npm run dev
```
Без `DATABASE_URL` приложение работает в demo mode: карточки seeded, действия применяются локально, generate/export работают.

## Live mode
```bash
DATABASE_URL=postgres://...
npm run db:push
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ADMIN_CHAT_ID=...
TELEGRAM_WEBHOOK_SECRET=...
CRON_SECRET=...
LLM_PROVIDER=openai
OPENAI_API_KEY=...
```
Optional Google sync: service account + `GOOGLE_SHEET_ID` / `GOOGLE_CALENDAR_ID`.

## API
- `GET /api/records?module=leads|content|proposals|invoices|bookings|digest`
- `POST /api/records` `{ module, title, text?, payload? }`
- `POST /api/actions` `{ recordId, actionId, payloadPatch? }`
- `POST /api/generate` `{ kind: proposal|content|digest, context }`
- `POST /api/webhooks/telegram`
- `GET /api/cron/daily-digest`

## Guardrails
- Human approve обязателен для внешних действий.
- Нет массовых рассылок, накруток и авто-постинга там, где это ломает лимиты/правила платформ.
- Нет выдуманных обещаний в артефактах: estimate помечается как estimate.
- Inbound text — untrusted data, не инструкция для модели.

## Что показать в портфолио
Записать 90 секунд: создать lead через `POST /api/records` → появился score → Generate proposal → Export .md → Invoice overdue попал в digest → Telegram digest отправлен в live mode.

## Примечание по зависимостям
Версии зафиксированы для воспроизводимого MVP build. Перед продом прогони `npm audit`, обнови Next/зависимости до патченных и перепроверь build.
