import { motion } from "framer-motion";

type FaroPredictResultPanelProps = {
  successProbability: number;
  projectedCompletionDate: string;
  running: boolean;
};

export default function FaroPredictResultPanel({
  successProbability,
  projectedCompletionDate,
  running,
}: FaroPredictResultPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-800">Result Dashboard</p>

      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Success Probability</p>
        <motion.p
          key={successProbability}
          initial={{ scale: 0.96, opacity: 0.65 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="mt-1 text-3xl font-bold text-blue-900"
        >
          {successProbability}%
        </motion.p>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Projected Completion Date</p>
        <motion.p
          key={projectedCompletionDate}
          initial={{ y: 5, opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mt-1 text-lg font-semibold text-slate-900"
        >
          {projectedCompletionDate}
        </motion.p>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
        <p className="font-semibold text-slate-700">Model Notes</p>
        <p className="mt-1">Signals are updated as agents emit simulation events. This sandbox uses controlled demo logic.</p>
        <p className="mt-1">Status: {running ? "Running" : "Idle"}</p>
      </div>
    </div>
  );
}
