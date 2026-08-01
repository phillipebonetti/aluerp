// Integration Base Types

export interface IntegrationConfig {
  id: string
  companyId: string
  provider: IntegrationProvider
  name: string
  description?: string
  status: IntegrationStatus
  isActive: boolean
  config?: Record<string, any>
  lastSync?: Date
  lastError?: string
  syncFrequency?: 'MANUAL' | 'HOURLY' | 'DAILY' | 'WEEKLY'
}

export enum IntegrationProvider {
  WHATSAPP = 'WHATSAPP',
  EMAIL = 'EMAIL',
  GOOGLE_CALENDAR = 'GOOGLE_CALENDAR',
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
  CONTA_AZUL = 'CONTA_AZUL',
  PIX_BANKING = 'PIX_BANKING',
  BOLETO_BANKING = 'BOLETO_BANKING',
  ZAPIER = 'ZAPIER',
  MAKE = 'MAKE',
  CUSTOM = 'CUSTOM'
}

export enum IntegrationStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED'
}

export interface IIntegrationProvider {
  provider: IntegrationProvider
  connect(credentials: Record<string, any>): Promise<void>
  testConnection(): Promise<boolean>
  sync(): Promise<SyncResult>
  getStatus(): Promise<IntegrationStatus>
  disconnect(): Promise<void>
}

export interface SyncResult {
  success: boolean
  itemsSynced: number
  itemsFailed: number
  nextSync?: Date
  error?: string
}

export interface WebhookEvent {
  id: string
  webhookId: string
  event: string
  payload: Record<string, any>
  attempt: number
  maxRetries: number
  nextRetryAt?: Date
  success: boolean
  statusCode?: number
  responseBody?: string
}

export interface ApiTokenPayload {
  id: string
  companyId: string
  userId: string
  name: string
  permissions: string[]
  expiresAt?: Date
  isActive: boolean
  lastUsedAt?: Date
  lastUsedIp?: string
}

export interface IntegrationLogData {
  id: string
  integrationId: string
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG'
  endpoint?: string
  method?: string
  statusCode?: number
  duration?: number
  errorMessage?: string
  requestData?: Record<string, any>
  responseData?: Record<string, any>
  metadata?: Record<string, any>
  createdAt: Date
}

// WhatsApp Types
export interface WhatsAppMessageData {
  id: string
  companyId: string
  phoneNumber: string
  contactName?: string
  template?: string
  content: string
  type: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'TEMPLATE'
  mediaUrl?: string
  mediaType?: string
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
  messageId?: string
  errorMessage?: string
  sentAt?: Date
  deliveredAt?: Date
  readAt?: Date
}

// Email Types
export interface EmailMessageData {
  id: string
  companyId: string
  toEmail: string
  ccEmail?: string
  bccEmail?: string
  subject: string
  body: string
  htmlBody?: string
  template?: string
  attachments?: Array<{ url: string; name: string }>
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED'
  errorMessage?: string
  scheduledFor?: Date
  sentAt?: Date
  openedAt?: Date
  clickedAt?: Date
}

// Calendar Types
export interface CalendarEventData {
  id: string
  companyId: string
  title: string
  description?: string
  type: 'INSTALLATION' | 'TECHNICAL' | 'COMMERCIAL' | 'INTERNAL' | 'REMINDER'
  startDate: Date
  endDate: Date
  timezone: string
  attendees?: string[]
  organizer?: string
  googleEventId?: string
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED'
}

// Drive Types
export interface StorageFileData {
  id: string
  companyId: string
  name: string
  type: 'CONTRACT' | 'WORK_PHOTO' | 'XML' | 'PDF' | 'ATTACHMENT'
  mimeType: string
  size: number
  fileUrl?: string
  googleDriveId?: string
  folderPath?: string
  workId?: string
  uploadedBy?: string
  isArchived: boolean
}

// Banking Types
export interface BankTransactionData {
  id: string
  companyId: string
  bankCode: string
  accountNumber: string
  transactionId: string
  amount: number
  type: 'DEBIT' | 'CREDIT'
  currency: string
  description: string
  counterparty?: string
  referenceCode?: string
  transactionDate: Date
  valueDate?: Date
  source: 'MANUAL' | 'PIX' | 'BOLETO' | 'TRANSFER' | 'API'
}
