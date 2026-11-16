"use client";

import { useState } from 'react';
import { moduleDef } from '@/lib/modules';
import type { AutomationRecord, RecordStatus } from '@/lib/types';

type Props = { initialRecords: AutomationRecord[]; mode: 'demo' | 'live' };

export function WorkQueue({ initialRecords, mode }: Props) {
  const [records, setRecords] = useState(initialRecords);
  const sorted = [...records].sort((a, b) => b.score - a.score);
  return <section className="queue" aria-label="Рабочая очередь">{sorted.map((record) => <Card key={record.id} record={record} mode={mode} onPatch={(next) => setRecords((prev) => prev.map((item) => item.id === record.id ? { ...item, ...next } : item))} />)}</section>;
}

function Card({ record, mode, onPatch }: { record: AutomationRecord; mode: 'demo' | 'live'; onPatch: (next: Partial<AutomationRecord>) => void }) {
  const def = moduleDef(record.module);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const artifact = typeof record.payload.artifact === 'string' ? record.payload.artifact : '';

  async function runAction(actionId: string) {
    setBusy(true); setNote('');
    const status = def.actions.find((action) => action.id === actionId)?.nextStatus ?? 'done';
    try {
      const res = await fetch('/api/actions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ recordId: record.id, actionId }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Action failed');
      if (json.record) onPatch(json.record);
      else onPatch({ status: status as RecordStatus, nextActionAt: status === 'snoozed' ? new Date(Date.now() + 48 * 3600 * 1000).toISOString() : null });
      setNote(mode === 'demo' ? 'Demo: статус применён локально.' : 'Действие применено и записано.');
    } catch (error) {
      if (mode === 'demo') {
        onPatch({ status: status as RecordStatus });
        setNote('Demo: действие применено локально.');
      } else setNote(error instanceof Error ? error.message : 'Ошибка');
    } finally { setBusy(false); }
  }

  async function generate() {
    setBusy(true); setNote('');
    const kind = record.module === 'proposals' ? 'proposal' : record.module === 'content' ? 'content' : 'digest';
    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind, context: { record } }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Generate failed');
      onPatch({ payload: { ...record.payload, artifact: json.text } });
      setNote('Артефакт сгенерирован. Проверь перед отправкой.');
    } catch (error) {
      setNote(error instanceof Error ? error.message : 'Ошибка генерации');
    } finally { setBusy(false); }
  }

  function exportArtifact() {
    const blob = new Blob([artifact || JSON.stringify(record.payload, null, 2)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <article className={`card status-${record.status}`}>
      <div className="cardTop">
        <div>
          <h2>{record.title}</h2>
          <p className="meta">{record.module} · {record.status} · {new Date(record.createdAt).toLocaleString('ru-RU')}</p>
        </div>
        <div className="score">{record.score}</div>
      </div>
      <p className="case"><b>Кейс:</b> {def.automationCase}</p>
      <p className="guard"><b>Guardrail:</b> {def.guardrail}</p>
      <pre className="payload">{JSON.stringify(record.payload, null, 2)}</pre>
      {artifact ? <textarea value={artifact} readOnly rows={8} aria-label="artifact" /> : null}
      {record.nextActionAt ? <p className="next">Next action: {new Date(record.nextActionAt).toLocaleString('ru-RU')}</p> : null}
      <div className="actions">
        {def.actions.map((action) => <button key={action.id} disabled={busy} className={action.dangerous ? 'danger' : ''} onClick={() => runAction(action.id)}>{action.label}</button>)}
        <button disabled={busy} onClick={generate}>Generate artifact</button>
        <button disabled={busy} onClick={exportArtifact}>Export .md</button>
      </div>
      {note ? <p className="note" role="status">{note}</p> : null}
    </article>
  );
}
