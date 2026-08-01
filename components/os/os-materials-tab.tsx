'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Package } from 'lucide-react'
import type { OSMaterial, MaterialStatus, MaterialCategory } from '@/src/types/os'

interface OsMaterialsTabProps {
  serviceOrderId: string
  materials: OSMaterial[]
  isLoading?: boolean
  onAddMaterial?: (material: Partial<OSMaterial>) => void
  onUpdateMaterial?: (id: string, material: Partial<OSMaterial>) => void
  onDeleteMaterial?: (id: string) => void
  onAutoCalculate?: () => void
}

const MATERIAL_CATEGORIES = [
  { value: 'ALUMINIO', label: 'Alumínio' },
  { value: 'VIDRO', label: 'Vidro' },
  { value: 'FERRAGENS', label: 'Ferragens' },
  { value: 'ACESSORIOS', label: 'Acessórios' },
  { value: 'OUTROS', label: 'Outros' },
] as const

const STATUS_COLORS: Record<MaterialStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PURCHASED: 'bg-blue-100 text-blue-800',
  RECEIVED: 'bg-green-100 text-green-800',
  PARTIAL: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

export function OsMaterialsTab({
  serviceOrderId,
  materials = [],
  isLoading = false,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onAutoCalculate,
}: OsMaterialsTabProps) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<OSMaterial>>({
    category: 'OUTROS',
    unit: 'un',
    status: 'PENDING',
  })

  const totalCost = materials.reduce((sum, m) => sum + m.totalCost, 0)
  const purchasedCount = materials.filter(m => m.status !== 'PENDING').length
  const receivedCount = materials.filter(m => m.status === 'RECEIVED').length

  function handleSave() {
    if (!formData.name || !formData.quantity || !formData.unitCost) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    const totalValue = (formData.quantity || 0) * (formData.unitCost || 0)

    if (editingId) {
      onUpdateMaterial?.(editingId, { ...formData, totalCost: totalValue })
    } else {
      onAddMaterial?.({
        ...formData,
        serviceOrderId,
        sequence: materials.length + 1,
        totalCost: totalValue,
      })
    }

    setFormData({ category: 'OUTROS', unit: 'un', status: 'PENDING' })
    setEditingId(null)
    setOpen(false)
  }

  function handleEdit(material: OSMaterial) {
    setFormData(material)
    setEditingId(material.id)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total de Materiais</p>
          <p className="text-2xl font-bold">{materials.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Comprados</p>
          <p className="text-2xl font-bold text-blue-600">{purchasedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Recebidos</p>
          <p className="text-2xl font-bold text-green-600">{receivedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Custo Total</p>
          <p className="text-2xl font-bold">R$ {totalCost.toFixed(2)}</p>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Material' : 'Novo Material'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Alumínio 40x40"
                  />
                </div>
                <div>
                  <Label>Categoria *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as MaterialCategory })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes adicionais"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Quantidade *</Label>
                  <Input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Unidade</Label>
                  <Input
                    value={formData.unit || 'un'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="un"
                  />
                </div>
                <div>
                  <Label>Valor Unit. *</Label>
                  <Input
                    type="number"
                    value={formData.unitCost || ''}
                    onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fornecedor</Label>
                  <Input
                    value={formData.supplier || ''}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Nome do fornecedor"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as MaterialStatus })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="PURCHASED">Comprado</SelectItem>
                      <SelectItem value="RECEIVED">Recebido</SelectItem>
                      <SelectItem value="PARTIAL">Parcial</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Input
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionais"
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingId ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {onAutoCalculate && (
          <Button variant="outline" onClick={onAutoCalculate} disabled={isLoading}>
            <Package className="w-4 h-4 mr-2" />
            Calcular Automaticamente
          </Button>
        )}
      </div>

      {/* Materials Table */}
      {materials.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Qtd.</TableHead>
                <TableHead className="text-right">Valor Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{MATERIAL_CATEGORIES.find((c) => c.value === material.category)?.label}</TableCell>
                  <TableCell className="text-right">
                    {material.quantity} {material.unit}
                  </TableCell>
                  <TableCell className="text-right">R$ {material.unitCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">R$ {material.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[material.status]}>
                      {material.status === 'PENDING' && 'Pendente'}
                      {material.status === 'PURCHASED' && 'Comprado'}
                      {material.status === 'RECEIVED' && 'Recebido'}
                      {material.status === 'PARTIAL' && 'Parcial'}
                      {material.status === 'CANCELLED' && 'Cancelado'}
                    </Badge>
                  </TableCell>
                  <TableCell>{material.supplier || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(material)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDeleteMaterial?.(material.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum material adicionado</p>
        </Card>
      )}
    </div>
  )
}
