'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { IntegrationProvider } from '@/src/lib/integrations/types'

interface IntegrationConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: IntegrationProvider
  onSave: (credentials: Record<string, any>) => Promise<void>
}

export function IntegrationConfigModal({
  open,
  onOpenChange,
  provider,
  onSave
}: IntegrationConfigModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [credentials, setCredentials] = useState<Record<string, any>>({})

  const configs = {
    WHATSAPP: [
      { key: 'phone_number_id', label: 'Phone Number ID', type: 'text' },
      { key: 'access_token', label: 'Access Token', type: 'password' },
      { key: 'webhook_token', label: 'Webhook Token', type: 'password' }
    ],
    EMAIL: [
      { key: 'smtp_host', label: 'SMTP Host', type: 'text' },
      { key: 'smtp_port', label: 'SMTP Port', type: 'number' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'password', label: 'Password', type: 'password' }
    ],
    GOOGLE_CALENDAR: [
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', type: 'password' },
      { key: 'calendar_id', label: 'Calendar ID', type: 'text' }
    ],
    GOOGLE_DRIVE: [
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', type: 'password' },
      { key: 'folder_id', label: 'Folder ID', type: 'text' }
    ],
    CONTA_AZUL: [
      { key: 'api_key', label: 'API Key', type: 'password' },
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', type: 'password' }
    ],
    PIX_BANKING: [
      { key: 'cpf_cnpj', label: 'CPF/CNPJ', type: 'text' },
      { key: 'api_key', label: 'API Key', type: 'password' },
      { key: 'merchant_id', label: 'Merchant ID', type: 'text' }
    ],
    BOLETO_BANKING: [
      { key: 'account_number', label: 'Account Number', type: 'text' },
      { key: 'agency', label: 'Agency', type: 'text' },
      { key: 'api_token', label: 'API Token', type: 'password' }
    ],
    ZAPIER: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'text' },
      { key: 'api_key', label: 'API Key', type: 'password' }
    ],
    MAKE: [
      { key: 'api_token', label: 'API Token', type: 'password' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text' }
    ],
    CUSTOM: [
      { key: 'name', label: 'Integration Name', type: 'text' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text' },
      { key: 'api_key', label: 'API Key', type: 'password' }
    ]
  }

  const fields = configs[provider] || []

  const handleInputChange = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await onSave(credentials)
      setSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        setCredentials({})
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure {provider}</DialogTitle>
          <DialogDescription>
            Enter your credentials to connect {provider} to AluERP
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type={field.type}
                placeholder={`Enter your ${field.label.toLowerCase()}`}
                value={credentials[field.key] || ''}
                onChange={e => handleInputChange(field.key, e.target.value)}
                disabled={loading}
                className="mt-2"
              />
            </div>
          ))}

          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Success</p>
                <p className="text-sm text-green-800">Configuration saved successfully</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || Object.values(credentials).some(v => !v)}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {success ? 'Saved!' : 'Save Configuration'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
