from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os, uuid, time, requests

# --------------------
# CONFIG
# --------------------
API_KEY = os.environ("ClaidApi")  # Replace with your Claid API key
BASE_URL = "https://api.claid.ai/v1/image/ai-fashion-models"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --------------------
# APP SETUP
# --------------------
app = Flask(__name__)
CORS(app)  # allow requests from dashboard frontend

# --------------------
# ROUTES
# --------------------

# Root (simple health check)
@app.route("/")
def home():
    return "Backend running ✅"

# Serve uploaded images
@app.route("/images/<filename>")
def serve_image(filename):
    return send_from_directory(UPLOAD_DIR, filename)

# Debug: log every request
@app.before_request
def log_request_info():
    print("\n--- New request ---")
    print("Path:", request.path)
    print("Method:", request.method)
    print("Files:", request.files)
    print("Form:", request.form)

# Upload + Try-On endpoint
@app.route("/tryon", methods=["POST"])
def tryon():
    model_file = request.files.get("model")
    clothing_file = request.files.get("clothing")

    if not model_file or not clothing_file:
        return jsonify({"error": "Both model and clothing files required"}), 400

    # Save uploaded files
    model_filename = f"{uuid.uuid4()}{os.path.splitext(model_file.filename)[1]}"
    clothing_filename = f"{uuid.uuid4()}{os.path.splitext(clothing_file.filename)[1]}"
    model_path = os.path.join(UPLOAD_DIR, model_filename)
    clothing_path = os.path.join(UPLOAD_DIR, clothing_filename)
    model_file.save(model_path)
    clothing_file.save(clothing_path)

    # Public URLs for dashboard
    domain_url = request.url_root[:-1]  # will be https://thechangingroom.shop
    model_url = f"/images/{model_filename}"
    clothing_url = f"/images/{clothing_filename}"

    # Optional pose/background
    pose = request.form.get("pose", "full body, front view")
    background = request.form.get("background", "minimalistic studio, realistic")

    # Submit to Claid
    payload = {
        "input": {"model": domain_url + model_url, "clothing": [domain_url + clothing_url]},
        "options": {"pose": pose, "background": background},
        "output": {"format": "png", "number_of_images": 1}
    }

    print("Submitting to Claid:", payload)
    resp = requests.post(BASE_URL, json=payload, headers=HEADERS)

    if resp.status_code != 200:
        print("Claid submission failed:", resp.text)
        return jsonify({"error": "Claid submission failed"}), 500

    job_info = resp.json()
    task_id = job_info.get("id")
    result_url = None

    # Poll Claid for result (~1 min max)
    for _ in range(30):
        status_resp = requests.get(f"{BASE_URL}/{task_id}", headers=HEADERS)
        status_info = status_resp.json()
        if status_info.get("status") == "DONE":
            result_url = status_info["result"]["output_objects"][0]["tmp_url"]
            break
        elif status_info.get("status") == "ERROR":
            return jsonify({"error": "Claid processing failed"}), 500
        time.sleep(2)

    if not result_url:
        return jsonify({"error": "Claid processing timed out"}), 500

    return jsonify({
        "message": "Try-On generated successfully",
        "model_url": model_url,
        "clothing_url": clothing_url,
        "result_url": result_url
    })

# --------------------
# RUN
# --------------------
if __name__ == "__main__":
    # Production-ready: listen on all interfaces
    app.run(host="0.0.0.0", port=3000, debug=True)
