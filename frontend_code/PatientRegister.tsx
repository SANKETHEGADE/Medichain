
import { useState } from "react"
import axios from "axios"
import { API } from "../App"
import { UserPlus, Loader2 } from "lucide-react"

export default function PatientRegister() {
  const [form, setForm] = useState({
    patient_id: "", name: "", age: "", blood_group: "",
    allergies: "", chronic_diseases: "", past_surgeries: "",
    emergency_contact: "", hospital: ""
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const register = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/patient/register`, {
        ...form,
        age: Number(form.age),
        allergies: form.allergies.split(",").map(s => s.trim()),
        chronic_diseases: form.chronic_diseases.split(",").map(s => s.trim()),
        past_surgeries: form.past_surgeries.split(",").map(s => s.trim()),
      })
      setResult(res.data)
    } catch (e: any) {
      alert(e.response?.data?.detail || "Registration failed")
    } finally { setLoading(false) }
  }

  const fields = [
    { key: "patient_id", label: "Patient ID", placeholder: "e.g. MC001" },
    { key: "name", label: "Full Name", placeholder: "e.g. John Doe" },
    { key: "age", label: "Age", placeholder: "e.g. 35" },
    { key: "blood_group", label: "Blood Group", placeholder: "e.g. O+" },
    { key: "allergies", label: "Allergies (comma separated)", placeholder: "e.g. Penicillin, Latex" },
    { key: "chronic_diseases", label: "Chronic Diseases", placeholder: "e.g. Diabetes, Hypertension" },
    { key: "past_surgeries", label: "Past Surgeries", placeholder: "e.g. Appendectomy 2019" },
    { key: "emergency_contact", label: "Emergency Contact", placeholder: "e.g. +91 9876543210" },
    { key: "hospital", label: "Hospital", placeholder: "e.g. City General Hospital" },
  ]

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px", color: "#e2e2e2" }}>
        👤 Register Patient
      </h1>
      <p style={{ color: "#444", marginBottom: "32px", fontSize: "14px" }}>
        Add patient to the MediChain blockchain with QR code generation
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "900px" }}>
        <div style={{ background: "#0d0d18", border: "1px solid #1a1a2e", borderRadius: "16px", padding: "24px" }}>
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "11px", color: "#555", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>{f.label}</label>
              <input placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{
                  width: "100%", padding: "10px 14px", background: "#080810",
                  border: "1px solid #2a2a3a", borderRadius: "8px",
                  color: "#e2e2e2", fontSize: "13px", outline: "none",
                  fontFamily: "Inter, sans-serif"
                }} />
            </div>
          ))}
          <button onClick={register} disabled={loading}
            style={{
              width: "100%", padding: "13px", border: "none", borderRadius: "10px",
              background: "linear-gradient(135deg, #22c55e, #06b6d4)",
              color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              marginTop: "8px"
            }}>
            {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Registering...</> : <><UserPlus size={16} /> Register on Blockchain</>}
          </button>
        </div>

        {result && (
          <div style={{ background: "#0d0d18", border: "1px solid #22c55e44", borderRadius: "16px", padding: "24px" }}>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#22c55e", marginBottom: "16px" }}>
              ✅ Patient Registered!
            </div>
            <div style={{ fontSize: "12px", color: "#555", marginBottom: "6px" }}>Block Index: {result.block_index}</div>
            <div style={{ fontSize: "11px", color: "#444", marginBottom: "20px", wordBreak: "break-all" }}>
              Hash: {result.block_hash}
            </div>
            <div style={{ fontSize: "12px", color: "#555", marginBottom: "10px", fontWeight: 600 }}>PATIENT QR CODE</div>
            <img src={`data:image/png;base64,${result.qr_code}`}
              style={{ width: "200px", borderRadius: "8px", border: "1px solid #2a2a3a" }} />
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
