import { listRecords, stats } from '@/db/queries';
import { hasDb } from '@/env';
import { modules } from '@/lib/modules';
import type { ModuleKey } from '@/lib/types';
import { ModuleGrid } from '@/components/ModuleGrid';
import { WorkQueue } from '@/components/WorkQueue';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams?: { module?: string } }) {
  const activeModule = (searchParams?.module as ModuleKey | undefined) ?? undefined;
  const records = await listRecords(activeModule);
  const s = await stats();
  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">AI Business Automation OS</p>
          <h1>Один пет-проект, шесть кейсов автоматизации</h1>
          <p className="sub">Каждый модуль показывает полный контур: вход → LLM/правила → human approve → действие → метрики. Без фейковых кнопок и без опасного auto-send.</p>
        </div>
        <div className={hasDb ? 'badge live' : 'badge demo'}>{hasDb ? 'LIVE DB' : 'DEMO MODE'}</div>
      </header>
      <section className="stats" aria-label="Ops summary">
        <div className="stat"><span>Карточки</span><strong>{s.total}</strong></div>
        <div className="stat"><span>Просрочено</span><strong>{s.overdue}</strong></div>
        <div className="stat"><span>Модули</span><strong>{Object.entries(s.byModule).map(([k, v]) => `${k}:${v}`).join(' · ')}</strong></div>
        <div className="stat"><span>Статусы</span><strong>{Object.entries(s.byStatus).map(([k, v]) => `${k}:${v}`).join(' · ')}</strong></div>
      </section>
      <ModuleGrid modules={modules} active={activeModule} />
      <WorkQueue initialRecords={records} mode={hasDb ? 'live' : 'demo'} />
    </main>
  );
}
