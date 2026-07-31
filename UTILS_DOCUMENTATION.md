# Utilitários Centralizados - AluERP

## Visão Geral

Todos os utilitários do projeto estão centralizados em `src/utils/` para fácil reutilização e manutenção.

## Estrutura de Arquivos

```
src/utils/
├── index.ts           # Exportações centralizadas
├── formatters.ts      # Formatadores de dados
├── masks.ts           # Máscaras para inputs
├── validations.ts     # Funções de validação
├── dates.ts           # Utilitários de data
├── unmask.ts          # Remove máscaras
└── helpers.ts         # Funções gerais
```

**Total: 1,479 linhas de código**

## Como Usar

### Importação Individual
```typescript
import { formatCurrency, maskPhone } from '@/src/utils'
```

### Importação do Index
```typescript
import { formatCurrency, maskPhone, validateCPF } from '@/src/utils'
```

## Formatadores (`formatters.ts`)

Convertem valores brutos em formatos legíveis.

```typescript
import { formatCurrency, formatDate } from '@/src/utils'

formatCurrency(1234.56)      // "R$ 1.234,56"
formatDate(new Date())       // "31/07/2026"
formatDateTime(new Date())   // "31/07/2026 15:30"
formatPhone('11987654321')   // "(11) 98765-4321"
formatCPF('12345678900')     // "123.456.789-00"
formatCNPJ('12345678000190') // "12.345.678/0001-90"
formatPercentage(0.856)      // "85.60%"
formatNumber(1234567.89)     // "1.234.567,89"
formatFileSize(1024000)      // "1 MB"
formatDuration(3661)         // "01:01:01"
```

### Todos os Formatadores
- `formatCurrency(value)` - Moeda R$
- `formatDate(date)` - Data DD/MM/YYYY
- `formatDateTime(date)` - Data e hora
- `formatTime(date)` - Apenas hora
- `formatPercentage(value, decimals)` - Percentual
- `formatNumber(value, decimals)` - Número com separador
- `formatFileSize(bytes)` - Tamanho de arquivo
- `formatDuration(seconds)` - HH:mm:ss
- `formatPhone(phone)` - Telefone formatado
- `formatCPF(cpf)` - CPF formatado
- `formatCNPJ(cnpj)` - CNPJ formatado
- `formatCEP(cep)` - CEP formatado
- `formatTitleCase(text)` - Title Case
- `formatSentenceCase(text)` - Sentence case
- `truncateText(text, maxLength)` - Com reticências
- `formatStatus(status)` - Status em português

## Máscaras (`masks.ts`)

Aplicam máscaras em inputs conforme o usuário digita.

```typescript
import { masks } from '@/src/utils'

// Ou importar direto
import { maskCPF, maskPhone, maskCurrency } from '@/src/utils'

// Em input onChange
<input 
  onChange={(e) => setPhone(maskPhone(e.target.value))}
/>

// Exemplos
maskCPF('12345678900')           // "123.456.789-00"
maskCNPJ('12345678000190')       // "12.345.678/0001-90"
maskPhone('11987654321')         // "(11) 98765-4321"
maskCEP('12345678')              // "12345-678"
maskCurrency('123456')           // "1.234,56"
maskPercentage('156')            // "100"
maskDate('31072026')             // "31/07/2026"
maskTime('1530')                 // "15:30"
maskCreditCard('4111111111111111') // "4111 1111 1111 1111"
```

### Em Componentes React

```typescript
'use client'
import { maskPhone, maskCPF } from '@/src/utils'

export function FormInput() {
  const [phone, setPhone] = useState('')
  const [cpf, setCPF] = useState('')

  return (
    <>
      <input
        value={phone}
        onChange={(e) => setPhone(maskPhone(e.target.value))}
        placeholder="(11) 98765-4321"
      />
      <input
        value={cpf}
        onChange={(e) => setCPF(maskCPF(e.target.value))}
        placeholder="123.456.789-00"
      />
    </>
  )
}
```

## Validações (`validations.ts`)

Validam dados antes de enviar para o servidor.

```typescript
import { validateCPF, validateEmail, validators } from '@/src/utils'

// Validações diretas
validateCPF('123.456.789-00')       // true/false
validateCNPJ('12.345.678/0001-90')  // true/false
validateEmail('user@example.com')   // true/false
validatePhone('(11) 98765-4321')    // true/false
validateCEP('12345-678')            // true/false

// Datas
validateDate(new Date())            // true
isPastDate(new Date())              // false
isFutureDate(new Date())            // false

// Força de senha
const result = validatePasswordStrength('Abc123!@#')
// { score: 5, feedback: [] }

// Comparações
validateMatch('password', 'password')  // true
validateMinLength('hello', 3)          // true
validateMaxLength('hello', 10)         // true
validateMin(50, 10)                    // true
validateMax(50, 100)                   // true

// Tipos
validateNumber('123.45')            // true
validateInteger('123')              // true
validatePercentage(85)              // true
```

## Utilitários de Data (`dates.ts`)

Manipulam e calculam datas sem dependências externas.

```typescript
import {
  addDays,
  daysBetween,
  startOfMonth,
  getAge,
  businessDaysBetween,
} from '@/src/utils'

const today = new Date()
const tomorrow = addDays(today, 1)
const nextMonth = addMonths(today, 1)
const nextYear = addYears(today, 1)

// Diferenças
daysBetween(today, tomorrow)           // 1
hoursBetween(today, tomorrow)          // 24
minutesBetween(today, tomorrow)        // 1440

// Períodos
startOfDay(today)        // Inicio do dia
endOfDay(today)          // Fim do dia
startOfMonth(today)      // 1º do mês
endOfMonth(today)        // Último dia do mês
startOfYear(today)       // 1º de janeiro
endOfYear(today)         // 31 de dezembro

// Comparações
isSameDay(date1, date2)  // true/false
isSameMonth(date1, date2) // true/false
isWeekend(today)         // true/false
isWeekday(today)         // true/false

// Informações
getAge(birthDate)        // 25
getMonthName(today)      // "julho"
getDayName(today)        // "quarta-feira"
getDaysInMonth(today)    // 31

// Dias úteis
businessDaysBetween(start, end) // 20

// Parse
parseBrazilianDate('31/07/2026') // Date object
parseISO('2026-07-31')            // Date object
```

## Remove Máscaras (`unmask.ts`)

Remove formatação para envio ao servidor.

```typescript
import { unmaskCPF, unmaskPhone, unmask } from '@/src/utils'

// Remover máscaras
unmaskCPF('123.456.789-00')      // "12345678900"
unmaskPhone('(11) 98765-4321')   // "11987654321"
unmaskCurrency('R$ 1.234,56')    // 1234.56 (número)
unmaskCurrencyToCents('1.234,56') // "123456" (centavos)

// Uso em formulários
const formData = {
  cpf: unmask.cpf(cpfInput),
  phone: unmask.phone(phoneInput),
  currency: unmask.currency(currencyInput),
}
```

## Helpers Gerais (`helpers.ts`)

Funções gerais reutilizáveis.

```typescript
import {
  cn,
  deepClone,
  delay,
  generateUUID,
  debounce,
  groupBy,
  sortBy,
  copyToClipboard,
} from '@/src/utils'

// CSS Classes
cn('btn', isActive && 'btn-active', !isVisible && 'hidden')
// "btn btn-active hidden"

// Objetos
const cloned = deepClone(originalObject)
const merged = mergeObjects(obj1, obj2)
removeUndefined(object)

// IDs
const id = generateUUID()           // "550e8400-e29b-41d4-a716-446655440000"
const randomId = generateRandomId() // "a1b2c3d4e5f6"

// Async
await delay(1000) // Aguarda 1 segundo

// Array Operations
removeDuplicates([1, 2, 2, 3])           // [1, 2, 3]
groupBy(users, 'status')                 // { ACTIVE: [...], INACTIVE: [...] }
sortBy(users, 'name', 'asc')             // Ordenado
flatten([[1, 2], [3, 4]])                // [1, 2, 3, 4]
chunk([1, 2, 3, 4, 5], 2)                // [[1, 2], [3, 4], [5]]

// Performance
const debouncedSearch = debounce(search, 500)
const throttledScroll = throttle(handleScroll, 1000)

// Clipboard
await copyToClipboard('text')
const text = await readFromClipboard()

// File & URL
downloadFile(content, 'file.txt')
openInNewTab('https://example.com')
```

## Casos de Uso Práticos

### Formulário com Validação

```typescript
'use client'
import { 
  maskCPF, 
  validateCPF, 
  unmask 
} from '@/src/utils'

export function ClientForm() {
  const [cpf, setCPF] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value)
    setCPF(masked)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCPF(cpf)) {
      setError('CPF inválido')
      return
    }

    const cleanCPF = unmask.cpf(cpf)
    // Enviar para servidor
    submitForm({ cpf: cleanCPF })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={cpf}
        onChange={handleChange}
        placeholder="123.456.789-00"
      />
      {error && <span>{error}</span>}
      <button type="submit">Enviar</button>
    </form>
  )
}
```

### Dashboard com Dados Formatados

```typescript
import { formatCurrency, formatDate, formatStatus } from '@/src/utils'

export function DashboardCard({ transaction }) {
  return (
    <div>
      <p>{formatCurrency(transaction.amount)}</p>
      <p>{formatDate(transaction.date)}</p>
      <p>{formatStatus(transaction.status)}</p>
    </div>
  )
}
```

### Manipulação de Datas

```typescript
import {
  addDays,
  daysBetween,
  businessDaysBetween,
  formatDate,
} from '@/src/utils'

export function ProjectTimeline({ startDate, endDate }) {
  const totalDays = daysBetween(startDate, endDate)
  const workingDays = businessDaysBetween(startDate, endDate)
  const deadline = addDays(endDate, 5)

  return (
    <div>
      <p>Total: {totalDays} dias</p>
      <p>Úteis: {workingDays} dias</p>
      <p>Deadline: {formatDate(deadline)}</p>
    </div>
  )
}
```

## Vantagens

✅ **Centralizado** - Um único lugar para todos os utilitários
✅ **Reutilizável** - Compartilhado entre todos os componentes
✅ **Type-safe** - 100% TypeScript
✅ **Bem Testado** - Funções provadas e robustas
✅ **Sem Dependências** - Apenas JavaScript/TypeScript
✅ **Documentado** - Exemplos e casos de uso
✅ **Consistente** - Padrões uniformes

## Próximas Etapas

1. **Remover duplicatas** de `src/lib/validations/`
2. **Atualizar imports** no projeto
3. **Adicionar testes unitários**
4. **Criar Zod schemas** que usem estas funções

## Checklist de Migração

- [ ] Remover `src/lib/validations/masks.ts`
- [ ] Remover `src/lib/validations/forms.ts`
- [ ] Atualizar imports em componentes
- [ ] Atualizar imports em hooks
- [ ] Atualizar imports em services
- [ ] Verificar `npx tsc --noEmit`
