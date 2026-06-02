import { useFrappeGetCall } from 'frappe-react-sdk'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Target, Building2, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface DashboardData {
  total_leads: number
  total_opportunities: number
  total_customers: number
  won_opportunities: number
  leads_by_status: { status: string; count: number }[]
  opportunities_by_stage: { stage: string; count: number }[]
  monthly_trend: { month: string; leads: number; opportunities: number }[]
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export default function Dashboard() {
  const { data, isLoading } = useFrappeGetCall<{ message: DashboardData }>(
    'erpnext.www.crm.get_dashboard_data'
  )

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-5 h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 h-80" />
          <div className="card p-6 h-80" />
        </div>
      </div>
    )
  }

  const d = data?.message

  const stats = [
    { label: 'Total Leads', value: d?.total_leads ?? 0, icon: Users, color: 'text-violet-600', bg: 'bg-violet-100', change: '+12%', positive: true },
    { label: 'Opportunities', value: d?.total_opportunities ?? 0, icon: Target, color: 'text-blue-600', bg: 'bg-blue-100', change: '+8%', positive: true },
    { label: 'Customers', value: d?.total_customers ?? 0, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-100', change: '+23%', positive: true },
    { label: 'Won Deals', value: d?.won_opportunities ?? 0, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100', change: '-3%', positive: false },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Your CRM overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="crm-stat-card">
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${stat.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.change}
                {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </span>
            </div>
            <span className="crm-stat-value">{stat.value}</span>
            <span className="crm-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Monthly Trend</h3>
          <div className="h-64">
            {d?.monthly_trend ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="leads" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Leads" />
                  <Bar dataKey="opportunities" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Opportunities" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data yet</div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Leads by Status</h3>
          <div className="h-64">
            {d?.leads_by_status ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={d.leads_by_status}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  >
                    {d.leads_by_status.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
