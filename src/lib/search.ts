/**
 * Advanced Search Utilities - Full-text search otimizado
 */

export interface SearchConfig {
  fields: string[]
  weights?: Record<string, number>
  caseSensitive?: boolean
  fuzzy?: boolean
}

export interface SearchResult<T> {
  item: T
  score: number
  matches: {
    field: string
    value: any
  }[]
}

/**
 * Calcula score de relevância baseado em matches
 */
function calculateRelevanceScore(
  query: string,
  text: string,
  weight: number = 1,
  isFuzzy: boolean = false
): number {
  if (!text) return 0

  const normalizedText = text.toLowerCase()
  const normalizedQuery = query.toLowerCase()

  let score = 0

  // Exact match
  if (normalizedText === normalizedQuery) {
    score += 100 * weight
  }
  // Starts with
  else if (normalizedText.startsWith(normalizedQuery)) {
    score += 50 * weight
  }
  // Contains
  else if (normalizedText.includes(normalizedQuery)) {
    score += 25 * weight
  }
  // Fuzzy match
  else if (isFuzzy && fuzzyMatch(normalizedQuery, normalizedText)) {
    score += 10 * weight
  }

  return score
}

/**
 * Fuzzy matching - encontra padrão mesmo com erros
 */
function fuzzyMatch(query: string, text: string): boolean {
  let queryIdx = 0

  for (let i = 0; i < text.length; i++) {
    if (text[i] === query[queryIdx]) {
      queryIdx++
    }
    if (queryIdx === query.length) return true
  }

  return false
}

/**
 * Busca em array de objetos
 */
export function searchInArray<T>(
  items: T[],
  query: string,
  config: SearchConfig
): SearchResult<T>[] {
  if (!query.trim()) return []

  const results = items
    .map((item) => {
      let totalScore = 0
      const matches: SearchResult<T>['matches'] = []

      for (const field of config.fields) {
        const fieldValue = (item as any)[field]
        const weight = config.weights?.[field] ?? 1
        const fieldText =
          typeof fieldValue === 'string'
            ? fieldValue
            : JSON.stringify(fieldValue)

        const score = calculateRelevanceScore(
          query,
          fieldText,
          weight,
          config.fuzzy
        )

        if (score > 0) {
          totalScore += score
          matches.push({
            field,
            value: fieldValue,
          })
        }
      }

      return {
        item,
        score: totalScore,
        matches,
      }
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)

  return results
}

/**
 * Gera query de busca para Prisma
 */
export function generateSearchQuery(
  query: string,
  fields: string[]
): Record<string, any> {
  if (!query.trim()) return {}

  const searchTerms = query.split(' ').filter((t) => t.length > 0)

  return {
    OR: searchTerms.flatMap((term) =>
      fields.map((field) => ({
        [field]: {
          contains: term,
          mode: 'insensitive',
        },
      }))
    ),
  }
}

/**
 * Highlights resultado de busca
 */
export function highlightSearchResults(
  text: string,
  query: string,
  tag: string = 'mark'
): string {
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, `<${tag}>$1</${tag}>`)
}

/**
 * Normaliza texto para busca (remove acentos, lowercase, etc)
 */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Extrai keywords do texto
 */
export function extractKeywords(
  text: string,
  minLength: number = 3
): string[] {
  return text
    .toLowerCase()
    .split(/[\s,;:.!?]+/)
    .filter((word) => word.length >= minLength)
    .reduce((acc: string[], word) => {
      if (!acc.includes(word)) acc.push(word)
      return acc
    }, [])
}
