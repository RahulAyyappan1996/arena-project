import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import FaroPredictContextModal from "./FaroPredictContextModal";
import FaroPredictSimulationLog from "./FaroPredictSimulationLog";
import FaroPredictResultPanel from "./FaroPredictResultPanel";
import KnowledgeGraphExplorer from "./KnowledgeGraphExplorer";
import type { AgentLogMessage, ContextQuestion } from "./FaroPredict.types";

const CONTEXT_QUESTIONS: ContextQuestion[] = [
  {
    id: "priorityMode",
    label: "I detected a 20% dropout risk in rural sites. Should I prioritize cost or speed in this simulation?",
    options: ["Prioritize Cost", "Prioritize Speed", "Balanced"],
  },
  {
    id: "siteBurden",
    label: "Specify Site Burden Level",
    options: ["Low", "Medium", "High"],
  },
  {
    id: "patientRisk",
    label: "Baseline Patient Dropout Risk",
    options: ["Low", "Moderate", "Elevated"],
  },
  {
    id: "regulatoryTolerance",
    label: "Regulatory Tolerance For Efficacy Variance",
    options: ["Conservative", "Balanced", "Exploratory"],
  },
];

const SWARM_MESSAGES: AgentLogMessage[] = [
  {
    id: "1",
    agent: "Patient-Agent-042",
    text: "The lower dosage makes me more likely to stay in the study, side effects are down.",
    tone: "positive",
    probabilityDelta: 2.4,
    completionDeltaDays: -3,
  },
  {
    id: "2",
    agent: "CRA-Lead",
    text: "Site 04 is reporting 15% faster data entry due to fewer AE reports.",
    tone: "positive",
    probabilityDelta: 1.6,
    completionDeltaDays: -2,
  },
  {
    id: "3",
    agent: "Regulator-Bot",
    text: "Efficacy threshold warning: Signal-to-noise ratio dropping.",
    tone: "warning",
    probabilityDelta: -2.8,
    completionDeltaDays: 4,
  },
  {
    id: "4",
    agent: "Safety-Agent-11",
    text: "Moderate reduction in Grade 2 adverse events across treatment weeks 2 to 4.",
    tone: "positive",
    probabilityDelta: 2.1,
    completionDeltaDays: -1,
  },
  {
    id: "5",
    agent: "Site-Optimizer",
    text: "Forecast indicates screening-to-randomization cycle can be shortened by 1.2 days.",
    tone: "neutral",
    probabilityDelta: 0.9,
    completionDeltaDays: -1,
  },
  {
    id: "6",
    agent: "Protocol-Agent",
    text: "Recommend keeping current endpoint cadence to preserve efficacy interpretability.",
    tone: "neutral",
    probabilityDelta: 1,
    completionDeltaDays: 0,
  },
];

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function FaroPredict() {
  const [hypothesis, setHypothesis] = useState("If we reduce the dosage by 10mg, what is the impact on efficacy vs. dropout?");
  const [openInterview, setOpenInterview] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<AgentLogMessage[]>([]);
  const [messageCursor, setMessageCursor] = useState(0);

  const baselineDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 128);
    return date;
  }, []);

  const successProbability = useMemo(() => {
    const base = 72;
    const adjusted = logs.reduce((sum, log) => sum + log.probabilityDelta, base);
    return Math.max(15, Math.min(98, Number(adjusted.toFixed(1))));
  }, [logs]);

  const projectedCompletionDate = useMemo(() => {
    const deltaDays = logs.reduce((sum, log) => sum + log.completionDeltaDays, 0);
    const projected = new Date(baselineDate);
    projected.setDate(projected.getDate() + deltaDays);
    return formatDate(projected);
  }, [baselineDate, logs]);

  useEffect(() => {
    if (!running) return;
    if (messageCursor >= SWARM_MESSAGES.length) {
      setRunning(false);
      return;
    }

    const timer = window.setInterval(() => {
      setLogs((prev) => {
        if (messageCursor >= SWARM_MESSAGES.length) return prev;
        return [...prev, SWARM_MESSAGES[messageCursor]];
      });
      setMessageCursor((prev) => prev + 1);
    }, 1100);

    return () => window.clearInterval(timer);
  }, [running, messageCursor]);

  const openInterviewFlow = () => {
    if (!hypothesis.trim()) return;
    setOpenInterview(true);
  };

  const startSimulation = () => {
    setOpenInterview(false);
    setLogs([
      {
        id: "intro",
        agent: "System",
        tone: "neutral",
        text: `Scenario accepted. Priority=${answers.priorityMode}, site burden=${answers.siteBurden}, dropout risk=${answers.patientRisk}, regulatory tolerance=${answers.regulatoryTolerance}. Initializing swarm...`,
        probabilityDelta: 0,
        completionDeltaDays: 0,
      },
    ]);
    setMessageCursor(0);
    setRunning(true);
  };

  const onAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const canRun = CONTEXT_QUESTIONS.every((question) => Boolean(answers[question.id]));
  const analysisStarted = logs.length > 0 || running;
  const latestSignal = logs.length ? logs[logs.length - 1] : null;

  const connectionNarrative = useMemo(() => {
    if (!hypothesis.trim()) {
      return "Enter a hypothesis first. Faro Predict will use it to shape the swarm simulation and then project graph-level impacts on patients, sites, and intervention nodes.";
    }

    if (!analysisStarted) {
      return `Hypothesis captured: "${hypothesis}". Once you run analysis, the live swarm agents will stress-test this assumption and the Knowledge Graph Explorer will visualize relationship-level impact in near real time.`;
    }

    if (running) {
      return `Simulation in progress. Your hypothesis is being tested by agent narratives in the Live Swarm View. Each new signal updates projected outcomes and highlights affected nodes in the Knowledge Graph. Latest signal: ${latestSignal ? `[${latestSignal.agent}] ${latestSignal.text}` : "No agent signal yet."}`;
    }

    return `Analysis complete. The hypothesis generated a full swarm trace and graph projection. Use the Live Swarm log to understand why the outcome moved, then inspect the Knowledge Graph to see where impact concentrated across patients, sites, and intervention pathways.`;
  }, [analysisStarted, hypothesis, latestSignal, running]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Faro Predict: Trial Sandbox</h2>
          <p className="mt-1 text-sm text-slate-600">Swarm-intelligence simulation for trial hypothesis testing.</p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
          <motion.span
            className="h-2.5 w-2.5 rounded-full bg-emerald-500"
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          />
          Model Status: Ready
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label className="mb-2 block text-sm font-semibold text-slate-800">Enter Hypothesis</label>
        <textarea
          value={hypothesis}
          onChange={(e) => setHypothesis(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500"
          placeholder="What if we change [Variable]?"
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-500">The model asks contextual pre-check questions before simulation.</p>
          <button
            onClick={openInterviewFlow}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Sparkles size={14} />
            Run Analysis
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_320px]">
        <FaroPredictSimulationLog logs={logs} running={running} />
        <FaroPredictResultPanel
          successProbability={successProbability}
          projectedCompletionDate={projectedCompletionDate}
          running={running}
        />
      </div>

      <KnowledgeGraphExplorer
        hypothesis={hypothesis}
        logs={logs}
        running={running}
        analysisStarted={analysisStarted}
        successProbability={successProbability}
        projectedCompletionDate={projectedCompletionDate}
      />

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Faro AI Connector</p>
        <p className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-700">
          {connectionNarrative}
        </p>
      </div>

      <FaroPredictContextModal
        open={openInterview}
        questions={CONTEXT_QUESTIONS}
        answers={answers}
        onAnswerChange={onAnswerChange}
        onClose={() => setOpenInterview(false)}
        onConfirm={startSimulation}
      />

      {!canRun && openInterview && (
        <p className="mt-3 text-xs text-amber-700">All context questions are required before simulation can start.</p>
      )}
    </div>
  );
}
