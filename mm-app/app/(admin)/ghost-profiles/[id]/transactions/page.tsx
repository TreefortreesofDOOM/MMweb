import { createActionClient } from '@/lib/supabase/supabase-action'
import { notFound } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDateTime } from '@/lib/utils/format-utils'

interface Props {
  params: {
    id: string
  }
}

export const dynamic = 'force-dynamic'

export default async function GhostProfileTransactionsPage({ params }: Props) {
  const supabase = await createActionClient()

  // Fetch ghost profile
  const { data: profile } = await supabase
    .from('ghost_profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!profile) {
    notFound()
  }

  // Fetch transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('ghost_profile_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ghost Profile Transactions</h1>
        <p className="text-muted-foreground">
          Viewing transactions for {profile.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-3">
          <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
          <div className="text-2xl font-bold">{formatCurrency(profile.total_spent || 0)}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm font-medium text-muted-foreground">Total Purchases</div>
          <div className="text-2xl font-bold">{profile.total_purchases}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-sm font-medium text-muted-foreground">Status</div>
          <div className="text-2xl font-bold">{profile.is_claimed ? 'Claimed' : 'Unclaimed'}</div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Payment ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Card</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions?.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{tx.created_at ? formatDateTime(tx.created_at) : 'N/A'}</TableCell>
              <TableCell className="font-mono text-sm">{tx.stripe_payment_intent_id}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  tx.status === 'succeeded'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {tx.status}
                </span>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(tx.amount_total)}</TableCell>
              <TableCell>
                {tx.card_brand && tx.card_last4
                  ? `${tx.card_brand.toUpperCase()} •••• ${tx.card_last4}`
                  : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 