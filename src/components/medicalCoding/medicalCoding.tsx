import React, { useState } from "react";
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Code,
  BookOpen,
  Filter,
  Edit,
  Save,
  Zap,
} from "lucide-react";

interface MedicalCodingProps {
  onBack: () => void;
}

type CodingStatus = "uncoded" | "coded" | "reviewed" | "auto-coded";

type DictionaryType = "MedDRA" | "WHO-DD" | "MedDRA-SMQ" | "Custom";

type CodingTerm = {
  id: string;
  subjectId: string;
  visit: string;
  formType: string;
  fieldLabel: string;
  verbatimTerm: string;
  dictionary: DictionaryType;
  codedTerm?: string;
  code?: string;
  status: CodingStatus;
  confidence?: number;
  codedBy?: string;
  codedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
};

const mockCodingTerms: CodingTerm[] = [
  {
    id: "code-1",
    subjectId: "001-001",
    visit: "Day 7",
    formType: "Adverse Events",
    fieldLabel: "AE Term",
    verbatimTerm: "Headache",
    dictionary: "MedDRA",
    codedTerm: "Headache",
    code: "10019211",
    status: "coded",
    confidence: 95,
    codedBy: "Coder001",
    codedAt: "2026-04-01T10:30:00Z",
    reviewedBy: "Coder002",
    reviewedAt: "2026-04-01T11:00:00Z",
  },
  {
    id: "code-2",
    subjectId: "001-002",
    visit: "Day 14",
    formType: "Adverse Events",
    fieldLabel: "AE Term",
    verbatimTerm: "Severe nausea and vomiting",
    dictionary: "MedDRA",
    codedTerm: "Nausea",
    code: "10028813",
    status: "reviewed",
    confidence: 88,
    codedBy: "Coder001",
    codedAt: "2026-04-02T14:20:00Z",
  },
  {
    id: "code-3",
    subjectId: "002-001",
    visit: "Screening",
    formType: "Medical History",
    fieldLabel: "Condition Term",
    verbatimTerm: "Type 2 diabetes mellitus",
    dictionary: "MedDRA",
    status: "uncoded",
  },
  {
    id: "code-4",
    subjectId: "003-001",
    visit: "Day 21",
    formType: "Concomitant Medications",
    fieldLabel: "Medication Name",
    verbatimTerm: "Metformin 500mg",
    dictionary: "WHO-DD",
    codedTerm: "METFORMIN",
    code: "A10BA02",
    status: "auto-coded",
    confidence: 100,
    codedBy: "System",
    codedAt: "2026-04-03T09:45:00Z",
  },
  {
    id: "code-5",
    subjectId: "001-001",
    visit: "Day 28",
    formType: "Adverse Events",
    fieldLabel: "AE Term",
    verbatimTerm: "Elevated liver enzymes",
    dictionary: "MedDRA",
    codedTerm: "Hepatic enzyme increased",
    code: "10019642",
    status: "coded",
    confidence: 92,
    codedBy: "Coder001",
    codedAt: "2026-04-04T16:10:00Z",
  },
];

const statusConfig = {
  uncoded: { icon: Clock, color: "text-slate-600", bg: "bg-slate-50", label: "Uncoded" },
  "auto-coded": { icon: Zap, color: "text-blue-600", bg: "bg-blue-50", label: "Auto-coded" },
  coded: { icon: Code, color: "text-green-600", bg: "bg-green-50", label: "Coded" },
  reviewed: { icon: CheckCircle, color: "text-purple-600", bg: "bg-purple-50", label: "Reviewed" },
};

const dictionarySuggestions = {
  MedDRA: [
    { term: "Headache", code: "10019211", confidence: 95 },
    { term: "Nausea", code: "10028813", confidence: 88 },
    { term: "Vomiting", code: "10047700", confidence: 85 },
    { term: "Hepatic enzyme increased", code: "10019642", confidence: 92 },
    { term: "Diarrhoea", code: "10012735", confidence: 90 },
  ],
  "WHO-DD": [
    { term: "METFORMIN", code: "A10BA02", confidence: 100 },
    { term: "INSULIN", code: "A10A", confidence: 95 },
    { term: "ASPIRIN", code: "B01AC06", confidence: 100 },
    { term: "PARACETAMOL", code: "N02BE01", confidence: 100 },
  ],
};

export default function MedicalCoding({ onBack }: MedicalCodingProps) {
  const [codingTerms, setCodingTerms] = useState<CodingTerm[]>(mockCodingTerms);
  const [selectedTerm, setSelectedTerm] = useState<CodingTerm | null>(null);
  const [filterStatus, setFilterStatus] = useState<CodingStatus | "all">("all");
  const [filterDictionary, setFilterDictionary] = useState<DictionaryType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredTerms = codingTerms.filter(term => {
    const matchesStatus = filterStatus === "all" || term.status === filterStatus;
    const matchesDictionary = filterDictionary === "all" || term.dictionary === filterDictionary;
    const matchesSearch = term.verbatimTerm.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.subjectId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesDictionary && matchesSearch;
  });

  const handleCodeTerm = (termId: string, codedTerm: string, code: string, confidence: number) => {
    setCodingTerms(terms =>
      terms.map(term =>
        term.id === termId
          ? {
              ...term,
              codedTerm,
              code,
              status: "coded",
              confidence,
              codedBy: "Coder001",
              codedAt: new Date().toISOString(),
            }
          : term
      )
    );
  };

  const handleReviewTerm = (termId: string) => {
    setCodingTerms(terms =>
      terms.map(term =>
        term.id === termId
          ? {
              ...term,
              status: "reviewed",
              reviewedBy: "Coder002",
              reviewedAt: new Date().toISOString(),
            }
          : term
      )
    );
  };

  const handleAutoCode = (termId: string) => {
    const term = codingTerms.find(t => t.id === termId);
    if (!term) return;

    // Mock auto-coding logic
    const suggestions = dictionarySuggestions[term.dictionary] || [];
    const bestMatch = suggestions.find(s =>
      term.verbatimTerm.toLowerCase().includes(s.term.toLowerCase())
    );

    if (bestMatch) {
      handleCodeTerm(termId, bestMatch.term, bestMatch.code, bestMatch.confidence);
    }
  };

  const stats = {
    total: codingTerms.length,
    uncoded: codingTerms.filter(term => term.status === "uncoded").length,
    coded: codingTerms.filter(term => term.status === "coded" || term.status === "auto-coded").length,
    reviewed: codingTerms.filter(term => term.status === "reviewed").length,
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
            <h1 className="text-2xl font-bold text-slate-900">Medical Coding</h1>
            <p className="text-sm text-slate-600">Standardize medical terms to controlled vocabularies</p>
          </div>
        </div>
        <button
          onClick={() => setShowSuggestions(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <BookOpen size={16} />
          Dictionary Browser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-slate-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-600">Total Terms</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-slate-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.uncoded}</p>
              <p className="text-sm text-slate-600">Uncoded</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <Code className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.coded}</p>
              <p className="text-sm text-slate-600">Coded</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.reviewed}</p>
              <p className="text-sm text-slate-600">Reviewed</p>
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
          onChange={(e) => setFilterStatus(e.target.value as CodingStatus | "all")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="uncoded">Uncoded</option>
          <option value="auto-coded">Auto-coded</option>
          <option value="coded">Coded</option>
          <option value="reviewed">Reviewed</option>
        </select>
        <select
          value={filterDictionary}
          onChange={(e) => setFilterDictionary(e.target.value as DictionaryType | "all")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All Dictionaries</option>
          <option value="MedDRA">MedDRA</option>
          <option value="WHO-DD">WHO-DD</option>
          <option value="MedDRA-SMQ">MedDRA-SMQ</option>
          <option value="Custom">Custom</option>
        </select>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search terms or subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm w-64"
          />
        </div>
      </div>

      {/* Coding Terms Table */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Coding Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Subject/Visit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Verbatim Term
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Dictionary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Coded Term
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTerms.map((term) => {
                const config = statusConfig[term.status];
                const Icon = config.icon;
                return (
                  <tr key={term.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{term.subjectId}</p>
                        <p className="text-sm text-slate-500">{term.visit}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{term.verbatimTerm}</p>
                        <p className="text-sm text-slate-500">{term.formType} - {term.fieldLabel}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{term.dictionary}</td>
                    <td className="px-6 py-4">
                      {term.codedTerm ? (
                        <div>
                          <p className="font-medium text-slate-900">{term.codedTerm}</p>
                          <p className="text-sm text-slate-500">{term.code}</p>
                          {term.confidence && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                              {term.confidence}% confidence
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Not coded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.color}`}>
                        <Icon size={12} />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTerm(term)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          <Edit size={12} />
                          Code
                        </button>
                        {term.status === "uncoded" && (
                          <button
                            onClick={() => handleAutoCode(term.id)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50"
                          >
                            <Zap size={12} />
                            Auto-code
                          </button>
                        )}
                        {term.status === "coded" && (
                          <button
                            onClick={() => handleReviewTerm(term.id)}
                            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50"
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

      {/* Coding Modal */}
      {selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Code Medical Term</h3>
              <button
                onClick={() => setSelectedTerm(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-6">
              {/* Term Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Subject ID</label>
                  <p className="text-sm text-slate-900">{selectedTerm.subjectId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Visit</label>
                  <p className="text-sm text-slate-900">{selectedTerm.visit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Form Type</label>
                  <p className="text-sm text-slate-900">{selectedTerm.formType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Dictionary</label>
                  <p className="text-sm text-slate-900">{selectedTerm.dictionary}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Verbatim Term</label>
                <div className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3">
                  <p className="text-slate-900">{selectedTerm.verbatimTerm}</p>
                </div>
              </div>

              {/* Coding Interface */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Coded Term</label>
                    <input
                      type="text"
                      defaultValue={selectedTerm.codedTerm || ""}
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Enter coded term..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Code</label>
                    <input
                      type="text"
                      defaultValue={selectedTerm.code || ""}
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Enter code..."
                    />
                  </div>
                </div>

                {/* Suggestions */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dictionary Suggestions</label>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {dictionarySuggestions[selectedTerm.dictionary]?.slice(0, 3).map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                        <div>
                          <p className="font-medium text-slate-900">{suggestion.term}</p>
                          <p className="text-sm text-slate-500">{suggestion.code}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600">{suggestion.confidence}% match</span>
                          <button
                            onClick={() => {
                              handleCodeTerm(selectedTerm.id, suggestion.term, suggestion.code, suggestion.confidence);
                              setSelectedTerm(null);
                            }}
                            className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Mock save - in real app would save the form values
                    setSelectedTerm(null);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <Save size={16} className="inline mr-1" />
                  Save Coding
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dictionary Browser Modal */}
      {showSuggestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl rounded-lg bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Dictionary Browser</h3>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option>MedDRA</option>
                  <option>WHO-DD</option>
                  <option>MedDRA-SMQ</option>
                </select>
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search dictionary terms..."
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Term</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Code</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {dictionarySuggestions.MedDRA?.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.term}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{item.code}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">PT</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}