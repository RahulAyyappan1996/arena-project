export type QueryStatus = "open" | "pending" | "closed" | "escalated";
export type QuerySource = "manual" | "system" | "edit-check" | "lab-recon";
export type QueryRole = "CRA" | "DM" | "PI";

export type QueryResponse = {
  id: string;
  by: string;
  role: QueryRole;
  message: string;
  timestamp: string;
};

export type QueryRecord = {
  id: string;
  subject: string;
  site: string;
  visit: string;
  formType: string;
  crfField: string;
  queryText: string;
  fullDescription: string;
  status: QueryStatus;
  assignedTo: QueryRole;
  createdDate: string;
  source: QuerySource;
  dataPointRef: string;
  responses: QueryResponse[];
};

export const STATUS_CLASS: Record<QueryStatus, string> = {
  open: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  closed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  escalated: "bg-violet-100 text-violet-800 border-violet-200",
};

export const SOURCE_CLASS: Record<QuerySource, string> = {
  manual: "bg-slate-100 text-slate-700",
  system: "bg-blue-100 text-blue-700",
  "edit-check": "bg-indigo-100 text-indigo-700",
  "lab-recon": "bg-cyan-100 text-cyan-700",
};

export const ROLE_OPTIONS: QueryRole[] = ["CRA", "DM", "PI"];
