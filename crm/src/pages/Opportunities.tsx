import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFrappeGetCall } from 'frappe-react-sdk'
import { Plus, Search, Filter, MoreHorizontal, DollarSign, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface Opportunity {
  name: string
  opportunity_name: string
  customer_name: string
  opportunity_type: string
  status: string
  expected_closing: string
  currency: string
  opportunity_amount: number
  sales_stage: string
  creation: string
}

export default function Opportunities() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useFrappeGetCall<{ message: Opportunity[] }>(
    'frappe.client.get_list',
    {
      doctype: 'Opportunity',
      fields: '["name", "opportunity_name", "customer_name", "opportunity_type", "status", "expected_closing", "currency", "opportunity_amount", "sales_stage", "creation"]',
      order_by: 'creation desc',
    }
  )

  const stageColors: Record<string, string> = {
    'Prospecting': 'bg-blue-100 text-blue-700',
    'Qualification': 'bg-violet-100 text-violet-700',
    'Needs Analysis': 'bg-indigo-100 text-indigo-700',
    'Value Proposition': 'bg-cyan-100 text-cyan-700',
    'Id. Decision Makers': 'bg-teal-100 text-teal-700',
    'Perception Analysis': 'bg-emerald-100 text-emerald-700',
    'Proposal/Price Quote': 'bg-amber-100 text-amber-700',
    'Negotiation/Review': 'bg-orange-100 text-orange-700',
    'Closed Won': 'bg-green-100 text-green-700',
    'Closed Lost': 'bg-red-100 text-red-700',
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 0 }).format(amount || 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Opportunities</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your sales pipeline</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white crm-gradient rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25">
          <Plus className="w-4 h-4" />
          New Opportunity
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        <button className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Filter className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opportunity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Closing</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {data?.message?.map(opp => (
                  <tr
                    key={opp.name}
                    onClick={() => navigate(`/opportunities/${opp.name}`)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{opp.opportunity_name}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{opp.customer_name || '-'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${stageColors[opp.sales_stage] || 'bg-gray-100 text-gray-700'}`}>
                        {opp.sales_stage || opp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                        {formatAmount(opp.opportunity_amount, opp.currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {opp.expected_closing ? format(new Date(opp.expected_closing), 'MMM d, yyyy') : '-'}
                      </span>
                    </td>
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
        )}
      </div>
    </div>
  )
}
