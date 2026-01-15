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

    const domain = "https://thechangingroom.shop"; // your live domain
    console.log("Uploading to:", `${domain}/tryon`);
    console.log("FormData keys:", [...form.entries()]);

    try {
        const res = await fetch(`${domain}/tryon`, {
            method: "POST",
            body: form
        });

        console.log("Raw response status:", res.status);
        const text = await res.clone().text();
        console.log("Raw response text:", text);

        const data = await res.json();
        console.log("Parsed JSON:", data);

        // Full public URLs for preview
        const fullModelURL = domain + data.model_url;
        const fullClothingURL = domain + data.clothing_url;
        document.getElementById("modelPreview").src = fullModelURL;
        document.getElementById("clothingPreview").src = fullClothingURL;

        // Show Claid result
        if (data.result_url) {
            document.getElementById("result").src = data.result_url;
            document.getElementById("status").textContent = "✅ Try-On Generated!";

            // Make result downloadable
            const downloadBtn = document.getElementById("downloadBtn");
            downloadBtn.style.display = "inline-block";
            downloadBtn.onclick = async () => {
                const imageResp = await fetch(data.result_url);
                const blob = await imageResp.blob();
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = "try_on.png";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };
        } else {
            document.getElementById("status").textContent = "✅ Upload successful! Waiting for Claid result...";
        }

    } catch (err) {
        console.error("Upload failed:", err);
        document.getElementById("status").textContent = "❌ Upload failed. Check console.";
    }
}
