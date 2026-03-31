// ============================================================
// B2B Mock Data — Buddy Admin
// Used while Supabase tables are being populated
// ============================================================

export interface B2BClient {
  id: string
  company_name: string
  contact_name: string
  contact_email: string
  contact_phone: string
  city: string
  country: string
  siret: string
  address?: string
  vat_number?: string
  notes?: string
  created_at: string
}

export interface OrderItem {
  product_name: string
  product_type?: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface B2BOrder {
  id: string
  order_number: string
  client_id: string
  client_name: string
  status: 'draft' | 'confirmed' | 'invoiced' | 'shipped' | 'delivered' | 'cancelled'
  order_date: string
  delivery_date: string | null
  shipping_address?: string
  subtotal: number
  tax_rate?: number
  tax_amount: number
  total: number
  invoice_number: string | null
  invoice_date: string | null
  notes?: string
  items: OrderItem[]
}

export interface B2BDelivery {
  id: string
  order_id: string
  order_number: string
  client_name: string
  delivery_number: string
  status: 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'returned'
  carrier: string | null
  tracking_number: string | null
  tracking_url?: string | null
  shipped_at: string | null
  delivered_at: string | null
  delivery_address: string
  notes?: string
}

export const mockB2BClients: B2BClient[] = [
  {
    id: '1',
    company_name: "Toy's R Us France",
    contact_name: 'Marc Leblanc',
    contact_email: 'marc@toysrus.fr',
    contact_phone: '+33 1 23 45 67 89',
    city: 'Paris',
    country: 'France',
    siret: '12345678901234',
    address: '12 Rue du Commerce, 75015 Paris',
    created_at: '2026-01-15',
  },
  {
    id: '2',
    company_name: 'King Jouet',
    contact_name: 'Sophie Martin',
    contact_email: 'sophie@kingjouet.fr',
    contact_phone: '+33 4 56 78 90 12',
    city: 'Grenoble',
    country: 'France',
    siret: '98765432109876',
    address: '45 Avenue des Alpes, 38000 Grenoble',
    created_at: '2026-02-01',
  },
  {
    id: '3',
    company_name: 'Fnac Darty',
    contact_name: 'Pierre Dubois',
    contact_email: 'pierre@fnacdarty.com',
    contact_phone: '+33 1 78 90 12 34',
    city: 'Paris',
    country: 'France',
    siret: '11223344556677',
    address: '9 Rue des Entrepreneurs, 75015 Paris',
    created_at: '2026-02-20',
  },
  {
    id: '4',
    company_name: 'Intersport',
    contact_name: 'Laura Chen',
    contact_email: 'laura@intersport.fr',
    contact_phone: '+33 4 90 12 34 56',
    city: 'Lyon',
    country: 'France',
    siret: '44556677889900',
    address: '18 Boulevard des Brotteaux, 69006 Lyon',
    created_at: '2026-03-05',
  },
]

export const mockOrders: B2BOrder[] = [
  {
    id: '1',
    order_number: 'CMD-2026-001',
    client_id: '1',
    client_name: "Toy's R Us France",
    status: 'delivered',
    order_date: '2026-01-20',
    delivery_date: '2026-02-15',
    shipping_address: '12 Rue du Commerce, 75015 Paris',
    subtotal: 149800,
    tax_rate: 20,
    tax_amount: 29960,
    total: 179760,
    invoice_number: 'FAC-2026-001',
    invoice_date: '2026-01-22',
    items: [
      { product_name: 'Buddy Mini', product_type: 'mini', quantity: 800, unit_price: 89, total_price: 71200 },
      { product_name: 'Buddy Big', product_type: 'big', quantity: 400, unit_price: 129, total_price: 51600 },
      { product_name: 'Chargeur USB-C Pack 10', product_type: 'accessory', quantity: 120, unit_price: 228, total_price: 27360 },
    ],
  },
  {
    id: '2',
    order_number: 'CMD-2026-002',
    client_id: '2',
    client_name: 'King Jouet',
    status: 'shipped',
    order_date: '2026-02-10',
    delivery_date: '2026-03-01',
    shipping_address: '45 Avenue des Alpes, 38000 Grenoble',
    subtotal: 53500,
    tax_rate: 20,
    tax_amount: 10700,
    total: 64200,
    invoice_number: 'FAC-2026-002',
    invoice_date: '2026-02-12',
    items: [
      { product_name: 'Buddy Mini', product_type: 'mini', quantity: 500, unit_price: 89, total_price: 44500 },
      { product_name: 'Buddy Big', product_type: 'big', quantity: 70, unit_price: 129, total_price: 9030 },
    ],
  },
  {
    id: '3',
    order_number: 'CMD-2026-003',
    client_id: '3',
    client_name: 'Fnac Darty',
    status: 'invoiced',
    order_date: '2026-03-01',
    delivery_date: '2026-04-01',
    shipping_address: '9 Rue des Entrepreneurs, 75015 Paris',
    subtotal: 96700,
    tax_rate: 20,
    tax_amount: 19340,
    total: 116040,
    invoice_number: 'FAC-2026-003',
    invoice_date: '2026-03-05',
    items: [
      { product_name: 'Buddy Mini', product_type: 'mini', quantity: 600, unit_price: 89, total_price: 53400 },
      { product_name: 'Buddy Big', product_type: 'big', quantity: 300, unit_price: 129, total_price: 38700 },
      { product_name: 'Starter Pack', product_type: 'accessory', quantity: 50, unit_price: 92, total_price: 4600 },
    ],
  },
  {
    id: '4',
    order_number: 'CMD-2026-004',
    client_id: '1',
    client_name: "Toy's R Us France",
    status: 'confirmed',
    order_date: '2026-03-20',
    delivery_date: '2026-05-01',
    shipping_address: '12 Rue du Commerce, 75015 Paris',
    subtotal: 267000,
    tax_rate: 20,
    tax_amount: 53400,
    total: 320400,
    invoice_number: null,
    invoice_date: null,
    notes: 'Remise volume accordée — 2000 unités Buddy Mini à 84€, 600 Buddy Big à 115€',
    items: [
      { product_name: 'Buddy Mini', product_type: 'mini', quantity: 2000, unit_price: 84, total_price: 168000 },
      { product_name: 'Buddy Big', product_type: 'big', quantity: 600, unit_price: 115, total_price: 69000 },
      { product_name: 'Présentoir retail x10', product_type: 'accessory', quantity: 30, unit_price: 1000, total_price: 30000 },
    ],
  },
  {
    id: '5',
    order_number: 'CMD-2026-005',
    client_id: '4',
    client_name: 'Intersport',
    status: 'draft',
    order_date: '2026-03-30',
    delivery_date: null,
    subtotal: 0,
    tax_rate: 20,
    tax_amount: 0,
    total: 0,
    invoice_number: null,
    invoice_date: null,
    items: [],
  },
]

export const mockDeliveries: B2BDelivery[] = [
  {
    id: '1',
    order_id: '1',
    order_number: 'CMD-2026-001',
    client_name: "Toy's R Us France",
    delivery_number: 'LIV-2026-001',
    status: 'delivered',
    carrier: 'DHL Express',
    tracking_number: '1234567890',
    tracking_url: 'https://www.dhl.com/fr-fr/home/tracking.html?tracking-id=1234567890',
    shipped_at: '2026-02-01',
    delivered_at: '2026-02-14',
    delivery_address: '12 Rue du Commerce, 75015 Paris',
  },
  {
    id: '2',
    order_id: '2',
    order_number: 'CMD-2026-002',
    client_name: 'King Jouet',
    delivery_number: 'LIV-2026-002',
    status: 'in_transit',
    carrier: 'FedEx',
    tracking_number: '9876543210',
    tracking_url: 'https://www.fedex.com/fedextrack/?trknbr=9876543210',
    shipped_at: '2026-02-20',
    delivered_at: null,
    delivery_address: '45 Avenue des Alpes, 38000 Grenoble',
  },
  {
    id: '3',
    order_id: '3',
    order_number: 'CMD-2026-003',
    client_name: 'Fnac Darty',
    delivery_number: 'LIV-2026-003',
    status: 'preparing',
    carrier: null,
    tracking_number: null,
    tracking_url: null,
    shipped_at: null,
    delivered_at: null,
    delivery_address: '9 Rue des Entrepreneurs, 75015 Paris',
  },
]

// ============================================================
// Helper utilities
// ============================================================

export function formatEur(amount: number): string {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}

export function getOrdersByClient(clientId: string): B2BOrder[] {
  return mockOrders.filter((o) => o.client_id === clientId)
}

export function getClientById(id: string): B2BClient | undefined {
  return mockB2BClients.find((c) => c.id === id)
}

export function getOrderById(id: string): B2BOrder | undefined {
  return mockOrders.find((o) => o.id === id)
}

export function getDeliveryByOrderId(orderId: string): B2BDelivery | undefined {
  return mockDeliveries.find((d) => d.order_id === orderId)
}

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  confirmed: 'Confirmé',
  invoiced: 'Facturé',
  shipped: 'Expédié',
  delivered: 'Livré',
  cancelled: 'Annulé',
  preparing: 'En préparation',
  in_transit: 'En transit',
  returned: 'Retourné',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  confirmed: 'bg-blue-100 text-blue-700',
  invoiced: 'bg-purple-100 text-purple-700',
  shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export const DELIVERY_STATUS_COLORS: Record<string, string> = {
  preparing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-orange-100 text-orange-700',
  in_transit: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  returned: 'bg-red-100 text-red-700',
}
