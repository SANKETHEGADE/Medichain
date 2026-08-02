from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np
import pickle
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
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.exceptions import InvalidSignature

app = FastAPI(title="MediChain AI", version="2.0.0")

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

eye_labels     = torch.load("models/eye_labels.pth",  map_location=device)
skin_labels    = torch.load("models/skin_labels.pth", map_location=device)
eye_idx2label  = eye_labels["idx2label"]
skin_idx2label = skin_labels["idx2label"]
skin_label2idx = skin_labels["label2idx"]

eye_model = models.efficientnet_b0(weights=None)
eye_model.classifier[1] = nn.Linear(eye_model.classifier[1].in_features, 4)
eye_model.load_state_dict(torch.load("models/eye_model_best.pth", map_location=device))
eye_model.to(device).eval()

skin_model = models.efficientnet_b0(weights=None)
skin_model.classifier[1] = nn.Linear(skin_model.classifier[1].in_features, len(skin_label2idx))
skin_model.load_state_dict(torch.load("models/skin_model_best.pth", map_location=device))
skin_model.to(device).eval()

with open("models/blood_model_local.pkl", "rb") as f:
    blood_model = pickle.load(f)
with open("models/blood_scaler_local.pkl", "rb") as f:
    blood_scaler = pickle.load(f)

print("✅ All models loaded!")

# ── RSA KEY GENERATION ────────────────────────────────────────
print("Generating RSA keys...")
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key  = private_key.public_key()

def sign_data(data: dict) -> str:
    message = json.dumps(data, sort_keys=True).encode()
    signature = private_key.sign(message, padding.PSS(
        mgf=padding.MGF1(hashes.SHA256()),
        salt_length=padding.PSS.MAX_LENGTH
    ), hashes.SHA256())
    return base64.b64encode(signature).decode()

def verify_signature(data: dict, signature: str) -> bool:
    try:
        message = json.dumps(data, sort_keys=True).encode()
        public_key.verify(
            base64.b64decode(signature),
            message,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256()
        )
        return True
    except InvalidSignature:
        return False

print("✅ RSA keys ready!")

# ── MERKLE TREE ───────────────────────────────────────────────
def merkle_root(transactions: list) -> str:
    if not transactions:
        return hashlib.sha256(b"empty").hexdigest()
    hashes = [hashlib.sha256(json.dumps(t, sort_keys=True).encode()).hexdigest()
              for t in transactions]
    while len(hashes) > 1:
        if len(hashes) % 2 != 0:
            hashes.append(hashes[-1])
        hashes = [
            hashlib.sha256((hashes[i] + hashes[i+1]).encode()).hexdigest()
            for i in range(0, len(hashes), 2)
        ]
    return hashes[0]

# ── PROOF OF WORK ─────────────────────────────────────────────
DIFFICULTY = 3  # number of leading zeros required

def proof_of_work(block_string: str, difficulty: int = DIFFICULTY) -> tuple[str, int]:
    nonce = 0
    prefix = "0" * difficulty
    while True:
        hash_attempt = hashlib.sha256(f"{block_string}{nonce}".encode()).hexdigest()
        if hash_attempt.startswith(prefix):
            return hash_attempt, nonce
        nonce += 1

# ── ADVANCED BLOCKCHAIN ───────────────────────────────────────
class Block:
    def __init__(self, index, transactions, previous_hash, miner="MediChain-Node-1"):
        self.index         = index
        self.timestamp     = str(datetime.datetime.now())
        self.transactions  = transactions
        self.previous_hash = previous_hash
        self.miner         = miner
        self.merkle_root   = merkle_root(transactions)
        self.difficulty    = DIFFICULTY
        self.nonce         = 0
        self.hash          = ""
        self._mine()

    def _mine(self):
        block_str = json.dumps({
            "index":         self.index,
            "timestamp":     self.timestamp,
            "merkle_root":   self.merkle_root,
            "previous_hash": self.previous_hash,
            "difficulty":    self.difficulty,
        }, sort_keys=True)
        self.hash, self.nonce = proof_of_work(block_str, self.difficulty)
        print(f"  ⛏ Block #{self.index} mined | nonce={self.nonce} | hash={self.hash[:16]}...")

    def to_dict(self):
        return {
            "index":         self.index,
            "timestamp":     self.timestamp,
            "transactions":  self.transactions,
            "previous_hash": self.previous_hash,
            "merkle_root":   self.merkle_root,
            "difficulty":    self.difficulty,
            "nonce":         self.nonce,
            "hash":          self.hash,
            "miner":         self.miner,
        }

    def is_valid_pow(self) -> bool:
        block_str = json.dumps({
            "index":         self.index,
            "timestamp":     self.timestamp,
            "merkle_root":   self.merkle_root,
            "previous_hash": self.previous_hash,
            "difficulty":    self.difficulty,
        }, sort_keys=True)
        recalc = hashlib.sha256(f"{block_str}{self.nonce}".encode()).hexdigest()
        return recalc == self.hash and self.hash.startswith("0" * self.difficulty)


class MediChainBlockchain:
    def __init__(self, storage_path="blockchain_data.json"):
        self.storage_path = storage_path
        self.chain: list[Block] = []
        self.pending_transactions: list[dict] = []
        self._load()
        if not self.chain:
            self._create_genesis()

    def _create_genesis(self):
        genesis = Block(0, [{"type": "GENESIS", "message": "MediChain AI v2.0 — Advanced Blockchain"}], "0")
        self.chain.append(genesis)
        self._save()
        print("✅ Genesis block created!")

    def _load(self):
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r") as f:
                    data = json.load(f)
                for b in data:
                    block = Block.__new__(Block)
                    block.index         = b["index"]
                    block.timestamp     = b["timestamp"]
                    block.transactions  = b["transactions"]
                    block.previous_hash = b["previous_hash"]
                    block.merkle_root   = b["merkle_root"]
                    block.difficulty    = b["difficulty"]
                    block.nonce         = b["nonce"]
                    block.hash          = b["hash"]
                    block.miner         = b.get("miner", "MediChain-Node-1")
                    self.chain.append(block)
                print(f"✅ Loaded {len(self.chain)} blocks from storage")
            except Exception as e:
                print(f"Starting fresh: {e}")
                self.chain = []

    def _save(self):
        with open(self.storage_path, "w") as f:
            json.dump([b.to_dict() for b in self.chain], f, indent=2)

    def add_transaction(self, transaction: dict) -> int:
        transaction["tx_id"] = hashlib.sha256(
            json.dumps(transaction, sort_keys=True).encode()
        ).hexdigest()[:16]
        transaction["timestamp"] = str(datetime.datetime.now())
        self.pending_transactions.append(transaction)
        return len(self.pending_transactions)

    def mine_pending(self) -> Block:
        if not self.pending_transactions:
            raise ValueError("No pending transactions")
        block = Block(
            index=len(self.chain),
            transactions=self.pending_transactions.copy(),
            previous_hash=self.chain[-1].hash
        )
        self.chain.append(block)
        self.pending_transactions = []
        self._save()
        return block

    def get_patient(self, patient_id: str) -> dict | None:
        for block in self.chain:
            for tx in block.transactions:
                if tx.get("patient_id") == patient_id:
                    return {"transaction": tx, "block": block.to_dict()}
        return None

    def validate_chain(self) -> dict:
        issues = []
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i - 1]

            # Check previous hash linkage
            if curr.previous_hash != prev.hash:
                issues.append(f"Block #{i}: broken chain link")

            # Check PoW
            if not curr.is_valid_pow():
                issues.append(f"Block #{i}: invalid proof of work")

            # Check merkle root
            if curr.merkle_root != merkle_root(curr.transactions):
                issues.append(f"Block #{i}: merkle root mismatch (data tampered)")

        return {
            "is_valid": len(issues) == 0,
            "total_blocks": len(self.chain),
            "issues": issues,
            "difficulty": DIFFICULTY
        }

    def get_chain_data(self) -> list:
        return [b.to_dict() for b in self.chain]


blockchain = MediChainBlockchain()
print("✅ Advanced blockchain ready!")

# ── TRANSFORMS ────────────────────────────────────────────────
img_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

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
    validation = blockchain.validate_chain()
    return {
        "message": "MediChain AI v2.0 ✅",
        "blockchain": validation,
        "pending_transactions": len(blockchain.pending_transactions)
    }

@app.post("/analyze/eye")
async def analyze_eye(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    try:
        return analyze_image(eye_model, eye_idx2label, tmp_path)
    finally:
        os.unlink(tmp_path)

@app.post("/analyze/skin")
async def analyze_skin(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    try:
        return analyze_image(skin_model, skin_idx2label, tmp_path)
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
    existing = blockchain.get_patient(patient.patient_id)
    if existing:
        raise HTTPException(400, "Patient already registered")

    data = patient.dict()
    data["type"] = "PATIENT_RECORD"

    # Sign the record
    signature = sign_data(data)
    data["signature"] = signature
    data["signed_by"]  = "MediChain-Authority"

    # Add to pending + mine
    blockchain.add_transaction(data)
    block = blockchain.mine_pending()

    # Generate QR
    qr_data = json.dumps({
        "patient_id": patient.patient_id,
        "name":       patient.name,
        "block_hash": block.hash,
        "tx_id":      data.get("tx_id", ""),
        "network":    "MediChain AI v2.0"
    })
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    # Verify signature
    sig_valid = verify_signature(
        {k: v for k, v in data.items() if k not in ["signature", "tx_id", "timestamp"]},
        signature
    )

    return {
        "message":         "Patient registered on blockchain",
        "block_index":     block.index,
        "block_hash":      block.hash,
        "merkle_root":     block.merkle_root,
        "nonce":           block.nonce,
        "difficulty":      block.difficulty,
        "tx_id":           data.get("tx_id"),
        "signature_valid": sig_valid,
        "qr_code":         qr_base64
    }

@app.get("/patient/{patient_id}")
def get_patient(patient_id: str):
    result = blockchain.get_patient(patient_id)
    if not result:
        raise HTTPException(404, "Patient not found")

    tx   = result["transaction"]
    blk  = result["block"]

    # Verify signature
    sig  = tx.get("signature", "")
    data_to_verify = {k: v for k, v in tx.items()
                      if k not in ["signature", "tx_id", "timestamp"]}
    sig_valid = verify_signature(data_to_verify, sig) if sig else False

    validation = blockchain.validate_chain()

    return {
        "patient_data":      tx,
        "block_index":       blk["index"],
        "block_hash":        blk["hash"],
        "block_timestamp":   blk["timestamp"],
        "merkle_root":       blk["merkle_root"],
        "nonce":             blk["nonce"],
        "difficulty":        blk["difficulty"],
        "miner":             blk["miner"],
        "signature_valid":   sig_valid,
        "blockchain_valid":  validation["is_valid"],
        "tx_id":             tx.get("tx_id")
    }

@app.get("/blockchain/status")
def blockchain_status():
    validation = blockchain.validate_chain()
    total_patients = sum(
        1 for b in blockchain.chain
        for tx in b.transactions
        if tx.get("type") == "PATIENT_RECORD"
    )
    return {
        "total_blocks":       len(blockchain.chain),
        "total_patients":     total_patients,
        "is_valid":           validation["is_valid"],
        "difficulty":         DIFFICULTY,
        "issues":             validation["issues"],
        "pending_tx":         len(blockchain.pending_transactions),
        "algorithm":          "SHA-256 + Proof of Work + Merkle Tree + RSA Signatures",
    }

@app.get("/blockchain/explorer")
def blockchain_explorer():
    chain = blockchain.get_chain_data()
    return {
        "chain":        chain,
        "total_blocks": len(chain),
        "difficulty":   DIFFICULTY
    }

@app.get("/blockchain/validate")
def validate_chain():
    return blockchain.validate_chain()

@app.delete("/blockchain/clear")
def clear_blockchain():
    blockchain.chain = []
    blockchain.pending_transactions = []
    blockchain._create_genesis()
    return {"message": "Blockchain reset — new genesis block created"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
