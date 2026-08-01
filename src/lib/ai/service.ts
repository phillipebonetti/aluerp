import { AIProvider, AIResponse, AIGenerateOptions, AIContextData } from './types'

/**
 * AIService - Camada de abstração para diferentes provedores de IA
 * Suporta: OpenAI, Azure OpenAI, Anthropic, Google Gemini, Ollama
 */
export class AIService {
  private provider: AIProvider
  private model: string

  constructor(provider: AIProvider) {
    this.provider = provider
    this.model = provider.modelId
  }

  /**
   * Gera texto usando o provedor configurado
   */
  async generateText(options: AIGenerateOptions): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // Construir prompt completo com contexto
      const fullPrompt = this.buildPrompt(options)

      // Chamar provedor específico
      const response = await this.callProvider(fullPrompt, options)

      const duration = Date.now() - startTime

      return {
        content: response.content,
        tokens: response.tokens,
        model: this.model,
        duration,
        stop_reason: response.stop_reason
      }
    } catch (error) {
      throw new Error(`AI Service Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Gera texto em streaming
   */
  async *generateStream(options: AIGenerateOptions): AsyncGenerator<string> {
    const fullPrompt = this.buildPrompt(options)

    // Chamar provedor com streaming
    for await (const chunk of this.callProviderStream(fullPrompt, options)) {
      yield chunk
    }
  }

  /**
   * Valida conexão com provedor
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateText({
        prompt: 'Responda com "OK" apenas.',
        stream: false,
        maxTokens: 10
      })

      return response.content.toLowerCase().includes('ok')
    } catch {
      return false
    }
  }

  /**
   * Constrói prompt final com contexto do ERP
   */
  private buildPrompt(options: AIGenerateOptions): string {
    let prompt = ``

    // Adicionar contexto se disponível
    if (options.context) {
      prompt += this.formatContext(options.context)
      prompt += '\n\n'
    }

    prompt += options.prompt

    return prompt
  }

  /**
   * Formata dados de contexto do ERP em texto
   */
  private formatContext(context: AIContextData): string {
    return `## Contexto Atual do Sistema

**Obras:** ${context.works.inProgress} em andamento, ${context.works.completed} concluídas, ${context.works.delayed} atrasadas

**Financeiro:** Faturamento R$ ${context.financial.revenue.toLocaleString('pt-BR')}, Despesas R$ ${context.financial.expenses.toLocaleString('pt-BR')}, Lucro R$ ${context.financial.profit.toLocaleString('pt-BR')}

**Clientes:** ${context.clients.active} ativos, ${context.clients.overdue} com atraso

**Vendas:** Total ${context.sales.total}, Taxa de conversão ${(context.sales.conversionRate * 100).toFixed(1)}%

**Contas a Receber:** R$ ${context.receivables.total.toLocaleString('pt-BR')} (${context.receivables.overdue} vencidas, ${context.receivables.dueToday} vence hoje)

**Contas a Pagar:** R$ ${context.payables.total.toLocaleString('pt-BR')} (${context.payables.overdue} vencidas, ${context.payables.dueToday} vence hoje)`
  }

  /**
   * Chamada ao provedor (implementação específica por provider)
   */
  private async callProvider(prompt: string, options: AIGenerateOptions): Promise<any> {
    // Esta é uma implementação de exemplo
    // Em produção, cada provedor teria sua própria implementação
    switch (this.provider.name) {
      case 'OPENAI':
        return this.callOpenAI(prompt, options)
      case 'ANTHROPIC':
        return this.callAnthropic(prompt, options)
      case 'GOOGLE_GEMINI':
        return this.callGemini(prompt, options)
      case 'AZURE_OPENAI':
        return this.callAzureOpenAI(prompt, options)
      case 'OLLAMA':
        return this.callOllama(prompt, options)
      default:
        throw new Error(`Provedor não suportado: ${this.provider.name}`)
    }
  }

  /**
   * Stream do provedor
   */
  private async *callProviderStream(prompt: string, options: AIGenerateOptions): AsyncGenerator<string> {
    // Implementação de streaming por provedor
    switch (this.provider.name) {
      case 'OPENAI':
        yield* this.callOpenAIStream(prompt, options)
        break
      default:
        throw new Error(`Stream não suportado para ${this.provider.name}`)
    }
  }

  // Implementações específicas de provedores

  private async callOpenAI(prompt: string, options: AIGenerateOptions): Promise<any> {
    // Placeholder - seria substituído por chamada real à API OpenAI
    return {
      content: 'Resposta de exemplo do OpenAI',
      tokens: { input: 10, output: 20, total: 30 },
      stop_reason: 'stop'
    }
  }

  private async *callOpenAIStream(prompt: string, options: AIGenerateOptions): AsyncGenerator<string> {
    // Placeholder - seria substituído por streaming real
    yield 'Resposta '
    yield 'em '
    yield 'streaming'
  }

  private async callAnthropic(prompt: string, options: AIGenerateOptions): Promise<any> {
    return {
      content: 'Resposta do Anthropic',
      tokens: { input: 10, output: 20, total: 30 },
      stop_reason: 'stop'
    }
  }

  private async callGemini(prompt: string, options: AIGenerateOptions): Promise<any> {
    return {
      content: 'Resposta do Google Gemini',
      tokens: { input: 10, output: 20, total: 30 },
      stop_reason: 'stop'
    }
  }

  private async callAzureOpenAI(prompt: string, options: AIGenerateOptions): Promise<any> {
    return {
      content: 'Resposta do Azure OpenAI',
      tokens: { input: 10, output: 20, total: 30 },
      stop_reason: 'stop'
    }
  }

  private async callOllama(prompt: string, options: AIGenerateOptions): Promise<any> {
    return {
      content: 'Resposta do Ollama',
      tokens: { input: 10, output: 20, total: 30 },
      stop_reason: 'stop'
    }
  }
}

/**
 * Singleton para gerenciar instância de AIService
 */
let aiServiceInstance: AIService | null = null

export function initializeAIService(provider: AIProvider): void {
  aiServiceInstance = new AIService(provider)
}

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    throw new Error('AI Service não foi inicializado. Chame initializeAIService primeiro.')
  }
  return aiServiceInstance
}
