/**
 * Constantes Centralizadas da Aplicação AluERP
 * Single source of truth para valores estáticos e configurações
 * 
 * Importar constantes específicas:
 * import { USER_STATUS, CLIENT_STATUS } from '@/src/constants/status'
 * import { ROLES, PERMISSIONS } from '@/src/constants/permissions'
 * import { MAIN_MENU_ITEMS } from '@/src/constants/menus'
 */

// Status (Usuários, Clientes, Obras, etc)
export * from './status'

// Cores e Paleta de Design
export * from './colors'

// Permissões e Roles (RBAC)
export * from './permissions'

// Menus e Navegação
export * from './menus'

// Tipos de Pagamento e Categorias
export * from './payment'

// Configurações Globais
export * from './config'

// Constantes de Ambiente (manter compatibilidade)
export * from '@/src/core/config/constants'
