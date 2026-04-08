import React, { useState } from "react";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  ArrowLeft,
  UserCheck,
  MessageSquare,
  FileText,
  Filter,
  Search,
} from "lucide-react";

interface SDVProps {
  onBack: () => void;
}

type SDVStatus = "pending" | "in-progress" | "completed" | "queried";

type SDVItem = {
  id: string;
  subjectId: string;
  visit: string;
  formType: string;
  fieldLabel: string;
  enteredValue: string;
  sourceValue: string;
  status: SDVStatus;
  assignedTo: string;
  assignedRole: "CRA" | "DM" | "PI";
  lastVerified?: string;
  discrepancy?: boolean;
  queryRaised?: boolean;
};

const mockSDVItems: SDVItem[] = [
  {
    id: "sdv-1",
    subjectId: "001-001",
    visit: "Screening",
    formType: "Demographics",
    fieldLabel: "Date of Birth",
    enteredValue: "1985-03-15",
    sourceValue: "1985-03-15",
    status: "completed",
    assignedTo: "CRA001",
    assignedRole: "CRA",
    lastVerified: "2026-04-01T10:30:00Z",
    discrepancy: false,
  },
  {
    id: "sdv-2",
    subjectId: "001-002",
    visit: "Day 1",
    formType: "Vital Signs",
    fieldLabel: "Systolic Blood Pressure",
    enteredValue: "140",
    sourceValue: "135",
    status: "queried",
    assignedTo: "CRA001",
    assignedRole: "CRA",
    lastVerified: "2026-04-02T14:20:00Z",
    discrepancy: true,
    queryRaised: true,
  },
  {
    id: "sdv-3",
    subjectId: "002-001",
    visit: "Day 7",
    formType: "Adverse Events",
    fieldLabel: "AE Start Date",
    enteredValue: "2026-04-03",
    sourceValue: "2026-04-03",
    status: "in-progress",
    assignedTo: "CRA002",
    assignedRole: "CRA",
  },
  {
    id: "sdv-4",
    subjectId: "003-001",
    visit: "Day 14",
    formType: "Laboratory Results",
    fieldLabel: "ALT",
    enteredValue: "45",
    sourceValue: "48",
    status: "pending",
    assignedTo: "CRA001",
    assignedRole: "CRA",
    discrepancy: true,
  },
  {
    id: "sdv-5",
    subjectId: "001-001",
    visit: "Day 21",
    formType: "Vital Signs",
    fieldLabel: "Heart Rate",
    enteredValue: "72",
    sourceValue: "72",
    status: "completed",
    assignedTo: "DM001",
    assignedRole: "DM",
    lastVerified: "2026-04-05T09:15:00Z",
    discrepancy: false,
  },
];

const statusConfig = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
  "in-progress": { icon: Eye, color: "text-blue-600", bg: "bg-blue-50", label: "In Progress" },
  completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Completed" },
  queried: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", label: "Queried" },
};

export default function SDV({ onBack }: SDVProps) {
  const [sdvItems, setSDVItems] = useState<SDVItem[]>(mockSDVItems);
  const [selectedItem, setSelectedItem] = useState<SDVItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<SDVStatus | "all">("all");
  const [filterRole, setFilterRole] = useState<"CRA" | "DM" | "PI" | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = sdvItems.filter(item => {
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesRole = filterRole === "all" || item.assignedRole === filterRole;
    const matchesSearch = item.subjectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.formType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesRole && matchesSearch;
  });

  const handleStatusChange = (itemId: string, newStatus: SDVStatus) => {
    setSDVItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, status: newStatus, lastVerified: new Date().toISOString() }
          : item
      )
    );
  };

  const handleRaiseQuery = (itemId: string) => {
    setSDVItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, status: "queried", queryRaised: true }
          : item
      )
    );
  };

  const stats = {
    total: sdvItems.length,
    pending: sdvItems.filter(item => item.status === "pending").length,
    completed: sdvItems.filter(item => item.status === "completed").length,
    discrepancies: sdvItems.filter(item => item.discrepancy).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Source Data Verification (SDV)</h1>
            <p className="text-sm text-slate-600">Role-based verification of entered data against source documents</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-slate-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-600">Total Items</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
              <p className="text-sm text-slate-600">Pending</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
              <p className="text-sm text-slate-600">Completed</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.discrepancies}</p>
              <p className="text-sm text-slate-600">Discrepancies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filters:</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as SDVStatus | "all")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="queried">Queried</option>
        </select>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as "CRA" | "DM" | "PI" | "all")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All Roles</option>
          <option value="CRA">CRA</option>
          <option value="DM">DM</option>
          <option value="PI">PI</option>
        </select>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subject or form..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm w-64"
          />
        </div>
      </div>

      {/* SDV Items Table */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">SDV Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Subject/Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Form/Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Data Comparison
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((item) => {
                const config = statusConfig[item.status];
                const Icon = config.icon;
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{item.subjectId}</p>
                        <p className="text-sm text-slate-500">{item.visit}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{item.formType}</p>
                        <p className="text-sm text-slate-500">{item.fieldLabel}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Entered:</span>
                          <span className="text-sm font-medium text-slate-900">{item.enteredValue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Source:</span>
                          <span className={`text-sm font-medium ${item.discrepancy ? 'text-red-600' : 'text-green-600'}`}>
                            {item.sourceValue}
                          </span>
                          {item.discrepancy && <AlertTriangle size={12} className="text-red-500" />}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
                        <Icon size={12} />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{item.assignedTo}</p>
                        <p className="text-sm text-slate-500">{item.assignedRole}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={12} />
                          Review
                        </button>
                        {item.status === "pending" && (
                          <button
                            onClick={() => handleStatusChange(item.id, "in-progress")}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                          >
                            <UserCheck size={12} />
                            Start
                          </button>
                        )}
                        {item.status === "in-progress" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(item.id, "completed")}
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle size={12} />
                              Complete
                            </button>
                            {item.discrepancy && !item.queryRaised && (
                              <button
                                onClick={() => handleRaiseQuery(item.id)}
                                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                <MessageSquare size={12} />
                                Query
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">SDV Review: {selectedItem.subjectId} - {selectedItem.formType}</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Source Document Preview */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Source Document</h4>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="aspect-[4/3] bg-white rounded border flex items-center justify-center">
                    <FileText size={48} className="text-slate-400" />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Source document preview would be displayed here</p>
                </div>
              </div>

              {/* Data Comparison */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Data Verification</h4>
                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200 p-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Field: {selectedItem.fieldLabel}</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Entered Value</label>
                        <div className="rounded border border-slate-300 px-3 py-2 bg-slate-50 text-sm">
                          {selectedItem.enteredValue}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Source Value</label>
                        <div className={`rounded border px-3 py-2 text-sm ${
                          selectedItem.discrepancy ? 'border-red-300 bg-red-50 text-red-900' : 'border-green-300 bg-green-50 text-green-900'
                        }`}>
                          {selectedItem.sourceValue}
                          {selectedItem.discrepancy && <AlertTriangle size={12} className="inline ml-1" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedItem.discrepancy && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Discrepancy Detected</p>
                          <p className="text-sm text-amber-700">The entered value does not match the source document.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Close
                    </button>
                    {selectedItem.status === "in-progress" && (
                      <>
                        <button
                          onClick={() => {
                            handleStatusChange(selectedItem.id, "completed");
                            setSelectedItem(null);
                          }}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Mark as Verified
                        </button>
                        {selectedItem.discrepancy && (
                          <button
                            onClick={() => {
                              handleRaiseQuery(selectedItem.id);
                              setSelectedItem(null);
                            }}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                          >
                            Raise Query
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}