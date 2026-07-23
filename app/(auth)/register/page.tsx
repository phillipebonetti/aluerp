import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Criar conta — AluERP',
  description: 'Crie sua conta gratuita no AluERP.',
}

export default function RegisterPage() {
  return <RegisterForm />
}
