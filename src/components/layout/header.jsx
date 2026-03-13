import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Header() {
    const { user, logout } = useAuth()

    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
            <div />
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                        {user?.name}
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
                >
                    <LogOut className="w-4 h-4" />
                    Sair
                </button>
            </div>
        </header>
    )
}