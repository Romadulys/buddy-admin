interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  color?: 'indigo' | 'green' | 'blue' | 'orange' | 'red' | 'purple'
  trend?: { value: string; positive: boolean }
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'bg-indigo-100 text-indigo-600',
    accent: 'text-indigo-600',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    accent: 'text-green-600',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    accent: 'text-blue-600',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-100 text-orange-600',
    accent: 'text-orange-600',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    accent: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    accent: 'text-purple-600',
  },
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'indigo',
  trend,
}: StatsCardProps) {
  const colors = colorMap[color]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center text-lg flex-shrink-0 ml-3`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
