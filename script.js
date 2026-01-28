import { createClient } from '@supabase/supabase-js';

// ---------- Supabase setup ----------
const supabase = createClient(
  'https://gneuratxejzbyhgpzatk.supabase.co',
  'sb_publishable_U3sKYX4eq4H5Bslfu0ErJA_ts8-8hT0' // frontend-safe key
);

let accessToken = null; // store JWT after login

// ---------- Google login ----------
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href // redirect back to same page
    }
  });

  if (error) return console.error("Login error:", error);

  console.log("Redirecting to Google login...");
}

// Listen to login button
document.getElementById("loginWithGoogle").addEventListener("click", signInWithGoogle);

// ---------- Auth session check ----------
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.access_token) {
    accessToken = session.access_token;
    console.log("Logged in as:", session.user.email);
    document.getElementById("loginStatus").textContent = `Logged in as ${session.user.email}`;
  }
});

// ---------- Try-on upload ----------
async function uploadTryOn() {
  const model = document.getElementById("model").files[0];
  const clothing = document.getElementById("clothing").files[0];
  const status = document.getElementById("status");
  const resultImg = document.getElementById("result");
  const modelImage = document.getElementById("modelPreview");
  const clothingImage = document.getElementById("clothingPreview");

  if (!accessToken) {
    alert("You must be logged in to generate a try-on!");
    return;
  }

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
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
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
          `https://api.thechangingroom.shop/result/${job_id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
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

// ---------- Button listener ----------
document.getElementById("generateTryOn").addEventListener("click", uploadTryOn);
