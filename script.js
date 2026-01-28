async function uploadTryOn() {
  const model = document.getElementById("model").files[0];
  const clothing = document.getElementById("clothing").files[0];
  const status = document.getElementById("status");
  const resultImg = document.getElementById("result");
  const modelImage = document.getElementById("modelPreview");
  const clothingImage = document.getElementById("clothingPreview");

  if (!model || !clothing) {
    alert("Select both images");
    return;
  }

  // preview
  modelImage.hidden = false;
  clothingImage.hidden = false;

  const modelURL = URL.createObjectURL(model);
  const clothingURL = URL.createObjectURL(clothing);

  modelImage.src = modelURL;
  clothingImage.src = clothingURL;

  const formData = new FormData();
  formData.append("model", model);
  formData.append("clothing", clothing);

  try {
    status.textContent = "Uploading...";

    const res = await fetch("https://api.thechangingroom.shop/tryon", {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Upload failed");

    const { job_id } = await res.json();
    status.textContent = "Generating try-on...";

    let attempts = 0;
    const maxAttempts = 30; // 30 * 4s = 2 minutes

    const interval = setInterval(async () => {
      try {
        attempts++;

        const res = await fetch(
          `https://api.thechangingroom.shop/result/${job_id}`
        );
        if (!res.ok) throw new Error("Polling failed");

        const data = await res.json();

        if (data.status === "COMPLETED") {
          clearInterval(interval);
          resultImg.src = data.result_url;
          status.textContent = "✅ Done!";
          URL.revokeObjectURL(modelURL);
          URL.revokeObjectURL(clothingURL);
        }

        if (data.status === "FAILED") {
          clearInterval(interval);
          status.textContent = "❌ Generation failed";
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          status.textContent = "⏰ Timed out";
        }

      } catch (err) {
        clearInterval(interval);
        status.textContent = "❌ Error while polling";
        console.error(err);
      }
    }, 4000);

  } catch (err) {
    status.textContent = "❌ Upload error";
    console.error(err);
  }
}
