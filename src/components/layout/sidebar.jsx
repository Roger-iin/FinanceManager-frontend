import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    ArrowLeftRight,
    Wallet,
    Tag,
    RefreshCcw,
    TrendingUp,
} from 'lucide-react'

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transações' },
    { to: '/accounts', icon: Wallet, label: 'Contas' },
    { to: '/categories', icon: Tag, label: 'Categorias' },
    { to: '/subscriptions', icon: RefreshCcw, label: 'Assinaturas' },
]

export default function Sidebar() {
    return (
        <aside className="w-64 h-screen sticky top-0 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">FinanceApp</span>
                </div>
            </div>
            <nav className="flex-1 p-4 flex flex-col gap-1">
                {navItems.map((item) => (
                    <NavLinkItem key={item.to} {...item} />
                ))}
            </nav>
        </aside>
    )
}

function NavLinkItem({ to, icon: Icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
            }
        >
            <Icon className="w-5 h-5 shrink-0" />
            {label}
        </NavLink>
    )
}