import sys
import json
import os
import requests
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

# Silence matplotlib import from the training script; not needed in server mode

API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
API_PARAMS = {
    "api-key": "579b464db66ec23bdd000001c3a5347951df4af851d6db109e149101",
    "format": "json",
    "limit": 1000
}

MODEL_PATH = os.path.join(os.path.dirname(__file__), "price_anomaly_model.pkl")
# Store training-time modal max to mirror user's normalization logic
TRAIN_MODAL_MAX = None


def fetch_agmark_data():
    resp = requests.get(API_URL, params=API_PARAMS, timeout=20)
    resp.raise_for_status()
    data = resp.json().get("records", [])
    return pd.DataFrame(data)


def ensure_model():
    """
    Load model if present; otherwise train quickly and save.
    """
    global TRAIN_MODAL_MAX
    if os.path.exists(MODEL_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            # best effort: recompute TRAIN_MODAL_MAX so normalization matches training scale
            try:
                df_re = fetch_agmark_data()
                for col in ["modal_price"]:
                    df_re[col] = pd.to_numeric(df_re[col], errors="coerce")
                df_re = df_re.dropna(subset=["modal_price"]).reset_index(drop=True)
                TRAIN_MODAL_MAX = float(df_re["modal_price"].max()) if not df_re.empty else None
            except Exception:
                TRAIN_MODAL_MAX = None
            return model
        except Exception:
            pass

    df = fetch_agmark_data()
    if df.empty:
        # Fallback: create a very small dummy model to avoid crashing
        dummy = IsolationForest(contamination=0.05, random_state=42)
        dummy.fit([[0, 0, 0, 0, 0, 0]])
        joblib.dump(dummy, MODEL_PATH)
        return dummy

    for col in ["modal_price", "min_price", "max_price"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna(subset=["modal_price", "min_price", "max_price"]).reset_index(drop=True)
    if df.empty:
        dummy = IsolationForest(contamination=0.05, random_state=42)
        dummy.fit([[0, 0, 0, 0, 0, 0]])
        joblib.dump(dummy, MODEL_PATH)
        return dummy

    df["price_range"] = df["max_price"] - df["min_price"]
    df["price_spread"] = (df["max_price"] - df["modal_price"]) / df["modal_price"]
    TRAIN_MODAL_MAX = float(df["modal_price"].max())
    df["normalized_modal"] = df["modal_price"] / TRAIN_MODAL_MAX if TRAIN_MODAL_MAX else 0.0
    X = df[["modal_price", "min_price", "max_price", "price_range", "price_spread", "normalized_modal"]]

    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(X)
    joblib.dump(model, MODEL_PATH)
    return model


MODEL = ensure_model()


def detect_price_fraud(commodity, state, district, market, vendor_price):
    try:
        records = fetch_agmark_data()
    except Exception as e:
        return {"status": "error", "message": f"API fetch failed: {str(e)}"}

    if records.empty:
        return {"status": "error", "message": "No records returned from API."}

    required_cols = ["modal_price", "min_price", "max_price", "commodity", "state", "district", "market"]
    for col in required_cols:
        if col not in records.columns:
            return {"status": "error", "message": f"Required column '{col}' missing from API data."}

    for col in ["modal_price", "min_price", "max_price"]:
        records[col] = pd.to_numeric(records[col], errors="coerce")

    commodity_norm = commodity.strip().lower()
    state_norm = state.strip().lower()
    district_norm = district.strip().lower()
    market_norm = market.strip().lower()

    records["commodity"] = records["commodity"].str.strip().str.lower()
    records["state"] = records["state"].str.strip().str.lower()
    records["district"] = records["district"].str.strip().str.lower()
    records["market"] = records["market"].str.strip().str.lower()

    mask = (
        (records["commodity"] == commodity_norm) &
        (records["state"] == state_norm) &
        (records["district"] == district_norm) &
        (records["market"] == market_norm)
    )
    latest = records[mask].sort_values("arrival_date", ascending=False)

    if latest.empty:
        return {"status": "error", "message": "No market data available."}

    row = latest.iloc[0]
    modal = float(row["modal_price"])
    min_p = float(row["min_price"])
    max_p = float(row["max_price"])

    try:
        vp = float(vendor_price)
    except Exception:
        return {"status": "error", "message": "Invalid vendor_price"}

    # Business rule: > 10% higher than modal => reject
    if vp > modal * 1.10:
        return {
            "status": "reject",
            "reason": ">10% higher than modal price",
            "market_modal_price": modal,
            "vendor_price": vp
        }

    price_range = max_p - min_p
    price_spread = (vp - modal) / modal
    # Use training-time modal max to mirror user's script normalization
    denom = TRAIN_MODAL_MAX
    normalized_modal = (modal / denom) if denom and denom != 0 else 0.0

    features = pd.DataFrame([{
        "modal_price": modal,
        "min_price": min_p,
        "max_price": vp,
        "price_range": price_range,
        "price_spread": price_spread,
        "normalized_modal": normalized_modal
    }])

    try:
        pred = MODEL.predict(features)[0]
    except Exception as e:
        return {"status": "error", "message": f"Model prediction failed: {str(e)}"}

    if pred == -1:
        return {
            "status": "reject",
            "reason": "Price flagged as anomaly by ML",
            "market_modal_price": modal,
            "vendor_price": vp
        }

    return {
        "status": "accept",
        "reason": "Within 10% and not anomalous",
        "market_modal_price": modal,
        "vendor_price": vp
    }


def main():
    # CLI usage: python price_model.py check '{"commodity":"Wheat","state":"Karnataka","district":"Bengaluru","market":"Yeshwanthpur","vendor_price":1200}'
    if len(sys.argv) < 3:
        print(json.dumps({"status": "error", "message": "Invalid arguments"}))
        return
    command = sys.argv[1]
    payload_raw = sys.argv[2]
    try:
        payload = json.loads(payload_raw)
    except Exception:
        print(json.dumps({"status": "error", "message": "Invalid JSON payload"}))
        return

    if command == "check":
        result = detect_price_fraud(
            commodity=payload.get("commodity", ""),
            state=payload.get("state", ""),
            district=payload.get("district", ""),
            market=payload.get("market", ""),
            vendor_price=payload.get("vendor_price", 0),
        )
        print(json.dumps(result))
        return

    print(json.dumps({"status": "error", "message": "Unknown command"}))


if __name__ == "__main__":
    main()


