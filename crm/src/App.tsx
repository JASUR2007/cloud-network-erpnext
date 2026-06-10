import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FrappeProvider } from 'frappe-react-sdk'
import { Toaster } from 'sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { ThemeProvider } from './components/ui/theme-provider'
import Dashboard from '@/pages/Dashboard'
import Leads from '@/pages/Leads'
import LeadDetail from '@/pages/LeadDetail'
import Opportunities from '@/pages/Opportunities'
import OpportunityDetail from '@/pages/OpportunityDetail'
import Customers from '@/pages/Customers'
import Layout from '@/components/common/Layout'

function App() {
  useEffect(() => {
    const userId = document.cookie?.split('; ').find(row => row.startsWith('user_id='))?.split('=')[1]?.trim()
    const isLoggedIn = userId !== 'Guest'
    console.log('3');
    if (!isLoggedIn) {
      if (import.meta.env.DEV) {
        return
      }
      window.location.href = '/login?redirect-to=/crm'
      return
    }
  }, [])

  return (
    <TooltipProvider>
      <FrappeProvider
        swrConfig={{
          errorRetryCount: 2
        }}
        socketPort={import.meta.env.VITE_SOCKET_PORT}
        siteName={window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME}>
        <ThemeProvider defaultTheme={window.frappe?.boot?.desk_theme ?? "Automatic"}>
          {window.frappe?.boot?.user?.name && window.frappe?.boot?.user?.name !== 'Guest' &&
            <BrowserRouter basename={import.meta.env.VITE_BASE_NAME ? `/${import.meta.env.VITE_BASE_NAME}` : ''}>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Dashboard />} />213
                  <Route path="leads" element={<Leads />} />
                  <Route path="leads/:id" element={<LeadDetail />} />
                  <Route path="opportunities" element={<Opportunities />} />
                  <Route path="opportunities/:id" element={<OpportunityDetail />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Route>
              </Routes>
            </BrowserRouter>
          }
          <Toaster richColors />
        </ThemeProvider>
      </FrappeProvider>
    </TooltipProvider>
  )
}

export default App
