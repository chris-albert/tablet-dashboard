import { useEffect, useState } from 'react'

interface WeatherDay {
  date: string
  dayOfWeek: string
  high: number
  low: number
  condition: string
  icon: string
}

export default function WeatherInfo() {
  const [forecast, setForecast] = useState<WeatherDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Using National Weather Service API (free, no API key needed)
      // First get the grid coordinates for 94132 (San Francisco)
      const lat = 37.7272
      const lon = -122.4656

      // Get the forecast grid endpoint
      const pointsResponse = await fetch(
        `https://api.weather.gov/points/${lat},${lon}`
      )
      const pointsData = await pointsResponse.json()

      // Get the forecast
      const forecastResponse = await fetch(pointsData.properties.forecast)
      const forecastData = await forecastResponse.json()

      // Parse the forecast data
      const periods = forecastData.properties.periods.slice(0, 10) // Get first 10 periods

      // Group by day (day/night pairs)
      const days: WeatherDay[] = []
      for (let i = 0; i < periods.length; i += 2) {
        const dayPeriod = periods[i]
        const nightPeriod = periods[i + 1]

        if (dayPeriod) {
          days.push({
            date: new Date(dayPeriod.startTime).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            dayOfWeek: new Date(dayPeriod.startTime).toLocaleDateString('en-US', {
              weekday: 'short',
            }),
            high: dayPeriod.temperature,
            low: nightPeriod?.temperature || dayPeriod.temperature - 10,
            condition: dayPeriod.shortForecast,
            icon: getWeatherEmoji(dayPeriod.shortForecast),
          })
        }

        if (days.length >= 5) break
      }

      setForecast(days)
    } catch (err) {
      setError('Failed to fetch weather data')
      console.error('Weather fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()
    const interval = setInterval(fetchWeatherData, 600000) // Update every 10 minutes
    return () => clearInterval(interval)
  }, [])

  const getWeatherEmoji = (condition: string): string => {
    const lower = condition.toLowerCase()
    if (lower.includes('sunny') || lower.includes('clear')) return '☀️'
    if (lower.includes('partly cloudy') || lower.includes('mostly sunny')) return '⛅'
    if (lower.includes('cloudy') || lower.includes('overcast')) return '☁️'
    if (lower.includes('rain') || lower.includes('showers')) return '🌧️'
    if (lower.includes('storm') || lower.includes('thunder')) return '⛈️'
    if (lower.includes('snow')) return '❄️'
    if (lower.includes('fog')) return '🌫️'
    if (lower.includes('wind')) return '💨'
    return '🌤️'
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">5-Day Forecast</h2>
        <span className="text-sm text-gray-500">San Francisco (94132)</span>
      </div>

      {loading && (
        <p className="text-gray-500">Loading weather data...</p>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && forecast.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {forecast.map((day, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center"
            >
              <p className="font-semibold text-sm mb-1">{day.dayOfWeek}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {day.date}
              </p>
              <div className="text-4xl mb-2">{day.icon}</div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 min-h-[2.5rem]">
                {day.condition}
              </p>
              <div className="flex justify-center gap-2 text-sm">
                <span className="font-bold text-red-600 dark:text-red-400">
                  {day.high}°
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {day.low}°
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && forecast.length === 0 && !error && (
        <p className="text-gray-500">No forecast data available</p>
      )}
    </div>
  )
}
