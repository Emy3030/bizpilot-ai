export interface AgentSummary {
  id: string;
  name: string;
  role: string;
  responsibility: string;
  status: string;
  recentActivity: string[];
  recommendation: string | null;
  confidence: number;
}
