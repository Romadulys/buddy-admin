import DeviceDetailClient from './DeviceDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

const MOCK_TRANSACTIONS = [
  { date: '2026-03-31T12:30:00', merchant: 'Cantine scolaire', amount: 2.50, status: 'completed' },
  { date: '2026-03-30T08:15:00', merchant: 'Bus RATP', amount: 1.20, status: 'completed' },
  { date: '2026-03-29T16:45:00', merchant: 'Distributeur automatique', amount: 0.80, status: 'completed' },
  { date: '2026-03-28T12:10:00', merchant: 'Cantine scolaire', amount: 2.50, status: 'completed' },
  { date: '2026-03-27T08:05:00', merchant: 'Bus RATP', amount: 1.20, status: 'declined' },
]

const MOCK_EVENTS = [
  { type: 'gps_update', timestamp: '2026-03-31T13:00:00', payload: 'lat: 48.8566, lng: 2.3522' },
  { type: 'sos_triggered', timestamp: '2026-03-31T11:30:00', payload: 'bouton pressé 3s, batterie: 68%' },
  { type: 'nfc_tap', timestamp: '2026-03-31T12:30:00', payload: 'cantine — 2,50€ débité' },
  { type: 'reboot', timestamp: '2026-03-30T22:00:00', payload: 'firmware v2.4.1 → v2.5.0' },
  { type: 'geofence_exit', timestamp: '2026-03-30T17:15:00', payload: 'zone "Maison" quittée' },
  { type: 'low_battery', timestamp: '2026-03-30T16:45:00', payload: 'batterie: 15%' },
]

export default async function DeviceDetailPage({ params }: PageProps) {
  const { id } = await params

  const device = {
    deviceId: id,
    serial: id,
    type: id.includes('00001') || id.includes('00003') || id.includes('00004') ? 'Buddy Mini' : 'Buddy Big',
    firmware: 'v2.5.0',
    status: 'online',
    lastSeen: '2026-03-31T13:00:00',
    battery: 72,
    iccid: '8933150319052177853',
    wifiMac: 'A4:CF:12:8E:3B:01',
    lat: 48.8566,
    lng: 2.3522,
    city: 'Paris 11e',
    accuracy: '8m',
    nfcStatus: 'active',
    nfcBalance: 4.50,
    nfcDailyLimit: 5.00,
    transactions: MOCK_TRANSACTIONS,
    events: MOCK_EVENTS,
  }

  return <DeviceDetailClient device={device} />
}
