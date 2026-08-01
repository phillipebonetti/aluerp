'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, Plus, Trash2, Loader2, Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface Webhook {
  id: string
  url: string
  events: string[]
  isActive: boolean
  lastTriggered?: Date
  failureCount: number
}

interface WebhooksPanelProps {
  integrationId: string
  webhooks: Webhook[]
  onAdd: (webhook: { url: string; events: string[] }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onToggle: (id: string, active: boolean) => Promise<void>
}

const AVAILABLE_EVENTS = [
  'message.received',
  'message.sent',
  'message.failed',
  'transaction.created',
  'transaction.updated',
  'event.synced',
  'error.occurred',
  'connection.lost'
]

export function WebhooksPanel({
  integrationId,
  webhooks,
  onAdd,
  onDelete,
  onToggle
}: WebhooksPanelProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleToggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    )
  }

  const handleAdd = async () => {
    if (!url || selectedEvents.length === 0) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await onAdd({ url, events: selectedEvents })
      setUrl('')
      setSelectedEvents([])
      setShowAdd(false)
      toast.success('Webhook added successfully')
    } catch (err) {
      toast.error('Failed to add webhook')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUrl = (webhookUrl: string) => {
    navigator.clipboard.writeText(webhookUrl)
    setCopiedId(webhookUrl)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>
              Configure webhooks to receive real-time updates
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAdd(!showAdd)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Webhook
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showAdd && (
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-domain.com/webhooks/..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                disabled={loading}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="mb-3 block">Events to Subscribe</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {AVAILABLE_EVENTS.map(event => (
                  <div key={event} className="flex items-center gap-2">
                    <Checkbox
                      id={event}
                      checked={selectedEvents.includes(event)}
                      onCheckedChange={() => handleToggleEvent(event)}
                      disabled={loading}
                    />
                    <label
                      htmlFor={event}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {event}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdd(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={loading || !url || selectedEvents.length === 0}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Webhook
              </Button>
            </div>
          </div>
        )}

        {webhooks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No webhooks configured yet</p>
            <p className="text-sm mt-1">Add your first webhook to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.map(webhook => (
              <div
                key={webhook.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        webhook.isActive ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                    <p className="text-sm font-medium truncate">{webhook.url}</p>
                    <button
                      onClick={() => handleCopyUrl(webhook.url)}
                      className="p-1 hover:bg-gray-200 rounded transition"
                      title="Copy URL"
                    >
                      {copiedId === webhook.url ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.slice(0, 3).map(event => (
                        <span
                          key={event}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {event}
                        </span>
                      ))}
                      {webhook.events.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          +{webhook.events.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {webhook.failureCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded w-fit">
                      <AlertCircle className="w-3 h-3" />
                      {webhook.failureCount} failures
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(webhook.id)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
