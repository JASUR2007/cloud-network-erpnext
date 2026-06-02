#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const crmPublicDir = path.resolve(__dirname, '..', 'erpnext', 'public', 'crm')
const srcHtml = path.join(crmPublicDir, 'index.html')
const demoHtml = path.join(crmPublicDir, 'index.html')

if (!fs.existsSync(srcHtml)) {
  console.error('Build output not found. Run npm run build first.')
  process.exit(1)
}

const mockBoot = JSON.stringify({
  user: { name: 'Administrator', email: 'admin@demo.local' },
  sitename: 'demo.local',
  lang: 'en',
  desk_theme: 'Automatic',
  docs: [],
})

let html = fs.readFileSync(srcHtml, 'utf-8')
  .replace(/{{ lang }}/g, 'en')
  .replace(/{{layout_direction}}/g, 'ltr')
  .replace(/{{ favicon or ' \/assets\/erpnext\/images\/erpnext-favicon.svg' }}/g, '/assets/erpnext/images/erpnext-favicon.svg')
  .replace(/{{ app_name }}/g, 'Clothing System')
  .replace(/{{ frappe\.session\.csrf_token }}/g, 'demo-token')
  .replace(/JSON\.parse\({{ boot }}\)/g, `JSON.parse('${mockBoot}')`)

fs.writeFileSync(demoHtml, html)
console.log('Demo HTML generated successfully!')
