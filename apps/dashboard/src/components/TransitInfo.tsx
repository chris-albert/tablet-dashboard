import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface Prediction {
  stopTag: string
  routeTitle: string
  minutes: number
  direction: string
}

const getApiKey = () => {
  // Check localStorage first, then fall back to env variable
  return localStorage.getItem('VITE_511_API_KEY') || import.meta.env.VITE_511_API_KEY || ''
}

export default function TransitInfo() {
  const [mLinePredictions, setMLinePredictions] = useState<Prediction[]>([])
  const [bus29Predictions, setBus29Predictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [demoMode, setDemoMode] = useState(!getApiKey())
  const [showQRCode, setShowQRCode] = useState<'M' | '29' | null>(null)

  const generateDemoData = () => {
    // Generate random demo predictions
    const randomMinutes = () => Math.floor(Math.random() * 20) + 3

    setMLinePredictions([
      {
        stopTag: 'demo',
        routeTitle: 'M Line',
        minutes: randomMinutes(),
        direction: 'Inbound to Embarcadero',
      },
      {
        stopTag: 'demo',
        routeTitle: 'M Line',
        minutes: randomMinutes() + 8,
        direction: 'Inbound to Embarcadero',
      },
      {
        stopTag: 'demo',
        routeTitle: 'M Line',
        minutes: randomMinutes() + 15,
        direction: 'Inbound to Embarcadero',
      },
    ])

    setBus29Predictions([
      {
        stopTag: 'demo',
        routeTitle: '29 Bus',
        minutes: randomMinutes(),
        direction: 'To Presidio',
      },
      {
        stopTag: 'demo',
        routeTitle: '29 Bus',
        minutes: randomMinutes() + 12,
        direction: 'To Presidio',
      },
      {
        stopTag: 'demo',
        routeTitle: '29 Bus',
        minutes: randomMinutes() + 20,
        direction: 'To Presidio',
      },
    ])
  }

  const fetchTransitData = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiKey = getApiKey()
      const isDemo = !apiKey

      setDemoMode(isDemo)

      if (isDemo) {
        // Use demo data when API key is not configured
        setTimeout(() => {
          generateDemoData()
          setLastUpdate(new Date())
          setLoading(false)
          setError('Demo Mode - Configure API key in settings to use live data')
        }, 500)
        return
      }

      // Using 511.org SF Bay API
      // Stop codes for Stonestown on 19th Ave & Winston Dr:
      // M Line Inbound (to Embarcadero): Stop #17449
      // 29 Bus: Nearby stops at Winston Dr & 20th Ave or 20th Ave/Stonestown

      const stopCodeM = '17449' // M Line inbound to Embarcadero at Stonestown
      const stopCode29 = '16950' // 29 Sunset at Winston Dr & 20th Ave (to Presidio)

      const baseUrl = 'https://api.511.org/transit'

      // Fetch M Line predictions
      const mLineUrl = `${baseUrl}/StopMonitoring?api_key=${apiKey}&agency=SF&stopCode=${stopCodeM}&format=json`
      const mLineResponse = await fetch(mLineUrl)
      const mLineData = await mLineResponse.json()

      // Fetch 29 Bus predictions
      const bus29Url = `${baseUrl}/StopMonitoring?api_key=${apiKey}&agency=SF&stopCode=${stopCode29}&format=json`
      const bus29Response = await fetch(bus29Url)
      const bus29Data = await bus29Response.json()

      // Parse the 511.org API response
      const parsePredictions = (data: any, routeFilter: string) => {
        try {
          const stopVisits = data?.ServiceDelivery?.StopMonitoringDelivery?.MonitoredStopVisit || []
          return stopVisits
            .filter((visit: any) => {
              const line = visit?.MonitoredVehicleJourney?.LineRef
              return line?.includes(routeFilter)
            })
            .map((visit: any) => {
              const journey = visit.MonitoredVehicleJourney
              const expectedTime = new Date(journey?.MonitoredCall?.ExpectedArrivalTime || journey?.MonitoredCall?.AimedArrivalTime)
              const now = new Date()
              const minutes = Math.floor((expectedTime.getTime() - now.getTime()) / 60000)

              return {
                stopTag: visit.MonitoringRef,
                routeTitle: journey?.PublishedLineName || routeFilter,
                minutes: Math.max(0, minutes),
                direction: journey?.DestinationName || 'Unknown',
              }
            })
            .slice(0, 3)
        } catch (e) {
          console.error('Error parsing predictions:', e)
          return []
        }
      }

      setMLinePredictions(parsePredictions(mLineData, 'M'))
      setBus29Predictions(parsePredictions(bus29Data, '29'))

      setLastUpdate(new Date())
    } catch (err) {
      setError('Failed to fetch transit data')
      console.error('Transit fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransitData()
    const interval = setInterval(fetchTransitData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">SF Muni - Stonestown</h2>
        <button
          onClick={fetchTransitData}
          className="text-sm px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading && mLinePredictions.length === 0 && (
        <p className="text-gray-500">Loading transit data...</p>
      )}

      {error && (
        <div className={`border px-4 py-3 rounded mb-4 ${
          demoMode
            ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400 text-yellow-700 dark:text-yellow-200'
            : 'bg-red-100 dark:bg-red-900 border-red-400 text-red-700 dark:text-red-200'
        }`}>
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-medium flex items-center">
              <span className="bg-blue-600 text-white px-2 py-1 rounded mr-2 text-sm">M</span>
              Inbound to Embarcadero
            </h3>
            <button
              onClick={() => setShowQRCode('M')}
              className="text-xs px-2 py-1 rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              title="Show QR Code for 511.org stop page"
            >
              📱 QR
            </button>
          </div>
          {mLinePredictions.length > 0 ? (
            <div className="flex gap-3">
              {mLinePredictions.map((pred, idx) => (
                <div key={idx} className="flex-1 bg-white dark:bg-gray-700 p-4 rounded text-center">
                  <span className="text-3xl font-bold">
                    {pred.minutes === 0 ? 'Arriving' : `${pred.minutes} min`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No predictions available</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-medium flex items-center">
              <span className="bg-green-600 text-white px-2 py-1 rounded mr-2 text-sm">29</span>
              To Presidio
            </h3>
            <button
              onClick={() => setShowQRCode('29')}
              className="text-xs px-2 py-1 rounded bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              title="Show QR Code for 511.org stop page"
            >
              📱 QR
            </button>
          </div>
          {bus29Predictions.length > 0 ? (
            <div className="flex gap-3">
              {bus29Predictions.map((pred, idx) => (
                <div key={idx} className="flex-1 bg-white dark:bg-gray-700 p-4 rounded text-center">
                  <span className="text-3xl font-bold">
                    {pred.minutes === 0 ? 'Arriving' : `${pred.minutes} min`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No predictions available</p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </p>

      {/* QR Code Modal */}
      {showQRCode && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowQRCode(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {showQRCode === 'M' ? 'M Line' : '29 Bus'} Stop
              </h3>
              <button
                onClick={() => setShowQRCode(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="bg-white p-4 rounded flex justify-center">
              <QRCodeSVG
                value={
                  showQRCode === 'M'
                    ? 'https://www.sfmta.com/stops/19th-ave-winston-dr-stonestown-17449'
                    : 'https://www.sfmta.com/stops/winston-dr-20th-ave-16951'
                }
                size={256}
                level="H"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              Scan to view stop details and schedules
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
