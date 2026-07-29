export type Employee = {
  id: string
  companyId: string
  name: string
  email: string | null
  phone: string | null
  role: 'SELLER' | 'TECHNICIAN' | 'MANAGER' | 'ADMIN' | 'OTHER'
  commissionRate: number
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ARCHIVED'
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type CreateEmployeeInput = {
  name: string
  email?: string
  phone?: string
  role: Employee['role']
  commissionRate: number
  status: Employee['status']
}

export type UpdateEmployeeInput = Partial<CreateEmployeeInput> & {
  id: string
}

export type EmployeeFormData = CreateEmployeeInput
