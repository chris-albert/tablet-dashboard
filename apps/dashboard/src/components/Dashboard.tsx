import { useTheme } from './ThemeProvider'
import { Link } from '@tanstack/react-router'
import TransitInfo from './TransitInfo'
import WeatherInfo from './WeatherInfo'

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="container mx-auto px-4 py-4 max-w-6xl relative">
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <Link
          to="/settings"
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-md"
          aria-label="Settings"
        >
          ⚙️
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-md"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransitInfo />
        <WeatherInfo />
      </div>
    </div>
  )
}
