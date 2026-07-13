
import { useEffect, useState } from "react"
import axios from "axios"
import { API, Page } from "../App"
import { Eye, Layers, Droplets, UserPlus, AlertTriangle, Shield } from "lucide-react"

type Props = { setPage: (p: Page) => void }

export default function Dashboard({ setPage }: Props) {
  const [status, setStatus] = useState<any>(null)

  useEffect(() => {
    axios.get(`${API}/blockchain/status`).then(r => setStatus(r.data)).catch(() => {})
  }, [])

  const cards = [
    { label: "Eye Disease Detection", desc: "Detect jaundice, anemia, cataract from eye images", icon: Eye, color: "#06b6d4", page: "eye" as Page },
    { label: "Skin Disease Analysis", desc: "Identify melanoma, skin cancer, disorders", icon: Layers, color: "#a855f7", page: "skin" as Page },
    { label: "Blood Analysis", desc: "Assess transfusion suitability from parameters", icon: Droplets, color: "#ef4444", page: "blood" as Page },
    { label: "Register Patient", desc: "Add patient to blockchain with QR code", icon: UserPlus, color: "#22c55e", page: "register" as Page },
    { label: "Emergency Lookup", desc: "Scan QR or enter ID to get instant history", icon: AlertTriangle, color: "#f59e0b", page: "emergency" as Page },
  ]

  return (
    <div>
      <h1 style={{ fontSize: "26px", fontWeight: 800, marginBottom: "6px", color: "#e2e2e2" }}>
        MediChain AI Dashboard
      </h1>
      <p style={{ color: "#444", marginBottom: "32px", fontSize: "14px" }}>
        AI-powered healthcare intelligence with blockchain security
      </p>

      {status && (
        <div style={{
          display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap"
        }}>
          {[
            { label: "Blockchain Blocks", value: status.total_blocks, color: "#06b6d4" },
            { label: "Registered Patients", value: status.total_patients, color: "#a855f7" },
            { label: "Chain Valid", value: status.is_valid ? "✅ Yes" : "❌ No", color: "#22c55e" },
          ].map(s => (
            <div key={s.label} style={{
              background: "#0d0d18", border: `1px solid ${s.color}33`,
              borderRadius: "12px", padding: "16px 24px", minWidth: "160px"
            }}>
              <div style={{ fontSize: "24px", fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#444", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
        {cards.map(c => (
          <div key={c.label} onClick={() => setPage(c.page)}
            style={{
              background: "#0d0d18", border: `1px solid #1a1a2e`,
              borderRadius: "16px", padding: "24px", cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = c.color
              e.currentTarget.style.transform = "translateY(-2px)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#1a1a2e"
              e.currentTarget.style.transform = "translateY(0)"
            }}>
            <div style={{
              width: "44px", height: "44px", borderRadius: "12px",
              background: `${c.color}22`, display: "flex",
              alignItems: "center", justifyContent: "center",
              marginBottom: "16px"
            }}>
              <c.icon size={22} color={c.color} />
            </div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#e2e2e2", marginBottom: "6px" }}>
              {c.label}
            </div>
            <div style={{ fontSize: "13px", color: "#444", lineHeight: 1.5 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
