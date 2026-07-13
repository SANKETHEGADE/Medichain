
import { useState } from "react"
import axios from "axios"
import { API } from "../App"
import { AlertTriangle, Loader2, Search } from "lucide-react"

export default function EmergencyLookup() {
  const [patientId, setPatientId] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const lookup = async () => {
    if (!patientId.trim()) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await axios.get(`${API}/patient/${patientId.trim()}`)
      setResult(res.data)
    } catch {
      setError("Patient not found in blockchain")
    } finally { setLoading(false) }
  }

  const d = result?.patient_data

  return (
    <div>
      <div style={{
        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: "12px", padding: "16px 20px", marginBottom: "32px",
        display: "flex", alignItems: "center", gap: "12px"
      }}>
        <AlertTriangle size={20} color="#ef4444" />
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#ef4444" }}>Emergency Mode</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Scan patient QR or enter ID to retrieve medical history instantly</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", maxWidth: "500px" }}>
        <input value={patientId} onChange={e => setPatientId(e.target.value)}
          onKeyDown={e => e.key === "Enter" && lookup()}
          placeholder="Enter Patient ID (e.g. MC001)"
          style={{
            flex: 1, padding: "13px 16px", background: "#0d0d18",
            border: "1px solid #2a2a3a", borderRadius: "10px",
            color: "#e2e2e2", fontSize: "14px", outline: "none",
            fontFamily: "Inter, sans-serif"
          }} />
        <button onClick={lookup} disabled={loading}
          style={{
            padding: "13px 20px", border: "none", borderRadius: "10px",
            background: "linear-gradient(135deg, #ef4444, #f59e0b)",
            color: "white", cursor: "pointer", display: "flex",
            alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600
          }}>
          {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={16} />}
          Lookup
        </button>
      </div>

      {error && (
        <div style={{ color: "#ef4444", fontSize: "14px", marginBottom: "20px" }}>❌ {error}</div>
      )}

      {result && d && (
        <div style={{ background: "#0d0d18", border: "1px solid #f59e0b44", borderRadius: "16px", padding: "28px", maxWidth: "700px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#e2e2e2" }}>{d.name}</div>
              <div style={{ fontSize: "13px", color: "#555" }}>ID: {d.patient_id} | Block #{result.block_index}</div>
            </div>
            <div style={{
              padding: "8px 16px", borderRadius: "20px",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444", fontSize: "12px", fontWeight: 600
            }}>🚨 EMERGENCY</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[
              { label: "Age", value: d.age },
              { label: "Blood Group", value: d.blood_group, highlight: true },
              { label: "Emergency Contact", value: d.emergency_contact },
              { label: "Hospital", value: d.hospital },
              { label: "Allergies", value: d.allergies?.join(", ") || "None" },
              { label: "Chronic Diseases", value: d.chronic_diseases?.join(", ") || "None" },
              { label: "Past Surgeries", value: d.past_surgeries?.join(", ") || "None" },
              { label: "Safe for Transfusion", value: d.ai_predictions?.transfusion_suitable ? "✅ YES" : "❌ NO", highlight: true },
            ].map(item => (
              <div key={item.label} style={{
                background: "#080810", borderRadius: "10px", padding: "14px 16px",
                border: item.highlight ? "1px solid #f59e0b44" : "1px solid #1a1a2e"
              }}>
                <div style={{ fontSize: "11px", color: "#444", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>{item.label}</div>
                <div style={{ fontSize: "14px", color: item.highlight ? "#f59e0b" : "#e2e2e2", fontWeight: item.highlight ? 700 : 400 }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px", padding: "12px 16px", background: "#080810", borderRadius: "10px", border: "1px solid #1a1a2e" }}>
            <div style={{ fontSize: "11px", color: "#333", fontWeight: 600, marginBottom: "4px" }}>BLOCKCHAIN VERIFICATION</div>
            <div style={{ fontSize: "11px", color: "#333", wordBreak: "break-all" }}>
              Hash: {result.block_hash} | Valid: {result.blockchain_valid ? "✅" : "❌"}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
