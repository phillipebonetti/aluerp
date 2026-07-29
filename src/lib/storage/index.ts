/**
 * Storage Organization System
 * Estrutura centralizada para organização de arquivos em pastas temáticas
 */

export const STORAGE_FOLDERS = {
  CLIENTES: 'clientes',
  FORNECEDORES: 'fornecedores',
  OBRAS: 'obras',
  ORCAMENTOS: 'orcamentos',
  OS: 'os',
  NOTAS: 'notas',
  DOCUMENTOS: 'documentos',
} as const

export type StorageFolder = (typeof STORAGE_FOLDERS)[keyof typeof STORAGE_FOLDERS]

/**
 * Gera caminho completo para um arquivo baseado no tipo
 */
export function generateStoragePath(
  folder: StorageFolder,
  companyId: string,
  filename: string,
  version?: number
): string {
  const timestamp = Date.now()
  const versionSuffix = version ? `-v${version}` : ''
  const sanitizedFilename = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')

  return `${folder}/${companyId}/${timestamp}-${sanitizedFilename}${versionSuffix}`
}

/**
 * Parse path para extrair informações
 */
export function parseStoragePath(path: string) {
  const parts = path.split('/')
  return {
    folder: parts[0],
    companyId: parts[1],
    filename: parts[2],
  }
}

/**
 * Validações por tipo de arquivo
 */
export const FILE_VALIDATIONS = {
  clientes: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['application/pdf', 'image/png', 'image/jpeg', 'application/msword'],
  },
  fornecedores: {
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'image/png', 'image/jpeg'],
  },
  obras: {
    maxSize: 100 * 1024 * 1024, // 100MB para obras
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'],
  },
  orcamentos: {
    maxSize: 20 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'application/vnd.ms-excel'],
  },
  os: {
    maxSize: 30 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  notas: {
    maxSize: 30 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  documentos: {
    maxSize: 50 * 1024 * 1024,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'],
  },
} as const

export type FileValidation = (typeof FILE_VALIDATIONS)[StorageFolder]

/**
 * Obter validação para uma pasta
 */
export function getValidationForFolder(folder: StorageFolder): FileValidation {
  return FILE_VALIDATIONS[folder]
}

/**
 * Converter bytes para formato legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Extrair extensão do arquivo
 */
export function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase()
}

/**
 * Obter ícone baseado no tipo de arquivo
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word')) return '📝'
  if (mimeType.includes('sheet')) return '📊'
  if (mimeType.startsWith('video/')) return '🎥'
  return '📎'
}
