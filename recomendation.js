// async function recommendCrop() {
//   const resultDiv = document.getElementById("result");
//   resultDiv.innerHTML = "🔄 Getting recommendation...";

//   const payload = {
//     N: parseFloat(document.getElementById("n").value),
//     P: parseFloat(document.getElementById("p").value),
//     K: parseFloat(document.getElementById("k").value),
//     temperature: parseFloat(document.getElementById("temperature").value),
//     humidity: parseFloat(document.getElementById("humidity").value),
//     ph: parseFloat(document.getElementById("ph").value),
//     rainfall: parseFloat(document.getElementById("rainfall").value),
//     season: document.getElementById("season").value
//   };

//   try {
//     const response = await fetch("http://127.0.0.1:5000/recommend_crop", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload)
//     });

//     const data = await response.json();

//     if (data.recommended_crop) {
//       resultDiv.innerHTML = `🌾 Recommended Crop: <span style="color:green;">${data.recommended_crop}</span><br>📩 SMS/Email sent!<br><button id="schedule-button" class="bg-blue-500 text-white p-2 rounded-lg mt-2">View Schedule</button>`;
//       document.getElementById("schedule-button").addEventListener("click", () => {
//         const crop = crops.find(c => c.name.toLowerCase() === data.recommended_crop.toLowerCase());
//         if (crop) updateCropDetails(crop);
//       });
//     } else {
//       resultDiv.innerHTML = `⚠ ${data.error}`;
//     }
//   } catch (error) {
//     resultDiv.innerHTML = `❌ Error: ${error.message}`;
//   }
// }

// let crops = [];

// fetch('crops.json')  // Ensure the crops.json file exists in the correct path
//   .then(response => response.json())
//   .then(data => crops = data.crops);  // Corrected: accessing crops array from data

// function formatDate(days) {
//   const today = new Date();
//   today.setDate(today.getDate() + days);
//   return today.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
// }

// function filterCrops() {
//   const input = document.getElementById("crop-search").value.toLowerCase();
//   const crop = crops.find(c => c.name.toLowerCase().startsWith(input));
//   if (crop) updateCropDetails(crop);
// }

// function updateCropDetails(crop) {
//   document.getElementById("crop-info").innerHTML = `
//     <div class="p-4 bg-blue-50 rounded-lg">
//       <p><strong>Crop:</strong> ${crop.name}</p>
//       <p><strong>Season:</strong> ${crop.season}</p>
//       <p><strong>Sowing Period:</strong> ${crop.sowing_period}</p>
//       <p><strong>Harvest Period:</strong> ${crop.harvest_period}</p>
//     </div>
//   `;

//   const renderSchedule = (schedule, containerId) => {
//     const container = document.getElementById(containerId);
//     container.innerHTML = '';  // Clear previous content
//     schedule.forEach(item => {
//       const div = document.createElement('div');
//       div.className = 'bg-blue-100 hover:scale-105 hover:shadow-lg transition transform duration-300 rounded-lg p-4 cursor-pointer flex items-start space-x-4';
//       div.innerHTML = `
//         <div class="flex-shrink-0">
//           <div class="bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-full text-sm font-bold animate-pulse">
//             ${item.days_after_planting}d
//           </div>
//           <div class="mt-1 text-xs text-center">📅 ${formatDate(item.days_after_planting)}</div>
//         </div>
//         <div class="flex-1">
//           <h3 class="text-blue-900 font-semibold">${item.stage}</h3>
//           <p class="text-sm text-gray-700">${item.application}</p>
//           <div class="extra-info mt-2 hidden bg-blue-50 p-3 rounded-lg border text-sm text-gray-600">${item.extra_info || 'No additional info available.'}</div>
//         </div>
//       `;
//       div.addEventListener('click', () => {
//         const info = div.querySelector('.extra-info');
//         const wasVisible = !info.classList.contains('hidden');
//         document.querySelectorAll('.extra-info').forEach(el => el.classList.add('hidden'));
//         if (!wasVisible) info.classList.remove('hidden');
//       });
//       container.appendChild(div);
//     });
//   };

//   renderSchedule(crop.fertilizer_schedule, 'fertilizer-schedule');
//   renderSchedule(crop.pesticide_schedule, 'pesticide-schedule');
// }
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
    rainfall: parseFloat(document.getElementById("rainfall").value),
    season: document.getElementById("season").value
  };

  try {
    const response = await fetch("http://127.0.0.1:5000/recommend_crop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.recommended_crop) {
      resultDiv.innerHTML = `🌾 Recommended Crop: <span style="color:green;">${data.recommended_crop}</span><br>📩 SMS/Email sent!<br><button id="schedule-button" class="bg-blue-500 text-white p-2 rounded-lg mt-2">View Schedule</button>`;
      
      const crop = crops.find(c => c.name.toLowerCase() === data.recommended_crop.toLowerCase());
      if (crop) {
        updateCropDetails(crop); // Automatically show the schedule
      }

      // Optional re-trigger button
      document.getElementById("schedule-button").addEventListener("click", () => {
        if (crop) updateCropDetails(crop);
      });

    } else {
      resultDiv.innerHTML = `⚠ ${data.error}`;
    }
  } catch (error) {
    resultDiv.innerHTML = `❌ Error: ${error.message}`;
  }
}

let crops = [];

fetch('crops.json')
  .then(response => response.json())
  .then(data => crops = data.crops);

function formatDate(days) {
  const today = new Date();
  today.setDate(today.getDate() + days);
  return today.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

function filterCrops() {
  const input = document.getElementById("crop-search").value.toLowerCase();
  const crop = crops.find(c => c.name.toLowerCase().startsWith(input));
  if (crop) updateCropDetails(crop);
}

function updateCropDetails(crop) {
  document.getElementById("crop-info").innerHTML = `
    <div class="p-4 bg-blue-50 rounded-lg">
      <p><strong>Crop:</strong> ${crop.name}</p>
      <p><strong>Season:</strong> ${crop.season}</p>
      <p><strong>Sowing Period:</strong> ${crop.sowing_period}</p>
      <p><strong>Harvest Period:</strong> ${crop.harvest_period}</p>
    </div>
  `;

  const renderSchedule = (schedule, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    schedule.forEach(item => {
      const div = document.createElement('div');
      div.className = 'bg-blue-100 hover:scale-105 hover:shadow-lg transition transform duration-300 rounded-lg p-4 cursor-pointer flex items-start space-x-4';
      div.innerHTML = `
        <div class="flex-shrink-0">
          <div class="bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-full text-sm font-bold animate-pulse">
            ${item.days_after_planting}d
          </div>
          <div class="mt-1 text-xs text-center">📅 ${formatDate(item.days_after_planting)}</div>
        </div>
        <div class="flex-1">
          <h3 class="text-blue-900 font-semibold">${item.stage}</h3>
          <p class="text-sm text-gray-700">${item.application}</p>
          <div class="extra-info mt-2 hidden bg-blue-50 p-3 rounded-lg border text-sm text-gray-600">${item.extra_info || 'No additional info available.'}</div>
        </div>
      `;
      div.addEventListener('click', () => {
        const info = div.querySelector('.extra-info');
        const wasVisible = !info.classList.contains('hidden');
        document.querySelectorAll('.extra-info').forEach(el => el.classList.add('hidden'));
        if (!wasVisible) info.classList.remove('hidden');
      });
      container.appendChild(div);
    });
  };

  renderSchedule(crop.fertilizer_schedule, 'fertilizer-schedule');
  renderSchedule(crop.pesticide_schedule, 'pesticide-schedule');
}
