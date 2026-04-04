import { ProjectStatus } from "../types";

interface StatusBadgeProps {
  status: ProjectStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "setup") {
    return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">Setup Mode</span>;
  }
  if (status === "pending") {
    return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">Pending Sign-off</span>;
  }
  return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Live - Phase 2</span>;
}
