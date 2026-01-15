async function uploadTryOn() {
    const modelFile = document.getElementById("model").files[0];
    const clothingFile = document.getElementById("clothing").files[0];

    if (!modelFile || !clothingFile) {
        alert("Please select both model and clothing images");
        return;
    }

    // Prepare form data
    const form = new FormData();
    form.append("model", modelFile);
    form.append("clothing", clothingFile);
    form.append("pose", document.getElementById("pose").value);
    form.append("background", document.getElementById("background").value);

    // Use your deployed domain
    const domain = "https://thechangingroom.shop";
    const endpoint = `${domain}/tryon`;

    console.log("Uploading to:", endpoint);
    console.log("FormData keys:", [...form.entries()]);

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            body: form
        });

        console.log("Raw response status:", res.status);
        const text = await res.clone().text();
        console.log("Raw response text:", text);

        const data = await res.json();
        console.log("Parsed JSON:", data);

        // Construct full public URLs for previews
        const modelPreviewURL = domain + data.model_url;
        const clothingPreviewURL = domain + data.clothing_url;

        document.getElementById("modelPreview").src = modelPreviewURL;
        document.getElementById("clothingPreview").src = clothingPreviewURL;

        // Show Claid result if available
        if (data.result_url) {
            document.getElementById("result").src = data.result_url;
            document.getElementById("status").textContent = "✅ Try-On Generated!";
        } else {
            document.getElementById("status").textContent = "✅ Upload successful! Waiting for Claid result...";
        }

    } catch (err) {
        console.error("Upload failed:", err);
        document.getElementById("status").textContent = "❌ Upload failed. Check console for details.";
    }
}
