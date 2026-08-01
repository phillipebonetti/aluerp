// Client Portal Types and Interfaces

export interface ClientSession {
  clientId: string
  clientName: string
  email: string
  phone?: string
  companyId: string
  companyName: string
  avatar?: string
  token: string
  expiresAt: Date
}

export interface ClientLoginInput {
  email: string
  password: string
}

export interface ClientRegisterInput {
  email: string
  name: string
  phone: string
  password: string
  passwordConfirm: string
}

export interface ClientForgotPasswordInput {
  email: string
}

export interface ClientResetPasswordInput {
  token: string
  password: string
  passwordConfirm: string
}

export interface ClientProfileUpdate {
  name?: string
  phone?: string
  email?: string
  avatar?: string
}

// Dashboard
export interface ClientDashboardData {
  totalWorks: number
  completedWorks: number
  inProgressWorks: number
  pendingQuotes: number
  totalContracted: number
  pendingPayments: number
  totalPaid: number
  nextMilestone?: string
  nextMilestoneDate?: Date
  recentUpdates: Activity[]
}

export interface Activity {
  id: string
  type: 'work_update' | 'payment' | 'document' | 'message'
  title: string
  description: string
  timestamp: Date
  workId?: string
  relatedId?: string
}

// Works
export interface ClientWork {
  id: string
  name: string
  address: string
  status: 'PLANNING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED'
  progress: number
  startDate: Date
  endDate?: Date
  expectedEndDate: Date
  responsible: string
  totalValue: number
  paidValue: number
  pendingValue: number
  description?: string
  lastUpdate: Date
  photos: number
  documents: number
  nextMilestone?: string
  nextMilestoneDate?: Date
  timeline: Milestone[]
}

export interface Milestone {
  id: string
  name: string
  description?: string
  dueDate: Date
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED'
  completedDate?: Date
  progress: number
  responsible?: string
}

export interface WorkActivity {
  id: string
  type: 'status_change' | 'milestone_update' | 'photo_added' | 'document_added' | 'comment'
  title: string
  description: string
  createdBy: string
  createdAt: Date
  workId: string
}

// Gallery
export interface GalleryPhoto {
  id: string
  url: string
  thumbnail: string
  caption?: string
  uploadedAt: Date
  uploadedBy: string
  stage: string
  tags: string[]
}

// Documents
export interface ClientDocument {
  id: string
  name: string
  type: 'CONTRACT' | 'BUDGET' | 'INVOICE' | 'RECEIPT' | 'PROJECT' | 'ATTACHMENT' | 'TECHNICAL'
  url: string
  fileSize: number
  uploadedAt: Date
  uploadedBy: string
  workId?: string
  expiresAt?: Date
  isRestricted: boolean
}

// Financial
export interface PaymentItem {
  id: string
  installmentNumber: number
  totalInstallments: number
  amount: number
  dueDate: Date
  paidDate?: Date
  status: 'PENDING' | 'OVERDUE' | 'PAID' | 'PARTIALLY_PAID'
  paymentMethod?: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'TRANSFER'
  boleto?: BoletoData
  pix?: PixData
  workId: string
  workName: string
}

export interface BoletoData {
  code: string
  barcode: string
  expiresAt: Date
  pdfUrl: string
}

export interface PixData {
  qrCode: string
  copyPaste: string
  expiresAt: Date
}

export interface FinancialSummary {
  totalContracted: number
  totalPaid: number
  totalPending: number
  nextPaymentDate?: Date
  nextPaymentAmount?: number
  totalOverdue: number
  overdueDays: number
}

// Communications
export interface ClientMessage {
  id: string
  from: 'CLIENT' | 'COMPANY'
  senderName: string
  senderAvatar?: string
  subject: string
  content: string
  attachments?: MessageAttachment[]
  sentAt: Date
  readAt?: Date
  isRead: boolean
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  fileSize: number
  type: string
}

// Support Tickets
export interface SupportTicket {
  id: string
  number: string
  subject: string
  description: string
  type: 'TECHNICAL' | 'WARRANTY' | 'MAINTENANCE' | 'QUESTION' | 'MODIFICATION'
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  responsible?: string
  responsibleAvatar?: string
  workId?: string
  messages: TicketMessage[]
  attachments: MessageAttachment[]
}

export interface TicketMessage {
  id: string
  from: 'CLIENT' | 'COMPANY'
  senderName: string
  senderAvatar?: string
  content: string
  attachments?: MessageAttachment[]
  createdAt: Date
}

// Notifications
export interface ClientNotification {
  id: string
  type: 'work_update' | 'payment_due' | 'document_new' | 'message_new' | 'schedule_change' | 'ticket_update'
  title: string
  description: string
  link?: string
  icon: string
  read: boolean
  createdAt: Date
}
