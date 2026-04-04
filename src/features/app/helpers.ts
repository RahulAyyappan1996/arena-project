import { CrfStandard, CrfFieldType, ThemeSettings, Subject, DataEntryRecord, AuditLog, Project, CrfRow, EditRule, CrfDefinition, CrfFieldTemplate } from "./types";
import { CRF_STANDARDS_LIBRARY, CRF_FIELD_LIBRARY, PROTOCOL_DATA, SITE_DIRECTORY, DAYS, MATRIX } from "./constants";

export function findStandardIdByActivity(activity: string) {
  const match = CRF_STANDARDS_LIBRARY.find((std) => std.name.toLowerCase() === activity.toLowerCase());
  return match?.id;
}

export function buildInitialCrfDefinitions(activities: string[]): CrfDefinition[] {
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

export function flattenDefinitionsToRows(definitions: CrfDefinition[]): CrfRow[] {
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

export const INITIAL_CRF_DEFINITIONS: CrfDefinition[] = buildInitialCrfDefinitions([
  "Demographics",
  "Informed Consent",
  "Vital Signs",
  "Medical History",
  "Adverse Events",
]);

export const INITIAL_CRF_ROWS: CrfRow[] = flattenDefinitionsToRows(INITIAL_CRF_DEFINITIONS);

export function createSuggestedRules(crfs: CrfRow[]): EditRule[] {
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

export function buildStudyDocuments(project: Project | null, crfs: CrfRow[], rules: EditRule[]): import("./types").StudyDocument[] {
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
    status: "generated" as const,
  }));
}

export function toMinutes(value: string): number {
  const [hours, mins] = value.split(":").map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(mins)) return 0;
  return hours * 60 + mins;
}

export function isInsideTimeRange(now: number, start: number, end: number): boolean {
  if (start === end) return false;
  if (start < end) return now >= start && now < end;
  return now >= start || now < end;
}

export function computeNightMode(settings: ThemeSettings, now: Date): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (settings.mode === "manual") {
    return settings.manualDark;
  }

  if (settings.mode === "custom-time") {
    return isInsideTimeRange(nowMinutes, toMinutes(settings.customStart), toMinutes(settings.customEnd));
  }

  return isInsideTimeRange(nowMinutes, toMinutes(settings.sunset), toMinutes(settings.sunrise));
}

export function createSeededLiveStudyData(projectId: string, subjectCount = 100) {
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
