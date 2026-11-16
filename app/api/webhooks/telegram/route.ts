import { createRecord } from '@/lib/intake';
import { scoreInbound } from '@/lib/llm';
import { verifyTelegramSecret } from '@/lib/telegram';

export const runtime = 'nodejs';

type TelegramMessage = { text?: string; chat?: { id?: number | string }; from?: { first_name?: string; last_name?: string; username?: string } };

export async function POST(req: Request) {
  if (!verifyTelegramSecret(req)) return Response.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const msg: TelegramMessage | undefined = body.message ?? body.edited_message;
  if (!msg?.text) return Response.json({ ok: true, ignored: true });
  const name = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || msg.from?.username || 'Telegram lead';
  await createRecord({
    module: 'leads',
    title: `${name}: ${msg.text.slice(0, 80)}`,
    payload: { source: 'telegram', chatId: String(msg.chat?.id ?? ''), inbound_untrusted: msg.text.slice(0, 2000) },
    score: scoreInbound(msg.text),
    nextActionAt: new Date(Date.now() + 24 * 3600 * 1000)
  });
  return Response.json({ ok: true });
}
