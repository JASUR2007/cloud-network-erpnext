import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFrappeGetCall, useFrappeCreateDoc, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { Plus, Search, Filter, MoreHorizontal, Phone, Mail, Globe, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

interface Lead {
  name: string
  lead_name: string
  company_name: string
  status: string
  email_id: string
  mobile_no: string
  website: string
  creation: string
  lead_owner: string
}

export default function Leads() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 10

  const { data, isLoading, mutate } = useFrappeGetCall<{ message: Lead[] }>(
    'frappe.client.get_list',
    {
      doctype: 'Lead',
      fields: '["name", "lead_name", "company_name", "status", "email_id", "mobile_no", "website", "creation", "lead_owner"]',
      order_by: 'creation desc',
      limit_start: page * pageSize,
      limit_page_length: pageSize,
      ...(search && { filters: JSON.stringify([['lead_name', 'like', `%${search}%`]]) }),
      ...(statusFilter && { filters: JSON.stringify([['status', '=', statusFilter]]) }),
    }
  )

  const { data: countData } = useFrappeGetCall<{ message: number }>(
    'frappe.client.get_count',
    { doctype: 'Lead' }
  )

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Lead': 'bg-blue-100 text-blue-700',
      'Contacted': 'bg-amber-100 text-amber-700',
      'Qualified': 'bg-emerald-100 text-emerald-700',
      'Converted': 'bg-violet-100 text-violet-700',
      'Lost': 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your incoming leads</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white crm-gradient rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25">
          <Plus className="w-4 h-4" />
          New Lead
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        >
          <option value="">All Status</option>
          <option value="Lead">Lead</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>
        <button className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Filter className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {data?.message?.map(lead => (
                    <tr
                      key={lead.name}
                      onClick={() => navigate(`/leads/${lead.name}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.lead_name}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{lead.company_name || '-'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${statusBadge(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {lead.email_id && (
                            <a href={`mailto:${lead.email_id}`} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-violet-600" onClick={e => e.stopPropagation()}>
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lead.mobile_no && (
                            <a href={`tel:${lead.mobile_no}`} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-violet-600" onClick={e => e.stopPropagation()}>
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lead.website && (
                            <a href={lead.website} target="_blank" rel="noopener" className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-violet-600" onClick={e => e.stopPropagation()}>
                              <Globe className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">{format(new Date(lead.creation), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3.5">
                        <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500">
                {countData?.message ?? 0} total leads
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">Page {page + 1}</span>
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
