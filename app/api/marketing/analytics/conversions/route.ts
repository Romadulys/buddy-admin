import { NextRequest, NextResponse } from 'next/server'
import { listConversions, createConversion } from '@/lib/marketing/analytics'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const date      = searchParams.get('date')  ?? undefined
    const startDate = searchParams.get('start') ?? undefined
    const endDate   = searchParams.get('end')   ?? undefined

    const data = await listConversions({ date, startDate, endDate })

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { date, funnel_step, count, conversion_rate, by_source, by_device, revenue } = body

    if (!date || !funnel_step) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants : date, funnel_step' },
        { status: 400 },
      )
    }

    const conversion = await createConversion({
      date,
      funnel_step,
      count:           count           ?? 0,
      conversion_rate: conversion_rate ?? 0,
      by_source:       by_source       ?? {},
      by_device:       by_device       ?? {},
      revenue:         revenue         ?? null,
    })

    return NextResponse.json(conversion, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
