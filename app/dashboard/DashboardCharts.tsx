'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DashboardChartsProps {
  monthlyData: { month: string; users: number }[]
  planData: { plan: string; count: number }[]
}

const PLAN_COLORS: Record<string, string> = {
  Gratuit: '#94a3b8',
  Basic: '#6366f1',
  Pro: '#8b5cf6',
  Family: '#ec4899',
}

export default function DashboardCharts({ monthlyData, planData }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Line chart - Nouveaux utilisateurs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Nouveaux utilisateurs</h3>
            <p className="text-xs text-gray-400">12 derniers mois</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-sm">
            📈
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f8fafc',
              }}
              formatter={(value) => [value, 'Nouveaux users']}
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#6366f1' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart - Plans */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Abonnements par plan</h3>
            <p className="text-xs text-gray-400">Distribution actuelle (estimé)</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-sm">
            💳
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={planData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="plan"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f8fafc',
              }}
              formatter={(value) => [value, 'Utilisateurs']}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              fill="#6366f1"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {planData.map((p) => (
            <div key={p.plan} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: PLAN_COLORS[p.plan] || '#6366f1' }}
              />
              <span className="text-xs text-gray-500">{p.plan}: <strong className="text-gray-700">{p.count}</strong></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
