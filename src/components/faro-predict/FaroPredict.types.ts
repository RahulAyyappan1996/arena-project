export type AgentTone = "positive" | "neutral" | "warning";

export type AgentLogMessage = {
  id: string;
  agent: string;
  text: string;
  tone: AgentTone;
  probabilityDelta: number;
  completionDeltaDays: number;
};

export type ContextQuestion = {
  id: string;
  label: string;
  options: string[];
};
