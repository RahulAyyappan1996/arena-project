import React, { useState } from "react";
import {
  Database,
  Link,
  Unlink,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Zap,
  BarChart3,
  Table,
  Settings,
  Download,
  Upload,
} from "lucide-react";

interface MultiSourceDataProps {
  onBack: () => void;
}

type DataSourceType = "EDC" | "RTSM" | "eCOA" | "Labs" | "Imaging" | "Third-party";

type ConnectionStatus = "connected" | "disconnected" | "error" | "syncing";

type DataSource = {
  id: string;
  name: string;
  type: DataSourceType;
  status: ConnectionStatus;
  lastSync?: string;
  recordsCount: number;
  errorMessage?: string;
  endpoint?: string;
};

type IngestionJob = {
  id: string;
  sourceId: string;
  sourceName: string;
  status: "pending" | "running" | "completed" | "failed";
  recordsProcessed: number;
  totalRecords: number;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
};

type HarmonizedRecord = {
  id: string;
  subjectId: string;
  visit: string;
  dataPoint: string;
  sources: Array<{
    source: string;
    value: string;
    timestamp: string;
    quality: "high" | "medium" | "low";
  }>;
  harmonizedValue: string;
  conflicts: number;
  lastUpdated: string;
};

const mockDataSources: DataSource[] = [
  {
    id: "source-1",
    name: "Veeva EDC",
    type: "EDC",
    status: "connected",
    lastSync: "2026-04-08T10:30:00Z",
    recordsCount: 15420,
    endpoint: "https://edc.veeva.com/api/v1",
  },
  {
    id: "source-2",
    name: "Medidata RTSM",
    type: "RTSM",
    status: "connected",
    lastSync: "2026-04-08T10:25:00Z",
    recordsCount: 892,
    endpoint: "https://rtsm.medidata.com/api/v2",
  },
  {
    id: "source-3",
    name: "eCOA Platform",
    type: "eCOA",
    status: "syncing",
    lastSync: "2026-04-08T09:45:00Z",
    recordsCount: 2156,
    endpoint: "https://ecoa.clinical.com/api/v1",
  },
  {
    id: "source-4",
    name: "Central Lab",
    type: "Labs",
    status: "connected",
    lastSync: "2026-04-08T08:15:00Z",
    recordsCount: 3421,
    endpoint: "https://lab.centrallab.com/api/v1",
  },
  {
    id: "source-5",
    name: "Imaging Core",
    type: "Imaging",
    status: "error",
    lastSync: "2026-04-07T16:20:00Z",
    recordsCount: 234,
    errorMessage: "Authentication failed",
    endpoint: "https://imaging.corelab.com/api/v1",
  },
  {
    id: "source-6",
    name: "Wearable Device Data",
    type: "Third-party",
    status: "disconnected",
    recordsCount: 0,
    endpoint: "https://wearable.fitbit.com/api/v1",
  },
];

const mockIngestionJobs: IngestionJob[] = [
  {
    id: "job-1",
    sourceId: "source-1",
    sourceName: "Veeva EDC",
    status: "completed",
    recordsProcessed: 15420,
    totalRecords: 15420,
    startedAt: "2026-04-08T10:00:00Z",
    completedAt: "2026-04-08T10:30:00Z",
  },
  {
    id: "job-2",
    sourceId: "source-3",
    sourceName: "eCOA Platform",
    status: "running",
    recordsProcessed: 1856,
    totalRecords: 2156,
    startedAt: "2026-04-08T09:45:00Z",
  },
  {
    id: "job-3",
    sourceId: "source-4",
    sourceName: "Central Lab",
    status: "completed",
    recordsProcessed: 3421,
    totalRecords: 3421,
    startedAt: "2026-04-08T08:00:00Z",
    completedAt: "2026-04-08T08:15:00Z",
  },
];

const mockHarmonizedRecords: HarmonizedRecord[] = [
  {
    id: "harm-1",
    subjectId: "001-001",
    visit: "Day 1",
    dataPoint: "Systolic Blood Pressure",
    sources: [
      { source: "EDC", value: "125", timestamp: "2026-04-01T10:30:00Z", quality: "high" },
      { source: "eCOA", value: "128", timestamp: "2026-04-01T10:35:00Z", quality: "medium" },
    ],
    harmonizedValue: "125",
    conflicts: 0,
    lastUpdated: "2026-04-08T10:30:00Z",
  },
  {
    id: "harm-2",
    subjectId: "001-002",
    visit: "Day 7",
    dataPoint: "ALT",
    sources: [
      { source: "EDC", value: "45", timestamp: "2026-04-03T14:20:00Z", quality: "high" },
      { source: "Labs", value: "48", timestamp: "2026-04-03T12:00:00Z", quality: "high" },
    ],
    harmonizedValue: "45",
    conflicts: 1,
    lastUpdated: "2026-04-08T08:15:00Z",
  },
  {
    id: "harm-3",
    subjectId: "002-001",
    visit: "Day 14",
    dataPoint: "Pain Score",
    sources: [
      { source: "EDC", value: "3", timestamp: "2026-04-05T09:15:00Z", quality: "high" },
      { source: "eCOA", value: "4", timestamp: "2026-04-05T09:20:00Z", quality: "high" },
      { source: "Wearable", value: "3.5", timestamp: "2026-04-05T09:25:00Z", quality: "low" },
    ],
    harmonizedValue: "3",
    conflicts: 0,
    lastUpdated: "2026-04-08T09:45:00Z",
  },
];

const statusConfig = {
  connected: { icon: Link, color: "text-green-600", bg: "bg-green-50", label: "Connected" },
  disconnected: { icon: Unlink, color: "text-slate-600", bg: "bg-slate-50", label: "Disconnected" },
  error: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", label: "Error" },
  syncing: { icon: RefreshCw, color: "text-blue-600", bg: "bg-blue-50", label: "Syncing" },
};

export default function MultiSourceData({ onBack }: MultiSourceDataProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources);
  const [ingestionJobs, setIngestionJobs] = useState<IngestionJob[]>(mockIngestionJobs);
  const [harmonizedRecords, setHarmonizedRecords] = useState<HarmonizedRecord[]>(mockHarmonizedRecords);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [activeTab, setActiveTab] = useState<"sources" | "ingestion" | "harmonized">("sources");

  const handleConnectSource = (sourceId: string) => {
    setDataSources(sources =>
      sources.map(source =>
        source.id === sourceId ? { ...source, status: "connected" as ConnectionStatus } : source
      )
    );
  };

  const handleSyncSource = (sourceId: string) => {
    setDataSources(sources =>
      sources.map(source =>
        source.id === sourceId ? { ...source, status: "syncing" as ConnectionStatus } : source
      )
    );
    // Mock sync completion
    setTimeout(() => {
      setDataSources(sources =>
        sources.map(source =>
          source.id === sourceId
            ? { ...source, status: "connected", lastSync: new Date().toISOString(), recordsCount: source.recordsCount + Math.floor(Math.random() * 100) }
            : source
        )
      );
    }, 3000);
  };

  const stats = {
    totalSources: dataSources.length,
    connected: dataSources.filter(s => s.status === "connected").length,
    activeJobs: ingestionJobs.filter(j => j.status === "running").length,
    totalRecords: dataSources.reduce((sum, s) => sum + s.recordsCount, 0),
    harmonizedRecords: harmonizedRecords.length,
    conflicts: harmonizedRecords.reduce((sum, r) => sum + r.conflicts, 0),
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
            <h1 className="text-2xl font-bold text-slate-900">Multi-Source Data Integration</h1>
            <p className="text-sm text-slate-600">Aggregate and harmonize data from multiple clinical systems</p>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Settings size={16} />
          Configure Sources
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalSources}</p>
              <p className="text-sm text-slate-600">Data Sources</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Link className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.connected}</p>
              <p className="text-sm text-slate-600">Connected</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.activeJobs}</p>
              <p className="text-sm text-slate-600">Active Jobs</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Table className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.harmonizedRecords}</p>
              <p className="text-sm text-slate-600">Harmonized</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: "sources", label: "Data Sources", icon: Database },
            { key: "ingestion", label: "Ingestion Jobs", icon: Download },
            { key: "harmonized", label: "Harmonized Data", icon: Zap },
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

      {/* Data Sources Tab */}
      {activeTab === "sources" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Data Sources</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {dataSources.map((source) => {
              const config = statusConfig[source.status];
              const Icon = config.icon;
              return (
                <div key={source.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-slate-900">{source.name}</p>
                        <p className="text-sm text-slate-500">{source.type}</p>
                        {source.endpoint && <p className="text-xs text-slate-400 font-mono">{source.endpoint}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{source.recordsCount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">records</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
                        <Icon size={12} />
                        {config.label}
                      </span>
                      <div className="flex gap-2">
                        {source.status === "disconnected" && (
                          <button
                            onClick={() => handleConnectSource(source.id)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                          >
                            <Link size={12} />
                            Connect
                          </button>
                        )}
                        {source.status === "connected" && (
                          <button
                            onClick={() => handleSyncSource(source.id)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            <RefreshCw size={12} />
                            Sync
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedSource(source)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <Settings size={12} />
                          Config
                        </button>
                      </div>
                    </div>
                  </div>
                  {source.errorMessage && (
                    <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3">
                      <p className="text-sm text-red-800">{source.errorMessage}</p>
                    </div>
                  )}
                  {source.lastSync && (
                    <p className="mt-1 text-xs text-slate-500">
                      Last sync: {new Date(source.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ingestion Jobs Tab */}
      {activeTab === "ingestion" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Ingestion Jobs</h2>
          </div>
          <div className="divide-y divide-slate-200">
            {ingestionJobs.map((job) => (
              <div key={job.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{job.sourceName}</p>
                    <p className="text-sm text-slate-500">
                      {job.recordsProcessed} / {job.totalRecords} records processed
                    </p>
                    <p className="text-xs text-slate-400">
                      Started: {new Date(job.startedAt).toLocaleString()}
                      {job.completedAt && ` • Completed: ${new Date(job.completedAt).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            job.status === "completed" ? "bg-green-600" :
                            job.status === "running" ? "bg-blue-600" :
                            job.status === "failed" ? "bg-red-600" : "bg-slate-400"
                          }`}
                          style={{ width: `${(job.recordsProcessed / job.totalRecords) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      job.status === "completed" ? "bg-green-100 text-green-800" :
                      job.status === "running" ? "bg-blue-100 text-blue-800" :
                      job.status === "failed" ? "bg-red-100 text-red-800" :
                      "bg-slate-100 text-slate-800"
                    }`}>
                      {job.status === "completed" && <CheckCircle size={12} />}
                      {job.status === "running" && <RefreshCw size={12} />}
                      {job.status === "failed" && <AlertTriangle size={12} />}
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                </div>
                {job.errorMessage && (
                  <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3">
                    <p className="text-sm text-red-800">{job.errorMessage}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Harmonized Data Tab */}
      {activeTab === "harmonized" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Harmonized Data</h2>
            <p className="text-sm text-slate-600">Unified data from multiple sources with conflict resolution</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Subject/Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Data Point
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Sources
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Harmonized Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {harmonizedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{record.subjectId}</p>
                        <p className="text-sm text-slate-500">{record.visit}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{record.dataPoint}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {record.sources.map((source, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              source.quality === "high" ? "bg-green-100 text-green-800" :
                              source.quality === "medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            }`}
                          >
                            {source.source}: {source.value}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">{record.harmonizedValue}</span>
                    </td>
                    <td className="px-6 py-4">
                      {record.conflicts > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                          <AlertTriangle size={12} />
                          {record.conflicts} conflicts
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          <CheckCircle size={12} />
                          Harmonized
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Source Configuration Modal */}
      {selectedSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Configure {selectedSource.name}</h3>
              <button
                onClick={() => setSelectedSource(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Endpoint URL</label>
                <input
                  type="url"
                  defaultValue={selectedSource.endpoint}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="https://api.example.com/v1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                <input
                  type="password"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Enter API key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sync Frequency</label>
                <select className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option>Real-time</option>
                  <option>Hourly</option>
                  <option>Daily</option>
                  <option>Manual</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedSource(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}