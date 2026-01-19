async function uploadTryOn() {
  const modelInput = document.getElementById("model");
  const clothingInput = document.getElementById("clothing");
  const poseInput = document.getElementById("pose");
  const backgroundInput = document.getElementById("background");

  const status = document.getElementById("status");
  const modelPreview = document.getElementById("modelPreview");
  const clothingPreview = document.getElementById("clothingPreview");
  const resultImg = document.getElementById("result");
  const downloadBtn = document.getElementById("downloadBtn");

  const modelFile = modelInput.files[0];
  const clothingFile = clothingInput.files[0];

  // --------------------
  // Validation
  // --------------------
  if (!modelFile || !clothingFile) {
    alert("Please upload both a model image and a clothing image.");
    return;
  }

  if (!modelFile.type.startsWith("image/") || !clothingFile.type.startsWith("image/")) {
    alert("Both files must be images.");
    return;
  }

  // --------------------
  // Previews
  // --------------------
  modelPreview.src = URL.createObjectURL(modelFile);
  clothingPreview.src = URL.createObjectURL(clothingFile);

  resultImg.src = "";
  downloadBtn.style.display = "none";

  // --------------------
  // Build form data
  // --------------------
  const formData = new FormData();
  formData.append("model", modelFile);
  formData.append("clothing", clothingFile);
  formData.append("pose", poseInput?.value || "full body, front view");
  formData.append("background", backgroundInput?.value || "minimalistic studio");

  status.textContent = "⏳ Uploading and processing...";

  // --------------------
  // Send request
  // --------------------
  try {
    const res = await fetch("https://api.thechangingroom.shop/tryon", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Server error");
    }

    const data = await res.json();

    if (!data.result_url) {
      throw new Error("No result image returned from server.");
    }

    // --------------------
    // Show result
    // --------------------
    resultImg.src = data.result_url;
    status.textContent = "✅ Try-On Generated!";

    // --------------------
    // Download button
    // --------------------
    downloadBtn.style.display = "inline-block";
    downloadBtn.onclick = async () => {
      const response = await fetch(data.result_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "try_on.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    };

  } catch (err) {
    console.error("TRY-ON ERROR:", err);
    status.textContent = "❌ " + err.message;
  }
}
