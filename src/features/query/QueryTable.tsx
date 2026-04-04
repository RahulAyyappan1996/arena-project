import { AlertTriangle } from "lucide-react";
import { QueryRecord } from "./types";
import { STATUS_CLASS, SOURCE_CLASS } from "./types";
import { ageInDays } from "./queryUtils";

type Props = {
  rows: QueryRecord[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectRow: (id: string, status: QueryRecord["status"]) => void;
};

export function QueryTable({ rows, selectedIds, onToggleSelect, onSelectRow }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-3 py-2" />
            <th className="px-3 py-2">Query ID</th>
            <th className="px-3 py-2">Subject</th>
            <th className="px-3 py-2">CRF Field</th>
            <th className="px-3 py-2">Query Text</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Age (days)</th>
            <th className="px-3 py-2">Assigned To</th>
            <th className="px-3 py-2">Created Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const age = ageInDays(row.createdDate);
            const overdue = row.status !== "closed" && age > 7;
            return (
              <tr
                key={row.id}
                className={`cursor-pointer border-t border-slate-200 ${overdue ? "bg-amber-50" : "bg-white hover:bg-slate-50"}`}
                onClick={() => {
                  onSelectRow(row.id, row.status);
                }}
              >
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => onToggleSelect(row.id)} />
                </td>
                <td className="px-3 py-2 font-semibold text-slate-800">{row.id}</td>
                <td className="px-3 py-2 text-slate-700">{row.subject}</td>
                <td className="px-3 py-2 text-slate-700">{row.formType}.{row.crfField}</td>
                <td className="px-3 py-2 text-slate-700">
                  <div className="max-w-sm">
                    <p className="truncate">{row.queryText}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${SOURCE_CLASS[row.source]}`}>{row.source}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[row.status]}`}>{row.status}</span>
                </td>
                <td className="px-3 py-2">
                  <span className={overdue ? "font-semibold text-amber-700" : "text-slate-700"}>{age}</span>
                  {overdue && <AlertTriangle size={12} className="ml-1 inline text-amber-600" />}
                </td>
                <td className="px-3 py-2 text-slate-700">{row.assignedTo}</td>
                <td className="px-3 py-2 text-slate-700">{new Date(row.createdDate).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}