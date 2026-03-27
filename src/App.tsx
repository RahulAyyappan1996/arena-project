import { useMemo, useState } from "react";
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
type Phase2Role = "CRA" | "DM" | "PI" | "CRC";

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
  title: string;
  type: string;
  confidence: number;
  decision: "pending" | "approved" | "rejected";
};

type Subject = {
  id: string;
  initials: string;
  dob: string;
  enrolledAt: string;
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
  updated: string;
  standardId?: string;
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
  { key: "schedule-of-activities", label: "Schedule of Activities", icon: Table },
  { key: "study-design", label: "Study Design", icon: LayoutDashboard },
];

const DATA_ITEMS: SidebarItem[] = [
  { key: "activity-configuration", label: "Activity Configuration", icon: Settings },
  { key: "insights", label: "Insights", icon: BarChart3 },
  { key: "compare", label: "Compare", icon: ListChecks },
  { key: "crf-manager", label: "Case Report Form Manager", icon: ClipboardList },
];

const DAYS = [-1, 1, 7, 14, 21, 28, 56, 70];
const ASSESSMENTS = ["Informed Consent", "Vital Signs", "ECG", "Medical History", "Adverse Events"];

const MATRIX: Record<string, Record<number, MatrixCell | null>> = {
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

const INITIAL_CRF_ROWS: CrfRow[] = [
  { id: "crf-1", schedule: "Main", activity: "Informed Consent", source: "Master Library", label: "Informed Consent", updated: "9/16/2025, 4:36 PM", standardId: "std-ds" },
  { id: "crf-2", schedule: "Main", activity: "Vital Signs", source: "Master Library", label: "Vital Signs", updated: "9/16/2025, 4:36 PM", standardId: "std-vs" },
  { id: "crf-3", schedule: "Main", activity: "Medical History", source: "Master Library", label: "General Medical History", updated: "9/16/2025, 4:36 PM", standardId: "std-mh" },
  { id: "crf-4", schedule: "Main", activity: "Adverse Events", source: "Master Library", label: "Adverse Events", updated: "9/16/2025, 4:36 PM", standardId: "std-ae" },
];

const CRF_STANDARDS_LIBRARY: CrfStandard[] = [
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

const INITIAL_RULES: EditRule[] = [
  { id: "r1", title: "Date of Birth cannot be in the future", type: "Cross-Field Validation", confidence: 98, decision: "pending" },
  { id: "r2", title: "Systolic BP must be greater than Diastolic BP", type: "Range Check", confidence: 95, decision: "pending" },
  { id: "r3", title: "Adverse Event Severity required if AE reported", type: "Conditional Logic", confidence: 94, decision: "pending" },
  { id: "r4", title: "Subject Age must be between 18-65 years", type: "Inclusion Criteria", confidence: 96, decision: "pending" },
];

export default function App() {
  const [view, setView] = useState<AppView>("login");
  const [environment, setEnvironment] = useState<EnvironmentType>("uat");
  const [isAuthed, setIsAuthed] = useState(false);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [faroUnlocked, setFaroUnlocked] = useState(false);
  const [rules, setRules] = useState<EditRule[]>(INITIAL_RULES);
  const [signedOff, setSignedOff] = useState(false);
  const [phase2Role, setPhase2Role] = useState<Phase2Role>("CRA");
  const [subjects, setSubjects] = useState<Subject[]>([]);

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
    setRules(INITIAL_RULES);
    setSignedOff(false);
    setView("faro");
  };

  const updateRule = (ruleId: string, decision: EditRule["decision"]) => {
    setRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, decision } : r)));
  };

  const completeSignoff = () => {
    setSignedOff(true);
    if (!currentProject) return;
    setProjects((prev) => prev.map((p) => (p.id === currentProject.id ? { ...p, status: "live" } : p)));
    setCurrentProject({ ...currentProject, status: "live" });
    setView("phase2");
  };

  const enrollSubject = (subject: Subject) => setSubjects((prev) => [subject, ...prev]);
  const deleteSubject = (id: string) => setSubjects((prev) => prev.filter((s) => s.id !== id));

  if (!isAuthed || view === "login") {
    return (
      <LoginView
        environment={environment}
        setEnvironment={setEnvironment}
        onSignIn={() => {
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
          </div>
          <div className="flex items-center gap-3">{envBadge}</div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl p-6">
        {view === "dashboard" && (
          <DashboardView
            projects={projects}
            onSelect={selectProject}
            onCreate={createProject}
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
            onContinueToEditChecks={() => setView("editchecks")}
          />
        )}

        {view === "editchecks" && (
          <EditChecksView
            rules={rules}
            approvedCount={approvedCount}
            rejectedCount={rejectedCount}
            decisionsDone={decisionsDone}
            onUpdateRule={updateRule}
            onBack={() => setView("faro")}
            onFinalize={() => setView("tmf")}
          />
        )}

        {view === "tmf" && (
          <TmfView
            signedOff={signedOff}
            onBack={() => setView("editchecks")}
            onSignOff={completeSignoff}
          />
        )}

        {view === "phase2" && (
          <Phase2View
            project={currentProject}
            role={phase2Role}
            onRoleChange={setPhase2Role}
            subjects={subjects}
            onEnroll={enrollSubject}
            onDelete={deleteSubject}
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
  onSignIn: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gateway</p>
        <h2 className="mt-1 text-3xl font-semibold">ClearTrial Login</h2>
        <p className="mt-2 text-slate-600">Sign in to access the study lifecycle workspace.</p>

        <div className="mt-6 space-y-4">
          <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" placeholder="Email" />
          <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" placeholder="Username" />
          <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" placeholder="Password" type="password" />
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
          onClick={onSignIn}
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
  onSelect,
  onCreate,
  onLogout,
}: {
  projects: Project[];
  onSelect: (p: Project) => void;
  onCreate: (title: string, protocolId: string, area: string) => void;
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
        </div>
        <div className="flex items-center gap-2">
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
  onContinueToEditChecks: () => void;
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
              onClick={onContinueToEditChecks}
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

function FaroWorkspace({ onBack, onContinueToEditChecks }: { onBack: () => void; onContinueToEditChecks: () => void }) {
  const [activeScreen, setActiveScreen] = useState<FaroScreenKey>("general-info");
  const [selectedActivity, setSelectedActivity] = useState("Vital Signs");
  const [selectedActivities, setSelectedActivities] = useState<string[]>(["Informed Consent", "Vital Signs", "Medical History", "Adverse Events"]);
  const [crfRows, setCrfRows] = useState<CrfRow[]>(INITIAL_CRF_ROWS);
  const [aiAlignMessage, setAiAlignMessage] = useState<string | null>(null);
  const [menuRow, setMenuRow] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const aiAlignAll = () => {
    const requiredStandards = CRF_STANDARDS_LIBRARY.filter((item) => item.required);
    const requiredNames = requiredStandards.map((item) => item.name);

    setSelectedActivities((prev) => Array.from(new Set([...prev, ...requiredNames])));

    setCrfRows((prev) => {
      const existing = new Set(prev.map((row) => row.activity.toLowerCase()));
      const additions: CrfRow[] = requiredStandards
        .filter((std) => !existing.has(std.name.toLowerCase()))
        .map((std, i) => ({
          id: `crf-ai-${Date.now()}-${i}`,
          schedule: "Main",
          activity: std.name,
          source: "Regulatory Library",
          label: std.name,
          updated: new Date().toLocaleString(),
          standardId: std.id,
        }));
      return [...prev, ...additions];
    });

    setAiAlignMessage("AI Alignment complete. Required regulatory CRFs and schedule links were synchronized.");
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
      lines.push(["CRF Manager", row.activity, `${row.schedule} | ${row.source} | ${row.label}`].join(","));
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
            <tr><th>Schedule</th><th>Activity</th><th>Source</th><th>Form Label</th><th>Updated</th></tr>
            ${crfRows
              .map(
                (row) =>
                  `<tr><td>${row.schedule}</td><td>${row.activity}</td><td>${row.source}</td><td>${row.label}</td><td>${row.updated}</td></tr>`,
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
            rows={crfRows}
            setRows={setCrfRows}
            selectedActivities={selectedActivities}
            standards={CRF_STANDARDS_LIBRARY}
          />
        );
      default:
        return <PlaceholderView title="screen" />;
    }
  }, [activeScreen, selectedActivity, selectedActivities, menuRow, tooltip]);

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
                onClick={onContinueToEditChecks}
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
  selectedActivities,
  setSelectedActivities,
  menuRow,
  setMenuRow,
  tooltip,
  setTooltip,
}: {
  onConfigure: (name: string) => void;
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
      <p className="text-sm text-slate-600">Clickable matrix with activity-level actions.</p>

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
            {ASSESSMENTS.map((assessment) => (
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
                  const cell = MATRIX[assessment][day];
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
  rows,
  setRows,
  selectedActivities,
  standards,
}: {
  rows: CrfRow[];
  setRows: React.Dispatch<React.SetStateAction<CrfRow[]>>;
  selectedActivities: string[];
  standards: CrfStandard[];
}) {
  const [activity, setActivity] = useState(selectedActivities[0] ?? "Vital Signs");
  const [schedule, setSchedule] = useState("Main");
  const [source, setSource] = useState("Master Library");
  const [label, setLabel] = useState("New CRF");
  const [libraryId, setLibraryId] = useState(standards[0]?.id ?? "");

  const addRow = () => {
    if (!activity || !label) return;
    setRows((prev) => [
      {
        id: `crf-${Date.now()}`,
        schedule,
        activity,
        source,
        label,
        updated: new Date().toLocaleString(),
        standardId: libraryId || undefined,
      },
      ...prev,
    ]);
  };

  const deleteRow = (id: string) => setRows((prev) => prev.filter((row) => row.id !== id));

  const addFromStandard = () => {
    const selected = standards.find((std) => std.id === libraryId);
    if (!selected) return;
    setRows((prev) => [
      {
        id: `crf-std-${Date.now()}`,
        schedule: "Main",
        activity: selected.name,
        source: `${selected.body} Standards Library`,
        label: selected.name,
        updated: new Date().toLocaleString(),
        standardId: selected.id,
      },
      ...prev,
    ]);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-semibold">Case Report Form Manager</h2>
      <p className="text-sm text-slate-600">Mapping table for schedule activities into EDC forms.</p>

      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-6">
        <select value={schedule} onChange={(e) => setSchedule(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
          <option>Main</option>
          <option>Treatment</option>
          <option>Follow Up</option>
        </select>
        <select value={activity} onChange={(e) => setActivity(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
          {selectedActivities.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <input value={source} onChange={(e) => setSource(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm" placeholder="Collection Source" />
        <input value={label} onChange={(e) => setLabel(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm" placeholder="Form Label" />
        <select value={libraryId} onChange={(e) => setLibraryId(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm">
          {standards.map((std) => (
            <option key={std.id} value={std.id}>{std.name} ({std.body})</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button onClick={addRow} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Add CRF</button>
          <button onClick={addFromStandard} className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700">Add Library CRF</button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-700">Regulatory CRF Library</p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {standards.map((std) => (
            <div key={std.id} className="rounded-md border border-slate-200 bg-white p-3 text-xs">
              <p className="font-semibold">{std.name} <span className="text-slate-500">({std.body})</span></p>
              <p className="text-slate-600">Domain: {std.domain} • ADaM: {std.adam} • TFL: {std.tfl}</p>
              <p className="mt-1 text-slate-600">{std.notes}</p>
              {std.required && <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">Required Standard</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="border border-slate-200 px-3 py-2 text-left">Schedule</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Activity</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Collection Source</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Form Label</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Library Standard</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Last Updated</th>
              <th className="border border-slate-200 px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const linkedStd = standards.find((std) => std.id === row.standardId);
              return (
              <tr key={row.id}>
                <td className="border border-slate-200 px-3 py-2">{row.schedule}</td>
                <td className="border border-slate-200 px-3 py-2">{row.activity}</td>
                <td className="border border-slate-200 px-3 py-2">{row.source}</td>
                <td className="border border-slate-200 px-3 py-2">{row.label}</td>
                <td className="border border-slate-200 px-3 py-2">{linkedStd ? `${linkedStd.body} - ${linkedStd.domain}` : "-"}</td>
                <td className="border border-slate-200 px-3 py-2">{row.updated}</td>
                <td className="border border-slate-200 px-3 py-2">
                  <button onClick={() => deleteRow(row.id)} className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700">Delete</button>
                </td>
              </tr>
            );})}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-500">No CRFs added yet. Add CRFs from schedule or regulatory library.</td>
              </tr>
            )}
          </tbody>
        </table>
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
  rules,
  approvedCount,
  rejectedCount,
  decisionsDone,
  onUpdateRule,
  onBack,
  onFinalize,
}: {
  rules: EditRule[];
  approvedCount: number;
  rejectedCount: number;
  decisionsDone: number;
  onUpdateRule: (id: string, decision: EditRule["decision"]) => void;
  onBack: () => void;
  onFinalize: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> Back To FARO
      </button>
      <h2 className="text-3xl font-semibold">AI-Driven Edit Checks</h2>
      <p className="text-slate-600">Approve or reject AI-suggested logic rules.</p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        Approved: <span className="font-semibold text-emerald-700">{approvedCount}</span> • Rejected: <span className="font-semibold text-red-700">{rejectedCount}</span> • Decisions: {decisionsDone}/{rules.length}
      </div>

      <div className="mt-4 space-y-3">
        {rules.map((rule) => (
          <div key={rule.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{rule.title}</p>
                <p className="text-sm text-slate-600">{rule.type} • Confidence {rule.confidence}%</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">{rule.decision}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => onUpdateRule(rule.id, "approved")} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Approve</button>
              <button onClick={() => onUpdateRule(rule.id, "rejected")} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Reject</button>
            </div>
          </div>
        ))}
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

function TmfView({ signedOff, onBack, onSignOff }: { signedOff: boolean; onBack: () => void; onSignOff: () => void }) {
  const docs = ["Annotated CRF (v1.0)", "Edit Check Specifications (v1.0)", "Database Design Specification (v1.0)", "SDTM Mapping Document (v1.0)"];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> Back To Edit Checks
      </button>
      <h2 className="text-3xl font-semibold">TMF Portal & Stakeholder Sign-off</h2>
      <p className="text-slate-600">Versioned artifacts are generated and blocked until digital sign-off.</p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="font-semibold">Generated Documents</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          {docs.map((d) => (
            <li key={d} className="inline-flex items-center gap-2"><FileText size={14} /> {d}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Stakeholder Approval Gate</p>
        <ul className="mt-2 space-y-1">
          <li>Principal Investigator: {signedOff ? "Signed" : "Pending"}</li>
          <li>Data Manager: {signedOff ? "Signed" : "Pending"}</li>
          <li>Sponsor: {signedOff ? "Signed" : "Pending"}</li>
        </ul>
        <p className="mt-2">Project cannot move to Phase 2 until all approvals are signed.</p>
      </div>

      <button onClick={onSignOff} className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white">
        Provide Digital Signature
      </button>
    </section>
  );
}

function Phase2View({
  project,
  role,
  onRoleChange,
  subjects,
  onEnroll,
  onDelete,
  onBackToDashboard,
}: {
  project: Project | null;
  role: Phase2Role;
  onRoleChange: (role: Phase2Role) => void;
  subjects: Subject[];
  onEnroll: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onBackToDashboard: () => void;
}) {
  const [subjectId, setSubjectId] = useState("001-001");
  const [initials, setInitials] = useState("AB");
  const [dob, setDob] = useState("1991-04-03");
  const [enrolledAt, setEnrolledAt] = useState("2026-01-10");

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
        {(["CRA", "DM", "PI", "CRC"] as const).map((r) => (
          <button
            key={r}
            onClick={() => onRoleChange(r)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${role === r ? "bg-red-600 text-white" : "border border-slate-300 bg-white"}`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled" value="156" icon={<Users size={18} />} />
        <StatCard label="Open Queries" value="23" icon={<Info size={18} />} />
        <StatCard label="Sites Active" value="12" icon={<FlaskConical size={18} />} />
        <StatCard label="Data Points" value="18,942" icon={<BarChart3 size={18} />} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 p-4">
        <h3 className="text-xl font-semibold">Dummy Patient Enrollment</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <input value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Subject ID" />
          <input value={initials} onChange={(e) => setInitials(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Initials" />
          <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" className="rounded-lg border border-slate-300 px-3 py-2" />
          <input value={enrolledAt} onChange={(e) => setEnrolledAt(e.target.value)} type="date" className="rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <button
          onClick={() => onEnroll({ id: subjectId, initials, dob, enrolledAt })}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Create Test Subject
        </button>

        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[700px] border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="border border-slate-200 px-3 py-2 text-left">Subject ID</th>
                <th className="border border-slate-200 px-3 py-2 text-left">Initials</th>
                <th className="border border-slate-200 px-3 py-2 text-left">DOB</th>
                <th className="border border-slate-200 px-3 py-2 text-left">Enrollment Date</th>
                <th className="border border-slate-200 px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td className="border border-slate-200 px-3 py-2">{s.id}</td>
                  <td className="border border-slate-200 px-3 py-2">{s.initials}</td>
                  <td className="border border-slate-200 px-3 py-2">{s.dob}</td>
                  <td className="border border-slate-200 px-3 py-2">{s.enrolledAt}</td>
                  <td className="border border-slate-200 px-3 py-2">
                    <div className="flex gap-2">
                      <button className="rounded-md bg-blue-600 px-2 py-1 text-xs font-semibold text-white">Enter Data</button>
                      <button onClick={() => onDelete(s.id)} className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-slate-500">No dummy subjects yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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