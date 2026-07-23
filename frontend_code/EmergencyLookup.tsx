
import { useState } from "react"
import axios from "axios"
import { API } from "../App"
import { Siren, Loader2, Search, Camera, Shield, Phone, Activity } from "lucide-react"
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
    <div className="page grid-bg">
      {showScanner && (
        <QRScanner onResult={handleQRResult} onClose={() => setShowScanner(false)} />
      )}

      
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <Activity size={14} color="#FFB340" />
        <span style={{ fontSize: "11px", color: "#FFB340", fontFamily: "var(--font-m)", letterSpacing: "2px" }}>
          EMERGENCY ACCESS
        </span>
      </div>
      <h1 className="section-title">Emergency Lookup</h1>
      <p className="section-sub">Scan patient QR code or enter ID to retrieve verified medical history instantly</p>

      
      <div style={{
        display: "flex", alignItems: "center", gap: "14px",
        padding: "14px 20px", borderRadius: "12px", marginBottom: "28px",
        background: "rgba(255,179,64,0.06)",
        border: "1px solid rgba(255,179,64,0.2)", maxWidth: "720px"
      }}>
        <Siren size={18} color="#FFB340" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#FFB340" }}>
            Emergency Protocol Active
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "2px" }}>
            Scan QR from patient ID card or enter Patient ID manually to retrieve full medical record from blockchain
          </div>
        </div>
      </div>

      
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px", maxWidth: "720px" }}>
        <input
          value={patientId}
          onChange={e => setPatientId(e.target.value)}
          onKeyDown={e => e.key === "Enter" && lookup()}
          placeholder="Enter Patient ID (e.g. MC001)"
          className="input-field"
          style={{ flex: 1, fontSize: "15px", padding: "13px 18px" }}
          onFocus={e => e.target.style.borderColor = "#FFB34055"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        <button onClick={() => setShowScanner(true)} className="btn-ghost"
          style={{ border: "1px solid rgba(0,220,255,0.25)", color: "#00DCFF", gap: "8px", padding: "13px 18px" }}>
          <Camera size={16} />
          Scan QR
        </button>
        <button onClick={() => lookup()} disabled={loading}
          className="btn-primary"
          style={{
            background: loading ? undefined : "linear-gradient(135deg, #FFB340, #CC7700)",
            padding: "13px 20px"
          }}>
          {loading
            ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
            : <><Search size={16} /> Lookup</>}
        </button>
      </div>

      
      {error && (
        <div style={{
          padding: "14px 18px", borderRadius: "10px", marginBottom: "20px",
          background: "var(--red-dim)", border: "1px solid rgba(255,51,102,0.2)",
          color: "#FF3366", fontSize: "13px", maxWidth: "720px"
        }}>
           {error}
        </div>
      )}

      
      {result && d && (
        <div className="fade-in" style={{ maxWidth: "720px" }}>

         
          <div className="glass" style={{
            padding: "24px 28px", marginBottom: "16px",
            borderColor: "rgba(255,179,64,0.25)",
            background: "rgba(255,179,64,0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "26px", fontWeight: 700, fontFamily: "var(--font-d)", color: "var(--text-1)", letterSpacing: "-0.5px" }}>
                  {d.name}
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "4px", fontFamily: "var(--font-m)" }}>
                  ID: {d.patient_id} · Block #{result.block_index} · {d.hospital}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="tag" style={{
                  background: "rgba(255,51,102,0.1)",
                  color: "#FF3366", border: "1px solid rgba(255,51,102,0.25)",
                  fontSize: "12px", padding: "6px 14px"
                }}>
                   EMERGENCY
                </span>
              </div>
            </div>
          </div>

         
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            {[
              { label: "Age",               value: `${d.age} years`,                      color: "#00DCFF",  highlight: false },
              { label: "Blood Group",        value: d.blood_group,                         color: "#FF3366",  highlight: true  },
              { label: "Emergency Contact",  value: d.emergency_contact,                   color: "#FFB340",  highlight: true  },
              { label: "Allergies",          value: d.allergies?.join(", ") || "None",     color: "#FF3366",  highlight: false },
              { label: "Chronic Diseases",   value: d.chronic_diseases?.join(", ") || "None", color: "#FFB340", highlight: false },
              { label: "Past Surgeries",     value: d.past_surgeries?.join(", ") || "None",   color: "#00DCFF", highlight: false },
            ].map(item => (
              <div key={item.label} className="glass" style={{
                padding: "16px 18px",
                borderColor: item.highlight ? `${item.color}30` : "var(--border)",
                background: item.highlight ? `${item.color}06` : "rgba(8,14,28,0.9)"
              }}>
                <div style={{ fontSize: "10px", color: "var(--text-3)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "6px", fontWeight: 600 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "15px", fontWeight: item.highlight ? 700 : 500, color: item.highlight ? item.color : "var(--text-1)" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="glass" style={{
              padding: "18px",
              borderColor: d.ai_predictions?.transfusion_suitable ? "rgba(0,255,179,0.25)" : "rgba(255,51,102,0.25)",
              background: d.ai_predictions?.transfusion_suitable ? "rgba(0,255,179,0.04)" : "rgba(255,51,102,0.04)"
            }}>
              <div style={{ fontSize: "10px", color: "var(--text-3)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
                Safe for Transfusion
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: d.ai_predictions?.transfusion_suitable ? "#00FFB3" : "#FF3366" }}>
                {d.ai_predictions?.transfusion_suitable ? "YES" : "NO"}
              </div>
            </div>

            <div className="glass" style={{ padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Shield size={14} color="#00DCFF" />
                <div style={{ fontSize: "10px", color: "var(--text-3)", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600 }}>
                  Blockchain Verified
                </div>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-2)", fontFamily: "var(--font-m)", wordBreak: "break-all", lineHeight: 1.6 }}>
                {result.block_hash?.slice(0, 28)}...<br />
                <span style={{ color: result.blockchain_valid ? "#00FFB3" : "#FF3366" }}>
                  {result.blockchain_valid ? "✓ Chain Valid" : "✗ Invalid"}
                </span>
              </div>
            </div>
          </div>

          
          {d.emergency_contact && (
            <div style={{ marginTop: "16px" }}>
              <a href={`tel:${d.emergency_contact}`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  padding: "14px", borderRadius: "12px", textDecoration: "none",
                  background: "rgba(255,179,64,0.08)", border: "1px solid rgba(255,179,64,0.25)",
                  color: "#FFB340", fontSize: "14px", fontWeight: 600, transition: "all 0.2s"
                }}>
                <Phone size={16} />
                Call Emergency Contact: {d.emergency_contact}
              </a>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
