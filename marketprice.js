const apiKey = "579b464db66ec23bdd0000011cf3d78fcf494f4164cdccb8704c30e8";
let allRecords = [];

async function loadInitialData() {
  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=1000`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    allRecords = data.records;

    populateStates(data.records);

    // Try getting location after data is ready
    useCurrentLocation();
  } catch (err) {
    console.error("Error fetching initial data:", err);
  }
}

// Populate states from API data
function populateStates(records) {
  const stateSelect = document.getElementById("state");
  const states = [...new Set(records.map(rec => rec.state))].sort();

  states.forEach(state => {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });
}

// When a state is selected, show districts
document.getElementById("state").addEventListener("change", function () {
  const selectedState = this.value;
  populateDistricts(selectedState);
});

// Populate district dropdown based on state
function populateDistricts(state) {
  const districtSelect = document.getElementById("district");
  districtSelect.innerHTML = '<option value="">Select District</option>';

  const districts = [...new Set(
    allRecords
      .filter(rec => rec.state === state)
      .map(rec => rec.district)
  )].sort();

  districts.forEach(district => {
    const option = document.createElement("option");
    option.value = district;
    option.textContent = district;
    districtSelect.appendChild(option);
  });
}

// Get today’s date in DD/MM/YYYY
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0].split('-').reverse().join('/');
}

// Fetch filtered market price data
function fetchMarketData() {
  const state = document.getElementById("state").value;
  const district = document.getElementById("district").value;
  const commodity = document.getElementById("commodity").value;
  const date = getTodayDate();

  let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=100`;

  if (state) url += `&filters[state]=${encodeURIComponent(state)}`;
  if (district) url += `&filters[district]=${encodeURIComponent(district)}`;
  if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
  if (date) url += `&filters[arrival_date]=${encodeURIComponent(date)}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const tableBody = document.querySelector("#marketTable tbody");
      tableBody.innerHTML = "";

      if (data.records && data.records.length > 0) {
        data.records.forEach(record => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${record.state}</td>
            <td>${record.district}</td>
            <td>${record.market}</td>
            <td>${record.commodity}</td>
            <td>${record.variety}</td>
            <td>${record.grade}</td>
            <td>${record.arrival_date}</td>
            <td>${record.min_price}</td>
            <td>${record.max_price}</td>
            <td>${record.modal_price}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML = `<tr><td colspan="10">No data found for today with selected filters.</td></tr>`;
      }
    })
    .catch(err => {
      console.error("Error fetching data:", err);
    });
}

// Use geolocation and reverse geocode with Nominatim
function useCurrentLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();

      const state = data.address.state;
      const district = data.address.county || data.address.district;

      // Set values in dropdowns
      const stateSelect = document.getElementById("state");
      stateSelect.value = state;
      populateDistricts(state);

      setTimeout(() => {
        const districtSelect = document.getElementById("district");
        districtSelect.value = district;
      }, 500); // slight delay for districts to load

      console.log("Location auto-detected:", state, district);
    } catch (error) {
      console.error("Error during reverse geocoding:", error);
    }
  }, (err) => {
    console.warn("Geolocation error:", err.message);
  });
}

// Initial call
window.onload = loadInitialData;
