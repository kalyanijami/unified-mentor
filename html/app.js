// app.js — using Open-Meteo (no API key required)

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locBtn = document.getElementById('locBtn');

const locationEl = document.getElementById('location');
const descriptionEl = document.getElementById('description');
const tempEl = document.getElementById('temp');
const feelsEl = document.getElementById('feels');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const pressureEl = document.getElementById('pressure');
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
const timeEl = document.getElementById('time');
const weatherIcon = document.getElementById('weatherIcon');

// Helper to format HH:MM
function formatTime(hhmm) {
  return hhmm.slice(0,2) + ':' + hhmm.slice(2);
}

// Fetch weather using Open-Meteo
async function fetchByCoords(lat, lon) {
  try {
    // Open‐Meteo endpoint: current weather, sunrise, sunset
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto&daily=sunrise,sunset`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather unavailable');
    const data = await res.json();
    renderWeather(lat, lon, data);
  } catch (err) {
    alert(err.message || 'Error fetching weather');
  }
}

async function fetchByCity(city) {
  try {
    // Use geocoding to get coords (no key, free)
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
    if (!geoRes.ok) throw new Error('Location not found');
    const geoData = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) throw new Error('Location not found');

    const { latitude, longitude, name, country } = geoData.results[0];
    fetchByCoords(latitude, longitude);
    locationEl.textContent = `${name}, ${country}`;
  } catch (err) {
    alert(err.message || 'Error finding location');
  }
}

function renderWeather(lat, lon, data) {
  const cw = data.current_weather;
  const daily = data.daily;

  descriptionEl.textContent = '—';  // Open-Meteo doesn't include descriptions
  tempEl.textContent = `${cw.temperature.toFixed(1)}°C`;
  feelsEl.textContent = `—`; // Not available with current_weather endpoint
  humidityEl.textContent = `—`; // Not available
  windEl.textContent = `${cw.windspeed.toFixed(1)} m/s`;
  pressureEl.textContent = `—`; // Not available
  sunriseEl.textContent = formatTime(daily.sunrise[0].slice(-4));
  sunsetEl.textContent = formatTime(daily.sunset[0].slice(-4));
  timeEl.textContent = `${cw.time.slice(11,16)}`;

  // A basic icon based on wind speed (just as a placeholder)
  if (cw.windspeed < 5) {
    weatherIcon.innerHTML = sunSVG();
  } else {
    weatherIcon.innerHTML = cloudSVG();
  }
}

// Minimal SVG icons
function sunSVG() {
  return `<circle cx="32" cy="28" r="10" fill="#FFD166"></circle>
    <g stroke="#FFD166" stroke-width="2" stroke-linecap="round">
      <path d="M32 6v6M32 46v6M6 28h6M52 28h6M12 12l4 4M48 48l4 4M12 44l4-4M48 12l4-4"/>
    </g>`;
}
function cloudSVG() {
  return `<g fill="#E6EEF8" opacity="0.95">
      <ellipse cx="30" cy="34" rx="14" ry="8"/>
      <ellipse cx="20" cy="32" rx="8" ry="6"/>
      <ellipse cx="40" cy="32" rx="8" ry="6"/>
    </g>`;
}

searchBtn.addEventListener('click', () => {
  const q = cityInput.value.trim();
  if (!q) return alert('Please enter a city');
  fetchByCity(q);
});
cityInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') searchBtn.click();
});

locBtn.addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Geolocation not supported');
  navigator.geolocation.getCurrentPosition(
    pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
    err => alert('Unable to get location: ' + err.message),
    { timeout: 10000 }
  );
});

// Optionally load default city
fetchByCity('New Delhi');
