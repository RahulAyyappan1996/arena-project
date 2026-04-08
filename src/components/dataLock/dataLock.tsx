import React, { useState } from "react";
import {
  Lock,
  Unlock,
  CheckCircle,
  AlertTriangle,
  Download,
  FileText,
  Archive,
  ArrowLeft,
  Shield,
  Clock,
  Users,
  Database,
} from "lucide-react";

interface DataLockProps {
  onBack: () => void;
}

type LockStatus = "unlocked" | "ready-for-lock" | "locking" | "locked" | "archived";

type ChecklistItem = {
  id: string;
  category: string;
  item: string;
  status: "pending" | "completed" | "failed";
  required: boolean;
  notes?: string;
};

type ExportFormat = {
  id: string;
  name: string;
  description: string;
  status: "pending" | "generating" | "completed" | "failed";
  fileSize?: string;
  downloadUrl?: string;
};

const mockChecklist: ChecklistItem[] = [
  {
    id: "check-1",
    category: "Data Quality",
    item: "All critical queries resolved",
    status: "completed",
    required: true,
  },
  {
    id: "check-2",
    category: "Data Quality",
    item: "SDV completed for all subjects",
    status: "completed",
    required: true,
  },
  {
    id: "check-3",
    category: "Data Quality",
    item: "Medical coding completed and reviewed",
    status: "completed",
    required: true,
  },
  {
    id: "check-4",
    category: "Data Quality",
    item: "Data validation rules passed",
    status: "completed",
    required: true,
  },
  {
    id: "check-5",
    category: "Documentation",
    item: "Data Management Plan finalized",
    status: "completed",
    required: true,
  },
  {
    id: "check-6",
    category: "Documentation",
    item: "Study close-out documentation complete",
    status: "pending",
    required: true,
  },
  {
    id: "check-7",
    category: "Compliance",
    item: "Regulatory approvals obtained",
    status: "completed",
    required: true,
  },
  {
    id: "check-8",
    category: "Compliance",
    item: "Audit trail review completed",
    status: "pending",
    required: true,
  },
];

const mockExports: ExportFormat[] = [
  {
    id: "export-1",
    name: "SAS Transport Files",
    description: "CDISC-compliant SAS datasets for regulatory submission",
    status: "completed",
    fileSize: "2.4 GB",
    downloadUrl: "#",
  },
  {
    id: "export-2",
    name: "Define.xml",
    description: "Study metadata and dataset definitions",
    status: "completed",
    fileSize: "156 KB",
    downloadUrl: "#",
  },
  {
    id: "export-3",
    name: "SDTM Datasets",
    description: "Standardized data tabulation model datasets",
    status: "generating",
    fileSize: "856 MB",
  },
  {
    id: "export-4",
    name: "ADaM Datasets",
    description: "Analysis dataset model for statistical analysis",
    status: "pending",
  },
  {
    id: "export-5",
    name: "Data Reviewer's Guide",
    description: "Comprehensive guide for data reviewers",
    status: "completed",
    fileSize: "4.2 MB",
    downloadUrl: "#",
  },
];

const statusConfig = {
  unlocked: { icon: Unlock, color: "text-slate-600", bg: "bg-slate-50", label: "Unlocked" },
  "ready-for-lock": { icon: Shield, color: "text-amber-600", bg: "bg-amber-50", label: "Ready for Lock" },
  locking: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", label: "Locking" },
  locked: { icon: Lock, color: "text-green-600", bg: "bg-green-50", label: "Locked" },
  archived: { icon: Archive, color: "text-purple-600", bg: "bg-purple-50", label: "Archived" },
};

export default function DataLock({ onBack }: DataLockProps) {
  const [lockStatus, setLockStatus] = useState<LockStatus>("ready-for-lock");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(mockChecklist);
  const [exports, setExports] = useState<ExportFormat[]>(mockExports);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockReason, setLockReason] = useState("");

  const handleChecklistUpdate = (itemId: string, status: "pending" | "completed" | "failed") => {
    setChecklist(items =>
      items.map(item =>
        item.id === itemId ? { ...item, status } : item
      )
    );
  };

  const handleInitiateLock = () => {
    setLockStatus("locking");
    setShowLockModal(false);
    // Mock lock process
    setTimeout(() => {
      setLockStatus("locked");
      setExports(prev =>
        prev.map(exp =>
          exp.status === "pending" ? { ...exp, status: "generating" } : exp
        )
      );
    }, 2000);
  };

  const handleArchive = () => {
    setLockStatus("archived");
  };

  const checklistComplete = checklist.filter(item => item.required).every(item => item.status === "completed");
  const canLock = lockStatus === "ready-for-lock" && checklistComplete;

  const stats = {
    totalChecks: checklist.length,
    completed: checklist.filter(item => item.status === "completed").length,
    pending: checklist.filter(item => item.status === "pending").length,
    failed: checklist.filter(item => item.status === "failed").length,
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
            <h1 className="text-2xl font-bold text-slate-900">Data Lock & Archiving</h1>
            <p className="text-sm text-slate-600">Freeze database and prepare for regulatory submission</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            statusConfig[lockStatus].bg
          } ${statusConfig[lockStatus].color}`}>
            {React.createElement(statusConfig[lockStatus].icon, { size: 16 })}
            {statusConfig[lockStatus].label}
          </span>
          {canLock && (
            <button
              onClick={() => setShowLockModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Lock size={16} />
              Initiate Data Lock
            </button>
          )}
          {lockStatus === "locked" && (
            <button
              onClick={handleArchive}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              <Archive size={16} />
              Archive Study
            </button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
              <p className="text-sm text-slate-600">Checks Complete</p>
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
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.failed}</p>
              <p className="text-sm text-slate-600">Failed</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{exports.filter(e => e.status === "completed").length}</p>
              <p className="text-sm text-slate-600">Exports Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Lock Checklist */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Pre-Lock Checklist</h2>
          <p className="text-sm text-slate-600">All required items must be completed before data lock</p>
        </div>
        <div className="divide-y divide-slate-200">
          {checklist.map((item) => (
            <div key={item.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.status === "completed"}
                    onChange={(e) => handleChecklistUpdate(item.id, e.target.checked ? "completed" : "pending")}
                    className="h-4 w-4 text-blue-600 rounded border-slate-300"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{item.item}</p>
                    <p className="text-sm text-slate-500">{item.category}</p>
                    {item.notes && <p className="text-sm text-slate-600 mt-1">{item.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.required && (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      Required
                    </span>
                  )}
                  <select
                    value={item.status}
                    onChange={(e) => handleChecklistUpdate(item.id, e.target.value as "pending" | "completed" | "failed")}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Exports */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Data Exports</h2>
          <p className="text-sm text-slate-600">Generated after data lock for regulatory submission</p>
        </div>
        <div className="divide-y divide-slate-200">
          {exports.map((exp) => (
            <div key={exp.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{exp.name}</p>
                  <p className="text-sm text-slate-600">{exp.description}</p>
                  {exp.fileSize && <p className="text-xs text-slate-500">Size: {exp.fileSize}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    exp.status === "completed" ? "bg-green-100 text-green-800" :
                    exp.status === "generating" ? "bg-blue-100 text-blue-800" :
                    exp.status === "failed" ? "bg-red-100 text-red-800" :
                    "bg-slate-100 text-slate-800"
                  }`}>
                    {exp.status === "completed" && <CheckCircle size={12} />}
                    {exp.status === "generating" && <Clock size={12} />}
                    {exp.status === "failed" && <AlertTriangle size={12} />}
                    {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
                  </span>
                  {exp.status === "completed" && exp.downloadUrl && (
                    <button className="inline-flex items-center gap-1 rounded px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50">
                      <Download size={14} />
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lock Initiation Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Initiate Data Lock</h3>
              <button
                onClick={() => setShowLockModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Warning: Irreversible Action</p>
                    <p className="text-sm text-amber-700">
                      Data lock will freeze the database and prevent further modifications.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lock Reason</label>
                <textarea
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Provide reason for data lock..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowLockModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInitiateLock}
                  disabled={!lockReason.trim()}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Data Lock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}