import { supabase } from '@/lib/supabase'

// ============================================================
// Types
// ============================================================

export type SnapshotPeriod = 'daily' | 'weekly' | 'monthly'

export type FunnelStep = 'visit' | 'product_view' | 'add_cart' | 'checkout' | 'purchase'

export type ReportType = 'weekly_express' | 'monthly_full' | 'content_perf' | 'campaign_roi'

export interface TrafficMetrics {
  sessions?: number
  visitors?: number
  pageviews?: number
  bounce_rate?: number
  avg_duration?: number
}

export interface SourceMetrics {
  sessions?: number
  conversions?: number
}

export interface BySource {
  organic?: SourceMetrics
  paid?: SourceMetrics
  social?: SourceMetrics
  direct?: SourceMetrics
  referral?: SourceMetrics
  email?: SourceMetrics
}

export interface DeviceMetrics {
  sessions?: number
  visitors?: number
  [key: string]: unknown
}

export interface ByDevice {
  mobile?: DeviceMetrics
  desktop?: DeviceMetrics
  tablet?: DeviceMetrics
}

export interface PageMetrics {
  path: string
  views?: number
  avg_time?: number
  bounce_rate?: number
}

export interface AnalyticsSnapshot {
  id: string
  date: string
  period: SnapshotPeriod
  metrics: TrafficMetrics
  by_source: BySource
  by_device: ByDevice
  by_page: PageMetrics[]
  created_at: string
}

export interface AnalyticsConversion {
  id: string
  date: string
  funnel_step: FunnelStep
  count: number
  conversion_rate: number
  by_source: BySource
  by_device: ByDevice
  revenue?: number | null
  created_at: string
}

export interface AnalyticsReport {
  id: string
  proposal_id?: string | null
  type: ReportType
  period_start: string
  period_end: string
  content: Record<string, unknown>
  insights: string[]
  recommendations: string[]
  created_at: string
}

export interface DashboardSummary {
  latest_snapshot: AnalyticsSnapshot | null
  conversion_funnel: AnalyticsConversion[]
  latest_report: AnalyticsReport | null
}

// ============================================================
// Snapshots
// ============================================================

export interface ListSnapshotsFilters {
  period?: SnapshotPeriod
  startDate?: string
  endDate?: string
  limit?: number
}

export async function listSnapshots(
  filters: ListSnapshotsFilters = {},
): Promise<AnalyticsSnapshot[]> {
  const { period, startDate, endDate, limit = 50 } = filters

  let query = supabase
    .from('analytics_snapshots')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit)

  if (period)    query = query.eq('period', period)
  if (startDate) query = query.gte('date', startDate)
  if (endDate)   query = query.lte('date', endDate)

  const { data, error } = await query
  if (error) throw error
  return data as AnalyticsSnapshot[]
}

export async function getLatestSnapshot(
  period: SnapshotPeriod,
): Promise<AnalyticsSnapshot | null> {
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('period', period)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as AnalyticsSnapshot | null
}

export type CreateSnapshotInput = Omit<AnalyticsSnapshot, 'id' | 'created_at'>

export async function createSnapshot(
  snapshot: CreateSnapshotInput,
): Promise<AnalyticsSnapshot> {
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .insert(snapshot)
    .select()
    .single()

  if (error) throw error
  return data as AnalyticsSnapshot
}

// ============================================================
// Conversions
// ============================================================

export interface ListConversionsFilters {
  date?: string
  startDate?: string
  endDate?: string
}

export async function listConversions(
  filters: ListConversionsFilters = {},
): Promise<AnalyticsConversion[]> {
  const { date, startDate, endDate } = filters

  let query = supabase
    .from('analytics_conversions')
    .select('*')
    .order('date', { ascending: false })

  if (date)      query = query.eq('date', date)
  if (startDate) query = query.gte('date', startDate)
  if (endDate)   query = query.lte('date', endDate)

  const { data, error } = await query
  if (error) throw error
  return data as AnalyticsConversion[]
}

const FUNNEL_ORDER: FunnelStep[] = [
  'visit',
  'product_view',
  'add_cart',
  'checkout',
  'purchase',
]

export async function getConversionFunnel(
  date: string,
): Promise<AnalyticsConversion[]> {
  const { data, error } = await supabase
    .from('analytics_conversions')
    .select('*')
    .eq('date', date)

  if (error) throw error

  const rows = (data as AnalyticsConversion[]) ?? []

  // Sort by canonical funnel step order
  rows.sort(
    (a, b) =>
      FUNNEL_ORDER.indexOf(a.funnel_step) - FUNNEL_ORDER.indexOf(b.funnel_step),
  )

  return rows
}

export type CreateConversionInput = Omit<AnalyticsConversion, 'id' | 'created_at'>

export async function createConversion(
  conversion: CreateConversionInput,
): Promise<AnalyticsConversion> {
  const { data, error } = await supabase
    .from('analytics_conversions')
    .insert(conversion)
    .select()
    .single()

  if (error) throw error
  return data as AnalyticsConversion
}

// ============================================================
// Reports
// ============================================================

export interface ListReportsFilters {
  type?: ReportType
  limit?: number
}

export async function listReports(
  filters: ListReportsFilters = {},
): Promise<AnalyticsReport[]> {
  const { type, limit = 50 } = filters

  let query = supabase
    .from('analytics_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) throw error
  return data as AnalyticsReport[]
}

export async function getReport(id: string): Promise<AnalyticsReport> {
  const { data, error } = await supabase
    .from('analytics_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as AnalyticsReport
}

export type CreateReportInput = Omit<AnalyticsReport, 'id' | 'created_at'>

export async function createReport(
  report: CreateReportInput,
): Promise<AnalyticsReport> {
  const { data, error } = await supabase
    .from('analytics_reports')
    .insert(report)
    .select()
    .single()

  if (error) throw error
  return data as AnalyticsReport
}

// ============================================================
// Dashboard Summary
// ============================================================

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const today = new Date().toISOString().slice(0, 10)

  const [latestSnapshot, funnel, latestReport] = await Promise.all([
    getLatestSnapshot('daily'),
    getConversionFunnel(today),
    listReports({ type: 'weekly_express', limit: 1 }).then((rows) => rows[0] ?? null),
  ])

  return {
    latest_snapshot: latestSnapshot,
    conversion_funnel: funnel,
    latest_report: latestReport,
  }
}
