import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ContextQuestion } from "./FaroPredict.types";

type FaroPredictContextModalProps = {
  open: boolean;
  questions: ContextQuestion[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function FaroPredictContextModal({
  open,
  questions,
  answers,
  onAnswerChange,
  onClose,
  onConfirm,
}: FaroPredictContextModalProps) {
  const complete = questions.every((question) => Boolean(answers[question.id]));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/35"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Pre-Sim Interview</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Context Questions</h3>
                <p className="mt-1 text-sm text-slate-600">Answer these inputs before the simulation starts.</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-300 p-1.5 text-slate-600 transition hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-800">{question.label}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {question.options.map((option) => {
                      const active = answers[question.id] === option;
                      return (
                        <button
                          key={option}
                          onClick={() => onAnswerChange(question.id, option)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            active
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-700"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={!complete}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Start Simulation
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
