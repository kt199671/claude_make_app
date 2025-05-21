// 定数
const API_KEY = "1ac41d2a3e479336f738453b339809a5"; // OpenWeatherMap API キー
const DEFAULT_CITY = "Tokyo"; // デフォルトの都市

// DOM要素
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const loading = document.getElementById('loading');
const weatherContainer = document.getElementById('weather-container');
const forecast = document.getElementById('forecast');
const locationElement = document.getElementById('location');
const dateElement = document.getElementById('date');
const weatherIcon = document.getElementById('weather-icon');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const feelsLikeElement = document.getElementById('feels-like');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecast-container');

// 天気アイコンのマッピング (OpenWeatherMap コードと絵文字)
const weatherIconMap = {
    '01d': '☀️',  // 晴れ (昼)
    '01n': '🌙',  // 晴れ (夜)
    '02d': '🌤️',  // 少し曇り (昼)
    '02n': '🌑',  // 少し曇り (夜)
    '03d': '⛅',  // 曇り (昼)
    '03n': '☁️',  // 曇り (夜)
    '04d': '☁️',  // 厚い雲 (昼)
    '04n': '☁️',  // 厚い雲 (夜)
    '09d': '🌧️',  // 小雨 (昼)
    '09n': '🌧️',  // 小雨 (夜)
    '10d': '🌦️',  // 雨 (昼)
    '10n': '🌧️',  // 雨 (夜)
    '11d': '⛈️',  // 雷雨 (昼)
    '11n': '⛈️',  // 雷雨 (夜)
    '13d': '❄️',  // 雪 (昼)
    '13n': '❄️',  // 雪 (夜)
    '50d': '🌫️',  // 霧 (昼)
    '50n': '🌫️'   // 霧 (夜)
};

// 天気データを取得する関数
async function getWeatherData(city) {
    try {
        showLoading();
        hideError();
        
        // OpenWeatherMapのAPIを使用して現在の天気を取得
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ja`
        );
        
        if (!currentWeatherResponse.ok) {
            const errorData = await currentWeatherResponse.json();
            throw new Error(errorData.message || '天気データを取得できませんでした');
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        
        // 5日間の予報データを取得
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=ja`
        );
        
        if (!forecastResponse.ok) {
            throw new Error('予報データを取得できませんでした');
        }
        
        const forecastData = await forecastResponse.json();
        
        // 取得したデータを表示
        displayWeatherData(currentWeatherData);
        displayForecastData(forecastData);
        
        // 最近検索した都市をローカルストレージに保存
        saveRecentCity(city);
        
        hideLoading();
        showWeatherContainer();
        showForecast();
    } catch (error) {
        hideLoading();
        hideWeatherContainer();
        hideForecast();
        showError(error.message);
        console.error('Error fetching weather data:', error);
    }
}

// 現在の天気データを表示
function displayWeatherData(data) {
    // 位置情報
    locationElement.textContent = `${data.name}, ${data.sys.country}`;
    
    // 日付
    const date = new Date();
    dateElement.textContent = formatDate(date);
    
    // 天気アイコン
    const iconCode = data.weather[0].icon;
    weatherIcon.textContent = weatherIconMap[iconCode] || '🌡️';
    
    // 温度
    temperatureElement.textContent = `${Math.round(data.main.temp)}°C`;
    
    // 天気の説明
    descriptionElement.textContent = data.weather[0].description;
    
    // 詳細情報
    feelsLikeElement.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidityElement.textContent = `${data.main.humidity}%`;
    windSpeedElement.textContent = `${data.wind.speed} m/s`;
    pressureElement.textContent = `${data.main.pressure} hPa`;
}

// 5日間の予報データを表示
function displayForecastData(data) {
    // 予報コンテナをクリア
    forecastContainer.innerHTML = '';
    
    // 毎日の12:00のデータだけを使用して5日間の予報を作成
    const dailyForecasts = {};
    
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('ja-JP', { weekday: 'short' });
        
        // 新しい日付または12:00に近いデータを保存
        if (!dailyForecasts[day] || Math.abs(date.getHours() - 12) < Math.abs(new Date(dailyForecasts[day].dt * 1000).getHours() - 12)) {
            dailyForecasts[day] = item;
        }
    });
    
    // 予報カードを作成して表示
    Object.values(dailyForecasts).slice(0, 5).forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('ja-JP', { weekday: 'short' });
        const iconCode = forecast.weather[0].icon;
        const icon = weatherIconMap[iconCode] || '🌡️';
        const temp = Math.round(forecast.main.temp);
        
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <div class="forecast-day">${day}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-temp">${temp}°C</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// 日付をフォーマット
function formatDate(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    };
    return date.toLocaleDateString('ja-JP', options);
}

// 最近検索した都市を保存
function saveRecentCity(city) {
    localStorage.setItem('recentCity', city);
}

// 最近検索した都市を取得
function getRecentCity() {
    return localStorage.getItem('recentCity') || DEFAULT_CITY;
}

// エラーメッセージを表示
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// エラーメッセージを非表示
function hideError() {
    errorMessage.style.display = 'none';
}

// ローディングを表示
function showLoading() {
    loading.style.display = 'block';
}

// ローディングを非表示
function hideLoading() {
    loading.style.display = 'none';
}

// 天気コンテナを表示
function showWeatherContainer() {
    weatherContainer.style.display = 'block';
}

// 天気コンテナを非表示
function hideWeatherContainer() {
    weatherContainer.style.display = 'none';
}

// 予報を表示
function showForecast() {
    forecast.style.display = 'block';
}

// 予報を非表示
function hideForecast() {
    forecast.style.display = 'none';
}

// イベントリスナー
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});

// 現在地の天気を取得
function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            async position => {
                try {
                    const { latitude, longitude } = position.coords;
                    
                    // 座標から天気データを取得
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=ja`
                    );
                    
                    if (!response.ok) {
                        throw new Error('現在地の天気データを取得できませんでした');
                    }
                    
                    const data = await response.json();
                    cityInput.value = data.name;
                    getWeatherData(data.name);
                } catch (error) {
                    hideLoading();
                    showError(error.message);
                    console.error('Error fetching current location weather:', error);
                }
            },
            error => {
                hideLoading();
                // 位置情報が取得できない場合はデフォルトの都市を使用
                getWeatherData(getRecentCity());
                console.error('Geolocation error:', error);
            }
        );
    } else {
        // 位置情報がサポートされていない場合はデフォルトの都市を使用
        getWeatherData(getRecentCity());
    }
}

// ページ読み込み時に初期データを取得
document.addEventListener('DOMContentLoaded', () => {
    // 位置情報に基づく天気の取得を試みる
    // 注意: API_KEYが "YOUR_API_KEY" のままの場合は
    // デフォルト都市の天気を取得する
    if (API_KEY !== "YOUR_API_KEY") {
        getCurrentLocationWeather();
    } else {
        // デモデータを表示
        displayDemoData();
    }
});

// API_KEYがない場合のデモデータ
function displayDemoData() {
    // 現在の天気のデモデータ
    const demoWeatherData = {
        name: "東京",
        sys: { country: "JP" },
        weather: [{ icon: "01d", description: "晴れ" }],
        main: {
            temp: 22,
            feels_like: 20,
            humidity: 65,
            pressure: 1013
        },
        wind: { speed: 3.5 }
    };
    
    // 予報のデモデータ
    const demoForecastData = {
        list: [
            {
                dt: Math.floor(Date.now() / 1000) + 86400,
                weather: [{ icon: "01d" }],
                main: { temp: 23 }
            },
            {
                dt: Math.floor(Date.now() / 1000) + 86400 * 2,
                weather: [{ icon: "02d" }],
                main: { temp: 21 }
            },
            {
                dt: Math.floor(Date.now() / 1000) + 86400 * 3,
                weather: [{ icon: "10d" }],
                main: { temp: 19 }
            },
            {
                dt: Math.floor(Date.now() / 1000) + 86400 * 4,
                weather: [{ icon: "09d" }],
                main: { temp: 18 }
            },
            {
                dt: Math.floor(Date.now() / 1000) + 86400 * 5,
                weather: [{ icon: "01d" }],
                main: { temp: 22 }
            }
        ]
    };
    
    displayWeatherData(demoWeatherData);
    displayForecastData(demoForecastData);
    showWeatherContainer();
    showForecast();
    hideLoading();
}