import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import EDCSuiteContainer from "./components/EDCSuiteContainer";

function AppWrapper() {
  const [showEDC, setShowEDC] = useState(false);

  if (showEDC) {
    return (
      <div style={{ width: "100%", minHeight: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "15px 20px", backgroundColor: "#1f2937", borderBottom: "3px solid #3b82f6", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <button onClick={() => setShowEDC(false)} style={{ padding: "10px 20px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>
            ← Back to Main App
          </button>
          <h1 style={{ color: "#10b981", fontSize: "24px", margin: "0", flex: 1, textAlign: "center" }}>
            🏥 ClearTrial EDC System - 8 Modules
          </h1>
          <div style={{ width: "120px" }}></div>
        </div>
        <div style={{ flex: 1, overflow: "auto", backgroundColor: "#f3f4f6" }}>
          <EDCSuiteContainer />
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh" }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7), 0 6px 12px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0), 0 6px 12px rgba(0,0,0,0.3); }
        }
        .edc-launch-button { animation: pulse 2.5s infinite; }
        .edc-launch-button:hover { animation: none; }
      `}</style>
      <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999 }}>
        <button
          className="edc-launch-button"
          onClick={() => setShowEDC(true)}
          style={{ padding: "14px 28px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px", fontWeight: "bold", boxShadow: "0 6px 12px rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#059669"; e.currentTarget.style.transform = "scale(1.05)"; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#10b981"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          🚀 EDC System (8 Modules)
        </button>
      </div>
      <App />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);