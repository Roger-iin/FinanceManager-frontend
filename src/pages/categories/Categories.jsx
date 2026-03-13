import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Tag, Lock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { categoryService } from '../../services/categoryService'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'

const TRANSACTION_TYPES = [
    { value: 'EXPENSE', label: 'Despesa' },
    { value: 'INCOME', label: 'Receita' },
]

export default function Categories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [tab, setTab] = useState('EXPENSE')

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const res = await categoryService.findAll()
            setCategories(res.data)
        } catch (err) {
            console.error('Erro ao buscar categorias:', err)
        } finally {
            setLoading(false)
        }
    }

    const filtered = categories.filter(c => c.type === tab)

    const handleNew = () => {
        setEditing(null)
        setModalOpen(true)
    }

    const handleEdit = (category) => {
        setEditing(category)
        setModalOpen(true)
    }

    const handleDelete = async (category) => {
        if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return
        try {
            await categoryService.delete(category.id)
            setCategories(prev => prev.filter(c => c.id !== category.id))
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao excluir categoria.')
        }
    }

    const handleModalClose = () => {
        setModalOpen(false)
        setEditing(null)
    }

    const handleSaveSuccess = () => {
        handleModalClose()
        fetchCategories()
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
                <Button onClick={handleNew}>
                    <Plus className="w-4 h-4" />
                    Nova categoria
                </Button>
            </div>
            <Card>
                <div className="flex border-b border-gray-200 px-4">
                    {TRANSACTION_TYPES.map(type => (
                        <button
                            key={type.value}
                            onClick={() => setTab(type.value)}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === type.value
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {type.label}s
                        </button>
                    ))}
                </div>
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 p-12 text-center">
                        <Tag className="w-10 h-10 text-gray-300" />
                        <p className="text-gray-500">Nenhuma categoria encontrada.</p>
                        <Button variant="outline" size="sm" onClick={handleNew}>
                            <Plus className="w-4 h-4" />
                            Criar categoria
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filtered.map(category => (
                            <CategoryRow
                                key={category.id}
                                category={category}
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
                title={editing ? 'Editar categoria' : 'Nova categoria'}
            >
                <CategoryForm
                    category={editing}
                    defaultType={tab}
                    onSuccess={handleSaveSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>
        </div>
    )
}

function CategoryRow({ category, onEdit, onDelete }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                >
                    <Tag className="w-4 h-4" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    {category.isSystemCategory && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Lock className="w-3 h-3" />
                            Sistema
                        </span>
                    )}
                </div>
            </div>
            {!category.isSystemCategory && (
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(category)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(category)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}

function CategoryForm({ category, defaultType, onSuccess, onCancel }) {
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: category?.name ?? '',
            type: category?.type ?? defaultType ?? 'EXPENSE',
            color: category?.color ?? '#6366f1',
            icon: category?.icon ?? 'tag',
        }
    })

    const onSubmit = async (data) => {
        try {
            setSaving(true)
            setError('')
            if (category) {
                await categoryService.update(category.id, data)
            } else {
                await categoryService.create(data)
            }
            onSuccess()
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar categoria.')
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
                label="Nome"
                placeholder="Ex: Alimentação, Salário..."
                error={errors.name?.message}
                {...register('name', { required: 'Nome é obrigatório' })}
            />
            <Select
                label="Tipo"
                error={errors.type?.message}
                disabled={!!category}
                {...register('type', { required: 'Tipo é obrigatório' })}
            >
                {TRANSACTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                ))}
            </Select>
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Cor</label>
                <input
                    type="color"
                    className="h-10 w-full rounded-lg border border-gray-300 cursor-pointer p-1"
                    {...register('color')}
                />
            </div>
            <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" className="flex-1" isLoading={saving}>
                    {category ? 'Salvar alterações' : 'Criar categoria'}
                </Button>
            </div>
        </form>
    )
}