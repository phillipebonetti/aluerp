'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Copy, Trash2, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/src/utils/dashboard'

interface ApiToken {
  id: string
  name: string
  token: string
  permissions: string[]
  createdAt: Date
  expiresAt?: Date
  lastUsedAt?: Date
  isActive: boolean
}

interface ApiTokensPanelProps {
  tokens: ApiToken[]
  onCreate: (name: string, permissions: string[]) => Promise<string>
  onDelete: (id: string) => Promise<void>
}

const AVAILABLE_PERMISSIONS = [
  'integrations.read',
  'integrations.write',
  'webhooks.read',
  'webhooks.write',
  'logs.read',
  'messages.send',
  'transactions.read'
]

export function ApiTokensPanel({
  tokens,
  onCreate,
  onDelete
}: ApiTokensPanelProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [newToken, setNewToken] = useState<string | null>(null)

  const handleTogglePermission = (perm: string) => {
    setSelectedPermissions(prev =>
      prev.includes(perm)
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    )
  }

  const handleCreate = async () => {
    if (!name || selectedPermissions.length === 0) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const token = await onCreate(name, selectedPermissions)
      setNewToken(token)
      setName('')
      setSelectedPermissions([])
      toast.success('API token created successfully')
    } catch (err) {
      toast.error('Failed to create API token')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const toggleShowToken = (tokenId: string) => {
    setShowTokens(prev => ({ ...prev, [tokenId]: !prev[tokenId] }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>API Tokens</CardTitle>
            <CardDescription>
              Manage API tokens for programmatic access
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAdd(!showAdd)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Token
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {newToken && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-900 mb-2">
              API Token Created Successfully
            </p>
            <p className="text-xs text-green-800 mb-3">
              Make sure to copy this token now. You won&apos;t be able to see it again.
            </p>
            <div className="flex items-center gap-2 bg-white border rounded p-3">
              <code className="text-xs font-mono flex-1 truncate">{newToken}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyToken(newToken)}
              >
                {copiedToken === newToken ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewToken(null)}
              className="mt-2 w-full"
            >
              Dismiss
            </Button>
          </div>
        )}

        {showAdd && (
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <div>
              <Label htmlFor="token-name">Token Name</Label>
              <Input
                id="token-name"
                placeholder="e.g., Production API"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="mb-3 block">Permissions</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {AVAILABLE_PERMISSIONS.map(perm => (
                  <div key={perm} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={perm}
                      checked={selectedPermissions.includes(perm)}
                      onChange={() => handleTogglePermission(perm)}
                      disabled={loading}
                    />
                    <label
                      htmlFor={perm}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {perm}
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
                onClick={handleCreate}
                disabled={loading || !name || selectedPermissions.length === 0}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Token
              </Button>
            </div>
          </div>
        )}

        {tokens.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No API tokens created yet</p>
            <p className="text-sm mt-1">Create your first token to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map(token => (
              <div
                key={token.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium">{token.name}</p>
                    {!token.isActive && (
                      <Badge variant="outline" className="text-xs">Inactive</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2 bg-gray-100 rounded px-2 py-1">
                    <code className="text-xs font-mono flex-1 truncate">
                      {showTokens[token.id] ? token.token : '•'.repeat(20)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShowToken(token.id)}
                      className="p-1"
                    >
                      {showTokens[token.id] ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToken(token.token)}
                      className="p-1"
                    >
                      {copiedToken === token.token ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {token.permissions.map(perm => (
                      <span
                        key={perm}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Created: {formatDate(token.createdAt)}</p>
                    {token.lastUsedAt && <p>Last used: {formatDate(token.lastUsedAt)}</p>}
                    {token.expiresAt && <p>Expires: {formatDate(token.expiresAt)}</p>}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(token.id)}
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
