import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Clock3, ClipboardList, FlaskConical, Info, Plus, Table, Trash2, UploadCloud, UserCheck, Users } from "lucide-react";
import { StatCard } from "../shared/StatCard";
import { Project, Subject, DataEntryRecord, AuditLog, CrfRow, CrfFieldType, Phase2Role, DataHubRecord, DataSourceType } from "../types";
import { SITE_DIRECTORY, MATRIX, CRF_FIELD_LIBRARY, DAYS, MOCK_DATAHUB_EXTERNAL, REGION_OPTIONS, COUNTRY_OPTIONS } from "../constants";

export function Phase2View({
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
