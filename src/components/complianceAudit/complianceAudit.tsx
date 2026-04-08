import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Shield,
  Clock,
  User,
  FileText,
  Settings,
  BarChart3,
  Zap,
  Download,
  Activity,
} from "lucide-react";

interface ComplianceAuditProps {
  onBack: () => void;
}

type ComplianceStatus = "compliant" | "warning" | "non_compliant";
type AuditAction = "create" | "read" | "update" | "delete" | "export" | "approve" | "sign" | "lock";

type AuditEntry = {
  id: string;
  timestamp: string;
  action: AuditAction;
  userId: string;
  userName: string;
  recordType: string;
  recordId: string;
  recordSubject?: string;
  previousValues?: Record<string, string>;
  newValues?: Record<string, string>;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failure";
  reason?: string;
  digitalSignatureHash?: string;
};

type ComplianceRequirement = {
  id: string;
  standard: "21 CFR Part 11" | "ICH GCP" | "GDPR" | "FDA" | "EMA";
  requirement: string;
  description: string;
  status: ComplianceStatus;
  lastVerified: string;
  nextReviewDate: string;
  evidenceUrl?: string;
  owner: string;
};

type UserAccessLog = {
  id: string;
  userId: string;
  userName: string;
  loginTime: string;
  logoutTime?: string;
  ipAddress: string;
  device: string;
  actions: number;
  status: "active" | "logged_out" | "session_expired";
};

type DataLockRecord = {
  id: string;
  timestamp: string;
  lockedBy: string;
  database: string;
  recordCount: number;
  changesSinceLock: number;
  digitalSignature: string;
  locked: boolean;
};

const mockAuditEntries: AuditEntry[] = [
  {
    id: "AUD-001",
    timestamp: "2026-04-08T15:45:23Z",
    action: "update",
    userId: "user-123",
    userName: "Sarah Miller",
    recordType: "Subject Visit",
    recordId: "001-001-DAY01",
    recordSubject: "Vital Signs - Systolic BP",
    previousValues: { value: "125" },
    newValues: { value: "128" },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    status: "success",
    digitalSignatureHash: "SHA256:a3f4d8e9c2b1f0e7d6c5b4a3f2e1d0c9",
  },
  {
    id: "AUD-002",
    timestamp: "2026-04-08T15:30:15Z",
    action: "export",
    userId: "user-045",
    userName: "John Smith",
    recordType: "Query Report",
    recordId: "REPORT-2026-04-08",
    ipAddress: "192.168.1.105",
    userAgent: "Mozilla/5.0",
    status: "success",
    digitalSignatureHash: "SHA256:b4e5f9a0d3c2b1f0e9d8c7b6a5f4e3d2",
  },
  {
    id: "AUD-003",
    timestamp: "2026-04-08T14:12:47Z",
    action: "approve",
    userId: "user-089",
    userName: "Dr. Michael Chen",
    recordType: "Protocol Deviation",
    recordId: "DEV-002-001-001",
    ipAddress: "192.168.1.110",
    userAgent: "Mozilla/5.0",
    status: "success",
    digitalSignatureHash: "SHA256:c5f6g0b1e4d3c2f1e0d9c8b7a6f5e4d3c",
  },
  {
    id: "AUD-004",
    timestamp: "2026-04-08T13:45:22Z",
    action: "read",
    userId: "user-156",
    userName: "Emily Johnson",
    recordType: "Subject Data",
    recordId: "003-001",
    ipAddress: "192.168.1.115",
    userAgent: "Mozilla/5.0",
    status: "success",
  },
  {
    id: "AUD-005",
    timestamp: "2026-04-08T13:20:05Z",
    action: "lock",
    userId: "user-200",
    userName: "Data Manager System",
    recordType: "Database Record",
    recordId: "LAB-RESULT-2026",
    ipAddress: "127.0.0.1",
    userAgent: "System",
    status: "success",
    digitalSignatureHash: "SHA256:d6g7h1c2f5e4d3g2f1e0d9c8b7a6f5e4d",
  },
];

const mockComplianceRequirements: ComplianceRequirement[] = [
  {
    id: "comp-1",
    standard: "21 CFR Part 11",
    requirement: "Electronic Records Authenticity",
    description: "System ensures electronic records are as trustworthy as handwritten/original records",
    status: "compliant",
    lastVerified: "2026-04-08",
    nextReviewDate: "2026-07-08",
    owner: "IT Security",
  },
  {
    id: "comp-2",
    standard: "21 CFR Part 11",
    requirement: "Digital Signatures",
    description: "Digital signatures are supported with unique identification and authentication",
    status: "compliant",
    lastVerified: "2026-04-08",
    nextReviewDate: "2026-07-08",
    owner: "IT Security",
  },
  {
    id: "comp-3",
    standard: "21 CFR Part 11",
    requirement: "Audit Trails",
    description: "System maintains detailed audit trails capturing all system activities with user identification",
    status: "compliant",
    lastVerified: "2026-04-08",
    nextReviewDate: "2026-07-08",
    owner: "Compliance",
  },
  {
    id: "comp-4",
    standard: "21 CFR Part 11",
    requirement: "User Access Controls",
    description: "System implements role-based access control with unique user identification",
    status: "compliant",
    lastVerified: "2026-04-02",
    nextReviewDate: "2026-07-02",
    owner: "IT Security",
  },
  {
    id: "comp-5",
    standard: "ICH GCP",
    requirement: "Data Integrity",
    description: "Ensures accuracy, completeness, reliability and consistency of trial data",
    status: "compliant",
    lastVerified: "2026-04-05",
    nextReviewDate: "2026-07-05",
    owner: "Data Management",
  },
  {
    id: "comp-6",
    standard: "GDPR",
    requirement: "Data Subject Rights",
    description: "System supports access requests, corrections, and deletion per GDPR requirements",
    status: "warning",
    lastVerified: "2026-03-20",
    nextReviewDate: "2026-06-20",
    owner: "Privacy Officer",
  },
];

const mockUserAccessLogs: UserAccessLog[] = [
  {
    id: "log-1",
    userId: "user-123",
    userName: "Sarah Miller",
    loginTime: "2026-04-08T08:30:00Z",
    logoutTime: "2026-04-08T16:45:00Z",
    ipAddress: "192.168.1.100",
    device: "Windows Desktop",
    actions: 42,
    status: "logged_out",
  },
  {
    id: "log-2",
    userId: "user-045",
    userName: "John Smith",
    loginTime: "2026-04-08T09:15:00Z",
    ipAddress: "192.168.1.105",
    device: "MacBook Pro",
    actions: 28,
    status: "active",
  },
  {
    id: "log-3",
    userId: "user-089",
    userName: "Dr. Michael Chen",
    loginTime: "2026-04-08T07:00:00Z",
    logoutTime: "2026-04-08T14:30:00Z",
    ipAddress: "192.168.1.110",
    device: "Windows Desktop",
    actions: 125,
    status: "logged_out",
  },
  {
    id: "log-4",
    userId: "user-156",
    userName: "Emily Johnson",
    loginTime: "2026-04-08T10:00:00Z",
    ipAddress: "192.168.1.115",
    device: "iPad",
    actions: 15,
    status: "active",
  },
];

const mockDataLocks: DataLockRecord[] = [
  {
    id: "lock-1",
    timestamp: "2026-04-08T12:00:00Z",
    lockedBy: "Data Manager",
    database: "Study Phase 2 Lab Results",
    recordCount: 3421,
    changesSinceLock: 0,
    digitalSignature: "SHA256:a3f4d8e9c2b1f0e7d6c5b4a3f2e1d0c9",
    locked: true,
  },
  {
    id: "lock-2",
    timestamp: "2026-04-07T16:30:00Z",
    lockedBy: "DM Review",
    database: "Study Protocol Amendments",
    recordCount: 45,
    changesSinceLock: 2,
    digitalSignature: "SHA256:b4e5f9a0d3c2b1f0e9d8c7b6a5f4e3d2",
    locked: true,
  },
];

const actionConfig = {
  create: { bg: "bg-green-50", text: "text-green-800", label: "Create" },
  read: { bg: "bg-blue-50", text: "text-blue-800", label: "Read" },
  update: { bg: "bg-yellow-50", text: "text-yellow-800", label: "Update" },
  delete: { bg: "bg-red-50", text: "text-red-800", label: "Delete" },
  export: { bg: "bg-purple-50", text: "text-purple-800", label: "Export" },
  approve: { bg: "bg-indigo-50", text: "text-indigo-800", label: "Approve" },
  sign: { bg: "bg-pink-50", text: "text-pink-800", label: "Sign" },
  lock: { bg: "bg-slate-50", text: "text-slate-800", label: "Lock" },
};

const complianceStatusConfig = {
  compliant: { bg: "bg-green-100 text-green-800", icon: CheckCircle },
  warning: { bg: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
  non_compliant: { bg: "bg-red-100 text-red-800", icon: AlertTriangle },
};

export default function ComplianceAudit({ onBack }: ComplianceAuditProps) {
  const [activeTab, setActiveTab] = useState<"audit" | "compliance" | "access" | "locks">("audit");
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState<AuditAction | "all">("all");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const filteredAuditEntries = mockAuditEntries.filter(entry => {
    const matchesSearch = searchQuery === "" ||
      entry.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.recordId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === "all" || entry.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const compliantCount = mockComplianceRequirements.filter(r => r.status === "compliant").length;
  const warningCount = mockComplianceRequirements.filter(r => r.status === "warning").length;
  const nonCompliantCount = mockComplianceRequirements.filter(r => r.status === "non_compliant").length;

  const activeSessionCount = mockUserAccessLogs.filter(l => l.status === "active").length;
  const totalActions = mockUserAccessLogs.reduce((sum, l) => sum + l.actions, 0);

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
            <h1 className="text-2xl font-bold text-slate-900">Compliance & Audit Enhancements</h1>
            <p className="text-sm text-slate-600">21 CFR Part 11 compliance, audit trails, and access controls</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Download size={16} />
          Export Audit Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{compliantCount}</p>
              <p className="text-sm text-slate-600">Requirements Compliant</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{warningCount}</p>
              <p className="text-sm text-slate-600">Warnings</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{activeSessionCount}</p>
              <p className="text-sm text-slate-600">Active Sessions</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalActions}</p>
              <p className="text-sm text-slate-600">Total Actions Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "audit", label: "Audit Trail", icon: Activity },
            { key: "compliance", label: "Compliance Status", icon: Shield },
            { key: "access", label: "User Access", icon: User },
            { key: "locks", label: "Data Locks", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Audit Trail Tab */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search by user name or record ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value as AuditAction | "all")}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="read">Read</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="export">Export</option>
                <option value="approve">Approve</option>
                <option value="sign">Sign</option>
                <option value="lock">Lock</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div className="divide-y divide-slate-200">
              {filteredAuditEntries.map((entry) => {
                const actionCfg = actionConfig[entry.action];
                const isExpanded = expandedEntry === entry.id;

                return (
                  <div key={entry.id} className="hover:bg-slate-50">
                    <div
                      onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                      className="cursor-pointer p-4 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${actionCfg.bg} ${actionCfg.text}`}>
                            {actionCfg.label}
                          </span>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            entry.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {entry.status}
                          </span>
                        </div>
                        <p className="font-medium text-slate-900 mb-1">{entry.recordType}: {entry.recordId}</p>
                        <div className="grid grid-cols-4 gap-4 text-sm text-slate-600">
                          <div>
                            <p className="text-xs text-slate-500 font-medium">User</p>
                            <p>{entry.userName}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Timestamp</p>
                            <p>{new Date(entry.timestamp).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">IP Address</p>
                            <p className="font-mono">{entry.ipAddress}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Digital Signature</p>
                            <p className="font-mono text-xs truncate">{entry.digitalSignatureHash?.slice(0, 20)}...</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-slate-50 p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-slate-900 mb-2">Record Subject</p>
                            <p className="text-sm text-slate-600">{entry.recordSubject || "N/A"}</p>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 mb-2">User Agent</p>
                            <p className="text-sm text-slate-600 truncate">{entry.userAgent}</p>
                          </div>
                          {entry.previousValues && (
                            <div>
                              <p className="font-medium text-slate-900 mb-2">Previous Values</p>
                              <pre className="text-xs bg-white border border-slate-200 rounded p-2 overflow-x-auto">
                                {JSON.stringify(entry.previousValues, null, 2)}
                              </pre>
                            </div>
                          )}
                          {entry.newValues && (
                            <div>
                              <p className="font-medium text-slate-900 mb-2">New Values</p>
                              <pre className="text-xs bg-white border border-slate-200 rounded p-2 overflow-x-auto">
                                {JSON.stringify(entry.newValues, null, 2)}
                              </pre>
                            </div>
                          )}
                          {entry.digitalSignatureHash && (
                            <div className="col-span-2">
                              <p className="font-medium text-slate-900 mb-2">Digital Signature Hash</p>
                              <p className="text-xs font-mono bg-white border border-slate-200 rounded p-2 break-all">
                                {entry.digitalSignatureHash}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === "compliance" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">21 CFR Part 11 & Regulatory Compliance</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {mockComplianceRequirements.map((req) => {
              const StatusIcon = complianceStatusConfig[req.status].icon;
              return (
                <div key={req.id} className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{req.requirement}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${complianceStatusConfig[req.status].bg}`}>
                          <StatusIcon size={12} />
                          {req.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{req.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Standard</p>
                          <p className="text-slate-900">{req.standard}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Last Verified</p>
                          <p className="text-slate-900">{new Date(req.lastVerified).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Next Review</p>
                          <p className="text-slate-900">{new Date(req.nextReviewDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 ml-4">Owner: {req.owner}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* User Access Tab */}
      {activeTab === "access" && (
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">User Access Logs</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {mockUserAccessLogs.map((log) => (
              <div key={log.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-slate-900">{log.userName}</p>
                      <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                        log.status === "active" ? "bg-green-100 text-green-800" :
                        log.status === "logged_out" ? "bg-slate-100 text-slate-800" :
                        "bg-orange-100 text-orange-800"
                      }`}>
                        {log.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm text-slate-600">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Login Time</p>
                        <p>{new Date(log.loginTime).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Logout Time</p>
                        <p>{log.logoutTime ? new Date(log.logoutTime).toLocaleString() : "Active"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">IP Address</p>
                        <p className="font-mono">{log.ipAddress}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Actions</p>
                        <p className="font-semibold text-slate-900">{log.actions}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Locks Tab */}
      {activeTab === "locks" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Database Lock Records</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {mockDataLocks.map((lock) => (
              <div key={lock.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900">{lock.database}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        lock.locked ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        <Lock size={12} />
                        {lock.locked ? "Locked" : "Unlocked"}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Locked By</p>
                        <p className="text-slate-900">{lock.lockedBy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Lock Time</p>
                        <p className="text-slate-900">{new Date(lock.timestamp).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Records Locked</p>
                        <p className="text-slate-900 font-bold">{lock.recordCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Changes Since Lock</p>
                        <p className={`font-bold ${lock.changesSinceLock > 0 ? "text-orange-600" : "text-green-600"}`}>
                          {lock.changesSinceLock}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Digital Signature Hash</p>
                  <p className="text-xs font-mono bg-slate-50 border border-slate-200 rounded p-2 break-all">
                    {lock.digitalSignature}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}