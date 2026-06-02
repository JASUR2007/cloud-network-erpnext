import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './lib/namespace'
import { DirectionProvider } from './components/ui/direction.tsx'

const mountApp = (dir: string) => {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <DirectionProvider dir={dir}>
        <App />
      </DirectionProvider>
    </StrictMode>,
  )
}

const renderBackendHint = (reason: string) => {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background: 'linear-gradient(180deg, #f8fafc, #eef2ff)',
        fontFamily: 'InterVariable, ui-sans-serif, system-ui, sans-serif',
        color: '#0f172a'
      }}>
        <div style={{
          width: 'min(760px, 100%)',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 16px 42px -24px rgba(15, 23, 42, 0.35)'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Banking dev server is up, but ERPNext backend context is unavailable.</h2>
          <p style={{ marginTop: '0.8rem', marginBottom: '0.4rem', lineHeight: 1.6 }}>
            Start your Frappe/ERPNext backend and make sure this endpoint responds with 200:
          </p>
          <pre style={{
            margin: 0,
            marginTop: '0.4rem',
            padding: '12px',
            borderRadius: '10px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            whiteSpace: 'pre-wrap'
          }}>/api/method/erpnext.www.banking.get_context_for_dev</pre>
          <p style={{ marginTop: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
            Current error: {reason}
          </p>
        </div>
      </div>
    </StrictMode>,
  )
}


if (import.meta.env.DEV) {
  fetch('/api/method/erpnext.www.banking.get_context_for_dev', {
    method: 'POST',
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  }).then((values) => {
    if (!window.frappe) window.frappe = {};
    //@ts-expect-error - frappe will be available
    frappe.boot = JSON.parse(values.message.boot);
    //@ts-expect-error - frappe will be available
    frappe._messages = frappe.boot["__messages"];

    // Set document direction to rtl
    document.dir = values.message.layout_direction;
    //@ts-expect-error - frappe will be available
    frappe.model.sync(frappe.boot.docs);
    mountApp(values.message.layout_direction)

  }).catch((error) => {
    const message = error instanceof Error ? error.message : 'Unable to load backend context'
    renderBackendHint(message)
  })
} else {
  //@ts-expect-error - frappe will be available
  frappe.model.sync(frappe.boot.docs);
  mountApp(window.frappe?.boot?.layout_direction ?? 'ltr')
}
