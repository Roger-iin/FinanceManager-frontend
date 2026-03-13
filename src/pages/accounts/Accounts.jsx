import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { accountService } from '../../services/accountService'
import { formatCurrency, formatAccountType } from '../../utils/formatters'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'

const ACCOUNT_TYPES = [
    { value: 'CHECKING', label: 'Conta Corrente' },
    { value: 'SAVINGS', label: 'Poupança' },
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
    { value: 'DEBIT', label: 'Débito' },
]

export default function Accounts() {
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)

    useEffect(() => {
        fetchAccounts()
    }, [])

    const fetchAccounts = async () => {
        try {
            setLoading(true)
            const res = await accountService.findAll()
            setAccounts(res.data)
        } catch (err) {
            console.error('Erro ao buscar contas:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleNew = () => {
        setEditing(null)
        setModalOpen(true)
    }

    const handleEdit = (account) => {
        setEditing(account)
        setModalOpen(true)
    }

    const handleDelete = async (account) => {
        if (!window.confirm(`Excluir a conta "${account.name}"?`)) return
        try {
            await accountService.delete(account.id)
            setAccounts(prev => prev.filter(a => a.id !== account.id))
        } catch (err) {
            const msg = err.response?.data?.error || 'Erro ao excluir conta.'
            alert(msg)
        }
    }

    const handleModalClose = () => {
        setModalOpen(false)
        setEditing(null)
    }

    const handleSaveSuccess = () => {
        handleModalClose()
        fetchAccounts()
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Contas</h1>
                <Button onClick={handleNew}>
                    <Plus className="w-4 h-4" />
                    Nova conta
                </Button>
            </div>
            {accounts.length === 0 ? (
                <Card className="p-12 flex flex-col items-center gap-3 text-center">
                    <Wallet className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500 font-medium">Nenhuma conta cadastrada</p>
                    <p className="text-gray-400 text-sm">Crie sua primeira conta para começar</p>
                    <Button onClick={handleNew} className="mt-2">
                        <Plus className="w-4 h-4" />
                        Nova conta
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accounts.map(account => (
                        <AccountCard
                            key={account.id}
                            account={account}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={handleModalClose}
                title={editing ? 'Editar conta' : 'Nova conta'}
            >
                <AccountForm
                    account={editing}
                    onSuccess={handleSaveSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>
        </div>
    )
}

function AccountCard({ account, onEdit, onDelete }) {
    return (
        <Card className="p-5">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: account.color + '20' }}
                    >
                        <Wallet
                            className="w-5 h-5"
                            style={{ color: account.color }}
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{account.name}</p>
                        <p className="text-xs text-gray-400">{formatAccountType(account.type)}</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(account)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(account)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(account.balance)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Saldo atual</p>
        </Card>
    )
}

function AccountForm({ account, onSuccess, onCancel }) {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: account?.name ?? '',
            type: account?.type ?? '',
            color: account?.color ?? '#6366f1',
            balance: account?.balance ?? '',
        }
    })

    const onSubmit = async (data) => {
        try {
            setSaving(true)
            setError('')
            const payload = {
                ...data,
                balance: parseFloat(data.balance) || 0,
            }
            if (account) {
                await accountService.update(account.id, payload)
            } else {
                await accountService.create(payload)
            }
            onSuccess()
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar conta.')
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
            <Input
                label="Nome da conta"
                placeholder="Ex: Nubank, Bradesco..."
                error={errors.name?.message}
                {...register('name', { required: 'Nome é obrigatório' })}
            />
            <Select
                label="Tipo"
                error={errors.type?.message}
                {...register('type', { required: 'Tipo é obrigatório' })}
            >
                <option value="">Selecione o tipo...</option>
                {ACCOUNT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                ))}
            </Select>
            <Input
                label="Saldo inicial"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                error={errors.balance?.message}
                {...register('balance')}
            />
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Cor</label>
                <input
                    type="color"
                    className="h-10 w-full rounded-lg border border-gray-300 cursor-pointer p-1"
                    {...register('color')}
                />
            </div>
            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={onCancel}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    className="flex-1"
                    isLoading={saving}
                >
                    {account ? 'Salvar alterações' : 'Criar conta'}
                </Button>
            </div>

        </form>
    )
}