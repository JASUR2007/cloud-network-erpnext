import { useParams, useNavigate } from 'react-router-dom'
import { useFrappeGetDoc } from 'frappe-react-sdk'
import { ArrowLeft, DollarSign, Calendar, User, Building2, Target } from 'lucide-react'
import { format } from 'date-fns'

export default function OpportunityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: opp, isLoading } = useFrappeGetDoc('Opportunity', id)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-6 h-64" />
          <div className="card p-6 h-64" />
        </div>
      </div>
    )
  }

  if (!opp) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Opportunity not found</p>
        <button onClick={() => navigate('/opportunities')} className="mt-4 text-violet-600 hover:underline text-sm">Back to Opportunities</button>
      </div>
    )
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 0 }).format(amount || 0)
  }

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

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/opportunities')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Opportunities
      </button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 crm-gradient rounded-xl flex items-center justify-center text-white text-xl font-bold">
            {(opp.opportunity_name || '?').charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{opp.opportunity_name}</h1>
            {opp.customer_name && (
              <p className="text-sm text-gray-500 mt-0.5">{opp.customer_name}</p>
            )}
            <span className={`inline-flex mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full ${stageColors[opp.sales_stage] || 'bg-gray-100 text-gray-700'}`}>
              {opp.sales_stage || opp.status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Expected Amount</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatAmount(opp.opportunity_amount, opp.currency)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Opportunity Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opp.opportunity_type && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Target className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{opp.opportunity_type}</p>
                  </div>
                </div>
              )}
              {opp.expected_closing && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expected Closing</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{format(new Date(opp.expected_closing), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Opportunity Owner</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{opp.opportunity_owner || 'Unassigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{opp.customer_name || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatAmount(opp.opportunity_amount, opp.currency)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
