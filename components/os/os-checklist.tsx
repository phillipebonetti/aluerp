'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Upload, Trash2, Clock, CheckCircle2 } from 'lucide-react'
import type { OSChecklistItem } from '@/src/types/os'

interface OsChecklistProps {
  serviceOrderId: string
  items: OSChecklistItem[]
  isLoading?: boolean
  onAddItem?: (item: Partial<OSChecklistItem>) => void
  onUpdateItem?: (id: string, item: Partial<OSChecklistItem>) => void
  onDeleteItem?: (id: string) => void
  onUploadPhoto?: (itemId: string, file: File) => void
}

export function OsChecklist({
  serviceOrderId,
  items = [],
  isLoading = false,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUploadPhoto,
}: OsChecklistProps) {
  const [open, setOpen] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', description: '' })

  const completedCount = items.filter((i) => i.completed).length
  const completionPercentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  function handleAddItem() {
    if (!newItem.title.trim()) return

    onAddItem?.({
      id: `temp-${Date.now()}`,
      title: newItem.title,
      description: newItem.description || undefined,
      completed: false,
    })

    setNewItem({ title: '', description: '' })
    setOpen(false)
  }

  function handleToggleItem(item: OSChecklistItem) {
    onUpdateItem?.(item.id, { completed: !item.completed })
  }

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Progresso do Checklist</h3>
            <p className="text-sm text-blue-700">
              {completedCount} de {items.length} itens concluídos
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{completionPercentage}%</p>
            <p className="text-xs text-blue-700">Completo</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-blue-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Item de Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título *</label>
              <Input
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Ex: Verificar medidas"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Detalhes do item"
              />
            </div>
            <Button onClick={handleAddItem} className="w-full" disabled={!newItem.title.trim()}>
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checklist Items */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className={`p-4 transition-all ${item.completed ? 'bg-green-50' : ''}`}>
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => handleToggleItem(item)}
                  disabled={isLoading}
                  className="mt-1"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`font-medium ${item.completed ? 'line-through text-gray-400' : ''}`}>
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className={`text-sm mt-1 ${item.completed ? 'text-gray-400' : 'text-muted-foreground'}`}>
                          {item.description}
                        </p>
                      )}
                    </div>

                    {item.completed ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Concluído
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                      </Badge>
                    )}
                  </div>

                  {/* Item Metadata */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {item.completedBy && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        Por: {item.completedBy}
                      </span>
                    )}
                    {item.completedAt && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                        {new Date(item.completedAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>

                  {/* Photo Section */}
                  {item.completed && item.photoUrl ? (
                    <div className="mt-3">
                      <a
                        href={item.photoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Ver foto comprobatória
                      </a>
                    </div>
                  ) : item.completed ? (
                    <div className="mt-3">
                      <label className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>Adicionar foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) onUploadPhoto?.(item.id, file)
                          }}
                        />
                      </label>
                    </div>
                  ) : null}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteItem?.(item.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum item no checklist</p>
          <p className="text-sm mt-1">Adicione itens para acompanhar o progresso</p>
        </Card>
      )}

      {/* Info Box */}
      {items.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <h4 className="font-semibold text-amber-900 mb-2">Dicas</h4>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Marque cada item conforme for concluído</li>
            <li>• Anexe fotos como comprovação de conclusão</li>
            <li>• O histórico de conclusão é mantido automaticamente</li>
            {completionPercentage === 100 && (
              <li>• ✓ Todos os itens foram concluídos com sucesso!</li>
            )}
          </ul>
        </Card>
      )}
    </div>
  )
}
