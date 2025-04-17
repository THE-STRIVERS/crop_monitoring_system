const MQTT_BROKER = "wss://mqtt.eclipseprojects.io/mqtt";
const MQTT_TOPIC = "raspberrypi/sensors";

// MQTT client setup
const client = mqtt.connect(MQTT_BROKER);

client.on("connect", () => {
  console.log("✅ Connected to MQTT Broker");
  client.subscribe(MQTT_TOPIC, (err) => {
    if (!err) {
      console.log(`📡 Subscribed to topic: ${MQTT_TOPIC}`);
    }
  });
});

client.on("message", (topic, message) => {
  const data = JSON.parse(message.toString());

  const soilMoisture = parseFloat(data.moisture);
  const temperature = parseFloat(data.temperature);
  const humidity = parseFloat(data.humidity);
  const lightIntensity = parseFloat(data.light);

  // Update dashboard bars
  updateBar('moisture-bar', soilMoisture, 1023, 'moisture-value', 'Moisture');
  updateBar('temperature-bar', temperature, 40, 'temperature-value', 'Temperature');
  updateBar('humidity-bar', humidity, 100, 'humidity-value', 'Humidity');
  updateBar('light-bar', lightIntensity, 1023, 'light-value', 'Light');

  // Send to AI/ML model for alert analysis
  checkCropConditionFromSensor(temperature, humidity, soilMoisture, lightIntensity);
});

// Update Bar Visuals
function updateBar(barId, value, max, valueId, type) {
  const bar = document.getElementById(barId).children;
  const filledBars = Math.round((value / max) * bar.length);

  for (let i = 0; i < bar.length; i++) {
    bar[i].style.background = i < filledBars ? getBarColor(i, type) : "#1a1a1a";
  }

  document.getElementById(valueId).innerText = value.toFixed(1);
}

// Color logic for bar segments
function getBarColor(index, type) {
  switch (type) {
    case 'Moisture':
      return index < 5 || index >= 11 ? '#ff8c00' : '#32cd32';
    case 'Temperature':
      return index < 5 ? '#00bfff' : (index >= 11 ? '#ff4500' : '#32cd32');
    case 'Humidity':
      return index < 5 ? '#ffa500' : (index >= 11 ? '#006400' : '#32cd32');
    case 'Light':
      return index < 5 ? '#444' : (index >= 11 ? '#ffe600' : '#ffff66');
    default:
      return '#32cd32';
  }
}

// Send data to Flask AI/ML model and process alert
async function checkCropConditionFromSensor(temp, humidity, soil, light) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "🔄 Checking conditions...";

  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        temperature: temp,
        humidity: humidity,
        soil_moisture: soil,
        light_intensity: light
      })
    });

    const data = await response.json();
    const notificationsList = document.getElementById("notifications-list");

    // Show result and alert
    if (data.alert && data.alert.includes("ALERT")) {
      resultDiv.innerHTML = `🚨 <span style="color:red;">${data.alert}</span>`;
      addNotification(`🚨 ${data.alert}`, "red");
    } else {
      resultDiv.innerHTML = `✅ <span style="color:green;">${data.alert}</span>`;
      addNotification(`✅ ${data.alert}`, "green");
    }
  } catch (error) {
    resultDiv.innerHTML = `❌ Error: ${error.message}`;
    addNotification(`❌ Error: ${error.message}`, "gray");
  }
}

// Add alert to notification panel
function addNotification(message, color = "black") {
  const list = document.getElementById("notifications-list");

  // Clear "No notifications yet." if it exists
  if (list.children.length === 1 && list.children[0].innerText === "No notifications yet.") {
    list.innerHTML = "";
  }

  const li = document.createElement("li");
  li.style.color = color;
  li.textContent = message;
  list.appendChild(li);
}



// API Key for OpenWeatherMap
const apiKey = "9afd8abc3856f72416463be47783bca4";

window.onload = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const cityName = await fetchCityName(lat, lon); // Fetch city name
        document.getElementById("locationName").innerText = cityName;
        fetchForecast(lat, lon);
      },
      (error) => {
        console.error("Location error:", error);
        document.getElementById("forecastContainer").innerHTML =
          "<p style='color: red;'>Location access denied. Forecast not available.</p>";
      }
    );
  } else {
    alert("Geolocation not supported by your browser.");
  }
};

// Fetch the city name using Reverse Geocoding
async function fetchCityName(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data[0]?.name || "Unknown Location"; // Return city name or default text
  } catch (err) {
    console.error("Error fetching location name:", err);
    return "Unknown Location";
  }
}

// Fetch 5-Day Weather Forecast
async function fetchForecast(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    const container = document.getElementById("forecastContainer");
    container.innerHTML = "";

    const daily = {};
    data.list.forEach(entry => {
      const date = entry.dt_txt.split(" ")[0];
      if (!daily[date]) daily[date] = entry;
    });

    const weatherIcons = {
        "Clear": "https://cdn-icons-png.flaticon.com/512/869/869869.png",
        "Rain": "https://cdn-icons-png.flaticon.com/512/1146/1146860.png",
        "Snow": "https://cdn-icons-png.flaticon.com/512/2584/2584261.png",
        "Clouds": "https://cdn-icons-png.flaticon.com/512/414/414927.png",
        "Thunderstorm": "https://cdn-icons-png.flaticon.com/512/1779/1779940.png"
      };
      
      const weatherBackgrounds = {
        "Clear": "https://source.unsplash.com/600x400/?sunny,sky",
        "Rain": "https://source.unsplash.com/600x400/?rain,cloud",
        "Snow": "https://source.unsplash.com/600x400/?snow,winter",
        "Clouds": "https://source.unsplash.com/600x400/?cloudy,sky",
        "Thunderstorm": "https://source.unsplash.com/600x400/?storm,lightning"
      };
      
      Object.values(daily).slice(0, 5).forEach(day => {
        const weatherCondition = day.weather[0].main; 
        const weatherImage = weatherIcons[weatherCondition] || "https://cdn-icons-png.flaticon.com/512/869/869869.png"; 
        const backgroundImage = weatherBackgrounds[weatherCondition] || "https://source.unsplash.com/600x400/?weather";
      
        const card = document.createElement("div");
        card.classList.add("forecast-item");
        card.style.backgroundImage = `url(${backgroundImage})`;
      
        card.innerHTML = `
          <h3>${new Date(day.dt * 1000).toDateString()}</h3>
          <img src="${weatherImage}" alt="${weatherCondition} Icon">
          <p>${day.weather[0].description}</p>
          <ul>
            <li>🌡️ ${day.main.temp_min}°C - ${day.main.temp_max}°C</li>
            <li>💧 Humidity: ${day.main.humidity}%</li>
            <li>💨 Wind: ${day.wind.speed} m/s</li>
          </ul>
        `;
        
        container.appendChild(card);
      });
      
  } catch (err) {
    console.error("Error fetching weather:", err);
    document.getElementById("forecastContainer").innerHTML =
      "<p style='color: red;'>Could not fetch weather forecast.</p>";
  }
}

