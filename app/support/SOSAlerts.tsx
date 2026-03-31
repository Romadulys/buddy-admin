'use client'

import { useState } from 'react'

interface SOSAlert {
  id: string
  childName: string
  deviceSerial: string
  timestamp: string
  gpsLat: number
  gpsLng: number
  gpsCity: string
  batteryAtTrigger: number
  status: 'active' | 'resolved'
}

const MOCK_SOS_ALERTS: SOSAlert[] = [
  {
    id: 'SOS-001',
    childName: 'Emma Dupont',
    deviceSerial: 'BDY-00001',
    timestamp: '2026-03-31T11:30:00',
    gpsLat: 48.8566,
    gpsLng: 2.3522,
    gpsCity: 'Paris 11e',
    batteryAtTrigger: 68,
    status: 'active',
  },
  {
    id: 'SOS-002',
    childName: 'Lucas Martin',
    deviceSerial: 'BDY-00003',
    timestamp: '2026-03-30T16:45:00',
    gpsLat: 45.7640,
    gpsLng: 4.8357,
    gpsCity: 'Lyon 3e',
    batteryAtTrigger: 42,
    status: 'resolved',
  },
  {
    id: 'SOS-003',
    childName: 'Chloé Bernard',
    deviceSerial: 'BDY-00007',
    timestamp: '2026-03-29T09:12:00',
    gpsLat: 43.2965,
    gpsLng: 5.3698,
    gpsCity: 'Marseille 2e',
    batteryAtTrigger: 91,
    status: 'resolved',
  },
]

export default function SOSAlerts() {
  const [alerts, setAlerts] = useState(MOCK_SOS_ALERTS)

  const handleResolve = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a))
    )
  }

  const activeCount = alerts.filter((a) => a.status === 'active').length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-gray-900">🚨 Alertes SOS</h2>
        {activeCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full animate-pulse">
            {activeCount} en cours
          </span>
        )}
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
              alert.status === 'active'
                ? 'border-red-200 border-l-4 border-l-red-500'
                : 'border-gray-100 border-l-4 border-l-green-400'
            }`}
          >
            <div className="p-4 space-y-3">
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                    🚨 SOS
                  </span>
                  <span className="font-semibold text-sm text-gray-900">{alert.childName}</span>
                  <span className="font-mono text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {alert.deviceSerial}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    alert.status === 'active'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {alert.status === 'active' ? 'En cours' : 'Résolu'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(alert.timestamp).toLocaleString('fr-FR', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* GPS + battery */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                <span>
                  {alert.gpsLat}°N, {alert.gpsLng}°E — {alert.gpsCity}
                </span>
                <a
                  href={`https://maps.google.com/?q=${alert.gpsLat},${alert.gpsLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  📍 Voir sur carte
                </a>
                <span className="text-gray-400">·</span>
                <span>Batterie au déclenchement: <strong>{alert.batteryAtTrigger}%</strong></span>
              </div>

              {/* Audio clips */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium text-gray-500 self-center">Clips audio:</span>
                {[1, 2, 3].map((clip) => (
                  <button
                    key={clip}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-medium rounded-lg transition-colors"
                    onClick={() => {}}
                  >
                    ▶ Clip {clip} (10s)
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              {alert.status === 'active' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Marquer résolu
                  </button>
                  <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg transition-colors border border-indigo-200">
                    Contacter famille
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
