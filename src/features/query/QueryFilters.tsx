import { Search } from "lucide-react";

export function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "red" | "amber" | "emerald" | "violet" }) {
  const toneClass = {
    red: "border-red-200 bg-red-50 text-red-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    violet: "border-violet-200 bg-violet-50 text-violet-800",
  }[tone];

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm" />
    </label>
  );
}

export function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="lg:col-span-2">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
      <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
        <Search size={14} className="text-slate-400" />
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Query ID, subject, field, text" className="w-full outline-none" />
      </div>
    </label>
  );
}
