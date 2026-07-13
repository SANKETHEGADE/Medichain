
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np
import joblib
import json
import os
import tempfile
import shutil
import hashlib
import datetime
import qrcode
from io import BytesIO
import base64
import uvicorn

app = FastAPI(title="MediChain AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ── LOAD MODELS ───────────────────────────────────────────────
print("Loading models...")

eye_labels   = torch.load("models/eye_labels.pth",  map_location=device)
skin_labels  = torch.load("models/skin_labels.pth", map_location=device)
eye_idx2label  = eye_labels["idx2label"]
skin_idx2label = skin_labels["idx2label"]
eye_label2idx  = eye_labels["label2idx"]
skin_label2idx = skin_labels["label2idx"]

eye_model = models.efficientnet_b0(weights=None)
eye_model.classifier[1] = nn.Linear(eye_model.classifier[1].in_features, 4)
eye_model.load_state_dict(torch.load("models/eye_model_best.pth", map_location=device))
eye_model.to(device).eval()

skin_model = models.efficientnet_b0(weights=None)
skin_model.classifier[1] = nn.Linear(skin_model.classifier[1].in_features, len(skin_label2idx))
skin_model.load_state_dict(torch.load("models/skin_model_best.pth", map_location=device))
skin_model.to(device).eval()

blood_model  = joblib.load("models/blood_model.pkl")
blood_scaler = joblib.load("models/blood_scaler.pkl")

print("✅ All models loaded!")

# ── BLOCKCHAIN ────────────────────────────────────────────────
class Block:
    def __init__(self, index, data, previous_hash):
        self.index = index
        self.timestamp = str(datetime.datetime.now())
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "data": self.data,
            "previous_hash": self.previous_hash
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

class MediChainBlockchain:
    def __init__(self):
        self.chain = [self._genesis()]

    def _genesis(self):
        return Block(0, {"type": "GENESIS", "message": "MediChain AI"}, "0")

    def add_record(self, data):
        block = Block(len(self.chain), data, self.chain[-1].hash)
        self.chain.append(block)
        return block

    def get_record(self, patient_id):
        for block in self.chain:
            if block.data.get("patient_id") == patient_id:
                return block
        return None

    def is_valid(self):
        for i in range(1, len(self.chain)):
            if self.chain[i].hash != self.chain[i].calculate_hash():
                return False
            if self.chain[i].previous_hash != self.chain[i-1].hash:
                return False
        return True

blockchain = MediChainBlockchain()

# ── TRANSFORMS ────────────────────────────────────────────────
img_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ── INFERENCE ─────────────────────────────────────────────────
def analyze_image(model, idx2label, image_path):
    img = Image.open(image_path).convert("RGB")
    tensor = img_transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        outputs = model(tensor)
        probs = torch.softmax(outputs, dim=1)
        conf, pred = torch.max(probs, 1)
    disease = idx2label[pred.item()]
    return {
        "disease": disease,
        "confidence": round(conf.item() * 100, 2),
        "all_probabilities": {idx2label[i]: round(probs[0][i].item() * 100, 2)
                               for i in range(len(idx2label))},
        "risk_level": "HIGH" if disease != "normal" else "LOW"
    }

# ── ROUTES ────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "MediChain AI is running ✅", "blockchain_valid": blockchain.is_valid()}

@app.post("/analyze/eye")
async def analyze_eye(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    try:
        result = analyze_image(eye_model, eye_idx2label, tmp_path)
        return result
    finally:
        os.unlink(tmp_path)

@app.post("/analyze/skin")
async def analyze_skin(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    try:
        result = analyze_image(skin_model, skin_idx2label, tmp_path)
        return result
    finally:
        os.unlink(tmp_path)

class BloodParams(BaseModel):
    recency: float
    frequency: float
    monetary: float
    time_months: float

@app.post("/analyze/blood")
def analyze_blood(params: BloodParams):
    features = np.array([[
        params.recency, params.frequency,
        params.monetary, params.time_months,
        params.frequency / (params.time_months + 1),
        params.monetary / (params.frequency + 1),
        params.recency / (params.time_months + 1)
    ]])
    features_scaled = blood_scaler.transform(features)
    prediction = blood_model.predict(features_scaled)[0]
    probability = blood_model.predict_proba(features_scaled)[0]
    return {
        "suitable_for_donation": bool(prediction),
        "donation_probability": round(probability[1] * 100, 2),
        "risk_level": "LOW" if prediction == 1 else "HIGH",
        "recommendation": "APPROVED" if prediction == 1 else "NOT RECOMMENDED"
    }

class PatientRecord(BaseModel):
    patient_id: str
    name: str
    age: int
    blood_group: str
    allergies: list
    chronic_diseases: list
    past_surgeries: list
    emergency_contact: str
    hospital: str

@app.post("/patient/register")
def register_patient(patient: PatientRecord):
    existing = blockchain.get_record(patient.patient_id)
    if existing:
        raise HTTPException(400, "Patient already registered")
    data = patient.dict()
    data["type"] = "PATIENT_RECORD"
    block = blockchain.add_record(data)

    # Generate QR
    qr_data = json.dumps({
        "patient_id": patient.patient_id,
        "name": patient.name,
        "block_hash": block.hash,
        "network": "MediChain AI"
    })
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    return {
        "message": "Patient registered successfully",
        "block_index": block.index,
        "block_hash": block.hash,
        "qr_code": qr_base64
    }

@app.get("/patient/{patient_id}")
def get_patient(patient_id: str):
    block = blockchain.get_record(patient_id)
    if not block:
        raise HTTPException(404, "Patient not found")
    return {
        "patient_data": block.data,
        "block_index": block.index,
        "block_hash": block.hash,
        "timestamp": block.timestamp,
        "blockchain_valid": blockchain.is_valid()
    }

@app.get("/blockchain/status")
def blockchain_status():
    return {
        "total_blocks": len(blockchain.chain),
        "is_valid": blockchain.is_valid(),
        "total_patients": len([b for b in blockchain.chain if b.data.get("type") == "PATIENT_RECORD"])
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
