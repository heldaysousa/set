import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'

interface ServicesDistributionChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
}

export function ServicesDistributionChart({ data }: ServicesDistributionChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#F9FAFB' }}
          itemStyle={{ color: '#F9FAFB' }}
          formatter={(value: number) => [
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(value),
            'Valor'
          ]}
        />
        <Legend
          verticalAlign="middle"
          align="right"
          layout="vertical"
          formatter={(value: string, entry: any) => {
            const item = data.find(d => d.name === value)
            const percentage = ((item?.value || 0) / total * 100).toFixed(1)
            return (
              <span style={{ color: '#F9FAFB', fontSize: '0.875rem' }}>
                {value} ({percentage}%)
              </span>
            )
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
