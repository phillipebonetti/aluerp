'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Paperclip, Loader2, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface ChatInterfaceProps {
  conversationId: string
  onSendMessage?: (message: string) => Promise<void>
  onFileUpload?: (file: File) => Promise<void>
  isLoading?: boolean
}

export function ChatInterface({
  conversationId,
  onSendMessage,
  onFileUpload,
  isLoading = false
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)

    try {
      // Chamar handler de envio
      if (onSendMessage) {
        await onSendMessage(input)
      }

      // Adicionar resposta do assistente (placeholder)
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-response`,
        role: 'assistant',
        content: 'Processando sua mensagem...',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsStreaming(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onFileUpload) {
      await onFileUpload(file)
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-slate-800">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="text-4xl mb-2">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Comece uma conversa
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Faça perguntas sobre suas obras, vendas, financeiro e muito mais.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-in fade-in slide-in-from-bottom-2',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🤖</span>
                  </div>
                )}

                <div className="flex-1 max-w-md">
                  <div
                    className={cn(
                      'px-4 py-3 rounded-lg',
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-bl-none'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

                    {message.isStreaming && (
                      <div className="flex gap-1 mt-2">
                        <div className="w-2 h-2 rounded-full bg-current opacity-70 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-current opacity-70 animate-bounce delay-100" />
                        <div className="w-2 h-2 rounded-full bg-current opacity-70 animate-bounce delay-200" />
                      </div>
                    )}
                  </div>

                  {message.role === 'assistant' && (
                    <div className="flex gap-2 mt-2 opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyMessage(message.content)}
                        className="h-6 px-2"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">👤</span>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-slate-800 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
            className="flex-shrink-0"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />

          <Input
            placeholder="Digite sua pergunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming || isLoading}
            className="flex-1"
          />

          <Button
            type="submit"
            disabled={isStreaming || isLoading || !input.trim()}
            size="icon"
            className="flex-shrink-0"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>

        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Dica: Faça perguntas sobre obras, clientes, vendas, financeiro e muito mais.
        </div>
      </div>
    </div>
  )
}
