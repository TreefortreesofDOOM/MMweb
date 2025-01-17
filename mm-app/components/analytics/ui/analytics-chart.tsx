import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { format } from 'date-fns'
import { formatPrice } from '@/lib/utils/core/common-utils'

interface ChartDataPoint {
  date: string
  amount: number
}

interface AnalyticsChartProps {
  title: string
  data: ChartDataPoint[]
}

export function AnalyticsChart({ title, data }: AnalyticsChartProps) {
  if (!data.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM d')}
              />
              <YAxis
                tickFormatter={(value) => formatPrice(value)}
              />
              <Tooltip
                formatter={(value: number) => formatPrice(value)}
                labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 