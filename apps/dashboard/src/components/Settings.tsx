import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'

export default function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('VITE_511_API_KEY')
    if (savedKey) {
      setApiKey(savedKey)
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('VITE_511_API_KEY', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)

    // Reload the page to apply the new API key
    setTimeout(() => {
      window.location.href = '/'
    }, 1000)
  }

  const handleClear = () => {
    setApiKey('')
    localStorage.removeItem('VITE_511_API_KEY')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link
          to="/"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">511.org API Configuration</h2>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            To get real-time SF Muni transit data, you need a free API key from{' '}
            <a
              href="https://511.org/open-data/token"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              511.org
            </a>
            . Without an API key, the app will run in demo mode with simulated data.
          </p>

          <label
            htmlFor="apiKey"
            className="block text-sm font-medium mb-2"
          >
            API Key
          </label>
          <input
            id="apiKey"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your 511.org API key"
            className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Save & Reload
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors"
          >
            Clear
          </button>
        </div>

        {saved && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-200 rounded">
            Settings saved! Reloading...
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded">
          <h3 className="font-semibold mb-2">How to get an API key:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Visit <a href="https://511.org/open-data/token" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">511.org/open-data/token</a></li>
            <li>Fill out the form with your email address</li>
            <li>Check your email for the API token</li>
            <li>Paste the token above and click "Save & Reload"</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
