import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { transactionService } from '../../services/transactionService'
import { accountService } from '../../services/accountService'
import { categoryService } from '../../services/categoryService'
import { formatCurrency, formatDate, firstDayOfMonth, lastDayOfMonth } from '../../utils/formatters'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'

export default function Transactions() {
    const [transactions, setTransactions] = useState([])
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)

    const [filters, setFilters] = useState({
        startDate: firstDayOfMonth(),
        endDate: lastDayOfMonth(),
        type: '',
        accountId: '',
    })

    useEffect(() => {
        fetchTransactions()
    }, [filters])

    useEffect(() => {
        accountService.findAll()
            .then(res => setAccounts(res.data))
            .catch(err => console.error(err))
    }, [])

    const fetchTransactions = async () => {
        try {
            setLoading(true)
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            )
            const res = await transactionService.findAll(params)
            setTransactions(res.data)
        } catch (err) {
            console.error('Erro ao buscar transações:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const handleNew = () => {
        setEditing(null)
        setModalOpen(true)
    }

    const handleEdit = (transaction) => {
        setEditing(transaction)
        setModalOpen(true)
    }

    const handleDelete = async (transaction) => {
        if (!window.confirm(`Excluir a transação "${transaction.description}"?`)) return
        try {
            await transactionService.delete(transaction.id)
            setTransactions(prev => prev.filter(t => t.id !== transaction.id))
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao excluir transação.')
        }
    }

    const handleModalClose = () => {
        setModalOpen(false)
        setEditing(null)
    }

    const handleSaveSuccess = () => {
        handleModalClose()
        fetchTransactions()
    }

    const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const totalExpense = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
                <Button onClick={handleNew}>
                    <Plus className="w-4 h-4" />
                    Nova transação
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 bg-green-50">
                    <p className="text-xs text-gray-500 mb-1">Receitas no período</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
                </Card>
                <Card className="p-4 bg-red-50">
                    <p className="text-xs text-gray-500 mb-1">Despesas no período</p>
                    <p className="text-xl font-bold text-red-700">{formatCurrency(totalExpense)}</p>
                </Card>
                <Card className={`p-4 ${totalIncome - totalExpense >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                    <p className="text-xs text-gray-500 mb-1">Saldo do período</p>
                    <p className={`text-xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                        {formatCurrency(totalIncome - totalExpense)}
                    </p>
                </Card>
            </div>
            <Card className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Input
                        label="Data inicial"
                        type="date"
                        value={filters.startDate}
                        onChange={e => handleFilterChange('startDate', e.target.value)}
                    />
                    <Input
                        label="Data final"
                        type="date"
                        value={filters.endDate}
                        onChange={e => handleFilterChange('endDate', e.target.value)}
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Tipo</label>
                        <select
                            value={filters.type}
                            onChange={e => handleFilterChange('type', e.target.value)}
                            className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Todos</option>
                            <option value="INCOME">Receitas</option>
                            <option value="EXPENSE">Despesas</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Conta</label>
                        <select
                            value={filters.accountId}
                            onChange={e => handleFilterChange('accountId', e.target.value)}
                            className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Todas</option>
                            {accounts.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>
            <Card>
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 p-12 text-center">
                        <ArrowUpCircle className="w-10 h-10 text-gray-300" />
                        <p className="text-gray-500">Nenhuma transação encontrada.</p>
                        <Button variant="outline" size="sm" onClick={handleNew}>
                            <Plus className="w-4 h-4" />
                            Nova transação
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {transactions.map(transaction => (
                            <TransactionRow
                                key={transaction.id}
                                transaction={transaction}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </Card>
            <Modal
                isOpen={modalOpen}
                onClose={handleModalClose}
                title={editing ? 'Editar transação' : 'Nova transação'}
            >
                <TransactionForm
                    transaction={editing}
                    onSuccess={handleSaveSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>
        </div>
    )
}

function TransactionRow({ transaction, onEdit, onDelete }) {
    const isIncome = transaction.type === 'INCOME'
    return (
        <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
                {isIncome
                    ? <ArrowUpCircle className="w-8 h-8 text-green-500 shrink-0" />
                    : <ArrowDownCircle className="w-8 h-8 text-red-500 shrink-0" />
                }
                <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-400">
                        {formatDate(transaction.date)}
                        {transaction.categoryName && ` · ${transaction.categoryName}`}
                        {` · ${transaction.accountName}`}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(transaction)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(transaction)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function TransactionForm({ transaction, onSuccess, onCancel }) {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [accounts, setAccounts] = useState([])
    const [categories, setCategories] = useState([])

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            description: transaction?.description ?? '',
            amount: transaction?.amount ?? '',
            type: transaction?.type ?? 'EXPENSE',
            date: transaction?.date ?? new Date().toISOString().split('T')[0],
            accountId: transaction?.accountId ?? '',
            categoryId: transaction?.categoryId ?? '',
            notes: transaction?.notes ?? '',
        }
    })

    const selectedType = watch('type')

    useEffect(() => {
        Promise.all([
            accountService.findAll(),
            categoryService.findAll(),
        ]).then(([accRes, catRes]) => {
            setAccounts(accRes.data)
            setCategories(catRes.data)
        }).catch(err => console.error(err))
    }, [])

    const filteredCategories = categories.filter(c => c.type === selectedType)

    const onSubmit = async (data) => {
        try {
            setSaving(true)
            setError('')

            const payload = {
                ...data,
                amount: parseFloat(data.amount),
                categoryId: data.categoryId || null,
            }

            if (transaction) {
                await transactionService.update(transaction.id, payload)
            } else {
                await transactionService.create(payload)
            }

            onSuccess()
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar transação.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                </div>
            )}
            <Select
                label="Tipo"
                {...register('type', { required: 'Tipo é obrigatório' })}
                error={errors.type?.message}
            >
                <option value="EXPENSE">Despesa</option>
                <option value="INCOME">Receita</option>
            </Select>
            <Input
                label="Descrição"
                placeholder="Ex: Supermercado, Salário..."
                error={errors.description?.message}
                {...register('description', { required: 'Descrição é obrigatória' })}
            />
            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Valor (R$)"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    error={errors.amount?.message}
                    {...register('amount', {
                        required: 'Valor é obrigatório',
                        min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                    })}
                />
                <Input
                    label="Data"
                    type="date"
                    error={errors.date?.message}
                    {...register('date', { required: 'Data é obrigatória' })}
                />
            </div>
            <Select
                label="Conta"
                error={errors.accountId?.message}
                {...register('accountId', { required: 'Conta é obrigatória' })}
            >
                <option value="">Selecione a conta...</option>
                {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                ))}
            </Select>
            <Select
                label="Categoria (opcional)"
                {...register('categoryId')}
            >
                <option value="">Sem categoria</option>
                {filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </Select>
            <Input
                label="Observações (opcional)"
                placeholder="Alguma anotação..."
                {...register('notes')}
            />
            <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" className="flex-1" isLoading={saving}>
                    {transaction ? 'Salvar alterações' : 'Criar transação'}
                </Button>
            </div>
        </form>
    )
}