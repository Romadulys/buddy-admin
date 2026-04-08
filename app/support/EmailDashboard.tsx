'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts'
import StatsCard from '@/components/StatsCard'
import { getMockDashboardData, getInboxStats } from '@/lib/email-mock'

export default function EmailDashboard() {
  const dashboardData = getMockDashboardData()
  const stats = getInboxStats()

  // Prepare pie chart data - distribution by category
  const pieChartData = [
    { name: 'Support B2C', value: 5 },
    { name: 'Commercial B2B', value: 4 },
    { name: 'Facturation', value: 2 },
    { name: 'Question générale', value: 2 },
    { name: 'Retour produit', value: 1 },
    { name: 'Partenariat', value: 1 },
    { name: 'Interne', value: 0 },
  ]

  const pieColors = ['#6366f1', '#8b5cf6', '#f59e0b', '#14b8a6', '#ec4899', '#6b7280', '#94a3b8']

  // Sentiment distribution data
  const sentimentData = [
    { name: 'Positif', count: 4, fill: '#10b981' },
    { name: 'Neutre', count: 6, fill: '#6b7280' },
    { name: 'Négatif', count: 3, fill: '#ef4444' },
    { name: 'Urgent', count: 2, fill: '#f59e0b' },
  ]

  // Top 5 keywords with percentage
  const topKeywords = [
    { keyword: 'support', percentage: 92 },
    { keyword: 'commande', percentage: 78 },
    { keyword: 'urgent', percentage: 65 },
    { keyword: 'partenariat', percentage: 58 },
    { keyword: 'batterie', percentage: 45 },
  ]

  // Calculate metrics for stat cards
  const todayVolume = dashboardData[dashboardData.length - 1]?.nouveau || 0
  const weekVolume = dashboardData.slice(-7).reduce((sum, d) => sum + d.nouveau, 0)
  const resolutionRate = stats.resolu > 0 ? Math.round((stats.resolu / stats.total) * 100) : 0
  const avgResponseTime = '2h 45m' // Mock value

  return (
    <div className="space-y-6 p-6">
      {/* Row 1: Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Volume aujourd'hui"
          value={todayVolume}
          icon="📧"
          color="indigo"
        />
        <StatsCard
          title="Volume semaine"
          value={weekVolume}
          icon="📈"
          color="blue"
        />
        <StatsCard
          title="Taux resolution"
          value={`${resolutionRate}%`}
          icon="✅"
          color="green"
        />
        <StatsCard
          title="Temps reponse moyen"
          value={avgResponseTime}
          icon="⚡"
          color="orange"
        />
      </div>

      {/* Row 2: Line Chart and Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Volume par jour */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Volume de mails (30 jours)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dashboardData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="date" stroke="#d1d5db" style={{ fontSize: '12px' }} />
              <YAxis stroke="#d1d5db" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="nouveau"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Distribution par categorie */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Repartition par categorie</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Bar Chart and Keywords List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Sentiment Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Sentiment des messages</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sentimentData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#d1d5db" style={{ fontSize: '12px' }} />
              <YAxis stroke="#d1d5db" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#6366f1">
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Keywords with Progress Bars */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Mots-cles recurrents</h3>
          <div className="space-y-4">
            {topKeywords.map((item) => (
              <div key={item.keyword}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.keyword}</span>
                  <span className="text-xs text-gray-500">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
