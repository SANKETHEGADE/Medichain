
import { useState, useRef } from "react"
import axios from "axios"
import { API } from "../App"
import { Upload, Loader2, Layers } from "lucide-react"

export default function SkinAnalysis() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await axios.post(`${API}/analyze/skin`, formData)
      setResult(res.data)
    } catch (e) {
      alert("Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const riskColor = result?.risk_level === "HIGH" ? "#ef4444" : "#22c55e"

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px", color: "#e2e2e2" }}>
        🔬 Skin Disease Analysis
      </h1>
      <p style={{ color: "#444", marginBottom: "32px", fontSize: "14px" }}>
        Identify melanoma, skin cancer, and skin disorders
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "800px" }}>
        <div>
          <div onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${preview ? "#22c55e" : "#2a2a3a"}`,
              borderRadius: "16px", padding: "40px", textAlign: "center",
              cursor: "pointer", background: "#0d0d18", marginBottom: "16px"
            }}>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {preview ? (
              <img src={preview} style={{ width: "100%", borderRadius: "8px", maxHeight: "200px", objectFit: "cover" }} />
            ) : (
              <>
                <Layers size={40} color="#333" style={{ marginBottom: "12px" }} />
                <div style={{ color: "#555", fontSize: "14px" }}>Upload skin image</div>
              </>
            )}
          </div>
          <button onClick={analyze} disabled={!file || loading}
            style={{
              width: "100%", padding: "13px", border: "none", borderRadius: "10px",
              background: !file || loading ? "#2a2a3a" : "linear-gradient(135deg, #06b6d4, #a855f7)",
              color: "white", fontSize: "14px", fontWeight: 600, cursor: !file || loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}>
            {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</> : <><Upload size={16} /> Analyze Skin</>}
          </button>
        </div>

        {result && (
          <div style={{ background: "#0d0d18", border: `1px solid ${riskColor}44`, borderRadius: "16px", padding: "24px" }}>
            <div style={{ fontSize: "13px", color: "#444", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Analysis Result</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: riskColor, marginBottom: "4px", textTransform: "capitalize" }}>
              {result.disease}
            </div>
            <div style={{ fontSize: "13px", color: "#555", marginBottom: "20px" }}>
              Confidence: {result.confidence}% | Risk: {result.risk_level}
            </div>
            <div style={{ fontSize: "12px", color: "#444", marginBottom: "10px", fontWeight: 600 }}>ALL PROBABILITIES</div>
            {Object.entries(result.all_probabilities).map(([disease, prob]: any) => (
              <div key={disease} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                  <span style={{ color: "#888", textTransform: "capitalize" }}>{disease}</span>
                  <span style={{ color: "#888" }}>{prob}%</span>
                </div>
                <div style={{ height: "4px", background: "#1a1a2e", borderRadius: "2px" }}>
                  <div style={{ height: "100%", width: `${prob}%`, background: "#06b6d4", borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
