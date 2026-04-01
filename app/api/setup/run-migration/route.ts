import { NextResponse } from 'next/server'
import { Client } from 'pg'
import path from 'path'
import fs from 'fs'
import dns from 'dns/promises'

// Protection: require a secret token
const MIGRATION_SECRET = process.env.MIGRATION_SECRET || 'buddy-migrate-2026'

const PROJECT_REF = 'zkqnydmlvueaosxykwmc'
const DB_HOSTNAME = `db.${PROJECT_REF}.supabase.co`

export async function POST(request: Request) {
  // Auth check
  const auth = request.headers.get('x-migration-secret')
  if (auth !== MIGRATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const password = process.env.SUPABASE_DB_PASSWORD

  if (!password) {
    return NextResponse.json(
      { error: 'SUPABASE_DB_PASSWORD env var not set' },
      { status: 500 }
    )
  }

  // Resolve IPv4 and IPv6 — Supabase free tier is IPv6 only
  let host = DB_HOSTNAME
  try {
    const ipv6 = await dns.resolve6(DB_HOSTNAME)
    if (ipv6.length > 0) host = ipv6[0]
  } catch {
    try {
      const ipv4 = await dns.resolve4(DB_HOSTNAME)
      if (ipv4.length > 0) host = ipv4[0]
    } catch { /* use hostname */ }
  }

  const client = new Client({
    host,
    port: 5432,
    user: 'postgres',
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  })

  try {
    await client.connect()

    // Run the migration SQL
    const sqlPath = path.join(process.cwd(), 'supabase', 'connect-all.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    await client.query(sql)

    return NextResponse.json({ success: true, message: 'Migration completed successfully' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  } finally {
    await client.end()
  }
}
