interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-1 inline-flex rounded-md bg-white p-1 text-slate-700">{icon}</div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
