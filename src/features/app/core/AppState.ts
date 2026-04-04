import { AppView, EnvironmentType, ThemeSettings, Project, EditRule, CrfRow, Subject, DataEntryRecord, AuditLog, StudyDocument, Phase2Role } from "./types";
import { INITIAL_PROJECTS } from "../constants";
import { INITIAL_CRF_ROWS, createSuggestedRules } from "../helpers";

export type { AppView, EnvironmentType, ThemeSettings, Project, EditRule, CrfRow, Subject, DataEntryRecord, AuditLog, StudyDocument, Phase2Role };

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: "manual",
  manualDark: false,
  customStart: "21:00",
  customEnd: "06:00",
  sunrise: "06:30",
  sunset: "18:30",
};

export const DEFAULT_PHASE2_ROLE: Phase2Role = "CRA";
export const DEFAULT_USER_EMAIL = "user@cleartrial.com";
export const DEFAULT_ENVIRONMENT: EnvironmentType = "uat";
export const DEFAULT_VIEW: AppView = "login";

export const INITIAL_STATE = {
  themeSettings: DEFAULT_THEME_SETTINGS,
  view: DEFAULT_VIEW as AppView,
  environment: DEFAULT_ENVIRONMENT as EnvironmentType,
  userEmail: DEFAULT_USER_EMAIL,
  isAuthed: false,
  projects: INITIAL_PROJECTS,
  currentProject: null as Project | null,
  faroUnlocked: false,
  finalizedCrfs: INITIAL_CRF_ROWS,
  rules: createSuggestedRules(INITIAL_CRF_ROWS),
  tmfDocsByProject: {} as Record<string, StudyDocument[]>,
  phase2Role: DEFAULT_PHASE2_ROLE as Phase2Role,
  subjectsByProject: {} as Record<string, Subject[]>,
  dataEntriesByProject: {} as Record<string, DataEntryRecord[]>,
  auditLogsByProject: {} as Record<string, AuditLog[]>,
};

export const getProjectDerived = (
  currentProject: Project | null,
  tmfDocsByProject: Record<string, StudyDocument[]>,
  subjectsByProject: Record<string, Subject[]>,
  dataEntriesByProject: Record<string, DataEntryRecord[]>,
  auditLogsByProject: Record<string, AuditLog[]>
) => {
  const currentProjectId = currentProject?.id ?? "";
  return {
    currentProjectId,
    currentProjectDocs: currentProjectId ? tmfDocsByProject[currentProjectId] ?? [] : [],
    currentSubjects: currentProjectId ? subjectsByProject[currentProjectId] ?? [] : [],
    currentEntries: currentProjectId ? dataEntriesByProject[currentProjectId] ?? [] : [],
    currentAuditLogs: currentProjectId ? auditLogsByProject[currentProjectId] ?? [] : [],
  };
};
