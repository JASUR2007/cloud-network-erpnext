import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const isDemo = import.meta.env.VITE_DEMO === 'true'

const mountApp = () => {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

if (isDemo) {
  window.frappe = {
    boot: {
      user: { name: 'Administrator', email: 'admin@demo.local' },
      sitename: 'demo.local',
      lang: 'en',
      desk_theme: 'Automatic',
      docs: [],
      __messages: {},
    },
    csrf_token: 'demo',
    _messages: {},
    model: { sync: () => {} },
  }
  mountApp()
} else if (import.meta.env.DEV) {
  fetch('/api/method/erpnext.www.crm.get_context_for_dev', {
    method: 'POST',
  }).then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  }).then((values) => {
    if (!window.frappe) window.frappe = {};
    frappe.boot = JSON.parse(values.message.boot);
    frappe._messages = frappe.boot["__messages"];
    document.dir = values.message.layout_direction;
    frappe.model.sync(frappe.boot.docs);
    mountApp()
  }).catch((error) => {
    const reason = error instanceof Error ? error.message : 'Unable to load backend context'
    const root = document.getElementById('root') as HTMLElement
    root.innerHTML = `
      <div style="min-height:100vh;display:grid;place-items:center;padding:2rem;background:linear-gradient(180deg,#f8fafc,#eef2ff);font-family:InterVariable,ui-sans-serif,system-ui,sans-serif;color:#0f172a">
        <div style="width:min(760px,100%);background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;box-shadow:0 16px 42px -24px rgba(15,23,42,.35)">
          <h2 style="margin:0;font-size:1.2rem">CRM dev server is up, but ERPNext backend is unavailable.</h2>
          <p style="margin-top:.8rem;margin-bottom:.4rem;line-height:1.6">Start your Frappe/ERPNext backend on port 8000, or run with <code>VITE_DEMO=true</code> for demo mode.</p>
          <p style="margin-top:.9rem;color:#334155;line-height:1.6">Current error: ${reason}</p>
        </div>
      </div>`
  })
} else {
  frappe.model.sync(frappe.boot.docs);
  mountApp()
}
