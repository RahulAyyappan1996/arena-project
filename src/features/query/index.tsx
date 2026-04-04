import { useMemo, useState } from "react";
import { Download, Plus, X } from "lucide-react";
import { QueryRecord, QueryRole, QuerySource, QueryStatus } from "./types";
import { isoDaysAgo, downloadCsv, ageInDays } from "./queryUtils";
import { SummaryCard, FilterSelect, InputField, SearchInput } from "./QueryFilters";
import { QueryTable } from "./QueryTable";
import { QueryDetailModal } from "./QueryDetailModal";
import { BulkActionsBar } from "./BulkActionsBar";

const INITIAL_QUERY_DATA: QueryRecord[] = [
  {
    id: "QRY-1001",
    subject: "001-001",
    site: "001",
    visit: "Day 1",
    formType: "Demographics",
    crfField: "Ethnicity",
    queryText: "Ethnicity missing",
    fullDescription: "System-generated missing value query. Ethnicity is required for demographic completeness.",
    status: "open",
    assignedTo: "CRA",
    createdDate: isoDaysAgo(2),
    source: "system",
    dataPointRef: "DEMOGRAPHICS.ETHNICITY",
    responses: [],
  },
  {
    id: "QRY-1002",
    subject: "001-002",
    site: "001",
    visit: "Day 7",
    formType: "Vital Signs",
    crfField: "Diastolic BP",
    queryText: "Diastolic BP exceeds expected range",
    fullDescription: "Edit-check generated query: value 125 mmHg exceeds configured range 40-120.",
    status: "pending",
    assignedTo: "CRA",
    createdDate: isoDaysAgo(5),
    source: "edit-check",
    dataPointRef: "VITAL_SIGNS.DBP",
    responses: [
      { id: "R1", by: "Sarah Miller", role: "CRA", message: "Will recheck source worksheet.", timestamp: isoDaysAgo(4) },
    ],
  },
  {
    id: "QRY-1003",
    subject: "001-003",
    site: "001",
    visit: "Day 14",
    formType: "Adverse Events",
    crfField: "AE End Date",
    queryText: "End date earlier than start date",
    fullDescription: "Date sequencing check failed: AE end date cannot precede start date.",
    status: "escalated",
    assignedTo: "PI",
    createdDate: isoDaysAgo(9),
    source: "edit-check",
    dataPointRef: "AE.END_DATE",
    responses: [
      { id: "R2", by: "DM Reviewer", role: "DM", message: "Please confirm chronology from source docs.", timestamp: isoDaysAgo(8) },
    ],
  },
  {
    id: "QRY-1004",
    subject: "002-001",
    site: "002",
    visit: "Screening",
    formType: "Informed Consent",
    crfField: "Consent Date",
    queryText: "Consent date after first procedure",
    fullDescription: "Manual DM query for protocol compliance. Consent must be before any trial procedure.",
    status: "open",
    assignedTo: "CRA",
    createdDate: isoDaysAgo(1),
    source: "manual",
    dataPointRef: "ICF.CONSENT_DATE",
    responses: [],
  },
  {
    id: "QRY-1005",
    subject: "002-002",
    site: "002",
    visit: "Day 21",
    formType: "Labs",
    crfField: "ALT",
    queryText: "Lab/EDC mismatch ALT",
    fullDescription: "Lab feed 62 does not match EDC entry 52. Reconciliation required.",
    status: "pending",
    assignedTo: "DM",
    createdDate: isoDaysAgo(7),
    source: "lab-recon",
    dataPointRef: "LAB.ALT",
    responses: [
      { id: "R3", by: "Site Coordinator", role: "CRA", message: "Corrected in source; awaiting upload.", timestamp: isoDaysAgo(6) },
    ],
  },
  {
    id: "QRY-1006",
    subject: "002-003",
    site: "002",
    visit: "Day 28",
    formType: "Concomitant Medication",
    crfField: "Start Date",
    queryText: "Missing CM start date",
    fullDescription: "System query for required field completeness.",
    status: "open",
    assignedTo: "CRA",
    createdDate: isoDaysAgo(11),
    source: "system",
    dataPointRef: "CM.START_DATE",
    responses: [],
  },
  {
    id: "QRY-1007",
    subject: "003-001",
    site: "003",
    visit: "Day 1",
    formType: "ECG",
    crfField: "QTc",
    queryText: "QTc value requires medical review",
    fullDescription: "Manual medical query from PI for QTc > 500 ms.",
    status: "escalated",
    assignedTo: "PI",
    createdDate: isoDaysAgo(3),
    source: "manual",
    dataPointRef: "ECG.QTC",
    responses: [
      { id: "R4", by: "PI", role: "PI", message: "Cardiology review requested.", timestamp: isoDaysAgo(2) },
    ],
  },
  {
    id: "QRY-1008",
    subject: "003-002",
    site: "003",
    visit: "Day 7",
    formType: "Demographics",
    crfField: "Sex",
    queryText: "Inconsistent sex between EDC and source",
    fullDescription: "System query triggered by discrepancy on source verification import.",
    status: "closed",
    assignedTo: "DM",
    createdDate: isoDaysAgo(0),
    source: "system",
    dataPointRef: "DEMOGRAPHICS.SEX",
    responses: [
      { id: "R5", by: "DM", role: "DM", message: "Resolved after source verification.", timestamp: isoDaysAgo(0) },
    ],
  },
  {
    id: "QRY-1009",
    subject: "004-001",
    site: "004",
    visit: "Day 14",
    formType: "Vital Signs",
    crfField: "Heart Rate",
    queryText: "Potential transcription error",
    fullDescription: "Edit-check detected abrupt change > 40 bpm from prior visit.",
    status: "pending",
    assignedTo: "CRA",
    createdDate: isoDaysAgo(4),
    source: "edit-check",
    dataPointRef: "VITAL_SIGNS.HEART_RATE",
    responses: [
      { id: "R6", by: "CRA", role: "CRA", message: "Device log being reviewed.", timestamp: isoDaysAgo(3) },
    ],
  },
  {
    id: "QRY-1010",
    subject: "004-002",
    site: "004",
    visit: "Day 56",
    formType: "Adverse Events",
    crfField: "Severity",
    queryText: "Severity missing for AE term",
    fullDescription: "System check requires severity when AE is reported.",
    status: "open",
    assignedTo: "CRA",
    createdDate: isoDaysAgo(10),
    source: "system",
    dataPointRef: "AE.SEVERITY",
    responses: [],
  },
  {
    id: "QRY-1011",
    subject: "001-004",
    site: "001",
    visit: "Day 21",
    formType: "Labs",
    crfField: "Creatinine",
    queryText: "Unit mismatch mg/dL vs umol/L",
    fullDescription: "Lab reconciliation requires unit standardization before SDTM export.",
    status: "pending",
    assignedTo: "DM",
    createdDate: isoDaysAgo(6),
    source: "lab-recon",
    dataPointRef: "LAB.CREATININE",
    responses: [],
  },
  {
    id: "QRY-1012",
    subject: "002-004",
    site: "002",
    visit: "Day 70",
    formType: "Study Exit",
    crfField: "Reason for Discontinuation",
    queryText: "Discontinuation reason incomplete",
    fullDescription: "Manual sponsor query for final status documentation.",
    status: "open",
    assignedTo: "PI",
    createdDate: isoDaysAgo(8),
    source: "manual",
    dataPointRef: "EOS.DISCONT_REASON",
    responses: [],
  },
];

type NewQueryForm = {
  subject: string;
  site: string;
  visit: string;
  formType: string;
  crfField: string;
  queryText: string;
  fullDescription: string;
  assignedTo: QueryRole;
  source: QuerySource;
  dataPointRef: string;
};

const initialNewQuery: NewQueryForm = {
  subject: "",
  site: "001",
  visit: "Day 1",
  formType: "Demographics",
  crfField: "",
  queryText: "",
  fullDescription: "",
  assignedTo: "CRA",
  source: "manual",
  dataPointRef: "",
};

type Props = {
  onCloseForReadiness?: (count: number) => void;
};

export default function QueryManager({ onCloseForReadiness }: Props) {
  const [queryRows, setQueryRows] = useState<QueryRecord[]>(INITIAL_QUERY_DATA);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | QueryStatus>("all");
  const [filterRole, setFilterRole] = useState<"all" | QueryRole>("all");
  const [filterSite, setFilterSite] = useState("all");
  const [filterVisit, setFilterVisit] = useState("all");
  const [filterForm, setFilterForm] = useState("all");
  const [filterSource, setFilterSource] = useState<"all" | QuerySource>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAssignee, setBulkAssignee] = useState<QueryRole>("CRA");
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  const [responseDraft, setResponseDraft] = useState("");
  const [newStatus, setNewStatus] = useState<QueryStatus>("open");
  const [newQueryOpen, setNewQueryOpen] = useState(false);
  const [newQuery, setNewQuery] = useState<NewQueryForm>(initialNewQuery);

  const sites = useMemo(() => Array.from(new Set(queryRows.map((item) => item.site))), [queryRows]);
  const visits = useMemo(() => Array.from(new Set(queryRows.map((item) => item.visit))), [queryRows]);
  const forms = useMemo(() => Array.from(new Set(queryRows.map((item) => item.formType))), [queryRows]);
  const subjects = useMemo(() => Array.from(new Set(queryRows.map((item) => item.subject))), [queryRows]);

  const filteredRows = useMemo(() => {
    return queryRows.filter((row) => {
      const text = `${row.id} ${row.subject} ${row.crfField} ${row.queryText}`.toLowerCase();
      const inSearch = !search || text.includes(search.toLowerCase());
      const inStatus = filterStatus === "all" || row.status === filterStatus;
      const inRole = filterRole === "all" || row.assignedTo === filterRole;
      const inSite = filterSite === "all" || row.site === filterSite;
      const inVisit = filterVisit === "all" || row.visit === filterVisit;
      const inForm = filterForm === "all" || row.formType === filterForm;
      const inSource = filterSource === "all" || row.source === filterSource;

      const created = new Date(row.createdDate).getTime();
      const inStart = !startDate || created >= new Date(`${startDate}T00:00:00`).getTime();
      const inEnd = !endDate || created <= new Date(`${endDate}T23:59:59`).getTime();

      return inSearch && inStatus && inRole && inSite && inVisit && inForm && inSource && inStart && inEnd;
    });
  }, [queryRows, search, filterStatus, filterRole, filterSite, filterVisit, filterForm, filterSource, startDate, endDate]);

  const selectedQuery = useMemo(
    () => queryRows.find((row) => row.id === selectedQueryId) ?? null,
    [queryRows, selectedQueryId]
  );

  const selectedSubject = selectedQuery?.subject ?? "all";

  const subjectScoped = useMemo(() => {
    if (selectedSubject === "all") return queryRows;
    return queryRows.filter((row) => row.subject === selectedSubject);
  }, [queryRows, selectedSubject]);

  const summary = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const open = subjectScoped.filter((q) => q.status === "open").length;
    const pending = subjectScoped.filter((q) => q.status === "pending").length;
    const closedToday = subjectScoped.filter((q) => q.status === "closed" && q.responses.some((r) => r.timestamp.slice(0, 10) === todayIso)).length;
    const overdue = subjectScoped.filter((q) => q.status !== "closed" && ageInDays(q.createdDate) > 7).length;
    return { open, pending, closedToday, overdue };
  }, [subjectScoped]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const selectAllFiltered = () => {
    setSelectedIds(filteredRows.map((row) => row.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const runBulkReassign = () => {
    if (selectedIds.length === 0) return;
    setQueryRows((prev) => prev.map((row) => (selectedIds.includes(row.id) ? { ...row, assignedTo: bulkAssignee, status: row.status === "open" ? "pending" : row.status } : row)));
  };

  const runBulkClose = () => {
    if (selectedIds.length === 0) return;
    setQueryRows((prev) =>
      prev.map((row) => {
        if (!selectedIds.includes(row.id)) return row;
        if (row.status === "closed") return row;
        return {
          ...row,
          status: "closed" as QueryStatus,
          responses: [
            ...row.responses,
            {
              id: `SYS-${Date.now()}-${row.id}`,
              by: "Bulk Action",
              role: "DM" as QueryRole,
              message: "Closed via bulk action.",
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
    onCloseForReadiness?.(selectedIds.length);
    setSelectedIds([]);
  };

  const exportVisible = () => {
    const lines = [
      ["Query ID", "Subject", "CRF Field", "Query Text", "Status", "Age (days)", "Assigned To", "Created Date", "Source"].join(","),
      ...filteredRows.map((row) =>
        [
          row.id,
          row.subject,
          row.crfField,
          `"${row.queryText.replace(/"/g, '""')}"`,
          row.status,
          String(ageInDays(row.createdDate)),
          row.assignedTo,
          row.createdDate,
          row.source,
        ].join(",")
      ),
    ];
    downloadCsv("cleartrial-query-manager.csv", lines);
  };

  const submitResponse = () => {
    if (!selectedQuery || !responseDraft.trim()) return;
    setQueryRows((prev) =>
      prev.map((row) => {
        if (row.id !== selectedQuery.id) return row;
        return {
          ...row,
          status: newStatus,
          responses: [
            ...row.responses,
            {
              id: `RESP-${Date.now()}`,
              by: "Current User",
              role: row.assignedTo,
              message: responseDraft.trim(),
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
    if (newStatus === "closed") onCloseForReadiness?.(1);
    setResponseDraft("");
  };

  const createNewQuery = () => {
    if (!newQuery.subject || !newQuery.crfField || !newQuery.queryText) return;
    const created: QueryRecord = {
      id: `QRY-${1000 + queryRows.length + 1}`,
      subject: newQuery.subject,
      site: newQuery.site,
      visit: newQuery.visit,
      formType: newQuery.formType,
      crfField: newQuery.crfField,
      queryText: newQuery.queryText,
      fullDescription: newQuery.fullDescription || newQuery.queryText,
      status: "open",
      assignedTo: newQuery.assignedTo,
      createdDate: new Date().toISOString(),
      source: newQuery.source,
      dataPointRef: newQuery.dataPointRef || `${newQuery.formType}.${newQuery.crfField}`,
      responses: [],
    };
    setQueryRows((prev) => [created, ...prev]);
    setNewQueryOpen(false);
    setNewQuery(initialNewQuery);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Query Manager</h2>
          <p className="mt-1 text-sm text-slate-600">Clinical query workflow across manual, system, edit-check, and reconciliation-driven queries.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setNewQueryOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
            <Plus size={16} /> Create New Query
          </button>
          <button onClick={exportVisible} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="Open Queries" value={summary.open} tone="red" />
        <SummaryCard label="Pending Response" value={summary.pending} tone="amber" />
        <SummaryCard label="Closed Today" value={summary.closedToday} tone="emerald" />
        <SummaryCard label="Overdue (>7d)" value={summary.overdue} tone="violet" />
      </div>

      <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 lg:grid-cols-4">
        <SearchInput value={search} onChange={setSearch} />
        <FilterSelect label="Status" value={filterStatus} onChange={(value) => setFilterStatus(value as "all" | QueryStatus)} options={["all", "open", "pending", "closed", "escalated"]} />
        <FilterSelect label="Assigned To" value={filterRole} onChange={(value) => setFilterRole(value as "all" | QueryRole)} options={["all", ...["CRA", "DM", "PI"]]} />
        <FilterSelect label="Site" value={filterSite} onChange={setFilterSite} options={["all", ...sites]} />
        <FilterSelect label="Visit" value={filterVisit} onChange={setFilterVisit} options={["all", ...visits]} />
        <FilterSelect label="Form Type" value={filterForm} onChange={setFilterForm} options={["all", ...forms]} />
        <FilterSelect label="Data Source" value={filterSource} onChange={(value) => setFilterSource(value as "all" | QuerySource)} options={["all", "manual", "system", "edit-check", "lab-recon"]} />
        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Start Date</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm" />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">End Date</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm" />
        </label>
      </div>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        bulkAssignee={bulkAssignee}
        onBulkAssigneeChange={setBulkAssignee}
        onSelectAll={selectAllFiltered}
        onClearSelection={clearSelection}
        onBulkReassign={runBulkReassign}
        onBulkClose={runBulkClose}
      />

      <QueryTable
        rows={filteredRows}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onSelectRow={(id, status) => {
          setSelectedQueryId(id);
          setNewStatus(status);
        }}
      />

      {selectedQuery && (
        <QueryDetailModal
          query={selectedQuery}
          responseDraft={responseDraft}
          newStatus={newStatus}
          onClose={() => setSelectedQueryId(null)}
          onStatusChange={setNewStatus}
          onResponseChange={setResponseDraft}
          onSubmit={submitResponse}
          onCloseForReadiness={onCloseForReadiness}
        />
      )}

      {newQueryOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Create New Query</h3>
              <button onClick={() => setNewQueryOpen(false)} className="rounded-md border border-slate-300 p-1"><X size={16} /></button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <InputField label="Subject" value={newQuery.subject} onChange={(value) => setNewQuery((prev) => ({ ...prev, subject: value }))} placeholder={subjects[0] ?? "001-001"} />
              <FilterSelect label="Site" value={newQuery.site} onChange={(value) => setNewQuery((prev) => ({ ...prev, site: value }))} options={sites} />
              <InputField label="Visit" value={newQuery.visit} onChange={(value) => setNewQuery((prev) => ({ ...prev, visit: value }))} />
              <InputField label="Form Type" value={newQuery.formType} onChange={(value) => setNewQuery((prev) => ({ ...prev, formType: value }))} />
              <InputField label="CRF Field" value={newQuery.crfField} onChange={(value) => setNewQuery((prev) => ({ ...prev, crfField: value }))} />
              <FilterSelect label="Assigned To" value={newQuery.assignedTo} onChange={(value) => setNewQuery((prev) => ({ ...prev, assignedTo: value as QueryRole }))} options={["CRA", "DM", "PI"]} />
              <FilterSelect label="Source" value={newQuery.source} onChange={(value) => setNewQuery((prev) => ({ ...prev, source: value as QuerySource }))} options={["manual", "system", "edit-check", "lab-recon"]} />
              <InputField label="Data Point Ref" value={newQuery.dataPointRef} onChange={(value) => setNewQuery((prev) => ({ ...prev, dataPointRef: value }))} placeholder="FORM.FIELD" />
              <label className="md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Query Text</span>
                <input value={newQuery.queryText} onChange={(e) => setNewQuery((prev) => ({ ...prev, queryText: e.target.value }))} className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm" />
              </label>
              <label className="md:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Full Description</span>
                <textarea value={newQuery.fullDescription} onChange={(e) => setNewQuery((prev) => ({ ...prev, fullDescription: e.target.value }))} rows={3} className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm" />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setNewQueryOpen(false)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Cancel</button>
              <button onClick={createNewQuery} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Create Query</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}