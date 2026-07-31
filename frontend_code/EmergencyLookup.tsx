
import { useState } from "react"
import axios from "axios"
import { API } from "../App"
import { Loader2, Search, Camera, Phone } from "lucide-react"
import QRScanner from "./QRScanner.tsx"

export default function EmergencyLookup() {
  const [patientId, setPatientId] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showScanner, setShowScanner] = useState(false)

  const lookup = async (id?: string) => {
    const searchId = id || patientId
    if (!searchId.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await axios.get(`${API}/patient/${searchId.trim()}`)
      setResult(res.data)
    } catch {
      setError("Patient not found in blockchain")
    } finally { setLoading(false) }
  }

  const handleQRResult = (data: any) => {
    setShowScanner(false)
    setResult(data)
    setPatientId(data.patient_data?.patient_id || "")
  }

  const d = result?.patient_data

  return (
    <div className="page">
      {showScanner && (
        <QRScanner onResult={handleQRResult} onClose={() => setShowScanner(false)} />
      )}

      <p className="label" style={{ marginBottom: "12px" }}>SHA-256 Blockchain · Instant Access · QR Scanner</p>
      <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "8px" }}>
        Emergency Lookup
      </h1>
      <p style={{ color: "#555", marginBottom: "48px", fontSize: "14px", maxWidth: "480px" }}>
        Scan patient QR code or enter ID to retrieve verified medical history instantly
      </p>

      
      <div style={{
        display: "flex", alignItems: "flex-start", gap: "14px",
        padding: "16px 20px", background: "#111",
        border: "1px solid #1f1f1f", borderRadius: "10px",
        marginBottom: "28px", maxWidth: "680px"
      }}>
        <span style={{ fontSize: "18px", flexShrink: 0 }}>🚨</span>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#fff", marginBottom: "3px" }}>
            Emergency Protocol
          </div>
          <div style={{ fontSize: "12px", color: "#444", lineHeight: 1.6 }}>
            Scan the QR code from the patient's ID card or enter their Patient ID manually
            to retrieve their complete medical history from the blockchain instantly.
          </div>
        </div>
      </div>

      
      <div style={{
        display: "flex", gap: "10px",
        marginBottom: "32px", maxWidth: "680px"
      }}>
        <input
          className="input"
          value={patientId}
          onChange={e => setPatientId(e.target.value)}
          onKeyDown={e => e.key === "Enter" && lookup()}
          placeholder="Enter Patient ID (e.g. MC001)"
          style={{ flex: 1, fontSize: "15px", padding: "13px 16px" }}
        />
        <button className="btn btn-outline" onClick={() => setShowScanner(true)}
          style={{ padding: "13px 18px", gap: "8px" }}>
          <Camera size={15} />
          Scan QR
        </button>
        <button className="btn btn-white" onClick={() => lookup()}
          disabled={loading} style={{ padding: "13px 20px" }}>
          {loading
            ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            : <><Search size={14} /> Lookup</>}
        </button>
      </div>

      
      {error && (
        <div style={{
          padding: "12px 16px", background: "#1a0a0a",
          border: "1px solid #2a1a1a", borderRadius: "8px",
          color: "#F87171", fontSize: "13px",
          marginBottom: "20px", maxWidth: "680px"
        }}>
          ❌ {error}
        </div>
      )}

      
      {result && d && (
        <div className="fade-up" style={{ maxWidth: "680px" }}>

          
          <div style={{
            padding: "24px 28px", background: "#111",
            border: "1px solid #1f1f1f", borderRadius: "12px",
            marginBottom: "12px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <div style={{
                fontSize: "26px", fontWeight: 800,
                letterSpacing: "-0.5px", marginBottom: "6px"
              }}>
                {d.name}
              </div>
              <div style={{ fontSize: "12px", color: "#444" }}>
                ID: {d.patient_id} · Block #{result.block_index} · {d.hospital}
              </div>
            </div>
            <span className="tag" style={{
              color: "#F87171", borderColor: "#2a1a1a",
              background: "#1a0a0a", fontSize: "12px", padding: "5px 12px"
            }}>
              🚨 EMERGENCY
            </span>
          </div>

          
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "8px", marginBottom: "8px"
          }}>
            {[
              { label: "Age",              value: `${d.age} years`,                        highlight: false },
              { label: "Blood Group",      value: d.blood_group,                           highlight: true  },
              { label: "Emergency Contact",value: d.emergency_contact,                     highlight: true  },
              { label: "Allergies",        value: d.allergies?.join(", ") || "None",       highlight: false },
              { label: "Chronic Diseases", value: d.chronic_diseases?.join(", ") || "None",highlight: false },
              { label: "Past Surgeries",   value: d.past_surgeries?.join(", ") || "None",  highlight: false },
            ].map(item => (
              <div key={item.label} style={{
                padding: "16px 18px",
                background: item.highlight ? "#161616" : "#111",
                border: `1px solid ${item.highlight ? "#222" : "#1a1a1a"}`,
                borderRadius: "10px"
              }}>
                <div className="label" style={{ marginBottom: "6px" }}>{item.label}</div>
                <div style={{
                  fontSize: item.highlight ? "18px" : "14px",
                  fontWeight: item.highlight ? 700 : 400,
                  color: item.highlight ? "#fff" : "#888"
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>

            
            <div style={{
              padding: "16px 18px",
              background: d.ai_predictions?.transfusion_suitable ? "#0a1a0a" : "#1a0a0a",
              border: `1px solid ${d.ai_predictions?.transfusion_suitable ? "#1a2a1a" : "#2a1a1a"}`,
              borderRadius: "10px"
            }}>
              <div className="label" style={{ marginBottom: "8px" }}>Safe for Transfusion</div>
              <div style={{
                fontSize: "20px", fontWeight: 700,
                color: d.ai_predictions?.transfusion_suitable ? "#4ADE80" : "#F87171"
              }}>
                {d.ai_predictions?.transfusion_suitable ? "✅ YES" : "❌ NO"}
              </div>
            </div>

            
            <div style={{
              padding: "16px 18px", background: "#111",
              border: "1px solid #1a1a1a", borderRadius: "10px"
            }}>
              <div className="label" style={{ marginBottom: "8px" }}>Blockchain Verified</div>
              <div style={{
                fontSize: "11px", color: "#444",
                fontFamily: "monospace", lineHeight: 1.7
              }}>
                {result.block_hash?.slice(0, 24)}...<br />
                <span style={{ color: result.blockchain_valid ? "#4ADE80" : "#F87171" }}>
                  {result.blockchain_valid ? "✓ Chain valid" : "✗ Invalid"}
                </span>
              </div>
            </div>
          </div>

          
          {d.emergency_contact && (
            <a href={`tel:${d.emergency_contact}`} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "10px", padding: "14px", borderRadius: "10px",
              textDecoration: "none", background: "#111",
              border: "1px solid #1f1f1f", color: "#888",
              fontSize: "14px", fontWeight: 500, transition: "all 0.15s"
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#161616"
                e.currentTarget.style.color = "#fff"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#111"
                e.currentTarget.style.color = "#888"
              }}>
              <Phone size={15} />
              Call Emergency Contact: {d.emergency_contact}
            </a>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
