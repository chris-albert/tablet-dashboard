import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ThemeProvider } from '../components/ThemeProvider'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <Outlet />
      </div>
    </ThemeProvider>
  ),
})
