import { X } from "lucide-react";
import { QueryRecord, QueryStatus } from "./types";
import { formatDate } from "./queryUtils";

type Props = {
  query: QueryRecord;
  responseDraft: string;
  newStatus: QueryStatus;
  onClose: () => void;
  onStatusChange: (status: QueryStatus) => void;
  onResponseChange: (text: string) => void;
  onSubmit: () => void;
  onCloseForReadiness?: (count: number) => void;
};

export function QueryDetailModal({
  query,
  responseDraft,
  newStatus,
  onClose,
  onStatusChange,
  onResponseChange,
  onSubmit,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Query Detail</p>
            <h3 className="text-xl font-semibold text-slate-900">{query.id} · {query.formType}.{query.crfField}</h3>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-300 p-1 text-slate-700"><X size={16} /></button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Full Query Description</p>
            <p className="mt-2 text-sm text-slate-800">{query.fullDescription}</p>
            <div className="mt-3 grid gap-2 text-xs text-slate-600">
              <p><span className="font-semibold">Subject:</span> {query.subject}</p>
              <p><span className="font-semibold">Site:</span> {query.site}</p>
              <p><span className="font-semibold">Visit:</span> {query.visit}</p>
              <p><span className="font-semibold">Created:</span> {formatDate(query.createdDate)}</p>
            </div>
            <button className="mt-3 rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">Go To Data Point: {query.dataPointRef}</button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Response Thread (Time-Stamped)</p>
            <div className="mt-2 max-h-44 space-y-2 overflow-y-auto pr-1">
              {query.responses.length === 0 ? (
                <p className="text-sm text-slate-500">No responses yet.</p>
              ) : (
                query.responses
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
              <select value={newStatus} onChange={(e) => onStatusChange(e.target.value as QueryStatus)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
                <option value="escalated">Escalated</option>
              </select>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add Response</label>
              <textarea value={responseDraft} onChange={(e) => onResponseChange(e.target.value)} rows={3} className="rounded-md border border-slate-300 px-2 py-2 text-sm" placeholder="Type your response..." />
              <button onClick={onSubmit} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Submit Response</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
