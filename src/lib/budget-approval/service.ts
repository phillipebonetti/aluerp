import { db } from '@/src/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { UAParser } from 'ua-parser-js'

interface BudgetApprovalRequest {
  budgetId: string
  validityDays: number
  clientEmail: string
}

interface ApprovalRequest {
  token: string
  clientIp: string
  userAgent: string
}

export async function generateBudgetApprovalToken(
  params: BudgetApprovalRequest
) {
  const token = uuidv4()
  const expiresAt = new Date(Date.now() + params.validityDays * 24 * 60 * 60 * 1000)

  try {
    const approval = await db.budgetApprovalToken.create({
      data: {
        budgetId: params.budgetId,
        token,
        expiresAt,
      },
    })

    return {
      success: true,
      data: {
        token: approval.token,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/orcamento/${approval.token}`,
        expiresAt,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao gerar token de aprovação',
    }
  }
}

export async function validateBudgetToken(token: string) {
  try {
    const approval = await db.budgetApprovalToken.findUnique({
      where: { token },
    })

    if (!approval) {
      return {
        success: false,
        error: 'Token inválido',
      }
    }

    if (new Date() > approval.expiresAt) {
      await db.budgetApprovalToken.update({
        where: { token },
        data: { isExpired: true },
      })
      return {
        success: false,
        error: 'Token expirado',
      }
    }

    if (approval.isApproved) {
      return {
        success: false,
        error: 'Orçamento já foi aprovado',
      }
    }

    return {
      success: true,
      data: approval,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao validar token',
    }
  }
}

export async function approveBudget(params: ApprovalRequest & { clientName: string; clientEmail: string }) {
  try {
    const tokenValidation = await validateBudgetToken(params.token)

    if (!tokenValidation.success) {
      return tokenValidation
    }

    const ua = new UAParser(params.userAgent)
    const osName = ua.getOS().name || 'Unknown'

    const approval = await db.budgetApprovalToken.update({
      where: { token: params.token },
      data: {
        isApproved: true,
        approvedAt: new Date(),
        approverIp: params.clientIp,
        approverUserAgent: params.userAgent,
        approverOs: osName,
      },
    })

    // Registrar no histórico
    await db.budgetApprovalHistory.create({
      data: {
        budgetId: approval.budgetId,
        action: 'APPROVED',
        clientName: params.clientName,
        clientEmail: params.clientEmail,
        ipAddress: params.clientIp,
        userAgent: params.userAgent,
        operatingSystem: osName,
        timestamp: new Date(),
      },
    })

    // TODO: Gerar PDF com marca d'água
    // TODO: Enviar email de confirmação

    return {
      success: true,
      data: approval,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao aprovar orçamento',
    }
  }
}

export async function requestBudgetChanges(token: string, reason: string) {
  try {
    const tokenValidation = await validateBudgetToken(token)

    if (!tokenValidation.success) {
      return tokenValidation
    }

    const approval = await db.budgetApprovalToken.update({
      where: { token },
      data: {
        requestChangesAt: new Date(),
        requestChangesReason: reason,
      },
    })

    await db.budgetApprovalHistory.create({
      data: {
        budgetId: approval.budgetId,
        action: 'REQUEST_CHANGES',
        timestamp: new Date(),
        details: JSON.stringify({ reason }),
      },
    })

    return {
      success: true,
      data: approval,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao solicitar alterações',
    }
  }
}

export async function getBudgetApprovalHistory(budgetId: string) {
  try {
    const history = await db.budgetApprovalHistory.findMany({
      where: { budgetId },
      orderBy: { timestamp: 'desc' },
    })

    return {
      success: true,
      data: history,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao buscar histórico',
    }
  }
}
