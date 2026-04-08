import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Bell,
  Eye,
  Zap,
  Filter,
  ArrowRight,
  User,
  Calendar,
  FileText,
} from "lucide-react";

interface ChangeDetectionProps {
  onBack: () => void;
}

type ChangeType = "value_update" | "status_change" | "document_upload" | "query_response" | "enrollment" | "deviation";
type Severity = "info" | "warning" | "critical";
type NotificationStatus = "unread" | "read" | "acknowledged";

type DataChange = {
  id: string;
  timestamp: string;
  type: ChangeType;
  severity: Severity;
  subjectId?: string;
  siteId?: string;
  formType?: string;
  fieldName?: string;
  previousValue?: string;
  newValue?: string;
  changedBy: string;
  changeSummary: string;
  status: NotificationStatus;
  detail: string;
};

type ChangeNotification = {
  id: string;
  userId: string;
  changeId: string;
  isRead: boolean;
  acknowledgedAt?: string;
};

const mockDataChanges: DataChange[] = [
  {
    id: "change-1",
    timestamp: "2026-04-08T15:45:00Z",
    type: "value_update",
    severity: "info",
    subjectId: "001-001",
    siteId: "001",
    formType: "Vital Signs",
    fieldName: "Systolic BP",
    previousValue: "125",
    newValue: "128",
    changedBy: "site001@cleartrial.com",
    changeSummary: "Systolic BP updated for subject 001-001",
    status: "unread",
    detail: "Data entry corrected based on source documentation review",
  },
  {
    id: "change-2",
    timestamp: "2026-04-08T15:20:00Z",
    type: "query_response",
    severity: "info",
    subjectId: "001-002",
    siteId: "001",
    formType: "Demographics",
    fieldName: "Ethnicity",
    changedBy: "sarah.miller@cleartrial.com",
    changeSummary: "Response provided to ethnicity query for 001-002",
    status: "unread",
    detail: "Site provided clarification for missing ethnicity value",
  },
  {
    id: "change-3",
    timestamp: "2026-04-08T14:35:00Z",
    type: "document_upload",
    severity: "warning",
    subjectId: "002-001",
    siteId: "002",
    changedBy: "investigator@site002.com",
    changeSummary: "Protocol deviation form uploaded for subject 002-001",
    status: "unread",
    detail: "Subject 002-001 deviated from visit window by +3 days",
  },
  {
    id: "change-4",
    timestamp: "2026-04-08T13:50:00Z",
    type: "enrollment",
    severity: "info",
    subjectId: "004-003",
    siteId: "004",
    changedBy: "crc@site004.com",
    changeSummary: "New subject enrolled at Site 004",
    status: "unread",
    detail: "Subject 004-003 successfully consented and randomized to Study Arm B",
  },
  {
    id: "change-5",
    timestamp: "2026-04-08T12:15:00Z",
    type: "status_change",
    severity: "warning",
    subjectId: "003-001",
    siteId: "003",
    changedBy: "system@cleartrial.com",
    changeSummary: "Data quality score dropped below threshold for Site 003",
    status: "read",
    detail: "Data quality fell to 88% due to incomplete laboratory reconciliation",
  },
  {
    id: "change-6",
    timestamp: "2026-04-08T11:30:00Z",
    type: "deviation",
    severity: "critical",
    subjectId: "002-002",
    siteId: "002",
    changedBy: "pi@site002.com",
    changeSummary: "Critical protocol deviation logged",
    status: "read",
    detail: "Subject received unauthorized concomitant medication - medical review required",
  },
  {
    id: "change-7",
    timestamp: "2026-04-08T10:05:00Z",
    type: "value_update",
    severity: "warning",
    subjectId: "001-003",
    siteId: "001",
    formType: "Laboratory",
    fieldName: "ALT",
    previousValue: "45",
    newValue: "125",
    changedBy: "sitelab@cleartrial.com",
    changeSummary: "Lab value corrected for subject 001-003",
    status: "read",
    detail: "ALT lab result corrected - prior transcription error identified",
  },
  {
    id: "change-8",
    timestamp: "2026-04-07T16:20:00Z",
    type: "query_response",
    severity: "info",
    subjectId: "004-001",
    siteId: "004",
    formType: "Adverse Events",
    fieldName: "AE Severity",
    changedBy: "investigator@site004.com",
    changeSummary: "AE severity query response received",
    status: "read",
    detail: "Site confirmed AE severity level as MILD for rash episode",
  },
];

const changeTypeConfig = {
  value_update: { icon: TrendingUp, label: "Value Updated", color: "text-blue-600", bg: "bg-blue-50" },
  status_change: { icon: CheckCircle, label: "Status Changed", color: "text-purple-600", bg: "bg-purple-50" },
  document_upload: { icon: FileText, label: "Document Uploaded", color: "text-indigo-600", bg: "bg-indigo-50" },
  query_response: { icon: Bell, label: "Query Response", color: "text-cyan-600", bg: "bg-cyan-50" },
  enrollment: { icon: User, label: "Subject Enrolled", color: "text-green-600", bg: "bg-green-50" },
  deviation: { icon: AlertTriangle, label: "Deviation Logged", color: "text-red-600", bg: "bg-red-50" },
};

const severityConfig = {
  info: { badge: "bg-slate-100 text-slate-800", icon: "text-slate-600" },
  warning: { badge: "bg-orange-100 text-orange-800", icon: "text-orange-600" },
  critical: { badge: "bg-red-100 text-red-800", icon: "text-red-600" },
};

export default function ChangeDetection({ onBack }: ChangeDetectionProps) {
  const [changes, setChanges] = useState<DataChange[]>(mockDataChanges);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "critical" | "timeline">("all");
  const [filterType, setFilterType] = useState<ChangeType | "all">("all");
  const [filterSite, setFilterSite] = useState<string>("all");
  const [selectedChange, setSelectedChange] = useState<DataChange | null>(null);
  const [autoNotify, setAutoNotify] = useState(true);

  const unreadCount = changes.filter(c => c.status === "unread").length;
  const criticalCount = changes.filter(c => c.severity === "critical").length;
  const todayCount = changes.filter(c => {
    const changeDate = new Date(c.timestamp).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    return changeDate === today;
  }).length;

  const filteredChanges = changes.filter(change => {
    if (activeTab === "unread") return change.status === "unread";
    if (activeTab === "critical") return change.severity === "critical";
    if (filterType !== "all") return change.type === filterType;
    if (filterSite !== "all") return change.siteId === filterSite;
    return true;
  });

  const handleMarkAsRead = (changeId: string) => {
    setChanges(prev =>
      prev.map(c => c.id === changeId ? { ...c, status: "read" } : c)
    );
  };

  const handleAcknowledgeAll = () => {
    setChanges(prev =>
      prev.map(c => ({ ...c, status: "read" }))
    );
  };

  const handleDismissChange = (changeId: string) => {
    setChanges(prev => prev.filter(c => c.id !== changeId));
  };

  const sites = Array.from(new Set(changes.map(c => c.siteId).filter(Boolean))) as string[];
  const types = Array.from(new Set(changes.map(c => c.type))) as ChangeType[];

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
            <h1 className="text-2xl font-bold text-slate-900">Change Detection Indicators</h1>
            <p className="text-sm text-slate-600">Real-time notifications of data changes and events</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAcknowledgeAll}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <CheckCircle size={16} />
            Mark All Read
          </button>
          <button
            onClick={() => setAutoNotify(!autoNotify)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              autoNotify
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Bell size={16} />
            {autoNotify ? "Notifications On" : "Notifications Off"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{unreadCount}</p>
              <p className="text-sm text-slate-600">Unread Changes</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{criticalCount}</p>
              <p className="text-sm text-slate-600">Critical Issues</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{todayCount}</p>
              <p className="text-sm text-slate-600">Today's Changes</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{changes.length}</p>
              <p className="text-sm text-slate-600">Total Changes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ChangeType | "all")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{changeTypeConfig[type].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Filter by Site</label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All Sites</option>
              {sites.map(site => (
                <option key={site} value={site}>Site {site}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "all", label: "All Changes", count: filteredChanges.length, icon: Eye },
            { key: "unread", label: "Unread", count: unreadCount, icon: Bell },
            { key: "critical", label: "Critical", count: criticalCount, icon: AlertTriangle },
            { key: "timeline", label: "Timeline", count: changes.length, icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon size={16} />
                {tab.label}
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Changes List */}
      <div className="space-y-3">
        {filteredChanges.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <p className="text-slate-600">No changes to display</p>
          </div>
        ) : (
          filteredChanges.map((change) => {
            const typeConfig = changeTypeConfig[change.type];
            const Icon = typeConfig.icon;

            return (
              <div
                key={change.id}
                className={`rounded-lg border transition-all ${
                  change.status === "unread"
                    ? "border-blue-300 bg-blue-50 shadow-sm"
                    : "border-slate-200 bg-white hover:shadow-md"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-lg p-3 ${typeConfig.bg}`}>
                      <Icon size={20} className={typeConfig.color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-slate-900">{typeConfig.label}</p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${severityConfig[change.severity].badge}`}>
                          {change.severity}
                        </span>
                        {change.status === "unread" && (
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{change.changeSummary}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-3">
                        {change.subjectId && (
                          <span>
                            <span className="font-medium">Subject:</span> {change.subjectId}
                          </span>
                        )}
                        {change.siteId && (
                          <span>
                            <span className="font-medium">Site:</span> {change.siteId}
                          </span>
                        )}
                        {change.formType && (
                          <span>
                            <span className="font-medium">Form:</span> {change.formType}
                          </span>
                        )}
                        <span>
                          <span className="font-medium">By:</span> {change.changedBy}
                        </span>
                        <span>
                          <span className="font-medium">Time:</span> {new Date(change.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {change.previousValue && change.newValue && (
                        <div className="rounded bg-slate-50 p-2 mb-3 text-xs">
                          <p className="text-slate-600">
                            <span className="font-medium">{change.fieldName}:</span>{" "}
                            <span className="line-through text-red-600">{change.previousValue}</span>
                            <ArrowRight size={12} className="inline mx-1" />
                            <span className="text-green-600 font-medium">{change.newValue}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {change.status === "unread" && (
                        <button
                          onClick={() => handleMarkAsRead(change.id)}
                          className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedChange(change)}
                        className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDismissChange(change.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Change Details Modal */}
      {selectedChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Change Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Change Type</p>
                <p className="text-sm font-medium text-slate-900">{changeTypeConfig[selectedChange.type].label}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Summary</p>
                <p className="text-sm text-slate-700">{selectedChange.changeSummary}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Details</p>
                <p className="text-sm text-slate-700">{selectedChange.detail}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Severity</p>
                  <span className={`inline-block text-xs px-2 py-1 rounded font-medium ${severityConfig[selectedChange.severity].badge}`}>
                    {selectedChange.severity}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                  <span className={`inline-block text-xs px-2 py-1 rounded font-medium ${
                    selectedChange.status === "unread" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-800"
                  }`}>
                    {selectedChange.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">Timestamp</p>
                <p className="text-sm text-slate-700">{new Date(selectedChange.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedChange(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}