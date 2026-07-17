# MediChain AI 
### AI-Powered Healthcare Intelligence with Blockchain Security

A multi-modal AI system that detects blood-related and skin diseases from medical images, assesses blood transfusion suitability, and stores patient records on an immutable blockchain with QR-based emergency access.

---

## The Problem

> A patient meets with an accident and is unconscious. No family member is available. Doctors don't know their blood group, allergies, chronic diseases, or past surgeries.

**MediChain AI solves this:**
1. Doctor scans patient QR code or enters patient ID
2. Blockchain instantly retrieves verified medical history
3. AI-predicted disease risks and transfusion suitability shown immediately
4. Treatment starts within minutes, safely

---

## Features

###  AI Disease Detection
- **Eye Analysis** — Detects jaundice, anemia, and cataract from fundus images using EfficientNet-B0 (68% accuracy)
- **Skin Analysis** — Identifies melanoma, skin cancer, benign lesions, and 5 other conditions (79% accuracy)
- **Blood Analysis** — Assesses blood transfusion suitability from donor parameters using Gradient Boosting (93% accuracy)

###  Blockchain Patient Records
- Immutable patient records stored in a SHA-256 blockchain
- Each record has a unique block hash for tamper-proof verification
- Persistent storage — data survives server restarts
- Full chain validation on every read

###  QR Emergency System
- Every registered patient gets a unique QR code
- Doctors scan QR with built-in camera scanner
- Instant retrieval of full medical history
- Works even when patient is unconscious

###  Emergency Lookup
- Camera-based QR scanner for instant patient lookup
- Manual ID entry fallback
- Shows blood group, allergies, chronic diseases, past surgeries
- Blockchain verification badge on every record

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Python + FastAPI |
| Eye & Skin AI | EfficientNet-B0 (PyTorch) |
| Blood Analysis | Gradient Boosting (scikit-learn) |
| Blockchain | Custom SHA-256 chain with JSON persistence |
| QR System | qrcode (generation) + html5-qrcode (scanning) |
| Image Transforms | torchvision |

---

## Model Performance

| Model | Task | Accuracy | Classes |
|---|---|---|---|
| EfficientNet-B0 | Eye Disease Detection | 68.13% | Normal, Anemia, Jaundice, Cataract |
| EfficientNet-B0 | Skin Disease Analysis | 79.37% | 7 classes including Melanoma |
| Gradient Boosting | Blood Transfusion | 93.18% | Suitable / Not Suitable |

---

## Project Structure

```
medichain-ai/
├── backend/
│   ├── main.py              # FastAPI — AI inference + blockchain + QR
│   ├── train_blood.py       # Blood model local training script
│   ├── models/
│   │   ├── eye_model_best.pth
│   │   ├── eye_labels.pth
│   │   ├── skin_model_best.pth
│   │   ├── skin_labels.pth
│   │   ├── blood_model_local.pkl
│   │   └── blood_scaler_local.pkl
│   └── blockchain_data.json # Persistent blockchain storage
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EyeAnalysis.tsx
│   │   │   ├── SkinAnalysis.tsx
│   │   │   ├── BloodAnalysis.tsx
│   │   │   ├── PatientRegister.tsx
│   │   │   ├── EmergencyLookup.tsx
│   │   │   └── QRScanner.tsx
│   │   └── App.tsx
│   └── package.json
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check + blockchain status |
| POST | `/analyze/eye` | Eye disease detection from image |
| POST | `/analyze/skin` | Skin disease detection from image |
| POST | `/analyze/blood` | Blood transfusion suitability |
| POST | `/patient/register` | Register patient on blockchain + generate QR |
| GET | `/patient/{id}` | Retrieve patient record from blockchain |
| GET | `/blockchain/status` | Total blocks, patients, chain validity |

---

## How to Run

### Prerequisites
- Python 3.11, Node.js 18+
- Trained model files (see Google Drive link below)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install fastapi uvicorn python-multipart torch torchvision pillow numpy scikit-learn joblib qrcode
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Training (Google Colab)

Models were trained on Google Colab with T4 GPU:

- **Eye model** — ODIR-5K dataset (6,392 fundus images), 15 epochs
- **Skin model** — HAM10000 dataset (balanced 1,757 images), 15 epochs
- **Blood model** — UCI Blood Transfusion dataset (748 records)

Training notebook available in `/colab/MediChain_Training.ipynb`

---

## Why Blockchain for Healthcare?

| Problem | MediChain Solution |
|---|---|
| Medical records can be falsified | SHA-256 hash makes tampering detectable |
| Records lost in emergencies | QR scan retrieves instantly |
| No unified patient history | Single blockchain stores all records |
| Manual record lookup is slow | AI + blockchain = seconds not minutes |

---

## Future Improvements

- [ ] Real distributed blockchain (Ethereum/Hyperledger)
- [ ] Multi-hospital network nodes
- [ ] Doctor authentication system
- [ ] DICOM medical image support
- [ ] Real-time vitals monitoring
- [ ] Integration with hospital management systems
