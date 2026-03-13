import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, RefreshCcw, PauseCircle, PlayCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { subscriptionService } from '../../services/subscriptionService'
import { accountService } from '../../services/accountService'
import { categoryService } from '../../services/categoryService'
import { formatCurrency, formatBillingDay } from '../../utils/formatters'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        fetchSubscriptions()
    }, [showAll])

    const fetchSubscriptions = async () => {
        try {
            setLoading(true)
            const res = await subscriptionService.findAll(showAll)
            setSubscriptions(res.data)
        } catch (err) {
            console.error('Erro ao buscar assinaturas:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleNew = () => {
        setEditing(null)
        setModalOpen(true)
    }

    const handleEdit = (subscription) => {
        setEditing(subscription)
        setModalOpen(true)
    }

    const handleDelete = async (subscription) => {
        if (!window.confirm(`Excluir permanentemente "${subscription.name}"?`)) return
        try {
            await subscriptionService.delete(subscription.id)
            setSubscriptions(prev => prev.filter(s => s.id !== subscription.id))
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao excluir assinatura.')
        }
    }

    const handleCancel = async (subscription) => {
        if (!window.confirm(`Cancelar a assinatura "${subscription.name}"?`)) return
        try {
            const res = await subscriptionService.cancel(subscription.id)
            setSubscriptions(prev =>
                prev.map(s => s.id === subscription.id ? res.data : s)
            )
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao cancelar assinatura.')
        }
    }

    const handleReactivate = async (subscription) => {
        try {
            const res = await subscriptionService.reactivate(subscription.id)
            setSubscriptions(prev =>
                prev.map(s => s.id === subscription.id ? res.data : s)
            )
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao reativar assinatura.')
        }
    }

    const handleModalClose = () => {
        setModalOpen(false)
        setEditing(null)
    }

    const handleSaveSuccess = () => {
        handleModalClose()
        fetchSubscriptions()
    }

    const monthlyTotal = subscriptions
        .filter(s => s.active)
        .reduce((sum, s) => sum + parseFloat(s.amount), 0)

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Assinaturas</h1>
                <Button onClick={handleNew}>
                    <Plus className="w-4 h-4" />
                    Nova assinatura
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 bg-primary-50">
                    <p className="text-xs text-gray-500 mb-1">Custo mensal</p>
                    <p className="text-xl font-bold text-primary-700">{formatCurrency(monthlyTotal)}</p>
                </Card>
                <Card className="p-4 bg-green-50">
                    <p className="text-xs text-gray-500 mb-1">Assinaturas ativas</p>
                    <p className="text-xl font-bold text-green-700">
                        {subscriptions.filter(s => s.active).length}
                    </p>
                </Card>
                <Card className="p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Total cadastradas</p>
                    <p className="text-xl font-bold text-gray-700">{subscriptions.length}</p>
                </Card>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Mostrar canceladas</span>
                <button
                    onClick={() => setShowAll(prev => !prev)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${showAll ? 'bg-primary-500' : 'bg-gray-200'
                        }`}
                >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showAll ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                </button>
            </div>
            {subscriptions.length === 0 ? (
                <Card className="p-12 flex flex-col items-center gap-3 text-center">
                    <RefreshCcw className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500 font-medium">Nenhuma assinatura cadastrada</p>
                    <Button onClick={handleNew} className="mt-2">
                        <Plus className="w-4 h-4" />
                        Nova assinatura
                    </Button>
                </Card>
            ) : (
                <Card>
                    <div className="divide-y divide-gray-100">
                        {subscriptions.map(subscription => (
                            <SubscriptionRow
                                key={subscription.id}
                                subscription={subscription}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onCancel={handleCancel}
                                onReactivate={handleReactivate}
                            />
                        ))}
                    </div>
                </Card>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={handleModalClose}
                title={editing ? 'Editar assinatura' : 'Nova assinatura'}
            >
                <SubscriptionForm
                    subscription={editing}
                    onSuccess={handleSaveSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>
        </div>
    )
}

function SubscriptionRow({ subscription, onEdit, onDelete, onCancel, onReactivate }) {
    return (
        <div className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${!subscription.active ? 'opacity-50' : ''
            }`}>
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${subscription.active ? 'bg-primary-100' : 'bg-gray-100'
                    }`}>
                    <RefreshCcw className={`w-4 h-4 ${subscription.active ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{subscription.name}</p>
                        {!subscription.active && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                Cancelada
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400">
                        {formatBillingDay(subscription.billingDay)}
                        {subscription.accountName && ` · ${subscription.accountName}`}
                        {subscription.categoryName && ` · ${subscription.categoryName}`}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">
                    {formatCurrency(subscription.amount)}<span className="text-xs text-gray-400 font-normal">/mês</span>
                </span>
                <div className="flex gap-1">
                    {subscription.active ? (
                        <button
                            onClick={() => onCancel(subscription)}
                            title="Cancelar assinatura"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                            <PauseCircle className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => onReactivate(subscription)}
                            title="Reativar assinatura"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        >
                            <PlayCircle className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(subscription)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(subscription)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function SubscriptionForm({ subscription, onSuccess, onCancel }) {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [accounts, setAccounts] = useState([])
    const [categories, setCategories] = useState([])

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: subscription?.name ?? '',
            amount: subscription?.amount ?? '',
            billingDay: subscription?.billingDay ?? '',
            accountId: subscription?.accountId ?? '',
            categoryId: subscription?.categoryId ?? '',
            startDate: subscription?.startDate ?? new Date().toISOString().split('T')[0],
            notes: subscription?.notes ?? '',
        }
    })

    useEffect(() => {
        Promise.all([
            accountService.findAll(),
            categoryService.findAll('EXPENSE'),
        ]).then(([accRes, catRes]) => {
            setAccounts(accRes.data)
            setCategories(catRes.data)
        })
    }, [])

    const onSubmit = async (data) => {
        try {
            setSaving(true)
            setError('')

            const payload = {
                ...data,
                amount: parseFloat(data.amount),
                billingDay: parseInt(data.billingDay),
                categoryId: data.categoryId || null,
            }

            if (subscription) {
                await subscriptionService.update(subscription.id, payload)
            } else {
                await subscriptionService.create(payload)
            }
            onSuccess()
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar assinatura.')
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
                label="Nome da assinatura"
                placeholder="Ex: Netflix, Spotify..."
                error={errors.name?.message}
                {...register('name', { required: 'Nome é obrigatório' })}
            />
            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="Valor mensal (R$)"
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
                    label="Dia de cobrança"
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ex: 5"
                    error={errors.billingDay?.message}
                    {...register('billingDay', {
                        required: 'Dia é obrigatório',
                        min: { value: 1, message: 'Entre 1 e 31' },
                        max: { value: 31, message: 'Entre 1 e 31' },
                    })}
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
                {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </Select>
            <Input
                label="Data de início"
                type="date"
                error={errors.startDate?.message}
                {...register('startDate')}
            />
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
                    {subscription ? 'Salvar alterações' : 'Criar assinatura'}
                </Button>
            </div>
        </form>
    )
}