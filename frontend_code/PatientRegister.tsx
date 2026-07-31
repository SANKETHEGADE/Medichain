import { useState } from "react"
import axios from "axios"
import { API } from "../App"
import { Loader2, Copy, Check } from "lucide-react"

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

  const fields1 = [
    { key: "patient_id",        label: "Patient ID",        placeholder: "e.g. MC001"           },
    { key: "name",              label: "Full Name",          placeholder: "e.g. John Doe"        },
    { key: "age",               label: "Age",                placeholder: "e.g. 35"              },
    { key: "blood_group",       label: "Blood Group",        placeholder: "e.g. O+"              },
    { key: "hospital",          label: "Hospital",           placeholder: "e.g. City Hospital"   },
    { key: "emergency_contact", label: "Emergency Contact",  placeholder: "+91 9876543210"        },
  ]

  const fields2 = [
    { key: "allergies",        label: "Allergies",        placeholder: "Penicillin, Latex (comma separated)"       },
    { key: "chronic_diseases", label: "Chronic Diseases", placeholder: "Diabetes, Hypertension (comma separated)"  },
    { key: "past_surgeries",   label: "Past Surgeries",   placeholder: "Appendectomy 2019 (comma separated)"       },
  ]

  return (
    <div className="page">
      <p className="label" style={{ marginBottom: "12px" }}>SHA-256 Blockchain · Immutable Records · QR Generation</p>
      <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "8px" }}>
        Register Patient
      </h1>
      <p style={{ color: "#555", marginBottom: "48px", fontSize: "14px", maxWidth: "480px" }}>
        Add patient to the MediChain blockchain — generates tamper-proof record and emergency QR code
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "960px" }}>

        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          <div className="card" style={{ padding: "24px" }}>
            <div className="label" style={{ marginBottom: "18px" }}>Identity</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {fields1.map(f => (
                <div key={f.key}>
                  <label className="label" style={{ display: "block", marginBottom: "7px" }}>
                    {f.label}
                  </label>
                  <input className="input" placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: "24px" }}>
            <div style={{ marginBottom: "18px" }}>
              <div className="label" style={{ display: "inline" }}>Medical History</div>
              <span style={{ fontSize: "11px", color: "#2a2a2a", marginLeft: "8px" }}>
                comma separated
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {fields2.map(f => (
                <div key={f.key}>
                  <label className="label" style={{ display: "block", marginBottom: "7px" }}>
                    {f.label}
                  </label>
                  <input className="input" placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-white" onClick={register}
            disabled={loading} style={{ width: "100%", padding: "13px" }}>
            {loading
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Registering on blockchain...</>
              : "Register on Blockchain"}
          </button>
        </div>

        
        {!result ? (
          <div className="card" style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            minHeight: "440px", textAlign: "center", padding: "40px"
          }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "14px",
              background: "#0f0f0f", border: "1px solid #1a1a1a",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px", marginBottom: "16px"
            }}>🔐</div>
            <div style={{ fontSize: "13px", color: "#333", lineHeight: 1.6, marginBottom: "12px" }}>
              Fill in patient details<br />to register on blockchain
            </div>
            <div style={{ fontSize: "11px", color: "#222", lineHeight: 1.8 }}>
              Records stored immutably on SHA-256 chain<br />
              Each patient gets a unique QR code<br />
              for instant emergency medical access
            </div>
          </div>
        ) : (
          <div className="card fade-up" style={{ padding: "24px" }}>

            
            <div style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "14px 16px", background: "#0a1a0a",
              border: "1px solid #1a2a1a", borderRadius: "8px", marginBottom: "20px"
            }}>
              <span style={{ fontSize: "18px" }}>✅</span>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#4ADE80" }}>
                  Successfully Registered
                </div>
                <div style={{ fontSize: "11px", color: "#444", marginTop: "2px" }}>
                  Block #{result.block_index} · MediChain Network
                </div>
              </div>
            </div>

            
            <div style={{ marginBottom: "20px" }}>
              <div className="label" style={{ marginBottom: "8px" }}>Block Hash</div>
              <div style={{
                padding: "10px 14px", background: "#0D0D0D",
                border: "1px solid #1a1a1a", borderRadius: "8px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: "8px"
              }}>
                <span style={{
                  fontSize: "11px", color: "#444",
                  fontFamily: "monospace", wordBreak: "break-all"
                }}>
                  {result.block_hash?.slice(0, 36)}...
                </span>
                <button onClick={copyHash} style={{
                  background: "none", border: "none",
                  cursor: "pointer", color: "#444", flexShrink: 0,
                  padding: "4px"
                }}>
                  {copied
                    ? <Check size={13} color="#4ADE80" />
                    : <Copy size={13} />}
                </button>
              </div>
            </div>

            <div className="divider" style={{ marginBottom: "20px" }} />

            
            <div>
              <div className="label" style={{ marginBottom: "14px" }}>Emergency QR Code</div>
              <div style={{
                background: "#fff", padding: "20px",
                borderRadius: "10px", display: "flex",
                justifyContent: "center", marginBottom: "12px"
              }}>
                <img src={`data:image/png;base64,${result.qr_code}`}
                  style={{ width: "170px", height: "170px" }} alt="QR" />
              </div>
              <div style={{
                fontSize: "11px", color: "#333",
                textAlign: "center", lineHeight: 1.6
              }}>
                Scan this QR in Emergency Lookup<br />
                for instant verified medical history
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
  )
}
