
import { useState } from "react"
import axios from "axios"
import { API } from "../App"
import { Droplets, Loader2, Activity, CheckCircle, XCircle } from "lucide-react"

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
    { key: "recency",      label: "Recency",   sub: "Months since last donation",     placeholder: "e.g. 2",    min: 0, max: 74  },
    { key: "frequency",    label: "Frequency", sub: "Total number of donations",       placeholder: "e.g. 10",   min: 1, max: 50  },
    { key: "monetary",     label: "Monetary",  sub: "Total blood donated in c.c.",     placeholder: "e.g. 2500", min: 250, max: 12500 },
    { key: "time_months",  label: "Time",      sub: "Months since first donation",     placeholder: "e.g. 24",   min: 2, max: 98  },
  ]

  const approved = result?.suitable_for_donation
  const color = approved ? "#00FFB3" : "#FF3366"

  return (
    <div className="page grid-bg">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <Activity size={14} color="#FF3366" />
        <span style={{ fontSize: "11px", color: "#FF3366", fontFamily: "var(--font-m)", letterSpacing: "2px" }}>
          BLOOD TRANSFUSION ANALYSIS
        </span>
      </div>
      <h1 className="section-title">Blood Suitability Check</h1>
      <p className="section-sub">Enter donor parameters to assess blood transfusion suitability</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "900px" }}>

        {/* Form */}
        <div className="glass" style={{ padding: "28px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-3)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "20px" }}>
            RFMT Parameters
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "24px" }}>
            {fields.map(f => (
              <div key={f.key}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                  <label className="field-label" style={{ marginBottom: 0 }}>{f.label}</label>
                  <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{f.sub}</span>
                </div>
                <input
                  type="number"
                  className="input-field"
                  placeholder={f.placeholder}
                  min={f.min} max={f.max}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = "#FF336655"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={analyze} disabled={loading}
            style={{ background: loading ? undefined : "linear-gradient(135deg, #FF3366, #AA0033)", width: "100%" }}>
            {loading
              ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</>
              : <><Droplets size={16} /> Analyze Blood</>}
          </button>
        </div>

        
        <div>
          {!result ? (
            <div className="glass" style={{
              padding: "32px", height: "100%", minHeight: "360px",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center"
            }}>
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%",
                border: "1px solid var(--border)", display: "flex",
                alignItems: "center", justifyContent: "center", marginBottom: "16px"
              }}>
                <Droplets size={24} color="var(--text-3)" />
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-3)" }}>
                Enter parameters to see analysis
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "8px", lineHeight: 1.6 }}>
                RFMT Model · Gradient Boosting<br />93% accuracy · 748 samples
              </div>
            </div>
          ) : (
            <div className="glass fade-in" style={{ padding: "28px", borderColor: `${color}30`, height: "100%" }}>

              
              <div style={{ textAlign: "center", padding: "24px 0", borderBottom: "1px solid var(--border)", marginBottom: "24px" }}>
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: `${color}15`, border: `2px solid ${color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px"
                }}>
                  {approved
                    ? <CheckCircle size={32} color="#00FFB3" />
                    : <XCircle size={32} color="#FF3366" />}
                </div>
                <div style={{ fontSize: "24px", fontWeight: 700, fontFamily: "var(--font-d)", color, letterSpacing: "-0.5px", marginBottom: "6px" }}>
                  {approved ? "APPROVED" : "NOT RECOMMENDED"}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-2)" }}>
                  {approved ? "Suitable for blood donation" : "Not suitable for blood donation"}
                </div>
              </div>

              
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-2)" }}>Donation probability</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color, fontFamily: "var(--font-m)" }}>
                    {result.donation_probability}%
                  </span>
                </div>
                <div className="progress-track" style={{ height: "8px" }}>
                  <div className="progress-fill" style={{ width: `${result.donation_probability}%`, background: color }} />
                </div>
              </div>

              
              <div style={{
                padding: "14px 16px", borderRadius: "10px",
                background: `${color}08`, border: `1px solid ${color}20`,
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <span style={{ fontSize: "12px", color: "var(--text-2)" }}>Risk Level</span>
                <span className="tag" style={{
                  background: approved ? "var(--green-dim)" : "var(--red-dim)",
                  color, border: `1px solid ${color}25`
                }}>
                  {result.risk_level}
                </span>
              </div>

              <div style={{ marginTop: "20px", fontSize: "11px", color: "var(--text-3)", textAlign: "center", lineHeight: 1.6 }}>
                Model: Gradient Boosting · Trained on UCI Blood Transfusion Dataset
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
