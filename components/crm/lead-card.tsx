'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PhoneIcon, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

interface LeadCardProps {
  id: string
  name: string
  email?: string
  phone?: string
  city?: string
  source: string
  status: string
  value?: number
  responsible?: { name: string }
}

export function LeadCard({ id, name, email, phone, city, source, status, value, responsible }: LeadCardProps) {
  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    IN_CONTACT: 'bg-yellow-100 text-yellow-800',
    QUOTED: 'bg-purple-100 text-purple-800',
    NEGOTIATING: 'bg-orange-100 text-orange-800',
    CONVERTED: 'bg-green-100 text-green-800',
    LOST: 'bg-red-100 text-red-800',
  }

  return (
    <Link href={`/crm/leads/${id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base line-clamp-2">{name}</CardTitle>
            <Badge className={statusColors[status] || 'bg-gray-100'}>{status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 text-sm text-gray-600">
            {phone && (
              <div className="flex items-center gap-1">
                <PhoneIcon className="w-4 h-4" />
                <span className="truncate">{phone}</span>
              </div>
            )}
          </div>
          {email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-600" />
              <span className="truncate text-gray-600">{email}</span>
            </div>
          )}
          {city && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{city}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div>
              <p className="text-xs text-gray-600">Origem</p>
              <p className="text-sm font-semibold">{source}</p>
            </div>
            {value && (
              <div>
                <p className="text-xs text-gray-600">Valor</p>
                <p className="text-sm font-semibold">R$ {value.toLocaleString('pt-BR')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
