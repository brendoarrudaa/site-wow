import { useEffect, useState } from 'react'
import type { GetServerSidePropsContext } from 'next'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import SEO from '../../components/SEO'
import { getSession, type SessionUser } from '../../lib/session'
import { getPool } from '../../lib/db'
import { buildIdempotencyKey } from '../../lib/idempotency'
import {
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Truck,
  User,
  XCircle
} from 'lucide-react'

const TYPE_LABELS = {
  AUCTION_WON: 'Leilão Vencido',
  MARKETPLACE_BUY: 'Compra Marketplace',
  MARKETPLACE_SELL_REMOVE: 'Remover Item Vendido'
} as const

const TYPE_COLORS = {
  AUCTION_WON: 'badge-primary',
  MARKETPLACE_BUY: 'badge-success',
  MARKETPLACE_SELL_REMOVE: 'badge-warning'
} as const

const STATUS_COLORS = {
  PENDING: 'badge-warning',
  IN_PROGRESS: 'badge-info',
  DELIVERED: 'badge-success',
  FAILED: 'badge-error'
} as const

export default function EntregasPage({ user }: { user: SessionUser }) {
  const [queue, setQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [processing, setProcessing] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFulfillmentQueue()
  }, [filter])

  const fetchFulfillmentQueue = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin-fulfillment?status=${filter}`)
      const result = await response.json()

      if (result.success) {
        setQueue(result.data.queue || [])
      }
    } catch (err) {
      console.error('Error fetching queue:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsDelivered = async (id: number, notes: string) => {
    try {
      setProcessing(id)
      setError(null)

      const response = await fetch('/api/admin-fulfillment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': buildIdempotencyKey('admin-fulfillment', id)
        },
        body: JSON.stringify({
          fulfillment_id: id,
          delivery_method: 'MANUAL_GM',
          delivery_notes: notes || null
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('Marcado como entregue!')
        fetchFulfillmentQueue()
      } else {
        setError(result.error || 'Erro ao marcar entrega')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
      console.error('Error marking delivered:', err)
    } finally {
      setProcessing(null)
    }
  }

  const getTypeLabel = (type: keyof typeof TYPE_LABELS) => {
    return TYPE_LABELS[type] || type
  }

  const getTypeColor = (type: keyof typeof TYPE_COLORS) => {
    return TYPE_COLORS[type] || 'badge-neutral'
  }

  const getStatusColor = (status: keyof typeof STATUS_COLORS) => {
    return STATUS_COLORS[status] || 'badge-neutral'
  }

  const stats = {
    pending: queue.filter(q => q.status === 'PENDING').length,
    in_progress: queue.filter(q => q.status === 'IN_PROGRESS').length,
    delivered: queue.filter(q => q.status === 'DELIVERED').length
  }

  return (
    <DashboardLayout>
      <SEO title="Entregas" path="/dashboard/admin-entregas" noindex />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Truck className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">
              Fila de Entregas
            </h1>
          </div>
          <p className="text-base-content/70">
            Gerencie a entrega de itens de leilões e marketplace
          </p>
        </div>

        {/* Stats */}
        <div className="stats shadow w-full bg-base-200">
          <div className="stat">
            <div className="stat-figure text-warning">
              <Clock className="h-8 w-8" />
            </div>
            <div className="stat-title">Pendentes</div>
            <div className="stat-value text-warning">{stats.pending}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-info">
              <Package className="h-8 w-8" />
            </div>
            <div className="stat-title">Em Progresso</div>
            <div className="stat-value text-info">{stats.in_progress}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-success">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="stat-title">Entregues</div>
            <div className="stat-value text-success">{stats.delivered}</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex gap-2">
              <button
                className={`btn ${filter === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('PENDING')}
              >
                <Clock className="h-4 w-4" />
                Pendentes
              </button>
              <button
                className={`btn ${filter === 'IN_PROGRESS' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('IN_PROGRESS')}
              >
                <Package className="h-4 w-4" />
                Em Progresso
              </button>
              <button
                className={`btn ${filter === 'DELIVERED' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('DELIVERED')}
              >
                <CheckCircle className="h-4 w-4" />
                Entregues
              </button>
              <button
                className={`btn ${filter === '' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter('')}
              >
                Todos
              </button>
            </div>
          </div>
        </div>

        {/* Queue */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="text-2xl font-bold mb-4">Itens para Entregar</h2>

            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-24"></div>
                ))}
              </div>
            ) : queue.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
                <p className="text-lg text-base-content/70">
                  Nenhum item na fila
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Item</th>
                      <th>Quantidade</th>
                      <th>Destinatário</th>
                      <th>Status</th>
                      <th>Criado</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map(item => (
                      <tr key={item.id}>
                        <td className="font-mono text-xs">#{item.id}</td>
                        <td>
                          <span className={`badge ${getTypeColor(item.type)}`}>
                            {getTypeLabel(item.type)}
                          </span>
                        </td>
                        <td className="font-semibold">
                          {item.item_name || `Item #${item.item_entry}`}
                        </td>
                        <td>{item.item_count}x</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-base-content/60" />
                            <span>
                              {item.character_name ||
                                `Char #${item.character_guid}`}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge p-2 ${getStatusColor(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="text-sm text-base-content/70">
                          {new Date(item.created_at).toLocaleDateString(
                            'pt-BR'
                          )}
                        </td>
                        <td>
                          {item.status !== 'DELIVERED' && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => {
                                const notes = prompt(
                                  'Notas da entrega (opcional):',
                                  ''
                                )
                                if (notes !== null) {
                                  markAsDelivered(item.id, notes)
                                }
                              }}
                              disabled={processing === item.id}
                            >
                              {processing === item.id ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  Marcar Entregue
                                </>
                              )}
                            </button>
                          )}
                          {item.status === 'DELIVERED' && (
                            <span className="text-sm text-success">
                              ✓ Entregue
                              {item.delivered_at &&
                                ` em ${new Date(item.delivered_at).toLocaleDateString('pt-BR')}`}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {error && (
              <div className="alert alert-error mt-4">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Instruções */}
        <div className="alert alert-info">
          <AlertCircle className="h-5 w-5" />
          <div className="text-sm">
            <strong>Como entregar itens:</strong>
            <ol className="list-decimal ml-5 mt-2">
              <li>Entre no jogo com GM</li>
              <li>
                Use o comando:{' '}
                <code className="bg-base-300 px-1 rounded">
                  .send items {`{character_name}`} {`{item_entry}`} {`{count}`}
                </code>
              </li>
              <li>Volte aqui e marque como "Entregue"</li>
            </ol>
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

  const pool = getPool()
  let access: any[] = []

  try {
    ;[access] = (await pool.query(
      'SELECT 1 FROM acore_auth.account_access WHERE account_id = ? AND gmlevel >= 1 LIMIT 1',
      [session.user.id]
    )) as any
  } catch {
    ;[access] = (await pool.query(
      'SELECT 1 FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 1 LIMIT 1',
      [session.user.id]
    )) as any
  }

  if (!access.length) {
    return {
      redirect: {
        destination: '/dashboard',
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
