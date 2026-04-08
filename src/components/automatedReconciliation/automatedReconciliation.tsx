import React, { useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Zap,
  BarChart3,
  Filter,
  Settings,
  Activity,
  Eye,
  Trash2,
  Copy,
  Clock,
  TrendingUp,
} from "lucide-react";

interface AutomatedReconciliationProps {
  onBack: () => void;
}

type ChangeEventType = "value_change" | "missing_value" | "duplicate_detected" | "format_inconsistency" | "outlier_detected";

type ReconciliationStatus = "pending" | "running" | "completed" | "failed" | "manual_review";

type ChangeEvent = {
  id: string;
  timestamp: string;
  type: ChangeEventType;
  subjectId: string;
  variable: string;
  originalValue: string;
  newValue?: string;
  source: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "reviewed" | "reconciled" | "ignored";
  details?: string;
};

type CleaningRule = {
  id: string;
  name: string;
  description: string;
  type: "format" | "validation" | "deduplication" | "standardization";
  condition: string;
  action: string;
  enabled: boolean;
  appliedCount: number;
  lastApplied?: string;
  successRate: number;
};

type ReconciliationJob = {
  id: string;
  name: string;
  status: ReconciliationStatus;
  startedAt: string;
  completedAt?: string;
  itemsProcessed: number;
  itemsTotal: number;
  itemsResolved: number;
  itemsWithConflicts: number;
  progress: number;
  errorMessage?: string;
};

type ManualReviewItem = {
  id: string;
  subjectId: string;
  variable: string;
  sourceA: {
    value: string;
    source: string;
    timestamp: string;
  };
  sourceB: {
    value: string;
    source: string;
    timestamp: string;
  };
  recommendation: string;
  confidenceScore: number;
  priority: "low" | "medium" | "high";
  assignedTo?: string;
};

const mockChangeEvents: ChangeEvent[] = [
  {
    id: "change-1",
    timestamp: "2026-04-08T14:32:00Z",
    type: "value_change",
    subjectId: "001-001",
    variable: "Weight",
    originalValue: "75.5",
    newValue: "75.3",
    source: "EDC",
    severity: "low",
    status: "reconciled",
    details: "Minor weight fluctuation within normal range",
  },
  {
    id: "change-2",
    timestamp: "2026-04-08T13:15:00Z",
    type: "missing_value",
    subjectId: "001-002",
    variable: "Blood Pressure - Systolic",
    originalValue: "---",
    source: "eCOA",
    severity: "high",
    status: "manual_review",
    details: "Required variable missing from eCOA submission",
  },
  {
    id: "change-3",
    timestamp: "2026-04-08T12:48:00Z",
    type: "format_inconsistency",
    subjectId: "002-001",
    variable: "Date of Birth",
    originalValue: "01/15/1975",
    newValue: "1975-01-15",
    source: "Labs",
    severity: "medium",
    status: "reconciled",
    details: "Standardized date format to ISO 8601",
  },
  {
    id: "change-4",
    timestamp: "2026-04-08T11:20:00Z",
    type: "duplicate_detected",
    subjectId: "001-003",
    variable: "Visit Date",
    originalValue: "2026-04-01",
    source: "EDC",
    severity: "critical",
    status: "manual_review",
    details: "Duplicate visit record detected - requires manual deduplication",
  },
  {
    id: "change-5",
    timestamp: "2026-04-08T10:05:00Z",
    type: "outlier_detected",
    subjectId: "002-002",
    variable: "ALT",
    originalValue: "325",
    source: "Labs",
    severity: "high",
    status: "pending",
    details: "Value exceeds normal range (8-56 U/L)",
  },
];

const mockCleaningRules: CleaningRule[] = [
  {
    id: "rule-1",
    name: "Date Format Standardization",
    description: "Converts all date formats to ISO 8601",
    type: "standardization",
    condition: "Any date field",
    action: "Format to YYYY-MM-DD",
    enabled: true,
    appliedCount: 324,
    lastApplied: "2026-04-08T14:30:00Z",
    successRate: 99.7,
  },
  {
    id: "rule-2",
    name: "Whitespace Trimming",
    description: "Removes leading/trailing whitespace",
    type: "format",
    condition: "All text fields",
    action: "Trim whitespace",
    enabled: true,
    appliedCount: 1842,
    lastApplied: "2026-04-08T14:32:00Z",
    successRate: 100,
  },
  {
    id: "rule-3",
    name: "Unit Standardization",
    description: "Converts various weight units to kg",
    type: "standardization",
    condition: "Weight measurements",
    action: "Convert to kg",
    enabled: true,
    appliedCount: 156,
    lastApplied: "2026-04-08T13:45:00Z",
    successRate: 98.5,
  },
  {
    id: "rule-4",
    name: "Case Normalization",
    description: "Standardizes text to proper case",
    type: "format",
    condition: "Site/investigator names",
    action: "Normalize to Title Case",
    enabled: true,
    appliedCount: 89,
    lastApplied: "2026-04-08T12:10:00Z",
    successRate: 99.1,
  },
  {
    id: "rule-5",
    name: "Numeric Validation",
    description: "Validates numeric values against expected ranges",
    type: "validation",
    condition: "Numeric laboratory values",
    action: "Flag/reject out-of-range values",
    enabled: false,
    appliedCount: 0,
    successRate: 0,
  },
];

const mockReconciliationJobs: ReconciliationJob[] = [
  {
    id: "job-1",
    name: "Daily EDC-Lab Reconciliation",
    status: "completed",
    startedAt: "2026-04-08T06:00:00Z",
    completedAt: "2026-04-08T06:15:00Z",
    itemsProcessed: 845,
    itemsTotal: 845,
    itemsResolved: 823,
    itemsWithConflicts: 22,
    progress: 100,
  },
  {
    id: "job-2",
    name: "eCOA Data Consistency Check",
    status: "running",
    startedAt: "2026-04-08T14:00:00Z",
    itemsProcessed: 234,
    itemsTotal: 412,
    itemsResolved: 198,
    itemsWithConflicts: 12,
    progress: 57,
  },
  {
    id: "job-3",
    name: "Duplicate Record Elimination",
    status: "completed",
    startedAt: "2026-04-08T13:30:00Z",
    completedAt: "2026-04-08T13:42:00Z",
    itemsProcessed: 5,
    itemsTotal: 5,
    itemsResolved: 4,
    itemsWithConflicts: 1,
    progress: 100,
  },
];

const mockManualReviewItems: ManualReviewItem[] = [
  {
    id: "review-1",
    subjectId: "001-002",
    variable: "Blood Pressure Systolic",
    sourceA: { value: "145", source: "EDC", timestamp: "2026-04-05T10:30:00Z" },
    sourceB: { value: "142", source: "eCOA", timestamp: "2026-04-05T10:32:00Z" },
    recommendation: "Use EDC value (formal visit measurement)",
    confidenceScore: 92,
    priority: "high",
    assignedTo: "Dr. Smith",
  },
  {
    id: "review-2",
    subjectId: "001-003",
    variable: "Visit Date",
    sourceA: { value: "2026-04-01", source: "EDC", timestamp: "2026-04-01T09:15:00Z" },
    sourceB: { value: "2026-04-01", source: "EDC", timestamp: "2026-04-01T14:30:00Z" },
    recommendation: "Delete duplicate entry - keep first occurrence",
    confidenceScore: 99,
    priority: "critical",
  },
  {
    id: "review-3",
    subjectId: "002-001",
    variable: "ALT",
    sourceA: { value: "325", source: "Lab Report", timestamp: "2026-04-03T14:20:00Z" },
    sourceB: { value: "32", source: "EDC Entry", timestamp: "2026-04-05T10:00:00Z" },
    recommendation: "Verify decimal entry error - likely 32.5 not 325",
    confidenceScore: 87,
    priority: "high",
  },
];

const severityConfig = {
  low: { bg: "bg-blue-50", text: "text-blue-800", label: "Low" },
  medium: { bg: "bg-yellow-50", text: "text-yellow-800", label: "Medium" },
  high: { bg: "bg-orange-50", text: "text-orange-800", label: "High" },
  critical: { bg: "bg-red-50", text: "text-red-800", label: "Critical" },
};

const statusConfig = {
  pending: { icon: Clock, color: "text-slate-600", bg: "bg-slate-100", label: "Pending" },
  reviewed: { icon: Eye, color: "text-blue-600", bg: "bg-blue-100", label: "Reviewed" },
  reconciled: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Reconciled" },
  ignored: { icon: Trash2, color: "text-slate-500", bg: "bg-slate-100", label: "Ignored" },
  manual_review: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100", label: "Manual Review" },
};

const reconciliationStatusConfig = {
  pending: { icon: Clock, color: "text-slate-600", bg: "bg-slate-100", label: "Pending" },
  running: { icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-100", label: "Running" },
  completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Completed" },
  failed: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100", label: "Failed" },
  manual_review: { icon: Eye, color: "text-orange-600", bg: "bg-orange-100", label: "Manual Review" },
};

export default function AutomatedReconciliation({ onBack }: AutomatedReconciliationProps) {
  const [changeEvents, setChangeEvents] = useState<ChangeEvent[]>(mockChangeEvents);
  const [cleaningRules, setCleaningRules] = useState<CleaningRule[]>(mockCleaningRules);
  const [reconciliationJobs, setReconciliationJobs] = useState<ReconciliationJob[]>(mockReconciliationJobs);
  const [reviewItems, setReviewItems] = useState<ManualReviewItem[]>(mockManualReviewItems);
  const [activeTab, setActiveTab] = useState<"changes" | "rules" | "jobs" | "review">("changes");
  const [selectedReview, setSelectedReview] = useState<ManualReviewItem | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const stats = {
    totalChanges: changeEvents.length,
    pendingReview: changeEvents.filter(c => c.status === "manual_review" || c.status === "pending").length,
    rulesEnabled: cleaningRules.filter(r => r.enabled).length,
    totalRulesApplied: cleaningRules.reduce((sum, r) => sum + r.appliedCount, 0),
    activeJobs: reconciliationJobs.filter(j => j.status === "running").length,
    completedJobs: reconciliationJobs.filter(j => j.status === "completed").length,
    manualReviewCount: reviewItems.length,
  };

  const filteredEvents = changeEvents.filter(event => {
    if (filterSeverity !== "all" && event.severity !== filterSeverity) return false;
    if (filterStatus !== "all" && event.status !== filterStatus) return false;
    return true;
  });

  const handleResolveConflict = (itemId: string, resolution: "accept_a" | "accept_b" | "custom") => {
    setReviewItems(items => items.filter(item => item.id !== itemId));
    if (selectedReview?.id === itemId) {
      setSelectedReview(null);
    }
  };

  const handleToggleRule = (ruleId: string) => {
    setCleaningRules(rules =>
      rules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
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
            <h1 className="text-2xl font-bold text-slate-900">Automated Reconciliation & Cleaning</h1>
            <p className="text-sm text-slate-600">Detect changes, apply cleaning rules, and resolve data conflicts</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Zap size={16} />
          Run Full Reconciliation
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalChanges}</p>
              <p className="text-sm text-slate-600">Changes Detected</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingReview}</p>
              <p className="text-sm text-slate-600">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Filter className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.rulesEnabled}</p>
              <p className="text-sm text-slate-600">Active Rules</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.completedJobs}</p>
              <p className="text-sm text-slate-600">Jobs Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "changes", label: "Change Events", icon: Activity },
            { key: "rules", label: "Cleaning Rules", icon: Filter },
            { key: "jobs", label: "Reconciliation Jobs", icon: RefreshCw },
            { key: "review", label: "Manual Review", icon: Eye },
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

      {/* Change Events Tab */}
      {activeTab === "changes" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Change Events</h2>
              <div className="flex gap-2">
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="manual_review">Manual Review</option>
                  <option value="reconciled">Reconciled</option>
                  <option value="reviewed">Reviewed</option>
                </select>
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-200">
            {filteredEvents.map((event) => {
              const statusConfig = {
                pending: { icon: Clock, color: "text-slate-600", bg: "bg-slate-100" },
                reviewed: { icon: Eye, color: "text-blue-600", bg: "bg-blue-100" },
                reconciled: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
                ignored: { icon: Trash2, color: "text-slate-500", bg: "bg-slate-100" },
                manual_review: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
              };
              const SIcon = statusConfig[event.status].icon;
              const severityStyle = severityConfig[event.severity];
              return (
                <div key={event.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${severityStyle.bg} ${severityStyle.text}`}>
                          {severityStyle.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[event.status].bg} ${statusConfig[event.status].color}`}>
                          <SIcon size={12} />
                          {event.status.replace("_", " ").charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </div>
                      <p className="font-medium text-slate-900">{event.variable}</p>
                      <div className="mt-1 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Subject</p>
                          <p className="text-sm text-slate-700">{event.subjectId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Source</p>
                          <p className="text-sm text-slate-700">{event.source}</p>
                        </div>
                      </div>
                      {(event.originalValue || event.newValue) && (
                        <div className="mt-2 rounded-lg bg-slate-50 p-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                              {event.originalValue}
                            </span>
                            {event.newValue && (
                              <>
                                <span className="text-slate-400">→</span>
                                <span className="inline-flex items-center rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                  {event.newValue}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      {event.details && (
                        <p className="mt-2 text-sm text-slate-600">{event.details}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button className="rounded px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">
                        Review
                      </button>
                      <button className="rounded px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cleaning Rules Tab */}
      {activeTab === "rules" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Data Cleaning Rules</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {cleaningRules.map((rule) => (
              <div key={rule.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-slate-900">{rule.name}</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        rule.enabled
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-800"
                      }`}>
                        {rule.enabled ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{rule.description}</p>
                    <div className="mt-3 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Type</p>
                        <p className="text-sm font-medium text-slate-900 capitalize">{rule.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Applied</p>
                        <p className="text-sm font-medium text-slate-900">{rule.appliedCount.toLocaleString()} times</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Success Rate</p>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-green-600"
                              style={{ width: `${rule.successRate}%` }}
                            />
                          </div>
                          <p className="text-sm font-medium text-slate-900">{rule.successRate}%</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-700 uppercase">Condition</p>
                        <p className="text-sm text-slate-600 font-mono">{rule.condition}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-700 uppercase">Action</p>
                        <p className="text-sm text-slate-600 font-mono">{rule.action}</p>
                      </div>
                    </div>
                    {rule.lastApplied && (
                      <p className="mt-2 text-xs text-slate-500">
                        Last applied: {new Date(rule.lastApplied).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`rounded px-3 py-1 text-xs font-medium ${
                        rule.enabled
                          ? "text-red-600 hover:bg-red-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {rule.enabled ? "Disable" : "Enable"}
                    </button>
                    <button className="rounded px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reconciliation Jobs Tab */}
      {activeTab === "jobs" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Reconciliation Jobs</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {reconciliationJobs.map((job) => {
              const JobStatusConfig = reconciliationStatusConfig[job.status];
              const StatusIcon = JobStatusConfig.icon;
              return (
                <div key={job.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-slate-900">{job.name}</p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${JobStatusConfig.bg} ${JobStatusConfig.color}`}>
                          <StatusIcon size={12} />
                          {job.status.replace("_", " ").charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">Progress</p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-2 w-32 rounded-full bg-slate-200">
                              <div
                                className={`h-2 rounded-full ${
                                  job.status === "completed" ? "bg-green-600" :
                                  job.status === "running" ? "bg-blue-600" :
                                  job.status === "failed" ? "bg-red-600" : "bg-slate-400"
                                }`}
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="font-medium text-slate-900">{job.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Items</p>
                          <p className="text-sm font-medium text-slate-900">
                            {job.itemsProcessed} / {job.itemsTotal}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div className="rounded-lg bg-green-50 p-3">
                          <p className="text-xs text-green-700">Resolved</p>
                          <p className="text-lg font-bold text-green-900">{job.itemsResolved}</p>
                        </div>
                        <div className="rounded-lg bg-orange-50 p-3">
                          <p className="text-xs text-orange-700">Conflicts</p>
                          <p className="text-lg font-bold text-orange-900">{job.itemsWithConflicts}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-700">Resolution Rate</p>
                          <p className="text-lg font-bold text-slate-900">
                            {job.itemsTotal > 0 ? Math.round((job.itemsResolved / job.itemsTotal) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        Started: {new Date(job.startedAt).toLocaleString()}
                        {job.completedAt && ` • Completed: ${new Date(job.completedAt).toLocaleString()}`}
                      </p>
                    </div>
                    <div className="ml-4">
                      <button className="rounded px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Review Tab */}
      {activeTab === "review" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Manual Review Queue</h2>
            <p className="text-sm text-slate-600">Items requiring human intervention to resolve conflicts</p>
          </div>
          <div className="divide-y divide-slate-200">
            {reviewItems.map((item) => (
              <div key={item.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-slate-900">{item.variable}</p>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.priority === "critical"
                          ? "bg-red-100 text-red-800"
                          : item.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                      </span>
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                        {Math.round(item.confidenceScore)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">Subject: {item.subjectId}</p>
                    {item.assignedTo && (
                      <p className="text-sm text-slate-600">Assigned to: {item.assignedTo}</p>
                    )}
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-700 mb-2">Source A: {item.sourceA.source}</p>
                        <p className="text-sm font-bold text-slate-900">{item.sourceA.value}</p>
                        <p className="text-xs text-slate-500">{new Date(item.sourceA.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-700 mb-2">Source B: {item.sourceB.source}</p>
                        <p className="text-sm font-bold text-slate-900">{item.sourceB.value}</p>
                        <p className="text-xs text-slate-500">{new Date(item.sourceB.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3">
                      <p className="text-xs font-medium text-green-700 mb-1">Recommendation</p>
                      <p className="text-sm text-green-900">{item.recommendation}</p>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleResolveConflict(item.id, "accept_a")}
                      className="rounded px-3 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                    >
                      Accept A
                    </button>
                    <button
                      onClick={() => handleResolveConflict(item.id, "accept_b")}
                      className="rounded px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                    >
                      Accept B
                    </button>
                    <button
                      onClick={() => setSelectedReview(item)}
                      className="rounded px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Custom
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Resolution Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Resolve Conflict: {selectedReview.variable}</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject ID</label>
                <input
                  type="text"
                  value={selectedReview.subjectId}
                  disabled
                  className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-700 mb-2">{selectedReview.sourceA.source}</p>
                  <input
                    type="text"
                    value={selectedReview.sourceA.value}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700 mb-2">{selectedReview.sourceB.source}</p>
                  <input
                    type="text"
                    value={selectedReview.sourceB.value}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Final Value</label>
                <input
                  type="text"
                  defaultValue={selectedReview.sourceA.value}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Enter resolved value"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Resolution Notes</label>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Document your resolution reasoning"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResolveConflict(selectedReview.id, "custom")}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Resolve Conflict
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}