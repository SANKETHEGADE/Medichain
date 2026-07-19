
import { useState } from "react"
import Dashboard from "./components/Dashboard"
import EyeAnalysis from "./components/EyeAnalysis"
import SkinAnalysis from "./components/SkinAnalysis"
import BloodAnalysis from "./components/BloodAnalysis"
import PatientRegister from "./components/PatientRegister"
import EmergencyLookup from "./components/EmergencyLookup"
import { LayoutDashboard, Eye, Scan, Droplets, UserPlus, Siren } from "lucide-react"

export const API = "http://localhost:8000"
export type Page = "dashboard" | "eye" | "skin" | "blood" | "register" | "emergency"

const nav = [
  { id: "dashboard", label: "Overview",         sub: "System status",      icon: LayoutDashboard, color: "#00DCFF" },
  { id: "eye",       label: "Eye Analysis",      sub: "Fundus imaging AI",  icon: Eye,             color: "#00FFB3" },
  { id: "skin",      label: "Skin Analysis",     sub: "Dermatology AI",     icon: Scan,            color: "#8B5CF6" },
  { id: "blood",     label: "Blood Analysis",    sub: "Transfusion check",  icon: Droplets,        color: "#FF3366" },
  { id: "register",  label: "Register Patient",  sub: "Blockchain record",  icon: UserPlus,        color: "#00DCFF" },
  { id: "emergency", label: "Emergency",         sub: "QR instant lookup",  icon: Siren,           color: "#FFB340" },
] as const

export default function App() {
  const [page, setPage] = useState<Page>("dashboard")

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
      <aside style={{
        width: "230px", position: "fixed", top: 0, left: 0, height: "100vh",
        background: "linear-gradient(160deg, #060C1C 0%, #03070F 100%)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", zIndex: 100,
      }}>

        {/* Logo */}
        <div style={{ padding: "28px 22px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ position: "relative", width: "36px", height: "36px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg, #00DCFF33, #00DCFF11)",
                border: "1px solid #00DCFF44",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 7v5c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V7L12 2z" stroke="#00DCFF" strokeWidth="1.5" fill="none"/>
                  <path d="M8 12l2.5 2.5L16 9" stroke="#00DCFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{
                position: "absolute", bottom: "-2px", right: "-2px",
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#00FFB3",
                boxShadow: "0 0 6px #00FFB3",
                animation: "pulse-ring 2.5s ease-in-out infinite"
              }} />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-d)", color: "var(--text-1)", letterSpacing: "-0.4px" }}>
                MediChain
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-2)", fontFamily: "var(--font-m)", letterSpacing: "1px" }}>
                AI · v1.0
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div style={{
          margin: "0 14px 16px",
          background: "rgba(0,255,179,0.06)",
          border: "1px solid rgba(0,255,179,0.15)",
          borderRadius: "8px", padding: "8px 12px",
          display: "flex", alignItems: "center", gap: "8px"
        }}>
          <div style={{
            width: "5px", height: "5px", borderRadius: "50%",
            background: "#00FFB3", boxShadow: "0 0 8px #00FFB3",
            animation: "pulse-ring 2s ease-in-out infinite", flexShrink: 0
          }} />
          <span style={{ fontSize: "11px", color: "#00FFB3", fontFamily: "var(--font-m)", letterSpacing: "0.5px" }}>
            ALL SYSTEMS LIVE
          </span>
        </div>

        {/* Nav */}
        <div style={{ padding: "0 10px", flex: 1 }}>
          <div style={{ fontSize: "9px", fontWeight: 600, color: "var(--text-3)", letterSpacing: "2px", padding: "4px 12px 10px" }}>
            MODULES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {nav.map(({ id, label, sub, icon: Icon, color }) => {
              const active = page === id
              return (
                <button key={id} onClick={() => setPage(id as Page)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 12px", borderRadius: "9px", border: "none", cursor: "pointer",
                    background: active ? `${color}14` : "transparent",
                    borderLeft: active ? `2px solid ${color}` : "2px solid transparent",
                    transition: "all 0.15s", textAlign: "left",
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.03)" } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent" } }}
                >
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "8px",
                    background: active ? `${color}18` : "rgba(255,255,255,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.15s"
                  }}>
                    <Icon size={14} color={active ? color : "var(--text-2)"} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: active ? 600 : 400, color: active ? color : "var(--text-1)", fontFamily: "var(--font-d)", lineHeight: 1.2 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--text-3)", marginTop: "1px" }}>
                      {sub}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: "10px", color: "var(--text-3)", lineHeight: 1.6 }}>
            EfficientNet-B0 · GB Classifier<br />
            Blockchain · QR Emergency
          </div>
        </div>
      </aside>

      {/* ══ MAIN ═════════════════════════════════════════════════ */}
      <main style={{ marginLeft: "230px", flex: 1, minHeight: "100vh" }}>
        {page === "dashboard" && <Dashboard setPage={setPage} />}
        {page === "eye"       && <EyeAnalysis />}
        {page === "skin"      && <SkinAnalysis />}
        {page === "blood"     && <BloodAnalysis />}
        {page === "register"  && <PatientRegister />}
        {page === "emergency" && <EmergencyLookup />}
      </main>
    </div>
  )
}
