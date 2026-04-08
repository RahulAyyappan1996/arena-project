import React, { useState } from "react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Users,
  FileText,
  Heart,
  BarChart3,
  Clock,
  Target,
  Zap,
  Eye,
  Calendar,
  Activity,
  Shield,
  Gauge,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface StudyHealthDashboardsProps {
  onBack: () => void;
}

type HealthMetric = {
  id: string;
  label: string;
  value: number;
  unit: string;
  target: number;
  status: "excellent" | "good" | "warning" | "critical";
  icon: React.ComponentType<{ size?: number; className?: string }>;
  trend: "up" | "down" | "stable";
  trendValue: number;
};

type SiteMetric = {
  id: string;
  siteId: string;
  siteName: string;
  enrollmentStatus: "on-track" | "behind" | "ahead";
  enrolledSubjects: number;
  targetSubjects: number;
  dataQualityScore: number;
  queryRate: number;
  protocolDeviations: number;
  status: "active" | "paused" | "completed";
};

type AuditTrail = {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  severity: "info" | "warning" | "critical";
};

type MilestoneEvent = {
  id: string;
  label: string;
  dueDate: string;
  completedDate?: string;
  progress: number;
  status: "completed" | "on-track" | "at-risk" | "overdue";
  description: string;
};

type SafetyAlert = {
  id: string;
  timestamp: string;
  type: "AE" | "SAE" | "SUSAR" | "Death";
  subjectId: string;
  siteId: string;
  description: string;
  severity: "low" | "high" | "critical";
  status: "open" | "under-review" | "resolved";
  assignedTo?: string;
};

const mockHealthMetrics: HealthMetric[] = [
  {
    id: "metric-1",
    label: "Enrollment Rate",
    value: 78,
    unit: "%",
    target: 100,
    status: "good",
    icon: Users,
    trend: "up",
    trendValue: 8,
  },
  {
    id: "metric-2",
    label: "Data Quality Score",
    value: 94,
    unit: "%",
    target: 98,
    status: "good",
    icon: Gauge,
    trend: "up",
    trendValue: 2,
  },
  {
    id: "metric-3",
    label: "Query Rate",
    value: 3.2,
    unit: "%",
    target: 2.5,
    status: "warning",
    icon: AlertTriangle,
    trend: "down",
    trendValue: 0.5,
  },
  {
    id: "metric-4",
    label: "Safety Events",
    value: 12,
    unit: "open",
    target: 5,
    status: "warning",
    icon: Heart,
    trend: "up",
    trendValue: 3,
  },
  {
    id: "metric-5",
    label: "Compliance Score",
    value: 96,
    unit: "%",
    target: 99,
    status: "good",
    icon: Shield,
    trend: "stable",
    trendValue: 0,
  },
  {
    id: "metric-6",
    label: "Protocol Deviations",
    value: 7,
    unit: "active",
    target: 3,
    status: "critical",
    icon: Lock,
    trend: "up",
    trendValue: 2,
  },
];

const mockSiteMetrics: SiteMetric[] = [
  {
    id: "site-1",
    siteId: "001",
    siteName: "General Hospital - Boston",
    enrollmentStatus: "on-track",
    enrolledSubjects: 42,
    targetSubjects: 50,
    dataQualityScore: 98,
    queryRate: 1.8,
    protocolDeviations: 1,
    status: "active",
  },
  {
    id: "site-2",
    siteId: "002",
    siteName: "Regional Medical Center - NYC",
    enrollmentStatus: "ahead",
    enrolledSubjects: 55,
    targetSubjects: 45,
    dataQualityScore: 96,
    queryRate: 2.1,
    protocolDeviations: 2,
    status: "active",
  },
  {
    id: "site-3",
    siteId: "003",
    siteName: "Community Health Clinic - LA",
    enrollmentStatus: "behind",
    enrolledSubjects: 28,
    targetSubjects: 40,
    dataQualityScore: 92,
    queryRate: 4.2,
    protocolDeviations: 3,
    status: "active",
  },
  {
    id: "site-4",
    siteId: "004",
    siteName: "University Hospital - Chicago",
    enrollmentStatus: "on-track",
    enrolledSubjects: 38,
    targetSubjects: 45,
    dataQualityScore: 94,
    queryRate: 3.1,
    protocolDeviations: 2,
    status: "active",
  },
];

const mockMilestones: MilestoneEvent[] = [
  {
    id: "m-1",
    label: "Study Open to IRB",
    dueDate: "2026-02-01",
    completedDate: "2026-02-01",
    progress: 100,
    status: "completed",
    description: "Initial site activation and IRB approval",
  },
  {
    id: "m-2",
    label: "First Subject Enrolled",
    dueDate: "2026-02-15",
    completedDate: "2026-02-12",
    progress: 100,
    status: "completed",
    description: "First subject screened and consented",
  },
  {
    id: "m-3",
    label: "50% Enrollment",
    dueDate: "2026-04-30",
    progress: 78,
    status: "on-track",
    description: "Reach 50% of target enrollment",
  },
  {
    id: "m-4",
    label: "100% Enrollment",
    dueDate: "2026-06-30",
    progress: 45,
    status: "at-risk",
    description: "Complete all subject enrollment",
  },
  {
    id: "m-5",
    label: "Last Subject Last Visit",
    dueDate: "2026-09-15",
    progress: 15,
    status: "at-risk",
    description: "Final subject completes study participation",
  },
  {
    id: "m-6",
    label: "Database Lock",
    dueDate: "2026-10-15",
    progress: 0,
    status: "at-risk",
    description: "Final data verification and lock",
  },
];

const mockSafetyAlerts: SafetyAlert[] = [
  {
    id: "safety-1",
    timestamp: "2026-04-08T14:30:00Z",
    type: "AE",
    subjectId: "001-001",
    siteId: "001",
    description: "Mild headache, self-resolved",
    severity: "low",
    status: "resolved",
  },
  {
    id: "safety-2",
    timestamp: "2026-04-08T10:15:00Z",
    type: "SAE",
    subjectId: "002-001",
    siteId: "002",
    description: "Hospitalization for pneumonia",
    severity: "high",
    status: "under-review",
    assignedTo: "Dr. Smith",
  },
  {
    id: "safety-3",
    timestamp: "2026-04-07T16:45:00Z",
    type: "AE",
    subjectId: "003-002",
    siteId: "003",
    description: "Elevated liver enzymes detected in labs",
    severity: "high",
    status: "under-review",
    assignedTo: "Safety Manager",
  },
  {
    id: "safety-4",
    timestamp: "2026-04-06T09:20:00Z",
    type: "SUSAR",
    subjectId: "001-003",
    siteId: "004",
    description: "Unexpected allergic reaction",
    severity: "critical",
    status: "open",
    assignedTo: "Chief Investigator",
  },
];

const mockAuditTrail: AuditTrail[] = [
  {
    id: "audit-1",
    timestamp: "2026-04-08T15:00:00Z",
    action: "Dashboard Accessed",
    user: "john.smith@cleartrial.com",
    details: "Study Health Dashboard view access",
    severity: "info",
  },
  {
    id: "audit-2",
    timestamp: "2026-04-08T14:32:00Z",
    action: "Safety Alert Created",
    user: "system@cleartrial.com",
    details: "New SAE reported for subject 002-001",
    severity: "warning",
  },
  {
    id: "audit-3",
    timestamp: "2026-04-08T13:15:00Z",
    action: "Enrollment Updated",
    user: "sarah.jones@site003.com",
    details: "Subject 003-002 enrolled at Site 003",
    severity: "info",
  },
  {
    id: "audit-4",
    timestamp: "2026-04-08T11:45:00Z",
    action: "Data Quality Check",
    user: "system@cleartrial.com",
    details: "Automated quality checks completed: 94% score",
    severity: "info",
  },
  {
    id: "audit-5",
    timestamp: "2026-04-08T10:20:00Z",
    action: "Protocol Deviation Logged",
    user: "james.wilson@site001.com",
    details: "Subject 001-001: Visit window deviation (+2 days)",
    severity: "warning",
  },
];

const statusConfig = {
  excellent: { bg: "bg-green-50", text: "text-green-700", label: "Excellent" },
  good: { bg: "bg-blue-50", text: "text-blue-700", label: "Good" },
  warning: { bg: "bg-yellow-50", text: "text-yellow-700", label: "Warning" },
  critical: { bg: "bg-red-50", text: "text-red-700", label: "Critical" },
};

export default function StudyHealthDashboards({ onBack }: StudyHealthDashboardsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "enrollment" | "quality" | "safety" | "audit">("overview");
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric | null>(null);
  const [selectedSafetyAlert, setSelectedSafetyAlert] = useState<SafetyAlert | null>(null);

  const totalSubjectsEnrolled = mockSiteMetrics.reduce((sum, site) => sum + site.enrolledSubjects, 0);
  const totalTargetSubjects = mockSiteMetrics.reduce((sum, site) => sum + site.targetSubjects, 0);
  const enrollmentPercentage = Math.round((totalSubjectsEnrolled / totalTargetSubjects) * 100);
  const activeSafetyCases = mockSafetyAlerts.filter(a => a.status === "open" || a.status === "under-review").length;

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
            <h1 className="text-2xl font-bold text-slate-900">Study Health Dashboards</h1>
            <p className="text-sm text-slate-600">Real-time study oversight and performance monitoring</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Eye size={16} />
          Generate Report
        </button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockHealthMetrics.slice(0, 3).map((metric) => {
          const config = statusConfig[metric.status];
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              onClick={() => setSelectedMetric(metric)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg p-2 ${config.bg}`}>
                    <Icon size={20} className={config.text} />
                  </div>
                  <p className="font-medium text-slate-900">{metric.label}</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                <p className="text-sm text-slate-500">{metric.unit}</p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                {metric.trend === "up" && (
                  <>
                    <ArrowUpRight size={14} className="text-red-500" />
                    <span className="text-red-600">+{metric.trendValue} vs target</span>
                  </>
                )}
                {metric.trend === "down" && (
                  <>
                    <ArrowDownRight size={14} className="text-green-500" />
                    <span className="text-green-600">-{metric.trendValue} vs target</span>
                  </>
                )}
                {metric.trend === "stable" && (
                  <span className="text-slate-500">Stable vs target</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrollment Progress Card */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Enrollment Progress</h2>
            <p className="text-sm text-slate-600">{totalSubjectsEnrolled} / {totalTargetSubjects} subjects enrolled</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900">{enrollmentPercentage}%</p>
            <p className="text-xs text-slate-500">of target</p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-slate-200">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
            style={{ width: `${enrollmentPercentage}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {mockSiteMetrics.slice(0, 4).map((site) => (
            <div key={site.id} className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-600">{site.siteName.split(" - ")[1]}</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {site.enrolledSubjects}/{site.targetSubjects}
              </p>
              <span className={`inline-block mt-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                site.enrollmentStatus === "on-track" ? "bg-green-100 text-green-800" :
                site.enrollmentStatus === "ahead" ? "bg-blue-100 text-blue-800" :
                "bg-orange-100 text-orange-800"
              }`}>
                {site.enrollmentStatus === "on-track" ? "On Track" :
                 site.enrollmentStatus === "ahead" ? "Ahead" : "Behind"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "overview", label: "Overview", icon: BarChart3 },
            { key: "enrollment", label: "Enrollment", icon: Users },
            { key: "quality", label: "Data Quality", icon: Gauge },
            { key: "safety", label: "Safety Monitoring", icon: Heart },
            { key: "audit", label: "Audit Trail", icon: Eye },
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

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Additional Metrics */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900 mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                {mockHealthMetrics.slice(3).map((metric) => {
                  const config = statusConfig[metric.status];
                  const Icon = metric.icon;
                  return (
                    <div key={metric.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={config.text} />
                        <span className="text-sm font-medium text-slate-900">{metric.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{metric.value}{metric.unit}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Milestones */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900 mb-4">Study Milestones</h3>
              <div className="space-y-2">
                {mockMilestones.slice(0, 5).map((milestone) => (
                  <div key={milestone.id} className="p-2 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900">{milestone.label}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        milestone.status === "completed" ? "bg-green-100 text-green-800" :
                        milestone.status === "on-track" ? "bg-blue-100 text-blue-800" :
                        milestone.status === "at-risk" ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {milestone.status.replace("-", " ")}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full ${
                          milestone.status === "completed" ? "bg-green-500" :
                          milestone.status === "on-track" ? "bg-blue-500" :
                          milestone.status === "at-risk" ? "bg-orange-500" :
                          "bg-red-500"
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Tab */}
      {activeTab === "enrollment" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Site Enrollment Status</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {mockSiteMetrics.map((site) => (
              <div key={site.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{site.siteName}</p>
                    <p className="text-sm text-slate-600">Site ID: {site.siteId}</p>
                    <div className="mt-3 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Enrollment</p>
                        <div className="h-2 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${(site.enrolledSubjects / site.targetSubjects) * 100}%` }}
                          />
                        </div>
                        <p className="text-sm font-medium text-slate-900 mt-1">
                          {site.enrolledSubjects} / {site.targetSubjects}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Data Quality</p>
                        <div className="h-2 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${site.dataQualityScore}%` }}
                          />
                        </div>
                        <p className="text-sm font-medium text-slate-900 mt-1">{site.dataQualityScore}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Query Rate</p>
                        <div className="h-2 rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full bg-orange-500"
                            style={{ width: `${Math.min(site.queryRate * 10, 100)}%` }}
                          />
                        </div>
                        <p className="text-sm font-medium text-slate-900 mt-1">{site.queryRate}%</p>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    site.enrollmentStatus === "on-track" ? "bg-green-100 text-green-800" :
                    site.enrollmentStatus === "ahead" ? "bg-blue-100 text-blue-800" :
                    "bg-orange-100 text-orange-800"
                  }`}>
                    {site.enrollmentStatus === "on-track" ? "On Track" :
                     site.enrollmentStatus === "ahead" ? "Ahead" : "Behind"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quality Tab */}
      {activeTab === "quality" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Overall Data Quality</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 rounded-full border-4 border-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">94%</p>
                    <p className="text-xs text-slate-500">Overall</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4 border border-green-200">
                <p className="text-sm text-green-700 font-medium mb-2">Completeness</p>
                <p className="text-2xl font-bold text-green-900">96%</p>
                <p className="text-xs text-green-700 mt-2">All required fields filled</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4 border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-2">Validity</p>
                <p className="text-2xl font-bold text-blue-900">92%</p>
                <p className="text-xs text-blue-700 mt-2">Values within expected ranges</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 p-4 border border-orange-200">
                <p className="text-sm text-orange-700 font-medium mb-2">Consistency</p>
                <p className="text-2xl font-bold text-orange-900">91%</p>
                <p className="text-xs text-orange-700 mt-2">No conflicting values</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Quality Issues by Form</h3>
            <div className="space-y-3">
              {[
                { form: "Demographics", issues: 2, status: "low" },
                { form: "Vital Signs", issues: 1, status: "low" },
                { form: "Laboratory", issues: 5, status: "medium" },
                { form: "Adverse Events", issues: 3, status: "medium" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <p className="text-sm font-medium text-slate-900">{item.form}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.status === "low" ? "bg-green-100 text-green-800" :
                    "bg-orange-100 text-orange-800"
                  }`}>
                    {item.issues} {item.issues === 1 ? "issue" : "issues"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Safety Tab */}
      {activeTab === "safety" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Safety Alerts ({activeSafetyCases})</h2>
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                {activeSafetyCases} Active
              </span>
            </div>
          </div>
          <div className="divide-y divide-slate-200">
            {mockSafetyAlerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        alert.severity === "low" ? "bg-blue-100 text-blue-800" :
                        alert.severity === "high" ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {alert.type}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        alert.status === "resolved" ? "bg-green-100 text-green-800" :
                        alert.status === "under-review" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {alert.status.replace("-", " ")}
                      </span>
                    </div>
                    <p className="font-medium text-slate-900">{alert.description}</p>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Subject</p>
                        <p className="text-slate-700">{alert.subjectId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Site</p>
                        <p className="text-slate-700">{alert.siteId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Reported</p>
                        <p className="text-slate-700">{new Date(alert.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {alert.assignedTo && (
                      <p className="mt-2 text-xs text-slate-600">
                        <span className="font-medium">Assigned to:</span> {alert.assignedTo}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedSafetyAlert(alert)}
                    className="ml-4 rounded px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === "audit" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Audit Trail</h2>
            <p className="text-sm text-slate-600">Recent system activities and changes</p>
          </div>
          <div className="divide-y divide-slate-200">
            {mockAuditTrail.map((entry) => (
              <div key={entry.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900">{entry.action}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.severity === "info" ? "bg-slate-100 text-slate-700" :
                        entry.severity === "warning" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {entry.severity.charAt(0).toUpperCase() + entry.severity.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{entry.details}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      <span>By: {entry.user}</span>
                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metric Details Modal */}
      {selectedMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{selectedMetric.label}</h3>
              <button
                onClick={() => setSelectedMetric(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500 mb-1">Current Value</p>
                <p className="text-3xl font-bold text-slate-900">
                  {selectedMetric.value}{selectedMetric.unit}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-xs text-blue-600 font-medium mb-1">Target Value</p>
                <p className="text-2xl font-bold text-blue-900">{selectedMetric.target}{selectedMetric.unit}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-500 mb-2">Status</p>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusConfig[selectedMetric.status].bg} ${statusConfig[selectedMetric.status].text}`}>
                  {statusConfig[selectedMetric.status].label}
                </span>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedMetric(null)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Alert Review Modal */}
      {selectedSafetyAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Safety Alert Review</h3>
              <button
                onClick={() => setSelectedSafetyAlert(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Description</p>
                <p className="text-sm font-medium text-slate-900">{selectedSafetyAlert.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Subject ID</p>
                  <p className="text-sm font-medium text-slate-900">{selectedSafetyAlert.subjectId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Site ID</p>
                  <p className="text-sm font-medium text-slate-900">{selectedSafetyAlert.siteId}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Reporter Comments</p>
                <textarea
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Add review comments or findings..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedSafetyAlert(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Save Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}