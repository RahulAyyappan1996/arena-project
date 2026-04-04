import { Fragment, Suspense, lazy, useEffect, useMemo, useState } from "react";
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
import simulationData from "../../../components/faro-predict/faro-simulation-data.json";
import { StatCard } from "../shared/StatCard";
import { Phase2View } from "../views/Phase2View";
import { EditChecksView } from "../views/EditChecksView";
import { TmfView } from "../views/TmfView";
import { DashboardView } from "../DashboardView";
import { FaroSetupView } from "../FaroSetupView";
import { LoginView } from "../LoginView";
import {
  DEFAULT_THEME_SETTINGS,
  DEFAULT_ENVIRONMENT,
  DEFAULT_USER_EMAIL,
  DEFAULT_PHASE2_ROLE,
  DEFAULT_VIEW,
  getProjectDerived,
} from "./AppState";
import {
  AppView,
  EnvironmentType,
  ThemeSettings,
  Project,
  EditRule,
  CrfRow,
  Subject,
  DataEntryRecord,
  AuditLog,
  StudyDocument,
  Phase2Role,
} from "../types";
import { computeNightMode } from "../helpers";

const FaroPredict = lazy(() => import("../../../components/faro-predict/FaroPredict"));
const QueryManager = lazy(() => import("../../../components/QueryManager"));

const FaroPhaseView = lazy(() => import("../views/FaroPhaseView"));

export function AppShell() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [clockTick, setClockTick] = useState(() => Date.now());
  const [view, setView] = useState<AppView>(DEFAULT_VIEW);
  const [environment, setEnvironment] = useState<EnvironmentType>(DEFAULT_ENVIRONMENT);
  const [userEmail, setUserEmail] = useState(DEFAULT_USER_EMAIL);
  const [isAuthed, setIsAuthed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [faroUnlocked, setFaroUnlocked] = useState(false);
  const [finalizedCrfs, setFinalizedCrfs] = useState<CrfRow[]>([]);
  const [rules, setRules] = useState<EditRule[]>([]);
  const [tmfDocsByProject, setTmfDocsByProject] = useState<Record<string, StudyDocument[]>>({});
  const [phase2Role, setPhase2Role] = useState<Phase2Role>(DEFAULT_PHASE2_ROLE);
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

  const { currentProjectId, currentProjectDocs, currentSubjects, currentEntries, currentAuditLogs } = useMemo(
    () => getProjectDerived(currentProject, tmfDocsByProject, subjectsByProject, dataEntriesByProject, auditLogsByProject),
    [currentProject, tmfDocsByProject, subjectsByProject, dataEntriesByProject, auditLogsByProject]
  );

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
          [project.id]: [],
        }));
      }
      setView("tmf");
      return;
    }
    setView("dashboard");
  };

  const handleFinalizeCrfs = () => {
    setFinalizedCrfs((prev) => prev.map((row) => ({ ...row, finalized: true })));
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.decision === "pending") {
          return { ...rule, decision: "approved" as const };
        }
        return rule;
      })
    );
    setView("dashboard");
  };

  const handleAiAlignAll = () => {
    setRules((prev) =>
      prev.map((rule) => {
        if (rule.decision === "pending" && rule.confidence >= 80) {
          return { ...rule, decision: "approved" as const };
        }
        return rule;
      })
    );
  };

  const handleFinalizeDocs = () => {
    if (!currentProject) return;
    const docs = tmfDocsByProject[currentProject.id] ?? [];
    if (docs.length === 0) return;
    const updated = docs.map((doc) => ({ ...doc, status: "finalized" as const }));
    setTmfDocsByProject((prev) => ({ ...prev, [currentProject.id]: updated }));
  };

  const handleGenerateDocuments = () => {
    if (!currentProject) return;
    const newDocs: StudyDocument[] = Array.from({ length: 15 }, (_, i) => ({
      id: `doc-${Date.now()}-${i}`,
      projectId: currentProject.id,
      title: `Document ${i + 1}`,
      category: ["Protocol", "CRF", "Validation", "Metadata", "Standards"][i % 5],
      version: `${currentProject.protocolId}-v1.0`,
      generatedFrom: "Protocol & CRF configuration",
      assignedTo: [],
      signedBy: [],
      status: "generated",
    }));
    setTmfDocsByProject((prev) => ({ ...prev, [currentProject.id]: newDocs }));
  };

  const handleAssignAllDocs = () => {
    if (!currentProject) return;
    const docs = tmfDocsByProject[currentProject.id] ?? [];
    const updated = docs.map((doc) => ({
      ...doc,
      assignedTo: ["user@cleartrial.com", "sponsor@cleartrial.com"],
    }));
    setTmfDocsByProject((prev) => ({ ...prev, [currentProject.id]: updated }));
  };

  const handleAssignDoc = (docId: string) => {
    if (!currentProject) return;
    const docs = tmfDocsByProject[currentProject.id] ?? [];
    const updated = docs.map((doc) => {
      if (doc.id !== docId) return doc;
      const alreadyAssigned = doc.assignedTo.includes(userEmail);
      return {
        ...doc,
        assignedTo: alreadyAssigned ? doc.assignedTo : [...doc.assignedTo, userEmail],
      };
    });
    setTmfDocsByProject((prev) => ({ ...prev, [currentProject.id]: updated }));
  };

  const handleDigitalSign = (docId: string, mode: "digital" | "uploaded", uploadFileName?: string) => {
    if (!currentProject) return;
    const docs = tmfDocsByProject[currentProject.id] ?? [];
    const updated = docs.map((doc) => {
      if (doc.id !== docId) return doc;
      return {
        ...doc,
        signedBy: [...doc.signedBy, userEmail],
        status: "signed" as const,
      };
    });
    setTmfDocsByProject((prev) => ({ ...prev, [currentProject.id]: updated }));
  };

  const handleSignOff = () => {
    if (!currentProject) return;
    const docs = tmfDocsByProject[currentProject.id] ?? [];
    const allSigned = docs.every((doc) => doc.signedBy.length > 0);
    if (allSigned) {
      setProjects((prev) =>
        prev.map((p) => (p.id === currentProject.id ? { ...p, status: "active" as const } : p))
      );
    }
  };

  const handleEnroll = (subject: Subject) => {
    if (!currentProject) return;
    setSubjectsByProject((prev) => ({
      ...prev,
      [currentProject.id]: [...(prev[currentProject.id] ?? []), subject],
    }));
  };

  const handleDeleteSubject = (id: string) => {
    if (!currentProject) return;
    setSubjectsByProject((prev) => ({
      ...prev,
      [currentProject.id]: (prev[currentProject.id] ?? []).filter((s) => s.id !== id),
    }));
  };

  const handleSubmitEntry = (entry: Omit<DataEntryRecord, "id" | "projectId" | "enteredAt" | "status">) => {
    if (!currentProject) return;
    const newEntry: DataEntryRecord = {
      ...entry,
      id: `entry-${Date.now()}`,
      projectId: currentProject.id,
      enteredAt: new Date().toISOString(),
      status: "submitted",
    };
    setDataEntriesByProject((prev) => ({
      ...prev,
      [currentProject.id]: [...(prev[currentProject.id] ?? []), newEntry],
    }));
  };

  const handleUpdateEntry = (entryId: string, value: string) => {
    if (!currentProject) return;
    setDataEntriesByProject((prev) => ({
      ...prev,
      [currentProject.id]: (prev[currentProject.id] ?? []).map((entry) =>
        entry.id === entryId ? { ...entry, value, updatedAt: new Date().toISOString() } : entry
      ),
    }));
  };

  const handleReviewEntry = (entryId: string, status: "reviewed" | "queried", reviewNote?: string) => {
    if (!currentProject) return;
    setDataEntriesByProject((prev) => ({
      ...prev,
      [currentProject.id]: (prev[currentProject.id] ?? []).map((entry) =>
        entry.id === entryId ? { ...entry, status, reviewNote } : entry
      ),
    }));
    const entry = (dataEntriesByProject[currentProject.id] ?? []).find((e) => e.id === entryId);
    if (entry) {
      const log: AuditLog = {
        id: `log-${Date.now()}`,
        user: userEmail,
        role: phase2Role,
        action: `${status === "reviewed" ? "Reviewed" : "Queried"} field ${entry.fieldLabel} for ${entry.subjectId}: ${reviewNote ?? ""}`,
        timestamp: new Date().toISOString(),
      };
      setAuditLogsByProject((prev) => ({
        ...prev,
        [currentProject.id]: [...(prev[currentProject.id] ?? []), log],
      }));
    }
  };

  if (view === "login") {
    return (
      <LoginView
        onLogin={(email) => {
          setUserEmail(email);
          setIsAuthed(true);
          setView("dashboard");
        }}
      />
    );
  }

  if (view === "faro" && currentProject?.status === "setup") {
    return (
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-slate-500">Loading FARO...</div>}>
        <FaroPhaseView
          project={currentProject}
          faroUnlocked={faroUnlocked}
          onFaroUnlock={setFaroUnlocked}
          finalizedCrfs={finalizedCrfs}
          rules={rules}
          onUpdateRule={(id, decision) => setRules((prev) => prev.map((r) => (r.id === id ? { ...r, decision } : r)))}
          onAddRule={(rule) => setRules((prev) => [...prev, { ...rule, id: `rule-${Date.now()}`, decision: "pending" as const, confidence: rule.confidence ?? 80 }])}
          onAiAlignAll={handleAiAlignAll}
          onFinalize={handleFinalizeCrfs}
          onBack={() => setView("dashboard")}
          approvedCount={approvedCount}
          rejectedCount={rejectedCount}
          decisionsDone={decisionsDone}
        />
      </Suspense>
    );
  }

  if (view === "tmf" && currentProject?.status === "pending") {
    return (
      <TmfView
        projects={projects}
        project={currentProject}
        onSelectProject={(id) => {
          const p = projects.find((pr) => pr.id === id);
          if (p) selectProject(p);
        }}
        userEmail={userEmail}
        docs={currentProjectDocs}
        signedOff={currentProjectDocs.length > 0 && currentProjectDocs.every((d) => d.signedBy.length > 0)}
        onBack={() => setView("dashboard")}
        onGenerateDocuments={handleGenerateDocuments}
        onAssignDoc={handleAssignDoc}
        onAssignAllDocs={handleAssignAllDocs}
        onDigitalSign={handleDigitalSign}
        onSignOff={handleSignOff}
        allDocsReadyForGoLive={currentProjectDocs.every((d) => d.signedBy.length > 0)}
      />
    );
  }

  if (view === "phase2" && currentProject?.status === "active") {
    return (
      <Phase2View
        project={currentProject}
        userEmail={userEmail}
        role={phase2Role}
        onRoleChange={setPhase2Role}
        subjects={currentSubjects}
        onEnroll={handleEnroll}
        onDelete={handleDeleteSubject}
        entries={currentEntries}
        finalizedCrfs={finalizedCrfs}
        onSubmitEntry={handleSubmitEntry}
        onUpdateEntry={handleUpdateEntry}
        onReviewEntry={handleReviewEntry}
        auditLogs={currentAuditLogs}
        onBackToDashboard={() => setView("dashboard")}
      />
    );
  }

  if (view === "dashboard" || (currentProject && currentProject.status !== "setup" && currentProject.status !== "pending" && currentProject.status !== "active")) {
    return (
      <DashboardView
        projects={projects}
        currentProject={currentProject}
        onSelectProject={selectProject}
        setProjects={setProjects}
        finalizedCrfsCount={finalizedCrfs.filter((r) => r.finalized).length}
        approvedRulesCount={approvedCount}
        rejectedRulesCount={rejectedCount}
        pendingRulesCount={rules.length - decisionsDone}
        tmfSignedOffCount={currentProject ? currentProjectDocs.filter((d) => d.signedBy.length > 0).length : 0}
        tmfTotalCount={currentProjectDocs.length}
        subjectCount={currentSubjects.length}
        entryCount={currentEntries.length}
        onNewProject={() => {
          const id = `p-${Date.now()}`;
          const newProject: Project = {
            id,
            title: "New Clinical Study",
            protocolId: `PROTO-${projects.length + 1}`,
            status: "setup",
            phase: "Phase 1",
            createdAt: new Date().toISOString(),
          };
          setProjects((prev) => [...prev, newProject]);
          setCurrentProject(newProject);
          setView("faro");
        }}
        onEditChecks={() => setView("faro")}
        onTMF={() => {
          if (currentProject) {
            setView("tmf");
          }
        }}
        onPhase2={() => setView("phase2")}
        faroUnlocked={faroUnlocked}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-red-600" />
          <span className="text-lg font-bold text-slate-900">ClearTrial Studio</span>
          {envBadge}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setThemeSettings((prev) => ({ ...prev, mode: prev.mode === "dark" ? "manual" : "dark", manualDark: prev.mode !== "dark" ? false : !prev.manualDark }))}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200" />
            <span className="text-sm font-medium text-slate-700">{userEmail}</span>
          </div>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">Welcome to ClearTrial Studio</h1>
          <p className="mt-2 text-slate-600">Select a project or create a new one to get started.</p>
          <button onClick={() => setView("dashboard")} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">
            Go to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

export default AppShell;
