class WeatherApp {
    constructor() {
        this.weatherData = null;
        this.isCelsius = true;
        this.initializeElements();
        this.attachEventListeners();
        this.loadLastSearch();
    }

    initializeElements() {
        this.elements = {
            location: document.getElementById('location'),
            error: document.getElementById('error'),
            loading: document.getElementById('loading'),
            weatherCard: document.getElementById('weatherCard'),
            locationName: document.getElementById('locationName'),
            weatherIcon: document.getElementById('weatherIcon'),
            temperature: document.getElementById('temperature'),
            unit: document.getElementById('unit'),
            condition: document.getElementById('condition'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            feelsLike: document.getElementById('feelsLike'),
            airQuality: document.getElementById('airQuality')
        };
    }

    attachEventListeners() {
        document.querySelector('.search-button').addEventListener('click', () => this.getWeather());
        document.querySelector('.unit-toggle').addEventListener('click', () => this.toggleUnit());
        this.elements.location.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.getWeather();
        });
    }

    loadLastSearch() {
        const lastSearch = localStorage.getItem('lastSearch');
        if (lastSearch) {
            this.elements.location.value = lastSearch;
            this.getWeather();
        }
    }

    showLoading(show) {
        this.elements.loading.style.display = show ? 'block' : 'none';
    }

    showError(message) {
        if (message) {
            this.elements.error.textContent = message;
            this.elements.error.style.display = 'block';
        } else {
            this.elements.error.style.display = 'none';
        }
    }

    getAirQualityClass(quality) {
        const classes = {
            'Good': 'air-quality-good',
            'Moderate': 'air-quality-moderate',
            'Unhealthy': 'air-quality-unhealthy',
            'Unhealthy for Sensitive Groups': 'air-quality-unhealthy',
            'Very Unhealthy': 'air-quality-unhealthy',
            'Hazardous': 'air-quality-unhealthy'
        };
        return `air-quality-badge ${classes[quality] || ''}`;
    }

    async getWeather() {
        const location = this.elements.location.value;
        if (!location) return;

        localStorage.setItem('lastSearch', location);
        this.showError(null);
        this.showLoading(true);
        this.elements.weatherCard.style.display = 'none';

        try {
            const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch weather data');
            }

            this.weatherData = data;
            this.displayWeather();
            this.elements.weatherCard.style.display = 'block';
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    displayWeather() {
        this.elements.locationName.textContent = this.weatherData.location;
        this.elements.weatherIcon.src = this.weatherData.icon;
        this.elements.condition.textContent = this.weatherData.condition;
        this.elements.humidity.textContent = `${this.weatherData.humidity}%`;
        this.elements.windSpeed.textContent = `${this.weatherData.wind_kph} km/h`;
        
        this.elements.airQuality.textContent = this.weatherData.air_quality;
        this.elements.airQuality.className = this.getAirQualityClass(this.weatherData.air_quality);

        this.updateTemperature();
    }

    updateTemperature() {
        const temp = this.isCelsius ? this.weatherData.temp_c : this.weatherData.temp_f;
        const feelsLike = this.isCelsius ? this.weatherData.feelslike_c : this.weatherData.temp_f;
        
        this.elements.temperature.textContent = Math.round(temp);
        this.elements.unit.textContent = this.isCelsius ? '°C' : '°F';
        this.elements.feelsLike.textContent = `${Math.round(feelsLike)}${this.isCelsius ? '°C' : '°F'}`;
    }

    toggleUnit() {
        this.isCelsius = !this.isCelsius;
        this.updateTemperature();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
}); 