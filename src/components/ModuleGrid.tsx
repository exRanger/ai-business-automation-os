import Link from 'next/link';
import type { ModuleDef, ModuleKey } from '@/lib/types';

export function ModuleGrid({ modules, active }: { modules: ModuleDef[]; active?: ModuleKey }) {
  return (
    <section className="modules" aria-label="Кейсы автоматизации">
      <Link className={!active ? 'module active' : 'module'} href="/">
        <b>Все</b>
        <span>Общая очередь</span>
      </Link>
      {modules.map((module) => (
        <Link key={module.key} className={active === module.key ? 'module active' : 'module'} href={`/?module=${module.key}`}>
          <b>{module.title}</b>
          <span>{module.automationCase}</span>
          <small>{module.flow}</small>
        </Link>
      ))}
    </section>
  );
}
