
import { useState, useRef } from "react"
import axios from "axios"
import { API } from "../App"
import { Eye, Upload, Loader2, AlertCircle, CheckCircle, Activity } from "lucide-react"

export default function EyeAnalysis() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await axios.post(`${API}/analyze/eye`, fd)
      setResult(res.data)
    } catch { alert("Analysis failed — check backend") }
    finally { setLoading(false) }
  }

  const color = result?.risk_level === "HIGH" ? "#FF3366" : "#00FFB3"

  return (
    <div className="page grid-bg">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
        <Activity size={14} color="#00FFB3" />
        <span style={{ fontSize: "11px", color: "#00FFB3", fontFamily: "var(--font-m)", letterSpacing: "2px" }}>
          EYE DISEASE DETECTION
        </span>
      </div>
      <h1 className="section-title">Fundus Image Analysis</h1>
      <p className="section-sub">Upload a retinal fundus image to detect jaundice, anemia, or cataract</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "900px" }}>

        {/* Upload Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            className="glass"
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            style={{
              padding: "32px", textAlign: "center", cursor: "pointer",
              borderColor: drag ? "#00FFB3" : preview ? "#00FFB344" : "var(--border)",
              borderStyle: "dashed", borderWidth: "1px",
              transition: "all 0.2s", minHeight: "260px",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              background: drag ? "rgba(0,255,179,0.04)" : "rgba(8,14,28,0.9)"
            }}>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {preview ? (
              <img src={preview} alt="Eye" style={{
                width: "100%", maxHeight: "220px",
                objectFit: "cover", borderRadius: "10px"
              }} />
            ) : (
              <>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "14px",
                  background: "rgba(0,255,179,0.08)", border: "1px solid rgba(0,255,179,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px"
                }}>
                  <Eye size={24} color="#00FFB3" />
                </div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-1)", marginBottom: "6px" }}>
                  Drop fundus image here
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                  or click to browse · JPG, PNG
                </div>
              </>
            )}
          </div>

          {file && (
            <div style={{ fontSize: "12px", color: "var(--text-2)", padding: "10px 14px",
              background: "rgba(0,255,179,0.04)", border: "1px solid rgba(0,255,179,0.1)",
              borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
              <span>{file.name}</span>
              <span>{(file.size / 1024).toFixed(0)} KB</span>
            </div>
          )}

          <button className="btn-primary" onClick={analyze}
            disabled={!file || loading}
            style={{ background: !file || loading ? undefined : "linear-gradient(135deg, #00FFB3, #009966)" }}>
            {loading
              ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</>
              : <><Upload size={16} /> Run Analysis</>}
          </button>
        </div>

        {/* Result Panel */}
        <div>
          {!result ? (
            <div className="glass" style={{
              padding: "32px", height: "100%", minHeight: "320px",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center"
            }}>
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%",
                border: "1px solid var(--border)", display: "flex",
                alignItems: "center", justifyContent: "center", marginBottom: "16px"
              }}>
                <Eye size={24} color="var(--text-3)" />
              </div>
              <div style={{ fontSize: "14px", color: "var(--text-3)" }}>
                Upload an image to see AI analysis
              </div>
            </div>
          ) : (
            <div className="glass fade-in" style={{ padding: "24px", borderColor: `${color}30` }}>
              {/* Risk badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-2)", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Diagnosis Result
                </span>
                <span className="tag" style={{
                  background: result.risk_level === "HIGH" ? "var(--red-dim)" : "var(--green-dim)",
                  color, border: `1px solid ${color}30`
                }}>
                  {result.risk_level === "HIGH" ? "⚠ HIGH RISK" : "✓ LOW RISK"}
                </span>
              </div>

              {/* Disease */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "32px", fontWeight: 700, fontFamily: "var(--font-d)", color, letterSpacing: "-0.5px", textTransform: "capitalize" }}>
                  {result.disease}
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "4px" }}>
                  Confidence: <span style={{ color, fontWeight: 600 }}>{result.confidence}%</span>
                </div>
              </div>

              <div className="divider" />

              {/* Probabilities */}
              <div style={{ fontSize: "11px", color: "var(--text-3)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "14px" }}>
                All Predictions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {Object.entries(result.all_probabilities)
                  .sort(([,a]: any, [,b]: any) => b - a)
                  .map(([disease, prob]: any) => (
                    <div key={disease}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-2)", textTransform: "capitalize" }}>{disease}</span>
                        <span style={{ fontSize: "12px", color: "var(--text-1)", fontFamily: "var(--font-m)" }}>{prob}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{
                          width: `${prob}%`,
                          background: disease === result.disease ? color : "rgba(255,255,255,0.1)"
                        }} />
                      </div>
                    </div>
                  ))}
              </div>

              {/* Icon */}
              <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                {result.risk_level === "HIGH"
                  ? <AlertCircle size={14} color="#FF3366" />
                  : <CheckCircle size={14} color="#00FFB3" />}
                <span style={{ fontSize: "12px", color: "var(--text-2)" }}>
                  {result.risk_level === "HIGH"
                    ? "Recommend specialist consultation"
                    : "No significant pathology detected"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
