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

export type { AppView, EnvironmentType, ThemeSettings, Project, EditRule, CrfFieldType, CrfDefinition, Subject, DataEntryRecord, AuditLog, StudyDocument, FaroScreenKey, SidebarItem, MatrixCell, CrfRow, CrfFieldTemplate, CrfStandard, ProtocolData, QueryItem, ReconcileRow, SiteContact, SiteDirectoryItem, DataSourceType, DataHubRecord, CommandHubContextType, Phase2Role, ThemeMode, ProjectStatus } from "./features/app/types";

import {
  DESIGN_HUB_ITEMS,
  INTELLIGENCE_HUB_ITEMS,
  DATA_ITEMS,
  DAYS,
  SITE_DIRECTORY,
  REGION_OPTIONS,
  COUNTRY_OPTIONS,
  INITIAL_QUERIES,
  INITIAL_RECONCILIATION_ROWS,
  MOCK_DATAHUB_EXTERNAL,
  MATRIX,
  PANEL_MEMBERS,
  CRF_FIELD_LIBRARY,
  CRF_STANDARDS_LIBRARY,
  FARO_FEATURES,
  PROTOCOL_DATA,
  CDISC_MAP,
  INITIAL_PROJECTS,
  FIELD_TYPE_OPTIONS,
} from "./features/app/constants";

import {
  findStandardIdByActivity,
  buildInitialCrfDefinitions,
  flattenDefinitionsToRows,
  INITIAL_CRF_DEFINITIONS,
  INITIAL_CRF_ROWS,
  createSuggestedRules,
  buildStudyDocuments,
  toMinutes,
  isInsideTimeRange,
  computeNightMode,
  createSeededLiveStudyData,
} from "./features/app/helpers";

export { ThemeScheduler, ClearTrialLogo, StatCard, StatusBadge } from "./features/app/shared";
export { LoginView, DashboardView, FaroSetupView, EditChecksView, TmfView, Phase2View } from "./features/app/views";

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
      </main>

      <ThemeScheduler
        open={false}
        settings={themeSettings}
        isDarkMode={isDarkMode}
        onTogglePanel={() => void 0}
        onSettingsChange={setThemeSettings}
        showTrigger={false}
      />

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

