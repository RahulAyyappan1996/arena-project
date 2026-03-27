import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  FlaskConical,
  Info,
  LayoutDashboard,
  ListChecks,
  Download,
  Plus,
  Sparkles,
  Settings,
  Table,
  Target,
  Trash2,
  UploadCloud,
  UserCheck,
  Users,
} from "lucide-react";

type AppView = "login" | "dashboard" | "faro" | "editchecks" | "tmf" | "phase2";
type EnvironmentType = "uat" | "production";
type ProjectStatus = "setup" | "pending" | "live";
type Phase2Role = "CRA" | "DM" | "PI" | "CRC" | "Sponsor";

type Project = {
  id: string;
  title: string;
  protocolId: string;
  area: string;
  pi: string;
  sites: number;
  subjects: number;
  status: ProjectStatus;
};

type EditRule = {
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

type CrfFieldType = "time" | "date" | "number" | "text" | "restricted" | "other";

type CrfDefinition = {
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

type Subject = {
  id: string;
  siteId: string;
  region: string;
  country: string;
  dob: string;
  enrolledAt: string;
};

type DataEntryRecord = {
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

type AuditLog = {
  id: string;
  projectId: string;
  action: string;
  by: string;
  timestamp: string;
};

type StudyDocument = {
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

type FaroScreenKey =
  | "general-info"
  | "objectives"
  | "population"
  | "study-design"
  | "schedule-of-activities"
  | "activity-configuration"
  | "insights"
  | "compare"
  | "crf-manager";

type SidebarItem = {
  key: FaroScreenKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

type MatrixCell = { count: number; phase: string };

type CrfRow = {
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

type CrfFieldTemplate = {
  fieldLabel: string;
  fieldType: CrfFieldType;
  allowedValues?: string[];
  allowOther?: boolean;
};

type CrfStandard = {
  id: string;
  name: string;
  body: "CDISC" | "FDA" | "EMA" | "ICH";
  domain: string;
  adam: string;
  tfl: string;
  required: boolean;
  notes: string;
};

type ProtocolData = {
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

const STUDY_DEFINITION_ITEMS: SidebarItem[] = [
  { key: "general-info", label: "General Info", icon: FileText },
  { key: "objectives", label: "Objectives", icon: Target },
  { key: "population", label: "Population", icon: UserCheck },
  { key: "crf-manager", label: "Case Report Form Manager", icon: ClipboardList },
  { key: "schedule-of-activities", label: "Schedule of Activities", icon: Table },
  { key: "study-design", label: "Study Design", icon: LayoutDashboard },
];

const DATA_ITEMS: SidebarItem[] = [
  { key: "activity-configuration", label: "Activity Configuration", icon: Settings },
  { key: "insights", label: "Insights", icon: BarChart3 },
  { key: "compare", label: "Compare", icon: ListChecks },
];

const DAYS = [-1, 1, 7, 14, 21, 28, 56, 70];

const SITE_DIRECTORY = [
  { id: "001", name: "Site 001", region: "North America", country: "United States" },
  { id: "002", name: "Site 002", region: "Europe", country: "United Kingdom" },
  { id: "003", name: "Site 003", region: "Asia Pacific", country: "Japan" },
  { id: "004", name: "Site 004", region: "Europe", country: "Germany" },
];

const REGION_OPTIONS = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East"];
const COUNTRY_OPTIONS = ["United States", "United Kingdom", "Germany", "Japan", "India", "Canada", "France", "Spain"];

const MATRIX: Record<string, Record<number, MatrixCell | null>> = {
  Demographics: { [-1]: { count: 1, phase: "Screening" }, 1: null, 7: null, 14: null, 21: null, 28: null, 56: null, 70: null },
  "Informed Consent": { [-1]: { count: 1, phase: "Screening" }, 1: null, 7: null, 14: null, 21: null, 28: null, 56: null, 70: null },
  "Vital Signs": {
    [-1]: { count: 1, phase: "Screening" },
    1: { count: 1, phase: "Treatment" },
    7: { count: 1, phase: "Treatment" },
    14: { count: 1, phase: "Treatment" },
    21: { count: 1, phase: "Treatment" },
    28: { count: 1, phase: "Treatment" },
    56: { count: 1, phase: "Treatment" },
    70: { count: 1, phase: "Follow Up" },
  },
  ECG: { [-1]: { count: 1, phase: "Screening" }, 1: { count: 1, phase: "Treatment" }, 7: null, 14: { count: 1, phase: "Treatment" }, 21: null, 28: { count: 1, phase: "Treatment" }, 56: { count: 1, phase: "Treatment" }, 70: null },
  "Medical History": { [-1]: { count: 1, phase: "Screening" }, 1: null, 7: null, 14: null, 21: null, 28: null, 56: null, 70: null },
  "Adverse Events": { [-1]: null, 1: { count: 1, phase: "Treatment" }, 7: { count: 1, phase: "Treatment" }, 14: { count: 1, phase: "Treatment" }, 21: { count: 1, phase: "Treatment" }, 28: { count: 1, phase: "Treatment" }, 56: { count: 1, phase: "Treatment" }, 70: { count: 1, phase: "Follow Up" } },
};

const PANEL_MEMBERS = [
  "Body Weight",
  "Diastolic Blood Pressure",
  "Systolic Blood Pressure",
  "Heart Rate",
  "Respiratory Rate",
  "Temperature",
  "Oxygen Saturation",
  "Height",
  "Waist Circumference",
];

const CRF_FIELD_LIBRARY: Record<string, CrfFieldTemplate[]> = {
  Demographics: [
    { fieldLabel: "Gender", fieldType: "restricted", allowedValues: ["Male", "Female", "Other"], allowOther: true },
    {
      fieldLabel: "Ethnicity",
      fieldType: "restricted",
      allowedValues: ["Asian", "British", "Black", "Hispanic", "White", "Other"],
      allowOther: true,
    },
    { fieldLabel: "Date of Birth", fieldType: "date" },
  ],
  "Informed Consent": [
    { fieldLabel: "Consent Obtained", fieldType: "restricted", allowedValues: ["Yes", "No"], allowOther: false },
    { fieldLabel: "Consent Date", fieldType: "date" },
    { fieldLabel: "Consent Time", fieldType: "time" },
  ],
  "Vital Signs": [
    { fieldLabel: "Body Weight", fieldType: "number" },
    { fieldLabel: "Systolic Blood Pressure", fieldType: "number" },
    { fieldLabel: "Diastolic Blood Pressure", fieldType: "number" },
    { fieldLabel: "Heart Rate", fieldType: "number" },
  ],
  ECG: [
    { fieldLabel: "ECG Result", fieldType: "restricted", allowedValues: ["Normal", "Abnormal", "Clinically Significant"], allowOther: true },
    { fieldLabel: "ECG Collection Date", fieldType: "date" },
  ],
  "Medical History": [
    { fieldLabel: "Condition Term", fieldType: "text" },
    { fieldLabel: "Disease Duration (Years)", fieldType: "number" },
  ],
  "Adverse Events": [
    { fieldLabel: "AE Term", fieldType: "text" },
    { fieldLabel: "AE Severity", fieldType: "restricted", allowedValues: ["Mild", "Moderate", "Severe"], allowOther: true },
    { fieldLabel: "AE Start Date", fieldType: "date" },
  ],
};

const CRF_STANDARDS_LIBRARY: CrfStandard[] = [
  {
    id: "std-dm",
    name: "Demographics",
    body: "CDISC",
    domain: "DM",
    adam: "ADSL",
    tfl: "Demographics and Baseline Table",
    required: true,
    notes: "Core subject baseline profile including sex and ethnicity fields.",
  },
  {
    id: "std-ds",
    name: "Informed Consent",
    body: "ICH",
    domain: "DS",
    adam: "ADSL",
    tfl: "Subject Disposition Table",
    required: true,
    notes: "Required per ICH E6 and protocol compliance documentation.",
  },
  {
    id: "std-vs",
    name: "Vital Signs",
    body: "CDISC",
    domain: "VS",
    adam: "ADVS",
    tfl: "Vital Signs Summary",
    required: true,
    notes: "Baseline and on-treatment vitals for safety burden tracking.",
  },
  {
    id: "std-mh",
    name: "Medical History",
    body: "FDA",
    domain: "MH",
    adam: "ADSL",
    tfl: "Baseline Characteristics",
    required: true,
    notes: "Supports eligibility and baseline disease characterization.",
  },
  {
    id: "std-ae",
    name: "Adverse Events",
    body: "EMA",
    domain: "AE",
    adam: "ADAE",
    tfl: "TEAE Incidence",
    required: true,
    notes: "Safety signal and risk benefit profile.",
  },
  {
    id: "std-eg",
    name: "ECG",
    body: "CDISC",
    domain: "EG",
    adam: "ADEG",
    tfl: "ECG Change from Baseline",
    required: false,
    notes: "Recommended for cardiometabolic risk monitoring.",
  },
];

const FARO_FEATURES = [
  "Import & Digitize protocol content into structured study objects",
  "Benchmark against public and internal protocol libraries",
  "Rapid scenario modeling for burden, cost, and complexity tradeoffs",
  "Clinically-relevant AI recommendations with sourced references",
];

const PROTOCOL_DATA: ProtocolData = {
  studyId: "NVT-4521",
  version: "1.0",
  phase: "Phase III",
  title:
    "A Phase 2, Randomized, Double-Blind, Placebo-Controlled Study to Evaluate Safety, Tolerability, and Efficacy of NVT-4521 in Adults with Type 2 Diabetes Mellitus",
  drug: {
    name: "NVT-4521",
    class: "Small molecule, oral antidiabetic",
    moa: "Selective AMPK pathway modulation",
    overview:
      "NVT-4521 is designed to improve glycemic control and cardiometabolic outcomes in adults with Type 2 Diabetes Mellitus by improving insulin sensitivity and reducing hepatic glucose output.",
  },
  pdf: {
    name: "NVT-4521_Protocol_v1.0.pdf",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  amendments: [
    { version: "1.1", date: "2025-10-04", summary: "Clarified visit windows for Day 14 and Day 21." },
    { version: "1.2", date: "2026-01-12", summary: "Updated exclusion criteria for severe renal impairment." },
  ],
  objectives: {
    primary: [
      {
        text: "Evaluate change from baseline in HbA1c at Week 12 versus placebo.",
        crfs: ["Laboratory Results", "Demographics", "Visit Completion"],
      },
    ],
    secondary: [
      {
        text: "Evaluate fasting plasma glucose trend across treatment visits.",
        crfs: ["Laboratory Results", "Vital Signs"],
      },
      {
        text: "Evaluate incidence and severity of treatment-emergent adverse events.",
        crfs: ["Adverse Events", "Concomitant Medications"],
      },
    ],
  },
  population: {
    target: "Adults with Type 2 Diabetes Mellitus",
    age: "18 to 75 years",
    sampleSize: "Planned enrollment: 420 participants",
    inclusion: [
      "Confirmed diagnosis of Type 2 Diabetes Mellitus for at least 6 months",
      "HbA1c between 7.0% and 10.5% at screening",
      "Stable background therapy for at least 12 weeks",
    ],
    exclusion: [
      "Type 1 Diabetes Mellitus",
      "History of diabetic ketoacidosis in past 12 months",
      "eGFR < 30 mL/min/1.73m²",
    ],
  },
};

const CDISC_MAP: Record<string, { crf: string; cdash: string; adam: string; tfl: string }> = {
  Demographics: { crf: "Demographics", cdash: "DM", adam: "ADSL", tfl: "Demographics and Baseline Table" },
  "Informed Consent": { crf: "Informed Consent", cdash: "DS", adam: "ADSL", tfl: "Subject Disposition Table" },
  "Vital Signs": { crf: "Vital Signs", cdash: "VS", adam: "ADVS", tfl: "Vital Signs Summary" },
  ECG: { crf: "ECG", cdash: "EG", adam: "ADEG", tfl: "ECG Change from Baseline" },
  "Medical History": { crf: "Medical History", cdash: "MH", adam: "ADSL", tfl: "Baseline Characteristics" },
  "Adverse Events": { crf: "Adverse Events", cdash: "AE", adam: "ADAE", tfl: "TEAE Incidence" },
};

const INITIAL_PROJECTS: Project[] = [
  {
    id: "p-001",
    title: "CardioVax Trial",
    protocolId: "CV-2024-001",
    area: "Cardiology",
    pi: "Dr. A. Morgan",
    sites: 12,
    subjects: 156,
    status: "setup",
  },
  {
    id: "p-002",
    title: "NeuroLite NVT-4521",
    protocolId: "NVT-4521",
    area: "Neurology",
    pi: "Dr. S. Shah",
    sites: 8,
    subjects: 84,
    status: "pending",
  },
  {
    id: "p-003",
    title: "GlucoBalance",
    protocolId: "GB-2023-119",
    area: "Metabolic",
    pi: "Dr. H. Kim",
    sites: 15,
    subjects: 294,
    status: "live",
  },
];

const FIELD_TYPE_OPTIONS: CrfFieldType[] = ["time", "date", "number", "text", "restricted", "other"];

function findStandardIdByActivity(activity: string) {
  const match = CRF_STANDARDS_LIBRARY.find((std) => std.name.toLowerCase() === activity.toLowerCase());
  return match?.id;
}

function buildInitialCrfDefinitions(activities: string[]): CrfDefinition[] {
  return activities.map((activity) => ({
    name: activity,
    source: "Study Definition Workspace",
    standardId: findStandardIdByActivity(activity),
    fields: (CRF_FIELD_LIBRARY[activity] ?? [{ fieldLabel: "Other Field", fieldType: "other", allowOther: true }]).map((field) => ({
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      allowedValues: field.allowedValues?.join(" | "),
      allowOther: field.allowOther ?? false,
    })),
  }));
}

function flattenDefinitionsToRows(definitions: CrfDefinition[]): CrfRow[] {
  let seed = 1;
  return definitions.flatMap((definition) =>
    definition.fields.map((field) => ({
      id: `crf-${definition.name.toLowerCase().replace(/\s+/g, "-")}-${seed++}`,
      schedule: "Main",
      activity: definition.name,
      source: definition.source,
      label: definition.name,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      allowedValues: field.allowedValues,
      allowOther: field.allowOther,
      updated: "Generated from protocol v1.0",
      standardId: definition.standardId,
    })),
  );
}

const INITIAL_CRF_DEFINITIONS: CrfDefinition[] = buildInitialCrfDefinitions([
  "Demographics",
  "Informed Consent",
  "Vital Signs",
  "Medical History",
  "Adverse Events",
]);

const INITIAL_CRF_ROWS: CrfRow[] = flattenDefinitionsToRows(INITIAL_CRF_DEFINITIONS);

function createSuggestedRules(crfs: CrfRow[]): EditRule[] {
  return crfs.flatMap((crf, index) => {
    const baseRule: EditRule = {
      id: `rule-${crf.id}-required-${index}`,
      crfId: crf.id,
      crfLabel: crf.label,
      kind: "edit-check",
      scope: "within-form",
      fieldLabel: crf.fieldLabel,
      title: `${crf.label}: ${crf.fieldLabel} is required`,
      type: "Completeness Check",
      confidence: 95,
      decision: "pending",
    };

    let typeSpecificRule: EditRule;
    if (crf.fieldType === "date") {
      typeSpecificRule = {
        id: `rule-${crf.id}-date-${index}`,
        crfId: crf.id,
        crfLabel: crf.label,
        kind: "edit-check",
        scope: "within-form",
        fieldLabel: crf.fieldLabel,
        title: `${crf.label}: ${crf.fieldLabel} cannot be in the future`,
        type: "Date Validation",
        plainRequirement: `${crf.fieldLabel} should not be future dated`,
        confidence: 97,
        decision: "pending",
      };
    } else if (crf.fieldType === "number") {
      typeSpecificRule = {
        id: `rule-${crf.id}-number-${index}`,
        crfId: crf.id,
        crfLabel: crf.label,
        kind: "edit-check",
        scope: "within-form",
        fieldLabel: crf.fieldLabel,
        title: `${crf.label}: ${crf.fieldLabel} must be within protocol range`,
        type: "Range Check",
        formula: `@${crf.fieldLabel} >= protocol_min && @${crf.fieldLabel} <= protocol_max`,
        confidence: 94,
        decision: "pending",
      };
    } else if (crf.fieldType === "time") {
      typeSpecificRule = {
        id: `rule-${crf.id}-time-${index}`,
        crfId: crf.id,
        crfLabel: crf.label,
        kind: "edit-check",
        scope: "within-form",
        fieldLabel: crf.fieldLabel,
        title: `${crf.label}: ${crf.fieldLabel} must follow HH:mm format`,
        type: "Format Check",
        confidence: 92,
        decision: "pending",
      };
    } else if (crf.fieldType === "restricted") {
      typeSpecificRule = {
        id: `rule-${crf.id}-restricted-${index}`,
        crfId: crf.id,
        crfLabel: crf.label,
        kind: "edit-check",
        scope: "within-form",
        fieldLabel: crf.fieldLabel,
        title: `${crf.label}: ${crf.fieldLabel} must match controlled terminology`,
        type: "Codelist Validation",
        plainRequirement: crf.allowedValues
          ? `${crf.fieldLabel} must be one of: ${crf.allowedValues}${crf.allowOther ? " or Other" : ""}`
          : undefined,
        confidence: 93,
        decision: "pending",
      };
    } else {
      typeSpecificRule = {
        id: `rule-${crf.id}-categorical-${index}`,
        crfId: crf.id,
        crfLabel: crf.label,
        kind: "edit-check",
        scope: "within-form",
        fieldLabel: crf.fieldLabel,
        title: `${crf.label}: ${crf.fieldLabel} must match allowed values`,
        type: "Codelist Validation",
        confidence: 90,
        decision: "pending",
      };
    }

    return [baseRule, typeSpecificRule];
  });
}

function buildStudyDocuments(project: Project | null, crfs: CrfRow[], rules: EditRule[]): StudyDocument[] {
  const nowVersion = project?.protocolId ? `${project.protocolId}-v1.0` : "v1.0";
  const uniqueCrfs = Array.from(new Set(crfs.map((row) => row.label))).join(", ");
  const approvedRules = rules.filter((rule) => rule.decision === "approved").length;

  const templates: Array<{ title: string; category: string; generatedFrom: string }> = [
    { title: "Study Setup Configuration", category: "Setup", generatedFrom: `Project shell and workflow configuration for ${project?.title ?? "study"}` },
    { title: "Protocol Synopsis & Amendment Log", category: "Protocol", generatedFrom: `Based on ${PROTOCOL_DATA.pdf.name} and amendment entries` },
    { title: "CRF Configuration Specification", category: "CRF", generatedFrom: `Finalized CRFs: ${uniqueCrfs || "None"}` },
    { title: "Annotated CRF (aCRF)", category: "CRF", generatedFrom: "CDASH annotations with dataset traceability tags" },
    { title: "CRF Completion Guidelines", category: "CRF", generatedFrom: "Data entry rules, controlled terminology, and field constraints" },
    { title: "Edit Check Specifications", category: "Validation", generatedFrom: `${rules.length} total checks with ${approvedRules} approved` },
    { title: "Custom Function Specification", category: "Validation", generatedFrom: "Cross-form derivations and reconciliation logic" },
    { title: "Data Management Plan (DMP)", category: "Data Management", generatedFrom: "Query handling, review cycle, lock criteria, and quality strategy" },
    { title: "Statistical Analysis Plan (SAP)", category: "Statistics", generatedFrom: "Primary and secondary endpoint analysis definitions" },
    { title: "Metadata Specification", category: "Metadata", generatedFrom: "Variable-level metadata, codelists, and derivation notes" },
    { title: "Metadata Map (CDASH -> SDTM -> ADaM -> TLF)", category: "Metadata", generatedFrom: "Traceability map across collection, tabulation, analysis, and reporting" },
    { title: "SDTM Mapping Specification", category: "Standards", generatedFrom: "SDTM domain mapping and implementation notes" },
    { title: "ADaM Dataset Specification", category: "Standards", generatedFrom: "ADSL and analysis dataset structures" },
    { title: "TFL Shell Listings", category: "Statistics", generatedFrom: "Planned table, figure, and listing shells" },
    { title: "Define.xml & Reviewer Guides (cSDRG/aDRG)", category: "Submission", generatedFrom: "Submission metadata package references" },
  ];

  return templates.map((template, index) => ({
    id: `doc-${index + 1}-${Date.now()}`,
    projectId: project?.id ?? "unknown-project",
    title: template.title,
    category: template.category,
    version: nowVersion,
    generatedFrom: template.generatedFrom,
    assignedTo: [],
    signedBy: [],
    status: "generated",
  }));
}

export default function App() {
  const [view, setView] = useState<AppView>("login");
  const [environment, setEnvironment] = useState<EnvironmentType>("uat");
  const [userEmail, setUserEmail] = useState("user@cleartrial.com");
  const [isAuthed, setIsAuthed] = useState(false);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [faroUnlocked, setFaroUnlocked] = useState(false);
  const [finalizedCrfs, setFinalizedCrfs] = useState<CrfRow[]>(INITIAL_CRF_ROWS);
  const [rules, setRules] = useState<EditRule[]>(createSuggestedRules(INITIAL_CRF_ROWS));
  const [tmfDocsByProject, setTmfDocsByProject] = useState<Record<string, StudyDocument[]>>({});
  const [phase2Role, setPhase2Role] = useState<Phase2Role>("CRA");
  const [subjectsByProject, setSubjectsByProject] = useState<Record<string, Subject[]>>({});
  const [dataEntriesByProject, setDataEntriesByProject] = useState<Record<string, DataEntryRecord[]>>({});
  const [auditLogsByProject, setAuditLogsByProject] = useState<Record<string, AuditLog[]>>({});

  const currentProjectId = currentProject?.id ?? "";
  const currentProjectDocs = currentProjectId ? tmfDocsByProject[currentProjectId] ?? [] : [];
  const currentSubjects = currentProjectId ? subjectsByProject[currentProjectId] ?? [] : [];
  const currentEntries = currentProjectId ? dataEntriesByProject[currentProjectId] ?? [] : [];
  const currentAuditLogs = currentProjectId ? auditLogsByProject[currentProjectId] ?? [] : [];

  const approvedCount = rules.filter((r) => r.decision === "approved").length;
  const rejectedCount = rules.filter((r) => r.decision === "rejected").length;
  const decisionsDone = approvedCount + rejectedCount;

  const envBadge = (
    <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
      {environment === "uat" ? "UAT Database" : "Production Database"}
    </span>
  );

  const selectProject = (project: Project) => {
    setCurrentProject(project);
    if (project.status === "setup") {
      setView("faro");
      return;
    }
    if (project.status === "pending") {
      if ((tmfDocsByProject[project.id] ?? []).length === 0) {
        setTmfDocsByProject((prev) => ({
          ...prev,
          [project.id]: buildStudyDocuments(project, finalizedCrfs, rules),
        }));
      }
      setView("tmf");
      return;
    }
    setView("phase2");
  };

  const createProject = (title: string, protocolId: string, area: string) => {
    const newProject: Project = {
      id: `p-${Date.now()}`,
      title,
      protocolId,
      area,
      pi: "Dr. New PI",
      sites: 0,
      subjects: 0,
      status: "setup",
    };
    setProjects((prev) => [newProject, ...prev]);
    setCurrentProject(newProject);
    setFaroUnlocked(false);
    setFinalizedCrfs(INITIAL_CRF_ROWS);
    setRules(createSuggestedRules(INITIAL_CRF_ROWS));
    setTmfDocsByProject((prev) => ({ ...prev, [newProject.id]: [] }));
    setSubjectsByProject((prev) => ({ ...prev, [newProject.id]: [] }));
    setDataEntriesByProject((prev) => ({ ...prev, [newProject.id]: [] }));
    setAuditLogsByProject((prev) => ({ ...prev, [newProject.id]: [] }));
    setView("faro");
  };

  const updateRule = (ruleId: string, decision: EditRule["decision"]) => {
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, decision } : r)));
  };

  const addRule = (rule: Omit<EditRule, "id" | "decision" | "confidence"> & { confidence?: number }) => {
    setRules((prev) => [
      {
        ...rule,
        id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        confidence: rule.confidence ?? 88,
        decision: "pending",
      },
      ...prev,
    ]);
  };

  const handleFinalizeFaro = (crfs: CrfRow[]) => {
    setFinalizedCrfs(crfs);
    setRules(createSuggestedRules(crfs));
    setView("editchecks");
  };

  const alignAllEditChecks = () => {
    setRules((prev) =>
      prev.map((rule) => ({
        ...rule,
        decision: rule.decision === "pending" ? "approved" : rule.decision,
        confidence: Math.min(99, rule.confidence + 3),
      })),
    );
  };

  const generateAndOpenTmf = () => {
    if (!currentProject) return;
    const docs = buildStudyDocuments(currentProject, finalizedCrfs, rules);
    setTmfDocsByProject((prev) => ({ ...prev, [currentProject.id]: docs }));
    setView("tmf");
  };

  const assignDocToPortal = (docId: string) => {
    if (!currentProjectId) return;
    setTmfDocsByProject((prev) => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] ?? []).map((doc) => {
        if (doc.id !== docId) return doc;
        const assignedTo = doc.assignedTo.includes(userEmail) ? doc.assignedTo : [...doc.assignedTo, userEmail];
        return { ...doc, assignedTo, status: doc.signedBy.length === assignedTo.length ? "signed" : "assigned" };
      }),
    }));
  };

  const assignAllDocsToPortal = () => {
    if (!currentProjectId) return;
    setTmfDocsByProject((prev) => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] ?? []).map((doc) => {
        const assignedTo = doc.assignedTo.includes(userEmail) ? doc.assignedTo : [...doc.assignedTo, userEmail];
        return { ...doc, assignedTo, status: doc.signedBy.length === assignedTo.length ? "signed" : "assigned" };
      }),
    }));
  };

  const markDocSigned = (docId: string, mode: "digital" | "uploaded", uploadFileName?: string) => {
    if (!currentProjectId) return;
    setTmfDocsByProject((prev) => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] ?? []).map((doc) => {
        if (doc.id !== docId) return doc;
        const assignedTo = doc.assignedTo.includes(userEmail) ? doc.assignedTo : [...doc.assignedTo, userEmail];
        const signedBy = doc.signedBy.includes(userEmail) ? doc.signedBy : [...doc.signedBy, userEmail];
        const status = signedBy.length === assignedTo.length ? "signed" : "partially-signed";
        return { ...doc, assignedTo, signedBy, signatureMode: mode, uploadFileName, status };
      }),
    }));
  };

  const allDocs = Object.values(tmfDocsByProject).flat();
  const myPendingDocs = allDocs.filter((doc) => doc.assignedTo.includes(userEmail) && !doc.signedBy.includes(userEmail));
  const allDocsReadyForGoLive =
    currentProjectDocs.length > 0 &&
    currentProjectDocs.every((doc) => doc.assignedTo.length > 0 && doc.signedBy.length === doc.assignedTo.length);

  const completeSignoff = () => {
    if (!allDocsReadyForGoLive || !currentProject) return;
    setProjects((prev) => prev.map((p) => (p.id === currentProject.id ? { ...p, status: "live" } : p)));
    setCurrentProject({ ...currentProject, status: "live" });
    setView("phase2");
  };

  const appendAuditLog = (projectId: string, action: string) => {
    const auditItem: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      projectId,
      action,
      by: userEmail,
      timestamp: new Date().toISOString(),
    };
    setAuditLogsByProject((prev) => ({
      ...prev,
      [projectId]: [auditItem, ...(prev[projectId] ?? [])].slice(0, 40),
    }));
  };

  const enrollSubject = (subject: Subject) => {
    if (!currentProjectId) return;
    setSubjectsByProject((prev) => ({
      ...prev,
      [currentProjectId]: [subject, ...(prev[currentProjectId] ?? [])],
    }));
    appendAuditLog(currentProjectId, `Dummy subject enrolled: ${subject.id}`);
  };

  const deleteSubject = (id: string) => {
    if (!currentProjectId) return;
    setSubjectsByProject((prev) => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] ?? []).filter((s) => s.id !== id),
    }));
    appendAuditLog(currentProjectId, `Dummy subject removed: ${id}`);
  };

  const submitDataEntry = (entry: Omit<DataEntryRecord, "id" | "projectId" | "enteredAt" | "status">) => {
    if (!currentProjectId) return;
    let inserted = false;
    setDataEntriesByProject((prev) => {
      const current = prev[currentProjectId] ?? [];
      const duplicate = current.some(
        (record) =>
          record.subjectId === entry.subjectId &&
          record.visit === entry.visit &&
          record.crf === entry.crf &&
          record.fieldLabel === entry.fieldLabel,
      );

      if (duplicate) {
        return prev;
      }

      inserted = true;
      const record: DataEntryRecord = {
        id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        projectId: currentProjectId,
        enteredAt: new Date().toISOString(),
        status: "submitted",
        ...entry,
      };

      return {
        ...prev,
        [currentProjectId]: [record, ...current],
      };
    });

    if (inserted) {
      appendAuditLog(currentProjectId, `Data entry submitted for ${entry.subjectId}: ${entry.crf} -> ${entry.fieldLabel} (${entry.visit})`);
    } else {
      appendAuditLog(currentProjectId, `Duplicate prevented for ${entry.subjectId}: ${entry.crf} -> ${entry.fieldLabel} (${entry.visit})`);
    }
  };

  const updateDataEntry = (entryId: string, value: string) => {
    if (!currentProjectId) return;
    let updatedRecord: DataEntryRecord | null = null;
    setDataEntriesByProject((prev) => {
      const current = prev[currentProjectId] ?? [];
      const next = current.map((entry) => {
        if (entry.id !== entryId) return entry;
        updatedRecord = { ...entry, value, status: "submitted", reviewNote: undefined, enteredAt: new Date().toISOString() };
        return updatedRecord as DataEntryRecord;
      });
      return { ...prev, [currentProjectId]: next };
    });

    if (updatedRecord) {
      appendAuditLog(
        currentProjectId,
        `Data entry updated for ${(updatedRecord as DataEntryRecord).subjectId}: ${(updatedRecord as DataEntryRecord).crf} -> ${(updatedRecord as DataEntryRecord).fieldLabel} (${(updatedRecord as DataEntryRecord).visit})`,
      );
    }
  };

  const reviewDataEntry = (entryId: string, status: "reviewed" | "queried", reviewNote?: string) => {
    if (!currentProjectId) return;
    let context: DataEntryRecord | null = null;
    setDataEntriesByProject((prev) => ({
      ...prev,
      [currentProjectId]: (prev[currentProjectId] ?? []).map((entry) => {
        if (entry.id !== entryId) return entry;
        context = { ...entry, status, reviewNote };
        return context as DataEntryRecord;
      }),
    }));
    if (context) {
      appendAuditLog(
        currentProjectId,
        `Data entry ${status} for ${(context as DataEntryRecord).subjectId}: ${(context as DataEntryRecord).crf} -> ${(context as DataEntryRecord).fieldLabel} (${(context as DataEntryRecord).visit})${reviewNote ? `: ${reviewNote}` : ""}`,
      );
    }
  };

  if (!isAuthed || view === "login") {
    return (
      <LoginView
        environment={environment}
        setEnvironment={setEnvironment}
        onSignIn={(email) => {
          setUserEmail(email);
          setIsAuthed(true);
          setView("dashboard");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ClearTrial Sequential Workflow</p>
            <h1 className="text-2xl font-semibold">{currentProject?.title ?? "Projects"}</h1>
            <p className="text-xs text-slate-500">Signed in as {userEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!currentProject && projects.length > 0) {
                  setCurrentProject(projects[0]);
                }
                setView("tmf");
              }}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
            >
              TMF Portal {myPendingDocs.length > 0 ? `(${myPendingDocs.length})` : ""}
            </button>
            {envBadge}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl p-6">
        {view === "dashboard" && (
          <DashboardView
            projects={projects}
            userEmail={userEmail}
            pendingSignatures={myPendingDocs.length}
            onSelect={selectProject}
            onCreate={createProject}
            onOpenTmf={() => {
              if (!currentProject && projects.length > 0) {
                setCurrentProject(projects[0]);
              }
              setView("tmf");
            }}
            onLogout={() => {
              setIsAuthed(false);
              setView("login");
            }}
          />
        )}

        {view === "faro" && currentProject && (
          <FaroPhaseView
            project={currentProject}
            faroUnlocked={faroUnlocked}
            onProcessProtocol={() => setFaroUnlocked(true)}
            onBackToDashboard={() => setView("dashboard")}
            onContinueToEditChecks={handleFinalizeFaro}
          />
        )}

        {view === "editchecks" && (
          <EditChecksView
            crfs={finalizedCrfs}
            rules={rules}
            approvedCount={approvedCount}
            rejectedCount={rejectedCount}
            decisionsDone={decisionsDone}
            onUpdateRule={updateRule}
            onAddRule={addRule}
            onAiAlignAll={alignAllEditChecks}
            onBack={() => setView("faro")}
            onFinalize={generateAndOpenTmf}
          />
        )}

        {view === "tmf" && (
          <TmfView
            projects={projects}
            project={currentProject}
            onSelectProject={(projectId) => {
              const selected = projects.find((p) => p.id === projectId) ?? null;
              setCurrentProject(selected);
            }}
            userEmail={userEmail}
            docs={currentProjectDocs}
            signedOff={currentProject?.status === "live"}
            onBack={() => setView(currentProject?.status === "live" ? "dashboard" : "editchecks")}
            onGenerateDocuments={() => {
              if (!currentProject) return;
              setTmfDocsByProject((prev) => ({
                ...prev,
                [currentProject.id]: buildStudyDocuments(currentProject, finalizedCrfs, rules),
              }));
            }}
            onAssignDoc={assignDocToPortal}
            onAssignAllDocs={assignAllDocsToPortal}
            onDigitalSign={markDocSigned}
            onSignOff={completeSignoff}
            allDocsReadyForGoLive={allDocsReadyForGoLive}
          />
        )}

        {view === "phase2" && (
          <Phase2View
            project={currentProject}
            userEmail={userEmail}
            role={phase2Role}
            onRoleChange={setPhase2Role}
            subjects={currentSubjects}
            onEnroll={enrollSubject}
            onDelete={deleteSubject}
            entries={currentEntries}
            finalizedCrfs={finalizedCrfs}
            onSubmitEntry={submitDataEntry}
            onUpdateEntry={updateDataEntry}
            onReviewEntry={reviewDataEntry}
            auditLogs={currentAuditLogs}
            onBackToDashboard={() => setView("dashboard")}
          />
        )}
      </main>
    </div>
  );
}

function LoginView({
  environment,
  setEnvironment,
  onSignIn,
}: {
  environment: EnvironmentType;
  setEnvironment: (env: EnvironmentType) => void;
  onSignIn: (email: string) => void;
}) {
  const [email, setEmail] = useState("user@cleartrial.com");
  const [username, setUsername] = useState("cleartrial.user");
  const [password, setPassword] = useState("password");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gateway</p>
        <h2 className="mt-1 text-3xl font-semibold">ClearTrial Login</h2>
        <p className="mt-2 text-slate-600">Sign in to access the study lifecycle workspace.</p>

        <div className="mt-6 space-y-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" placeholder="Email" />
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" placeholder="Username" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" placeholder="Password" type="password" />
          <div>
            <label className="mb-1 block text-sm font-medium">Environment Type</label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as EnvironmentType)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              <option value="uat">UAT Database</option>
              <option value="production">Production Database</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => onSignIn(email)}
          className="mt-6 w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 active:scale-[0.99]"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

function DashboardView({
  projects,
  userEmail,
  pendingSignatures,
  onSelect,
  onCreate,
  onOpenTmf,
  onLogout,
}: {
  projects: Project[];
  userEmail: string;
  pendingSignatures: number;
  onSelect: (p: Project) => void;
  onCreate: (title: string, protocolId: string, area: string) => void;
  onOpenTmf: () => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("New Study");
  const [protocolId, setProtocolId] = useState("NEW-001");
  const [area, setArea] = useState("Cardiology");

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Projects I'm Enrolled In</h2>
          <p className="text-slate-600">Select a project to continue its lifecycle.</p>
          <p className="text-xs text-slate-500">Signed in as {userEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTmf}
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
          >
            TMF Portal {pendingSignatures > 0 ? `(${pendingSignatures} pending)` : ""}
          </button>
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Create New Project
            </span>
          </button>
          <button onClick={onLogout} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">
            Logout
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900">My TMF Signature Tasks</p>
        <p className="text-sm text-blue-800">
          {pendingSignatures > 0
            ? `You have ${pendingSignatures} document${pendingSignatures > 1 ? "s" : ""} waiting for signature.`
            : "No pending signature tasks right now."}
        </p>
        <button onClick={onOpenTmf} className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
          Open TMF Landing Page
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <button key={p.id} onClick={() => onSelect(p)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <StatusBadge status={p.status} />
            </div>
            <p className="mt-2 text-sm text-slate-600">Protocol: {p.protocolId}</p>
            <p className="text-sm text-slate-600">PI: {p.pi}</p>
            <p className="text-sm text-slate-600">Therapeutic Area: {p.area}</p>
            <p className="mt-2 text-sm text-slate-600">{p.sites} sites • {p.subjects} subjects</p>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xl font-semibold">Create New Project</h3>
            <div className="mt-4 space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Study Name" />
              <input value={protocolId} onChange={(e) => setProtocolId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Protocol ID" />
              <input value={area} onChange={(e) => setArea(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Therapeutic Area" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2">Cancel</button>
              <button
                onClick={() => {
                  onCreate(title, protocolId, area);
                  setOpen(false);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
              >
                Create And Open
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  if (status === "setup") {
    return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">Setup Mode</span>;
  }
  if (status === "pending") {
    return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">Pending Sign-off</span>;
  }
  return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Live - Phase 2</span>;
}

function FaroPhaseView({
  project,
  faroUnlocked,
  onProcessProtocol,
  onBackToDashboard,
  onContinueToEditChecks,
}: {
  project: Project;
  faroUnlocked: boolean;
  onProcessProtocol: () => void;
  onBackToDashboard: () => void;
  onContinueToEditChecks: (crfs: CrfRow[]) => void;
}) {
  const [insideFaro, setInsideFaro] = useState(false);

  if (insideFaro) {
    return (
      <FaroWorkspace
        onBack={() => setInsideFaro(false)}
        onContinueToEditChecks={onContinueToEditChecks}
      />
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button onClick={onBackToDashboard} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} />
        Back To Dashboard
      </button>
      <h2 className="text-3xl font-semibold">FARO Study Build - Protocol Ingestion</h2>
      <p className="mt-1 text-slate-600">{project.title} - {project.protocolId}</p>

      {!faroUnlocked ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <div className="mx-auto mb-4 w-fit rounded-2xl bg-red-50 p-3 text-red-600">
            <UploadCloud size={30} />
          </div>
          <p className="text-lg font-semibold">Drop protocol PDF or click to ingest mock protocol</p>
          <p className="text-sm text-slate-500">AI maps to CDASH forms and schedule of activities.</p>
          <button onClick={onProcessProtocol} className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white">Process Protocol</button>
        </div>
      ) : (
        <div className="mt-6">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={18} /> Protocol Successfully Processed
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold">CDASH-Compliant Forms</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>Demographics (DM)</li>
                <li>Vital Signs (VS)</li>
                <li>Adverse Events (AE)</li>
                <li>Concomitant Medications (CM)</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold">Schedule of Events</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>Screening (Day -1)</li>
                <li>Baseline (Day 1)</li>
                <li>Treatment (Day 7, 14, 21, 28)</li>
                <li>Follow Up (Day 56, 70)</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <button
              onClick={() => setInsideFaro(true)}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Open FARO Study Definition Workspace
            </button>
            <button
              onClick={() => onContinueToEditChecks(flattenDefinitionsToRows(INITIAL_CRF_DEFINITIONS))}
              className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Approve & Generate Forms (Continue)
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function FaroWorkspace({ onBack, onContinueToEditChecks }: { onBack: () => void; onContinueToEditChecks: (crfs: CrfRow[]) => void }) {
  const [activeScreen, setActiveScreen] = useState<FaroScreenKey>("general-info");
  const [selectedActivity, setSelectedActivity] = useState("Vital Signs");
  const [selectedActivities, setSelectedActivities] = useState<string[]>(INITIAL_CRF_DEFINITIONS.map((definition) => definition.name));
  const [crfDefinitions, setCrfDefinitions] = useState<CrfDefinition[]>(INITIAL_CRF_DEFINITIONS);
  const [aiAlignMessage, setAiAlignMessage] = useState<string | null>(null);
  const [menuRow, setMenuRow] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const crfRows = useMemo(() => {
    const selectedSet = new Set(selectedActivities);
    const filteredDefinitions = crfDefinitions.filter((definition) => selectedSet.has(definition.name));
    return flattenDefinitionsToRows(filteredDefinitions);
  }, [crfDefinitions, selectedActivities]);

  const aiAlignAll = () => {
    const fullLibraryNames = CRF_STANDARDS_LIBRARY.map((item) => item.name);
    setSelectedActivities(Array.from(new Set(fullLibraryNames)));

    setCrfDefinitions((prev) => {
      const previousByName = new Map(prev.map((definition) => [definition.name.toLowerCase(), definition]));
      return fullLibraryNames.map((name) => {
        const existing = previousByName.get(name.toLowerCase());
        const templateFields = (CRF_FIELD_LIBRARY[name] ?? [{ fieldLabel: "Other Field", fieldType: "other", allowOther: true }]).map((field) => ({
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType,
          allowedValues: field.allowedValues?.join(" | "),
          allowOther: field.allowOther ?? false,
        }));

        const existingFieldNames = new Set(existing?.fields.map((field) => field.fieldLabel.toLowerCase()) ?? []);
        const mergedFields = [...(existing?.fields ?? []), ...templateFields.filter((field) => !existingFieldNames.has(field.fieldLabel.toLowerCase()))];

        return {
          name,
          source: existing?.source ?? "AI Aligned from protocol + regulatory standards",
          standardId: existing?.standardId ?? findStandardIdByActivity(name),
          fields: mergedFields,
        };
      });
    });

    setActiveScreen("crf-manager");
    setAiAlignMessage("AI Align complete. Predefined regulatory CRFs are now populated in Case Report Form Manager. Review field formats, finalize CRFs, then continue to Schedule of Activities.");
    setTimeout(() => setAiAlignMessage(null), 2400);
  };

  const exportFaroExcel = () => {
    const lines: string[] = [
      ["Section", "Field", "Value"].join(","),
      ["General Info", "Study ID", PROTOCOL_DATA.studyId].join(","),
      ["General Info", "Version", PROTOCOL_DATA.version].join(","),
      ["General Info", "Phase", PROTOCOL_DATA.phase].join(","),
      ["General Info", "Drug", PROTOCOL_DATA.drug.name].join(","),
      ["General Info", "Protocol Title", `"${PROTOCOL_DATA.title.replace(/"/g, '""')}"`].join(","),
      ["Schedule", "Selected Activities", `"${selectedActivities.join("; ")}"`].join(","),
    ];

    crfRows.forEach((row) => {
      lines.push([
        "CRF Manager",
        row.activity,
        `${row.schedule} | ${row.source} | ${row.label} | ${row.fieldLabel} (${row.fieldType}) | Allowed: ${row.allowedValues ?? "-"} | Allow Other: ${row.allowOther ? "Yes" : "No"}`,
      ].join(","));
    });

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `FARO_${PROTOCOL_DATA.studyId}_export.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFaroPdf = () => {
    const summaryHtml = `
      <html>
        <head><title>FARO Export - ${PROTOCOL_DATA.studyId}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1>FARO Study Design Export</h1>
          <p><b>Study:</b> ${PROTOCOL_DATA.studyId}</p>
          <p><b>Version:</b> ${PROTOCOL_DATA.version}</p>
          <p><b>Phase:</b> ${PROTOCOL_DATA.phase}</p>
          <h2>Selected Activities</h2>
          <ul>${selectedActivities.map((a) => `<li>${a}</li>`).join("")}</ul>
          <h2>CRF Manager</h2>
          <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; width: 100%;">
            <tr><th>Schedule</th><th>Activity</th><th>Source</th><th>Form Label</th><th>Field Label</th><th>Field Type</th><th>Allowed Values</th><th>Allow Other</th><th>Updated</th></tr>
            ${crfRows
              .map(
                (row) =>
                  `<tr><td>${row.schedule}</td><td>${row.activity}</td><td>${row.source}</td><td>${row.label}</td><td>${row.fieldLabel}</td><td>${row.fieldType}</td><td>${row.allowedValues ?? "-"}</td><td>${row.allowOther ? "Yes" : "No"}</td><td>${row.updated}</td></tr>`,
              )
              .join("")}
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(summaryHtml);
    win.document.close();
    win.focus();
    win.print();
  };

  const content = useMemo(() => {
    switch (activeScreen) {
      case "general-info":
        return <GeneralInfoView protocol={PROTOCOL_DATA} />;
      case "objectives":
        return <ObjectivesView protocol={PROTOCOL_DATA} />;
      case "population":
        return <PopulationView protocol={PROTOCOL_DATA} />;
      case "schedule-of-activities":
        return (
          <ScheduleMatrixView
            onConfigure={(name) => {
              setSelectedActivity(name);
              setActiveScreen("activity-configuration");
            }}
            availableActivities={selectedActivities}
            selectedActivities={selectedActivities}
            setSelectedActivities={setSelectedActivities}
            menuRow={menuRow}
            setMenuRow={setMenuRow}
            tooltip={tooltip}
            setTooltip={setTooltip}
          />
        );
      case "study-design":
        return <StudyDesignView selectedActivities={selectedActivities} standards={CRF_STANDARDS_LIBRARY} />;
      case "activity-configuration":
        return <ActivityConfigurationView activityName={selectedActivity} onSaveMap={() => setActiveScreen("crf-manager")} />;
      case "insights":
        return <InsightsView />;
      case "compare":
        return <CompareView protocol={PROTOCOL_DATA} />;
      case "crf-manager":
        return (
          <CrfManagerView
            definitions={crfDefinitions}
            setDefinitions={setCrfDefinitions}
            selectedActivities={selectedActivities}
            setSelectedActivities={setSelectedActivities}
            standards={CRF_STANDARDS_LIBRARY}
          />
        );
      default:
        return <PlaceholderView title="screen" />;
    }
  }, [activeScreen, selectedActivity, selectedActivities, menuRow, tooltip, crfRows]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex min-h-[740px]">
        <aside className="w-72 border-r border-slate-200 bg-slate-50 p-4">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">faro</p>

          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Study Definition</p>
          <div className="space-y-1">
            {STUDY_DEFINITION_ITEMS.map((item) => (
              <SidebarButton key={item.key} item={item} active={activeScreen === item.key} onClick={() => setActiveScreen(item.key)} />
            ))}
          </div>

          <p className="mb-2 mt-5 text-xs font-semibold uppercase text-slate-500">Data</p>
          <div className="space-y-1">
            {DATA_ITEMS.map((item) => (
              <SidebarButton key={item.key} item={item} active={activeScreen === item.key} onClick={() => setActiveScreen(item.key)} />
            ))}
          </div>
        </aside>

        <section className="flex-1 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">
              <ArrowLeft size={16} />
              Back To Protocol Ingestion
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={aiAlignAll}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Sparkles size={15} />
                AI Align All
              </button>
              <button onClick={exportFaroExcel} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800">
                <Download size={15} />
                Export Excel
              </button>
              <button onClick={exportFaroPdf} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-800">
                <Download size={15} />
                Export PDF
              </button>
              <button
                onClick={() => onContinueToEditChecks(crfRows)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
              >
                Finalize Phase 1
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {aiAlignMessage && <p className="mb-3 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-900">{aiAlignMessage}</p>}

          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Faro Design Intelligence</p>
            <ul className="mt-2 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
              {FARO_FEATURES.map((feature) => (
                <li key={feature} className="rounded-md border border-slate-200 bg-white px-2 py-1">{feature}</li>
              ))}
            </ul>
          </div>
          {content}
        </section>
      </div>
    </div>
  );
}

function SidebarButton({ item, active, onClick }: { item: SidebarItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
        active ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-200"
      }`}
    >
      <Icon size={16} />
      <span>{item.label}</span>
    </button>
  );
}

function GeneralInfoView({ protocol }: { protocol: ProtocolData }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-semibold">General Info</h2>
      <p className="mt-1 text-sm text-slate-600">Protocol and drug overview extracted during ingestion.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoRow label="Study" value={protocol.studyId} />
        <InfoRow label="Version" value={protocol.version} />
        <InfoRow label="Phase" value={protocol.phase} />
        <InfoRow label="Status" value="Setup Mode" />
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-700">Investigational Drug</p>
        <p className="mt-2 text-sm text-slate-700"><span className="font-semibold">Name:</span> {protocol.drug.name}</p>
        <p className="mt-1 text-sm text-slate-700"><span className="font-semibold">Class:</span> {protocol.drug.class}</p>
        <p className="mt-1 text-sm text-slate-700"><span className="font-semibold">MoA:</span> {protocol.drug.moa}</p>
        <p className="mt-2 text-sm text-slate-700">{protocol.drug.overview}</p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Protocol PDF</p>
              <p className="text-xs text-slate-500">{protocol.pdf.name}</p>
            </div>
            <a href={protocol.pdf.url} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Download</a>
          </div>
          <div className="h-80 overflow-hidden rounded-md border border-slate-200 bg-white">
            <iframe title="Protocol Preview" src={protocol.pdf.url} className="h-full w-full" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Protocol Title</p>
          <p className="mt-2 text-sm text-slate-700">{protocol.title}</p>
          <p className="mt-4 text-sm font-semibold text-slate-700">Amendments</p>
          <div className="mt-2 space-y-2">
            {protocol.amendments.map((item) => (
              <div key={item.version} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
                <p className="font-semibold">Version {item.version}</p>
                <p className="text-xs text-slate-500">{item.date}</p>
                <p className="mt-1 text-slate-700">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ObjectivesView({ protocol }: { protocol: ProtocolData }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-semibold">Objectives</h2>
      <p className="mt-1 text-sm text-slate-600">Primary and secondary objectives extracted from the protocol with linked CRFs.</p>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Primary Objectives</p>
          <div className="mt-3 space-y-3">
            {protocol.objectives.primary.map((objective, index) => (
              <div key={`p-${index}`} className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-sm text-slate-800">{objective.text}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {objective.crfs.map((crf) => (
                    <span key={crf} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">CRF: {crf}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Secondary Objectives</p>
          <div className="mt-3 space-y-3">
            {protocol.objectives.secondary.map((objective, index) => (
              <div key={`s-${index}`} className="rounded-md border border-slate-200 bg-white p-3">
                <p className="text-sm text-slate-800">{objective.text}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {objective.crfs.map((crf) => (
                    <span key={crf} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">CRF: {crf}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PopulationView({ protocol }: { protocol: ProtocolData }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-semibold">Population</h2>
      <p className="mt-1 text-sm text-slate-600">Eligibility population details extracted from protocol.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <InfoRow label="Target" value={protocol.population.target} />
        <InfoRow label="Age" value={protocol.population.age} />
        <InfoRow label="Sample Size" value={protocol.population.sampleSize} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">Inclusion Criteria</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-emerald-900">
            {protocol.population.inclusion.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-800">Exclusion Criteria</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-rose-900">
            {protocol.population.exclusion.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function ScheduleMatrixView({
  onConfigure,
  availableActivities,
  selectedActivities,
  setSelectedActivities,
  menuRow,
  setMenuRow,
  tooltip,
  setTooltip,
}: {
  onConfigure: (name: string) => void;
  availableActivities: string[];
  selectedActivities: string[];
  setSelectedActivities: React.Dispatch<React.SetStateAction<string[]>>;
  menuRow: string | null;
  setMenuRow: (value: string | null) => void;
  tooltip: { x: number; y: number; text: string } | null;
  setTooltip: (value: { x: number; y: number; text: string } | null) => void;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="text-3xl font-semibold">Schedule of Activities</h2>
      <p className="text-sm text-slate-600">Clickable matrix with activity-level actions. Only finalized CRFs from Case Report Form Manager appear here.</p>

      {availableActivities.length === 0 && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          No finalized CRFs yet. Go to Case Report Form Manager and finalize at least one CRF for schedule assignment.
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-200 px-3 py-2 text-left">Assessment</th>
              {DAYS.map((day) => (
                <th key={day} className="border border-slate-200 px-3 py-2 text-center">Day {day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {availableActivities.map((assessment) => (
              <tr key={assessment}>
                <td className="relative border border-slate-200 px-3 py-2">
                  {(() => {
                    const linkedStd = CRF_STANDARDS_LIBRARY.find((std) => std.name === assessment);
                    return linkedStd ? (
                      <span className="absolute right-2 top-2 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-800">
                        {linkedStd.body}
                      </span>
                    ) : null;
                  })()}
                  <button
                    onClick={() => setMenuRow(menuRow === assessment ? null : assessment)}
                    className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-blue-700"
                  >
                    {assessment}
                    <ChevronDown size={14} />
                  </button>
                  <div className="mt-1 text-[11px]">
                    {selectedActivities.includes(assessment) ? (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-800">Selected CRF</span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-500">Not Selected</span>
                    )}
                  </div>

                  {menuRow === assessment && (
                    <div className="absolute left-3 top-10 z-20 w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                      <button
                        onClick={() => {
                          if (!selectedActivities.includes(assessment)) {
                            setSelectedActivities((prev) => [...prev, assessment]);
                          }
                          setMenuRow(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                      >
                        <Plus size={14} /> Add Schedule Activity
                      </button>
                      <button
                        onClick={() => {
                          setMenuRow(null);
                          if (!selectedActivities.includes(assessment)) {
                            setSelectedActivities((prev) => [...prev, assessment]);
                          }
                          onConfigure(assessment);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                      >
                        <Settings size={14} /> Configure Activity
                      </button>
                      <button
                        onClick={() => {
                          setSelectedActivities((prev) => prev.filter((item) => item !== assessment));
                          setMenuRow(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </td>

                {DAYS.map((day) => {
                  const defaultCell = day === -1 || day === 1 ? { count: 1, phase: day === -1 ? "Screening" : "Treatment" } : null;
                  const cell = MATRIX[assessment]?.[day] ?? defaultCell;
                  return (
                    <td
                      key={`${assessment}-${day}`}
                      className="border border-slate-200 px-3 py-2 text-center"
                      onClick={(e) => {
                        if (!cell) return;
                        const r = (e.currentTarget as HTMLTableCellElement).getBoundingClientRect();
                        setTooltip({ x: r.left + r.width / 2, y: r.top - 10, text: `${cell.count} time in ${cell.phase} on Day ${day}` });
                      }}
                    >
                      {cell ? <span className="mx-auto block h-2.5 w-2.5 rounded-full bg-violet-600" /> : <span className="text-slate-300">-</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

function StudyDesignView({ selectedActivities, standards }: { selectedActivities: string[]; standards: CrfStandard[] }) {
  const mappedRows = selectedActivities
    .map((activity) => ({ activity, map: CDISC_MAP[activity] }))
    .filter((row) => Boolean(row.map));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-semibold">Study Design</h2>
      <p className="mt-1 text-sm text-slate-600">CRFs selected in Schedule of Activities mapped to CDASH, ADaM, and TFL.</p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[880px] border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="border border-slate-200 px-3 py-2 text-left">Selected Activity</th>
              <th className="border border-slate-200 px-3 py-2 text-left">CRF</th>
              <th className="border border-slate-200 px-3 py-2 text-left">CDASH Domain</th>
              <th className="border border-slate-200 px-3 py-2 text-left">ADaM Dataset</th>
              <th className="border border-slate-200 px-3 py-2 text-left">TFL Output</th>
            </tr>
          </thead>
          <tbody>
            {mappedRows.map((row) => (
              <tr key={row.activity}>
                <td className="border border-slate-200 px-3 py-2">{row.activity}</td>
                <td className="border border-slate-200 px-3 py-2">{row.map!.crf}</td>
                <td className="border border-slate-200 px-3 py-2">{row.map!.cdash}</td>
                <td className="border border-slate-200 px-3 py-2">{row.map!.adam}</td>
                <td className="border border-slate-200 px-3 py-2">{row.map!.tfl}</td>
              </tr>
            ))}
            {mappedRows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">No selected activities. Add activities in Schedule of Activities.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-700">Regulatory CRF Standards Library Links</p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {standards.map((std) => (
            <div key={std.id} className="rounded-md border border-slate-200 bg-white p-2 text-xs">
              <p className="font-semibold">{std.name}</p>
              <p className="text-slate-600">{std.body} • {std.domain} • {std.adam}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareView({ protocol }: { protocol: ProtocolData }) {
  const [query, setQuery] = useState(`${protocol.drug.name} ${protocol.phase} placebo-controlled Type 2 Diabetes`);
  const [running, setRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const results = [
    {
      trial: "NCT04876511",
      source: "ClinicalTrials.gov",
      similarity: "91%",
      insight: "Matched design: randomized, double-blind, placebo-controlled with comparable 12-week endpoint window.",
      url: "https://clinicaltrials.gov/",
    },
    {
      trial: "NCT05432109",
      source: "EU CTIS",
      similarity: "86%",
      insight: "Similar primary endpoint strategy using HbA1c change and safety-focused secondary outcomes.",
      url: "https://euclinicaltrials.eu/",
    },
    {
      trial: "NCT04677822",
      source: "ClinicalTrials.gov",
      similarity: "82%",
      insight: "Comparable AE capture cadence and visit burden pattern over treatment and follow-up.",
      url: "https://clinicaltrials.gov/",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-semibold">Compare</h2>
      <p className="mt-1 text-sm text-slate-600">AI-assisted benchmark against similar internet-available trials and Faro design intelligence signals.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <p className="font-semibold">Design Impact Lens</p>
          <p className="mt-1">Highlights burden, complexity, and cost impacts for each scenario, inspired by Faro Study Design workflows.</p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
          <p className="font-semibold">Scenario Modeling</p>
          <p className="mt-1">Run side-by-side alternatives for visit cadence, activity density, and endpoint strategy before finalization.</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">AI Search Query</label>
        <div className="flex flex-col gap-2 md:flex-row">
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm" />
          <button
            onClick={() => {
              setRunning(true);
              setShowResults(false);
              setTimeout(() => {
                setRunning(false);
                setShowResults(true);
              }, 800);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Run AI Compare
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Prototype note: internet comparison is simulated with static data for pilot clicks.</p>
      </div>

      {running && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">Analyzing external trial registries and generating AI similarity insights...</div>
      )}

      {showResults && (
        <div className="mt-4 space-y-3">
          {results.map((result) => (
            <div key={result.trial} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{result.trial} • {result.source}</p>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">Similarity {result.similarity}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{result.insight}</p>
              <a href={result.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-xs font-semibold text-blue-700 underline">Open Source</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityConfigurationView({ activityName, onSaveMap }: { activityName: string; onSaveMap: () => void }) {
  const [locations, setLocations] = useState({ site: true, home: false, lab: false });
  const [members, setMembers] = useState<string[]>(["Body Weight", "Diastolic Blood Pressure", "Systolic Blood Pressure", "Heart Rate"]);

  const toggleMember = (m: string) => {
    setMembers((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-semibold">Activity Configuration</h2>
      <p className="text-sm text-slate-600">Configure activity: <span className="font-semibold">{activityName}</span></p>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-sm font-semibold">Locations</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={locations.site} onChange={() => setLocations((p) => ({ ...p, site: !p.site }))} /> Site</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={locations.home} onChange={() => setLocations((p) => ({ ...p, home: !p.home }))} /> Home</label>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={locations.lab} onChange={() => setLocations((p) => ({ ...p, lab: !p.lab }))} /> Lab</label>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="mb-2 text-sm font-semibold">Panel Members</p>
        <div className="max-h-52 overflow-y-auto rounded-md border border-slate-200 bg-white p-3">
          <div className="space-y-2 text-sm">
            {PANEL_MEMBERS.map((member) => (
              <label key={member} className="flex items-center gap-2">
                <input type="checkbox" checked={members.includes(member)} onChange={() => toggleMember(member)} />
                {member}
              </label>
            ))}
          </div>
        </div>
      </div>

      <button onClick={onSaveMap} className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
        Save & Map
      </button>
    </div>
  );
}

function InsightsView() {
  const bubbles = [
    { day: "Day -1", time: "1h 49m", size: 68 },
    { day: "Day 1", time: "47m", size: 52 },
    { day: "Day 7", time: "21m", size: 38 },
    { day: "Day 14", time: "27m", size: 42 },
    { day: "Day 21", time: "26m", size: 40 },
  ];
  const bars = [110, 48, 6, 10, 12, 4, 24, 26, 20];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-semibold">Insights</h2>
      <p className="text-sm text-slate-600">Participant burden visualization.</p>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_220px]">
        <div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="mb-3 text-sm font-semibold">Study Journey</p>
            <div className="flex items-center gap-3 overflow-x-auto py-2">
              {bubbles.map((b, i) => (
                <div key={b.day} className="flex items-center gap-3">
                  <div className="grid place-items-center rounded-full bg-blue-600 text-center text-xs font-semibold text-white" style={{ width: b.size, height: b.size }}>
                    <span>{b.time}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-600">{b.day}</div>
                  {i < bubbles.length - 1 && <div className="h-0.5 w-7 bg-blue-300" />}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <p className="mb-3 text-sm font-semibold">Participant Time per Visit</p>
            <div className="flex h-52 items-end gap-3">
              {bars.map((v, i) => (
                <div key={i} className="flex-1 rounded-t bg-rose-300" style={{ height: `${v}%` }} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-semibold">Total Time</p>
          <div className="mt-4 grid place-items-center">
            <div className="grid h-36 w-36 place-items-center rounded-full border-[12px] border-rose-300 text-xl font-semibold text-slate-800">
              3h 53m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CrfManagerView({
  definitions,
  setDefinitions,
  selectedActivities,
  setSelectedActivities,
  standards,
}: {
  definitions: CrfDefinition[];
  setDefinitions: React.Dispatch<React.SetStateAction<CrfDefinition[]>>;
  selectedActivities: string[];
  setSelectedActivities: React.Dispatch<React.SetStateAction<string[]>>;
  standards: CrfStandard[];
}) {
  const [selectedCrfName, setSelectedCrfName] = useState(definitions[0]?.name ?? standards[0]?.name ?? "Demographics");
  const [customCrfName, setCustomCrfName] = useState("");
  const [fieldLabel, setFieldLabel] = useState("Gender");
  const [fieldType, setFieldType] = useState<CrfFieldType>("restricted");
  const [allowedValues, setAllowedValues] = useState("Male | Female | Other");
  const [allowOther, setAllowOther] = useState(true);
  const [libraryId, setLibraryId] = useState(standards[0]?.id ?? "");

  const selectedDefinition = definitions.find((definition) => definition.name === selectedCrfName);
  const templateFields = CRF_FIELD_LIBRARY[selectedCrfName] ?? [];

  const upsertDefinition = (name: string, source: string, standardId?: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setDefinitions((prev) => {
      const exists = prev.some((definition) => definition.name.toLowerCase() === trimmedName.toLowerCase());
      if (exists) {
        return prev.map((definition) =>
          definition.name.toLowerCase() === trimmedName.toLowerCase()
            ? { ...definition, source: definition.source || source, standardId: definition.standardId || standardId }
            : definition,
        );
      }
      return [...prev, { name: trimmedName, source, standardId, fields: [] }];
    });
    setSelectedCrfName(trimmedName);
  };

  const addFieldToCrf = () => {
    if (!selectedCrfName.trim() || !fieldLabel.trim()) return;
    setDefinitions((prev) =>
      prev.map((definition) => {
        if (definition.name !== selectedCrfName) return definition;
        const exists = definition.fields.some((field) => field.fieldLabel.toLowerCase() === fieldLabel.trim().toLowerCase());
        if (exists) return definition;
        return {
          ...definition,
          fields: [
            ...definition.fields,
            {
              fieldLabel: fieldLabel.trim(),
              fieldType,
              allowedValues: allowedValues.trim() || undefined,
              allowOther,
            },
          ],
        };
      }),
    );
  };

  const finalizeCrfForSchedule = () => {
    if (!selectedDefinition || selectedDefinition.fields.length === 0) return;
    setSelectedActivities((prev) => (prev.includes(selectedDefinition.name) ? prev : [...prev, selectedDefinition.name]));
  };

  const removeField = (crfName: string, index: number) => {
    setDefinitions((prev) =>
      prev.map((definition) =>
        definition.name === crfName
          ? { ...definition, fields: definition.fields.filter((_, fieldIndex) => fieldIndex !== index) }
          : definition,
      ),
    );
  };

  const applyTemplateField = (template: CrfFieldTemplate) => {
    setFieldLabel(template.fieldLabel);
    setFieldType(template.fieldType);
    setAllowedValues(template.allowedValues?.join(" | ") ?? "");
    setAllowOther(template.allowOther ?? false);
  };

  const importFromLibrary = () => {
    const selected = standards.find((std) => std.id === libraryId);
    if (!selected) return;
    upsertDefinition(selected.name, `${selected.body} Standards Library`, selected.id);
  };

  const aiSuggestFromProtocol = () => {
    const crfName = selectedCrfName.trim();
    if (!crfName) return;
    upsertDefinition(crfName, "AI Suggested from protocol and regulatory standards", findStandardIdByActivity(crfName));
    const suggestionTemplates = CRF_FIELD_LIBRARY[crfName] ?? [{ fieldLabel: "Other Field", fieldType: "other", allowOther: true }];
    setDefinitions((prev) =>
      prev.map((definition) => {
        if (definition.name !== crfName) return definition;
        const existing = new Set(definition.fields.map((field) => field.fieldLabel.toLowerCase()));
        const additions = suggestionTemplates
          .filter((template) => !existing.has(template.fieldLabel.toLowerCase()))
          .map((template) => ({
            fieldLabel: template.fieldLabel,
            fieldType: template.fieldType,
            allowedValues: template.allowedValues?.join(" | "),
            allowOther: template.allowOther ?? false,
          }));
        return { ...definition, fields: [...definition.fields, ...additions] };
      }),
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-semibold">Case Report Form Manager</h2>
      <p className="text-sm text-slate-600">Build CRFs first. Only finalized CRFs become available in Schedule of Activities.</p>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 1: Choose or Create CRF</p>
          <div className="mt-2 space-y-2">
            <select value={selectedCrfName} onChange={(e) => setSelectedCrfName(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
              {definitions.map((definition) => (
                <option key={definition.name} value={definition.name}>{definition.name}</option>
              ))}
            </select>
            <input value={customCrfName} onChange={(e) => setCustomCrfName(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm" placeholder="Custom CRF name" />
            <button onClick={() => upsertDefinition(customCrfName, "Custom")} className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-700">Add Custom CRF</button>
          </div>

          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">From Global Library / AI</p>
          <div className="mt-2 space-y-2">
            <select value={libraryId} onChange={(e) => setLibraryId(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
              {standards.map((std) => (
                <option key={std.id} value={std.id}>{std.name} ({std.body})</option>
              ))}
            </select>
            <button onClick={importFromLibrary} className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-700">Import From Global Library</button>
            <button onClick={aiSuggestFromProtocol} className="w-full rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700">AI Suggest Fields</button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 xl:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 2: Add Fields and Data Entry Format</p>
          <div className="mt-2 grid gap-2 md:grid-cols-4">
            <input value={fieldLabel} onChange={(e) => setFieldLabel(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm" placeholder="Field Label" />
            <select value={fieldType} onChange={(e) => setFieldType(e.target.value as CrfFieldType)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
              {FIELD_TYPE_OPTIONS.map((typeOption) => (
                <option key={typeOption} value={typeOption}>{typeOption}</option>
              ))}
            </select>
            <input value={allowedValues} onChange={(e) => setAllowedValues(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm" placeholder="Allowed Values (A | B | Other)" />
            <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-semibold text-slate-700">
              <input type="checkbox" checked={allowOther} onChange={(e) => setAllowOther(e.target.checked)} /> Allow Other
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={addFieldToCrf} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Add Field To CRF</button>
            <button onClick={finalizeCrfForSchedule} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Finalize CRF For Schedule</button>
          </div>

          <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Template Fields For {selectedCrfName}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {templateFields.map((template) => (
                <button key={`${selectedCrfName}-${template.fieldLabel}`} onClick={() => applyTemplateField(template)} className="rounded-full border border-violet-300 bg-white px-3 py-1 text-xs font-semibold text-violet-800">
                  {template.fieldLabel} ({template.fieldType})
                </button>
              ))}
              {templateFields.length === 0 && <span className="text-xs text-violet-800">No predefined template. Keep custom fields and an "other" option for future requirements.</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold">CRF Structure (multi-level)</p>
        <ol className="mt-3 list-decimal space-y-4 pl-5 text-sm text-slate-800">
          {definitions.map((definition) => {
            const linkedStd = standards.find((std) => std.id === definition.standardId);
            const isFinalized = selectedActivities.includes(definition.name);
            return (
              <li key={definition.name}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{definition.name}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">Source: {definition.source}</span>
                  {linkedStd && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">{linkedStd.body} • {linkedStd.domain}</span>}
                  {isFinalized ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Available In Schedule</span> : <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">Not Finalized</span>}
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {definition.fields.map((field, index) => (
                    <li key={`${definition.name}-${field.fieldLabel}-${index}`} className="flex flex-wrap items-center gap-2">
                      <span>{field.fieldLabel}</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-800">{field.fieldType}</span>
                      {field.allowedValues && <span className="text-xs text-slate-600">Allowed: {field.allowedValues}</span>}
                      {field.allowOther && <span className="text-xs text-slate-600">+ Other</span>}
                      <button onClick={() => removeField(definition.name, index)} className="rounded border border-red-300 px-1.5 py-0.5 text-[11px] font-semibold text-red-700">Delete</button>
                    </li>
                  ))}
                  {definition.fields.length === 0 && <li className="text-xs text-slate-500">No fields yet. Add fields above to finalize this CRF.</li>}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-semibold capitalize">{title}</h2>
      <p className="mt-2 text-slate-600">Clickable placeholder for pilot navigation.</p>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        This section is intentionally simplified for the prototype.
      </div>
    </div>
  );
}

function EditChecksView({
  crfs,
  rules,
  approvedCount,
  rejectedCount,
  decisionsDone,
  onUpdateRule,
  onAddRule,
  onAiAlignAll,
  onBack,
  onFinalize,
}: {
  crfs: CrfRow[];
  rules: EditRule[];
  approvedCount: number;
  rejectedCount: number;
  decisionsDone: number;
  onUpdateRule: (id: string, decision: EditRule["decision"]) => void;
  onAddRule: (rule: Omit<EditRule, "id" | "decision" | "confidence"> & { confidence?: number }) => void;
  onAiAlignAll: () => void;
  onBack: () => void;
  onFinalize: () => void;
}) {
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newKind, setNewKind] = useState<EditRule["kind"]>("edit-check");
  const [ruleCrfLabel, setRuleCrfLabel] = useState("");
  const [editField, setEditField] = useState("");
  const [editLogic, setEditLogic] = useState("is required");
  const [formula, setFormula] = useState("@");
  const [plainRequirement, setPlainRequirement] = useState("");
  const [aiDraft, setAiDraft] = useState("");
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);

  const [sourceCrfLabel, setSourceCrfLabel] = useState("");
  const [sourceField, setSourceField] = useState("");
  const [operator, setOperator] = useState("compare with");
  const [targetCrfLabel, setTargetCrfLabel] = useState("");
  const [targetField, setTargetField] = useState("");
  const [outputCrfLabel, setOutputCrfLabel] = useState("");
  const [outputField, setOutputField] = useState("Derived Result");
  const [extraComparisons, setExtraComparisons] = useState<Array<{ crfLabel: string; field: string; operator: string }>>([]);

  const crfGroups = useMemo(() => {
    const map = new Map<string, { id: string; label: string; fields: string[]; fieldTypes: string[] }>();
    crfs.forEach((row) => {
      const found = map.get(row.label);
      if (!found) {
        map.set(row.label, { id: row.id, label: row.label, fields: [row.fieldLabel], fieldTypes: [row.fieldType] });
        return;
      }
      if (!found.fields.includes(row.fieldLabel)) {
        found.fields.push(row.fieldLabel);
      }
      if (!found.fieldTypes.includes(row.fieldType)) {
        found.fieldTypes.push(row.fieldType);
      }
    });
    return Array.from(map.values());
  }, [crfs]);

  const getFieldsForCrf = (crfLabel: string) => {
    return crfGroups.find((item) => item.label === crfLabel)?.fields ?? [];
  };

  const toggleRuleSelection = (ruleId: string, checked: boolean) => {
    setSelectedRuleIds((prev) => {
      if (checked) {
        return prev.includes(ruleId) ? prev : [...prev, ruleId];
      }
      return prev.filter((id) => id !== ruleId);
    });
  };

  const selectAllRules = () => {
    setSelectedRuleIds(rules.map((rule) => rule.id));
  };

  const clearRuleSelection = () => setSelectedRuleIds([]);

  const bulkApproveSelected = () => {
    selectedRuleIds.forEach((id) => onUpdateRule(id, "approved"));
    setSelectedRuleIds([]);
  };

  const getAnotherCrf = (exclude: string) => crfGroups.find((item) => item.label !== exclude)?.label ?? exclude;

  const detectMentionedFields = (text: string) => {
    const mentions = Array.from(text.matchAll(/@([A-Za-z0-9\s_-]+)/g)).map((match) => match[1].trim());
    return mentions.filter(Boolean);
  };

  const draftFromPlainLanguage = (group: { label: string; fields: string[] }) => {
    const req = plainRequirement.trim();
    if (!req) return;

    const lower = req.toLowerCase();
    const mentioned = detectMentionedFields(req);

    if (mentioned.length >= 2 || lower.includes("across") || lower.includes("between forms")) {
      setNewKind("custom-function");
      setSourceCrfLabel(group.label);
      setTargetCrfLabel(getAnotherCrf(group.label));
      setSourceField(mentioned[0] ?? group.fields[0] ?? "");
      setTargetField(mentioned[1] ?? group.fields[1] ?? group.fields[0] ?? "");
      const draftFormula = `@${mentioned[0] ?? group.fields[0] ?? "FieldA"} - @${mentioned[1] ?? group.fields[1] ?? "FieldB"}`;
      setFormula(draftFormula);
      setAiDraft(`Drafted Custom Function: ${draftFormula} based on requirement: "${req}"`);
      return;
    }

    setNewKind("edit-check");
    const field = mentioned[0] ?? group.fields[0] ?? "";
    setEditField(field);

    if (lower.includes("future")) {
      setEditLogic("cannot be in the future");
    } else if (lower.includes("required") || lower.includes("mandatory")) {
      setEditLogic("is required");
    } else if (lower.includes("range") || lower.includes("between")) {
      setEditLogic("must be in protocol range");
    } else if (lower.includes("code") || lower.includes("list") || lower.includes("ethnicity") || lower.includes("gender")) {
      setEditLogic("must match codelist");
    }

    setAiDraft(`Drafted Edit Check: ${group.label} - ${field} ${editLogic || "is required"} based on requirement: "${req}"`);
  };

  const openComposer = (group: { label: string; fields: string[] }) => {
    setAddingFor(group.label);
    setNewKind("edit-check");
    setRuleCrfLabel(group.label);
    setEditField(group.fields[0] ?? "");
    setFormula(`@${group.fields[0] ?? "Field"}`);
    setPlainRequirement("");
    setAiDraft("");
    setSourceCrfLabel(group.label);
    setSourceField(group.fields[0] ?? "");
    const alt = crfGroups.find((item) => item.label !== group.label);
    setTargetCrfLabel(alt?.label ?? group.label);
    setTargetField((alt?.fields?.[0] ?? group.fields[0]) || "");
    setOutputCrfLabel(group.label);
    setExtraComparisons([]);
  };

  const addNewRule = (group: { id: string; label: string; fields: string[] }) => {
    const selectedRuleGroup = crfGroups.find((item) => item.label === ruleCrfLabel) ?? group;
    if (newKind === "edit-check") {
      if (!editField) return;
      onAddRule({
        crfId: selectedRuleGroup.id,
        crfLabel: selectedRuleGroup.label,
        kind: "edit-check",
        scope: "within-form",
        fieldLabel: editField,
        title: aiDraft || `${selectedRuleGroup.label}: ${editField} ${editLogic}`,
        type: "User-Defined Edit Check",
        formula: formula.trim() || undefined,
        plainRequirement: plainRequirement.trim() || undefined,
        aiDrafted: Boolean(aiDraft),
        confidence: 89,
      });
    } else {
      const sourceCrf = crfGroups.find((item) => item.label === sourceCrfLabel) ?? group;
      const targetCrf = crfGroups.find((item) => item.label === targetCrfLabel) ?? group;
      const outputCrf = crfGroups.find((item) => item.label === outputCrfLabel) ?? group;
      if (!sourceField || !targetField || !outputField) return;
      const extraParts = extraComparisons
        .filter((item) => item.crfLabel && item.field)
        .map((item) => `${item.operator} @${item.crfLabel}.${item.field}`)
        .join(" ");
      const computedFormula =
        formula.trim() || `@${sourceCrf.label}.${sourceField} ${operator} @${targetCrf.label}.${targetField}${extraParts ? ` ${extraParts}` : ""}`;
      onAddRule({
        crfId: outputCrf.id,
        crfLabel: outputCrf.label,
        kind: "custom-function",
        scope: "cross-form",
        fieldLabel: outputField,
        title: aiDraft || `Custom Function: ${sourceCrf.label}.${sourceField} ${operator} ${targetCrf.label}.${targetField}${extraParts ? ` ${extraParts}` : ""} -> ${outputField}`,
        type: "Power-Query Style Function",
        formula: computedFormula,
        plainRequirement: plainRequirement.trim() || undefined,
        aiDrafted: Boolean(aiDraft),
        confidence: 85,
      });
    }
    setAddingFor(null);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> Back To FARO
      </button>
      <h2 className="text-3xl font-semibold">AI-Driven Edit Checks & Custom functions</h2>
      <p className="text-slate-600">AI suggests checks by finalized CRF. Add manual edit checks or cross-form custom logic using the + button on each CRF.</p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        Approved: <span className="font-semibold text-emerald-700">{approvedCount}</span> • Rejected: <span className="font-semibold text-red-700">{rejectedCount}</span> • Decisions: {decisionsDone}/{rules.length}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
        <button onClick={onAiAlignAll} className="rounded-md border border-violet-300 bg-violet-50 px-3 py-1.5 font-semibold text-violet-800">
          <span className="inline-flex items-center gap-1"><Sparkles size={14} /> AI Align All</span>
        </button>
        <button onClick={selectAllRules} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700">Select All</button>
        <button onClick={clearRuleSelection} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700">Clear Selection</button>
        <button
          onClick={bulkApproveSelected}
          disabled={selectedRuleIds.length === 0}
          className="rounded-md bg-emerald-600 px-3 py-1.5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          Approve Selected ({selectedRuleIds.length})
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {crfGroups.map((group) => {
          const crfRules = rules.filter((rule) => rule.crfLabel === group.label);
          const sourceFields = getFieldsForCrf(sourceCrfLabel);
          const targetFields = getFieldsForCrf(targetCrfLabel);
          const ruleScopedFields = getFieldsForCrf(ruleCrfLabel || group.label);

          return (
            <div key={group.label} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{group.label}</p>
                  <p className="text-xs text-slate-500">Fields: {group.fields.join(", ")}</p>
                </div>
                <button
                  onClick={() => openComposer(group)}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800"
                >
                  <Plus size={14} /> Add Check
                </button>
              </div>

              {addingFor === group.label && (
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => setNewKind("edit-check")}
                      className={`rounded-md px-3 py-1 text-xs font-semibold ${newKind === "edit-check" ? "bg-blue-600 text-white" : "bg-white text-blue-700"}`}
                    >
                      Edit Check
                    </button>
                    <button
                      onClick={() => setNewKind("custom-function")}
                      className={`rounded-md px-3 py-1 text-xs font-semibold ${newKind === "custom-function" ? "bg-violet-600 text-white" : "bg-white text-violet-700"}`}
                    >
                      Custom Function
                    </button>
                  </div>

                  {newKind === "edit-check" ? (
                    <div className="space-y-2">
                      <div className="grid gap-2 md:grid-cols-3">
                        <select
                          value={ruleCrfLabel}
                          onChange={(e) => {
                            const nextCrf = e.target.value;
                            const nextFields = getFieldsForCrf(nextCrf);
                            setRuleCrfLabel(nextCrf);
                            setEditField(nextFields[0] ?? "");
                            setFormula(`@${nextFields[0] ?? "Field"}`);
                          }}
                          className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                        >
                          {crfGroups.map((item) => (
                            <option key={item.label} value={item.label}>{item.label}</option>
                          ))}
                        </select>
                        <select value={editField} onChange={(e) => setEditField(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          {ruleScopedFields.map((field) => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                        <select value={editLogic} onChange={(e) => setEditLogic(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          <option>is required</option>
                          <option>cannot be in the future</option>
                          <option>must be in protocol range</option>
                          <option>must match codelist</option>
                          <option>must be unique per subject</option>
                        </select>
                        <button onClick={() => addNewRule(group)} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Add Edit Check</button>
                      </div>
                      <input
                        value={formula}
                        onChange={(e) => setFormula(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                        placeholder="Mathematical formula using @FieldLabel e.g. @Systolic Blood Pressure - @Diastolic Blood Pressure"
                      />
                      <textarea
                        value={plainRequirement}
                        onChange={(e) => setPlainRequirement(e.target.value)}
                        className="h-20 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                        placeholder="Type plain English requirement. Example: If @Gender is Female then Pregnancy Test must be collected."
                      />
                      <button onClick={() => draftFromPlainLanguage(group)} className="rounded-md border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700">Draft With AI</button>
                      {aiDraft && <p className="rounded-md border border-blue-200 bg-white px-2 py-2 text-xs text-blue-900">{aiDraft}</p>}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cross-form logic builder (Power Query style)</p>
                      <div className="grid gap-2 md:grid-cols-3">
                        <select value={sourceCrfLabel} onChange={(e) => { setSourceCrfLabel(e.target.value); setSourceField(getFieldsForCrf(e.target.value)[0] ?? ""); }} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          {crfGroups.map((item) => (
                            <option key={item.label} value={item.label}>{item.label}</option>
                          ))}
                        </select>
                        <select value={sourceField} onChange={(e) => setSourceField(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          {sourceFields.map((field) => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                        <select value={operator} onChange={(e) => setOperator(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          <option>compare with</option>
                          <option>+</option>
                          <option>-</option>
                          <option>*</option>
                          <option>/</option>
                          <option>difference &gt; threshold</option>
                          <option>ratio check</option>
                          <option>if/then condition</option>
                          <option>concat</option>
                        </select>
                        <select value={targetCrfLabel} onChange={(e) => { setTargetCrfLabel(e.target.value); setTargetField(getFieldsForCrf(e.target.value)[0] ?? ""); }} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          {crfGroups.map((item) => (
                            <option key={item.label} value={item.label}>{item.label}</option>
                          ))}
                        </select>
                        <select value={targetField} onChange={(e) => setTargetField(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          {targetFields.map((field) => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                        <select value={outputCrfLabel} onChange={(e) => setOutputCrfLabel(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          {crfGroups.map((item) => (
                            <option key={item.label} value={item.label}>{item.label}</option>
                          ))}
                        </select>
                        <input value={outputField} onChange={(e) => setOutputField(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm" placeholder="Output / Derived Field" />
                      </div>
                      <div className="rounded-md border border-slate-200 bg-white p-2">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Additional Form Comparisons</p>
                          <button
                            onClick={() =>
                              setExtraComparisons((prev) => [
                                ...prev,
                                {
                                  crfLabel: getAnotherCrf(targetCrfLabel || group.label),
                                  field: getFieldsForCrf(getAnotherCrf(targetCrfLabel || group.label))[0] ?? "",
                                  operator: "+",
                                },
                              ])
                            }
                            className="inline-flex items-center gap-1 rounded border border-violet-300 px-2 py-1 text-xs font-semibold text-violet-700"
                          >
                            <Plus size={12} /> Add Form
                          </button>
                        </div>
                        <div className="space-y-2">
                          {extraComparisons.map((item, index) => {
                            const extraFields = getFieldsForCrf(item.crfLabel);
                            return (
                              <div key={`extra-${index}`} className="grid gap-2 md:grid-cols-4">
                                <select
                                  value={item.operator}
                                  onChange={(e) =>
                                    setExtraComparisons((prev) => prev.map((entry, i) => (i === index ? { ...entry, operator: e.target.value } : entry)))
                                  }
                                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                                >
                                  <option>+</option>
                                  <option>-</option>
                                  <option>*</option>
                                  <option>/</option>
                                  <option>compare with</option>
                                </select>
                                <select
                                  value={item.crfLabel}
                                  onChange={(e) =>
                                    setExtraComparisons((prev) =>
                                      prev.map((entry, i) =>
                                        i === index
                                          ? { ...entry, crfLabel: e.target.value, field: getFieldsForCrf(e.target.value)[0] ?? "" }
                                          : entry,
                                      ),
                                    )
                                  }
                                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                                >
                                  {crfGroups.map((crf) => (
                                    <option key={crf.label} value={crf.label}>{crf.label}</option>
                                  ))}
                                </select>
                                <select
                                  value={item.field}
                                  onChange={(e) =>
                                    setExtraComparisons((prev) => prev.map((entry, i) => (i === index ? { ...entry, field: e.target.value } : entry)))
                                  }
                                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                                >
                                  {extraFields.map((field) => (
                                    <option key={field} value={field}>{field}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => setExtraComparisons((prev) => prev.filter((_, i) => i !== index))}
                                  className="rounded-md border border-red-300 px-2 py-2 text-xs font-semibold text-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })}
                          {extraComparisons.length === 0 && <p className="text-xs text-slate-500">Use + Add Form to compare more than 2 forms.</p>}
                        </div>
                      </div>
                      <input
                        value={formula}
                        onChange={(e) => setFormula(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                        placeholder="Formula using @FieldLabel and operators (+,-,*,/)"
                      />
                      <textarea
                        value={plainRequirement}
                        onChange={(e) => setPlainRequirement(e.target.value)}
                        className="h-20 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                        placeholder="Describe cross-form requirement in plain English. AI will draft function logic."
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => draftFromPlainLanguage(group)} className="rounded-md border border-violet-300 bg-white px-3 py-2 text-xs font-semibold text-violet-700">Draft With AI</button>
                        <button onClick={() => addNewRule(group)} className="rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white">Add Custom Function</button>
                      </div>
                      {aiDraft && <p className="rounded-md border border-violet-200 bg-white px-2 py-2 text-xs text-violet-900">{aiDraft}</p>}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 space-y-2">
                {crfRules.map((rule) => (
                  <div key={rule.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedRuleIds.includes(rule.id)}
                          onChange={(e) => toggleRuleSelection(rule.id, e.target.checked)}
                        />
                        Select
                      </label>
                      <div>
                        <p className="font-semibold">{rule.title}</p>
                        <p className="text-sm text-slate-600">{rule.type} • {rule.kind === "edit-check" ? "Within Form" : "Cross Form"} • Confidence {rule.confidence}%</p>
                        {rule.formula && <p className="text-xs text-slate-500">Formula: {rule.formula}</p>}
                        {rule.plainRequirement && <p className="text-xs text-slate-500">Requirement: {rule.plainRequirement}</p>}
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">{rule.decision}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => onUpdateRule(rule.id, "approved")} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Approve</button>
                      <button onClick={() => onUpdateRule(rule.id, "rejected")} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Reject</button>
                    </div>
                  </div>
                ))}
                {crfRules.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500">No checks defined yet for this CRF.</p>}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onFinalize}
        disabled={decisionsDone !== rules.length}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        Finalize Edit Checks
      </button>
    </section>
  );
}

function TmfView({
  projects,
  project,
  onSelectProject,
  userEmail,
  docs,
  signedOff,
  onBack,
  onGenerateDocuments,
  onAssignDoc,
  onAssignAllDocs,
  onDigitalSign,
  onSignOff,
  allDocsReadyForGoLive,
}: {
  projects: Project[];
  project: Project | null;
  onSelectProject: (projectId: string) => void;
  userEmail: string;
  docs: StudyDocument[];
  signedOff: boolean;
  onBack: () => void;
  onGenerateDocuments: () => void;
  onAssignDoc: (docId: string) => void;
  onAssignAllDocs: () => void;
  onDigitalSign: (docId: string, mode: "digital" | "uploaded", uploadFileName?: string) => void;
  onSignOff: () => void;
  allDocsReadyForGoLive: boolean;
}) {
  const [activeDocId, setActiveDocId] = useState<string | null>(docs[0]?.id ?? null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const activeDoc = docs.find((doc) => doc.id === activeDocId) ?? docs[0] ?? null;
  const myQueue = docs.filter((doc) => doc.assignedTo.includes(userEmail) && !doc.signedBy.includes(userEmail));

  const printDocument = (doc: StudyDocument) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>${doc.title}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1>${doc.title}</h1>
          <p><strong>Project:</strong> ${project?.title ?? "Study"}</p>
          <p><strong>Version:</strong> ${doc.version}</p>
          <p><strong>Category:</strong> ${doc.category}</p>
          <p><strong>Generated From:</strong> ${doc.generatedFrom}</p>
          <hr/>
          <p>Signature block:</p>
          <p>Signed by: _____________________________</p>
          <p>Date: _________________________________</p>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-semibold">Study TMF Portal</h2>
          <p className="text-slate-600">Central landing page for all study documents, assignments, and signatures.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={project?.id ?? ""}
            onChange={(e) => onSelectProject(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            {projects.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
          <button onClick={onGenerateDocuments} className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
            Generate / Refresh Documents
          </button>
          <button onClick={onAssignAllDocs} disabled={docs.length === 0} className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800 disabled:opacity-50">
            Assign All To TMF Portal
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Document Repository</p>
            <span className="text-xs text-slate-500">{docs.length} documents</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border border-slate-200 px-2 py-2 text-left">Study Name</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">Document</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">Category</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">Version</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">Assignees</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">Status</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td className="border border-slate-200 px-2 py-2">{project?.title ?? "No Study Selected"}</td>
                    <td className="border border-slate-200 px-2 py-2">
                      <p className="font-semibold">{doc.title}</p>
                      <p className="text-xs text-slate-500">{doc.generatedFrom}</p>
                    </td>
                    <td className="border border-slate-200 px-2 py-2">{doc.category}</td>
                    <td className="border border-slate-200 px-2 py-2">{doc.version}</td>
                    <td className="border border-slate-200 px-2 py-2 text-xs">{doc.assignedTo.length > 0 ? doc.assignedTo.join(", ") : "Not Assigned"}</td>
                    <td className="border border-slate-200 px-2 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        doc.status === "signed"
                          ? "bg-emerald-100 text-emerald-800"
                          : doc.status === "partially-signed"
                          ? "bg-blue-100 text-blue-800"
                          : doc.status === "assigned"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => setActiveDocId(doc.id)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700">View</button>
                        <button onClick={() => onAssignDoc(doc.id)} className="rounded-md border border-violet-300 bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-800">Assign</button>
                        <button onClick={() => printDocument(doc)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700">Print</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {docs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-2 py-8 text-center text-sm text-slate-500">No generated documents yet. Use Generate / Refresh Documents.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold">My Signature Queue</p>
            <p className="text-xs text-slate-500">{userEmail}</p>
            <ul className="mt-2 space-y-2 text-sm">
              {myQueue.map((doc) => (
                <li key={doc.id} className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1">{doc.title}</li>
              ))}
              {myQueue.length === 0 && <li className="text-slate-500">No pending signatures.</li>}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold">Document Preview & Signature</p>
            {activeDoc ? (
              <div className="mt-2 space-y-3">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                  <p className="font-semibold">{activeDoc.title}</p>
                  <p className="text-xs text-slate-500">{activeDoc.version} • {activeDoc.category}</p>
                  <p className="mt-2 text-xs text-slate-700">Preview: {activeDoc.generatedFrom}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => printDocument(activeDoc)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">Print Preview</button>
                  <button onClick={() => onDigitalSign(activeDoc.id, "digital")} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Digital Sign</button>
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upload wet-ink signed copy</p>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setUploadedFileName(e.target.files?.[0]?.name ?? "")}
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
                  />
                  <button
                    onClick={() => onDigitalSign(activeDoc.id, "uploaded", uploadedFileName || "signed-copy.pdf")}
                    className="mt-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Submit Signed Upload
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Select a document to preview and sign.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Go-Live Gate</p>
        <p>Study moves to Live only when all assigned TMF documents are fully signed.</p>
      </div>

      <button
        onClick={onSignOff}
        disabled={!allDocsReadyForGoLive}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {signedOff ? "Sign-off Complete" : "Finalize Document Sign-off & Move To Phase 2"}
      </button>
    </section>
  );
}

function Phase2View({
  project,
  userEmail,
  role,
  onRoleChange,
  subjects,
  onEnroll,
  onDelete,
  entries,
  finalizedCrfs,
  onSubmitEntry,
  onUpdateEntry,
  onReviewEntry,
  auditLogs,
  onBackToDashboard,
}: {
  project: Project | null;
  userEmail: string;
  role: Phase2Role;
  onRoleChange: (role: Phase2Role) => void;
  subjects: Subject[];
  onEnroll: (subject: Subject) => void;
  onDelete: (id: string) => void;
  entries: DataEntryRecord[];
  finalizedCrfs: CrfRow[];
  onSubmitEntry: (entry: Omit<DataEntryRecord, "id" | "projectId" | "enteredAt" | "status">) => void;
  onUpdateEntry: (entryId: string, value: string) => void;
  onReviewEntry: (entryId: string, status: "reviewed" | "queried", reviewNote?: string) => void;
  auditLogs: AuditLog[];
  onBackToDashboard: () => void;
}) {
  const [siteId, setSiteId] = useState("001");
  const [region, setRegion] = useState("North America");
  const [country, setCountry] = useState("United States");
  const [dob, setDob] = useState("1991-04-03");
  const [enrolledAt, setEnrolledAt] = useState("2026-01-10");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedVisit, setSelectedVisit] = useState("Day 1");
  const [selectedCrfForEntry, setSelectedCrfForEntry] = useState("");
  const [selectedFieldForAudit, setSelectedFieldForAudit] = useState("");
  const [phase2Section, setPhase2Section] = useState<"enrollment" | "entry">("enrollment");
  const [fieldEntryValues, setFieldEntryValues] = useState<Record<string, string>>({});
  const [crfEditModeMap, setCrfEditModeMap] = useState<Record<string, boolean>>({});
  const [entryError, setEntryError] = useState("");
  const [formStatusMessage, setFormStatusMessage] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  const siteRoles: Phase2Role[] = ["CRA", "PI", "CRC"];
  const reviewRoles: Phase2Role[] = ["DM", "Sponsor"];
  const canEnterData = siteRoles.includes(role);
  const canReviewData = reviewRoles.includes(role);

  const crfFieldMap = useMemo(() => {
    const map = new Map<string, Array<{ fieldLabel: string; fieldType: CrfFieldType; allowedValues?: string; allowOther?: boolean }>>();
    finalizedCrfs.forEach((row) => {
      const existing = map.get(row.label) ?? [];
      if (!existing.some((field) => field.fieldLabel === row.fieldLabel)) {
        existing.push({
          fieldLabel: row.fieldLabel,
          fieldType: row.fieldType,
          allowedValues: row.allowedValues,
          allowOther: row.allowOther,
        });
      }
      map.set(row.label, existing);
    });
    return map;
  }, [finalizedCrfs]);

  const generatedSubjectId = useMemo(() => {
    const siteSubjects = subjects.filter((subject) => subject.siteId === siteId);
    const maxIndex = siteSubjects.reduce((maxValue, subject) => {
      const suffix = Number(subject.id.split("-")[1] ?? "0");
      return Number.isNaN(suffix) ? maxValue : Math.max(maxValue, suffix);
    }, 0);
    return `${siteId}-${String(maxIndex + 1).padStart(3, "0")}`;
  }, [siteId, subjects]);

  useEffect(() => {
    const selectedSite = SITE_DIRECTORY.find((site) => site.id === siteId);
    if (selectedSite) {
      setRegion(selectedSite.region);
      setCountry(selectedSite.country);
    }
  }, [siteId]);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId) ?? null;

  const filteredSubjects = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase();
    if (!query) return subjects;
    return subjects.filter((subject) => subject.id.toLowerCase().includes(query));
  }, [subjects, subjectSearch]);

  const visitOptions = useMemo(() => {
    const includedCrfs = new Set(Array.from(crfFieldMap.keys()));
    const visitDays = new Set<number>();
    Object.entries(MATRIX).forEach(([crfName, dayMap]) => {
      if (!includedCrfs.has(crfName)) return;
      Object.entries(dayMap).forEach(([day, isScheduled]) => {
        if (isScheduled) {
          visitDays.add(Number(day));
        }
      });
    });
    return Array.from(visitDays)
      .sort((a, b) => a - b)
      .map((day) => `Day ${day}`);
  }, [crfFieldMap]);

  const getScheduledCrfsForVisit = (visitLabel: string) => {
    const day = Number(visitLabel.replace("Day ", ""));
    const availableCrfs = Array.from(crfFieldMap.keys());
    return availableCrfs.filter((crfName) => MATRIX[crfName]?.[day]);
  };

  const scheduledCrfsForVisit = useMemo(() => {
    return getScheduledCrfsForVisit(selectedVisit);
  }, [selectedVisit, crfFieldMap]);

  const selectedCrfFields = useMemo(() => {
    return crfFieldMap.get(selectedCrfForEntry) ?? [];
  }, [crfFieldMap, selectedCrfForEntry]);

  const getDraftKey = (subjectId: string, visit: string, crf: string, fieldLabel: string) => {
    return `${subjectId}::${visit}::${crf}::${fieldLabel}`;
  };

  const getFormKey = (subjectId: string, visit: string, crf: string) => {
    return `${subjectId}::${visit}::${crf}`;
  };

  const setFieldValue = (subjectId: string, visit: string, crf: string, fieldLabel: string, value: string) => {
    setFieldEntryValues((prev) => ({ ...prev, [getDraftKey(subjectId, visit, crf, fieldLabel)]: value }));
  };

  const getFieldValue = (subjectId: string, visit: string, crf: string, fieldLabel: string) => {
    return fieldEntryValues[getDraftKey(subjectId, visit, crf, fieldLabel)] ?? "";
  };

  const isFieldAlreadySubmitted = (subjectId: string, visit: string, crf: string, fieldLabel: string) => {
    if (!subjectId || !visit) return false;
    return entries.some(
      (entry) =>
        entry.subjectId === subjectId &&
        entry.visit === visit &&
        entry.crf === crf &&
        entry.fieldLabel === fieldLabel,
    );
  };

  const getSubmittedFieldEntry = (subjectId: string, visit: string, crf: string, fieldLabel: string) => {
    return entries.find(
      (entry) =>
        entry.subjectId === subjectId &&
        entry.visit === visit &&
        entry.crf === crf &&
        entry.fieldLabel === fieldLabel,
    );
  };

  const isFormSubmitted = (subjectId: string, visit: string, crf: string) => {
    const fields = crfFieldMap.get(crf) ?? [];
    if (fields.length === 0) return false;
    return fields.every((field) => isFieldAlreadySubmitted(subjectId, visit, crf, field.fieldLabel));
  };

  const hasFormAnyActivity = (subjectId: string, visit: string, crf: string) => {
    const fields = crfFieldMap.get(crf) ?? [];
    if (fields.length === 0) return false;
    return fields.some((field) => {
      if (isFieldAlreadySubmitted(subjectId, visit, crf, field.fieldLabel)) return true;
      const draft = getFieldValue(subjectId, visit, crf, field.fieldLabel);
      return draft.trim().length > 0;
    });
  };

  const isVisitCompleted = (subjectId: string, visit: string) => {
    const visitCrfs = getScheduledCrfsForVisit(visit);
    if (visitCrfs.length === 0) return true;
    return visitCrfs.every((crf) => isFormSubmitted(subjectId, visit, crf));
  };

  const isVisitUnlocked = (subjectId: string, visit: string) => {
    const visitIndex = visitOptions.indexOf(visit);
    if (visitIndex <= 0) return true;
    for (let i = 0; i < visitIndex; i += 1) {
      if (!isVisitCompleted(subjectId, visitOptions[i])) {
        return false;
      }
    }
    return true;
  };

  const submitSingleField = (fieldLabel: string) => {
    if (!selectedSubjectId || !selectedVisit || !selectedCrfForEntry) return;
    if (isFieldAlreadySubmitted(selectedSubjectId, selectedVisit, selectedCrfForEntry, fieldLabel)) {
      setEntryError(`${fieldLabel} is already submitted.`);
      return;
    }
    const value = getFieldValue(selectedSubjectId, selectedVisit, selectedCrfForEntry, fieldLabel).trim();
    if (!value) {
      setEntryError(`Enter a value for ${fieldLabel} before submitting.`);
      return;
    }

    setEntryError("");
    setFormStatusMessage("");
    onSubmitEntry({
      subjectId: selectedSubjectId,
      visit: selectedVisit,
      crf: selectedCrfForEntry,
      fieldLabel,
      value,
      enteredBy: userEmail,
      enteredByRole: role as "CRA" | "PI" | "CRC",
    });
    setFieldValue(selectedSubjectId, selectedVisit, selectedCrfForEntry, fieldLabel, "");
  };

  const enableCrfEditMode = () => {
    if (!selectedSubjectId || !selectedVisit || !selectedCrfForEntry) return;
    const formKey = getFormKey(selectedSubjectId, selectedVisit, selectedCrfForEntry);
    setCrfEditModeMap((prev) => ({ ...prev, [formKey]: true }));
    selectedCrfFields.forEach((field) => {
      const submitted = getSubmittedFieldEntry(selectedSubjectId, selectedVisit, selectedCrfForEntry, field.fieldLabel);
      if (submitted) {
        setFieldValue(selectedSubjectId, selectedVisit, selectedCrfForEntry, field.fieldLabel, submitted.value);
      }
    });
    setEntryError("");
    setFormStatusMessage(`Edit mode enabled for ${selectedCrfForEntry}. Update values and resubmit CRF.`);
  };

  const resubmitCrfEdits = () => {
    if (!selectedSubjectId || !selectedVisit || !selectedCrfForEntry) return;
    const formKey = getFormKey(selectedSubjectId, selectedVisit, selectedCrfForEntry);
    if (!crfEditModeMap[formKey]) return;

    const missing = selectedCrfFields.find((field) => {
      const submitted = getSubmittedFieldEntry(selectedSubjectId, selectedVisit, selectedCrfForEntry, field.fieldLabel);
      if (!submitted) return true;
      const canEdit = submitted.enteredByRole === "CRA" && submitted.enteredBy === userEmail && role === "CRA";
      const nextValue = canEdit
        ? getFieldValue(selectedSubjectId, selectedVisit, selectedCrfForEntry, field.fieldLabel).trim()
        : submitted.value.trim();
      return !nextValue;
    });

    if (missing) {
      setEntryError(`Cannot resubmit. ${missing.fieldLabel} is empty.`);
      return;
    }

    selectedCrfFields.forEach((field) => {
      const submitted = getSubmittedFieldEntry(selectedSubjectId, selectedVisit, selectedCrfForEntry, field.fieldLabel);
      if (!submitted) return;
      const canEdit = submitted.enteredByRole === "CRA" && submitted.enteredBy === userEmail && role === "CRA";
      if (!canEdit) return;
      const nextValue = getFieldValue(selectedSubjectId, selectedVisit, selectedCrfForEntry, field.fieldLabel).trim();
      if (nextValue && nextValue !== submitted.value) {
        onUpdateEntry(submitted.id, nextValue);
      }
    });

    setCrfEditModeMap((prev) => ({ ...prev, [formKey]: false }));
    setEntryError("");
    setFormStatusMessage(`CRF resubmitted: ${selectedCrfForEntry} (${selectedVisit}) for ${selectedSubjectId}.`);
  };

  useEffect(() => {
    if (visitOptions.length === 0) return;
    if (!selectedSubjectId) {
      setSelectedVisit(visitOptions[0]);
      return;
    }
    const firstUnlockedVisit = visitOptions.find((visit) => isVisitUnlocked(selectedSubjectId, visit)) ?? visitOptions[0];
    if (!visitOptions.includes(selectedVisit) || !isVisitUnlocked(selectedSubjectId, selectedVisit)) {
      setSelectedVisit(firstUnlockedVisit);
    }
  }, [visitOptions, selectedVisit, selectedSubjectId]);

  useEffect(() => {
    if (scheduledCrfsForVisit.length === 0) {
      setSelectedCrfForEntry("");
      setSelectedFieldForAudit("");
      return;
    }
    if (!scheduledCrfsForVisit.includes(selectedCrfForEntry)) {
      setSelectedCrfForEntry(scheduledCrfsForVisit[0]);
      setSelectedFieldForAudit("");
    }
  }, [scheduledCrfsForVisit, selectedCrfForEntry]);

  const formEntriesForSelection = useMemo(() => {
    if (!selectedSubjectId || !selectedVisit || !selectedCrfForEntry) return [] as DataEntryRecord[];
    return entries.filter(
      (entry) =>
        entry.subjectId === selectedSubjectId &&
        entry.visit === selectedVisit &&
        entry.crf === selectedCrfForEntry,
    );
  }, [entries, selectedSubjectId, selectedVisit, selectedCrfForEntry]);

  const fieldEntriesForSelection = useMemo(() => {
    if (!selectedFieldForAudit) return [] as DataEntryRecord[];
    return formEntriesForSelection.filter((entry) => entry.fieldLabel === selectedFieldForAudit);
  }, [formEntriesForSelection, selectedFieldForAudit]);

  const currentFormSubmitted = selectedSubjectId && selectedVisit && selectedCrfForEntry
    ? isFormSubmitted(selectedSubjectId, selectedVisit, selectedCrfForEntry)
    : false;
  const currentFormEditMode = selectedSubjectId && selectedVisit && selectedCrfForEntry
    ? Boolean(crfEditModeMap[getFormKey(selectedSubjectId, selectedVisit, selectedCrfForEntry)])
    : false;

  const getFormProgressStatus = (subjectId: string, visit: string, crf: string) => {
    const fields = crfFieldMap.get(crf) ?? [];
    if (fields.length === 0) {
      return { label: "Not Configured", className: "bg-slate-100 text-slate-700" };
    }

    const submittedCount = fields.filter((field) => isFieldAlreadySubmitted(subjectId, visit, crf, field.fieldLabel)).length;
    const draftCount = fields.filter((field) => {
      const value = getFieldValue(subjectId, visit, crf, field.fieldLabel);
      return value.trim().length > 0;
    }).length;

    if (submittedCount === fields.length) {
      return { label: "Complete", className: "bg-emerald-100 text-emerald-800" };
    }
    if (submittedCount > 0 || draftCount > 0) {
      return { label: "Missing", className: "bg-amber-100 text-amber-900" };
    }
    return { label: "Not Touched", className: "bg-slate-100 text-slate-700" };
  };

  const getVisitProgressStatus = (subjectId: string, visit: string) => {
    const visitCrfs = getScheduledCrfsForVisit(visit);
    if (visitCrfs.length === 0) {
      return { label: "Not Scheduled", className: "bg-slate-100 text-slate-700" };
    }

    const allComplete = visitCrfs.every((crf) => isFormSubmitted(subjectId, visit, crf));
    if (allComplete) {
      return { label: "Complete", className: "bg-emerald-100 text-emerald-800" };
    }

    const hasAnyActivity = visitCrfs.some((crf) => hasFormAnyActivity(subjectId, visit, crf));
    if (hasAnyActivity) {
      return { label: "Missing", className: "bg-amber-100 text-amber-900" };
    }

    return { label: "Not Touched", className: "bg-slate-100 text-slate-700" };
  };

  const contextAuditLogs = useMemo(() => {
    if (!selectedSubjectId) return auditLogs;
    const filters = [selectedSubjectId, selectedVisit, selectedCrfForEntry, selectedFieldForAudit].filter(Boolean) as string[];
    if (filters.length === 0) return auditLogs;
    return auditLogs.filter((log) => filters.some((token) => log.action.includes(token)));
  }, [auditLogs, selectedSubjectId, selectedVisit, selectedCrfForEntry, selectedFieldForAudit]);

  const currentInspectionEntries = selectedFieldForAudit
    ? fieldEntriesForSelection
    : formEntriesForSelection;

  const sortedInspectionEntries = useMemo(() => {
    return [...currentInspectionEntries].sort(
      (a, b) => new Date(a.enteredAt).getTime() - new Date(b.enteredAt).getTime(),
    );
  }, [currentInspectionEntries]);

  const sortedContextAuditLogs = useMemo(() => {
    return [...contextAuditLogs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }, [contextAuditLogs]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button onClick={onBackToDashboard} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> Back To Dashboard
      </button>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-semibold">Phase 2 - Live Environment</h2>
          <p className="text-slate-600">{project?.title ?? "Project"} is now live.</p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">LIVE</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["CRA", "DM", "PI", "CRC", "Sponsor"] as const).map((r) => (
          <button
            key={r}
            onClick={() => onRoleChange(r)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${role === r ? "bg-red-600 text-white" : "border border-slate-300 bg-white"}`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <p className="font-semibold">Role-Based Data Access</p>
        <p>Site roles (CRA/PI/CRC) can create source data entries. DM and Sponsor can review submitted entries, mark reviewed, and raise query state.</p>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject Search & Quick Navigation</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={subjectSearch}
            onChange={(e) => setSubjectSearch(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Search subject (e.g., 001-002)"
          />
          <button
            onClick={() => {
              const target = filteredSubjects[0];
              if (!target) return;
              setSelectedSubjectId(target.id);
              setPhase2Section("entry");
            }}
            className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
          >
            Open First Match
          </button>
        </div>
        {subjectSearch.trim() && (
          <div className="mt-2 flex flex-wrap gap-2">
            {filteredSubjects.slice(0, 8).map((subject) => (
              <button
                key={subject.id}
                onClick={() => {
                  setSelectedSubjectId(subject.id);
                  setPhase2Section("entry");
                }}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
              >
                {subject.id}
              </button>
            ))}
            {filteredSubjects.length === 0 && <span className="text-xs text-slate-500">No subject matches found.</span>}
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled" value="156" icon={<Users size={18} />} />
        <StatCard label="Open Queries" value="23" icon={<Info size={18} />} />
        <StatCard label="Sites Active" value="12" icon={<FlaskConical size={18} />} />
        <StatCard label="Data Points" value="18,942" icon={<BarChart3 size={18} />} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPhase2Section("enrollment")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${phase2Section === "enrollment" ? "bg-blue-600 text-white" : "border border-slate-300 bg-white"}`}
          >
            Subject Enrollment
          </button>
          <button
            onClick={() => setPhase2Section("entry")}
            className={`rounded-md px-3 py-2 text-sm font-semibold ${phase2Section === "entry" ? "bg-blue-600 text-white" : "border border-slate-300 bg-white"}`}
          >
            Data Entry Portal
          </button>
        </div>

        {phase2Section === "enrollment" ? (
          <>
            <h3 className="text-xl font-semibold">Dummy Patient Enrollment</h3>
            <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
              Subject IDs are auto-generated by site. Format: <span className="font-semibold">{siteId}-###</span> (example: 001-001).
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-6">
              <select value={siteId} onChange={(e) => setSiteId(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2">
                {SITE_DIRECTORY.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2">
                {REGION_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2">
                {COUNTRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input value={generatedSubjectId} readOnly className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2" placeholder="Subject ID" />
              <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" className="rounded-lg border border-slate-300 px-3 py-2" />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input value={enrolledAt} onChange={(e) => setEnrolledAt(e.target.value)} type="date" className="rounded-lg border border-slate-300 px-3 py-2" />
            </div>
            <button
              onClick={() => onEnroll({ id: generatedSubjectId, siteId, region, country, dob, enrolledAt })}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Create Test Subject
            </button>

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[700px] border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border border-slate-200 px-3 py-2 text-left">Subject ID</th>
                    <th className="border border-slate-200 px-3 py-2 text-left">Site</th>
                    <th className="border border-slate-200 px-3 py-2 text-left">Region</th>
                    <th className="border border-slate-200 px-3 py-2 text-left">Country</th>
                    <th className="border border-slate-200 px-3 py-2 text-left">DOB</th>
                    <th className="border border-slate-200 px-3 py-2 text-left">Enrollment Date</th>
                    <th className="border border-slate-200 px-3 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id}>
                      <td className="border border-slate-200 px-3 py-2">{s.id}</td>
                      <td className="border border-slate-200 px-3 py-2">{s.siteId}</td>
                      <td className="border border-slate-200 px-3 py-2">{s.region}</td>
                      <td className="border border-slate-200 px-3 py-2">{s.country}</td>
                      <td className="border border-slate-200 px-3 py-2">{s.dob}</td>
                      <td className="border border-slate-200 px-3 py-2">{s.enrolledAt}</td>
                      <td className="border border-slate-200 px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedSubjectId(s.id);
                              if (visitOptions.length > 0) setSelectedVisit(visitOptions[0]);
                              setPhase2Section("entry");
                            }}
                            className="rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white"
                          >
                            Enter Data
                          </button>
                          <button onClick={() => onDelete(s.id)} className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {subjects.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-500">No dummy subjects yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold">Data Entry Portal</h3>
            <p className="mt-1 text-sm text-slate-600">Subject-level page with horizontal visit tabs and vertical CRF list based on Schedule of Activities.</p>

            {!canEnterData ? (
              <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                Data entry controls are restricted for {role}. You can review submitted records below.
              </p>
            ) : !selectedSubject ? (
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                Select a subject using Enter Data from the enrollment table.
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold">Subject Details</p>
                  <p className="mt-1 text-sm text-slate-700">{selectedSubject.id} • Site {selectedSubject.siteId} • {selectedSubject.region}, {selectedSubject.country}</p>
                </div>

                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visits</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {visitOptions.map((visit) => (
                      (() => {
                        const unlocked = selectedSubjectId ? isVisitUnlocked(selectedSubjectId, visit) : false;
                        const visitProgress = selectedSubjectId
                          ? getVisitProgressStatus(selectedSubjectId, visit)
                          : { label: "Not Touched", className: "bg-slate-100 text-slate-700" };
                        return (
                      <button
                        key={visit}
                        onClick={() => setSelectedVisit(visit)}
                        disabled={!unlocked}
                        className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${visitProgress.className} ${selectedVisit === visit ? "ring-2 ring-blue-500" : ""} ${!unlocked ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        {visit} • {unlocked ? visitProgress.label : "Locked"}
                      </button>
                        );
                      })()
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Chronological lock: each next visit unlocks only after previous visit forms are submitted.</p>
                </div>

                {scheduledCrfsForVisit.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    No scheduled CRFs for {selectedVisit}. Use another visit or update Schedule of Activities.
                  </div>
                ) : (
                  <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
                    <aside className="rounded-xl border border-slate-200 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Forms</p>
                      <div className="mt-2 space-y-2">
                        {scheduledCrfsForVisit.map((crfName) => (
                          (() => {
                            const progress = selectedSubjectId ? getFormProgressStatus(selectedSubjectId, selectedVisit, crfName) : { label: "Missing", className: "bg-blue-100 text-blue-800" };
                            return (
                          <button
                            key={crfName}
                            onClick={() => setSelectedCrfForEntry(crfName)}
                            className={`w-full rounded-md border px-3 py-2 text-left text-sm font-semibold ${progress.className} ${selectedCrfForEntry === crfName ? "ring-2 ring-blue-500" : ""}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span>{crfName}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${progress.className}`}>
                                {progress.label}
                              </span>
                            </div>
                          </button>
                            );
                          })()
                        ))}
                      </div>
                    </aside>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <h4 className="text-base font-semibold">{selectedCrfForEntry}</h4>
                      <p className="text-xs text-slate-500">{selectedVisit} data collection</p>
                      {entryError && <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900">{entryError}</p>}
                      {formStatusMessage && <p className="mt-2 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-900">{formStatusMessage}</p>}

                      <div className="mt-3 space-y-2">
                        {selectedCrfFields.map((field) => {
                          if (!selectedSubjectId) return null;
                          const value = getFieldValue(selectedSubjectId, selectedVisit, selectedCrfForEntry, field.fieldLabel);
                          const restrictedValues = (field.allowedValues ?? "")
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean);
                          const submittedRecord = getSubmittedFieldEntry(selectedSubjectId, selectedVisit, selectedCrfForEntry, field.fieldLabel);
                          const isSubmitted = Boolean(submittedRecord);
                          const canEditSubmittedField =
                            role === "CRA" &&
                            isSubmitted &&
                            currentFormEditMode &&
                            submittedRecord?.enteredByRole === "CRA" &&
                            submittedRecord?.enteredBy === userEmail;
                          const locked = (isSubmitted && !canEditSubmittedField) || !canEnterData;
                          const displayValue = isSubmitted
                            ? value || submittedRecord?.value || ""
                            : value;

                          return (
                            <div key={`${selectedCrfForEntry}-${field.fieldLabel}`} className="grid gap-2 md:grid-cols-[220px_1fr_180px]">
                              <button
                                onClick={() => setSelectedFieldForAudit(field.fieldLabel)}
                                className={`rounded-md px-2 py-1 text-left text-sm font-medium ${selectedFieldForAudit === field.fieldLabel ? "bg-violet-100 text-violet-900" : "text-slate-700 hover:bg-slate-100"}`}
                              >
                                {field.fieldLabel}
                              </button>
                              {field.fieldType === "restricted" && restrictedValues.length > 0 ? (
                                <select
                                  value={displayValue}
                                  onChange={(e) => setFieldValue(selectedSubjectId, selectedVisit, selectedCrfForEntry, field.fieldLabel, e.target.value)}
                                  disabled={locked}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                                >
                                  <option value="">Select value</option>
                                  {restrictedValues.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                  {field.allowOther && <option value="Other">Other</option>}
                                </select>
                              ) : (
                                <input
                                  value={displayValue}
                                  onChange={(e) => setFieldValue(selectedSubjectId, selectedVisit, selectedCrfForEntry, field.fieldLabel, e.target.value)}
                                  disabled={locked}
                                  type={field.fieldType === "date" ? "date" : field.fieldType === "time" ? "time" : field.fieldType === "number" ? "number" : "text"}
                                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                                  placeholder={`Enter ${field.fieldType}`}
                                />
                              )}
                              <div className="flex items-center justify-end gap-2">
                                <span className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-semibold ${isSubmitted ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{isSubmitted ? "Submitted" : "Pending"}</span>
                                {!isSubmitted && canEnterData && (
                                  <button
                                    onClick={() => submitSingleField(field.fieldLabel)}
                                    className="rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white"
                                  >
                                    Submit Field
                                  </button>
                                )}
                                {canEditSubmittedField && (
                                  <button
                                    onClick={() => {
                                      const nextValue = getFieldValue(selectedSubjectId, selectedVisit, selectedCrfForEntry, field.fieldLabel);
                                      if (!nextValue.trim()) {
                                        setEntryError(`Cannot keep empty value for ${field.fieldLabel}.`);
                                        return;
                                      }
                                      setEntryError("");
                                      setFormStatusMessage(`Edited draft captured for ${field.fieldLabel}. Click Resubmit CRF to finalize.`);
                                    }}
                                    className="rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"
                                  >
                                    Mark Edited
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {selectedCrfFields.length === 0 && <p className="text-sm text-slate-500">No fields configured for this CRF.</p>}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {!currentFormSubmitted && (
                          <p className="text-xs text-slate-500">
                            Submit each field individually. The form becomes Complete when all fields are submitted.
                          </p>
                        )}
                        {currentFormSubmitted && role === "CRA" && !currentFormEditMode && (
                          <button
                            onClick={enableCrfEditMode}
                            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900"
                          >
                            Edit CRF
                          </button>
                        )}
                        {currentFormSubmitted && currentFormEditMode && (
                          <button
                            onClick={resubmitCrfEdits}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                          >
                            Resubmit CRF
                          </button>
                        )}
                        {currentFormSubmitted && !currentFormEditMode && (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Form Complete</span>
                        )}
                      </div>

                      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inspection Console</p>
                          <span className="text-xs text-slate-500">{selectedFieldForAudit ? `Field: ${selectedFieldForAudit}` : "Form Scope"}</span>
                        </div>
                        <p className="mt-1 text-sm font-semibold">{selectedCrfForEntry} • {selectedVisit}</p>

                        <div className="mt-2 grid gap-3 lg:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted Values</p>
                            <ul className="mt-1 space-y-1 text-xs">
                              {sortedInspectionEntries.map((entry) => (
                                <li key={entry.id} className="rounded-md border border-slate-200 bg-white px-2 py-1">
                                  {entry.fieldLabel}: <span className="font-semibold">{entry.value}</span> • {entry.enteredByRole} • {new Date(entry.enteredAt).toLocaleString()}
                                </li>
                              ))}
                              {sortedInspectionEntries.length === 0 && <li className="text-slate-500">No submitted data in this scope yet.</li>}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Audit Trail For Selected Scope</p>
                            <ul className="mt-1 space-y-1 text-xs">
                              {sortedContextAuditLogs.map((log) => (
                                <li key={log.id} className="rounded-md border border-slate-200 bg-white px-2 py-1">
                                  <p className="font-medium">{log.action}</p>
                                  <p className="text-[11px] text-slate-500">{log.by} • {new Date(log.timestamp).toLocaleString()}</p>
                                </li>
                              ))}
                              {sortedContextAuditLogs.length === 0 && <li className="text-slate-500">No audit events for current selection.</li>}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {canReviewData && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <h3 className="text-lg font-semibold">DM/Sponsor Review Actions</h3>
          <p className="mt-1 text-xs text-slate-500">Applies to currently inspected entries.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {currentInspectionEntries.map((entry) => (
              <div key={entry.id} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                <p className="text-xs font-semibold">{entry.fieldLabel}</p>
                <div className="mt-1 flex gap-1">
                  <button onClick={() => onReviewEntry(entry.id, "reviewed", reviewNote)} className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white">Reviewed</button>
                  <button onClick={() => onReviewEntry(entry.id, "queried", reviewNote || "Query raised")} className="rounded-md bg-amber-500 px-2 py-1 text-[11px] font-semibold text-white">Query</button>
                </div>
              </div>
            ))}
            {currentInspectionEntries.length === 0 && <p className="text-xs text-slate-500">No entries to review in selected scope.</p>}
          </div>
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            className="mt-3 h-16 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Optional reviewer note for Reviewed/Query action"
          />
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-1 inline-flex rounded-md bg-white p-1 text-slate-700">{icon}</div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}