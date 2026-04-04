import { useState, useMemo } from "react";
import { CheckCircle2, Info, Plus, Trash2, Sparkles, ArrowLeft, ClipboardList, Target } from "lucide-react";
import { CrfRow, EditRule } from "../types";

export function EditChecksView({
  crfs,
  rules,
  approvedCount,
  rejectedCount,
  decisionsDone,
  onUpdateRule,
  onAddRule,
  onAiAlignAll,
  onBack,
  onFinalize,
}: {
  crfs: CrfRow[];
  rules: EditRule[];
  approvedCount: number;
  rejectedCount: number;
  decisionsDone: number;
  onUpdateRule: (id: string, decision: EditRule["decision"]) => void;
  onAddRule: (rule: Omit<EditRule, "id" | "decision" | "confidence"> & { confidence?: number }) => void;
  onAiAlignAll: () => void;
  onBack: () => void;
  onFinalize: () => void;
}) {
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newKind, setNewKind] = useState<EditRule["kind"]>("edit-check");
  const [ruleCrfLabel, setRuleCrfLabel] = useState("");
  const [editField, setEditField] = useState("");
  const [editLogic, setEditLogic] = useState("is required");
  const [formula, setFormula] = useState("@");
  const [plainRequirement, setPlainRequirement] = useState("");
  const [aiDraft, setAiDraft] = useState("");
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);

  const [sourceCrfLabel, setSourceCrfLabel] = useState("");
  const [sourceField, setSourceField] = useState("");
  const [operator, setOperator] = useState("compare with");
  const [targetCrfLabel, setTargetCrfLabel] = useState("");
  const [targetField, setTargetField] = useState("");
  const [outputCrfLabel, setOutputCrfLabel] = useState("");
  const [outputField, setOutputField] = useState("Derived Result");
  const [extraComparisons, setExtraComparisons] = useState<Array<{ crfLabel: string; field: string; operator: string }>>([]);

  const crfGroups = useMemo(() => {
    const map = new Map<string, { id: string; label: string; fields: string[]; fieldTypes: string[] }>();
    crfs.forEach((row) => {
      const found = map.get(row.label);
      if (!found) {
        map.set(row.label, { id: row.id, label: row.label, fields: [row.fieldLabel], fieldTypes: [row.fieldType] });
        return;
      }
      if (!found.fields.includes(row.fieldLabel)) {
        found.fields.push(row.fieldLabel);
      }
      if (!found.fieldTypes.includes(row.fieldType)) {
        found.fieldTypes.push(row.fieldType);
      }
    });
    return Array.from(map.values());
  }, [crfs]);

  const getFieldsForCrf = (crfLabel: string) => {
    return crfGroups.find((item) => item.label === crfLabel)?.fields ?? [];
  };

  const toggleRuleSelection = (ruleId: string, checked: boolean) => {
    setSelectedRuleIds((prev) => {
      if (checked) {
        return prev.includes(ruleId) ? prev : [...prev, ruleId];
      }
      return prev.filter((id) => id !== ruleId);
    });
  };

  const selectAllRules = () => {
    setSelectedRuleIds(rules.map((rule) => rule.id));
  };

  const clearRuleSelection = () => setSelectedRuleIds([]);

  const bulkApproveSelected = () => {
    selectedRuleIds.forEach((id) => onUpdateRule(id, "approved"));
    setSelectedRuleIds([]);
  };

  const getAnotherCrf = (exclude: string) => crfGroups.find((item) => item.label !== exclude)?.label ?? exclude;

  const detectMentionedFields = (text: string) => {
    const mentions = Array.from(text.matchAll(/@([A-Za-z0-9\s_-]+)/g)).map((match) => match[1].trim());
    return mentions.filter(Boolean);
  };

  const draftFromPlainLanguage = (group: { label: string; fields: string[] }) => {
    const req = plainRequirement.trim();
    if (!req) return;

    const lower = req.toLowerCase();
    const mentioned = detectMentionedFields(req);

    if (mentioned.length >= 2 || lower.includes("across") || lower.includes("between forms")) {
      setNewKind("custom-function");
      setSourceCrfLabel(group.label);
      setTargetCrfLabel(getAnotherCrf(group.label));
      setSourceField(mentioned[0] ?? group.fields[0] ?? "");
      setTargetField(mentioned[1] ?? group.fields[1] ?? group.fields[0] ?? "");
      const draftFormula = `@${mentioned[0] ?? group.fields[0] ?? "FieldA"} - @${mentioned[1] ?? group.fields[1] ?? "FieldB"}`;
      setFormula(draftFormula);
      setAiDraft(`Drafted Custom Function: ${draftFormula} based on requirement: "${req}"`);
      return;
    }

    setNewKind("edit-check");
    const field = mentioned[0] ?? group.fields[0] ?? "";
    setEditField(field);

    if (lower.includes("future")) {
      setEditLogic("cannot be in the future");
    } else if (lower.includes("required") || lower.includes("mandatory")) {
      setEditLogic("is required");
    } else if (lower.includes("range") || lower.includes("between")) {
      setEditLogic("must be in protocol range");
    } else if (lower.includes("code") || lower.includes("list") || lower.includes("ethnicity") || lower.includes("gender")) {
      setEditLogic("must match codelist");
    }

    setAiDraft(`Drafted Edit Check: ${group.label} - ${field} ${editLogic || "is required"} based on requirement: "${req}"`);
  };

  const openComposer = (group: { label: string; fields: string[] }) => {
    setAddingFor(group.label);
    setNewKind("edit-check");
    setRuleCrfLabel(group.label);
    setEditField(group.fields[0] ?? "");
    setFormula(`@${group.fields[0] ?? "Field"}`);
    setPlainRequirement("");
    setAiDraft("");
    setSourceCrfLabel(group.label);
    setSourceField(group.fields[0] ?? "");
    const alt = crfGroups.find((item) => item.label !== group.label);
    setTargetCrfLabel(alt?.label ?? group.label);
    setTargetField((alt?.fields?.[0] ?? group.fields[0]) || "");
    setOutputCrfLabel(group.label);
    setExtraComparisons([]);
  };

  const addNewRule = (group: { id: string; label: string; fields: string[] }) => {
    const selectedRuleGroup = crfGroups.find((item) => item.label === ruleCrfLabel) ?? group;
    if (newKind === "edit-check") {
      if (!editField) return;
      onAddRule({
        crfId: selectedRuleGroup.id,
        crfLabel: selectedRuleGroup.label,
        kind: "edit-check",
        scope: "within-form",
        fieldLabel: editField,
        title: aiDraft || `${selectedRuleGroup.label}: ${editField} ${editLogic}`,
        type: "User-Defined Edit Check",
        formula: formula.trim() || undefined,
        plainRequirement: plainRequirement.trim() || undefined,
        aiDrafted: Boolean(aiDraft),
        confidence: 89,
      });
    } else {
      const sourceCrf = crfGroups.find((item) => item.label === sourceCrfLabel) ?? group;
      const targetCrf = crfGroups.find((item) => item.label === targetCrfLabel) ?? group;
      const outputCrf = crfGroups.find((item) => item.label === outputCrfLabel) ?? group;
      if (!sourceField || !targetField || !outputField) return;
      const extraParts = extraComparisons
        .filter((item) => item.crfLabel && item.field)
        .map((item) => `${item.operator} @${item.crfLabel}.${item.field}`)
        .join(" ");
      const computedFormula =
        formula.trim() || `@${sourceCrf.label}.${sourceField} ${operator} @${targetCrf.label}.${targetField}${extraParts ? ` ${extraParts}` : ""}`;
      onAddRule({
        crfId: outputCrf.id,
        crfLabel: outputCrf.label,
        kind: "custom-function",
        scope: "cross-form",
        fieldLabel: outputField,
        title: aiDraft || `Custom Function: ${sourceCrf.label}.${sourceField} ${operator} ${targetCrf.label}.${targetField}${extraParts ? ` ${extraParts}` : ""} -> ${outputField}`,
        type: "Power-Query Style Function",
        formula: computedFormula,
        plainRequirement: plainRequirement.trim() || undefined,
        aiDrafted: Boolean(aiDraft),
        confidence: 85,
      });
    }
    setAddingFor(null);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> Back To FARO
      </button>
      <h2 className="text-3xl font-semibold">AI-Driven Edit Checks & Custom functions</h2>
      <p className="text-slate-600">AI suggests checks by finalized CRF. Add manual edit checks or cross-form custom logic using the + button on each CRF.</p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        Approved: <span className="font-semibold text-emerald-700">{approvedCount}</span> • Rejected: <span className="font-semibold text-red-700">{rejectedCount}</span> • Decisions: {decisionsDone}/{rules.length}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
        <button onClick={onAiAlignAll} className="rounded-md border border-violet-300 bg-violet-50 px-3 py-1.5 font-semibold text-violet-800">
          <span className="inline-flex items-center gap-1"><Sparkles size={14} /> AI Align All</span>
        </button>
        <button onClick={selectAllRules} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700">Select All</button>
        <button onClick={clearRuleSelection} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700">Clear Selection</button>
        <button
          onClick={bulkApproveSelected}
          disabled={selectedRuleIds.length === 0}
          className="rounded-md bg-emerald-600 px-3 py-1.5 font-semibold text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          Approve Selected ({selectedRuleIds.length})
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {crfGroups.map((group) => {
          const crfRules = rules.filter((rule) => rule.crfLabel === group.label);
          const sourceFields = getFieldsForCrf(sourceCrfLabel);
          const targetFields = getFieldsForCrf(targetCrfLabel);
          const ruleScopedFields = getFieldsForCrf(ruleCrfLabel || group.label);

          return (
            <div key={group.label} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{group.label}</p>
                  <p className="text-xs text-slate-500">Fields: {group.fields.join(", ")}</p>
                </div>
                <button
                  onClick={() => openComposer(group)}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800"
                >
                  <Plus size={14} /> Add Check
                </button>
              </div>

              {addingFor === group.label && (
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => setNewKind("edit-check")}
                      className={`rounded-md px-3 py-1 text-xs font-semibold ${newKind === "edit-check" ? "bg-blue-600 text-white" : "bg-white text-blue-700"}`}
                    >
                      Edit Check
                    </button>
                    <button
                      onClick={() => setNewKind("custom-function")}
                      className={`rounded-md px-3 py-1 text-xs font-semibold ${newKind === "custom-function" ? "bg-violet-600 text-white" : "bg-white text-violet-700"}`}
                    >
                      Custom Function
                    </button>
                  </div>

                  {newKind === "edit-check" ? (
                    <div className="space-y-2">
                      <div className="grid gap-2 md:grid-cols-3">
                        <select
                          value={ruleCrfLabel}
                          onChange={(e) => {
                            const nextCrf = e.target.value;
                            const nextFields = getFieldsForCrf(nextCrf);
                            setRuleCrfLabel(nextCrf);
                            setEditField(nextFields[0] ?? "");
                            setFormula(`@${nextFields[0] ?? "Field"}`);
                          }}
                          className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                        >
                          {crfGroups.map((item) => (
                            <option key={item.label} value={item.label}>{item.label}</option>
                          ))}
                        </select>
                        <select value={editField} onChange={(e) => setEditField(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          {ruleScopedFields.map((field) => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                        <select value={editLogic} onChange={(e) => setEditLogic(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          <option>is required</option>
                          <option>cannot be in the future</option>
                          <option>must be in protocol range</option>
                          <option>must match codelist</option>
                          <option>must be unique per subject</option>
                        </select>
                        <button onClick={() => addNewRule(group)} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Add Edit Check</button>
                      </div>
                      <input
                        value={formula}
                        onChange={(e) => setFormula(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                        placeholder="Mathematical formula using @FieldLabel e.g. @Systolic Blood Pressure - @Diastolic Blood Pressure"
                      />
                      <textarea
                        value={plainRequirement}
                        onChange={(e) => setPlainRequirement(e.target.value)}
                        className="h-20 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                        placeholder="Type plain English requirement. Example: If @Gender is Female then Pregnancy Test must be collected."
                      />
                      <button onClick={() => draftFromPlainLanguage(group)} className="rounded-md border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-blue-700">Draft With AI</button>
                      {aiDraft && <p className="rounded-md border border-blue-200 bg-white px-2 py-2 text-xs text-blue-900">{aiDraft}</p>}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cross-form logic builder (Power Query style)</p>
                      <div className="grid gap-2 md:grid-cols-3">
                        <select value={sourceCrfLabel} onChange={(e) => { setSourceCrfLabel(e.target.value); setSourceField(getFieldsForCrf(e.target.value)[0] ?? ""); }} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          {crfGroups.map((item) => (
                            <option key={item.label} value={item.label}>{item.label}</option>
                          ))}
                        </select>
                        <select value={sourceField} onChange={(e) => setSourceField(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          {sourceFields.map((field) => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                        <select value={operator} onChange={(e) => setOperator(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          <option>compare with</option>
                          <option>+</option>
                          <option>-</option>
                          <option>*</option>
                          <option>/</option>
                          <option>difference &gt; threshold</option>
                          <option>ratio check</option>
                          <option>if/then condition</option>
                          <option>concat</option>
                        </select>
                        <select value={targetCrfLabel} onChange={(e) => { setTargetCrfLabel(e.target.value); setTargetField(getFieldsForCrf(e.target.value)[0] ?? ""); }} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          {crfGroups.map((item) => (
                            <option key={item.label} value={item.label}>{item.label}</option>
                          ))}
                        </select>
                        <select value={targetField} onChange={(e) => setTargetField(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          {targetFields.map((field) => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                        <select value={outputCrfLabel} onChange={(e) => setOutputCrfLabel(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm">
                          {crfGroups.map((item) => (
                            <option key={item.label} value={item.label}>{item.label}</option>
                          ))}
                        </select>
                        <input value={outputField} onChange={(e) => setOutputField(e.target.value)} className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm" placeholder="Output / Derived Field" />
                      </div>
                      <div className="rounded-md border border-slate-200 bg-white p-2">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Additional Form Comparisons</p>
                          <button
                            onClick={() =>
                              setExtraComparisons((prev) => [
                                ...prev,
                                {
                                  crfLabel: getAnotherCrf(targetCrfLabel || group.label),
                                  field: getFieldsForCrf(getAnotherCrf(targetCrfLabel || group.label))[0] ?? "",
                                  operator: "+",
                                },
                              ])
                            }
                            className="inline-flex items-center gap-1 rounded border border-violet-300 px-2 py-1 text-xs font-semibold text-violet-700"
                          >
                            <Plus size={12} /> Add Form
                          </button>
                        </div>
                        <div className="space-y-2">
                          {extraComparisons.map((item, index) => {
                            const extraFields = getFieldsForCrf(item.crfLabel);
                            return (
                              <div key={`extra-${index}`} className="grid gap-2 md:grid-cols-4">
                                <select
                                  value={item.operator}
                                  onChange={(e) =>
                                    setExtraComparisons((prev) => prev.map((entry, i) => (i === index ? { ...entry, operator: e.target.value } : entry)))
                                  }
                                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                                >
                                  <option>+</option>
                                  <option>-</option>
                                  <option>*</option>
                                  <option>/</option>
                                  <option>compare with</option>
                                </select>
                                <select
                                  value={item.crfLabel}
                                  onChange={(e) =>
                                    setExtraComparisons((prev) =>
                                      prev.map((entry, i) =>
                                        i === index
                                          ? { ...entry, crfLabel: e.target.value, field: getFieldsForCrf(e.target.value)[0] ?? "" }
                                          : entry,
                                      ),
                                    )
                                  }
                                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                                >
                                  {crfGroups.map((crf) => (
                                    <option key={crf.label} value={crf.label}>{crf.label}</option>
                                  ))}
                                </select>
                                <select
                                  value={item.field}
                                  onChange={(e) =>
                                    setExtraComparisons((prev) => prev.map((entry, i) => (i === index ? { ...entry, field: e.target.value } : entry)))
                                  }
                                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                                >
                                  {extraFields.map((field) => (
                                    <option key={field} value={field}>{field}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => setExtraComparisons((prev) => prev.filter((_, i) => i !== index))}
                                  className="rounded-md border border-red-300 px-2 py-2 text-xs font-semibold text-red-700"
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })}
                          {extraComparisons.length === 0 && <p className="text-xs text-slate-500">Use + Add Form to compare more than 2 forms.</p>}
                        </div>
                      </div>
                      <input
                        value={formula}
                        onChange={(e) => setFormula(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                        placeholder="Formula using @FieldLabel and operators (+,-,*,/)"
                      />
                      <textarea
                        value={plainRequirement}
                        onChange={(e) => setPlainRequirement(e.target.value)}
                        className="h-20 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm"
                        placeholder="Describe cross-form requirement in plain English. AI will draft function logic."
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => draftFromPlainLanguage(group)} className="rounded-md border border-violet-300 bg-white px-3 py-2 text-xs font-semibold text-violet-700">Draft With AI</button>
                        <button onClick={() => addNewRule(group)} className="rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white">Add Custom Function</button>
                      </div>
                      {aiDraft && <p className="rounded-md border border-violet-200 bg-white px-2 py-2 text-xs text-violet-900">{aiDraft}</p>}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 space-y-2">
                {crfRules.map((rule) => (
                  <div key={rule.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <input
                          type="checkbox"
                          checked={selectedRuleIds.includes(rule.id)}
                          onChange={(e) => toggleRuleSelection(rule.id, e.target.checked)}
                        />
                        Select
                      </label>
                      <div>
                        <p className="font-semibold">{rule.title}</p>
                        <p className="text-sm text-slate-600">{rule.type} • {rule.kind === "edit-check" ? "Within Form" : "Cross Form"} • Confidence {rule.confidence}%</p>
                        {rule.formula && <p className="text-xs text-slate-500">Formula: {rule.formula}</p>}
                        {rule.plainRequirement && <p className="text-xs text-slate-500">Requirement: {rule.plainRequirement}</p>}
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">{rule.decision}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => onUpdateRule(rule.id, "approved")} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Approve</button>
                      <button onClick={() => onUpdateRule(rule.id, "rejected")} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Reject</button>
                    </div>
                  </div>
                ))}
                {crfRules.length === 0 && <p className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500">No checks defined yet for this CRF.</p>}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onFinalize}
        disabled={decisionsDone !== rules.length}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        Finalize Edit Checks
      </button>
    </section>
  );
}
