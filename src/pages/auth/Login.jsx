import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { TrendingUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { authService } from '../../services/authService'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [error, setError] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm()

    const onSubmit = async (data) => {
        try {
            setError('')
            const res = await authService.login(data)
            login(
                { id: res.data.id, name: res.data.name, email: res.data.email },
                res.data.token
            )
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao fazer login.')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">FinanceApp</span>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Entrar</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Não tem conta?{' '}
                        <Link to="/register" className="text-primary-600 font-medium hover:underline">
                            Criar conta
                        </Link>
                    </p>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
                        <Input
                            label="E-mail"
                            type="email"
                            placeholder="seu@email.com"
                            error={errors.email?.message}
                            {...register('email', {
                                required: 'E-mail é obrigatório',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'E-mail inválido',
                                }
                            })}
                        />
                        <Input
                            label="Senha"
                            type="password"
                            placeholder="••••••••"
                            error={errors.password?.message}
                            {...register('password', {
                                required: 'Senha é obrigatória',
                            })}
                        />
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                            className="w-full mt-2"
                        >
                            Entrar
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}