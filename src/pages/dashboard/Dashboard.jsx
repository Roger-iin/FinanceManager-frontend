import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react"
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import { dashboardService } from "../../services/dashboardService"
import { formatCurrency, firstDayOfMonth, lastDayOfMonth } from "../../utils/formatters"
import Card from "../../components/ui/Card"

const CHART_COLORS = [
    "#6366f1", "#f59e0b", "#10b981", "#ef4444",
    "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
]

export default function Dashboard() {
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [startDate, setStartDate] = useState(firstDayOfMonth())
    const [endDate, setEndDate] = useState(lastDayOfMonth())

    useEffect(() => {
        fetchSummary()
    }, [startDate, endDate])

    const fetchSummary = async () => {
        try {
            setLoading(true)
            setError("")
            const res = await dashboardService.getSummary({ startDate, endDate })
            setSummary(res.data)
        } catch (err) {
            setError("Erro ao carregar dados do dashboard.")
        } finally {
            setLoading(false)
        }
    }

    const chartData = summary?.expenseByCategory?.map((cat) => ({
        name: cat.categoryName,
        value: parseFloat(cat.total),
    })) ?? []

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
    )

    if (error) return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>
    )

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-gray-400 text-sm">ate</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Receitas"
                    value={summary?.totalIncome ?? 0}
                    icon={TrendingUp}
                    color="green"
                />
                <SummaryCard
                    title="Despesas"
                    value={summary?.totalExpense ?? 0}
                    icon={TrendingDown}
                    color="red"
                />
                <SummaryCard
                    title="Saldo"
                    value={summary?.balance ?? 0}
                    icon={Wallet}
                    color={(summary?.balance ?? 0) >= 0 ? "green" : "red"}
                />
                <SummaryCard
                    title="Categorias"
                    value={summary?.expenseByCategory?.length ?? 0}
                    icon={PiggyBank}
                    color="purple"
                    isCurrency={false}
                />
            </div>

            {chartData.length > 0 ? (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        Despesas por Categoria
                    </h2>
                    <div className="flex flex-col lg:flex-row gap-6 items-center">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {chartData.map((_, index) => (
                                        <Cell
                                            key={index}
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-full lg:w-72 flex flex-col gap-2">
                            {summary.expenseByCategory.map((cat, index) => (
                                <div key={cat.categoryId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                        />
                                        <span className="text-sm text-gray-700">{cat.categoryName}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-medium text-gray-900">
                                            {formatCurrency(cat.total)}
                                        </span>
                                        <span className="text-xs text-gray-400">{cat.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            ) : (
                <Card className="p-12 flex flex-col items-center gap-3 text-center">
                    <PiggyBank className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500">Nenhuma despesa registrada neste periodo.</p>
                </Card>
            )}
        </div>
    )
}

function SummaryCard({ title, value, icon: Icon, color, isCurrency = true }) {
    const colors = {
        green: { bg: "bg-green-50", icon: "bg-green-100", text: "text-green-600" },
        red: { bg: "bg-red-50", icon: "bg-red-100", text: "text-red-600" },
        purple: { bg: "bg-purple-50", icon: "bg-purple-100", text: "text-purple-600" },
        blue: { bg: "bg-blue-50", icon: "bg-blue-100", text: "text-blue-600" },
    }

    const c = colors[color] ?? colors.blue

    return (
        <Card className={"p-5 " + c.bg}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {isCurrency ? formatCurrency(value) : value}
                    </p>
                </div>
                <div className={"p-2 rounded-lg " + c.icon}>
                    <Icon className={"w-5 h-5 " + c.text} />
                </div>
            </div>
        </Card>
    )
}