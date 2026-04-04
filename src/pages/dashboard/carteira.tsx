import { useEffect, useState } from 'react'
import type { GetServerSidePropsContext } from 'next'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import SEO from '../../components/SEO'
import WalletCard from '../../components/Dashboard/WalletCard'
import { getSession, type SessionUser } from '../../lib/session'
import { ArrowDownCircle, ArrowUpCircle, Clock, FileText } from 'lucide-react'

const TRANSACTION_LABELS = {
  CREDIT_DP: 'Crédito de DP',
  CREDIT_VP: 'Crédito de VP',
  DEBIT_DP: 'Débito de DP',
  DEBIT_VP: 'Débito de VP',
  BID_PLACED: 'Lance em Leilão',
  BID_REFUND: 'Reembolso de Lance',
  AUCTION_WIN: 'Leilão Ganho',
  MARKETPLACE_PURCHASE: 'Compra no Marketplace',
  MARKETPLACE_SALE: 'Venda no Marketplace',
  MARKETPLACE_FEE: 'Taxa do Marketplace',
  ADMIN_ADJUSTMENT: 'Ajuste Manual'
} as const

export default function CarteiraPage({ user }: { user: SessionUser }) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 20

  useEffect(() => {
    fetchTransactions()
  }, [page])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/wallet-transactions?page=${page}&perPage=${perPage}`
      )
      const result = await response.json()

      if (result.success) {
        setTransactions(result.data.transactions)
        setTotal(result.data.total)
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    if (
      type.includes('CREDIT') ||
      type.includes('SALE') ||
      type.includes('REFUND')
    ) {
      return <ArrowUpCircle className="h-5 w-5 text-success" />
    }
    return <ArrowDownCircle className="h-5 w-5 text-error" />
  }

  const getTransactionLabel = (type: string) => {
    if (type in TRANSACTION_LABELS) {
      return TRANSACTION_LABELS[type as keyof typeof TRANSACTION_LABELS]
    }
    return type
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <DashboardLayout>
      <SEO title="Carteira" path="/dashboard/carteira" noindex />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-primary">Carteira</h1>
          <p className="text-base-content/70 mt-2">
            Gerencie seus Donation Points e Vote Points
          </p>
        </div>

        {/* Saldo Cards */}
        <WalletCard />

        {/* Histórico de Transações */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Histórico de Transações</h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-16 w-full"></div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
                <p className="text-lg text-base-content/70">
                  Nenhuma transação ainda
                </p>
                <p className="text-sm text-base-content/50 mt-2">
                  Suas transações aparecerão aqui quando você realizar compras
                  ou receber créditos
                </p>
              </div>
            ) : (
              <>
                {/* Tabela de Transações */}
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Saldo Anterior</th>
                        <th>Novo Saldo</th>
                        <th>Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx.id}>
                          <td className="whitespace-nowrap">
                            {formatDate(tx.created_at)}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(tx.type)}
                              <span>{getTransactionLabel(tx.type)}</span>
                            </div>
                          </td>
                          <td>
                            <span
                              className={
                                tx.amount > 0
                                  ? 'text-success font-bold'
                                  : 'text-error font-bold'
                              }
                            >
                              {tx.amount > 0 ? '+' : ''}
                              {tx.amount.toLocaleString()} {tx.currency}
                            </span>
                          </td>
                          <td>
                            {tx.balance_before.toLocaleString()} {tx.currency}
                          </td>
                          <td className="font-bold">
                            {tx.balance_after.toLocaleString()} {tx.currency}
                          </td>
                          <td className="max-w-xs truncate text-sm text-base-content/70">
                            {tx.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="join">
                      <button
                        className="join-item btn btn-sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        «
                      </button>
                      <button className="join-item btn btn-sm">
                        Página {page} de {totalPages}
                      </button>
                      <button
                        className="join-item btn btn-sm"
                        onClick={() =>
                          setPage(p => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                      >
                        »
                      </button>
                    </div>
                  </div>
                )}

                {/* Total de Registros */}
                <div className="text-center text-sm text-base-content/60 mt-4">
                  {total} {total === 1 ? 'transação' : 'transações'} no total
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context.req, context.res)

  if (!session.user) {
    return {
      redirect: {
        destination: '/cadastro',
        permanent: false
      }
    }
  }

  return {
    props: {
      user: session.user
    }
  }
}
