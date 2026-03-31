'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Transaction {
  date: string
  merchant: string
  amount: number
  status: string
}

interface DeviceEvent {
  type: string
  timestamp: string
  payload: string
}

interface Device {
  deviceId: string
  serial: string
  type: string
  firmware: string
  status: string
  lastSeen: string
  battery: number
  iccid: string
  wifiMac: string
  lat: number
  lng: number
  city: string
  accuracy: string
  nfcStatus: string
  nfcBalance: number
  nfcDailyLimit: number
  transactions: Transaction[]
  events: DeviceEvent[]
}

const EVENT_COLORS: Record<string, string> = {
  gps_update: 'bg-blue-100 text-blue-700',
  sos_triggered: 'bg-red-100 text-red-700',
  nfc_tap: 'bg-green-100 text-green-700',
  reboot: 'bg-gray-100 text-gray-600',
  geofence_exit: 'bg-orange-100 text-orange-700',
  low_battery: 'bg-amber-100 text-amber-700',
}

const TABS = ['Informations', 'Position', 'NFC & Paiements', 'Historique']

export default function DeviceDetailClient({ device }: { device: Device }) {
  const [activeTab, setActiveTab] = useState(0)
  const [nfcEnabled, setNfcEnabled] = useState(device.nfcStatus === 'active')

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/devices" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Appareils
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-mono text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
          {device.deviceId}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          device.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
          {device.status === 'online' ? 'En ligne' : 'Hors ligne'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === idx
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: Informations */}
      {activeTab === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Informations appareil</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Numéro de série', value: device.serial, mono: true },
              { label: 'Type', value: device.type },
              { label: 'Firmware', value: device.firmware, mono: true },
              { label: 'Statut', value: device.status === 'online' ? 'En ligne' : 'Hors ligne' },
              { label: 'Dernier contact', value: new Date(device.lastSeen).toLocaleString('fr-FR') },
              { label: 'Batterie', value: `${device.battery}%` },
              { label: 'eSIM ICCID', value: device.iccid, mono: true },
              { label: 'Wi-Fi MAC', value: device.wifiMac, mono: true },
            ].map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{row.label}</span>
                <span className={`text-sm text-gray-800 ${row.mono ? 'font-mono bg-gray-50 px-2 py-0.5 rounded text-xs' : ''}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Batterie</span>
              <span className="text-xs font-semibold text-gray-700">{device.battery}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  device.battery > 50 ? 'bg-green-500' : device.battery > 20 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${device.battery}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Position */}
      {activeTab === 1 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Dernière position connue</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Latitude</span>
              <span className="font-mono text-sm text-gray-800">{device.lat}°N</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Longitude</span>
              <span className="font-mono text-sm text-gray-800">{device.lng}°E</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Ville</span>
              <span className="text-sm text-gray-800">{device.city}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Précision GPS</span>
              <span className="text-sm text-gray-800">{device.accuracy}</span>
            </div>
          </div>
          <a
            href={`https://maps.google.com/?q=${device.lat},${device.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            📍 Voir sur Google Maps
          </a>
          <div className="mt-4 bg-gray-50 rounded-xl border border-gray-100 p-4 text-center text-sm text-gray-400">
            <p>Carte en temps réel</p>
            <p className="text-xs mt-1">Intégration Mapbox / Google Maps — bientôt disponible</p>
            <p className="font-mono text-xs mt-2 text-indigo-500">{device.lat}°N, {device.lng}°E</p>
          </div>
        </div>
      )}

      {/* Tab 3: NFC & Paiements */}
      {activeTab === 2 && (
        <div className="space-y-4">
          {/* Status toggle */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Statut NFC</p>
              <p className="text-xs text-gray-400 mt-0.5">Activer ou désactiver les paiements sans contact</p>
            </div>
            <button
              onClick={() => setNfcEnabled(!nfcEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                nfcEnabled ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  nfcEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Balance & limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Solde NFC</p>
              <p className="text-3xl font-bold text-gray-900">{device.nfcBalance.toFixed(2).replace('.', ',')}€</p>
              <button className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors">
                Recharger →
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Plafond journalier</p>
              <p className="text-3xl font-bold text-gray-900">{device.nfcDailyLimit.toFixed(2).replace('.', ',')}€</p>
              <button className="mt-3 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-lg transition-colors">
                Modifier
              </button>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Transactions récentes</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Marchand</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500">Montant</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {device.transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-xs text-gray-500">
                      {new Date(tx.date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-800">{tx.merchant}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-right text-gray-900">
                      -{tx.amount.toFixed(2).replace('.', ',')}€
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.status === 'completed' ? 'Accepté' : 'Refusé'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Historique */}
      {activeTab === 3 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Événements appareil</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Horodatage</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500">Résumé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {device.events.map((ev, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      EVENT_COLORS[ev.type] ?? 'bg-gray-100 text-gray-600'
                    }`}>
                      {ev.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">
                    {new Date(ev.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-600">{ev.payload}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
