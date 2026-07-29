import { z } from 'zod'

export const EmployeeRoleEnum = z.enum(['SELLER', 'TECHNICIAN', 'MANAGER', 'ADMIN', 'OTHER'])
export const EmployeeStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'])

export const CreateEmployeeSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  role: EmployeeRoleEnum,
  commissionRate: z.coerce.number().min(0).max(100, 'Comissão deve estar entre 0% e 100%'),
  status: EmployeeStatusEnum,
})

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial().extend({
  id: z.string().cuid(),
})

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>
