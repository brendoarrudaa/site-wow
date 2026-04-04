import { useEffect, useState } from 'react'
import type { GetServerSidePropsContext } from 'next'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import SEO from '../../components/SEO'
import { getSession } from '../../lib/session'
import { getPool } from '../../lib/db'
import { buildIdempotencyKey } from '../../lib/idempotency'
import {
  CheckCircle,
  XCircle,
  Package,
  AlertCircle,
  Clock,
  User,
  X,
  Loader2,
} from 'lucide-react'

type DashboardUser = {
  id: number
  username: string
  email: string
}

type MarketplaceListing = {
  id: number
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  category: string
  item_name?: string
  item_entry: number
  character_name: string
  item_count: number
  created_at: string
  price: number
}

const RARITY_COLOR: Record<string, string> = {
  COMMON: 'text-gray-400',
  UNCOMMON: 'text-green-400',
  RARE: 'text-blue-400',
  EPIC: 'text-purple-400',
  LEGENDARY: 'text-orange-400',
}

const RARITY_BG: Record<string, string> = {
  COMMON: 'bg-gray-500/20 border-gray-500/30',
  UNCOMMON: 'bg-green-500/20 border-green-500/30',
  RARE: 'bg-blue-500/20 border-blue-500/30',
  EPIC: 'bg-purple-500/20 border-purple-500/30',
  LEGENDARY: 'bg-orange-500/20 border-orange-500/30',
}

export default function AprovacoesPage({ user }: { user: DashboardUser }) {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<MarketplaceListing | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchPendingListings()
  }, [])

  const fetchPendingListings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/marketplace-list?status=PENDING_APPROVAL')
      const result = await response.json()
      if (result.success) setListings(result.data.listings || [])
    } catch (err) {
      console.error('Error fetching listings:', err)
    } finally {
      setLoading(false)
    }
  }

  const approveListing = async (listingId: number) => {
    try {
      setProcessing(listingId)
      setError(null)
      const response = await fetch('/api/marketplace-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': buildIdempotencyKey('marketplace-approve', listingId),
        },
        body: JSON.stringify({ listing_id: listingId }),
      })
      const result = await response.json()
      if (result.success) {
        fetchPendingListings()
      } else {
        setError(result.error || 'Erro ao aprovar listing')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setProcessing(null)
    }
  }

  const confirmReject = async () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) {
      setError('Informe o motivo da rejeição.')
      return
    }
    try {
      setProcessing(rejectTarget.id)
      setError(null)
      const response = await fetch('/api/marketplace-reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': buildIdempotencyKey('marketplace-reject', rejectTarget.id),
        },
        body: JSON.stringify({ listing_id: rejectTarget.id, reason: rejectReason }),
      })
      const result = await response.json()
      if (result.success) {
        setRejectTarget(null)
        setRejectReason('')
        fetchPendingListings()
      } else {
        setError(result.error || 'Erro ao rejeitar listing')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <DashboardLayout>
      <SEO title="Aprovações" path="/dashboard/admin-aprovacoes" noindex />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <CheckCircle className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold font-serif glow-text">
              Aprovações de Marketplace
            </h1>
          </div>
          <p className="text-sm text-base-content/60">
            Revise e aprove/rejeite listagens de itens pendentes
          </p>
        </div>

        {/* Stats */}
        <div className="card-fantasy flex items-center gap-4 p-4 w-fit">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
            <Clock className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-base-content/60">Pendentes</p>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-base-content/20" />
            ) : (
              <p className="text-2xl font-bold text-warning">{listings.length}</p>
            )}
          </div>
        </div>

        {/* Listings */}
        <div className="card-fantasy overflow-hidden">
          <div className="border-b border-base-300 p-4">
            <h2 className="font-bold">Fila de Aprovação</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-base-content/30">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Carregando…
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                <p className="text-base-content/60">Nenhuma aprovação pendente</p>
                <p className="text-sm text-base-content/40 mt-1">
                  Todas as listagens foram processadas
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map(listing => (
                  <div
                    key={listing.id}
                    className={`card border-2 ${RARITY_BG[listing.rarity] ?? 'bg-base-300 border-base-300'} shadow-md`}
                  >
                    <div className="card-body">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-lg font-bold ${RARITY_COLOR[listing.rarity] ?? ''}`}>
                            {listing.item_name || `Item #${listing.item_entry}`}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1 mb-3">
                            <span className="badge badge-sm">{listing.category}</span>
                            <span className={`badge badge-sm badge-outline ${RARITY_COLOR[listing.rarity] ?? ''}`}>
                              {listing.rarity}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-base-content/70">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 shrink-0" />
                              Vendedor:{' '}
                              <span className="font-semibold">{listing.character_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 shrink-0" />
                              Quantidade: {listing.item_count}x
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 shrink-0" />
                              {new Date(listing.created_at).toLocaleString('pt-BR')}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="mb-3">
                            <p className="text-xs text-base-content/50 mb-0.5">Preço</p>
                            <p className="text-xl font-bold text-primary">
                              {listing.price.toLocaleString()} DP
                            </p>
                            <p className="text-xs text-base-content/40">
                              Vendedor recebe:{' '}
                              {Math.floor(listing.price * 0.95).toLocaleString()} DP
                            </p>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              className="btn btn-sm btn-success gap-1"
                              onClick={() => approveListing(listing.id)}
                              disabled={processing === listing.id}
                            >
                              {processing === listing.id ? (
                                <span className="loading loading-spinner loading-xs" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              Aprovar
                            </button>
                            <button
                              className="btn btn-sm btn-error gap-1"
                              onClick={() => {
                                setRejectTarget(listing)
                                setRejectReason('')
                                setError(null)
                              }}
                              disabled={processing === listing.id}
                            >
                              <XCircle className="h-4 w-4" />
                              Rejeitar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-error/50 bg-error/10 p-3 text-sm text-error mt-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal: Rejeitar ─────────────────────────────────────────────── */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setRejectTarget(null)} />
          <div className="relative z-50 w-full max-w-md rounded-lg border border-base-300 bg-base-100 p-6 shadow-2xl">
            <button
              className="btn btn-ghost btn-xs btn-square absolute right-3 top-3"
              onClick={() => setRejectTarget(null)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold mb-4">Rejeitar Listing</h3>

            <div
              className={`p-4 rounded-lg border ${RARITY_BG[rejectTarget.rarity] ?? 'bg-base-200'} mb-4`}
            >
              <h4 className={`font-bold ${RARITY_COLOR[rejectTarget.rarity] ?? ''}`}>
                {rejectTarget.item_name || `Item #${rejectTarget.item_entry}`}
              </h4>
              <p className="text-sm text-base-content/60 mt-1">
                Vendedor: {rejectTarget.character_name} —{' '}
                {rejectTarget.price.toLocaleString()} DP
              </p>
            </div>

            <div className="space-y-1 mb-4">
              <label className="text-xs font-medium text-base-content/60">
                Motivo da Rejeição
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24 text-sm"
                placeholder="Ex: Item não está na whitelist, preço abusivo…"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setRejectTarget(null)}>
                Cancelar
              </button>
              <button
                className="btn btn-error btn-sm gap-1"
                onClick={confirmReject}
                disabled={processing === rejectTarget.id || !rejectReason.trim()}
              >
                {processing === rejectTarget.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context.req, context.res)

  if (!session.user) {
    return { redirect: { destination: '/cadastro', permanent: false } }
  }

  const pool = getPool()
  let access: any[] = []

  try {
    ;[access] = (await pool.query(
      'SELECT 1 FROM acore_auth.account_access WHERE account_id = ? AND gmlevel >= 2 LIMIT 1',
      [session.user.id]
    )) as any
  } catch {
    ;[access] = (await pool.query(
      'SELECT 1 FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 2 LIMIT 1',
      [session.user.id]
    )) as any
  }

  if (!access.length) {
    return { redirect: { destination: '/dashboard', permanent: false } }
  }

  return { props: { user: session.user } }
}
