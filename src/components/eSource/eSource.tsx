import React, { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Download,
  Eye,
  Edit,
  Send,
} from "lucide-react";

interface ESourceProps {
  onBack: () => void;
}

type DocumentStatus = "pending" | "processing" | "digitized" | "reviewed" | "rejected";

type ESourceDocument = {
  id: string;
  subjectId: string;
  visit: string;
  formType: string;
  uploadedAt: string;
  status: DocumentStatus;
  fileName: string;
  digitizedData?: Record<string, string>;
};

const mockDocuments: ESourceDocument[] = [
  {
    id: "doc-1",
    subjectId: "001-001",
    visit: "Screening",
    formType: "Informed Consent",
    uploadedAt: "2026-04-01T10:30:00Z",
    status: "digitized",
    fileName: "consent_001-001.pdf",
    digitizedData: {
      "Consent Obtained": "Yes",
      "Consent Date": "2026-04-01",
      "Consent Time": "10:15",
    },
  },
  {
    id: "doc-2",
    subjectId: "001-002",
    visit: "Day 1",
    formType: "Vital Signs",
    uploadedAt: "2026-04-02T14:20:00Z",
    status: "processing",
    fileName: "vitals_001-002.jpg",
  },
  {
    id: "doc-3",
    subjectId: "002-001",
    visit: "Day 7",
    formType: "Laboratory Results",
    uploadedAt: "2026-04-03T09:45:00Z",
    status: "pending",
    fileName: "lab_results_002-001.pdf",
  },
  {
    id: "doc-4",
    subjectId: "001-001",
    visit: "Day 14",
    formType: "Adverse Events",
    uploadedAt: "2026-04-04T16:10:00Z",
    status: "rejected",
    fileName: "ae_001-001.pdf",
  },
];

const statusConfig = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending Review" },
  processing: { icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50", label: "Processing" },
  digitized: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Digitized" },
  reviewed: { icon: CheckCircle, color: "text-purple-600", bg: "bg-purple-50", label: "Reviewed" },
  rejected: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Rejected" },
};

export default function ESource({ onBack }: ESourceProps) {
  const [documents, setDocuments] = useState<ESourceDocument[]>(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState<ESourceDocument | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const handleStatusChange = (docId: string, newStatus: DocumentStatus) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId ? { ...doc, status: newStatus } : doc
      )
    );
  };

  const handleDigitize = (docId: string) => {
    // Mock digitization
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === docId
          ? {
              ...doc,
              status: "digitized",
              digitizedData: {
                "Field 1": "Sample Value",
                "Field 2": "Another Value",
                "Field 3": "Digitized Data",
              },
            }
          : doc
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
            <h1 className="text-2xl font-bold text-slate-900">eSource Application</h1>
            <p className="text-sm text-slate-600">Digitize site-reported data to eliminate paper workflows</p>
          </div>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = documents.filter(doc => doc.status === status).length;
          const Icon = config.icon;
          return (
            <div key={status} className={`rounded-lg border p-4 ${config.bg}`}>
              <div className="flex items-center gap-3">
                <Icon className={`h-8 w-8 ${config.color}`} />
                <div>
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-sm text-slate-600">{config.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Documents Table */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Document Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Subject/Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Form Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {documents.map((doc) => {
                const config = statusConfig[doc.status];
                const Icon = config.icon;
                return (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{doc.subjectId}</p>
                        <p className="text-sm text-slate-500">{doc.visit}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{doc.formType}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
                        <Icon size={12} />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={12} />
                          View
                        </button>
                        {doc.status === "pending" && (
                          <button
                            onClick={() => handleDigitize(doc.id)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
                          >
                            <Edit size={12} />
                            Digitize
                          </button>
                        )}
                        {doc.status === "digitized" && (
                          <button
                            onClick={() => handleStatusChange(doc.id, "reviewed")}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50"
                          >
                            <CheckCircle size={12} />
                            Review
                          </button>
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

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Document Details</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Subject ID</label>
                  <p className="text-sm text-slate-900">{selectedDoc.subjectId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Visit</label>
                  <p className="text-sm text-slate-900">{selectedDoc.visit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Form Type</label>
                  <p className="text-sm text-slate-900">{selectedDoc.formType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Status</label>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusConfig[selectedDoc.status].bg} ${statusConfig[selectedDoc.status].color}`}>
                    {statusConfig[selectedDoc.status].label}
                  </span>
                </div>
              </div>
              {selectedDoc.digitizedData && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Digitized Data</label>
                  <div className="space-y-2">
                    {Object.entries(selectedDoc.digitizedData).map(([field, value]) => (
                      <div key={field} className="flex justify-between">
                        <span className="text-sm text-slate-600">{field}:</span>
                        <span className="text-sm font-medium text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Download size={16} className="inline mr-1" />
                  Download Original
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Upload Document</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select File</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject ID</label>
                  <input
                    type="text"
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="001-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Visit</label>
                  <select className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option>Screening</option>
                    <option>Day 1</option>
                    <option>Day 7</option>
                    <option>Day 14</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Form Type</label>
                <select className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option>Informed Consent</option>
                  <option>Vital Signs</option>
                  <option>Laboratory Results</option>
                  <option>Adverse Events</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowUpload(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Send size={16} className="inline mr-1" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}