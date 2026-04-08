import { Fragment, Suspense, createContext, lazy, useContext, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  ChevronDown,
  ClipboardList,
  FileText,
  FlaskConical,
  Info,
  LayoutDashboard,
  ListChecks,
  Download,
  Moon,
  Plus,
  Sparkles,
  Settings,
  SlidersHorizontal,
  Sun,
  Table,
  Target,
  Trash2,
  UploadCloud,
  UserCheck,
  Users,
} from "lucide-react";
import simulationData from "./components/faro-predict/faro-simulation-data.json";
const FaroPredict = lazy(() => import("./components/faro-predict/FaroPredict"));
const QueryManager = lazy(() => import("./components/QueryManager"));
const ESource = lazy(() => import("./components/eSource/eSource"));
const SDV = lazy(() => import("./components/sdv/sdv"));
const MedicalCoding = lazy(() => import("./components/medicalCoding/medicalCoding"));
const DataLock = lazy(() => import("./components/dataLock/dataLock"));
const MultiSourceData = lazy(() => import("./components/multiSourceData/multiSourceData"));
const AutomatedReconciliation = lazy(() => import("./components/automatedReconciliation/automatedReconciliation"));
const StudyHealthDashboards = lazy(() => import("./components/studyHealthDashboards/studyHealthDashboards"));
const ChangeDetection = lazy(() => import("./components/changeDetection/changeDetection"));
const ComplianceAudit = lazy(() => import("./components/complianceAudit/complianceAudit"));

type AppView = "login" | "dashboard" | "faro" | "editchecks" | "tmf" | "phase2" | "esource" | "sdv" | "medicalcoding" | "datalock" | "multisourcedata" | "automatedreconciliation" | "studyhealthdashboards" | "changedetection" | "complianceaudit";
type EnvironmentType = "uat" | "production";
type ProjectStatus = "setup" | "pending" | "live";
type Phase2Role = "CRA" | "DM" | "PI" | "CRC" | "Sponsor";
type ThemeMode = "manual" | "custom-time" | "sun-cycle";

type ThemeSettings = {
  mode: ThemeMode;
  manualDark: boolean;
  customStart: string;
  customEnd: string;
  sunrise: string;
  sunset: string;
};

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
  | "data-hub"
  | "query-manager"
  | "operations-monitor"
  | "study-differences"
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

type QueryItem = {
  id: string;
  subjectId: string;
  description: string;
  status: "open" | "approved";
};

type ReconcileRow = {
  id: string;
  subjectId: string;
  metric: string;
  labValue: string;
  edcValue: string;
  matched: boolean;
  status: "pending" | "verified";
};

type SiteContact = {
  name: string;
  email: string;
};

type SiteDirectoryItem = {
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

type DataSourceType = "EDC" | "RTSM" | "Labs" | "eCOA" | "Safety";

type DataHubRecord = {
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

const DESIGN_HUB_ITEMS: SidebarItem[] = [
  { key: "general-info", label: "General Info", icon: FileText },
  { key: "objectives", label: "Objectives", icon: Target },
  { key: "population", label: "Population", icon: UserCheck },
  { key: "crf-manager", label: "Case Report Form Manager", icon: ClipboardList },
  { key: "schedule-of-activities", label: "Schedule of Activities", icon: Table },
  { key: "study-design", label: "Study Design", icon: LayoutDashboard },
];

const INTELLIGENCE_HUB_ITEMS: SidebarItem[] = [
  { key: "insights", label: "Insights & Faro Predict", icon: Sparkles },
  { key: "study-differences", label: "Study Differences Report", icon: SlidersHorizontal },
];

const DATA_ITEMS: SidebarItem[] = [
  { key: "activity-configuration", label: "Activity Configuration", icon: Settings },
  { key: "compare", label: "Compare", icon: ListChecks },
];

const DAYS = [-1, 1, 7, 14, 21, 28, 56, 70];

const SITE_DIRECTORY: SiteDirectoryItem[] = [
  {
    id: "001",
    name: "Site 001",
    region: "North America",
    country: "United States",
    cecTeam: [
      { name: "Dr. Laura Bennett", email: "cec.laura.bennett@site001.org" },
      { name: "Dr. James Carter", email: "cec.james.carter@site001.org" },
    ],
    craTeam: [
      { name: "Megan Ross", email: "cra.megan.ross@site001.org" },
      { name: "Daniel Price", email: "cra.daniel.price@site001.org" },
    ],
    piTeam: [
      { name: "Dr. Emily Stone", email: "pi.emily.stone@site001.org" },
      { name: "Dr. Ryan Cole", email: "pi.ryan.cole@site001.org" },
    ],
    dmTeam: [
      { name: "Anita Verma", email: "dm.anita.verma@cleartrial.com" },
      { name: "Noah Kim", email: "dm.noah.kim@cleartrial.com" },
    ],
    sponsorTeam: [
      { name: "Olivia Chen", email: "sponsor.olivia.chen@glucobalance.com" },
      { name: "Mark Alvarez", email: "sponsor.mark.alvarez@glucobalance.com" },
    ],
  },
  {
    id: "002",
    name: "Site 002",
    region: "Europe",
    country: "United Kingdom",
    cecTeam: [
      { name: "Dr. Amelia Knight", email: "cec.amelia.knight@site002.org" },
      { name: "Dr. Oliver Hayes", email: "cec.oliver.hayes@site002.org" },
    ],
    craTeam: [
      { name: "Sophie Reed", email: "cra.sophie.reed@site002.org" },
      { name: "Liam Foster", email: "cra.liam.foster@site002.org" },
    ],
    piTeam: [
      { name: "Dr. Helen Brooks", email: "pi.helen.brooks@site002.org" },
      { name: "Dr. Peter Lowe", email: "pi.peter.lowe@site002.org" },
    ],
    dmTeam: [
      { name: "Anita Verma", email: "dm.anita.verma@cleartrial.com" },
      { name: "Noah Kim", email: "dm.noah.kim@cleartrial.com" },
    ],
    sponsorTeam: [
      { name: "Olivia Chen", email: "sponsor.olivia.chen@glucobalance.com" },
      { name: "Mark Alvarez", email: "sponsor.mark.alvarez@glucobalance.com" },
    ],
  },
  {
    id: "003",
    name: "Site 003",
    region: "Asia Pacific",
    country: "Japan",
    cecTeam: [
      { name: "Dr. Yuki Sato", email: "cec.yuki.sato@site003.org" },
      { name: "Dr. Kenji Watanabe", email: "cec.kenji.watanabe@site003.org" },
    ],
    craTeam: [
      { name: "Aiko Tanaka", email: "cra.aiko.tanaka@site003.org" },
      { name: "Ren Ito", email: "cra.ren.ito@site003.org" },
    ],
    piTeam: [
      { name: "Dr. Mei Nakamura", email: "pi.mei.nakamura@site003.org" },
      { name: "Dr. Takumi Saito", email: "pi.takumi.saito@site003.org" },
    ],
    dmTeam: [
      { name: "Anita Verma", email: "dm.anita.verma@cleartrial.com" },
      { name: "Noah Kim", email: "dm.noah.kim@cleartrial.com" },
    ],
    sponsorTeam: [
      { name: "Olivia Chen", email: "sponsor.olivia.chen@glucobalance.com" },
      { name: "Mark Alvarez", email: "sponsor.mark.alvarez@glucobalance.com" },
    ],
  },
  {
    id: "004",
    name: "Site 004",
    region: "Europe",
    country: "Germany",
    cecTeam: [
      { name: "Dr. Hannah Vogel", email: "cec.hannah.vogel@site004.org" },
      { name: "Dr. Lukas Weber", email: "cec.lukas.weber@site004.org" },
    ],
    craTeam: [
      { name: "Nina Schulz", email: "cra.nina.schulz@site004.org" },
      { name: "Felix Braun", email: "cra.felix.braun@site004.org" },
    ],
    piTeam: [
      { name: "Dr. Greta Hoffmann", email: "pi.greta.hoffmann@site004.org" },
      { name: "Dr. Jonas Keller", email: "pi.jonas.keller@site004.org" },
    ],
    dmTeam: [
      { name: "Anita Verma", email: "dm.anita.verma@cleartrial.com" },
      { name: "Noah Kim", email: "dm.noah.kim@cleartrial.com" },
    ],
    sponsorTeam: [
      { name: "Olivia Chen", email: "sponsor.olivia.chen@glucobalance.com" },
      { name: "Mark Alvarez", email: "sponsor.mark.alvarez@glucobalance.com" },
    ],
  },
];

const REGION_OPTIONS = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East"];
const COUNTRY_OPTIONS = ["United States", "United Kingdom", "Germany", "Japan", "India", "Canada", "France", "Spain"];

const INITIAL_QUERIES: QueryItem[] = [
  { id: "q1", subjectId: "001-001", description: "Missing ethnicity on Demographics", status: "open" },
  { id: "q2", subjectId: "001-002", description: "AE start date conflicts with visit date", status: "open" },
  { id: "q3", subjectId: "002-001", description: "Lab ALT outlier requires site confirmation", status: "open" },
  { id: "q4", subjectId: "003-001", description: "ECG time stamp mismatch", status: "open" },
];

const INITIAL_RECONCILIATION_ROWS: ReconcileRow[] = [
  { id: "r1", subjectId: "001-001", metric: "Hemoglobin", labValue: "12.8", edcValue: "12.8", matched: true, status: "pending" },
  { id: "r2", subjectId: "001-001", metric: "ALT", labValue: "48", edcValue: "44", matched: false, status: "pending" },
  { id: "r3", subjectId: "001-002", metric: "AST", labValue: "31", edcValue: "31", matched: true, status: "pending" },
  { id: "r4", subjectId: "002-001", metric: "Creatinine", labValue: "1.2", edcValue: "1.1", matched: false, status: "pending" },
  { id: "r5", subjectId: "003-001", metric: "Platelets", labValue: "198", edcValue: "198", matched: true, status: "pending" },
];

const MOCK_DATAHUB_EXTERNAL: DataHubRecord[] = [
  {
    id: "ext-1",
    projectId: "all",
    subjectId: "001-001",
    siteId: "001",
    visit: "Day 1",
    formType: "Randomization",
    fieldLabel: "Treatment Arm",
    value: "Arm A",
    source: "RTSM",
    queryStatus: "none",
    capturedAt: "2026-01-10T09:20:00.000Z",
  },
  {
    id: "ext-2",
    projectId: "all",
    subjectId: "001-002",
    siteId: "001",
    visit: "Day 7",
    formType: "Laboratory Results",
    fieldLabel: "ALT",
    value: "47",
    source: "Labs",
    queryStatus: "open",
    capturedAt: "2026-01-19T14:05:00.000Z",
  },
  {
    id: "ext-3",
    projectId: "all",
    subjectId: "002-001",
    siteId: "002",
    visit: "Day 14",
    formType: "PRO Diary",
    fieldLabel: "Pain Score",
    value: "4",
    source: "eCOA",
    queryStatus: "none",
    capturedAt: "2026-01-26T07:10:00.000Z",
  },
  {
    id: "ext-4",
    projectId: "all",
    subjectId: "003-001",
    siteId: "003",
    visit: "Day 21",
    formType: "Safety Follow-up",
    fieldLabel: "Serious AE",
    value: "No",
    source: "Safety",
    queryStatus: "none",
    capturedAt: "2026-02-03T11:40:00.000Z",
  },
];

type CommandHubContextType = {
  readinessScore: number;
  queries: QueryItem[];
  openQueriesCount: number;
  approveQuery: (id: string) => void;
  reconcileRows: ReconcileRow[];
  setReconcileRows: React.Dispatch<React.SetStateAction<ReconcileRow[]>>;
};

const CommandHubContext = createContext<CommandHubContextType | null>(null);

function useCommandHub() {
  const context = useContext(CommandHubContext);
  if (!context) {
    throw new Error("Command hub context is missing");
  }
  return context;
}

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

function toMinutes(value: string): number {
  const [hours, mins] = value.split(":").map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(mins)) return 0;
  return hours * 60 + mins;
}

function isInsideTimeRange(now: number, start: number, end: number): boolean {
  if (start === end) return false;
  if (start < end) return now >= start && now < end;
  return now >= start || now < end;
}

function computeNightMode(settings: ThemeSettings, now: Date): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (settings.mode === "manual") {
    return settings.manualDark;
  }

  if (settings.mode === "custom-time") {
    return isInsideTimeRange(nowMinutes, toMinutes(settings.customStart), toMinutes(settings.customEnd));
  }

  return isInsideTimeRange(nowMinutes, toMinutes(settings.sunset), toMinutes(settings.sunrise));
}

function createSeededLiveStudyData(projectId: string, subjectCount = 100) {
  const subjects: Subject[] = [];
  const entries: DataEntryRecord[] = [];
  const auditLogs: AuditLog[] = [];
  const siteCounters = new Map<string, number>();
  const completionBands = [1, 7, 14, 21];

  const pickValueByType = (field: CrfFieldTemplate, rowIndex: number, visitDay: number) => {
    if (field.fieldType === "restricted") {
      const options = field.allowedValues ?? ["Other"];
      return options[rowIndex % options.length] ?? "Other";
    }
    if (field.fieldType === "date") {
      const date = new Date(Date.UTC(2026, 0, 1 + Math.max(0, visitDay) + (rowIndex % 28)));
      return date.toISOString().slice(0, 10);
    }
    if (field.fieldType === "time") {
      const hour = 8 + (rowIndex % 8);
      const minute = rowIndex % 2 === 0 ? "00" : "30";
      return `${String(hour).padStart(2, "0")}:${minute}`;
    }
    if (field.fieldType === "number") {
      return String(60 + (rowIndex % 25));
    }
    if (field.fieldType === "other") {
      return `Other note ${rowIndex + 1}`;
    }
    return `${field.fieldLabel} value ${rowIndex + 1}`;
  };

  for (let i = 0; i < subjectCount; i += 1) {
    const site = SITE_DIRECTORY[i % SITE_DIRECTORY.length];
    const nextSiteSeq = (siteCounters.get(site.id) ?? 0) + 1;
    siteCounters.set(site.id, nextSiteSeq);

    const subjectId = `${site.id}-${String(nextSiteSeq).padStart(3, "0")}`;
    const enrolled = new Date(Date.UTC(2026, 0, 3 + (i % 45)));
    const dob = new Date(Date.UTC(1970 + (i % 25), i % 12, 1 + (i % 27)));

    subjects.push({
      id: subjectId,
      siteId: site.id,
      region: site.region,
      country: site.country,
      dob: dob.toISOString().slice(0, 10),
      enrolledAt: enrolled.toISOString().slice(0, 10),
    });

    const highestCompletedDay = completionBands[i % completionBands.length];
    const hasOpenQuery = i % 6 === 0;

    DAYS.filter((day) => day <= highestCompletedDay).forEach((day) => {
      const visit = `Day ${day}`;
      const scheduledCrfs = Object.keys(MATRIX).filter((crfName) => Boolean(MATRIX[crfName]?.[day]));

      scheduledCrfs.forEach((crfName) => {
        const fields = CRF_FIELD_LIBRARY[crfName] ?? [{ fieldLabel: "Other Field", fieldType: "other" as CrfFieldType }];

        fields.forEach((field, fieldIndex) => {
          const enteredAt = new Date(Date.UTC(2026, 1, 1 + i + Math.max(0, day), 8 + (fieldIndex % 6), (i * 7 + fieldIndex * 3) % 60));
          const value = pickValueByType(field, i + fieldIndex, day);
          const status: DataEntryRecord["status"] = hasOpenQuery && fieldIndex === 0 && day === highestCompletedDay ? "queried" : "submitted";
          const entryId = `${projectId}-${subjectId}-${day}-${crfName}-${field.fieldLabel}`.replace(/\s+/g, "-");

          entries.push({
            id: entryId,
            projectId,
            subjectId,
            visit,
            crf: crfName,
            fieldLabel: field.fieldLabel,
            value,
            enteredBy: `site.${site.id.toLowerCase()}@cleartrial.com`,
            enteredByRole: i % 2 === 0 ? "CRA" : "CRC",
            enteredAt: enteredAt.toISOString(),
            status,
            reviewNote: status === "queried" ? "Please verify against source notes" : undefined,
          });
        });
      });
    });

    auditLogs.push({
      id: `audit-seed-${projectId}-${subjectId}`,
      projectId,
      action: `Seeded subject ${subjectId} with chronological visit data`,
      by: "system.seed@cleartrial.com",
      timestamp: new Date(Date.UTC(2026, 1, 1, 6, i % 60)).toISOString(),
    });
  }

  return { subjects, entries, auditLogs };
}

function ClearTrialLogo({ onClick, variant = "default" }: { onClick: () => void; variant?: "default" | "stripe" }) {
  const isStripe = variant === "stripe";
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        isStripe
          ? "group inline-flex items-center gap-3 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-white backdrop-blur transition hover:bg-white/15"
          : "group inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition hover:border-blue-300 hover:bg-blue-50"
      }
      aria-label="Go to ClearTrial home"
      title="Go to home"
    >
      <span className={isStripe ? "grid h-10 w-10 place-items-center rounded-lg bg-white/20 shadow-sm" : "grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm"}>
        <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
          <circle cx="24" cy="24" r="18" className={isStripe ? "fill-white/25" : "fill-white/20"} />
          <path d="M8 24h7l4-8 6 16 5-10h10" className="stroke-white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </span>
      <span className="text-left">
        <span className={isStripe ? "block text-sm font-semibold text-white" : "block text-sm font-semibold text-slate-900 group-hover:text-blue-700"}>ClearTrial</span>
        <span className={isStripe ? "block text-[11px] uppercase tracking-wide text-white/85" : "block text-[11px] uppercase tracking-wide text-slate-500"}>Clinical EDC</span>
      </span>
    </button>
  );
}

export default function App() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    mode: "manual",
    manualDark: false,
    customStart: "21:00",
    customEnd: "06:00",
    sunrise: "06:30",
    sunset: "18:30",
  });
  const [clockTick, setClockTick] = useState(() => Date.now());
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

  useEffect(() => {
    const saved = window.localStorage.getItem("cleartrial-theme-settings");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as ThemeSettings;
      setThemeSettings((prev) => ({ ...prev, ...parsed }));
    } catch {
      // Ignore corrupt local state and continue with defaults.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("cleartrial-theme-settings", JSON.stringify(themeSettings));
  }, [themeSettings]);

  useEffect(() => {
    const timer = window.setInterval(() => setClockTick(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const isDarkMode = useMemo(() => computeNightMode(themeSettings, new Date(clockTick)), [themeSettings, clockTick]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const currentProjectId = currentProject?.id ?? "";
  const currentProjectDocs = currentProjectId ? tmfDocsByProject[currentProjectId] ?? [] : [];
  const currentSubjects = currentProjectId ? subjectsByProject[currentProjectId] ?? [] : [];
  const currentEntries = currentProjectId ? dataEntriesByProject[currentProjectId] ?? [] : [];
  const currentAuditLogs = currentProjectId ? auditLogsByProject[currentProjectId] ?? [] : [];

  useEffect(() => {
    // Preload live-study demo data so DM and oversight roles always have subject-level records to review.
    const liveProjectId = "p-003";
    const hasSubjects = (subjectsByProject[liveProjectId] ?? []).length > 0;
    const hasEntries = (dataEntriesByProject[liveProjectId] ?? []).length > 0;
    if (hasSubjects && hasEntries) return;

    const seeded = createSeededLiveStudyData(liveProjectId, 100);
    if (!hasSubjects) {
      setSubjectsByProject((prev) => ({ ...prev, [liveProjectId]: seeded.subjects }));
    }
    if (!hasEntries) {
      setDataEntriesByProject((prev) => ({ ...prev, [liveProjectId]: seeded.entries }));
    }
    setAuditLogsByProject((prev) => ({
      ...prev,
      [liveProjectId]: [...(prev[liveProjectId] ?? []), ...seeded.auditLogs],
    }));
  }, [subjectsByProject, dataEntriesByProject]);

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

  const allDocs = useMemo(() => Object.values(tmfDocsByProject).flat(), [tmfDocsByProject]);
  const myPendingDocs = useMemo(
    () => allDocs.filter((doc) => doc.assignedTo.includes(userEmail) && !doc.signedBy.includes(userEmail)),
    [allDocs, userEmail],
  );
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
        isDarkMode={isDarkMode}
        onToggleDark={() =>
          setThemeSettings((prev) => ({
            ...prev,
            mode: "manual",
            manualDark: !isDarkMode,
          }))
        }
        onSignIn={(email) => {
          setUserEmail(email);
          setIsAuthed(true);
          setView("dashboard");
        }}
      />
    );
  }

  return (
    <div className="app-shell min-h-screen bg-slate-100 text-slate-900 transition-colors">
      <header className="border-b border-slate-200 bg-white">
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 px-6 py-2">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
            <ClearTrialLogo
              variant="stripe"
              onClick={() => {
                setView("dashboard");
              }}
            />
            <div className="text-xs font-semibold uppercase tracking-wide text-white/90">Clinical Operations Command</div>
          </div>
        </div>
        <div
          className={`border-y px-6 py-4 ${
            isDarkMode
              ? "border-violet-800 bg-gradient-to-r from-violet-950 via-fuchsia-950 to-indigo-950"
              : "border-violet-200 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-indigo-50"
          }`}
        >
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? "text-violet-200" : "text-violet-700"}`}>ClearTrial Sequential Workflow</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h1 className={`text-2xl font-semibold ${isDarkMode ? "text-purple-50" : "text-slate-900"}`}>{currentProject?.title ?? "Projects"}</h1>
                {view === "phase2" && (
                  <label
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                      isDarkMode
                        ? "border-violet-700 bg-violet-900/45 text-violet-100"
                        : "border-violet-200 bg-white/85 text-violet-800"
                    }`}
                  >
                    <span>Role</span>
                    <select
                      value={phase2Role}
                      onChange={(e) => setPhase2Role(e.target.value as Phase2Role)}
                      className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                        isDarkMode
                          ? "border-violet-700 bg-violet-950 text-violet-100"
                          : "border-violet-200 bg-white text-violet-900"
                      }`}
                      aria-label="Current role"
                    >
                      <option value="CRA">CRA</option>
                      <option value="CRC">CRC</option>
                      <option value="PI">PI</option>
                      <option value="DM">DM</option>
                      <option value="Sponsor">Sponsor</option>
                    </select>
                  </label>
                )}
              </div>
                <p className={`text-xs ${isDarkMode ? "text-violet-200/80" : "text-slate-600"}`}>Signed in as {userEmail}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setThemeSettings((prev) => ({
                    ...prev,
                    mode: "manual",
                    manualDark: !isDarkMode,
                  }))
                }
                className={`inline-flex items-center justify-center rounded-full border p-2 shadow-sm backdrop-blur ${
                  isDarkMode
                    ? "border-violet-700 bg-violet-900/45 text-violet-100 hover:bg-violet-900/65"
                    : "border-violet-200 bg-white/85 text-violet-800 hover:bg-white"
                }`}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
              </button>
              <button
                onClick={() => {
                  setView("esource");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                  isDarkMode
                    ? "border-violet-700 bg-violet-900/45 text-violet-100 hover:bg-violet-900/65"
                    : "border-violet-200 bg-white/85 text-violet-800 hover:bg-white"
                }`}
              >
                eSource
              </button>
              <button
                onClick={() => {
                  setView("sdv");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                  isDarkMode
                    ? "border-violet-700 bg-violet-900/45 text-violet-100 hover:bg-violet-900/65"
                    : "border-violet-200 bg-white/85 text-violet-800 hover:bg-white"
                }`}
              >
                SDV
              </button>
              <button
                onClick={() => {
                  setView("medicalcoding");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                  isDarkMode
                    ? "border-violet-700 bg-violet-900/45 text-violet-100 hover:bg-violet-900/65"
                    : "border-violet-200 bg-white/85 text-violet-800 hover:bg-white"
                }`}
              >
                Medical Coding
              </button>
              <button
                onClick={() => {
                  setView("datalock");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                  isDarkMode
                    ? "border-violet-700 bg-violet-900/45 text-violet-100 hover:bg-violet-900/65"
                    : "border-violet-200 bg-white/85 text-violet-800 hover:bg-white"
                }`}
              >
                Data Lock
              </button>
              <button
                onClick={() => {
                  setView("multisourcedata");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                  isDarkMode
                    ? "border-violet-700 bg-violet-900/45 text-violet-100 hover:bg-violet-900/65"
                    : "border-violet-200 bg-white/85 text-violet-800 hover:bg-white"
                }`}
              >
                Multi-Source Data
              </button>
              <button
                onClick={() => {
                  setView("automatedreconciliation");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                  isDarkMode
                    ? "border-violet-700 bg-violet-900/45 text-violet-100 hover:bg-violet-900/65"
                    : "border-violet-200 bg-white/85 text-violet-800 hover:bg-white"
                }`}
              >
                Reconciliation
              </button>
              <button
                onClick={() => {
                  setView("studyhealthdashboards");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                  isDarkMode
                    ? "border-violet-700 bg-violet-900/45 text-violet-100 hover:bg-violet-900/65"
                    : "border-violet-200 bg-white/85 text-violet-800 hover:bg-white"
                }`}
              >
                Study Health
              </button>
              <button
                onClick={() => {
                  setView("changedetection");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                  isDarkMode
                    ? "border-violet-700 bg-violet-900/45 text-violet-100 hover:bg-violet-900/65"
                    : "border-violet-200 bg-white/85 text-violet-800 hover:bg-white"
                }`}
              >
                Change Detection
              </button>
              <button
                onClick={() => {
                  setView("complianceaudit");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                  isDarkMode
                    ? "border-violet-700 bg-violet-900/45 text-violet-100 hover:bg-violet-900/65"
                    : "border-violet-200 bg-white/85 text-violet-800 hover:bg-white"
                }`}
              >
                Compliance & Audit
              </button>
              <button
                onClick={() => {
                  if (!currentProject && projects.length > 0) {
                    setCurrentProject(projects[0]);
                  }
                  setView("tmf");
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
                  isDarkMode
                    ? "border-violet-700 bg-violet-900/45 text-violet-100 hover:bg-violet-900/65"
                    : "border-violet-200 bg-white/85 text-violet-800 hover:bg-white"
                }`}
              >
                TMF Portal {myPendingDocs.length > 0 ? `(${myPendingDocs.length})` : ""}
              </button>
              {envBadge}
            </div>
          </div>
        </div>
      </header>

      <div
        className={`border-b px-6 py-2 ${
          isDarkMode
            ? "border-violet-800 bg-gradient-to-r from-violet-950 via-fuchsia-950 to-indigo-950"
            : "border-violet-200 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-indigo-50"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full border px-3 py-1 font-semibold ${isDarkMode ? "border-violet-700 bg-violet-900/45 text-violet-100" : "border-violet-200 bg-white/80 text-violet-700"}`}>Build Agent: Idle</span>
          <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 font-semibold text-amber-700 dark:border-amber-500/50 dark:bg-amber-500/15 dark:text-amber-300">Cleaning Agent: Active (42 queries)</span>
          <span className={`rounded-full border px-3 py-1 font-semibold ${isDarkMode ? "border-violet-700 bg-violet-900/35 text-violet-200" : "border-fuchsia-200 bg-white/80 text-fuchsia-700"}`}>Simulation Agent: Standby</span>
        </div>
      </div>

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

        {view === "esource" && (
          <Suspense fallback={<div>Loading eSource...</div>}>
            <ESource onBack={() => setView("dashboard")} />
          </Suspense>
        )}

        {view === "sdv" && (
          <Suspense fallback={<div>Loading SDV...</div>}>
            <SDV onBack={() => setView("dashboard")} />
          </Suspense>
        )}

        {view === "medicalcoding" && (
          <Suspense fallback={<div>Loading Medical Coding...</div>}>
            <MedicalCoding onBack={() => setView("dashboard")} />
          </Suspense>
        )}

        {view === "datalock" && (
          <Suspense fallback={<div>Loading Data Lock...</div>}>
            <DataLock onBack={() => setView("dashboard")} />
          </Suspense>
        )}

        {view === "multisourcedata" && (
          <Suspense fallback={<div>Loading Multi-Source Data...</div>}>
            <MultiSourceData onBack={() => setView("dashboard")} />
          </Suspense>
        )}

        {view === "automatedreconciliation" && (
          <Suspense fallback={<div>Loading Automated Reconciliation...</div>}>
            <AutomatedReconciliation onBack={() => setView("dashboard")} />
          </Suspense>
        )}

        {view === "studyhealthdashboards" && (
          <Suspense fallback={<div>Loading Study Health Dashboards...</div>}>
            <StudyHealthDashboards onBack={() => setView("dashboard")} />
          </Suspense>
        )}

        {view === "changedetection" && (
          <Suspense fallback={<div>Loading Change Detection...</div>}>
            <ChangeDetection onBack={() => setView("dashboard")} />
          </Suspense>
        )}

        {view === "complianceaudit" && (
          <Suspense fallback={<div>Loading Compliance & Audit...</div>}>
            <ComplianceAudit onBack={() => setView("dashboard")} />
          </Suspense>
        )}
      </main>

      <ThemeScheduler
        open={false}
        settings={themeSettings}
        isDarkMode={isDarkMode}
        onTogglePanel={() => void 0}
        onSettingsChange={setThemeSettings}
        showTrigger={false}
      />

      <footer className={`border-t py-4 px-6 mt-10 transition-colors ${isDarkMode ? "border-slate-800 bg-slate-950 text-slate-400" : "border-slate-200 bg-white text-slate-500"}`}>
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-xs font-semibold tracking-wide uppercase">© 2026 ClearTrial. All rights reserved.</p>
            <p className="text-[10px] opacity-75">Proprietary Technology & IP Protected</p>
          </div>
          
          <a 
            href="https://www.linkedin.com/in/rahulayyappan/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all transform hover:scale-105 active:scale-95 ${
              isDarkMode 
                ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20" 
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-md"
            }`}
          >
            <svg className="h-4 w-4 fill-current transition-transform group-hover:rotate-12" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            Built by Rahul Ayyappan
          </a>
        </div>
      </footer>
    </div>
  );
}

function ThemeScheduler({
  open,
  settings,
  isDarkMode,
  onTogglePanel,
  onSettingsChange,
  showTrigger = true,
}: {
  open: boolean;
  settings: ThemeSettings;
  isDarkMode: boolean;
  onTogglePanel: () => void;
  onSettingsChange: (value: ThemeSettings | ((prev: ThemeSettings) => ThemeSettings)) => void;
  showTrigger?: boolean;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {showTrigger && (
        <button
          onClick={onTogglePanel}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <SlidersHorizontal size={16} />
          Theme
          <span className={`rounded-full px-2 py-0.5 text-xs ${isDarkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
            {isDarkMode ? "Dark" : "Light"}
          </span>
        </button>
      )}

      {open && (
        <div className="w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Theme Scheduler</p>
            <button
              onClick={() =>
                onSettingsChange((prev) => ({
                  ...prev,
                  mode: "manual",
                  manualDark: !isDarkMode,
                }))
              }
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${isDarkMode ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
              Toggle Now
            </button>
          </div>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Mode</label>
          <select
            value={settings.mode}
            onChange={(e) => onSettingsChange((prev) => ({ ...prev, mode: e.target.value as ThemeMode }))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="manual">Manual (On/Off)</option>
            <option value="custom-time">Custom Time Window</option>
            <option value="sun-cycle">Sunrise / Sunset</option>
          </select>

          {settings.mode === "manual" && (
            <button
              onClick={() => onSettingsChange((prev) => ({ ...prev, manualDark: !prev.manualDark }))}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${settings.manualDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"}`}
            >
              {settings.manualDark ? <Moon size={16} /> : <Sun size={16} />}
              Dark Mode {settings.manualDark ? "On" : "Off"}
            </button>
          )}

          {settings.mode === "custom-time" && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-slate-600">
                <span className="mb-1 block">Start</span>
                <input
                  type="time"
                  value={settings.customStart}
                  onChange={(e) => onSettingsChange((prev) => ({ ...prev, customStart: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-medium text-slate-600">
                <span className="mb-1 block">End</span>
                <input
                  type="time"
                  value={settings.customEnd}
                  onChange={(e) => onSettingsChange((prev) => ({ ...prev, customEnd: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                />
              </label>
            </div>
          )}

          {settings.mode === "sun-cycle" && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-slate-600">
                <span className="mb-1 block">Sunrise</span>
                <input
                  type="time"
                  value={settings.sunrise}
                  onChange={(e) => onSettingsChange((prev) => ({ ...prev, sunrise: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-medium text-slate-600">
                <span className="mb-1 block">Sunset</span>
                <input
                  type="time"
                  value={settings.sunset}
                  onChange={(e) => onSettingsChange((prev) => ({ ...prev, sunset: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
                />
              </label>
            </div>
          )}

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            <p className="font-semibold">Current Status</p>
            <p className="mt-1 inline-flex items-center gap-1">
              <Clock3 size={12} />
              {settings.mode === "manual"
                ? `Manual mode: ${settings.manualDark ? "Dark" : "Light"}`
                : settings.mode === "custom-time"
                  ? `Dark window: ${settings.customStart} - ${settings.customEnd}`
                  : `Sun cycle: dark from ${settings.sunset} to ${settings.sunrise}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function LoginView({
  environment,
  setEnvironment,
  isDarkMode,
  onToggleDark,
  onSignIn,
}: {
  environment: EnvironmentType;
  setEnvironment: (env: EnvironmentType) => void;
  isDarkMode: boolean;
  onToggleDark: () => void;
  onSignIn: (email: string) => void;
}) {
  const [email, setEmail] = useState("user@cleartrial.com");
  const [username, setUsername] = useState("cleartrial.user");
  const [password, setPassword] = useState("password");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gateway</p>
          <button
            onClick={onToggleDark}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-50"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>
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

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">© 2026 ClearTrial. All rights reserved.</p>
            <p className="text-[10px] text-slate-400">IP SECURED & MAPPED</p>
          </div>
          
          <a 
            href="https://www.linkedin.com/in/rahulayyappan/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-full bg-slate-900 border border-slate-700 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800 hover:scale-105 active:scale-95 shadow-lg shadow-slate-200"
          >
            <svg className="h-4 w-4 fill-current group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
            Built by Rahul Ayyappan
          </a>
        </div>
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
  const [queries, setQueries] = useState<QueryItem[]>(INITIAL_QUERIES);
  const [readinessScore, setReadinessScore] = useState(68);
  const [reconcileRows, setReconcileRows] = useState<ReconcileRow[]>(INITIAL_RECONCILIATION_ROWS);

  const openQueriesCount = queries.filter((query) => query.status === "open").length;

  const approveQuery = (id: string) => {
    setQueries((prev) => prev.map((query) => (query.id === id ? { ...query, status: "approved" } : query)));
    setReadinessScore((prev) => Math.min(99, prev + 3));
  };

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
        return <TrialSandboxView />;
      case "compare":
        return <CompareView protocol={PROTOCOL_DATA} />;
      case "data-hub":
        return <DataHubView />;
      case "query-manager":
        return <QueryManagerView />;
      case "operations-monitor":
        return <OperationsMonitorView />;
      case "study-differences":
        return <StudyDifferencesView />;
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
    <CommandHubContext.Provider
      value={{
        readinessScore,
        queries,
        openQueriesCount,
        approveQuery,
        reconcileRows,
        setReconcileRows,
      }}
    >
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm">
      <div className="flex min-h-[740px]">
        <aside className="w-80 border-r border-rose-200 bg-rose-50/60 p-4">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-rose-700">faro command center</p>

          <p className="mb-2 text-xs font-semibold uppercase text-rose-700">Design Hub (Sections 1-6)</p>
          <div className="space-y-1">
            {DESIGN_HUB_ITEMS.map((item) => (
              <SidebarButton key={item.key} item={item} active={activeScreen === item.key} onClick={() => setActiveScreen(item.key)} />
            ))}
          </div>

          <p className="mb-2 mt-5 text-xs font-semibold uppercase text-rose-700">Intelligence Hub (Sections 10-12)</p>
          <div className="space-y-1">
            {INTELLIGENCE_HUB_ITEMS.map((item) => (
              <SidebarButton key={item.key} item={item} active={activeScreen === item.key} onClick={() => setActiveScreen(item.key)} />
            ))}
          </div>

          <p className="mb-2 mt-5 text-xs font-semibold uppercase text-rose-700">Data Views</p>
          <div className="space-y-1">
            {DATA_ITEMS.map((item) => (
              <SidebarButton key={item.key} item={item} active={activeScreen === item.key} onClick={() => setActiveScreen(item.key)} />
            ))}
          </div>
        </aside>

        <section className="flex-1 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button onClick={onBack} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">
              <ArrowLeft size={16} />
              Back To Protocol Ingestion
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={aiAlignAll}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-500"
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
    </CommandHubContext.Provider>
  );
}

function SidebarButton({ item, active, onClick }: { item: SidebarItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
        active ? "border border-rose-300 bg-rose-100 text-rose-700" : "border border-transparent text-slate-700 hover:bg-rose-50"
      }`}
    >
      <Icon size={16} />
      <span>{item.label}</span>
    </button>
  );
}

function DataHubView() {
  const { reconcileRows, setReconcileRows, readinessScore } = useCommandHub();
  const [running, setRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjectMetrics = useMemo(() => {
    const grouped = new Map<string, { total: number; matched: number }>();
    reconcileRows.forEach((row) => {
      const current = grouped.get(row.subjectId) ?? { total: 0, matched: 0 };
      current.total += 1;
      if (row.matched) current.matched += 1;
      grouped.set(row.subjectId, current);
    });
    return Array.from(grouped.entries()).map(([subjectId, values]) => ({
      subjectId,
      percent: Math.round((values.matched / Math.max(values.total, 1)) * 100),
    }));
  }, [reconcileRows]);

  const patientNarrative = useMemo(() => {
    if (!selectedSubject) return null;
    const agent = simulationData.agent_swarm.find((item) =>
      selectedSubject === "001-001" ? item.name.includes("Elena") : item.name.includes("Marcus"),
    );
    return {
      title: `${agent?.name ?? "Patient"} - ${selectedSubject === "001-001" ? "Medium" : "High"} Risk`,
      story: agent?.narrative ?? "Narrative not available",
    };
  }, [selectedSubject]);

  const runAutoReconcile = () => {
    setRunning(true);
    window.setTimeout(() => {
      setReconcileRows((prev) => prev.map((row) => ({ ...row, status: row.matched ? "verified" : row.status })));
      setRunning(false);
    }, 1600);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">ClearTrial Data Hub</h2>
            <p className="text-sm text-slate-600">Unified reconciliation workbench for EDC, Labs, and eCOA.</p>
          </div>
          <button
            onClick={runAutoReconcile}
            disabled={running}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {running ? "Agent-01 Reconciling..." : "Run Auto-Reconcile"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Raw Lab Data</p>
          <div className="space-y-2 text-xs">
            {reconcileRows.map((row) => (
              <div key={`lab-${row.id}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="font-semibold text-slate-800">{row.subjectId} • {row.metric}</p>
                <p className="text-slate-600">{row.labValue}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">EDC Entries</p>
          <div className="space-y-2 text-xs">
            {reconcileRows.map((row) => (
              <div
                key={`edc-${row.id}`}
                className={`rounded-lg border px-3 py-2 ${row.matched ? "border-slate-200 bg-slate-50" : "border-amber-300 bg-amber-50"}`}
              >
                <p className="font-semibold text-slate-800">{row.subjectId} • {row.metric}</p>
                <p className={`${row.matched ? "text-slate-600" : "text-amber-800"}`}>{row.edcValue}</p>
                <p className="mt-1 text-[11px] text-blue-300">{row.status === "verified" ? "Verified by Agent-01" : "Pending"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Clean Patient Tracker</p>
          <p className="mt-1 text-xs text-slate-600">Data Readiness {readinessScore}%</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {subjectMetrics.map((subject) => (
              <button
                key={subject.subjectId}
                onClick={() => setSelectedSubject(subject.subjectId)}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"
              >
                <div
                  className="mx-auto h-12 w-12 rounded-full"
                  style={{ background: `conic-gradient(#2563EB ${subject.percent * 3.6}deg, #1E293B 0deg)` }}
                >
                  <div className="m-1 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-slate-700">
                    {subject.percent}%
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-700">{subject.subjectId}</p>
              </button>
            ))}
          </div>
          {patientNarrative && (
            <div className="mt-3 rounded-xl border border-blue-500/50 bg-blue-500/10 p-3 text-xs text-blue-100">
              <p className="font-semibold">{patientNarrative.title}</p>
              <p className="mt-1">{patientNarrative.story}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Agent Link Visual</p>
        <svg viewBox="0 0 1200 120" className="h-20 w-full">
          {reconcileRows.slice(0, 5).map((row, index) => {
            const y = 15 + index * 22;
            return (
              <g key={`line-${row.id}`}>
                <line x1="120" y1={y} x2="1080" y2={y} stroke={row.matched ? "#38BDF8" : "#F59E0B"} strokeWidth="2" strokeDasharray="6 5" className="animate-pulse" />
                <circle cx="120" cy={y} r="3" fill="#38BDF8" />
                <circle cx="1080" cy={y} r="3" fill={row.matched ? "#22C55E" : "#F59E0B"} />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function QueryManagerView() {
  const { queries, approveQuery } = useCommandHub();

  const incrementReadinessFromClose = (count: number) => {
    const openItems = queries.filter((item) => item.status === "open").slice(0, count);
    openItems.forEach((item) => approveQuery(item.id));
  };

  return (
    <Suspense fallback={<ModuleLoadingCard title="Query Manager" subtitle="Loading query workflow and assignment queues..." />}>
      <QueryManager onCloseForReadiness={incrementReadinessFromClose} />
    </Suspense>
  );
}

function OperationsMonitorView() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-2xl font-semibold text-slate-900">Operations Monitor</h2>
      <p className="mt-2 text-sm text-slate-600">High-density operational telemetry for enrollment, reconciliation latency, and site backlog.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {[
          ["EDC Backlog", "3 days"],
          ["Lab Feed Delay", "41 min"],
          ["eCOA Sync", "Healthy"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs uppercase text-slate-500">{label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrialSandboxView() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-2xl font-semibold text-slate-900">Insights & Faro Predict</h2>
        <p className="mt-1 text-sm text-slate-600">Faro Interview: I detected a 20% dropout risk in rural sites. Should I prioritize cost or speed in this simulation?</p>
      </div>
      <Suspense fallback={<ModuleLoadingCard title="Insights & Faro Predict" subtitle="Loading simulation agents and predictive models..." />}>
        <FaroPredict />
      </Suspense>
    </div>
  );
}

function ModuleLoadingCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-500" />
      </div>
    </div>
  );
}

function StudyDifferencesView() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Study Differences Report</h2>
        <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Generate Report</button>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Human Design</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>Visit burden fixed across all sites</li>
            <li>Static AE surveillance cadence</li>
            <li>Manual lab reconciliation path</li>
          </ul>
        </div>
        <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-3">
          <p className="text-xs uppercase tracking-wide text-blue-300">AI-Optimized Design</p>
          <ul className="mt-2 space-y-1 text-sm text-blue-100">
            <li>Adaptive visit cadence by risk persona</li>
            <li>AE-triggered dynamic checks</li>
            <li>Agent-verified reconciliation loop</li>
          </ul>
        </div>
      </div>
    </div>
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
  void onRoleChange;
  const [siteId, setSiteId] = useState("001");
  const [region, setRegion] = useState("North America");
  const [country, setCountry] = useState("United States");
  const [dob, setDob] = useState("1991-04-03");
  const [enrolledAt, setEnrolledAt] = useState("2026-01-10");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectSiteFilter, setSubjectSiteFilter] = useState("all");
  const [subjectFromSite, setSubjectFromSite] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedVisit, setSelectedVisit] = useState("Day 1");
  const [selectedCrfForEntry, setSelectedCrfForEntry] = useState("");
  const [selectedFieldForAudit, setSelectedFieldForAudit] = useState("");
  const [phase2Section, setPhase2Section] = useState<"enrollment" | "entry" | "datahub" | "reporting">("datahub");
  const [dataHubCategory, setDataHubCategory] = useState<"none" | "study-summary" | "schedule-assessments" | "both">("none");
  const [fieldEntryValues, setFieldEntryValues] = useState<Record<string, string>>({});
  const [crfEditModeMap, setCrfEditModeMap] = useState<Record<string, boolean>>({});
  const [entryError, setEntryError] = useState("");
  const [formStatusMessage, setFormStatusMessage] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  const siteRoles: Phase2Role[] = ["CRA", "CRC"];
  const reviewRoles: Phase2Role[] = ["PI", "DM", "Sponsor"];
  const canEnterData = siteRoles.includes(role);
  const canReviewData = reviewRoles.includes(role);

  useEffect(() => {
    // Keep Subject Enrollment and Data Entry Portal visible only for CRA/CRC.
    if (!canEnterData && (phase2Section === "entry" || phase2Section === "enrollment")) {
      setPhase2Section("datahub");
    }
  }, [canEnterData, phase2Section]);

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
  const selectedSubjectSite = useMemo(() => {
    if (!selectedSubject) return null;
    return SITE_DIRECTORY.find((site) => site.id === selectedSubject.siteId) ?? null;
  }, [selectedSubject]);

  const filteredSubjects = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase();
    if (!query) return subjects;
    return subjects.filter((subject) => subject.id.toLowerCase().includes(query));
  }, [subjects, subjectSearch]);

  const enrolledSiteOptions = useMemo(() => {
    const uniqueSites = Array.from(new Set(subjects.map((subject) => subject.siteId)));
    return uniqueSites
      .map(
        (id) =>
          SITE_DIRECTORY.find((site) => site.id === id) ?? {
            id,
            name: `Site ${id}`,
            region: "Unknown",
            country: "Unknown",
            cecTeam: [],
            craTeam: [],
            piTeam: [],
            dmTeam: [],
            sponsorTeam: [],
          },
      )
      .sort((a, b) => a.id.localeCompare(b.id));
  }, [subjects]);

  const subjectsForSelectedSite = useMemo(() => {
    if (subjectSiteFilter === "all") {
      return subjects;
    }
    return subjects.filter((subject) => subject.siteId === subjectSiteFilter);
  }, [subjects, subjectSiteFilter]);

  useEffect(() => {
    if (subjectsForSelectedSite.length === 0) {
      setSubjectFromSite("");
      return;
    }
    if (!subjectFromSite || !subjectsForSelectedSite.some((subject) => subject.id === subjectFromSite)) {
      setSubjectFromSite(subjectsForSelectedSite[0].id);
    }
  }, [subjectsForSelectedSite, subjectFromSite]);

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

  // Phase 2 header metrics for DataHub view so operational cards sit next to the main title block.
  const phase2DataHubRecords = useMemo<DataHubRecord[]>(() => {
    const edcRows: DataHubRecord[] = entries.map((entry) => ({
      id: `edc-${entry.id}`,
      projectId: entry.projectId,
      subjectId: entry.subjectId,
      siteId: entry.subjectId.split("-")[0] ?? "001",
      visit: entry.visit,
      formType: entry.crf,
      fieldLabel: entry.fieldLabel,
      value: entry.value,
      source: "EDC",
      queryStatus: entry.status === "queried" ? "open" : "none",
      capturedAt: entry.enteredAt,
    }));

    const externalRows = project
      ? MOCK_DATAHUB_EXTERNAL.map((record) => ({ ...record, projectId: project.id }))
      : MOCK_DATAHUB_EXTERNAL;

    return [...edcRows, ...externalRows];
  }, [entries, project]);

  const phase2DataHubSummary = useMemo(() => {
    const total = phase2DataHubRecords.length;
    const queryCount = phase2DataHubRecords.filter((row) => row.queryStatus === "open").length;
    const uniqueSubjects = new Set(phase2DataHubRecords.map((row) => row.subjectId)).size;
    const uniqueForms = new Set(phase2DataHubRecords.map((row) => row.formType)).size;
    const sourceCounts = phase2DataHubRecords.reduce<Record<string, number>>((acc, row) => {
      acc[row.source] = (acc[row.source] ?? 0) + 1;
      return acc;
    }, {});

    return {
      uniqueSubjects,
      uniqueForms,
      queryCount,
      sourceCount: Object.keys(sourceCounts).length,
      completeness: total === 0 ? 0 : Math.round((phase2DataHubRecords.filter((row) => row.value !== "" && row.value !== "-").length / total) * 100),
      queryRate: total === 0 ? 0 : Number(((queryCount / total) * 100).toFixed(1)),
      sourceDistribution: Object.entries(sourceCounts)
        .map(([source, count]) => `${source}: ${count}`)
        .join(" | "),
    };
  }, [phase2DataHubRecords]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button onClick={onBackToDashboard} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> Back To Dashboard
      </button>

      <div className="mb-4 space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-3xl font-semibold">Phase 2 - Live Environment</h2>
              <p className="text-slate-600">{project?.title ?? "Project"} is now live.</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">LIVE</span>
          </div>

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Subject Navigation</p>
            <div className="mt-1.5 grid gap-2 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Subject Search
                <input
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                  placeholder="001-002"
                />
              </label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Enrolled Site
                <select
                  value={subjectSiteFilter}
                  onChange={(event) => {
                    setSubjectSiteFilter(event.target.value);
                    setSubjectFromSite("");
                  }}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                >
                  <option value="all">All Enrolled Sites</option>
                  {enrolledSiteOptions.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.id} - {site.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Enrolled Subject
                <select
                  value={subjectFromSite}
                  onChange={(event) => setSubjectFromSite(event.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                >
                  {subjectsForSelectedSite.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.id}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => {
                  const target = subjectSearch.trim() ? filteredSubjects[0]?.id : subjectFromSite;
                  if (!target) return;
                  setSelectedSubjectId(target);
                  setPhase2Section(canEnterData ? "entry" : "datahub");
                }}
                className="self-end rounded-md border border-blue-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-blue-700"
              >
                Go
              </button>
            </div>
            {subjectSearch.trim() && filteredSubjects.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {filteredSubjects.slice(0, 4).map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => {
                      setSelectedSubjectId(subject.id);
                      setPhase2Section(canEnterData ? "entry" : "datahub");
                    }}
                    className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                  >
                    {subject.id}
                  </button>
                ))}
              </div>
            )}
            {subjectSearch.trim() && filteredSubjects.length === 0 && <p className="mt-1.5 text-[11px] text-slate-500">No match.</p>}
          </div>

          <div className="mt-2 grid gap-2 md:grid-cols-[auto_auto_minmax(220px,320px)] md:items-end">
            <button
              onClick={() => setPhase2Section("datahub")}
              className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${phase2Section === "datahub" ? "bg-blue-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
            >
              DataHub
            </button>
            <button
              onClick={() => setPhase2Section("reporting")}
              className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${phase2Section === "reporting" ? "bg-blue-600 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
            >
              Reporting
            </button>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Category Group
              <select
                value={dataHubCategory}
                onChange={(event) => setDataHubCategory(event.target.value as "none" | "study-summary" | "schedule-assessments" | "both")}
                disabled={phase2Section !== "datahub"}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="none">Select View</option>
                <option value="study-summary">Study Summary</option>
                <option value="schedule-assessments">Schedule Of Assessments View</option>
                <option value="both">Both</option>
              </select>
            </label>
          </div>
        </div>

        {(phase2Section !== "datahub" || dataHubCategory === "study-summary" || dataHubCategory === "both") && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Enrolled" value="156" icon={<Users size={18} />} />
            <StatCard label="Open Queries" value="23" icon={<Info size={18} />} />
            <StatCard label="Sites Active" value="12" icon={<FlaskConical size={18} />} />
            <StatCard label="Data Points" value="18,942" icon={<BarChart3 size={18} />} />
          </div>
        )}

        {phase2Section === "datahub" && (dataHubCategory === "study-summary" || dataHubCategory === "both") && (
          <Fragment>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Subjects" value={String(phase2DataHubSummary.uniqueSubjects)} icon={<Users size={18} />} />
              <StatCard label="Forms Completed" value={String(phase2DataHubSummary.uniqueForms)} icon={<CheckCircle2 size={18} />} />
              <StatCard label="Queries Open" value={String(phase2DataHubSummary.queryCount)} icon={<Info size={18} />} />
              <StatCard label="Data Sources" value={String(phase2DataHubSummary.sourceCount)} icon={<FlaskConical size={18} />} />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Data Completeness %</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{phase2DataHubSummary.completeness}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Query Rate</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{phase2DataHubSummary.queryRate}%</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source Distribution</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{phase2DataHubSummary.sourceDistribution}</p>
              </div>
            </div>
          </Fragment>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {canEnterData && (
            <>
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
            </>
          )}
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
                          {canEnterData && (
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
                          )}
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
        ) : phase2Section === "entry" ? (
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
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700">
                    <span className="font-semibold">{selectedSubject.id}</span>
                    <span>Site Name: <span className="font-semibold">{selectedSubjectSite?.name ?? `Site ${selectedSubject.siteId}`}</span></span>
                    <span>Site ID: {selectedSubject.siteId}</span>
                    <span>{selectedSubject.region}, {selectedSubject.country}</span>
                  </div>
                  {selectedSubjectSite && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <label className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[10px]">
                        <span className="font-semibold text-slate-600">CEC</span>
                        <select className="max-w-[170px] bg-transparent text-[10px]">
                          {selectedSubjectSite.cecTeam.map((member) => (
                            <option key={member.email} value={member.email}>{member.name} • {member.email}</option>
                          ))}
                        </select>
                      </label>
                      <label className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[10px]">
                        <span className="font-semibold text-slate-600">CRA</span>
                        <select className="max-w-[170px] bg-transparent text-[10px]">
                          {selectedSubjectSite.craTeam.map((member) => (
                            <option key={member.email} value={member.email}>{member.name} • {member.email}</option>
                          ))}
                        </select>
                      </label>
                      <label className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[10px]">
                        <span className="font-semibold text-slate-600">PI</span>
                        <select className="max-w-[170px] bg-transparent text-[10px]">
                          {selectedSubjectSite.piTeam.map((member) => (
                            <option key={member.email} value={member.email}>{member.name} • {member.email}</option>
                          ))}
                        </select>
                      </label>
                      <label className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[10px]">
                        <span className="font-semibold text-slate-600">DM</span>
                        <select className="max-w-[170px] bg-transparent text-[10px]">
                          {selectedSubjectSite.dmTeam.map((member) => (
                            <option key={member.email} value={member.email}>{member.name} • {member.email}</option>
                          ))}
                        </select>
                      </label>
                      <label className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[10px]">
                        <span className="font-semibold text-slate-600">Sponsor</span>
                        <select className="max-w-[170px] bg-transparent text-[10px]">
                          {selectedSubjectSite.sponsorTeam.map((member) => (
                            <option key={member.email} value={member.email}>{member.name} • {member.email}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
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
        ) : phase2Section === "datahub" ? (
          <Phase2DataHubView
            project={project}
            subjects={subjects}
            entries={entries}
            auditLogs={auditLogs}
            role={role}
            dataHubCategory={dataHubCategory}
            selectedSubjectId={selectedSubjectId}
          />
        ) : phase2Section === "reporting" ? (
          <Phase2ReportingView project={project} finalizedCrfs={finalizedCrfs} entries={entries} />
        ) : (
          <Phase2ReportingView project={project} finalizedCrfs={finalizedCrfs} entries={entries} />
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

function Phase2DataHubView({
  project,
  subjects,
  entries,
  auditLogs,
  role,
  dataHubCategory,
  selectedSubjectId,
}: {
  project: Project | null;
  subjects: Subject[];
  entries: DataEntryRecord[];
  auditLogs: AuditLog[];
  role: "CRA" | "DM" | "PI" | "CRC" | "Sponsor";
  dataHubCategory: "none" | "study-summary" | "schedule-assessments" | "both";
  selectedSubjectId: string;
}) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [dmSelectedVisit, setDmSelectedVisit] = useState("Day -1");
  const [dmSelectedCrf, setDmSelectedCrf] = useState("");
  const [dmSelectedField, setDmSelectedField] = useState("");

  const scheduleActivities = useMemo(() => {
    if (!selectedSubjectId) return Object.keys(MATRIX);
    const subjectCrfs = Array.from(
      new Set(entries.filter((entry) => entry.subjectId === selectedSubjectId).map((entry) => entry.crf)),
    );
    return subjectCrfs.length > 0 ? subjectCrfs : Object.keys(MATRIX);
  }, [entries, selectedSubjectId]);

  const siteBySubject = useMemo(() => {
    const map = new Map<string, string>();
    subjects.forEach((subject) => map.set(subject.id, subject.siteId));
    return map;
  }, [subjects]);

  const edcRecords = useMemo<DataHubRecord[]>(() => {
    return entries.map((entry) => ({
      id: `edc-${entry.id}`,
      projectId: entry.projectId,
      subjectId: entry.subjectId,
      siteId: siteBySubject.get(entry.subjectId) ?? entry.subjectId.split("-")[0] ?? "001",
      visit: entry.visit,
      formType: entry.crf,
      fieldLabel: entry.fieldLabel,
      value: entry.value,
      source: "EDC",
      queryStatus: entry.status === "queried" ? "open" : "none",
      capturedAt: entry.enteredAt,
    }));
  }, [entries, siteBySubject]);

  const externalRecords = useMemo(() => {
    if (!project) return MOCK_DATAHUB_EXTERNAL;
    return MOCK_DATAHUB_EXTERNAL.map((record) => ({
      ...record,
      projectId: project.id,
    }));
  }, [project]);

  const allRecords = useMemo(() => {
    const scopedExternal = externalRecords.filter((record) => !project || record.projectId === project.id || record.projectId === "all");
    return [...edcRecords, ...scopedExternal].sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
  }, [edcRecords, externalRecords, project]);

  const scheduleHeatmap = useMemo(() => {
    const countMap = new Map<string, number>();
    allRecords.forEach((record) => {
      const key = `${record.formType}::${record.visit}`;
      countMap.set(key, (countMap.get(key) ?? 0) + 1);
    });
    return countMap;
  }, [allRecords]);

  const dmVisitSequence = useMemo(() => {
    if (!selectedSubjectId) return DAYS.map((day) => `Day ${day}`);
    const visitLabels = Array.from(
      new Set(entries.filter((entry) => entry.subjectId === selectedSubjectId).map((entry) => entry.visit)),
    );
    if (visitLabels.length === 0) return DAYS.map((day) => `Day ${day}`);
    return visitLabels.sort((a, b) => {
      const dayA = Number(a.replace("Day", "").trim());
      const dayB = Number(b.replace("Day", "").trim());
      return dayA - dayB;
    });
  }, [entries, selectedSubjectId]);

  const dmSubjects = useMemo(() => {
    return subjects.filter((subject) => entries.some((entry) => entry.subjectId === subject.id));
  }, [subjects, entries]);

  const dmEffectiveSubjectId = useMemo(() => {
    if (selectedSubjectId && dmSubjects.some((subject) => subject.id === selectedSubjectId)) return selectedSubjectId;
    return "";
  }, [selectedSubjectId, dmSubjects]);

  const dmSubject = useMemo(() => subjects.find((subject) => subject.id === dmEffectiveSubjectId) ?? null, [subjects, dmEffectiveSubjectId]);
  const dmSubjectSite = useMemo(() => {
    if (!dmSubject) return null;
    return SITE_DIRECTORY.find((site) => site.id === dmSubject.siteId) ?? null;
  }, [dmSubject]);

  useEffect(() => {
    setDmSelectedVisit("Day -1");
    setDmSelectedField("");
  }, [dmEffectiveSubjectId]);

  const getDayNumberFromVisit = (visit: string) => {
    const parsed = Number(visit.replace("Day", "").trim());
    return Number.isFinite(parsed) ? parsed : -1;
  };

  const getScheduledCrfsForVisit = (visit: string) => {
    const day = getDayNumberFromVisit(visit);
    return scheduleActivities.filter((crf) => Boolean(MATRIX[crf]?.[day]));
  };

  const isDmFormComplete = (subjectId: string, visit: string, crfName: string) => {
    const expectedFields = (CRF_FIELD_LIBRARY[crfName] ?? []).map((field) => field.fieldLabel);
    if (expectedFields.length === 0) {
      return entries.some((entry) => entry.subjectId === subjectId && entry.visit === visit && entry.crf === crfName);
    }
    return expectedFields.every((fieldLabel) =>
      entries.some((entry) => entry.subjectId === subjectId && entry.visit === visit && entry.crf === crfName && entry.fieldLabel === fieldLabel),
    );
  };

  const isDmVisitComplete = (subjectId: string, visit: string) => {
    const scheduledCrfs = getScheduledCrfsForVisit(visit);
    if (scheduledCrfs.length === 0) return false;
    return scheduledCrfs.every((crfName) => isDmFormComplete(subjectId, visit, crfName));
  };

  const isDmVisitUnlocked = (subjectId: string, visit: string) => {
    const index = dmVisitSequence.indexOf(visit);
    if (index <= 0) return true;
    const previousVisit = dmVisitSequence[index - 1];
    return isDmVisitComplete(subjectId, previousVisit);
  };

  const dmScheduledCrfs = useMemo(() => getScheduledCrfsForVisit(dmSelectedVisit), [dmSelectedVisit, scheduleActivities]);

  useEffect(() => {
    if (dmScheduledCrfs.length > 0 && !dmScheduledCrfs.includes(dmSelectedCrf)) {
      setDmSelectedCrf(dmScheduledCrfs[0]);
      setDmSelectedField("");
    }
    if (dmScheduledCrfs.length === 0) {
      setDmSelectedCrf("");
      setDmSelectedField("");
    }
  }, [dmScheduledCrfs, dmSelectedCrf]);

  const dmExpectedFields = useMemo(() => {
    return (CRF_FIELD_LIBRARY[dmSelectedCrf] ?? []).map((field) => field.fieldLabel);
  }, [dmSelectedCrf]);

  const dmFormEntries = useMemo(() => {
    if (!dmEffectiveSubjectId || !dmSelectedVisit || !dmSelectedCrf) return [] as DataEntryRecord[];
    return entries
      .filter((entry) => entry.subjectId === dmEffectiveSubjectId && entry.visit === dmSelectedVisit && entry.crf === dmSelectedCrf)
      .sort((a, b) => new Date(a.enteredAt).getTime() - new Date(b.enteredAt).getTime());
  }, [entries, dmSelectedCrf, dmEffectiveSubjectId, dmSelectedVisit]);

  const dmScopedEntries = useMemo(() => {
    if (!dmSelectedField) return dmFormEntries;
    return dmFormEntries.filter((entry) => entry.fieldLabel === dmSelectedField);
  }, [dmFormEntries, dmSelectedField]);

  const dmScopeTokens = [dmEffectiveSubjectId, dmSelectedVisit, dmSelectedCrf, dmSelectedField].filter(Boolean) as string[];
  const dmScopedAuditLogs = useMemo(() => {
    if (dmScopeTokens.length === 0) return [] as AuditLog[];
    return auditLogs
      .filter((log) => dmScopeTokens.some((token) => log.action.includes(token)))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [auditLogs, dmScopeTokens]);

  const sourceBadge = (source: DataSourceType) => {
    switch (source) {
      case "EDC":
        return "bg-blue-100 text-blue-800";
      case "RTSM":
        return "bg-violet-100 text-violet-800";
      case "Labs":
        return "bg-emerald-100 text-emerald-800";
      case "eCOA":
        return "bg-cyan-100 text-cyan-800";
      case "Safety":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <>
      {(dataHubCategory === "schedule-assessments" || dataHubCategory === "both") && (
      <div className="mt-3 rounded-xl border border-slate-200 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Schedule Of Assessments View</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Scheduled + Data</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300" /> Scheduled + No Data</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-200" /> Not Scheduled</span>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">This matrix reflects all captured records in chronological study flow.</p>

        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[900px] border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="border border-slate-200 px-2 py-2 text-left">Assessment</th>
                {DAYS.map((day) => (
                  <th key={day} className="border border-slate-200 px-2 py-2 text-center">Day {day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheduleActivities.map((activity) => (
                <tr key={activity}>
                  <td className="border border-slate-200 px-2 py-2 font-medium text-slate-700">{activity}</td>
                  {DAYS.map((day) => {
                    const scheduled = Boolean(MATRIX[activity]?.[day]);
                    const visitLabel = `Day ${day}`;
                    const dataCount = scheduleHeatmap.get(`${activity}::${visitLabel}`) ?? 0;
                    return (
                      <td key={`${activity}-${day}`} className="border border-slate-200 px-2 py-2 text-center">
                        {scheduled ? (
                          <span className={`inline-flex min-w-10 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${dataCount > 0 ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"}`}>
                            {dataCount > 0 ? dataCount : "0"}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {role !== "DM" && (
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="border border-slate-200 px-3 py-2 text-left">Subject</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Site</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Visit</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Form</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Field</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Value</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Source</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Query</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Captured</th>
            </tr>
          </thead>
          <tbody>
            {allRecords.map((record) => (
              <Fragment key={record.id}>
                <tr key={record.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setExpandedRow((prev) => (prev === record.id ? null : record.id))}>
                  <td className="border border-slate-200 px-3 py-2">{record.subjectId}</td>
                  <td className="border border-slate-200 px-3 py-2">{record.siteId}</td>
                  <td className="border border-slate-200 px-3 py-2">{record.visit}</td>
                  <td className="border border-slate-200 px-3 py-2">{record.formType}</td>
                  <td className="border border-slate-200 px-3 py-2">{record.fieldLabel}</td>
                  <td className="border border-slate-200 px-3 py-2">{record.value}</td>
                  <td className="border border-slate-200 px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sourceBadge(record.source)}`}>{record.source}</span>
                  </td>
                  <td className="border border-slate-200 px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${record.queryStatus === "open" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"}`}>
                      {record.queryStatus === "open" ? "Open" : "Clear"}
                    </span>
                  </td>
                  <td className="border border-slate-200 px-3 py-2">{new Date(record.capturedAt).toLocaleDateString()}</td>
                </tr>
                {expandedRow === record.id && (
                  <tr>
                    <td colSpan={9} className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <p className="font-semibold">Full Record Details</p>
                      <p className="mt-1">Subject {record.subjectId} from Site {record.siteId}, {record.formType} ({record.visit})</p>
                      <p className="mt-1">Field: {record.fieldLabel} | Value: {record.value} | Source: {record.source}</p>
                      <p className="mt-1">Captured at {new Date(record.capturedAt).toLocaleString()} | Query Status: {record.queryStatus}</p>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {allRecords.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-sm text-slate-500">No records available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {role === "DM" && (
        <div className="mt-3 rounded-xl border border-slate-200 p-3">
          {!dmSubject ? (
            <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">No subject data available for DM review yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold">Subject Details</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-700">
                  <span className="font-semibold">{dmSubject.id}</span>
                  <span>Site Name: <span className="font-semibold">{dmSubjectSite?.name ?? `Site ${dmSubject.siteId}`}</span></span>
                  <span>Site ID: {dmSubject.siteId}</span>
                  <span>{dmSubject.region}, {dmSubject.country}</span>
                </div>
                {dmSubjectSite && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <label className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[10px]">
                      <span className="font-semibold text-slate-600">CEC</span>
                      <select className="max-w-[170px] bg-transparent text-[10px]">
                        {dmSubjectSite.cecTeam.map((member) => (
                          <option key={member.email} value={member.email}>{member.name} • {member.email}</option>
                        ))}
                      </select>
                    </label>
                    <label className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[10px]">
                      <span className="font-semibold text-slate-600">CRA</span>
                      <select className="max-w-[170px] bg-transparent text-[10px]">
                        {dmSubjectSite.craTeam.map((member) => (
                          <option key={member.email} value={member.email}>{member.name} • {member.email}</option>
                        ))}
                      </select>
                    </label>
                    <label className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[10px]">
                      <span className="font-semibold text-slate-600">PI</span>
                      <select className="max-w-[170px] bg-transparent text-[10px]">
                        {dmSubjectSite.piTeam.map((member) => (
                          <option key={member.email} value={member.email}>{member.name} • {member.email}</option>
                        ))}
                      </select>
                    </label>
                    <label className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[10px]">
                      <span className="font-semibold text-slate-600">DM</span>
                      <select className="max-w-[170px] bg-transparent text-[10px]">
                        {dmSubjectSite.dmTeam.map((member) => (
                          <option key={member.email} value={member.email}>{member.name} • {member.email}</option>
                        ))}
                      </select>
                    </label>
                    <label className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-1.5 py-1 text-[10px]">
                      <span className="font-semibold text-slate-600">Sponsor</span>
                      <select className="max-w-[170px] bg-transparent text-[10px]">
                        {dmSubjectSite.sponsorTeam.map((member) => (
                          <option key={member.email} value={member.email}>{member.name} • {member.email}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Visits</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {dmVisitSequence.map((visit) => {
                    const unlocked = isDmVisitUnlocked(dmSubject.id, visit);
                    const complete = isDmVisitComplete(dmSubject.id, visit);
                    const hasData = entries.some((entry) => entry.subjectId === dmSubject.id && entry.visit === visit);
                    const statusClass = complete
                      ? "border border-emerald-400 bg-emerald-100 text-emerald-900"
                      : hasData
                        ? "border border-amber-400 bg-amber-100 text-amber-900"
                        : "border border-slate-300 bg-white text-slate-700";
                    const statusLabel = !unlocked ? "Locked" : complete ? "Complete" : hasData ? "Missing" : "Not Touched";
                    return (
                      <button
                        key={visit}
                        onClick={() => setDmSelectedVisit(visit)}
                        disabled={!unlocked}
                        className={`rounded-md px-3 py-1.5 text-sm font-semibold ${statusClass} ${dmSelectedVisit === visit ? "ring-2 ring-blue-500" : ""} ${!unlocked ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        {visit} • {statusLabel}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-500">Chronological lock: each next visit unlocks only after previous visit forms are completed.</p>
              </div>

              <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
                <aside className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Forms</p>
                  <div className="mt-2 space-y-2">
                    {dmScheduledCrfs.map((crfName) => {
                      const expectedCount = (CRF_FIELD_LIBRARY[crfName] ?? []).length;
                      const submittedCount = entries.filter((entry) => entry.subjectId === dmSubject.id && entry.visit === dmSelectedVisit && entry.crf === crfName).length;
                      const complete = expectedCount > 0 ? submittedCount >= expectedCount : submittedCount > 0;
                      const hasData = submittedCount > 0;
                      const statusClass = complete
                        ? "border border-emerald-400 bg-emerald-100 text-emerald-900"
                        : hasData
                          ? "border border-amber-400 bg-amber-100 text-amber-900"
                          : "border border-slate-300 bg-white text-slate-700";
                      const statusLabel = complete ? "Complete" : hasData ? "Missing" : "Not Touched";
                      return (
                        <button
                          key={crfName}
                          onClick={() => {
                            setDmSelectedCrf(crfName);
                            setDmSelectedField("");
                          }}
                          className={`w-full rounded-md px-3 py-2 text-left text-sm font-semibold ${statusClass} ${dmSelectedCrf === crfName ? "ring-2 ring-blue-500" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{crfName}</span>
                            <span className="text-[10px] font-semibold">{statusLabel}</span>
                          </div>
                        </button>
                      );
                    })}
                    {dmScheduledCrfs.length === 0 && <p className="text-xs text-slate-500">No scheduled forms for {dmSelectedVisit}.</p>}
                  </div>
                </aside>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="text-base font-semibold">{dmSelectedCrf || "Select a form"}</h4>
                  <p className="text-xs text-slate-500">{dmSelectedVisit} review scope</p>

                  {dmSelectedCrf ? (
                    <div className="mt-3 space-y-2">
                      {dmExpectedFields.map((fieldLabel) => {
                        const row = dmFormEntries.find((entry) => entry.fieldLabel === fieldLabel);
                        return (
                          <div key={fieldLabel} className="grid gap-2 md:grid-cols-[220px_1fr_130px]">
                            <button
                              onClick={() => setDmSelectedField(fieldLabel)}
                              className={`rounded-md px-2 py-1 text-left text-sm font-medium ${dmSelectedField === fieldLabel ? "bg-violet-100 text-violet-900" : "text-slate-700 hover:bg-slate-100"}`}
                            >
                              {fieldLabel}
                            </button>
                            <input
                              value={row?.value ?? ""}
                              readOnly
                              className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
                              placeholder="No data entered"
                            />
                            <span className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-semibold ${row ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                              {row ? "Submitted" : "Pending"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">Select a form from the left panel.</p>
                  )}

                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Inspection Console</p>
                      <span className="text-xs text-slate-500">{dmSelectedField ? `Field: ${dmSelectedField}` : "Form Scope"}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold">{dmSelectedCrf || "Form"} • {dmSelectedVisit}</p>

                    <div className="mt-2 grid gap-3 lg:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted Values</p>
                        <ul className="mt-1 space-y-1 text-xs">
                          {dmScopedEntries.map((entry) => (
                            <li key={entry.id} className="rounded-md border border-slate-200 bg-white px-2 py-1">
                              {entry.fieldLabel}: <span className="font-semibold">{entry.value}</span> • {entry.enteredByRole} • {new Date(entry.enteredAt).toLocaleString()}
                            </li>
                          ))}
                          {dmScopedEntries.length === 0 && <li className="text-slate-500">No submitted data in this scope yet.</li>}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Audit Trail For Selected Scope</p>
                        <ul className="mt-1 max-h-44 space-y-1 overflow-auto pr-1 text-xs">
                          {dmScopedAuditLogs.map((log) => (
                            <li key={log.id} className="rounded-md border border-slate-200 bg-white px-2 py-1">
                              <p className="font-medium">{log.action}</p>
                              <p className="text-[11px] text-slate-500">{log.by} • {new Date(log.timestamp).toLocaleString()}</p>
                            </li>
                          ))}
                          {dmScopedAuditLogs.length === 0 && <li className="text-slate-500">No audit events for current scope.</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
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

function Phase2ReportingView({
  project,
  finalizedCrfs,
  entries,
}: {
  project: Project | null;
  finalizedCrfs: CrfRow[];
  entries: DataEntryRecord[];
}) {
  const [reportName, setReportName] = useState("Clinical Data Listing");
  const [reportType, setReportType] = useState("Subject Listing");
  const [groupBy, setGroupBy] = useState("Visit");
  const [selectedColumns, setSelectedColumns] = useState<Array<{ crf: string; field: string; type: CrfFieldType }>>([]);
  const [dragOver, setDragOver] = useState(false);

  const crfFieldLibrary = useMemo(() => {
    const map = new Map<string, Array<{ field: string; type: CrfFieldType }>>();
    finalizedCrfs.forEach((row) => {
      const existing = map.get(row.label) ?? [];
      if (!existing.some((item) => item.field === row.fieldLabel)) {
        existing.push({ field: row.fieldLabel, type: row.fieldType });
      }
      map.set(row.label, existing);
    });
    return Array.from(map.entries()).map(([crf, fields]) => ({ crf, fields }));
  }, [finalizedCrfs]);

  const reportPreviewRows = useMemo(() => {
    if (selectedColumns.length === 0) return [] as Array<Record<string, string>>;
    const grouped = new Map<string, Record<string, string>>();

    entries.forEach((entry) => {
      const key = `${entry.subjectId}::${entry.visit}`;
      const record = grouped.get(key) ?? {
        Subject: entry.subjectId,
        Visit: entry.visit,
        CRF: entry.crf,
      };
      const matchedColumn = selectedColumns.find((column) => column.crf === entry.crf && column.field === entry.fieldLabel);
      if (matchedColumn) {
        record[`${matchedColumn.crf} • ${matchedColumn.field}`] = entry.value;
      }
      grouped.set(key, record);
    });

    return Array.from(grouped.values()).slice(0, 50);
  }, [entries, selectedColumns]);

  const stats = useMemo(() => {
    const formCount = new Set(entries.map((entry) => `${entry.subjectId}::${entry.visit}::${entry.crf}`)).size;
    const subjectCount = new Set(entries.map((entry) => entry.subjectId)).size;
    const openQueries = entries.filter((entry) => entry.status === "queried").length;
    return {
      subjects: subjectCount,
      forms: formCount,
      openQueries,
      selectedColumns: selectedColumns.length,
    };
  }, [entries, selectedColumns]);

  const onDropColumn = (payloadRaw: string) => {
    try {
      const payload = JSON.parse(payloadRaw) as { crf: string; field: string; type: CrfFieldType };
      setSelectedColumns((prev) => {
        if (prev.some((column) => column.crf === payload.crf && column.field === payload.field)) {
          return prev;
        }
        return [...prev, payload];
      });
    } catch {
      // Ignore invalid drag payloads in prototype mode.
    }
  };

  const applyTemplate = (template: "cleaning" | "safety" | "visit") => {
    const templateColumns: Record<"cleaning" | "safety" | "visit", string[]> = {
      cleaning: ["Demographics::Gender", "Demographics::Ethnicity", "Vital Signs::Systolic Blood Pressure"],
      safety: ["Adverse Events::AE Term", "Adverse Events::Severity", "Medical History::Condition"],
      visit: ["Informed Consent::Consent Obtained", "Informed Consent::Consent Date", "Vital Signs::Heart Rate"],
    };

    const target = templateColumns[template];
    const flattened = crfFieldLibrary.flatMap((crf) =>
      crf.fields.map((field) => ({ crf: crf.crf, field: field.field, type: field.type })),
    );

    setSelectedColumns(
      flattened.filter((item) => target.includes(`${item.crf}::${item.field}`)),
    );
  };

  const exportCsv = () => {
    const columns = ["Subject", "Visit", "CRF", ...selectedColumns.map((column) => `${column.crf} • ${column.field}`)];
    const rows = reportPreviewRows.map((row) =>
      columns
        .map((column) => `"${String(row[column] ?? "").replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [columns.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${(reportName || "Report").replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPdf = () => {
    const win = window.open("", "_blank", "width=1200,height=800");
    if (!win) return;
    win.document.write(`
      <html><head><title>${reportName}</title></head>
      <body style="font-family: 'Times New Roman', serif; padding: 20px;">
        <h1>${reportName}</h1>
        <p><b>Study:</b> ${project?.title ?? "Current Study"}</p>
        <p><b>Type:</b> ${reportType} | <b>Group By:</b> ${groupBy}</p>
        <table border="1" cellspacing="0" cellpadding="6" style="border-collapse: collapse; width: 100%; margin-top: 12px;">
          <thead><tr>${["Subject", "Visit", "CRF", ...selectedColumns.map((column) => `${column.crf} • ${column.field}`)].map((header) => `<th>${header}</th>`).join("")}</tr></thead>
          <tbody>
            ${reportPreviewRows
              .map((row) => {
                const cells = ["Subject", "Visit", "CRF", ...selectedColumns.map((column) => `${column.crf} • ${column.field}`)]
                  .map((key) => `<td>${row[key] ?? ""}</td>`)
                  .join("");
                return `<tr>${cells}</tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div>
          <h3 className="text-xl font-semibold">Reporting Module</h3>
          <p className="mt-1 text-sm text-slate-600">Build project-specific clinical reports using drag-and-drop CRF fields from finalized study forms.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => applyTemplate("cleaning")} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">Template: Data Cleaning</button>
          <button onClick={() => applyTemplate("safety")} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">Template: Safety</button>
          <button onClick={() => applyTemplate("visit")} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">Template: Visit Readiness</button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Subjects" value={String(stats.subjects)} icon={<Users size={18} />} />
        <StatCard label="Forms Captured" value={String(stats.forms)} icon={<ClipboardList size={18} />} />
        <StatCard label="Open Queries" value={String(stats.openQueries)} icon={<Info size={18} />} />
        <StatCard label="Report Columns" value={String(stats.selectedColumns)} icon={<Table size={18} />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project CRF Library</p>
          <p className="mt-1 text-xs text-slate-500">Drag any CRF field into Report Canvas to include it in extraction.</p>
          <div className="mt-3 max-h-[520px] space-y-3 overflow-auto pr-1">
            {crfFieldLibrary.map((crf) => (
              <div key={crf.crf} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p className="text-sm font-semibold text-slate-800">{crf.crf}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {crf.fields.map((field) => (
                    <button
                      key={`${crf.crf}-${field.field}`}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData(
                          "application/json",
                          JSON.stringify({ crf: crf.crf, field: field.field, type: field.type }),
                        );
                      }}
                      className="cursor-grab rounded-full border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                    >
                      {field.field}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {crfFieldLibrary.length === 0 && (
              <p className="rounded-md border border-amber-200 bg-amber-50 px-2 py-2 text-xs text-amber-900">No finalized CRFs found. Finalize CRFs in Phase 1 to build reports.</p>
            )}
          </div>
        </aside>

        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Report Configuration</p>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
              <input value={reportName} onChange={(event) => setReportName(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Report Name" />
              <select value={reportType} onChange={(event) => setReportType(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                {["Subject Listing", "Operational Report", "Data Cleaning Report", "Safety Snapshot"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select value={groupBy} onChange={(event) => setGroupBy(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                {["Visit", "Site", "CRF", "Subject"].map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              onDropColumn(event.dataTransfer.getData("application/json"));
            }}
            className={`rounded-xl border-2 border-dashed p-4 ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">Report Canvas (Drag & Drop)</p>
              <button onClick={() => setSelectedColumns([])} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700">Clear</button>
            </div>
            <div className="mt-2 flex min-h-20 flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2">
              {selectedColumns.map((column) => (
                <span key={`${column.crf}-${column.field}`} className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">
                  {column.crf} • {column.field}
                </span>
              ))}
              {selectedColumns.length === 0 && <p className="text-xs text-slate-500">Drop CRF fields here to define report columns.</p>}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">Report Preview</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={exportCsv} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">Export CSV</button>
                <button onClick={exportPdf} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">Export PDF</button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[840px] border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="border border-slate-200 px-2 py-2 text-left">Subject</th>
                    <th className="border border-slate-200 px-2 py-2 text-left">Visit</th>
                    <th className="border border-slate-200 px-2 py-2 text-left">CRF</th>
                    {selectedColumns.map((column) => (
                      <th key={`${column.crf}-${column.field}`} className="border border-slate-200 px-2 py-2 text-left">
                        {column.crf} • {column.field}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportPreviewRows.map((row, idx) => (
                    <tr key={`preview-${idx}`}>
                      <td className="border border-slate-200 px-2 py-2">{row.Subject ?? ""}</td>
                      <td className="border border-slate-200 px-2 py-2">{row.Visit ?? ""}</td>
                      <td className="border border-slate-200 px-2 py-2">{row.CRF ?? ""}</td>
                      {selectedColumns.map((column) => (
                        <td key={`${idx}-${column.crf}-${column.field}`} className="border border-slate-200 px-2 py-2">
                          {row[`${column.crf} • ${column.field}`] ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {reportPreviewRows.length === 0 && (
                    <tr>
                      <td colSpan={3 + selectedColumns.length} className="px-3 py-6 text-center text-xs text-slate-500">
                        No preview rows yet. Add columns and ensure data is entered in Phase 2.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}