import { useState } from "react";

interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const modules: Module[] = [
  { id: "protocol", name: "Protocol Management", icon: "📋", description: "Create and manage clinical trial protocols", color: "#3b82f6" },
  { id: "subjects", name: "Subject Enrollment", icon: "👥", description: "Enroll and track study subjects", color: "#8b5cf6" },
  { id: "edc", name: "EDC Data Entry", icon: "📝", description: "Electronic data capture forms", color: "#10b981" },
  { id: "queries", name: "Query Management", icon: "❓", description: "Handle data queries and discrepancies", color: "#f59e0b" },
  { id: "analytics", name: "Analytics & Reports", icon: "📊", description: "Generate reports and analytics", color: "#ef4444" },
  { id: "audit", name: "Audit Trail", icon: "🔍", description: "Track all system activities", color: "#6366f1" },
  { id: "labs", name: "Lab Integration", icon: "🔬", description: "Connect with lab systems", color: "#14b8a6" },
  { id: "inventory", name: "Inventory Management", icon: "📦", description: "Manage supplies and inventory", color: "#f97316" },
];

export default function EDCSuiteContainer() {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {!activeModule ? (
        <>
          <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#1f2937", fontSize: "28px" }}>
            🏥 ClearTrial EDC Suite - 8 Modules
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
            {modules.map((module) => (
              <div
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  borderLeft: `4px solid ${module.color}`,
                  transition: "transform 0.2s",
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>{module.icon}</div>
                <h3 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>{module.name}</h3>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>{module.description}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h3 style={{ color: "#6b7280" }}>Module: {activeModule}</h3>
          <button
            onClick={() => setActiveModule(null)}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ← Back to Modules
          </button>
        </div>
      )}
    </div>
  );
}