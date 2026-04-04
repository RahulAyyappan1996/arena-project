import { useState } from "react";
import { Plus } from "lucide-react";
import { Project } from "./types";
import { StatusBadge } from "./shared/StatusBadge";

interface DashboardViewProps {
  projects: Project[];
  userEmail: string;
  pendingSignatures: number;
  onSelect: (p: Project) => void;
  onCreate: (title: string, protocolId: string, area: string) => void;
  onOpenTmf: () => void;
  onLogout: () => void;
}

export function DashboardView({
  projects,
  userEmail,
  pendingSignatures,
  onSelect,
  onCreate,
  onOpenTmf,
  onLogout,
}: DashboardViewProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("New Study");
  const [protocolId, setProtocolId] = useState("NEW-001");
  const [area, setArea] = useState("Cardiology");

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Projects I'm Enrolled In</h2>
          <p className="text-slate-600">Select a project to continue its lifecycle.</p>
          <p className="text-xs text-slate-500">Signed in as {userEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTmf}
            className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
          >
            TMF Portal {pendingSignatures > 0 ? `(${pendingSignatures} pending)` : ""}
          </button>
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <span className="inline-flex items-center gap-2">
              <Plus size={16} />
              Create New Project
            </span>
          </button>
          <button onClick={onLogout} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold">
            Logout
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-900">My TMF Signature Tasks</p>
        <p className="text-sm text-blue-800">
          {pendingSignatures > 0
            ? `You have ${pendingSignatures} document${pendingSignatures > 1 ? "s" : ""} waiting for signature.`
            : "No pending signature tasks right now."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <button key={p.id} onClick={() => onSelect(p)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <StatusBadge status={p.status} />
            </div>
            <p className="mt-2 text-sm text-slate-600">Protocol: {p.protocolId}</p>
            <p className="text-sm text-slate-600">PI: {p.pi}</p>
            <p className="text-sm text-slate-600">Therapeutic Area: {p.area}</p>
            <p className="mt-2 text-sm text-slate-600">{p.sites} sites • {p.subjects} subjects</p>
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xl font-semibold">Create New Project</h3>
            <div className="mt-4 space-y-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Study Name" />
              <input value={protocolId} onChange={(e) => setProtocolId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Protocol ID" />
              <input value={area} onChange={(e) => setArea(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Therapeutic Area" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2">Cancel</button>
              <button
                onClick={() => {
                  onCreate(title, protocolId, area);
                  setOpen(false);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
              >
                Create And Open
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
