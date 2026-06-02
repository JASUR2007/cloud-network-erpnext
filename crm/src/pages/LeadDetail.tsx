import { useParams, useNavigate } from 'react-router-dom'
import { useFrappeGetDoc, useFrappeUpdateDoc } from 'frappe-react-sdk'
import { ArrowLeft, Phone, Mail, Globe, MapPin, Building2, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: lead, isLoading } = useFrappeGetDoc('Lead', id)

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

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Lead not found</p>
        <button onClick={() => navigate('/leads')} className="mt-4 text-violet-600 hover:underline text-sm">Back to Leads</button>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    'Lead': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'Contacted': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    'Qualified': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'Converted': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    'Lost': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/leads')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </button>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 crm-gradient rounded-xl flex items-center justify-center text-white text-xl font-bold">
            {(lead.lead_name || '?').charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{lead.lead_name}</h1>
            {lead.company_name && (
              <p className="text-sm text-gray-500 mt-0.5">{lead.company_name}</p>
            )}
            <span className={`inline-flex mt-2 px-2.5 py-0.5 text-xs font-medium rounded-full ${statusColors[lead.status] || 'bg-gray-100 text-gray-700'}`}>
              {lead.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lead.email_id && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${lead.email_id}`} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-violet-600">{lead.email_id}</a>
                  </div>
                </div>
              )}
              {lead.mobile_no && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <a href={`tel:${lead.mobile_no}`} className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-violet-600">{lead.mobile_no}</a>
                  </div>
                </div>
              )}
              {lead.website && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Globe className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Website</p>
                    <a href={lead.website} target="_blank" rel="noopener" className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-violet-600">{lead.website}</a>
                  </div>
                </div>
              )}
              {lead.city && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">City</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.city}</p>
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
                  <p className="text-xs text-gray-500">Lead Owner</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.lead_owner || 'Unassigned'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Company</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.company_name || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.creation ? format(new Date(lead.creation), 'MMM d, yyyy') : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
