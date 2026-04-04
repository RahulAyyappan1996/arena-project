import { QueryRole, ROLE_OPTIONS } from "./types";

type Props = {
  selectedCount: number;
  bulkAssignee: QueryRole;
  onBulkAssigneeChange: (role: QueryRole) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkReassign: () => void;
  onBulkClose: () => void;
};

export function BulkActionsBar({
  selectedCount,
  bulkAssignee,
  onBulkAssigneeChange,
  onSelectAll,
  onClearSelection,
  onBulkReassign,
  onBulkClose,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <button onClick={onSelectAll} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700">Select All</button>
      <button onClick={onClearSelection} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700">Clear</button>
      <div>
        <span className="mb-1 block text-[11px] font-semibold uppercase text-slate-500">Bulk Reassign</span>
        <div className="flex gap-2">
          <select value={bulkAssignee} onChange={(e) => onBulkAssigneeChange(e.target.value as QueryRole)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs">
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <button onClick={onBulkReassign} className="rounded-md bg-blue-600 px-2 py-1.5 text-xs font-semibold text-white">Reassign</button>
        </div>
      </div>
      <button onClick={onBulkClose} className="rounded-md bg-emerald-600 px-2 py-1.5 text-xs font-semibold text-white">Close Selected ({selectedCount})</button>
    </div>
  );
}
