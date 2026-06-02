import { useState } from 'react'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { Plus, Search, MoreHorizontal, Phone, Mail, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface Customer {
  name: string
  customer_name: string
  customer_type: string
  customer_group: string
  territory: string
  email_id: string
  mobile_no: string
  city: string
  creation: string
  status: string
}

export default function Customers() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useFrappeGetCall<{ message: Customer[] }>(
    'frappe.client.get_list',
    {
      doctype: 'Customer',
      fields: '["name", "customer_name", "customer_type", "customer_group", "territory", "email_id", "mobile_no", "city", "creation"]',
      order_by: 'creation desc',
    }
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Your customer directory</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white crm-gradient rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25">
          <Plus className="w-4 h-4" />
          New Customer
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Group</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {data?.message?.map(customer => (
                  <tr key={customer.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">
                          {(customer.customer_name || '?').charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{customer.customer_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{customer.customer_type || '-'}</td>
                    <td className="px-4 py-3.5"><span className="inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">{customer.customer_group || '-'}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {customer.email_id && <Mail className="w-3.5 h-3.5 text-gray-400" />}
                        {customer.mobile_no && <Phone className="w-3.5 h-3.5 text-gray-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {customer.city || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{format(new Date(customer.creation), 'MMM d, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
