// Encryption utilities for secure credential storage

import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-chars-please!'
const ALGORITHM = 'aes-256-gcm'

export function encryptData(data: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv)

    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Combinar IV + AuthTag + Encrypted Data
    const result = iv.toString('hex') + authTag.toString('hex') + encrypted
    return result
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Falha ao criptografar dados')
  }
}

export function decryptData(encryptedData: string): string {
  try {
    const iv = Buffer.from(encryptedData.substring(0, 32), 'hex')
    const authTag = Buffer.from(encryptedData.substring(32, 64), 'hex')
    const encrypted = encryptedData.substring(64)

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Falha ao descriptografar dados')
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}
