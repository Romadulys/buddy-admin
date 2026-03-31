// ============================================================
// Stock & Supply Chain Mock Data — Buddy Admin
// ============================================================

export interface StockItem {
  id: string
  product_name: string
  product_type: 'mini' | 'big' | 'accessory' | 'bundle'
  current_stock: number
  reserved_stock: number
  purchase_price: number
  sale_price: number
  sku: string
  low_stock_threshold: number
}

export interface SupplierOrder {
  id: string
  order_number: string
  supplier: string
  product_name: string
  quantity: number
  unit_cost: number
  total_cost: number
  order_date: string
  estimated_arrival: string
  status: 'en_production' | 'en_transit' | 'dedouanement' | 'livre'
  notes?: string
}

export interface StockMovement {
  id: string
  stock_id: string
  date: string
  type: 'in' | 'out' | 'reserved' | 'adjustment'
  quantity: number
  reference: string
  note?: string
}

export const mockStock: StockItem[] = [
  {
    id: '1',
    product_name: 'Buddy Mini',
    product_type: 'mini',
    current_stock: 1240,
    reserved_stock: 800,
    purchase_price: 34,
    sale_price: 89,
    sku: 'BUD-MINI-001',
    low_stock_threshold: 200,
  },
  {
    id: '2',
    product_name: 'Buddy Big',
    product_type: 'big',
    current_stock: 380,
    reserved_stock: 300,
    purchase_price: 52,
    sale_price: 129,
    sku: 'BUD-BIG-001',
    low_stock_threshold: 100,
  },
  {
    id: '3',
    product_name: 'Chargeur USB-C',
    product_type: 'accessory',
    current_stock: 2100,
    reserved_stock: 120,
    purchase_price: 4.5,
    sale_price: 12.9,
    sku: 'ACC-CHG-001',
    low_stock_threshold: 300,
  },
  {
    id: '4',
    product_name: 'Bracelet silicone coloré',
    product_type: 'accessory',
    current_stock: 840,
    reserved_stock: 0,
    purchase_price: 2.8,
    sale_price: 8.9,
    sku: 'ACC-BRA-001',
    low_stock_threshold: 200,
  },
  {
    id: '5',
    product_name: 'Starter Pack (Mini + bracelet)',
    product_type: 'bundle',
    current_stock: 320,
    reserved_stock: 50,
    purchase_price: 38,
    sale_price: 92,
    sku: 'BUN-STR-001',
    low_stock_threshold: 100,
  },
  {
    id: '6',
    product_name: 'Présentoir retail x10',
    product_type: 'accessory',
    current_stock: 45,
    reserved_stock: 30,
    purchase_price: 85,
    sale_price: 250,
    sku: 'ACC-PRE-001',
    low_stock_threshold: 20,
  },
]

export const mockSupplierOrders: SupplierOrder[] = [
  {
    id: '1',
    order_number: 'FOU-2026-001',
    supplier: 'Shenzhen Tech Manufacturing',
    product_name: 'Buddy Mini',
    quantity: 5000,
    unit_cost: 34,
    total_cost: 170000,
    order_date: '2026-01-10',
    estimated_arrival: '2026-04-15',
    status: 'en_transit',
    notes: 'Conteneur FCL 20ft, départ Shenzhen 2026-03-01',
  },
  {
    id: '2',
    order_number: 'FOU-2026-002',
    supplier: 'Shenzhen Tech Manufacturing',
    product_name: 'Buddy Big',
    quantity: 2000,
    unit_cost: 52,
    total_cost: 104000,
    order_date: '2026-01-10',
    estimated_arrival: '2026-04-15',
    status: 'en_transit',
    notes: 'Même conteneur que FOU-2026-001',
  },
  {
    id: '3',
    order_number: 'FOU-2026-003',
    supplier: 'Guangzhou Accessories Co.',
    product_name: 'Chargeur USB-C',
    quantity: 10000,
    unit_cost: 4.5,
    total_cost: 45000,
    order_date: '2026-02-15',
    estimated_arrival: '2026-03-28',
    status: 'dedouanement',
    notes: 'En cours de dédouanement Roissy CDG',
  },
  {
    id: '4',
    order_number: 'FOU-2026-004',
    supplier: 'Guangzhou Accessories Co.',
    product_name: 'Bracelet silicone coloré',
    quantity: 5000,
    unit_cost: 2.8,
    total_cost: 14000,
    order_date: '2026-02-15',
    estimated_arrival: '2026-03-28',
    status: 'dedouanement',
    notes: 'Même arrivage que FOU-2026-003',
  },
  {
    id: '5',
    order_number: 'FOU-2026-005',
    supplier: 'Shenzhen Tech Manufacturing',
    product_name: 'Buddy Mini',
    quantity: 10000,
    unit_cost: 32,
    total_cost: 320000,
    order_date: '2026-03-20',
    estimated_arrival: '2026-06-20',
    status: 'en_production',
    notes: '2ème série - meilleur prix négocié à 32€/u',
  },
]

// Mock stock history for product detail pages
export const mockStockHistory: StockMovement[] = [
  { id: '1', stock_id: '1', date: '2026-01-20', type: 'out', quantity: -800, reference: 'CMD-2026-001', note: "Toy's R Us France" },
  { id: '2', stock_id: '1', date: '2026-02-10', type: 'out', quantity: -500, reference: 'CMD-2026-002', note: 'King Jouet' },
  { id: '3', stock_id: '1', date: '2026-03-01', type: 'out', quantity: -600, reference: 'CMD-2026-003', note: 'Fnac Darty' },
  { id: '4', stock_id: '1', date: '2026-03-20', type: 'reserved', quantity: -800, reference: 'CMD-2026-004', note: "Toy's R Us (réservé)" },
  { id: '5', stock_id: '2', date: '2026-01-20', type: 'out', quantity: -400, reference: 'CMD-2026-001', note: "Toy's R Us France" },
  { id: '6', stock_id: '2', date: '2026-02-10', type: 'out', quantity: -70, reference: 'CMD-2026-002', note: 'King Jouet' },
  { id: '7', stock_id: '2', date: '2026-03-01', type: 'out', quantity: -300, reference: 'CMD-2026-003', note: 'Fnac Darty' },
  { id: '8', stock_id: '2', date: '2026-03-20', type: 'reserved', quantity: -300, reference: 'CMD-2026-004', note: "Toy's R Us (réservé)" },
]

// ============================================================
// Supplier order status helpers
// ============================================================

export const SUPPLIER_STATUS_LABELS: Record<string, string> = {
  en_production: 'En production',
  en_transit: 'En transit',
  dedouanement: 'Dédouanement',
  livre: 'Livré',
}

export const SUPPLIER_STATUS_COLORS: Record<string, string> = {
  en_production: 'bg-yellow-100 text-yellow-700',
  en_transit: 'bg-blue-100 text-blue-700',
  dedouanement: 'bg-orange-100 text-orange-700',
  livre: 'bg-green-100 text-green-700',
}

export const SUPPLIER_STATUS_ICONS: Record<string, string> = {
  en_production: '🏭',
  en_transit: '🚢',
  dedouanement: '🛃',
  livre: '✅',
}

// ============================================================
// Delivery estimator
// ============================================================

export function estimateDelivery(
  units: number,
  productType: 'mini' | 'big'
): {
  availableNow: number
  incomingDate: string | null
  incomingQty: number
  canFulfill: boolean
  fulfillDate: string | null
  message: string
} {
  // Find the matching stock item
  const stockItem = mockStock.find((s) => s.product_type === productType)
  if (!stockItem) {
    return {
      availableNow: 0,
      incomingDate: null,
      incomingQty: 0,
      canFulfill: false,
      fulfillDate: null,
      message: 'Produit introuvable.',
    }
  }

  const availableNow = stockItem.current_stock - stockItem.reserved_stock

  // Find upcoming supplier orders for this product type (not yet delivered, sorted by arrival)
  const upcoming = mockSupplierOrders
    .filter(
      (so) =>
        so.product_name === stockItem.product_name &&
        so.status !== 'livre'
    )
    .sort(
      (a, b) =>
        new Date(a.estimated_arrival).getTime() - new Date(b.estimated_arrival).getTime()
    )

  const nextOrder = upcoming[0] ?? null
  const incomingDate = nextOrder ? nextOrder.estimated_arrival : null
  const incomingQty = nextOrder ? nextOrder.quantity : 0

  // Can we fulfill now?
  if (availableNow >= units) {
    return {
      availableNow,
      incomingDate,
      incomingQty,
      canFulfill: true,
      fulfillDate: new Date().toISOString().split('T')[0],
      message: `Stock disponible : ${availableNow} unités. Expédition possible immédiatement.`,
    }
  }

  // Can we fulfill with next incoming shipment?
  if (nextOrder && availableNow + nextOrder.quantity >= units) {
    return {
      availableNow,
      incomingDate,
      incomingQty,
      canFulfill: true,
      fulfillDate: nextOrder.estimated_arrival,
      message: `Stock actuel insuffisant (${availableNow} dispo). Arrivage de ${nextOrder.quantity} unités prévu le ${new Date(nextOrder.estimated_arrival).toLocaleDateString('fr-FR')} — commande réalisable à cette date.`,
    }
  }

  // Check cumulative incoming
  let cumulative = availableNow
  for (const order of upcoming) {
    cumulative += order.quantity
    if (cumulative >= units) {
      return {
        availableNow,
        incomingDate,
        incomingQty,
        canFulfill: true,
        fulfillDate: order.estimated_arrival,
        message: `Commande réalisable après plusieurs arrivages. Total disponible le ${new Date(order.estimated_arrival).toLocaleDateString('fr-FR')} : ${cumulative} unités.`,
      }
    }
  }

  // Cannot fulfill even with all incoming
  return {
    availableNow,
    incomingDate,
    incomingQty,
    canFulfill: false,
    fulfillDate: null,
    message: `Stock et arrivages insuffisants pour ${units} unités (max disponible : ${cumulative}). Contacter le fournisseur pour un nouvel arrivage.`,
  }
}

// ============================================================
// Aggregated stats helpers
// ============================================================

export function getStockStats() {
  const totalAvailable = mockStock.reduce((s, i) => s + i.current_stock, 0)
  const totalReserved = mockStock.reduce((s, i) => s + i.reserved_stock, 0)
  const totalNet = totalAvailable - totalReserved

  // Next supplier delivery (earliest non-delivered order)
  const nextDelivery = mockSupplierOrders
    .filter((o) => o.status !== 'livre')
    .sort(
      (a, b) =>
        new Date(a.estimated_arrival).getTime() - new Date(b.estimated_arrival).getTime()
    )[0] ?? null

  const nextDeliveryUnits = nextDelivery
    ? mockSupplierOrders
        .filter(
          (o) =>
            o.status !== 'livre' &&
            o.estimated_arrival === nextDelivery.estimated_arrival
        )
        .reduce((s, o) => s + o.quantity, 0)
    : 0

  return { totalAvailable, totalReserved, totalNet, nextDelivery, nextDeliveryUnits }
}

export function getStockLevel(item: StockItem): 'high' | 'medium' | 'low' {
  const net = item.current_stock - item.reserved_stock
  if (net > 500) return 'high'
  if (net >= 100) return 'medium'
  return 'low'
}
