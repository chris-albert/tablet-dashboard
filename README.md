# Tablet Dashboard

A dashboard app for Fire 7 tablet displaying real-time transit and weather information.

## Features

- **SF Muni Transit Times**
  - M Line inbound to Embarcadero from Stonestown stop
  - 29 Bus to Presidio from Stonestown stop
  - Real-time predictions with auto-refresh every 30 seconds

- **Weather Forecast**
  - 5-day weather forecast for San Francisco (94132)
  - Displays temperature highs/lows and conditions
  - Auto-refresh every 10 minutes

- **Theme Support**
  - Light and dark theme toggle
  - Persists theme preference in localStorage

## Technologies

- React with TypeScript
- TanStack Router for routing
- Tailwind CSS for styling
- pnpm for package management
- Turborepo for monorepo management
- Vite for build tooling
- GitHub Actions for CI/CD

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher

### Installation

```bash
# Install dependencies
pnpm install

# Configure API keys (optional - runs in demo mode without)
cd apps/dashboard
cp .env.example .env
# Edit .env and add your 511.org API key
```

### API Configuration

#### Transit Data (Optional)

The app can display real-time SF Muni transit data using the 511.org API. You can configure the API key in two ways:

**Method 1: Using the Settings Page (Recommended for users)**
1. Click the ⚙️ settings icon in the top-right corner of the app
2. Get a free API key from [511.org](https://511.org/open-data/token)
3. Paste the API key in the settings page
4. Click "Save & Reload"

**Method 2: Using Environment Variables (For developers)**
1. Get a free API key from [511.org](https://511.org/open-data/token)
2. Copy `apps/dashboard/.env.example` to `apps/dashboard/.env`
3. Add your API key: `VITE_511_API_KEY=your_api_key_here`

**Without an API key**, the app runs in demo mode with simulated transit times.

#### Weather Data

Weather data uses the free National Weather Service API (no configuration needed).

### Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build
```

The app will be available at `http://localhost:5173` when running the dev server.

## Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the main branch.

The GitHub Actions workflow:
1. Builds the application
2. Uploads the build artifacts
3. Deploys to GitHub Pages

## Project Structure

```
tablet-dashboard/
├── apps/
│   └── dashboard/          # Main dashboard application
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── routes/     # TanStack Router routes
│       │   ├── index.css   # Global styles
│       │   └── main.tsx    # Application entry point
│       └── ...config files
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions workflow
└── ...
```

## APIs Used

- **SF Muni Transit**: 511.org SF Bay API (free API key required, demo mode available)
- **Weather**: National Weather Service API (free, no API key required)

## Notes

- The transit component runs in demo mode (with simulated data) when no API key is configured
- To find the correct stop codes for your location, you may need to explore the 511.org GTFS data
- The weather component uses coordinates for SF 94132 area

## License

MIT
