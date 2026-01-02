import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const apiKey = 'b2cf11fab8d7e319ff43991c91abe5f2'; // Replace with your OpenWeather API key

  // Fetch weather by city name
  const fetchWeatherByCity = async (cityName) => {
    setLoading(true);
    setError('');
    setWeather(null);
    setForecast([]);

    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}`
      );
      const weatherData = await weatherRes.json();

      if (!(weatherRes.ok && weatherData.cod === 200)) {
        setError(weatherData.message || 'City not found');
        setLoading(false);
        return;
      }

      setWeather(weatherData);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${apiKey}`
      );
      const forecastData = await forecastRes.json();

      if (forecastRes.ok && forecastData.cod === '200') {
        const daily = forecastData.list.filter(f => f.dt_txt.includes('12:00:00'));
        setForecast(daily);
      }

    } catch (err) {
      console.error(err);
      setError('Error fetching weather data');
    } finally {
      setLoading(false);
    }
  };

  // Use geolocation on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
          );
          const data = await res.json();
          if (res.ok && data.cod === 200) {
            setCity(data.name);
            setWeather(data);

            const forecastRes = await fetch(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
            );
            const forecastData = await forecastRes.json();
            if (forecastRes.ok && forecastData.cod === '200') {
              const daily = forecastData.list.filter(f => f.dt_txt.includes('12:00:00'));
              setForecast(daily);
            }
          } else {
            setError('Unable to fetch your location weather');
          }
        } catch (err) {
          console.error(err);
          setError('Error fetching location weather');
        }
      }, () => {
        setError('Geolocation permission denied');
      });
    } else {
      setError('Geolocation is not supported by your browser');
    }
  }, []);

  const handleSearch = () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }
    fetchWeatherByCity(city);
  };

  return (
    <div className="App">
      <h1>Weather Dashboard</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-info">
          <h2>{weather.name}, {weather.sys.country}</h2>
          <img
            src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
          />
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Feels Like: {weather.main.feels_like}°C</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
          <p>Weather: {weather.weather[0].description}</p>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast">
          <h2>5-Day Forecast</h2>
          <div className="forecast-cards">
            {forecast.map((day, index) => (
              <div key={index} className="forecast-card">
                <p>{new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <img
                  src={`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                />
                <p>{day.main.temp}°C</p>
                <p>{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
