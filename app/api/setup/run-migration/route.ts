import { NextResponse } from 'next/server'
import { Client } from 'pg'
import path from 'path'
import fs from 'fs'

// Protection: require a secret token
const MIGRATION_SECRET = process.env.MIGRATION_SECRET || 'buddy-migrate-2026'

const PROJECT_REF = 'zkqnydmlvueaosxykwmc'

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

  // Use Supabase Session Pooler (IPv4 accessible, supports DDL)
  // Transaction pooler port 6543, Session pooler port 5432
  const client = new Client({
    host: `aws-0-eu-west-3.pooler.supabase.com`,
    port: 5432,
    user: `postgres.${PROJECT_REF}`,
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
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
    await client.end().catch(() => {})
  }
}
