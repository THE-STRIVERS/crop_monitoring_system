async function recommendCrop() {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "🔄 Getting recommendation...";
  
    const payload = {
      N: parseFloat(document.getElementById("n").value),
      P: parseFloat(document.getElementById("p").value),
      K: parseFloat(document.getElementById("k").value),
      temperature: parseFloat(document.getElementById("temperature").value),
      humidity: parseFloat(document.getElementById("humidity").value),
      ph: parseFloat(document.getElementById("ph").value),
      rainfall: parseFloat(document.getElementById("rainfall").value)
    };
  
    try {
      const response = await fetch("http://127.0.0.1:5000/recommend_crop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      const data = await response.json();
  
      if (data.recommended_crop) {
        resultDiv.innerHTML = `🌾 Recommended Crop: <span style="color:green;">${data.recommended_crop}</span><br>📩 SMS/Email sent!`;
      } else {
        resultDiv.innerHTML = `⚠ ${data.error}`;
      }
  
    } catch (error) {
      resultDiv.innerHTML = `❌ Error: ${error.message}`;
    }
  }
  