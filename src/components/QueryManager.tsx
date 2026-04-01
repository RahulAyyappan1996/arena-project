import { useMemo, useState } from "react";
import { AlertTriangle, Download, Plus, Search, X } from "lucide-react";

type QueryStatus = "open" | "pending" | "closed" | "escalated";
type QuerySource = "manual" | "system" | "edit-check" | "lab-recon";
type QueryRole = "CRA" | "DM" | "PI";

type QueryResponse = {
  id: string;
  by: string;
  role: QueryRole;
  message: string;
  timestamp: string;
};

type QueryRecord = {
  id: string;
  subject: string;
  site: string;
  visit: string;
  formType: string;
  crfField: string;
  queryText: string;
  fullDescription: string;
  status: QueryStatus;
  assignedTo: QueryRole;
  createdDate: string;
  source: QuerySource;
  dataPointRef: string;
  responses: QueryResponse[];
};

const STATUS_CLASS: Record<QueryStatus, string> = {
  open: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  closed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  escalated: "bg-violet-100 text-violet-800 border-violet-200",
};

const SOURCE_CLASS: Record<QuerySource, string> = {
  manual: "bg-slate-100 text-slate-700",
  system: "bg-blue-100 text-blue-700",
  "edit-check": "bg-indigo-100 text-indigo-700",
  "lab-recon": "bg-cyan-100 text-cyan-700",
};

const ROLE_OPTIONS: QueryRole[] = ["CRA", "DM", "PI"];

function isoDaysAgo(days: number) {
  const now = new Date();
  now.setDate(now.getDate() - days);
  return now.toISOString();
}

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

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function ageInDays(value: string) {
  const created = new Date(value).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - created) / (1000 * 60 * 60 * 24)));
}

function downloadCsv(filename: string, lines: string[]) {
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

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

  const [newQuery, setNewQuery] = useState({
    subject: "",
    site: "001",
    visit: "Day 1",
    formType: "Demographics",
    crfField: "",
    queryText: "",
    fullDescription: "",
    assignedTo: "CRA" as QueryRole,
    source: "manual" as QuerySource,
    dataPointRef: "",
  });

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
              role: "DM",
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
    setNewQuery({
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
    });
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
        <label className="lg:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
          <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
            <Search size={14} className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Query ID, subject, field, text" className="w-full outline-none" />
          </div>
        </label>
        <FilterSelect label="Status" value={filterStatus} onChange={(value) => setFilterStatus(value as "all" | QueryStatus)} options={["all", "open", "pending", "closed", "escalated"]} />
        <FilterSelect label="Assigned To" value={filterRole} onChange={(value) => setFilterRole(value as "all" | QueryRole)} options={["all", ...ROLE_OPTIONS]} />
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

      <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <button onClick={selectAllFiltered} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700">Select All</button>
        <button onClick={clearSelection} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700">Clear</button>
        <div>
          <span className="mb-1 block text-[11px] font-semibold uppercase text-slate-500">Bulk Reassign</span>
          <div className="flex gap-2">
            <select value={bulkAssignee} onChange={(e) => setBulkAssignee(e.target.value as QueryRole)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs">
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <button onClick={runBulkReassign} className="rounded-md bg-blue-600 px-2 py-1.5 text-xs font-semibold text-white">Reassign</button>
          </div>
        </div>
        <button onClick={runBulkClose} className="rounded-md bg-emerald-600 px-2 py-1.5 text-xs font-semibold text-white">Close Selected ({selectedIds.length})</button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-2" />
              <th className="px-3 py-2">Query ID</th>
              <th className="px-3 py-2">Subject</th>
              <th className="px-3 py-2">CRF Field</th>
              <th className="px-3 py-2">Query Text</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Age (days)</th>
              <th className="px-3 py-2">Assigned To</th>
              <th className="px-3 py-2">Created Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const age = ageInDays(row.createdDate);
              const overdue = row.status !== "closed" && age > 7;
              return (
                <tr
                  key={row.id}
                  className={`cursor-pointer border-t border-slate-200 ${overdue ? "bg-amber-50" : "bg-white hover:bg-slate-50"}`}
                  onClick={() => {
                    setSelectedQueryId(row.id);
                    setNewStatus(row.status);
                  }}
                >
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelect(row.id)} />
                  </td>
                  <td className="px-3 py-2 font-semibold text-slate-800">{row.id}</td>
                  <td className="px-3 py-2 text-slate-700">{row.subject}</td>
                  <td className="px-3 py-2 text-slate-700">{row.formType}.{row.crfField}</td>
                  <td className="px-3 py-2 text-slate-700">
                    <div className="max-w-sm">
                      <p className="truncate">{row.queryText}</p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${SOURCE_CLASS[row.source]}`}>{row.source}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[row.status]}`}>{row.status}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={overdue ? "font-semibold text-amber-700" : "text-slate-700"}>{age}</span>
                    {overdue && <AlertTriangle size={12} className="ml-1 inline text-amber-600" />}
                  </td>
                  <td className="px-3 py-2 text-slate-700">{row.assignedTo}</td>
                  <td className="px-3 py-2 text-slate-700">{new Date(row.createdDate).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedQuery && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Query Detail</p>
                <h3 className="text-xl font-semibold text-slate-900">{selectedQuery.id} · {selectedQuery.formType}.{selectedQuery.crfField}</h3>
              </div>
              <button onClick={() => setSelectedQueryId(null)} className="rounded-md border border-slate-300 p-1 text-slate-700"><X size={16} /></button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Full Query Description</p>
                <p className="mt-2 text-sm text-slate-800">{selectedQuery.fullDescription}</p>
                <div className="mt-3 grid gap-2 text-xs text-slate-600">
                  <p><span className="font-semibold">Subject:</span> {selectedQuery.subject}</p>
                  <p><span className="font-semibold">Site:</span> {selectedQuery.site}</p>
                  <p><span className="font-semibold">Visit:</span> {selectedQuery.visit}</p>
                  <p><span className="font-semibold">Created:</span> {formatDate(selectedQuery.createdDate)}</p>
                </div>
                <button className="mt-3 rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">Go To Data Point: {selectedQuery.dataPointRef}</button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Response Thread (Time-Stamped)</p>
                <div className="mt-2 max-h-44 space-y-2 overflow-y-auto pr-1">
                  {selectedQuery.responses.length === 0 ? (
                    <p className="text-sm text-slate-500">No responses yet.</p>
                  ) : (
                    selectedQuery.responses
                      .slice()
                      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                      .map((response) => (
                        <div key={response.id} className="rounded-md border border-slate-200 bg-slate-50 p-2 text-sm">
                          <p className="font-semibold text-slate-800">{response.by} ({response.role})</p>
                          <p className="text-slate-700">{response.message}</p>
                          <p className="text-[11px] text-slate-500">{formatDate(response.timestamp)}</p>
                        </div>
                      ))
                  )}
                </div>

                <div className="mt-3 grid gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Change Status</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as QueryStatus)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                    <option value="escalated">Escalated</option>
                  </select>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add Response</label>
                  <textarea value={responseDraft} onChange={(e) => setResponseDraft(e.target.value)} rows={3} className="rounded-md border border-slate-300 px-2 py-2 text-sm" placeholder="Type your response..." />
                  <button onClick={submitResponse} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Submit Response</button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              <FilterSelect label="Assigned To" value={newQuery.assignedTo} onChange={(value) => setNewQuery((prev) => ({ ...prev, assignedTo: value as QueryRole }))} options={ROLE_OPTIONS} />
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

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "red" | "amber" | "emerald" | "violet" }) {
  const toneClass = {
    red: "border-red-200 bg-red-50 text-red-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    violet: "border-violet-200 bg-violet-50 text-violet-800",
  }[tone];

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm" />
    </label>
  );
}
