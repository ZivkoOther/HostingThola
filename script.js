async function uploadTryOn() {
  const model = document.getElementById("model").files[0];
  const clothing = document.getElementById("clothing").files[0];
  const status = document.getElementById("status");
  const resultImg = document.getElementById("result");
  const modelImage = document.getElementById("modelPreview")
  const clothingImage = document.getElementById("clothingPreview")

  modelImage.src = URL.createObjectURL(model);
  clothingImage.src = URL.createObjectURL(clothing);

  if (!model || !clothing) {
    alert("Upload both images");
    return;
  }

  const formData = new FormData();
  formData.append("model", model);
  formData.append("clothing", clothing);

  status.textContent = "Uploading...";

  const res = await fetch("https://api.thechangingroom.shop/tryon", {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error("Upload failed");

  const data = await res.json();
  const jobId = data.job_id;

  status.textContent = "Generating try-on...";

  const interval = setInterval(async () => {
    const res = await fetch(
      `https://api.thechangingroom.shop/result/${jobId}`
    );
    const data = await res.json();

    if (data.status === "COMPLETED") {
      clearInterval(interval);
      resultImg.src = data.result_url;
      status.textContent = "✅ Done!";
    }
  }, 4000);
}
