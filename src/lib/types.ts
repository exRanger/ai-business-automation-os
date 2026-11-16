export type ModuleKey = 'leads' | 'content' | 'proposals' | 'invoices' | 'bookings' | 'digest';
export type RecordStatus = 'new' | 'triaged' | 'approved' | 'scheduled' | 'done' | 'lost' | 'snoozed' | 'paid' | 'overdue';

export type AutomationRecord = {
  id: string;
  module: ModuleKey;
  status: RecordStatus;
  title: string;
  payload: Record<string, unknown>;
  score: number;
  nextActionAt: string | null;
  createdAt: string;
};

export type ActionDef = {
  id: string;
  label: string;
  nextStatus: RecordStatus;
  dangerous?: boolean;
};

export type ModuleDef = {
  key: ModuleKey;
  title: string;
  automationCase: string;
  flow: string;
  apis: string[];
  guardrail: string;
  actions: ActionDef[];
};
