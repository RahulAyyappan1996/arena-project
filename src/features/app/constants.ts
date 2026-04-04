import {
  FileText,
  Target,
  UserCheck,
  ClipboardList,
  Table,
  LayoutDashboard,
  Sparkles,
  SlidersHorizontal,
  Settings,
  ListChecks,
} from "lucide-react";
import {
  SidebarItem,
  FaroScreenKey,
  SiteDirectoryItem,
  QueryItem,
  ReconcileRow,
  DataHubRecord,
  CrfFieldTemplate,
  CrfStandard,
  ProtocolData,
  CrfDefinition,
  CrfRow,
  EditRule,
  Project,
  StudyDocument,
  CrfFieldType,
} from "./types";

export const DESIGN_HUB_ITEMS: SidebarItem[] = [
  { key: "general-info", label: "General Info", icon: FileText },
  { key: "objectives", label: "Objectives", icon: Target },
  { key: "population", label: "Population", icon: UserCheck },
  { key: "crf-manager", label: "Case Report Form Manager", icon: ClipboardList },
  { key: "schedule-of-activities", label: "Schedule of Activities", icon: Table },
  { key: "study-design", label: "Study Design", icon: LayoutDashboard },
];

export const INTELLIGENCE_HUB_ITEMS: SidebarItem[] = [
  { key: "insights", label: "Insights & Faro Predict", icon: Sparkles },
  { key: "study-differences", label: "Study Differences Report", icon: SlidersHorizontal },
];

export const DATA_ITEMS: SidebarItem[] = [
  { key: "activity-configuration", label: "Activity Configuration", icon: Settings },
  { key: "compare", label: "Compare", icon: ListChecks },
];

export const DAYS = [-1, 1, 7, 14, 21, 28, 56, 70];

export const SITE_DIRECTORY: SiteDirectoryItem[] = [
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

export const REGION_OPTIONS = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East"];
export const COUNTRY_OPTIONS = ["United States", "United Kingdom", "Germany", "Japan", "India", "Canada", "France", "Spain"];

export const INITIAL_QUERIES: QueryItem[] = [
  { id: "q1", subjectId: "001-001", description: "Missing ethnicity on Demographics", status: "open" },
  { id: "q2", subjectId: "001-002", description: "AE start date conflicts with visit date", status: "open" },
  { id: "q3", subjectId: "002-001", description: "Lab ALT outlier requires site confirmation", status: "open" },
  { id: "q4", subjectId: "003-001", description: "ECG time stamp mismatch", status: "open" },
];

export const INITIAL_RECONCILIATION_ROWS: ReconcileRow[] = [
  { id: "r1", subjectId: "001-001", metric: "Hemoglobin", labValue: "12.8", edcValue: "12.8", matched: true, status: "pending" },
  { id: "r2", subjectId: "001-001", metric: "ALT", labValue: "48", edcValue: "44", matched: false, status: "pending" },
  { id: "r3", subjectId: "001-002", metric: "AST", labValue: "31", edcValue: "31", matched: true, status: "pending" },
  { id: "r4", subjectId: "002-001", metric: "Creatinine", labValue: "1.2", edcValue: "1.1", matched: false, status: "pending" },
  { id: "r5", subjectId: "003-001", metric: "Platelets", labValue: "198", edcValue: "198", matched: true, status: "pending" },
];

export const MOCK_DATAHUB_EXTERNAL: DataHubRecord[] = [
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

export const MATRIX: Record<string, Record<number, { count: number; phase: string } | null>> = {
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

export const PANEL_MEMBERS = [
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

export const CRF_FIELD_LIBRARY: Record<string, CrfFieldTemplate[]> = {
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

export const CRF_STANDARDS_LIBRARY: CrfStandard[] = [
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

export const FARO_FEATURES = [
  "Import & Digitize protocol content into structured study objects",
  "Benchmark against public and internal protocol libraries",
  "Rapid scenario modeling for burden, cost, and complexity tradeoffs",
  "Clinically-relevant AI recommendations with sourced references",
];

export const PROTOCOL_DATA: ProtocolData = {
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

export const CDISC_MAP: Record<string, { crf: string; cdash: string; adam: string; tfl: string }> = {
  Demographics: { crf: "Demographics", cdash: "DM", adam: "ADSL", tfl: "Demographics and Baseline Table" },
  "Informed Consent": { crf: "Informed Consent", cdash: "DS", adam: "ADSL", tfl: "Subject Disposition Table" },
  "Vital Signs": { crf: "Vital Signs", cdash: "VS", adam: "ADVS", tfl: "Vital Signs Summary" },
  ECG: { crf: "ECG", cdash: "EG", adam: "ADEG", tfl: "ECG Change from Baseline" },
  "Medical History": { crf: "Medical History", cdash: "MH", adam: "ADSL", tfl: "Baseline Characteristics" },
  "Adverse Events": { crf: "Adverse Events", cdash: "AE", adam: "ADAE", tfl: "TEAE Incidence" },
};

export const INITIAL_PROJECTS: Project[] = [
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

export const FIELD_TYPE_OPTIONS: CrfFieldType[] = ["time", "date", "number", "text", "restricted", "other"];
