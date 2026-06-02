const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3000
const ROOT = path.resolve(__dirname, '..', 'erpnext', 'public', 'crm')

const MOCK_DATA = {
  leads: [
    { name: 'LEAD-001', lead_name: 'John Smith', company_name: 'Acme Corp', status: 'Qualified', email_id: 'john@acme.com', mobile_no: '+1 555-0101', website: 'https://acme.com', creation: '2026-05-15 10:30:00', lead_owner: 'Alice' },
    { name: 'LEAD-002', lead_name: 'Sarah Johnson', company_name: 'TechStart Inc', status: 'Lead', email_id: 'sarah@techstart.io', mobile_no: '+1 555-0102', creation: '2026-05-20 14:00:00', lead_owner: 'Bob' },
    { name: 'LEAD-003', lead_name: 'Mike Chen', company_name: 'DataFlow Systems', status: 'Contacted', email_id: 'mike@dataflow.com', mobile_no: '+1 555-0103', creation: '2026-05-22 09:15:00', lead_owner: 'Alice' },
    { name: 'LEAD-004', lead_name: 'Emily Davis', company_name: 'GreenEnergy Co', status: 'Converted', email_id: 'emily@greenenergy.com', creation: '2026-05-10 16:45:00', lead_owner: 'Charlie' },
    { name: 'LEAD-005', lead_name: 'Alex Kim', company_name: 'PixelSoft', status: 'Lost', email_id: 'alex@pixelsoft.dev', mobile_no: '+1 555-0104', creation: '2026-05-05 11:30:00', lead_owner: 'Bob' },
  ],
  opportunities: [
    { name: 'OPP-001', opportunity_name: 'ERP Implementation - Acme Corp', customer_name: 'Acme Corp', status: 'Open', sales_stage: 'Proposal/Price Quote', opportunity_amount: 150000, currency: 'USD', expected_closing: '2026-07-15', creation: '2026-05-16' },
    { name: 'OPP-002', opportunity_name: 'Cloud Migration - TechStart', customer_name: 'TechStart Inc', status: 'Open', sales_stage: 'Negotiation/Review', opportunity_amount: 85000, currency: 'USD', expected_closing: '2026-06-30', creation: '2026-05-21' },
    { name: 'OPP-003', opportunity_name: 'Data Analytics Platform', customer_name: 'DataFlow Systems', status: 'Open', sales_stage: 'Value Proposition', opportunity_amount: 200000, currency: 'USD', expected_closing: '2026-08-01', creation: '2026-05-23' },
    { name: 'OPP-004', opportunity_name: 'CRM Upgrade - GreenEnergy', customer_name: 'GreenEnergy Co', status: 'Closed Won', sales_stage: 'Closed Won', opportunity_amount: 45000, currency: 'USD', expected_closing: '2026-05-30', creation: '2026-04-10' },
    { name: 'OPP-005', opportunity_name: 'Mobile App - PixelSoft', customer_name: 'PixelSoft', status: 'Closed Lost', sales_stage: 'Closed Lost', opportunity_amount: 120000, currency: 'USD', expected_closing: '2026-06-01', creation: '2026-04-05' },
  ],
  customers: [
    { name: 'CUST-001', customer_name: 'Acme Corp', customer_type: 'Company', customer_group: 'Enterprise', territory: 'United States', email_id: 'info@acme.com', mobile_no: '+1 555-2001', city: 'New York', creation: '2026-01-15' },
    { name: 'CUST-002', customer_name: 'TechStart Inc', customer_type: 'Company', customer_group: 'Startup', territory: 'United States', email_id: 'hello@techstart.io', city: 'San Francisco', creation: '2026-02-20' },
    { name: 'CUST-003', customer_name: 'DataFlow Systems', customer_type: 'Company', customer_group: 'Enterprise', territory: 'United States', email_id: 'info@dataflow.com', city: 'Chicago', creation: '2026-03-10' },
  ],
  dashboard: {
    total_leads: 45,
    total_opportunities: 23,
    total_customers: 18,
    won_opportunities: 7,
    leads_by_status: [
      { status: 'Lead', count: 15 },
      { status: 'Contacted', count: 12 },
      { status: 'Qualified', count: 8 },
      { status: 'Converted', count: 6 },
      { status: 'Lost', count: 4 },
    ],
    opportunities_by_stage: [
      { stage: 'Prospecting', count: 5 },
      { stage: 'Qualification', count: 4 },
      { stage: 'Value Proposition', count: 3 },
      { stage: 'Proposal/Price Quote', count: 6 },
      { stage: 'Negotiation/Review', count: 3 },
      { stage: 'Closed Won', count: 7 },
      { stage: 'Closed Lost', count: 3 },
    ],
    monthly_trend: [
      { month: 'Jan', leads: 8, opportunities: 3 },
      { month: 'Feb', leads: 6, opportunities: 4 },
      { month: 'Mar', leads: 10, opportunities: 5 },
      { month: 'Apr', leads: 7, opportunities: 6 },
      { month: 'May', leads: 9, opportunities: 3 },
      { month: 'Jun', leads: 5, opportunities: 2 },
    ],
  },
}

function serveStatic(res, filePath) {
  const ext = path.extname(filePath)
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2' }
  const fullPath = path.join(ROOT, filePath.replace('/assets/erpnext/crm/', ''))
  
  if (!fs.existsSync(fullPath)) {
    res.writeHead(404)
    return res.end('Not found')
  }

  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' })
  fs.createReadStream(fullPath).pipe(res)
}

function apiResponse(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
  res.end(JSON.stringify({ message: data }))
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.end()

  console.log(`${req.method} ${req.url}`)

  // API endpoints
  if (req.url === '/api/method/erpnext.www.crm.get_dashboard_data') {
    return apiResponse(res, MOCK_DATA.dashboard)
  }
  if (req.url === '/api/method/erpnext.www.crm.get_context_for_dev') {
    return apiResponse(res, { boot: JSON.stringify({ user: { name: 'Administrator', email: 'admin@demo.local' }, sitename: 'demo.local', lang: 'en', desk_theme: 'Automatic', docs: [] }), layout_direction: 'ltr' })
  }
  if (req.url.startsWith('/api/method/frappe.client.get_list') && req.url.includes('Lead')) {
    return apiResponse(res, MOCK_DATA.leads)
  }
  if (req.url.startsWith('/api/method/frappe.client.get_list') && req.url.includes('Opportunity')) {
    return apiResponse(res, MOCK_DATA.opportunities)
  }
  if (req.url.startsWith('/api/method/frappe.client.get_list') && req.url.includes('Customer')) {
    return apiResponse(res, MOCK_DATA.customers)
  }
  if (req.url.startsWith('/api/method/frappe.client.get_count')) {
    return apiResponse(res, 45)
  }
  if (req.url.startsWith('/api/method/frappe.client.get') || req.url.includes('/api/resource/')) {
    const match = req.url.match(/\/Lead\/(.+)/) || req.url.match(/\/api\/resource\/Lead\/(.+)/)
    if (match) {
      const lead = MOCK_DATA.leads.find(l => l.name === match[1] || l.name === decodeURIComponent(match[1]))
      return apiResponse(res, lead || MOCK_DATA.leads[0])
    }
    const matchOpp = req.url.match(/\/Opportunity\/(.+)/) || req.url.match(/\/api\/resource\/Opportunity\/(.+)/)
    if (matchOpp) {
      const opp = MOCK_DATA.opportunities.find(o => o.name === matchOpp[1] || o.name === decodeURIComponent(matchOpp[1]))
      return apiResponse(res, opp || MOCK_DATA.opportunities[0])
    }
  }

  // Serve the CRM app HTML
  if (req.url === '/' || req.url === '/crm' || req.url === '/crm.html') {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8')
      .replace(/{{ lang }}/g, 'en')
      .replace(/{{layout_direction}}/g, 'ltr')
      .replace(/{{ favicon or ' \/assets\/erpnext\/images\/erpnext-favicon.svg' }}/g, '/assets/erpnext/images/erpnext-favicon.svg')
      .replace(/{{ app_name }}/g, 'Clothing System')
      .replace(/{{ frappe\.session\.csrf_token }}/g, 'demo-token')
      .replace(/JSON\.parse\({{ boot }}\)/g, "JSON.parse('{\"user\":{\"name\":\"Administrator\"},\"sitename\":\"demo.local\",\"lang\":\"en\",\"desk_theme\":\"Automatic\",\"docs\":[]}')")

    res.writeHead(200, { 'Content-Type': 'text/html' })
    return res.end(html)
  }

  // Static assets
  serveStatic(res, req.url)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  CRM Demo Server running!`)
  console.log(`  Local:   http://localhost:${PORT}/`)
  console.log(`  Network: http://0.0.0.0:${PORT}/\n`)
})
