import { useEffect, useState } from 'react'
import type { GetServerSidePropsContext } from 'next'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import SEO from '../../components/SEO'
import WalletCard from '../../components/Dashboard/WalletCard'
import CreateListingModal from '../../components/Dashboard/CreateListingModal'
import { getSession, type SessionUser } from '../../lib/session'
import { buildIdempotencyKey } from '../../lib/idempotency'
import {
  Store,
  Filter,
  ShoppingCart,
  AlertCircle,
  Package,
  Clock,
  Plus
} from 'lucide-react'

type MarketplaceListing = {
  id: number
  item_entry: number
  item_name?: string
  category: string
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  character_name: string
  price: number
  created_at: string
}

type MarketplaceFilter = {
  category: string
  search: string
}

const RARITY_COLORS = {
  COMMON: 'text-gray-400',
  UNCOMMON: 'text-green-400',
  RARE: 'text-blue-400',
  EPIC: 'text-purple-400',
  LEGENDARY: 'text-orange-400'
} as const

const RARITY_BG = {
  COMMON: 'bg-gray-500/20 border-gray-500/30',
  UNCOMMON: 'bg-green-500/20 border-green-500/30',
  RARE: 'bg-blue-500/20 border-blue-500/30',
  EPIC: 'bg-purple-500/20 border-purple-500/30',
  LEGENDARY: 'bg-orange-500/20 border-orange-500/30'
} as const

export default function MercadoPage({ user }: { user: SessionUser }) {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<MarketplaceFilter>({
    category: '',
    search: ''
  })
  const [purchaseModal, setPurchaseModal] = useState<MarketplaceListing | null>(
    null
  )
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  useEffect(() => {
    fetchListings()
  }, [filter])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter.category) params.append('category', filter.category)
      if (filter.search) params.append('search', filter.search)

      const response = await fetch(`/api/marketplace-list?${params}`)
      const result = await response.json()

      if (result.success) {
        setListings(result.data.listings)
      }
    } catch (err) {
      console.error('Error fetching marketplace:', err)
    } finally {
      setLoading(false)
    }
  }

  const openPurchaseModal = (listing: MarketplaceListing) => {
    setPurchaseModal(listing)
    setError(null)
  }

  const purchaseItem = async () => {
    if (!purchaseModal) return

    try {
      setPurchasing(true)
      setError(null)

      const idempotencyKey = buildIdempotencyKey(
        'marketplace-buy',
        purchaseModal.id
      )

      const response = await fetch('/api/marketplace-buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({ listing_id: purchaseModal.id })
      })

      const result = await response.json()

      if (result.success) {
        alert(
          'Compra realizada com sucesso! O item será entregue pela staff em breve.'
        )
        setPurchaseModal(null)
        fetchListings()
      } else {
        setError(result.error || 'Erro ao comprar item')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
      console.error('Error purchasing:', err)
    } finally {
      setPurchasing(false)
    }
  }

  const getRarityColor = (rarity: MarketplaceListing['rarity']) => {
    return RARITY_COLORS[rarity] || 'text-gray-400'
  }

  const getRarityBg = (rarity: MarketplaceListing['rarity']) => {
    return RARITY_BG[rarity] || 'bg-gray-500/20'
  }

  const calculateFee = (price: number) => {
    return Math.floor(price * 0.05)
  }

  return (
    <DashboardLayout>
      <SEO title="Marketplace" path="/dashboard/mercado" noindex />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary">Marketplace</h1>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Vender Item
            </button>
          </div>
          <p className="text-base-content/70">
            Compre e venda itens entre jogadores. Taxa de marketplace: 5%
          </p>
        </div>

        {/* Wallet */}
        <WalletCard />

        {/* Filtros */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5" />
              <h3 className="text-lg font-bold">Filtros</h3>
            </div>

            <div className="grid grid-cols-1 items-end md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Buscar Item</span>
                </label>
                <input
                  type="text"
                  placeholder="Nome do item..."
                  className="input input-bordered"
                  value={filter.search}
                  onChange={e =>
                    setFilter({ ...filter, search: e.target.value })
                  }
                />
              </div>

              {/* Category */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Categoria</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filter.category}
                  onChange={e =>
                    setFilter({ ...filter, category: e.target.value })
                  }
                >
                  <option value="">Todas</option>
                  <option value="MOUNT">Montarias</option>
                  <option value="PET">Pets</option>
                  <option value="TRANSMOG">Transmog</option>
                  <option value="CONSUMABLE">Consumíveis</option>
                  <option value="BAG">Bolsas</option>
                  <option value="OTHER">Outros</option>
                </select>
              </div>

              {/* Clear */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">&nbsp;</span>
                </label>
                <button
                  className="btn btn-outline"
                  onClick={() => setFilter({ category: '', search: '' })}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="text-2xl font-bold mb-4">Itens Disponíveis</h2>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton h-64"></div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
                <p className="text-lg text-base-content/70">
                  Nenhum item disponível
                </p>
                <p className="text-sm text-base-content/50 mt-2">
                  Volte mais tarde ou ajuste os filtros
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map(listing => (
                  <div
                    key={listing.id}
                    className={`card border-2 ${getRarityBg(listing.rarity)} shadow-lg hover:shadow-xl transition-all`}
                  >
                    <div className="card-body">
                      {/* Item Name */}
                      <h3
                        className={`text-lg font-bold ${getRarityColor(listing.rarity)}`}
                      >
                        {listing.item_name || `Item #${listing.item_entry}`}
                      </h3>

                      {/* Badges */}
                      <div className="flex gap-2 mb-2">
                        <span className="badge badge-sm">
                          {listing.category}
                        </span>
                        <span
                          className={`badge badge-sm ${getRarityColor(listing.rarity)}`}
                        >
                          {listing.rarity}
                        </span>
                      </div>

                      {/* Seller */}
                      <div className="text-sm text-base-content/70 mb-2">
                        Vendedor:{' '}
                        <span className="font-semibold">
                          {listing.character_name}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="divider my-2"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-base-content/70">
                          Preço:
                        </span>
                        <span className="text-xl font-bold text-primary">
                          {listing.price.toLocaleString()} DP
                        </span>
                      </div>

                      {/* Created At */}
                      <div className="flex items-center gap-2 text-xs text-base-content/60 mt-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {new Date(listing.created_at).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </div>

                      {/* Buy Button */}
                      <div className="card-actions mt-4">
                        <button
                          className="btn btn-primary btn-block"
                          onClick={() => openPurchaseModal(listing)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Comprar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Compra */}
      {purchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-base-100 w-full max-w-md shadow-2xl">
            <div className="card-body">
              <h3 className="text-2xl font-bold mb-4">Confirmar Compra</h3>

              {/* Item Info */}
              <div
                className={`p-4 rounded-lg ${getRarityBg(purchaseModal.rarity)} mb-4`}
              >
                <h4
                  className={`text-lg font-bold ${getRarityColor(purchaseModal.rarity)}`}
                >
                  {purchaseModal.item_name ||
                    `Item #${purchaseModal.item_entry}`}
                </h4>
                <p className="text-sm text-base-content/70 mt-1">
                  Vendedor: {purchaseModal.character_name}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Preço:</span>
                  <span className="font-bold">
                    {purchaseModal.price.toLocaleString()} DP
                  </span>
                </div>
                <div className="text-xs text-base-content/60">
                  O vendedor receberá{' '}
                  {(
                    purchaseModal.price - calculateFee(purchaseModal.price)
                  ).toLocaleString()}{' '}
                  DP (taxa de 5%:{' '}
                  {calculateFee(purchaseModal.price).toLocaleString()} DP)
                </div>
              </div>

              <div className="alert alert-info">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">
                  O item será entregue pela staff. Aguarde até 24h.
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-error mt-4">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="card-actions justify-end mt-6">
                <button
                  className="btn btn-ghost"
                  onClick={() => setPurchaseModal(null)}
                  disabled={purchasing}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={purchaseItem}
                  disabled={purchasing}
                >
                  {purchasing ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Processando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      Confirmar Compra
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criar Venda */}
      <CreateListingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          fetchListings()
          setCreateModalOpen(false)
        }}
      />
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
