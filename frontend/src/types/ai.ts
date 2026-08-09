export type ChatRole = 'USER' | 'ASSISTANT';

/** A chip shown under a chat reply when the AI proposed a write action.
 *  Nothing has happened yet — see AgentAction (types/agentAction.ts) for
 *  the actual queued proposal awaiting approval. */
export interface QueuedActionChip {
  type: 'action_queued';
  label: string;
  actionId?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  actionsPerformed?: QueuedActionChip[];
}

export interface ChatReply {
  reply: string;
  createdAt: string;
  actionsPerformed?: QueuedActionChip[];
}
