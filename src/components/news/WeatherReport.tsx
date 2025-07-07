import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Zap, Cloudy, Umbrella, Snowflake } from 'lucide-react';

interface WeatherData {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  latitude: number;
  longitude: number;
}

const getWeatherPhenomenon = (code: number) => {
  if (code >= 0 && code <= 1) return { icon: Sun, label: 'Clear sky', bg: 'bg-gradient-to-br from-blue-400 to-blue-600' };
  if (code >= 2 && code <= 3) return { icon: Cloud, label: 'Cloudy', bg: 'bg-gradient-to-br from-gray-400 to-gray-600'};
  if (code >= 51 && code <= 67) return { icon: CloudRain, label: 'Drizzle', bg: 'bg-gradient-to-br from-gray-500 to-blue-800'};
  if (code >= 80 && code <= 82) return { icon: Umbrella, label: 'Rainy', bg: 'bg-gradient-to-br from-blue-700 to-blue-900'};
  if (code >= 85 && code <= 86) return { icon: Snowflake, label: 'Snowy', bg: 'bg-gradient-to-br from-blue-200 to-blue-400'};
  if (code >= 95 && code <= 99) return { icon: Zap, label: 'Thunderstorm', bg: 'bg-gradient-to-br from-gray-700 to-gray-900'};
  return { icon: Sun, label: 'Sunny', bg: 'bg-gradient-to-br from-blue-400 to-blue-600' };
};

// Presentational WeatherCard component
interface WeatherCardProps {
  city: string;
  date: string;
  temperature: number;
  weatherLabel: string;
  windSpeed: number;
  WeatherIcon: React.ElementType;
  weatherBg: string;
}

const WeatherCard = ({ city, date, temperature, weatherLabel, windSpeed, WeatherIcon, weatherBg }: WeatherCardProps) => (
  <Card className={`w-full text-white shadow-lg rounded-2xl overflow-hidden ${weatherBg}`}>
    <CardContent className="p-4 md:p-8 flex flex-col justify-between h-full gap-6">
      <div className="flex justify-between items-start mb-4 px-2 md:px-6">
        <div>
          <p className="text-xl font-bold">{city}</p>
          <p className="text-sm opacity-80">{date}</p>
        </div>
        <div className="text-right bg-white/10 rounded-full p-2 flex items-center justify-center">
          <WeatherIcon className="w-10 h-10 drop-shadow-lg" />
        </div>
      </div>
      <div className="flex justify-center items-center my-4 px-2 md:px-6">
        <p className="text-6xl font-black tracking-tighter drop-shadow-lg">{Math.round(temperature)}°</p>
      </div>
      <div className="flex justify-between items-end mt-4 pt-2 px-2 md:px-6 gap-4">
        <p className="text-base font-medium">{weatherLabel}</p>
        <div className="flex items-center gap-2 text-sm">
          <Wind className="w-5 h-5" />
          <span>{windSpeed.toFixed(1)} km/h</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const WeatherReport = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState<string>('Loading...');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError(err.message);
          // Fallback to a default location if user denies permission
          setLocation({ latitude: 28.6139, longitude: 77.2090 }); // Delhi
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      // Fallback to a default location
      setLocation({ latitude: 28.6139, longitude: 77.2090 }); // Delhi
    }
  }, []);

  useEffect(() => {
    if (location) {
      const fetchWeather = async () => {
        try {
          const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code,wind_speed_10m`);
          if (!response.ok) {
            throw new Error('Failed to fetch weather data');
          }
          const data = await response.json();
          setWeather(data);
        } catch (err: any) {
          setError(err.message);
        }
      };

      const fetchCity = async () => {
        try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=en`);
            const data = await response.json();
            setCity(data.city || data.locality || 'Unknown Location');
        } catch (err) {
            setCity('Unknown Location');
        }
      };

      fetchWeather();
      fetchCity();
    }
  }, [location]);

  const { icon: WeatherIcon, label: weatherLabel, bg: weatherBg } = weather ? getWeatherPhenomenon(weather.current.weather_code) : getWeatherPhenomenon(0);

  if (weather && !error) {
    return (
      <WeatherCard
        city={city}
        date={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        temperature={weather.current.temperature_2m}
        weatherLabel={weatherLabel}
        windSpeed={weather.current.wind_speed_10m}
        WeatherIcon={WeatherIcon}
        weatherBg={weatherBg}
      />
    );
  } else {
  return (
    <Card className={`w-full text-white shadow-lg rounded-2xl overflow-hidden ${weatherBg}`}>
        <CardContent className="p-8 sm:p-0 flex flex-col justify-center items-center h-full min-h-[200px]">
             <p>{error || 'Loading weather...'}</p>
      </CardContent>
    </Card>
  );
  }
};

export default WeatherReport; 