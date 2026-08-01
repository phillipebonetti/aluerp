import { NextRequest, NextResponse } from 'next/server'
import { OSDashboardService } from '@/src/lib/services/os-dashboard-service'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    const metrics = await OSDashboardService.getDashboardMetrics(companyId)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('[Dashboard Metrics API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}
