import { env } from '@/env';
import { stats } from '@/db/queries';
import { sendTelegram } from '@/lib/telegram';

export const runtime = 'nodejs';

function authorized(req: Request) {
  if (!env.cronSecret) return true;
  return req.headers.get('authorization') === `Bearer ${env.cronSecret}` || req.headers.get('x-cron-secret') === env.cronSecret;
}

export async function GET(req: Request) {
  if (!authorized(req)) return Response.json({ ok: false }, { status: 401 });
  const s = await stats();
  const text = `Ops digest\nВсего карточек: ${s.total}\nПросрочено: ${s.overdue}\nПо модулям: ${Object.entries(s.byModule).map(([k, v]) => `${k}:${v}`).join(' · ')}\nПо статусам: ${Object.entries(s.byStatus).map(([k, v]) => `${k}:${v}`).join(' · ')}`;
  const sent = await sendTelegram(text);
  return Response.json({ ok: true, sent, stats: s });
}
