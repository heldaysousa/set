import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Users,
  Calendar,
  DollarSign,
  Scissors,
  TrendingUp,
  Clock,
  BarChart2,
  PieChart
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMockDataStore } from '@/stores/mockDataStore'

export function DashboardPage() {
  const { dashboardData } = useMockDataStore()

  const stats = [
    {
      title: 'Clientes',
      value: dashboardData.clients.total.toString(),
      icon: Users,
      change: `+${dashboardData.clients.new} novos`,
      trend: 'up'
    },
    {
      title: 'Agendamentos',
      value: dashboardData.appointments.month.toString(),
      icon: Calendar,
      change: `${dashboardData.appointments.pending} pendentes`,
      trend: 'up'
    },
    {
      title: 'Faturamento',
      value: `R$ ${dashboardData.revenue.month.toFixed(2)}`,
      icon: DollarSign,
      change: `+${((dashboardData.revenue.month - dashboardData.revenue.month * 0.9) / (dashboardData.revenue.month * 0.9) * 100).toFixed(1)}%`,
      trend: 'up'
    },
    {
      title: 'Serviços',
      value: dashboardData.services.total.toString(),
      icon: Scissors,
      change: `${dashboardData.services.mostPopular[0].name} é o mais popular`,
      trend: 'neutral'
    }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Download
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {stat.title}
                </CardTitle>
                <div className="rounded-md bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={cn(
                  "flex items-center text-xs",
                  stat.trend === "up" ? "text-emerald-500" : "text-muted-foreground"
                )}>
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                  data={dashboardData.chartData.revenue.labels.map((label, index) => ({
                    name: label,
                    value: dashboardData.chartData.revenue.data[index]
                  }))}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `R$${value}`}
                  />
                <Tooltip
                    formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Valor"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 6,
                      style: { fill: "hsl(var(--primary))" },
                    }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Serviços Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                    data={dashboardData.services.mostPopular}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="count"
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {dashboardData.services.mostPopular.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                  ))}
                </Pie>
                <Tooltip
                    formatter={(value) => [`${value} agendamentos`, "Total"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
        <div className="space-y-4">
              {dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.client}</p>
                    <p className="text-sm text-muted-foreground">{transaction.service}</p>
                </div>
                <div className="text-right">
                    <p className="font-medium">R$ {transaction.value.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  </div>
                </div>
              ))}
              </div>
          </CardContent>
        </Card>
        </div>
    </div>
  )
}
