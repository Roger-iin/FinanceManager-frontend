const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
})

export function formatCurrency(value) {
    return currencyFormatter.format(value ?? 0)
}

export function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR')
    // toLocaleDateString('pt-BR') → "DD/MM/YYYY"
}

// formatDateShort("YYYY-MM-DD") → "DD/MM"
export function formatDateShort(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// formatDateLong("YYYY-MM-DD") → "DD de mês de YYYY"
export function formatDateLong(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

// formatMonthYear("YYYY-MM-DD") → "Mês YYYY"
export function formatMonthYear(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    })
}

// formatToInput(new Date()) → "YYYY-MM-DD"
export function formatToInput(date) {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Retorna "YYYY-MM-DD"
export function firstDayOfMonth() {
    const now = new Date()
    return formatToInput(new Date(now.getFullYear(), now.getMonth(), 1))
}

export function lastDayOfMonth() {
    const now = new Date()
    return formatToInput(new Date(now.getFullYear(), now.getMonth() + 1, 0))
}

export function formatTransactionType(type) {
    return type === 'INCOME' ? 'Receita' : 'Despesa'
}

export function formatAccountType(type) {
    const types = {
        CHECKING: 'Conta Corrente',
        SAVINGS: 'Poupança',
        CREDIT_CARD: 'Cartão de Crédito',
        DEBIT: 'Débito',
    }
    return types[type] ?? type
}

export function formatBillingDay(day) {
    return `Todo dia ${day}`
}