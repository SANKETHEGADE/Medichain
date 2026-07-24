
import { useEffect, useState } from "react"
import axios from "axios"
import { API } from "../App"
import type { Page } from "../App"
import { Eye, Scan, Droplets, UserPlus, Siren, Activity, Shield, Cpu } from "lucide-react"

type Props = { setPage: (p: Page) => void }

const cards = [
  { id: "eye",       title: "Eye Analysis",     desc: "Fundus disease detection",    icon: Eye,      color: "#00FFB3", tag: "68% acc" },
  { id: "skin",      title: "Skin Analysis",     desc: "Dermatology AI classifier",   icon: Scan,     color: "#8B5CF6", tag: "79% acc" },
  { id: "blood",     title: "Blood Analysis",    desc: "Transfusion suitability",     icon: Droplets, color: "#FF3366", tag: "93% acc" },
  { id: "register",  title: "Register Patient",  desc: "Blockchain record + QR code", icon: UserPlus, color: "#00DCFF", tag: "Secure" },
  { id: "emergency", title: "Emergency Lookup",  desc: "QR scan or ID instant access",icon: Siren,    color: "#FFB340", tag: "Critical" },
] as const

function ECGLine() {
  return (
    <svg width="100%" height="60" viewBox="0 0 600 60" preserveAspectRatio="none"
      style={{ position: "absolute", bottom: 0, left: 0, opacity: 0.15 }}>
      <polyline
        points="0,30 60,30 80,30 90,5 100,55 110,30 130,30 150,30 160,30 170,10 180,50 190,30 210,30 600,30"
        fill="none" stroke="#00DCFF" strokeWidth="1.5"
        strokeDasharray="800" strokeDashoffset="800"
        style={{ animation: "ecg-draw 3s ease-in-out infinite" }}
      />
    </svg>
  )
}

export default function Dashboard({ setPage }: Props) {
  const [status, setStatus] = useState<any>(null)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    axios.get(`${API}/blockchain/status`).then(r => setStatus(r.data)).catch(() => {})
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="page grid-bg" style={{ position: "relative" }}>

      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "36px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <Activity size={16} color="#00DCFF" />
            <span style={{ fontSize: "11px", color: "#00DCFF", fontFamily: "var(--font-m)", letterSpacing: "2px" }}>
              MEDICHAIN AI · DASHBOARD
            </span>
          </div>
          <h1 className="section-title" style={{ fontSize: "28px" }}>
            Healthcare Intelligence
          </h1>
          <p className="section-sub" style={{ marginBottom: 0 }}>
            AI-powered disease detection with blockchain-secured patient records
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--font-m)", color: "var(--text-1)" }}>
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-2)", marginTop: "2px" }}>
            {time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </div>
        </div>
      </div>

      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          {
            icon: Shield, label: "Blockchain Status",
            value: status?.is_valid ? "VERIFIED" : "CHECKING",
            sub: `${status?.total_blocks ?? "—"} blocks in chain`,
            color: "#00FFB3",
            live: true
          },
          {
            icon: UserPlus, label: "Registered Patients",
            value: status?.total_patients ?? "—",
            sub: "Active blockchain records",
            color: "#00DCFF",
            live: false
          },
          {
            icon: Cpu, label: "AI Models",
            value: "3 LIVE",
            sub: "Eye · Skin · Blood",
            color: "#8B5CF6",
            live: true
          },
        ].map(({ icon: Icon, label, value, sub, color, live }) => (
          <div key={label} className="glass" style={{
            padding: "22px 24px", position: "relative", overflow: "hidden",
            borderColor: `${color}22`
          }}>
            
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: "80px", height: "80px",
              background: `radial-gradient(circle at top right, ${color}18, transparent)`,
              pointerEvents: "none"
            }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-2)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                  {label}
                </div>
                <div style={{ fontSize: "26px", fontWeight: 700, fontFamily: "var(--font-d)", color, letterSpacing: "-0.5px", marginBottom: "4px" }}>
                  {value}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-3)" }}>{sub}</div>
              </div>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: `${color}12`, border: `1px solid ${color}22`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Icon size={18} color={color} />
              </div>
            </div>
            {live && (
              <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, animation: "pulse-ring 2s ease-in-out infinite" }} />
                <span style={{ fontSize: "10px", color, fontFamily: "var(--font-m)", letterSpacing: "0.5px" }}>LIVE</span>
              </div>
            )}
            <ECGLine />
          </div>
        ))}
      </div>

      
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", color: "var(--text-3)", letterSpacing: "2px", fontFamily: "var(--font-m)", marginBottom: "16px" }}>
          AI MODULES
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
          {cards.map(({ id, title, desc, icon: Icon, color, tag }) => (
            <div key={id}
              onClick={() => setPage(id as Page)}
              className="glass"
              style={{ padding: "20px 22px", cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${color}40`
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.boxShadow = `0 12px 40px ${color}15`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)"
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div style={{
                position: "absolute", top: 0, right: 0, width: "100px", height: "100px",
                background: `radial-gradient(circle at top right, ${color}10, transparent)`,
                pointerEvents: "none"
              }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "11px",
                  background: `${color}15`, border: `1px solid ${color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Icon size={19} color={color} />
                </div>
                <span className="tag" style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}>
                  {tag}
                </span>
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600, fontFamily: "var(--font-d)", color: "var(--text-1)", marginBottom: "4px" }}>
                {title}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-2)" }}>{desc}</div>
              <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", color, fontSize: "11px", fontWeight: 600 }}>
                <span>Open module</span>
                <span style={{ fontSize: "14px" }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
