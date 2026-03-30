import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, ToggleLeft, ToggleRight, X } from "lucide-react";
import simulationData from "./faro-simulation-data.json";
import type { AgentLogMessage } from "./FaroPredict.types";

type GraphNode = {
  id: string;
  type: "Patient" | "ClinicalSite" | "Intervention";
  label: string;
  persona?: string;
  risk_level?: string;
};

type GraphEdge = {
  source: string;
  target: string;
  relation: string;
  strength?: number;
};

type PatientNarrative = {
  id: string;
  role: string;
  name: string;
  narrative: string;
  current_sentiment: string;
  memory_log: string[];
};

const canvas = { width: 880, height: 360 };

type KnowledgeGraphExplorerProps = {
  hypothesis: string;
  logs: AgentLogMessage[];
  running: boolean;
  analysisStarted: boolean;
  successProbability: number;
  projectedCompletionDate: string;
};

export default function KnowledgeGraphExplorer({
  hypothesis,
  logs,
  running,
  analysisStarted,
  successProbability,
  projectedCompletionDate,
}: KnowledgeGraphExplorerProps) {
  const [dosageShift, setDosageShift] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const dosageHintFromHypothesis = useMemo(() => {
    const normalized = hypothesis.toLowerCase();
    return (
      normalized.includes("dosage") ||
      normalized.includes("dose") ||
      normalized.includes("10mg") ||
      normalized.includes("reduce")
    );
  }, [hypothesis]);

  useEffect(() => {
    if (analysisStarted && dosageHintFromHypothesis) {
      setDosageShift(true);
    }
  }, [analysisStarted, dosageHintFromHypothesis]);

  const nodes = simulationData.knowledge_graph.nodes as GraphNode[];
  const edges = simulationData.knowledge_graph.edges as GraphEdge[];
  const agents = simulationData.agent_swarm as PatientNarrative[];

  const positionedNodes = useMemo(() => {
    const patients = nodes.filter((node) => node.type === "Patient");
    const sites = nodes.filter((node) => node.type === "ClinicalSite");
    const interventions = nodes.filter((node) => node.type === "Intervention");
    const map = new Map<string, GraphNode & { x: number; y: number }>();

    const patientGap = canvas.height / (patients.length + 1);
    patients.forEach((node, index) => {
      map.set(node.id, { ...node, x: 140, y: patientGap * (index + 1) });
    });

    const siteGap = canvas.height / (sites.length + 1);
    sites.forEach((node, index) => {
      map.set(node.id, { ...node, x: canvas.width / 2, y: siteGap * (index + 1) });
    });

    const interventionGap = canvas.height / (interventions.length + 1);
    interventions.forEach((node, index) => {
      map.set(node.id, { ...node, x: canvas.width - 160, y: interventionGap * (index + 1) });
    });

    return map;
  }, [nodes]);

  const localSuccessProbability = dosageShift
    ? Math.round(simulationData.hypothetical_projections.simulated_shift.projected_success * 100)
    : Math.round(simulationData.hypothetical_projections.baseline.success_rate * 100);

  const localProjectedCompletion = dosageShift
    ? simulationData.hypothetical_projections.simulated_shift.projected_completion
    : simulationData.hypothetical_projections.baseline.est_completion;

  const effectiveSuccessProbability = analysisStarted ? Math.round(successProbability) : localSuccessProbability;
  const effectiveProjectedCompletion = analysisStarted ? projectedCompletionDate : localProjectedCompletion;

  const latestSignal = logs[logs.length - 1];

  const activeNodeIds = useMemo(() => {
    if (!latestSignal) return new Set<string>();
    const ids = new Set<string>();

    if (latestSignal.agent.toLowerCase().includes("patient")) {
      nodes.filter((node) => node.type === "Patient").forEach((node) => ids.add(node.id));
    }
    if (latestSignal.agent.toLowerCase().includes("cra") || latestSignal.agent.toLowerCase().includes("site")) {
      nodes.filter((node) => node.type === "ClinicalSite").forEach((node) => ids.add(node.id));
    }
    if (latestSignal.agent.toLowerCase().includes("regulator") || latestSignal.agent.toLowerCase().includes("protocol")) {
      nodes.filter((node) => node.type === "Intervention").forEach((node) => ids.add(node.id));
    }

    return ids;
  }, [latestSignal, nodes]);

  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    const node = positionedNodes.get(selectedPatientId);
    if (!node || node.type !== "Patient") return null;

    const story = agents.find((agent) => agent.name === node.label);
    return { node, story };
  }, [agents, positionedNodes, selectedPatientId]);

  const getNodeColor = (nodeType: GraphNode["type"]) => {
    if (nodeType === "Patient") {
      return dosageShift ? "#16A34A" : "#2563EB";
    }
    if (nodeType === "ClinicalSite") return "#7C3AED";
    return "#0F766E";
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Knowledge Graph Explorer</h3>
          <p className="text-sm text-slate-600">
            Patient-Site-Drug relationships for Trial {simulationData.simulation_metadata.trial_id}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Success Probability</p>
            <p className="text-xl font-bold text-blue-900">{effectiveSuccessProbability}%</p>
          </div>

          <button
            onClick={() => setDosageShift((prev) => !prev)}
            disabled={!analysisStarted}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              dosageShift
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700"
            } ${!analysisStarted ? "cursor-not-allowed opacity-60" : ""}`}
          >
            {dosageShift ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            Dosage Shift
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <svg viewBox={`0 0 ${canvas.width} ${canvas.height}`} className="h-[360px] w-full">
            {edges.map((edge) => {
              const source = positionedNodes.get(edge.source);
              const target = positionedNodes.get(edge.target);
              if (!source || !target) return null;

              return (
                <g key={`${edge.source}-${edge.target}-${edge.relation}`}>
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#94A3B8"
                    strokeWidth={edge.strength ? 1 + edge.strength * 2 : 2}
                    strokeOpacity={0.85}
                  />
                  <text
                    x={(source.x + target.x) / 2}
                    y={(source.y + target.y) / 2 - 8}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px]"
                  >
                    {edge.relation}
                  </text>
                </g>
              );
            })}

            {Array.from(positionedNodes.values()).map((node) => {
              const isPatient = node.type === "Patient";
              const active = selectedPatientId === node.id;
              const signalActive = activeNodeIds.has(node.id);

              return (
                <g key={node.id}>
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={active ? 30 : 26}
                    fill={getNodeColor(node.type)}
                    stroke={active ? "#0F172A" : signalActive ? "#1E293B" : "#E2E8F0"}
                    strokeWidth={active ? 3 : signalActive ? 2.5 : 2}
                    className={isPatient ? "cursor-pointer" : ""}
                    onClick={() => {
                      if (isPatient) setSelectedPatientId(node.id);
                    }}
                    whileHover={isPatient ? { scale: 1.05 } : undefined}
                    animate={{
                      opacity: dosageShift && isPatient ? [1, 0.7, 1] : 1,
                      scale: signalActive ? [1, 1.06, 1] : 1,
                    }}
                    transition={{
                      duration: 1.4,
                      repeat: dosageShift && isPatient ? Infinity : signalActive ? Infinity : 0,
                    }}
                  />
                  <text x={node.x} y={node.y + 4} textAnchor="middle" className="fill-white text-[10px] font-semibold">
                    {node.type === "Patient" ? node.id : node.label.split(" ")[0]}
                  </text>
                  <text x={node.x} y={node.y + 48} textAnchor="middle" className="fill-slate-700 text-[11px] font-medium">
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Projection Summary</p>
            <p className="mt-1 text-sm text-slate-700">Projected Completion: {effectiveProjectedCompletion}</p>
            <p className="mt-1 text-sm text-slate-600">
              {dosageShift
                ? simulationData.hypothetical_projections.simulated_shift.reasoning
                : "Baseline projection using current dosage and burden assumptions."}
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Live Linkage</p>
            <p className="mt-1">Hypothesis: {hypothesis || "-"}</p>
            <p className="mt-1">Simulation Status: {running ? "Running" : analysisStarted ? "Complete" : "Awaiting run"}</p>
            <p className="mt-1">Latest Swarm Signal: {latestSignal ? `[${latestSignal.agent}] ${latestSignal.text}` : "No swarm signal yet."}</p>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Legend</p>
            <p className="mt-1">Blue/Green: Patients, Purple: Clinical Sites, Teal: Intervention</p>
            <p className="mt-1">Active Agents: {simulationData.simulation_metadata.active_agents_count}</p>
            <p className="mt-1">Therapeutic Area: {simulationData.simulation_metadata.therapeutic_area}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedPatient && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/20"
              onClick={() => setSelectedPatientId(null)}
            />

            <motion.aside
              initial={{ x: 420, opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0.6 }}
              transition={{ type: "spring", stiffness: 230, damping: 24 }}
              className="fixed right-0 top-0 z-50 h-screen w-[min(420px,95vw)] border-l border-slate-200 bg-white p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Narrative Sidebar</p>
                  <h4 className="mt-1 text-xl font-semibold text-slate-900">{selectedPatient.node.label}</h4>
                  <p className="mt-1 text-sm text-slate-600">{selectedPatient.node.persona}</p>
                </div>
                <button
                  onClick={() => setSelectedPatientId(null)}
                  className="rounded-lg border border-slate-300 p-1.5 text-slate-600 transition hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Narrative Story</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedPatient.story?.narrative ?? "No narrative has been indexed yet for this patient node."}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <BrainCircuit size={14} className="text-blue-700" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Memory Log</p>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {(selectedPatient.story?.memory_log ?? []).map((memory) => (
                      <li key={memory} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                        {memory}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
