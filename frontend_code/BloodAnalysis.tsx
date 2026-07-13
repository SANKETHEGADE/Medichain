
import { useState } from "react"
import axios from "axios"
import { API } from "../App"
import { Droplets, Loader2 } from "lucide-react"

export default function BloodAnalysis() {
  const [form, setForm] = useState({ recency: "", frequency: "", monetary: "", time_months: "" })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/analyze/blood`, {
        recency: Number(form.recency),
        frequency: Number(form.frequency),
        monetary: Number(form.monetary),
        time_months: Number(form.time_months)
      })
      setResult(res.data)
    } catch { alert("Analysis failed") }
    finally { setLoading(false) }
  }

  const fields = [
    { key: "recency", label: "Recency (months since last donation)", placeholder: "e.g. 2" },
    { key: "frequency", label: "Frequency (total donations)", placeholder: "e.g. 10" },
    { key: "monetary", label: "Monetary (total blood cc)", placeholder: "e.g. 2500" },
    { key: "time_months", label: "Time (months since first donation)", placeholder: "e.g. 24" },
  ]

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px", color: "#e2e2e2" }}>
        🩸 Blood Analysis
      </h1>
      <p style={{ color: "#444", marginBottom: "32px", fontSize: "14px" }}>
        Assess blood transfusion suitability from donor parameters
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "800px" }}>
        <div style={{ background: "#0d0d18", border: "1px solid #1a1a2e", borderRadius: "16px", padding: "24px" }}>
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "8px", fontWeight: 600 }}>{f.label}</label>
              <input type="number" placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{
                  width: "100%", padding: "11px 14px", background: "#080810",
                  border: "1px solid #2a2a3a", borderRadius: "8px",
                  color: "#e2e2e2", fontSize: "14px", outline: "none",
                  fontFamily: "Inter, sans-serif"
                }} />
            </div>
          ))}
          <button onClick={analyze} disabled={loading}
            style={{
              width: "100%", padding: "13px", border: "none", borderRadius: "10px",
              background: "linear-gradient(135deg, #ef4444, #a855f7)",
              color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}>
            {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</> : <><Droplets size={16} /> Analyze Blood</>}
          </button>
        </div>

        {result && (
          <div style={{
            background: "#0d0d18",
            border: `1px solid ${result.suitable_for_donation ? "#22c55e44" : "#ef444444"}`,
            borderRadius: "16px", padding: "24px"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>
              {result.suitable_for_donation ? "✅" : "❌"}
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px",
              color: result.suitable_for_donation ? "#22c55e" : "#ef4444" }}>
              {result.recommendation}
            </div>
            <div style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
              Donation Probability: {result.donation_probability}%
            </div>
            <div style={{ height: "8px", background: "#1a1a2e", borderRadius: "4px" }}>
              <div style={{
                height: "100%", borderRadius: "4px",
                width: `${result.donation_probability}%`,
                background: result.suitable_for_donation ? "#22c55e" : "#ef4444"
              }} />
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
