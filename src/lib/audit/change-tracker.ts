export interface ChangeTrackingData {
  before: Record<string, any>
  after: Record<string, any>
}

export interface ChangeRecord {
  field: string
  before: any
  after: any
  type: 'CREATE' | 'UPDATE' | 'DELETE'
}

/**
 * Compara antes/depois e gera registro de mudanças
 */
export function trackChanges(before: Record<string, any>, after: Record<string, any>): ChangeRecord[] {
  const changes: ChangeRecord[] = []
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])

  for (const key of allKeys) {
    const beforeValue = before[key]
    const afterValue = after[key]

    // Ignora campos sensíveis e de sistema
    if (['password', 'token', 'secret', 'updatedAt'].includes(key)) {
      continue
    }

    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes.push({
        field: key,
        before: beforeValue,
        after: afterValue,
        type: beforeValue === undefined ? 'CREATE' : 'UPDATE',
      })
    }
  }

  return changes
}

/**
 * Gera diff legível para apresentação
 */
export function formatChanges(changes: ChangeRecord[]): string {
  if (changes.length === 0) {
    return 'Sem mudanças'
  }

  return changes
    .map(change => {
      const before = typeof change.before === 'object' ? JSON.stringify(change.before) : change.before
      const after = typeof change.after === 'object' ? JSON.stringify(change.after) : change.after
      return `${change.field}: "${before}" → "${after}"`
    })
    .join('; ')
}

/**
 * Recupera histórico de um recurso com formatação
 */
export async function getResourceHistory(
  resource: string,
  resourceId: string
): Promise<any[]> {
  // Esta função seria implementada com chamada ao AuditService
  return []
}

/**
 * Restaura a versão anterior de um recurso
 */
export async function rollbackChange(
  resource: string,
  resourceId: string,
  timestamp: Date
): Promise<void> {
  // Esta função permitiria desfazer mudanças
}
