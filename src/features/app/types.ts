export type AppView = "login" | "dashboard" | "faro" | "editchecks" | "tmf" | "phase2";
export type EnvironmentType = "uat" | "production";
export type ProjectStatus = "setup" | "pending" | "live";
export type Phase2Role = "CRA" | "DM" | "PI" | "CRC" | "Sponsor";
export type ThemeMode = "manual" | "custom-time" | "sun-cycle";

export type ThemeSettings = {
  mode: ThemeMode;
  manualDark: boolean;
  customStart: string;
  customEnd: string;
  sunrise: string;
  sunset: string;
};

export type Project = {
  id: string;
  title: string;
  protocolId: string;
  area: string;
  pi: string;
  sites: number;
  subjects: number;
  status: ProjectStatus;
};

export type EditRule = {
  id: string;
  crfId: string;
  crfLabel: string;
  title: string;
  kind: "edit-check" | "custom-function";
  scope: "within-form" | "cross-form";
  fieldLabel?: string;
  type: string;
  formula?: string;
  plainRequirement?: string;
  aiDrafted?: boolean;
  confidence: number;
  decision: "pending" | "approved" | "rejected";
};

export type CrfFieldType = "time" | "date" | "number" | "text" | "restricted" | "other";

export type CrfDefinition = {
  name: string;
  source: string;
  standardId?: string;
  fields: Array<{
    fieldLabel: string;
    fieldType: CrfFieldType;
    allowedValues?: string;
    allowOther?: boolean;
  }>;
};

export type Subject = {
  id: string;
  siteId: string;
  region: string;
  country: string;
  dob: string;
  enrolledAt: string;
};

export type DataEntryRecord = {
  id: string;
  projectId: string;
  subjectId: string;
  visit: string;
  crf: string;
  fieldLabel: string;
  value: string;
  enteredBy: string;
  enteredByRole: "CRA" | "PI" | "CRC";
  enteredAt: string;
  status: "submitted" | "reviewed" | "queried";
  reviewNote?: string;
};

export type AuditLog = {
  id: string;
  projectId: string;
  action: string;
  by: string;
  timestamp: string;
};

export type StudyDocument = {
  id: string;
  projectId: string;
  title: string;
  category: string;
  version: string;
  generatedFrom: string;
  assignedTo: string[];
  signedBy: string[];
  signatureMode?: "digital" | "uploaded";
  uploadFileName?: string;
  status: "generated" | "assigned" | "partially-signed" | "signed";
};

export type FaroScreenKey =
  | "general-info"
  | "objectives"
  | "population"
  | "study-design"
  | "schedule-of-activities"
  | "data-hub"
  | "query-manager"
  | "operations-monitor"
  | "study-differences"
  | "activity-configuration"
  | "insights"
  | "compare"
  | "crf-manager";

export type SidebarItem = {
  key: FaroScreenKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

export type MatrixCell = { count: number; phase: string };

export type CrfRow = {
  id: string;
  schedule: string;
  activity: string;
  source: string;
  label: string;
  fieldLabel: string;
  fieldType: CrfFieldType;
  allowedValues?: string;
  allowOther?: boolean;
  updated: string;
  standardId?: string;
};

export type CrfFieldTemplate = {
  fieldLabel: string;
  fieldType: CrfFieldType;
  allowedValues?: string[];
  allowOther?: boolean;
};

export type CrfStandard = {
  id: string;
  name: string;
  body: "CDISC" | "FDA" | "EMA" | "ICH";
  domain: string;
  adam: string;
  tfl: string;
  required: boolean;
  notes: string;
};

export type ProtocolData = {
  studyId: string;
  version: string;
  phase: string;
  title: string;
  drug: {
    name: string;
    class: string;
    moa: string;
    overview: string;
  };
  pdf: {
    name: string;
    url: string;
  };
  amendments: { version: string; date: string; summary: string }[];
  objectives: {
    primary: { text: string; crfs: string[] }[];
    secondary: { text: string; crfs: string[] }[];
  };
  population: {
    target: string;
    age: string;
    sampleSize: string;
    inclusion: string[];
    exclusion: string[];
  };
};

export type QueryItem = {
  id: string;
  subjectId: string;
  description: string;
  status: "open" | "approved";
};

export type ReconcileRow = {
  id: string;
  subjectId: string;
  metric: string;
  labValue: string;
  edcValue: string;
  matched: boolean;
  status: "pending" | "verified";
};

export type SiteContact = {
  name: string;
  email: string;
};

export type SiteDirectoryItem = {
  id: string;
  name: string;
  region: string;
  country: string;
  cecTeam: SiteContact[];
  craTeam: SiteContact[];
  piTeam: SiteContact[];
  dmTeam: SiteContact[];
  sponsorTeam: SiteContact[];
};

export type DataSourceType = "EDC" | "RTSM" | "Labs" | "eCOA" | "Safety";

export type DataHubRecord = {
  id: string;
  projectId: string;
  subjectId: string;
  siteId: string;
  visit: string;
  formType: string;
  fieldLabel: string;
  value: string;
  source: DataSourceType;
  queryStatus: "none" | "open";
  capturedAt: string;
};

export type CommandHubContextType = {
  readinessScore: number;
  queries: QueryItem[];
  openQueriesCount: number;
  approveQuery: (id: string) => void;
  reconcileRows: ReconcileRow[];
  setReconcileRows: React.Dispatch<React.SetStateAction<ReconcileRow[]>>;
};
