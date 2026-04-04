import { useState } from "react";
import { ArrowLeft, ArrowRight, UploadCloud, CheckCircle2 } from "lucide-react";
import { Project, CrfRow } from "./types";
import { INITIAL_CRF_DEFINITIONS, flattenDefinitionsToRows } from "./helpers";

interface FaroSetupViewProps {
  project: Project;
  faroUnlocked: boolean;
  onProcessProtocol: () => void;
  onBackToDashboard: () => void;
  onContinueToEditChecks: (crfs: CrfRow[]) => void;
}

export function FaroSetupView({
  project,
  faroUnlocked,
  onProcessProtocol,
  onBackToDashboard,
  onContinueToEditChecks,
}: FaroSetupViewProps) {
  const [insideFaro, setInsideFaro] = useState(false);

  if (insideFaro) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button onClick={onBackToDashboard} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} />
        Back To Dashboard
      </button>
      <h2 className="text-3xl font-semibold">FARO Study Build - Protocol Ingestion</h2>
      <p className="mt-1 text-slate-600">{project.title} - {project.protocolId}</p>

      {!faroUnlocked ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <div className="mx-auto mb-4 w-fit rounded-2xl bg-red-50 p-3 text-red-600">
            <UploadCloud size={30} />
          </div>
          <p className="text-lg font-semibold">Drop protocol PDF or click to ingest mock protocol</p>
          <p className="text-sm text-slate-500">AI maps to CDASH forms and schedule of activities.</p>
          <button onClick={onProcessProtocol} className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white">Process Protocol</button>
        </div>
      ) : (
        <div className="mt-6">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={18} /> Protocol Successfully Processed
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold">CDASH-Compliant Forms</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>Demographics (DM)</li>
                <li>Vital Signs (VS)</li>
                <li>Adverse Events (AE)</li>
                <li>Concomitant Medications (CM)</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold">Schedule of Events</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>Screening (Day -1)</li>
                <li>Baseline (Day 1)</li>
                <li>Treatment (Day 7, 14, 21, 28)</li>
                <li>Follow Up (Day 56, 70)</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <button
              onClick={() => setInsideFaro(true)}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Open FARO Study Definition Workspace
            </button>
            <button
              onClick={() => onContinueToEditChecks(flattenDefinitionsToRows(INITIAL_CRF_DEFINITIONS))}
              className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Approve & Generate Forms (Continue)
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
