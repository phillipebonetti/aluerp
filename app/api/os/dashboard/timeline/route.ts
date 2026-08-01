import { NextRequest, NextResponse } from 'next/server'
import { OSDashboardService } from '@/src/lib/services/os-dashboard-service'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId')
    const daysParam = request.nextUrl.searchParams.get('days')
    const days = daysParam ? parseInt(daysParam) : 30

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    const data = await OSDashboardService.getOSTimeline(companyId, days)

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Dashboard Timeline API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 })
  }
}
