'use server'

import { prisma } from '@/src/lib/db'
import { AIConversation, AIMessage, AIInsight, AIPrediction } from '@/src/lib/ai/types'

// ==================== CONVERSAS ====================

export async function createConversationAction(
  companyId: string,
  userId: string,
  title: string,
  category?: string
): Promise<{ success: boolean; data?: AIConversation; error?: string }> {
  try {
    const conversation = await prisma.aIConversation.create({
      data: {
        companyId,
        userId,
        title,
        category: (category as any) || 'general'
      }
    })

    return {
      success: true,
      data: conversation as any
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar conversa'
    }
  }
}

export async function listConversationsAction(
  companyId: string,
  userId: string
): Promise<{ success: boolean; data?: AIConversation[]; error?: string }> {
  try {
    const conversations = await prisma.aIConversation.findMany({
      where: {
        companyId,
        userId,
        status: 'ACTIVE'
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    })

    return {
      success: true,
      data: conversations as any
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao listar conversas'
    }
  }
}

export async function getConversationAction(
  conversationId: string,
  companyId: string
): Promise<{ success: boolean; data?: AIConversation & { messages: AIMessage[] }; error?: string }> {
  try {
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation || conversation.companyId !== companyId) {
      return {
        success: false,
        error: 'Conversa não encontrada'
      }
    }

    return {
      success: true,
      data: conversation as any
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao obter conversa'
    }
  }
}

export async function updateConversationAction(
  conversationId: string,
  companyId: string,
  updates: { title?: string; isPinned?: boolean; status?: string }
): Promise<{ success: boolean; data?: AIConversation; error?: string }> {
  try {
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation || conversation.companyId !== companyId) {
      return {
        success: false,
        error: 'Conversa não encontrada'
      }
    }

    const updated = await prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        ...(updates.title && { title: updates.title }),
        ...(updates.isPinned !== undefined && { isPinned: updates.isPinned }),
        ...(updates.status && { status: updates.status as any })
      }
    })

    return {
      success: true,
      data: updated as any
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar conversa'
    }
  }
}

export async function deleteConversationAction(
  conversationId: string,
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation || conversation.companyId !== companyId) {
      return {
        success: false,
        error: 'Conversa não encontrada'
      }
    }

    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { status: 'DELETED' }
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar conversa'
    }
  }
}

// ==================== MENSAGENS ====================

export async function addMessageAction(
  conversationId: string,
  companyId: string,
  role: 'user' | 'assistant',
  content: string,
  metadata?: { tokens?: number; model?: string; responseTime?: number }
): Promise<{ success: boolean; data?: AIMessage; error?: string }> {
  try {
    // Verificar se conversa existe e pertence à empresa
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation || conversation.companyId !== companyId) {
      return {
        success: false,
        error: 'Conversa não encontrada'
      }
    }

    const message = await prisma.aIMessage.create({
      data: {
        conversationId,
        role,
        content,
        tokens: metadata?.tokens,
        model: metadata?.model,
        responseTime: metadata?.responseTime
      }
    })

    // Atualizar estatísticas da conversa
    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        messageCount: { increment: 1 },
        tokenCount: { increment: metadata?.tokens || 0 },
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      data: message as any
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao adicionar mensagem'
    }
  }
}

// ==================== INSIGHTS ====================

export async function listInsightsAction(
  companyId: string,
  options?: { type?: string; severity?: string; limit?: number }
): Promise<{ success: boolean; data?: AIInsight[]; error?: string }> {
  try {
    const insights = await prisma.aIInsight.findMany({
      where: {
        companyId,
        ...(options?.type && { type: options.type }),
        ...(options?.severity && { severity: options.severity })
      },
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 20
    })

    return {
      success: true,
      data: insights as any
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao listar insights'
    }
  }
}

export async function markInsightAsReadAction(
  insightId: string,
  companyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const insight = await prisma.aIInsight.findUnique({
      where: { id: insightId }
    })

    if (!insight || insight.companyId !== companyId) {
      return {
        success: false,
        error: 'Insight não encontrado'
      }
    }

    await prisma.aIInsight.update({
      where: { id: insightId },
      data: { isRead: true }
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao marcar insight como lido'
    }
  }
}

// ==================== PREVISÕES ====================

export async function listPredictionsAction(
  companyId: string,
  options?: { type?: string; limit?: number }
): Promise<{ success: boolean; data?: AIPrediction[]; error?: string }> {
  try {
    const predictions = await prisma.aIPrediction.findMany({
      where: {
        companyId,
        ...(options?.type && { type: options.type })
      },
      orderBy: { generatedAt: 'desc' },
      take: options?.limit || 10
    })

    return {
      success: true,
      data: predictions as any
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao listar previsões'
    }
  }
}

// ==================== CONFIGURAÇÃO ====================

export async function getProviderConfigAction(
  companyId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const config = await prisma.aIProviderConfig.findUnique({
      where: { companyId }
    })

    // Nunca retornar chave de API
    if (config) {
      const { apiKey, ...safeConfig } = config
      return {
        success: true,
        data: safeConfig
      }
    }

    return {
      success: false,
      error: 'Configuração não encontrada'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao obter configuração'
    }
  }
}

// ==================== LOGS DE USO ====================

export async function logAIUsageAction(
  companyId: string,
  userId: string,
  data: {
    provider: string
    model?: string
    inputTokens: number
    outputTokens: number
    estimatedCost: number
    status: 'success' | 'error' | 'timeout'
    errorMessage?: string
    duration?: number
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.aIUsageLog.create({
      data: {
        companyId,
        userId,
        provider: data.provider as any,
        model: data.model,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens: data.inputTokens + data.outputTokens,
        estimatedCost: data.estimatedCost,
        status: data.status,
        errorMessage: data.errorMessage,
        duration: data.duration
      }
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao registrar uso'
    }
  }
}
