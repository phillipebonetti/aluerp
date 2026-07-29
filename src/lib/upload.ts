/**
 * Utilitários para upload de arquivos
 */

export interface UploadValidation {
  maxSize: number // bytes
  allowedTypes: string[]
}

export const UPLOAD_VALIDATIONS = {
  logo: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  },
  signature: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/png', 'image/jpeg', 'application/pdf'],
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'image/png', 'image/jpeg'],
  },
}

export async function validateFile(file: File, validation: UploadValidation): Promise<{ valid: boolean; error?: string }> {
  if (file.size > validation.maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Máximo: ${Math.round(validation.maxSize / 1024 / 1024)}MB`,
    }
  }

  if (!validation.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Aceitos: ${validation.allowedTypes.join(', ')}`,
    }
  }

  return { valid: true }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      resolve(base64.split(',')[1]) // Remove data:image/...;base64, prefix
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function base64ToDataUrl(base64: string, mimeType: string = 'image/png'): string {
  return `data:${mimeType};base64,${base64}`
}
