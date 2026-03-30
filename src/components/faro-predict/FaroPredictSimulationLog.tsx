import { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgentLogMessage } from "./FaroPredict.types";

type FaroPredictSimulationLogProps = {
  logs: AgentLogMessage[];
  running: boolean;
};

const toneClass: Record<AgentLogMessage["tone"], string> = {
  positive: "text-emerald-300",
  neutral: "text-slate-200",
  warning: "text-amber-300",
};

export default function FaroPredictSimulationLog({ logs, running }: FaroPredictSimulationLogProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  const statusLine = useMemo(() => {
    if (running) return "Swarm agents active...";
    if (logs.length > 0) return "Simulation complete.";
    return "Awaiting simulation start.";
  }, [running, logs.length]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">Live Swarm View</p>
        <span className="text-xs font-medium text-slate-500">{statusLine}</span>
      </div>

      <div ref={scrollRef} className="h-80 overflow-y-auto rounded-xl bg-slate-900 p-3 font-mono text-xs leading-6">
        {logs.length === 0 && <p className="text-slate-500">$ no messages yet</p>}

        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.p
              key={log.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`${toneClass[log.tone]}`}
            >
              [{log.agent}]: {log.text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
