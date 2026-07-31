import { useState } from "react"
import axios from "axios"
import { API } from "../App"
import { Loader2 } from "lucide-react"

export default function BloodAnalysis() {
  const [form, setForm] = useState({
    recency: "", frequency: "", monetary: "", time_months: ""
  })
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
    { key: "recency",     label: "Recency",   sub: "Months since last donation",  placeholder: "e.g. 2"    },
    { key: "frequency",   label: "Frequency", sub: "Total donations made",        placeholder: "e.g. 10"   },
    { key: "monetary",    label: "Monetary",  sub: "Total blood donated (c.c.)",  placeholder: "e.g. 2500" },
    { key: "time_months", label: "Time",      sub: "Months since first donation", placeholder: "e.g. 24"   },
  ]

  const approved = result?.suitable_for_donation
  const riskColor = approved ? "#4ADE80" : "#F87171"

  return (
    <div className="page">
      <p className="label" style={{ marginBottom: "12px" }}>Gradient Boosting · RFMT Model · 93% Accuracy</p>
      <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "8px" }}>
        Blood Analysis
      </h1>
      <p style={{ color: "#555", marginBottom: "48px", fontSize: "14px", maxWidth: "480px" }}>
        Assess blood transfusion suitability from RFMT donor parameters using gradient boosting
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "880px" }}>

       
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <div className="label" style={{ marginBottom: "20px" }}>RFMT Parameters</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "20px" }}>
              {fields.map(f => (
                <div key={f.key}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "7px"
                  }}>
                    <label className="label">{f.label}</label>
                    <span style={{ fontSize: "11px", color: "#2a2a2a" }}>{f.sub}</span>
                  </div>
                  <input
                    type="number"
                    className="input"
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <button className="btn btn-white" onClick={analyze}
              disabled={loading} style={{ width: "100%", padding: "13px" }}>
              {loading
                ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</>
                : "Analyze Blood"}
            </button>
          </div>

         
          <div style={{
            padding: "14px 16px", background: "#0D0D0D",
            border: "1px solid #1a1a1a", borderRadius: "8px"
          }}>
            <div className="label" style={{ marginBottom: "10px" }}>Model Info</div>
            {[
              ["Algorithm",  "Gradient Boosting"],
              ["Dataset",    "UCI Blood Transfusion (748)"],
              ["Features",   "RFMT + 3 engineered"],
              ["Accuracy",   "93.18%"],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: "flex", justifyContent: "space-between",
                fontSize: "12px", marginBottom: "6px"
              }}>
                <span style={{ color: "#333" }}>{k}</span>
                <span style={{ color: "#666" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

       
        {!result ? (
          <div className="card" style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            minHeight: "360px", textAlign: "center", padding: "40px"
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "14px",
              background: "#0f0f0f", border: "1px solid #1a1a1a",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px", marginBottom: "16px"
            }}>🩸</div>
            <div style={{ fontSize: "13px", color: "#333", lineHeight: 1.6 }}>
              Enter donor parameters<br />to see suitability analysis
            </div>
            <div style={{ fontSize: "11px", color: "#222", marginTop: "12px", lineHeight: 1.7 }}>
              Gradient Boosting · 93% accuracy<br />
              UCI Blood Transfusion Dataset
            </div>
          </div>
        ) : (
          <div className="card fade-up" style={{ padding: "28px" }}>

            
            <div style={{
              textAlign: "center", padding: "28px 0",
              borderBottom: "1px solid #1a1a1a", marginBottom: "28px"
            }}>
              <div style={{ fontSize: "44px", marginBottom: "16px" }}>
                {approved ? "✅" : "❌"}
              </div>
              <div style={{
                fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px",
                color: riskColor, marginBottom: "6px"
              }}>
                {approved ? "APPROVED" : "NOT RECOMMENDED"}
              </div>
              <div style={{ fontSize: "13px", color: "#444" }}>
                {approved
                  ? "Suitable for blood donation"
                  : "Not suitable for blood donation"}
              </div>
            </div>

            
            <div style={{ marginBottom: "20px" }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                marginBottom: "10px"
              }}>
                <span style={{ fontSize: "12px", color: "#444" }}>
                  Donation probability
                </span>
                <span style={{
                  fontSize: "13px", fontWeight: 700, color: riskColor
                }}>
                  {result.donation_probability}%
                </span>
              </div>
              <div className="progress" style={{ height: "5px" }}>
                <div className="progress-fill" style={{
                  width: `${result.donation_probability}%`,
                  background: riskColor
                }} />
              </div>
            </div>

            
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px", background: "#0D0D0D",
              border: "1px solid #1a1a1a", borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <span style={{ fontSize: "12px", color: "#444" }}>Risk Level</span>
              <span className="tag" style={{ color: riskColor }}>
                {result.risk_level}
              </span>
            </div>

            
            <div className="label" style={{ marginBottom: "12px" }}>
              Parameters Analyzed
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                ["Recency",   `${form.recency} months`],
                ["Frequency", `${form.frequency} donations`],
                ["Monetary",  `${form.monetary} c.c.`],
                ["Time",      `${form.time_months} months`],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: "12px"
                }}>
                  <span style={{ color: "#333" }}>{k}</span>
                  <span style={{ color: "#666" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
