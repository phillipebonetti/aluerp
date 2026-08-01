'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, GripVertical, Plus } from 'lucide-react'
import type { OSKanbanCard, ServiceOrderPriority } from '@/src/types/os'

interface OsKanbanProps {
  cards: OSKanbanCard[]
  onCardMove?: (cardId: string, fromStatus: string, toStatus: string) => void
  onCardClick?: (cardId: string) => void
  onAddCard?: (status: string) => void
  isLoading?: boolean
}

const COLUMNS = [
  { id: 'PENDING', title: 'Pendente', color: 'bg-gray-50' },
  { id: 'IN_PROGRESS', title: 'Em Progresso', color: 'bg-blue-50' },
  { id: 'COMPLETED', title: 'Concluído', color: 'bg-green-50' },
  { id: 'BLOCKED', title: 'Bloqueado', color: 'bg-red-50' },
]

const PRIORITY_COLORS: Record<ServiceOrderPriority, string> = {
  BAIXA: 'bg-green-100 text-green-800 border-green-300',
  NORMAL: 'bg-blue-100 text-blue-800 border-blue-300',
  ALTA: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  URGENTE: 'bg-red-100 text-red-800 border-red-300',
}

export function OsKanban({ cards = [], onCardMove, onCardClick, onAddCard, isLoading }: OsKanbanProps) {
  const [draggedCard, setDraggedCard] = useState<OSKanbanCard | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCards = cards.filter((card) =>
    card.osNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.client.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function handleDragStart(e: React.DragEvent, card: OSKanbanCard) {
    setDraggedCard(card)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  function handleDrop(e: React.DragEvent, toStatus: string) {
    e.preventDefault()
    if (draggedCard && draggedCard.status !== toStatus) {
      onCardMove?.(draggedCard.id, draggedCard.status, toStatus)
    }
    setDraggedCard(null)
  }

  function getCardsForStatus(status: string) {
    return filteredCards.filter((card) => card.status === status)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por OS ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">Filtros</Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => {
          const columnCards = getCardsForStatus(column.id)

          return (
            <div key={column.id} className="flex flex-col gap-2 min-w-80">
              {/* Column Header */}
              <div className={`p-3 rounded-lg ${column.color} border`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{column.title}</h3>
                  <Badge variant="outline">{columnCards.length}</Badge>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                className="flex-1 min-h-96 border-2 border-dashed border-gray-200 rounded-lg p-3 space-y-2 transition-colors"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {columnCards.length > 0 ? (
                  columnCards.map((card) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card)}
                      onClick={() => onCardClick?.(card.id)}
                      className="bg-white p-3 rounded border cursor-move hover:shadow-md transition-shadow group"
                    >
                      <div className="flex gap-2 mb-2">
                        <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100" />
                        <span className="font-mono text-sm font-semibold text-blue-600">{card.osNumber}</span>
                      </div>

                      <p className="text-sm font-medium mb-2 line-clamp-2">{card.client}</p>

                      <div className="flex items-center justify-between mb-2">
                        <Badge className={PRIORITY_COLORS[card.priority]}>
                          {card.priority === 'BAIXA' ? 'Baixa'}
                          {card.priority === 'NORMAL' ? 'Normal'}
                          {card.priority === 'ALTA' ? 'Alta'}
                          {card.priority === 'URGENTE' ? 'Urgente'}
                        </Badge>
                      </div>

                      {card.assignee && (
                        <p className="text-xs text-muted-foreground mb-2">Atrib: {card.assignee}</p>
                      )}

                      {card.progress !== undefined && (
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Progresso</span>
                            <span className="text-xs font-semibold">{card.progress}%</span>
                          </div>
                          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all" style={{ width: `${card.progress}%` }} />
                          </div>
                        </div>
                      )}

                      {card.dueDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Vencimento: {new Date(card.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}

                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {card.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p className="text-sm">Nenhuma OS</p>
                  </div>
                )}
              </div>

              {/* Add Card Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddCard?.(column.id)}
                disabled={isLoading}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
          )
        })}
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground text-center">
        Arraste os cards entre colunas para alterar status. {filteredCards.length} de {cards.length} OSs exibidas.
      </div>
    </div>
  )
}
