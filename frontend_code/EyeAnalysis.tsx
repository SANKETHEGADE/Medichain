import { useState, useRef } from "react"
import axios from "axios"
import { API } from "../App"
import { Loader2 } from "lucide-react"

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

  const riskColor = result?.risk_level === "HIGH" ? "#F87171" : "#4ADE80"

  return (
    <div className="page">
      <p className="label" style={{ marginBottom: "12px" }}>Vision AI · EfficientNet-B0 · 68% Accuracy</p>
      <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-1px", marginBottom: "8px" }}>
        Eye Analysis
      </h1>
      <p style={{ color: "#555", marginBottom: "48px", fontSize: "14px", maxWidth: "480px" }}>
        Detect jaundice, anemia, cataract or normal from retinal fundus images using deep learning
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "880px" }}>

        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            className={`upload-zone${drag ? " drag" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => {
              e.preventDefault(); setDrag(false)
              const f = e.dataTransfer.files[0]
              if (f) handleFile(f)
            }}
          >
            <input ref={inputRef} type="file" accept="image/*"
              style={{ display: "none" }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {preview ? (
              <img src={preview} alt="Eye"
                style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px" }} />
            ) : (
              <>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: "#161616", border: "1px solid #1f1f1f",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", marginBottom: "14px"
                }}>👁</div>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#666", marginBottom: "4px" }}>
                  Drop fundus image here
                </div>
                <div style={{ fontSize: "12px", color: "#333" }}>or click to browse · JPG, PNG</div>
              </>
            )}
          </div>

          {file && (
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 14px", background: "#111",
              border: "1px solid #1a1a1a", borderRadius: "8px"
            }}>
              <span style={{ fontSize: "12px", color: "#555" }}>{file.name}</span>
              <span style={{ fontSize: "12px", color: "#333" }}>{(file.size / 1024).toFixed(0)} KB</span>
            </div>
          )}

          <button className="btn btn-white" onClick={analyze}
            disabled={!file || loading} style={{ width: "100%", padding: "13px" }}>
            {loading
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</>
              : "Run Analysis"}
          </button>

          
          <div style={{
            padding: "14px 16px", background: "#0D0D0D",
            border: "1px solid #1a1a1a", borderRadius: "8px"
          }}>
            <div className="label" style={{ marginBottom: "10px" }}>Model Info</div>
            {[
              ["Architecture", "EfficientNet-B0"],
              ["Dataset",      "ODIR-5K (6,392 images)"],
              ["Classes",      "Normal · Anemia · Jaundice · Cataract"],
              ["Accuracy",     "68.13%"],
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
            }}>👁</div>
            <div style={{ fontSize: "13px", color: "#333", lineHeight: 1.6 }}>
              Upload a retinal fundus image<br />to begin analysis
            </div>
          </div>
        ) : (
          <div className="card fade-up" style={{ padding: "28px" }}>

            
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: "28px"
            }}>
              <span className="label">Diagnosis</span>
              <span className="tag" style={{
                color: riskColor,
                borderColor: result.risk_level === "HIGH" ? "#2a1a1a" : "#1a2a1a",
                background: result.risk_level === "HIGH" ? "#1a0a0a" : "#0a1a0a"
              }}>
                {result.risk_level} RISK
              </span>
            </div>

            
            <div style={{ marginBottom: "28px" }}>
              <div style={{
                fontSize: "34px", fontWeight: 800, letterSpacing: "-1px",
                color: riskColor, textTransform: "capitalize", marginBottom: "6px"
              }}>
                {result.disease}
              </div>
              <div style={{ fontSize: "13px", color: "#444" }}>
                Confidence score:&nbsp;
                <span style={{ color: "#fff", fontWeight: 600 }}>{result.confidence}%</span>
              </div>
            </div>

            <div className="divider" style={{ marginBottom: "24px" }} />

            
            <div className="label" style={{ marginBottom: "16px" }}>All predictions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {Object.entries(result.all_probabilities)
                .sort(([, a]: any, [, b]: any) => b - a)
                .map(([disease, prob]: any) => (
                  <div key={disease}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", marginBottom: "7px"
                    }}>
                      <span style={{
                        fontSize: "12px", color: disease === result.disease ? "#bbb" : "#444",
                        textTransform: "capitalize", fontWeight: disease === result.disease ? 500 : 400
                      }}>
                        {disease}
                      </span>
                      <span style={{
                        fontSize: "12px",
                        color: disease === result.disease ? "#fff" : "#333",
                        fontWeight: disease === result.disease ? 600 : 400
                      }}>
                        {prob}%
                      </span>
                    </div>
                    <div className="progress">
                      <div className="progress-fill" style={{
                        width: `${prob}%`,
                        background: disease === result.disease ? riskColor : "#1f1f1f"
                      }} />
                    </div>
                  </div>
                ))}
            </div>

          
            <div style={{
              marginTop: "24px", padding: "12px 14px",
              background: "#0D0D0D", border: "1px solid #1a1a1a",
              borderRadius: "8px", fontSize: "12px",
              color: result.risk_level === "HIGH" ? "#F87171" : "#4ADE80"
            }}>
              {result.risk_level === "HIGH"
                ? "⚠ Specialist consultation recommended"
                : "✓ No significant pathology detected"}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
