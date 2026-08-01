import { NextRequest, NextResponse } from 'next/server'
import { OSDashboardService } from '@/src/lib/services/os-dashboard-service'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    const data = await OSDashboardService.getOverdueOS(companyId)

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Dashboard Overdue API] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch overdue OS' }, { status: 500 })
  }
}
