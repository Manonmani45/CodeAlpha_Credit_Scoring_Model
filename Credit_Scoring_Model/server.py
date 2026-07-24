"""
Flask Server for Credit Risk Scoring Web Application
Serves static web files and provides ML inference API via credit_risk_model.pkl
"""

import sys
import os
import pickle
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Ensure UTF-8 output encoding for Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__, static_folder=".")
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "credit_risk_model.pkl")
model = None

# Attempt loading model
if os.path.exists(MODEL_PATH):
    try:
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
        print("[INFO] Random Forest model loaded successfully from credit_risk_model.pkl")
    except Exception as e:
        print(f"[WARN] Error loading credit_risk_model.pkl: {e}. Fallback ML engine active.")
else:
    print("[WARN] Model file not found at path. Fallback ML engine active.")


@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)


@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        data = request.json or {}

        # 20 Features expected by German Credit model
        feature_order = [
            'status', 'duration', 'credit_history', 'purpose', 'amount',
            'savings', 'employment_duration', 'installment_rate', 'personal_status',
            'other_debtors', 'present_residence', 'property', 'age', 'other_installment',
            'housing', 'existing_credits', 'job', 'dependents', 'telephone', 'foreign_worker'
        ]

        input_vec = [float(data.get(feat, 0)) for feat in feature_order]
        input_arr = np.array([input_vec])

        if model is not None:
            prediction = int(model.predict(input_arr)[0])
            prob = model.predict_proba(input_arr)[0]
            probability = float(prob[1]) if len(prob) > 1 else (1.0 if prediction == 1 else 0.2)
        else:
            status = data.get('status', 0)
            history = data.get('credit_history', 0)
            amount = data.get('amount', 0)
            duration = data.get('duration', 0)
            
            score_factor = 50 + (status * 10) + (history * 8) - (amount / 1000) - (duration / 6)
            probability = max(0.1, min(0.95, score_factor / 100.0))
            prediction = 1 if probability >= 0.5 else 0

        is_good = (prediction == 1)
        credit_score = int(300 + probability * 550)
        max_loan = int((credit_score / 850.0) * 50000) if is_good else 5000

        return jsonify({
            "status": "success",
            "prediction": prediction,
            "risk_label": "Low Risk (Good)" if is_good else "High Risk (Bad)",
            "credit_score": credit_score,
            "probability": round(probability, 2),
            "max_loan_limit": max_loan,
            "recommendation": (
                "Eligible for instant approval on premium personal and auto credit products with low APR."
                if is_good else
                "Requires additional collateral or co-signer due to elevated credit risk indicators."
            )
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"[START] Starting Credit Risk Intelligence Web App on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
