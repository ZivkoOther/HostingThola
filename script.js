async function uploadTryOn() {
    const modelFile = document.getElementById("model").files[0];
    const clothingFile = document.getElementById("clothing").files[0];

    if (!modelFile || !clothingFile) {
        alert("Please select both model and clothing images");
        return;
    }

    const form = new FormData();
    form.append("model", modelFile);
    form.append("clothing", clothingFile);
    form.append("pose", document.getElementById("pose").value);
    form.append("background", document.getElementById("background").value);

    const domain = "https://thechangingroom.shop";
    document.getElementById("status").textContent = "⏳ Uploading...";

    try {
        const res = await fetch(`${domain}/tryon`, {
            method: "POST",
            body: form
        });

        const data = await res.json();
        console.log("Response:", data);

        if (!res.ok || data.error) {
            document.getElementById("status").textContent =
                "❌ " + (data.error || "Try-on failed");
            return;
        }

        if (data.model_url) {
            document.getElementById("modelPreview").src = domain + data.model_url;
        }

        if (data.clothing_url) {
            document.getElementById("clothingPreview").src = domain + data.clothing_url;
        }

        if (data.result_url) {
            document.getElementById("result").src = data.result_url;
            document.getElementById("status").textContent = "✅ Try-On Generated!";

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
            document.getElementById("status").textContent =
                "⏳ Processing with Claid...";
        }

    } catch (err) {
        console.error(err);
        document.getElementById("status").textContent =
            "❌ Network or server error";
    }
}
