// DOM Elements
const fileInput = document.getElementById('fileInput');
const openCameraBtn = document.getElementById('openCameraBtn');
const pasteBox = document.getElementById('pasteBox');
const predictionOutput = document.getElementById('predictionOutput');
const preview = document.getElementById('preview');
const themeToggle = document.getElementById('theme-toggle');
const liveCamera = document.getElementById('liveCamera');
const captureBtn = document.getElementById('captureBtn');
const predictBtn = document.getElementById("predictBtn");

let currentStream = null;
let selectedImageFile = null; // <-- To keep track of the selected image

// === Utility: Clear All Inputs ===
function clearAllInputs() {
  fileInput.value = "";
  preview.src = "";
  preview.classList.add("hidden");
  stopCamera();
  selectedImageFile = null;
  if (pasteBox) {
    pasteBox.value = '';
    pasteBox.innerHTML = '';
  }
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
    predictionOutput.textContent = "Please upload, capture, or paste an image first.";
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedImageFile);

  // Show preview
  const reader = new FileReader();
  reader.onload = function (e) {
    preview.src = e.target.result;
    preview.classList.remove("hidden");
  };
  reader.readAsDataURL(selectedImageFile);

  predictionOutput.textContent = "Predicting...";

  try {
    const response = await fetch("/", {
      method: "POST",
      body: formData,
    });

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const result = doc.querySelector("#predictionOutput")?.textContent;

    predictionOutput.textContent = result || "Could not parse prediction.";
  } catch (error) {
    console.error(error);
    predictionOutput.textContent = "Error occurred during prediction.";
  }
});

// === File Upload from System ===
fileInput?.addEventListener('change', (e) => {
  const file = e.target.files[0]; // Get file BEFORE clearing inputs
  clearAllInputs();

  if (file && file.type.startsWith('image/')) {
    selectedImageFile = file;
    preview.src = URL.createObjectURL(file);
    preview.classList.remove("hidden");
    predictionOutput.textContent = "✅ Image ready. Click Predict.";
  } else {
    predictionOutput.textContent = "Please select a valid image file.";
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
      const file = new File([blob], "camera_capture.png", { type: "image/png" });
      selectedImageFile = file;
      preview.src = URL.createObjectURL(file);
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
  predictionOutput.textContent = "Please paste an image.";
});
