import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const MOCK_CITIES = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Nantes', 'Strasbourg', 'Lille', 'Nice', 'Rennes']
const DEVICE_TYPES = ['Buddy Mini', 'Buddy Big', 'Buddy Mini', 'Buddy Mini', 'Buddy Big']
const NFC_STATUSES = ['active', 'active', 'inactive', 'active', 'inactive']
const NFC_BALANCES = [4.50, 2.10, 0.00, 7.80, 1.30]

function generateMockDevices(users: { id: string; email: string }[]) {
  // Generate mock devices — roughly 80% of users have a device
  return users.slice(0, Math.ceil(users.length * 0.8)).map((user, idx) => {
    const lastContactMs = Date.now() - Math.random() * 1000 * 60 * 60 * 48 // Last 48h
    const isOnline = lastContactMs > Date.now() - 1000 * 60 * 30 // Online if last 30 min
    return {
      deviceId: `BDY-${String(idx + 1).padStart(5, '0')}`,
      email: user.email,
      type: DEVICE_TYPES[idx % DEVICE_TYPES.length],
      city: MOCK_CITIES[idx % MOCK_CITIES.length],
      lastContact: new Date(lastContactMs),
      status: isOnline ? 'online' : 'offline',
      userId: user.id,
      nfcStatus: NFC_STATUSES[idx % NFC_STATUSES.length],
      nfcBalance: NFC_BALANCES[idx % NFC_BALANCES.length],
    }
  })
}

async function getDevicesData() {
  const { data: usersData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const users = (usersData?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? '—',
  }))
  return generateMockDevices(users)
}

export default async function DevicesPage() {
  const devices = await getDevicesData()

  const onlineCount = devices.filter((d) => d.status === 'online').length
  const offlineCount = devices.filter((d) => d.status === 'offline').length
  const miniCount = devices.filter((d) => d.type === 'Buddy Mini').length
  const bigCount = devices.filter((d) => d.type === 'Buddy Big').length

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appareils</h1>
          <p className="text-sm text-gray-500 mt-0.5">{devices.length} appareils enregistrés</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 font-medium text-amber-700">
          <span>⚠️</span>
          Données simulées — intégration IoT en cours
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total appareils', value: devices.length, icon: '📱', color: 'bg-indigo-50 text-indigo-600' },
          { label: 'En ligne', value: onlineCount, icon: '🟢', color: 'bg-green-50 text-green-600' },
          { label: 'Hors ligne', value: offlineCount, icon: '🔴', color: 'bg-red-50 text-red-600' },
          { label: 'Buddy Mini', value: miniCount, icon: '📡', color: 'bg-blue-50 text-blue-600' },
        ].map((card) => (
          <div key={card.label} className={`${card.color} rounded-xl p-4 border border-current/10`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium opacity-70">{card.label}</p>
              <span>{card.icon}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Device ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Compte lié</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ville</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Dernier contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">NFC</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {devices.map((device, idx) => (
                <tr
                  key={device.deviceId}
                  className={`hover:bg-indigo-50/30 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                      {device.deviceId}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] truncate">
                    {device.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      device.type === 'Buddy Mini'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {device.type === 'Buddy Mini' ? '📡' : '📦'} {device.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span>🏙️</span>
                      {device.city}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {device.lastContact.toLocaleString('fr-FR', {
                      day: '2-digit', month: 'short',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      device.status === 'online'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                      {device.status === 'online' ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        device.nfcStatus === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {device.nfcStatus === 'active' ? '💳 NFC Actif' : 'NFC Inactif'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Solde: {device.nfcBalance.toFixed(2).replace('.', ',')}€
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/devices/${device.deviceId}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg transition-colors"
                    >
                      Détails →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
          <p className="text-xs text-gray-400">
            Affichage de {devices.length} appareils · Buddy Mini: {miniCount} · Buddy Big: {bigCount}
          </p>
        </div>
      </div>
    </div>
  )
}
