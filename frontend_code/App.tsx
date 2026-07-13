
import { useState } from "react"
import Dashboard from "./components/Dashboard"
import EyeAnalysis from "./components/EyeAnalysis"
import SkinAnalysis from "./components/SkinAnalysis"
import BloodAnalysis from "./components/BloodAnalysis"
import PatientRegister from "./components/PatientRegister"
import EmergencyLookup from "./components/EmergencyLookup"
import { Activity, Eye, Layers, Droplets, UserPlus, AlertTriangle } from "lucide-react"

export const API = "http://localhost:8000"

export type Page = "dashboard" | "eye" | "skin" | "blood" | "register" | "emergency"

export default function App() {
  const [page, setPage] = useState<Page>("dashboard")

  const navItems = [
    { id: "dashboard", label: "Dashboard",      icon: Activity },
    { id: "eye",       label: "Eye Analysis",   icon: Eye },
    { id: "skin",      label: "Skin Analysis",  icon: Layers },
    { id: "blood",     label: "Blood Analysis", icon: Droplets },
    { id: "register",  label: "Register Patient", icon: UserPlus },
    { id: "emergency", label: "Emergency Lookup", icon: AlertTriangle },
  ] as const

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#080810" }}>
      <aside style={{
        width: "240px", background: "#0d0d18",
        borderRight: "1px solid #1a1a2e",
        display: "flex", flexDirection: "column",
        padding: "24px 16px", position: "fixed",
        top: 0, left: 0, height: "100vh"
      }}>
        <div style={{ marginBottom: "36px", paddingLeft: "8px" }}>
          <div style={{ fontSize: "20px", fontWeight: 800,
            background: "linear-gradient(135deg, #06b6d4, #a855f7)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            🏥 MediChain AI
          </div>
          <div style={{ fontSize: "11px", color: "#333", marginTop: "4px" }}>
            Blockchain Healthcare Intelligence
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setPage(id as Page)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "11px 14px", borderRadius: "10px", border: "none",
                cursor: "pointer", fontSize: "13px", fontWeight: 500,
                background: page === id ? "rgba(168,85,247,0.15)" : "transparent",
                color: page === id ? "#a855f7" : "#555",
                transition: "all 0.2s", textAlign: "left", width: "100%"
              }}>
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: "auto", fontSize: "10px", color: "#222", paddingLeft: "8px" }}>
          Powered by Gemini AI + Blockchain
        </div>
      </aside>

      <main style={{ marginLeft: "240px", flex: 1, padding: "32px" }}>
        {page === "dashboard"  && <Dashboard setPage={setPage} />}
        {page === "eye"        && <EyeAnalysis />}
        {page === "skin"       && <SkinAnalysis />}
        {page === "blood"      && <BloodAnalysis />}
        {page === "register"   && <PatientRegister />}
        {page === "emergency"  && <EmergencyLookup />}
      </main>
    </div>
  )
}
