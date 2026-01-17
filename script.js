async function uploadTryOn() {
  const modelFile = document.getElementById("model").files[0];
  const clothingUrl = document.getElementById("clothing").value;
  const pose = document.getElementById("pose").value;
  const background = document.getElementById("background").value;
  const status = document.getElementById("status");

  if (!modelFile || !clothingUrl) {
    alert("Please select a model file and enter a clothing URL");
    return;
  }

  const form = new FormData();
  form.append("model", modelFile);
  form.append("clothing", clothingUrl);
  form.append("pose", pose);
  form.append("background", background);

  status.textContent = "⏳ Uploading...";

  try {
    const res = await fetch("https://api.thechangingroom.shop/tryon", {
      method: "POST",
      body: form
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    const data = await res.json();

    if (data.model_url) document.getElementById("modelPreview").src = data.model_url;
    if (data.clothing_url) document.getElementById("clothingPreview").src = data.clothing_url;

    if (data.result_url) {
      document.getElementById("result").src = data.result_url;
      status.textContent = "✅ Try-On Generated!";

      const downloadBtn = document.getElementById("downloadBtn");
      downloadBtn.style.display = "inline-block";
      downloadBtn.onclick = async () => {
        const img = await fetch(data.result_url);
        const blob = await img.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "try_on.png";
        a.click();
        URL.revokeObjectURL(url);
      };
    } else {
      status.textContent = "⏳ Processing with Claid...";
    }

  } catch (err) {
    console.error(err);
    status.textContent = "❌ " + err.message;
  }
}
