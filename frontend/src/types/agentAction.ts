export type AgentActionType = 'CREATE_CUSTOMER' | 'RECORD_SALE' | 'RESTOCK_PRODUCT';
export type AgentActionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED';

/** A write action the AI proposed, awaiting (or already given) the owner's
 *  decision — the persisted, canonical record behind the chat's "queued"
 *  chip (QueuedActionChip in types/ai.ts). */
export interface AgentAction {
  id: string;
  agentName: string;
  type: AgentActionType;
  status: AgentActionStatus;
  summary: string;
  reasoning: string | null;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  errorMessage: string | null;
  createdAt: string;
  decidedAt: string | null;
  executedAt: string | null;
}
