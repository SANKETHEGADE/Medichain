import { useEffect, useState } from "react"
import axios from "axios"
import { API } from "../App"
import type { Page } from "../App"

type Props = { setPage: (p: Page) => void }

const modules = [
  { id: "eye",       label: "Eye Analysis",      desc: "Detect jaundice, anemia and cataract from retinal fundus images",    acc: "68%", tag: "Vision AI",      emoji: "👁" },
  { id: "skin",      label: "Skin Analysis",      desc: "Identify melanoma, skin cancer and 5 other dermatological conditions", acc: "79%", tag: "Dermatology",    emoji: "🔬" },
  { id: "blood",     label: "Blood Analysis",     desc: "Assess blood transfusion suitability from RFMT donor parameters",   acc: "93%", tag: "Classification", emoji: "🩸" },
  { id: "register",  label: "Register Patient",   desc: "Add patient to blockchain and generate emergency QR code",           acc: null,  tag: "Blockchain",     emoji: "🔐" },
  { id: "emergency", label: "Emergency Lookup",   desc: "Scan QR or enter ID to retrieve instant verified medical history",  acc: null,  tag: "Critical",       emoji: "🚨" },
] as const

export default function Dashboard({ setPage }: Props) {
  const [status, setStatus] = useState<any>(null)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    axios.get(`${API}/blockchain/status`).then(r => setStatus(r.data)).catch(() => {})
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="page">

      
      <div style={{ marginBottom: "72px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ maxWidth: "520px" }}>
            <p className="label" style={{ marginBottom: "16px" }}>
              Healthcare Intelligence Platform
            </p>
            <h1 style={{
              fontSize: "44px", fontWeight: 800, letterSpacing: "-1.5px",
              lineHeight: 1.08, color: "#fff", marginBottom: "16px"
            }}>
              AI that detects.<br />
              <span style={{ color: "#3A3A3A" }}>Blockchain that protects.</span>
            </h1>
            <p style={{ fontSize: "14px", color: "#555", lineHeight: 1.7, maxWidth: "420px" }}>
              Multi-modal disease detection from medical images combined with
              immutable blockchain patient records and QR-based emergency access.
            </p>
          </div>

          <div style={{ textAlign: "right", paddingTop: "4px" }}>
            <div style={{
              fontSize: "32px", fontWeight: 200, color: "#fff",
              fontVariantNumeric: "tabular-nums", letterSpacing: "-1px"
            }}>
              {time.toLocaleTimeString("en-US", { hour12: false })}
            </div>
            <div style={{ fontSize: "12px", color: "#333", marginTop: "6px" }}>
              {time.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              marginTop: "10px", padding: "4px 10px",
              background: "#111", border: "1px solid #1f1f1f",
              borderRadius: "20px"
            }}>
              <div style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: "#4ADE80", boxShadow: "0 0 6px #4ADE80"
              }} />
              <span style={{ fontSize: "11px", color: "#444" }}>All systems live</span>
            </div>
          </div>
        </div>
      </div>

     
      <div style={{ marginBottom: "52px" }}>
        <p className="label" style={{ marginBottom: "16px" }}>System Status</p>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1px", background: "#1a1a1a",
          borderRadius: "12px", overflow: "hidden"
        }}>
          {[
            {
              label: "Blockchain",
              value: status?.is_valid ? "Verified" : "—",
              sub: `${status?.total_blocks ?? "—"} blocks in chain`,
              dot: "#4ADE80"
            },
            {
              label: "Patients",
              value: status?.total_patients ?? "—",
              sub: "Registered records",
              dot: null
            },
            {
              label: "AI Models",
              value: "3 Active",
              sub: "Eye · Skin · Blood",
              dot: "#4ADE80"
            },
          ].map((s, i) => (
            <div key={i} style={{ background: "#0A0A0A", padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <span className="label">{s.label}</span>
                {s.dot && (
                  <div style={{
                    width: "5px", height: "5px", borderRadius: "50%",
                    background: s.dot, boxShadow: `0 0 5px ${s.dot}`
                  }} />
                )}
              </div>
              <div style={{
                fontSize: "26px", fontWeight: 700, color: "#fff",
                letterSpacing: "-0.5px", marginBottom: "4px"
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: "12px", color: "#333" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      
      <div>
        <p className="label" style={{ marginBottom: "16px" }}>Modules</p>
        <div style={{
          background: "#111", border: "1px solid #1a1a1a",
          borderRadius: "12px", overflow: "hidden"
        }}>
          {modules.map(({ id, label, desc, acc, tag, emoji }, i) => (
            <div key={id}>
              {i > 0 && <div style={{ height: "1px", background: "#161616" }} />}
              <div
                onClick={() => setPage(id as Page)}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px", cursor: "pointer",
                  transition: "background 0.12s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#141414"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <span style={{
                    fontSize: "12px", color: "#2a2a2a",
                    fontVariantNumeric: "tabular-nums",
                    minWidth: "20px", fontWeight: 500
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "9px",
                    background: "#0f0f0f", border: "1px solid #1f1f1f",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px", flexShrink: 0
                  }}>
                    {emoji}
                  </div>
                  <div>
                    <div style={{
                      fontSize: "14px", fontWeight: 600,
                      color: "#fff", marginBottom: "3px"
                    }}>
                      {label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#444" }}>{desc}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                  {acc && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#4ADE80" }}>{acc}</div>
                      <div style={{ fontSize: "10px", color: "#2a2a2a", marginTop: "1px" }}>accuracy</div>
                    </div>
                  )}
                  <span className="tag">{tag}</span>
                  <span style={{ color: "#2a2a2a", fontSize: "18px", fontWeight: 300 }}>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      
      <div style={{ marginTop: "56px", paddingTop: "24px", borderTop: "1px solid #161616" }}>
        <p style={{ fontSize: "11px", color: "#2a2a2a", letterSpacing: "0.3px" }}>
          MediChain AI · EfficientNet-B0 · Gradient Boosting · SHA-256 Blockchain · QR Emergency Access
        </p>
      </div>
    </div>
  )
}
