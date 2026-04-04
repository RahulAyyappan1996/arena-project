import { useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, FileText, Info, Settings, Trash2, UploadCloud } from "lucide-react";
import type { Project, StudyDocument } from "../types";

export function TmfView({
  projects,
  project,
  onSelectProject,
  userEmail,
  docs,
  signedOff,
  onBack,
  onGenerateDocuments,
  onAssignDoc,
  onAssignAllDocs,
  onDigitalSign,
  onSignOff,
  allDocsReadyForGoLive,
}: {
  projects: Project[];
  project: Project | null;
  onSelectProject: (projectId: string) => void;
  userEmail: string;
  docs: StudyDocument[];
  signedOff: boolean;
  onBack: () => void;
  onGenerateDocuments: () => void;
  onAssignDoc: (docId: string) => void;
  onAssignAllDocs: () => void;
  onDigitalSign: (docId: string, mode: "digital" | "uploaded", uploadFileName?: string) => void;
  onSignOff: () => void;
  allDocsReadyForGoLive: boolean;
}) {
  const [activeDocId, setActiveDocId] = useState<string | null>(docs[0]?.id ?? null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const activeDoc = docs.find((doc) => doc.id === activeDocId) ?? docs[0] ?? null;
  const myQueue = docs.filter((doc) => doc.assignedTo.includes(userEmail) && !doc.signedBy.includes(userEmail));

  const printDocument = (doc: StudyDocument) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head><title>${doc.title}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1>${doc.title}</h1>
          <p><strong>Project:</strong> ${project?.title ?? "Study"}</p>
          <p><strong>Version:</strong> ${doc.version}</p>
          <p><strong>Category:</strong> ${doc.category}</p>
          <p><strong>Generated From:</strong> ${doc.generatedFrom}</p>
          <hr/>
          <p>Signature block:</p>
          <p>Signed by: _____________________________</p>
          <p>Date: _________________________________</p>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-semibold">Study TMF Portal</h2>
          <p className="text-slate-600">Central landing page for all study documents, assignments, and signatures.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={project?.id ?? ""}
            onChange={(e) => onSelectProject(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          >
            {projects.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
          <button onClick={onGenerateDocuments} className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
            Generate / Refresh Documents
          </button>
          <button onClick={onAssignAllDocs} disabled={docs.length === 0} className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-800 disabled:opacity-50">
            Assign All To TMF Portal
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold">Document Repository</p>
            <span className="text-xs text-slate-500">{docs.length} documents</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border border-slate-200 px-2 py-2 text-left">Study Name</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">Document</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">Category</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">Version</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">Assignees</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">Status</th>
                  <th className="border border-slate-200 px-2 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td className="border border-slate-200 px-2 py-2">{project?.title ?? "No Study Selected"}</td>
                    <td className="border border-slate-200 px-2 py-2">
                      <p className="font-semibold">{doc.title}</p>
                      <p className="text-xs text-slate-500">{doc.generatedFrom}</p>
                    </td>
                    <td className="border border-slate-200 px-2 py-2">{doc.category}</td>
                    <td className="border border-slate-200 px-2 py-2">{doc.version}</td>
                    <td className="border border-slate-200 px-2 py-2 text-xs">{doc.assignedTo.length > 0 ? doc.assignedTo.join(", ") : "Not Assigned"}</td>
                    <td className="border border-slate-200 px-2 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        doc.status === "signed"
                          ? "bg-emerald-100 text-emerald-800"
                          : doc.status === "partially-signed"
                          ? "bg-blue-100 text-blue-800"
                          : doc.status === "assigned"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="border border-slate-200 px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => setActiveDocId(doc.id)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700">View</button>
                        <button onClick={() => onAssignDoc(doc.id)} className="rounded-md border border-violet-300 bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-800">Assign</button>
                        <button onClick={() => printDocument(doc)} className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700">Print</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {docs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-2 py-8 text-center text-sm text-slate-500">No generated documents yet. Use Generate / Refresh Documents.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold">My Signature Queue</p>
            <p className="text-xs text-slate-500">{userEmail}</p>
            <ul className="mt-2 space-y-2 text-sm">
              {myQueue.map((doc) => (
                <li key={doc.id} className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1">{doc.title}</li>
              ))}
              {myQueue.length === 0 && <li className="text-slate-500">No pending signatures.</li>}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold">Document Preview & Signature</p>
            {activeDoc ? (
              <div className="mt-2 space-y-3">
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                  <p className="font-semibold">{activeDoc.title}</p>
                  <p className="text-xs text-slate-500">{activeDoc.version} • {activeDoc.category}</p>
                  <p className="mt-2 text-xs text-slate-700">Preview: {activeDoc.generatedFrom}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => printDocument(activeDoc)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">Print Preview</button>
                  <button onClick={() => onDigitalSign(activeDoc.id, "digital")} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">Digital Sign</button>
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Upload wet-ink signed copy</p>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setUploadedFileName(e.target.files?.[0]?.name ?? "")}
                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs"
                  />
                  <button
                    onClick={() => onDigitalSign(activeDoc.id, "uploaded", uploadedFileName || "signed-copy.pdf")}
                    className="mt-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Submit Signed Upload
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Select a document to preview and sign.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Go-Live Gate</p>
        <p>Study moves to Live only when all assigned TMF documents are fully signed.</p>
      </div>

      <button
        onClick={onSignOff}
        disabled={!allDocsReadyForGoLive}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {signedOff ? "Sign-off Complete" : "Finalize Document Sign-off & Move To Phase 2"}
      </button>
    </section>
  );
}
