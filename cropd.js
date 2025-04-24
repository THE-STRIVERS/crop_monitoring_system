// DOM Elements
const fileInput = document.getElementById('fileInput');
const openCameraBtn = document.getElementById('openCameraBtn');
const pasteBox = document.getElementById('pasteBox');
const predictionOutput = document.getElementById('predictionOutput');
const preview = document.getElementById('preview');
const resultBox = document.getElementById('result');
const errorMessage = document.getElementById('error-message');
const themeToggle = document.getElementById('theme-toggle');
const liveCamera = document.getElementById('liveCamera');
const captureBtn = document.getElementById('captureBtn');
const predictBtn = document.getElementById("predictBtn");

let currentStream = null;
let selectedImageFile = null;

// === Utility: Clear All Inputs ===
function clearAllInputs() {
  fileInput.value = "";
  preview.src = "";
  preview.classList.add("hidden");
  stopCamera();
  selectedImageFile = null;
  if (pasteBox) pasteBox.value = '';
  errorMessage.style.display = "none";
  resultBox.style.display = "none";
  predictionOutput.textContent = "";
}

// === Stop Live Camera ===
function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
  liveCamera.classList.add('hidden');
  captureBtn.classList.add('hidden');
}

// === Predict Button Handler ===
predictBtn?.addEventListener("click", async () => {
  if (!selectedImageFile) {
    predictionOutput.textContent = "⚠️ Please upload, capture, or paste an image first.";
    return;
  }

  const formData = new FormData();
  formData.append("image", selectedImageFile);

  predictionOutput.textContent = "🔍 Predicting...";
  resultBox.style.display = "none";
  errorMessage.style.display = "none";

  try {
    const response = await fetch("https://disease-2-gqkg.onrender.com/predict", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to fetch prediction");

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    // Update preview if needed
    preview.classList.remove("hidden");

    // Fill prediction results
    predictionOutput.innerHTML = `<h3>🩺 Prediction: ${data.label}</h3><p>Confidence: ${data.confidence.toFixed(2)}%</p>`;

    const buildListHTML = (items) => items.map(i => `<li>${i}</li>`).join("");

    document.getElementById('symptoms-list').innerHTML = buildListHTML(data.disease_details.symptoms);
    document.getElementById('prevention-list').innerHTML = buildListHTML(data.disease_details.prevention);
    document.getElementById('safety-tips-list').innerHTML = buildListHTML(data.disease_details.safety_tips);

    document.getElementById('organic-alternatives-list').innerHTML = data.disease_details.organic_alternatives.map(alt =>
      `<li><strong>${alt.name}:</strong> ${alt.application} (Dosage: ${alt.dosage})</li>`
    ).join("");

    document.getElementById('treatments-list').innerHTML = data.disease_details.treatments.map(t =>
      `<li><strong>${t.name}:</strong> ${t.application} (Dosage: ${t.dosage}, Frequency: ${t.frequency}, Pre-Harvest Interval: ${t.pre_harvest_interval})</li>
       <li><strong>Brand Examples:</strong> ${t.brand_examples.join(", ")}</li>`
    ).join("");

    resultBox.style.display = "block";
  } catch (error) {
    console.error("Prediction error:", error);
    predictionOutput.textContent = "";
    errorMessage.textContent = "❌ Error: " + error.message;
    errorMessage.style.display = "block";
  }
});

// === File Upload from System ===
fileInput?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  clearAllInputs();
  if (file && file.type.startsWith('image/')) {
    selectedImageFile = file;
    preview.src = URL.createObjectURL(file);
    preview.classList.remove("hidden");
    predictionOutput.textContent = "✅ Image ready. Click Predict.";
  } else {
    predictionOutput.textContent = "⚠️ Please select a valid image file.";
  }
});

// === Open Camera on Button Click ===
openCameraBtn?.addEventListener('click', async () => {
  clearAllInputs();
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    currentStream = stream;
    liveCamera.srcObject = stream;
    liveCamera.classList.remove('hidden');
    captureBtn.classList.remove('hidden');
    predictionOutput.textContent = "📷 Camera is live. Click capture to take a picture.";
  } catch (err) {
    console.error("Camera access error:", err);
    predictionOutput.textContent = "🚫 Unable to access camera.";
  }
});

// === Capture from Live Camera ===
captureBtn?.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = liveCamera.videoWidth;
  canvas.height = liveCamera.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(liveCamera, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (blob) {
      clearAllInputs();
      selectedImageFile = new File([blob], "camera_capture.png", { type: "image/png" });
      preview.src = URL.createObjectURL(selectedImageFile);
      preview.classList.remove("hidden");
      predictionOutput.textContent = "✅ Image captured. Click Predict.";
    }
  }, 'image/png');
});

// === Paste from Clipboard ===
pasteBox?.addEventListener('paste', (e) => {
  const items = e.clipboardData.items;
  for (let item of items) {
    if (item.type.indexOf("image") === 0) {
      const file = item.getAsFile();
      clearAllInputs();
      selectedImageFile = file;
      preview.src = URL.createObjectURL(file);
      preview.classList.remove("hidden");
      predictionOutput.textContent = "✅ Image pasted. Click Predict.";
      return;
    }
  }
  predictionOutput.textContent = "⚠️ Please paste an image.";
});
