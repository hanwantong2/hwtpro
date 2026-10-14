class WeatherWidget extends UIComponent {
  constructor(options = {}) {
    super({ title: options.title || 'Live Weather', id: options.id, onClose: options.onClose, onMove: options.onMove });
    this.cities = [
      { name: 'New York', lat: 40.7128, lon: -74.0060 },
      { name: 'London', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
      { name: 'Paris', lat: 48.8566, lon: 2.3522 },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
    ];
    this.cityIndex = 0;
    this.current = null;
    this._controller = null;
  }
  onMount() {
    this.fetchWeather();
    this._setInterval(() => this.fetchWeather(), 10 * 60 * 1000);
  }
  async fetchWeather() {
    if (this._controller) { try { this._controller.abort(); } catch (_) {} }
    const controller = this._createAbortController();
    this._controller = controller;
    this.setLoading('Fetching weather...');
    const city = this.cities[this.cityIndex];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || !data.current) throw new Error('Empty data');
      this.current = { city: city.name, ...data.current };
      this._renderWeather();
    } catch (err) {
      if (err.name === 'AbortError') return;
      this.setError('Failed to load weather. Please try again later.');
    }
  }
  _weatherDesc(code) {
    const map = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing rime fog',
      51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
      61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
      80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
    };
    return map[code] || 'Unknown';
  }
  _weatherIcon(code) {
    if (code === 0) return '☀️';
    if (code <= 2) return '🌤️';
    if (code === 3) return '☁️';
    if (code <= 48) return '🌫️';
    if (code <= 65) return '🌧️';
    if (code <= 75) return '❄️';
    if (code <= 82) return '🌦️';
    return '⛈️';
  }
  _renderWeather() {
    const w = this.current;
    if (!w) { this.setEmpty('No weather data'); return; }
    const wrap = document.createElement('div');
    wrap.className = 'weather-widget';
    const city = document.createElement('div');
    city.className = 'weather-city';
    city.textContent = w.city;
    const main = document.createElement('div');
    main.className = 'weather-main';
    const icon = document.createElement('span');
    icon.className = 'weather-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = this._weatherIcon(w.weather_code);
    const temp = document.createElement('span');
    temp.className = 'weather-temp';
    temp.textContent = `${Math.round(w.temperature_2m)}°C`;
    main.append(icon, temp);
    const desc = document.createElement('div');
    desc.className = 'weather-desc';
    desc.textContent = this._weatherDesc(w.weather_code);
    const details = document.createElement('dl');
    details.className = 'weather-details';
    [['Humidity', `${w.relative_humidity_2m}%`], ['Wind speed', `${w.wind_speed_10m} km/h`]].forEach(([k, v]) => {
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      details.append(dt, dd);
    });
    const controls = document.createElement('div');
    controls.className = 'weather-controls';
    const prev = document.createElement('button');
    prev.type = 'button'; prev.className = 'btn btn-ghost btn-sm'; prev.textContent = '◀ Prev city';
    prev.setAttribute('aria-label', 'Switch to previous city');
    const refresh = document.createElement('button');
    refresh.type = 'button'; refresh.className = 'btn btn-primary btn-sm'; refresh.textContent = '🔄 Refresh';
    const next = document.createElement('button');
    next.type = 'button'; next.className = 'btn btn-ghost btn-sm'; next.textContent = 'Next city ▶';
    next.setAttribute('aria-label', 'Switch to next city');
    this._on(prev, 'click', () => { this.cityIndex = (this.cityIndex - 1 + this.cities.length) % this.cities.length; this.fetchWeather(); });
    this._on(next, 'click', () => { this.cityIndex = (this.cityIndex + 1) % this.cities.length; this.fetchWeather(); });
    this._on(refresh, 'click', () => this.fetchWeather());
    controls.append(prev, refresh, next);
    wrap.append(city, main, desc, details, controls);
    this.setContent(wrap);
  }
}
if (typeof window !== 'undefined') window.WeatherWidget = WeatherWidget;
