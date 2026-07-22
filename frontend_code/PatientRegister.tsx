
import { useState } from "react"
import axios from "axios"
import { API } from "../App"
import { UserPlus, Loader2, Activity, Shield, Copy, Check } from "lucide-react"

export default function PatientRegister() {
  const [form, setForm] = useState({
    patient_id: "", name: "", age: "", blood_group: "",
    allergies: "", chronic_diseases: "", past_surgeries: "",
    emergency_contact: "", hospital: ""
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const register = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/patient/register`, {
        ...form,
        age: Number(form.age),
        allergies: form.allergies.split(",").map(s => s.trim()).filter(Boolean),
        chronic_diseases: form.chronic_diseases.split(",").map(s => s.trim()).filter(Boolean),
        past_surgeries: form.past_surgeries.split(",").map(s => s.trim()).filter(Boolean),
      })
      setResult(res.data)
    } catch (e: any) {
      alert(e.response?.data?.detail || "Registration failed")
    } finally { setLoading(false) }
  }

  const copyHash = () => {
    navigator.clipboard.writeText(result?.block_hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fields = [
    { key: "patient_id",        label: "Patient ID",           placeholder: "e.g. MC001",            col: 1 },
    { key: "name",              label: "Full Name",             placeholder: "e.g. John Doe",         col: 1 },
    { key: "age",               label: "Age",                   placeholder: "e.g. 35",               col: 1 },
    { key: "blood_group",       label: "Blood Group",           placeholder: "e.g. O+",               col: 1 },
    { key: "allergies",         label: "Allergies",             placeholder: "Penicillin, Latex ...", col: 2 },
    { key: "chronic_diseases",  label: "Chronic Diseases",      placeholder: "Diabetes, Hypertension ...", col: 2 },
    { key: "past_surgeries",    label: "Past Surgeries",        placeholder: "Appendectomy 2019 ...", col: 2 },
    { key: "emergency_contact", label: "Emergency Contact",     placeholder: "+91 9876543210",        col: 2 },
    { key: "hospital",          label: "Hospital",              placeholder: "City General Hospital", col: 2 },
  ]

  const col1 = fields.filter(f => f.col === 1)
  const col2 = fields.filter(f => f.col === 2)

  return (
    <div className="page grid-bg">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <Activity size={14} color="#00DCFF" />
        <span style={{ fontSize: "11px", color: "#00DCFF", fontFamily: "var(--font-m)", letterSpacing: "2px" }}>
          BLOCKCHAIN REGISTRATION
        </span>
      </div>
      <h1 className="section-title">Register Patient</h1>
      <p className="section-sub">Add patient to the MediChain blockchain — generates tamper-proof record + QR code</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "960px" }}>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Col 1 fields */}
          <div className="glass" style={{ padding: "24px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-3)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "18px" }}>
              Identity
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {col1.map(f => (
                <div key={f.key}>
                  <label className="field-label">{f.label}</label>
                  <input
                    className="input-field"
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = "#00DCFF44"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Col 2 fields */}
          <div className="glass" style={{ padding: "24px" }}>
            <div style={{ fontSize: "11px", color: "var(--text-3)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "18px" }}>
              Medical History <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(comma separated)</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {col2.map(f => (
                <div key={f.key}>
                  <label className="field-label">{f.label}</label>
                  <input
                    className="input-field"
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    onFocus={e => e.target.style.borderColor = "#00DCFF44"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={register} disabled={loading}
            style={{ background: loading ? undefined : "linear-gradient(135deg, #00DCFF, #0088CC)" }}>
            {loading
              ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Registering on blockchain...</>
              : <><UserPlus size={16} /> Register on Blockchain</>}
          </button>
        </div>

        {/* Result */}
        <div>
          {!result ? (
            <div className="glass" style={{
              padding: "32px", minHeight: "400px",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center"
            }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "16px",
                background: "rgba(0,220,255,0.06)", border: "1px solid rgba(0,220,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px"
              }}>
                <Shield size={28} color="var(--text-3)" />
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-3)", marginBottom: "8px" }}>
                Fill in patient details
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: 1.6 }}>
                Patient will be registered on the<br />
                MediChain blockchain with a unique<br />
                QR code for emergency access
              </div>
            </div>
          ) : (
            <div className="glass fade-in" style={{ padding: "24px", borderColor: "#00DCFF30" }}>
              {/* Success */}
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                marginBottom: "20px", paddingBottom: "16px",
                borderBottom: "1px solid var(--border)"
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "rgba(0,255,179,0.1)", display: "flex",
                  alignItems: "center", justifyContent: "center"
                }}>
                  <Check size={16} color="#00FFB3" />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#00FFB3" }}>
                    Successfully Registered
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-3)" }}>
                    Block #{result.block_index} · MediChain Network
                  </div>
                </div>
              </div>

              {/* Hash */}
              <div style={{ marginBottom: "20px" }}>
                <div className="field-label">Block Hash</div>
                <div style={{
                  padding: "10px 14px", background: "rgba(0,0,0,0.3)",
                  borderRadius: "8px", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px"
                }}>
                  <span style={{ fontSize: "11px", color: "var(--text-2)", fontFamily: "var(--font-m)", wordBreak: "break-all" }}>
                    {result.block_hash?.slice(0, 32)}...
                  </span>
                  <button onClick={copyHash}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-2)", flexShrink: 0 }}>
                    {copied ? <Check size={14} color="#00FFB3" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div>
                <div className="field-label" style={{ marginBottom: "12px" }}>Patient QR Code</div>
                <div style={{
                  background: "white", padding: "16px", borderRadius: "12px",
                  display: "inline-block", width: "100%", textAlign: "center"
                }}>
                  <img
                    src={`data:image/png;base64,${result.qr_code}`}
                    style={{ width: "180px", height: "180px" }}
                    alt="Patient QR"
                  />
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-3)", textAlign: "center", marginTop: "10px" }}>
                  Scan this QR in Emergency Lookup to retrieve instant medical history
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
