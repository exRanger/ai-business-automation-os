export const runtime = 'nodejs';

export async function GET() {
  return Response.json({ ok: true, service: 'ai-business-automation-os', time: new Date().toISOString() });
}
