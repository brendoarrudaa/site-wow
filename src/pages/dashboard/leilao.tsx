import { useEffect, useState, useCallback } from 'react'
import type { GetServerSidePropsContext } from 'next'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import SEO from '../../components/SEO'
import WalletCard from '../../components/Dashboard/WalletCard'
import { getSession, type SessionUser } from '../../lib/session'
import { getPool } from '../../lib/db'
import { buildIdempotencyKey } from '../../lib/idempotency'
import {
  Gavel,
  Clock,
  TrendingUp,
  AlertCircle,
  Coins,
  Plus,
  X,
  CheckCircle,
  Loader2,
  ShieldAlert,
  AlertTriangle,
  Ban,
  Trophy,
  Edit2,
  ChevronDown,
  ChevronRight,
  Users
} from 'lucide-react'

// ── types ─────────────────────────────────────────────────────────────────────

type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
type AuctionStatus = 'ACTIVE' | 'DRAFT' | 'SCHEDULED' | 'CLOSED' | 'CANCELLED'

type RecentBid = {
  bid_amount: number
  bidder_username?: string
  created_at: string
}

type Alert = {
  type: 'no_bids' | 'expired' | 'reserve_not_met'
  message: string
}

type Auction = {
  id: number
  item_entry: number
  item_name?: string
  category?: string
  rarity: Rarity
  current_bid: number
  current_bidder_id?: number
  starting_bid: number
  min_increment: number
  buyout_price?: number
  reserve_price?: number
  seconds_remaining: number
  total_bids: number
  participant_count: number
  status: AuctionStatus
  end_time: string
  start_time?: string
  winner_id?: number
  winner_username?: string
  description?: string
  recent_bids: RecentBid[]
  alerts: Alert[]
}

// ── constants ─────────────────────────────────────────────────────────────────

const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: 'text-gray-400',
  UNCOMMON: 'text-green-400',
  RARE: 'text-blue-400',
  EPIC: 'text-purple-400',
  LEGENDARY: 'text-orange-400'
}

const RARITY_BG: Record<Rarity, string> = {
  COMMON: 'bg-gray-500/20 border-gray-500/30',
  UNCOMMON: 'bg-green-500/20 border-green-500/30',
  RARE: 'bg-blue-500/20 border-blue-500/30',
  EPIC: 'bg-purple-500/20 border-purple-500/30',
  LEGENDARY: 'bg-orange-500/20 border-orange-500/30'
}

const STATUS_BADGE: Record<AuctionStatus, string> = {
  ACTIVE: 'badge-success',
  DRAFT: 'badge-ghost',
  SCHEDULED: 'badge-info',
  CLOSED: 'badge-neutral',
  CANCELLED: 'badge-error'
}

const STATUS_LABEL: Record<AuctionStatus, string> = {
  ACTIVE: 'Ativo',
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendado',
  CLOSED: 'Encerrado',
  CANCELLED: 'Cancelado'
}

const DURATION_OPTIONS = [
  { value: 2, label: '2 horas' },
  { value: 6, label: '6 horas' },
  { value: 12, label: '12 horas' },
  { value: 24, label: '1 dia' },
  { value: 48, label: '2 dias' },
  { value: 72, label: '3 dias' },
  { value: 168, label: '7 dias' }
]

// ── create form ───────────────────────────────────────────────────────────────

interface CreateForm {
  item_entry: string
  item_count: string
  starting_bid: string
  min_increment: string
  buyout_price: string
  reserve_price: string
  duration_hours: number
  description: string
  status: 'ACTIVE' | 'DRAFT' | 'SCHEDULED'
  start_time: string
}

const emptyCreateForm: CreateForm = {
  item_entry: '',
  item_count: '1',
  starting_bid: '',
  min_increment: '50',
  buyout_price: '',
  reserve_price: '',
  duration_hours: 24,
  description: '',
  status: 'ACTIVE',
  start_time: ''
}

// ── edit form ─────────────────────────────────────────────────────────────────

interface EditForm {
  starting_bid: string
  min_increment: string
  buyout_price: string
  reserve_price: string
  item_count: string
  description: string
  duration_hours: number // used only when publishing a DRAFT
}

// ── helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
  if (!seconds || seconds < 0) return 'Encerrado'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function toLocalDatetimeValue(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── AlertBadge ────────────────────────────────────────────────────────────────

function AlertBadge({ alert }: { alert: Alert }) {
  const colors: Record<Alert['type'], string> = {
    no_bids: 'badge-warning',
    expired: 'badge-error',
    reserve_not_met: 'badge-info'
  }
  return (
    <span className={`badge badge-xs p-2 gap-1 ${colors[alert.type]}`}>
      <AlertTriangle className="h-2.5 w-2.5" />
      {alert.message}
    </span>
  )
}

// ── BidsPanel ─────────────────────────────────────────────────────────────────

function BidsPanel({ bids, total }: { bids: RecentBid[]; total: number }) {
  const [open, setOpen] = useState(false)
  if (total === 0)
    return (
      <p className="text-xs text-base-content/40 italic">Sem lances ainda</p>
    )
  return (
    <div>
      <button
        className="flex items-center gap-1 text-xs text-primary hover:underline"
        onClick={() => setOpen(o => !o)}
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {total} lance{total !== 1 ? 's' : ''} — ver últimos
      </button>
      {open && (
        <ul className="mt-1 space-y-0.5">
          {bids.map((b, i) => (
            <li
              key={i}
              className="text-xs flex justify-between text-base-content/70"
            >
              <span>{b.bidder_username ?? '???'}</span>
              <span className="font-semibold text-primary">
                {b.bid_amount.toLocaleString()} DP
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── AdminAuctionCard ──────────────────────────────────────────────────────────

function AdminAuctionCard({
  auction,
  onClose,
  onCancel,
  onEdit,
  onPublish
}: {
  auction: Auction
  onClose: (a: Auction) => void
  onCancel: (a: Auction) => void
  onEdit: (a: Auction) => void
  onPublish: (a: Auction) => void
}) {
  const rarityColor = RARITY_COLORS[auction.rarity] ?? 'text-gray-400'
  const rarityBg =
    RARITY_BG[auction.rarity] ?? 'bg-gray-500/20 border-gray-500/30'

  return (
    <div className={`card border ${rarityBg} bg-base-100 shadow text-sm`}>
      <div className="card-body p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className={`font-bold truncate ${rarityColor}`}>
              {auction.item_name || `Item #${auction.item_entry}`}
            </h4>
            <div className="flex flex-wrap gap-1 mt-1">
              <span
                className={`badge badge-xs p-2 ${STATUS_BADGE[auction.status]}`}
              >
                {STATUS_LABEL[auction.status]}
              </span>
              {auction.category && (
                <span className="badge badge-xs p-2 badge-ghost">
                  {auction.category}
                </span>
              )}
              {auction.rarity && (
                <span
                  className={`badge badge-xs p-2 badge-outline ${rarityColor}`}
                >
                  {auction.rarity}
                </span>
              )}
            </div>
          </div>
          <span className="font-mono text-xs text-base-content/40 shrink-0">
            #{auction.id}
          </span>
        </div>

        {/* Alerts */}
        {auction.alerts.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {auction.alerts.map((a, i) => (
              <AlertBadge key={i} alert={a} />
            ))}
          </div>
        )}

        {/* Bids / participants */}
        <div className="flex items-center gap-3 text-xs text-base-content/60">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {auction.participant_count} participantes
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Lance atual:{' '}
            <strong className="text-base-content ml-0.5">
              {auction.current_bid > 0
                ? `${auction.current_bid.toLocaleString()} DP`
                : '—'}
            </strong>
          </span>
        </div>

        {/* Recent bids */}
        <BidsPanel bids={auction.recent_bids} total={auction.total_bids} />

        {/* Winner */}
        {auction.status === 'CLOSED' && auction.winner_username && (
          <div className="flex items-center gap-1.5 text-xs text-success">
            <Trophy className="h-3.5 w-3.5 shrink-0" />
            Vencedor: <strong>{auction.winner_username}</strong>
          </div>
        )}
        {auction.status === 'CLOSED' && !auction.winner_id && (
          <p className="text-xs text-base-content/40 italic">
            Encerrado sem vencedor
          </p>
        )}

        {/* Time */}
        {auction.status === 'ACTIVE' && (
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="h-3 w-3" />
            <span
              className={
                auction.seconds_remaining < 3600 ? 'text-error font-bold' : ''
              }
            >
              {formatTime(auction.seconds_remaining)} restantes
            </span>
          </div>
        )}
        {auction.status === 'SCHEDULED' && auction.start_time && (
          <div className="flex items-center gap-1.5 text-xs text-info">
            <Clock className="h-3 w-3" />
            Início: {new Date(auction.start_time).toLocaleString('pt-BR')}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-base-300">
          {auction.status === 'DRAFT' && (
            <>
              <button
                className="btn btn-xs btn-success gap-1"
                onClick={() => onPublish(auction)}
              >
                <CheckCircle className="h-3 w-3" /> Publicar
              </button>
              <button
                className="btn btn-xs btn-outline gap-1"
                onClick={() => onEdit(auction)}
              >
                <Edit2 className="h-3 w-3" /> Editar
              </button>
            </>
          )}
          {auction.status === 'SCHEDULED' && (
            <button
              className="btn btn-xs btn-outline gap-1"
              onClick={() => onEdit(auction)}
            >
              <Edit2 className="h-3 w-3" /> Editar
            </button>
          )}
          {auction.status === 'ACTIVE' && auction.total_bids === 0 && (
            <button
              className="btn btn-xs btn-outline gap-1"
              onClick={() => onEdit(auction)}
            >
              <Edit2 className="h-3 w-3" /> Editar
            </button>
          )}
          {['ACTIVE', 'SCHEDULED'].includes(auction.status) && (
            <button
              className="btn btn-xs btn-warning gap-1"
              onClick={() => onClose(auction)}
            >
              <Gavel className="h-3 w-3" /> Fechar
            </button>
          )}
          {!['CLOSED', 'CANCELLED'].includes(auction.status) && (
            <button
              className="btn btn-xs btn-error btn-outline gap-1"
              onClick={() => onCancel(auction)}
            >
              <Ban className="h-3 w-3" /> Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function LeilaoPage({
  user,
  isAdmin
}: {
  user: SessionUser
  isAdmin: boolean
}) {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [adminAuctions, setAdminAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminTab, setAdminTab] = useState<'ALL' | AuctionStatus>('ALL')

  // Bid state
  const [bidModal, setBidModal] = useState<Auction | null>(null)
  const [bidAmount, setBidAmount] = useState('')
  const [bidding, setBidding] = useState(false)
  const [bidError, setBidError] = useState<string | null>(null)

  // Create modal
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // Edit modal
  const [editTarget, setEditTarget] = useState<Auction | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    starting_bid: '',
    min_increment: '',
    buyout_price: '',
    reserve_price: '',
    item_count: '',
    description: '',
    duration_hours: 24
  })
  const [editError, setEditError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  // Publish confirm
  const [publishTarget, setPublishTarget] = useState<Auction | null>(null)
  const [publishHours, setPublishHours] = useState(24)
  const [publishing, setPublishing] = useState(false)

  // Close confirm
  const [closeTarget, setCloseTarget] = useState<Auction | null>(null)
  const [closing, setClosing] = useState(false)

  // Cancel confirm
  const [cancelTarget, setCancelTarget] = useState<Auction | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const [actionError, setActionError] = useState<string | null>(null)

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchAuctions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auction-list')
      const result = await res.json()
      if (result.success) setAuctions(result.data.auctions)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAdminAuctions = useCallback(async () => {
    if (!isAdmin) return
    setAdminLoading(true)
    try {
      const res = await fetch('/api/auction-list?admin=1&status=ALL')
      const result = await res.json()
      if (result.success) setAdminAuctions(result.data.auctions)
    } catch {
    } finally {
      setAdminLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    fetchAuctions()
    const t = setInterval(fetchAuctions, 30000)
    return () => clearInterval(t)
  }, [fetchAuctions])

  useEffect(() => {
    if (isAdmin) fetchAdminAuctions()
  }, [isAdmin, fetchAdminAuctions])

  // ── bid ────────────────────────────────────────────────────────────────────

  const openBidModal = (auction: Auction) => {
    const min =
      auction.current_bid > 0
        ? Math.ceil(auction.current_bid * 1.05)
        : auction.starting_bid
    setBidAmount(min.toString())
    setBidModal(auction)
    setBidError(null)
  }

  const placeBid = async () => {
    if (!bidModal) return
    setBidding(true)
    setBidError(null)
    try {
      const res = await fetch('/api/auction-bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': buildIdempotencyKey('auction-bid', bidModal.id)
        },
        body: JSON.stringify({
          auction_id: bidModal.id,
          bid_amount: parseInt(bidAmount)
        })
      })
      const result = await res.json()
      if (result.success) {
        setBidModal(null)
        fetchAuctions()
      } else setBidError(result.error || 'Erro ao dar lance')
    } catch {
      setBidError('Erro de conexão.')
    } finally {
      setBidding(false)
    }
  }

  // ── create ─────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    setCreateError(null)
    const itemEntry = parseInt(createForm.item_entry)
    const itemCount = parseInt(createForm.item_count) || 1
    const startingBid = parseInt(createForm.starting_bid)
    const minIncrement = parseInt(createForm.min_increment) || 50
    const buyout = createForm.buyout_price.trim()
      ? parseInt(createForm.buyout_price)
      : undefined
    const reserve = createForm.reserve_price.trim()
      ? parseInt(createForm.reserve_price)
      : undefined

    if (!itemEntry || !startingBid) {
      setCreateError('Item Entry e Lance Inicial são obrigatórios.')
      return
    }

    setCreating(true)
    try {
      const body: Record<string, unknown> = {
        item_entry: itemEntry,
        item_count: itemCount,
        starting_bid: startingBid,
        min_increment: minIncrement,
        buyout_price: buyout,
        reserve_price: reserve,
        duration_hours: createForm.duration_hours,
        description: createForm.description || undefined,
        status: createForm.status
      }
      if (createForm.status === 'SCHEDULED' && createForm.start_time) {
        body.start_time = new Date(createForm.start_time).toISOString()
      }

      const res = await fetch('/api/auction-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const result = await res.json()
      if (result.success) {
        setCreateSuccess(result.message ?? 'Leilão criado!')
        setCreateForm(emptyCreateForm)
        fetchAuctions()
        fetchAdminAuctions()
      } else {
        setCreateError(result.error || 'Erro ao criar leilão.')
      }
    } catch {
      setCreateError('Erro de conexão.')
    } finally {
      setCreating(false)
    }
  }

  // ── edit ───────────────────────────────────────────────────────────────────

  const openEdit = (auction: Auction) => {
    setEditTarget(auction)
    setEditForm({
      starting_bid: auction.starting_bid.toString(),
      min_increment: auction.min_increment?.toString() ?? '50',
      buyout_price: auction.buyout_price?.toString() ?? '',
      reserve_price: auction.reserve_price?.toString() ?? '',
      item_count: '1',
      description: auction.description ?? '',
      duration_hours: 24
    })
    setEditError(null)
  }

  const handleEdit = async () => {
    if (!editTarget) return
    setEditing(true)
    setEditError(null)
    try {
      const body: Record<string, unknown> = { auction_id: editTarget.id }
      if (editForm.starting_bid)
        body.starting_bid = parseInt(editForm.starting_bid)
      if (editForm.min_increment)
        body.min_increment = parseInt(editForm.min_increment)
      if (editForm.buyout_price !== undefined)
        body.buyout_price = editForm.buyout_price
          ? parseInt(editForm.buyout_price)
          : null
      if (editForm.reserve_price !== undefined)
        body.reserve_price = editForm.reserve_price
          ? parseInt(editForm.reserve_price)
          : null
      if (editForm.description !== undefined)
        body.description = editForm.description

      const res = await fetch('/api/auction-edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const result = await res.json()
      if (result.success) {
        setEditTarget(null)
        fetchAdminAuctions()
      } else setEditError(result.error || 'Erro ao editar.')
    } catch {
      setEditError('Erro de conexão.')
    } finally {
      setEditing(false)
    }
  }

  // ── publish ────────────────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (!publishTarget) return
    setPublishing(true)
    setActionError(null)
    try {
      const res = await fetch('/api/auction-edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auction_id: publishTarget.id,
          action: 'publish',
          duration_hours: publishHours
        })
      })
      const result = await res.json()
      if (result.success) {
        setPublishTarget(null)
        fetchAuctions()
        fetchAdminAuctions()
      } else setActionError(result.error || 'Erro ao publicar.')
    } catch {
      setActionError('Erro de conexão.')
    } finally {
      setPublishing(false)
    }
  }

  // ── close ──────────────────────────────────────────────────────────────────

  const handleClose = async () => {
    if (!closeTarget) return
    setClosing(true)
    setActionError(null)
    try {
      const res = await fetch('/api/auction-close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auction_id: closeTarget.id })
      })
      const result = await res.json()
      if (result.success) {
        setCloseTarget(null)
        fetchAuctions()
        fetchAdminAuctions()
      } else setActionError(result.error || 'Erro ao fechar.')
    } catch {
      setActionError('Erro de conexão.')
    } finally {
      setClosing(false)
    }
  }

  // ── cancel ─────────────────────────────────────────────────────────────────

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    setActionError(null)
    try {
      const res = await fetch('/api/auction-edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auction_id: cancelTarget.id, action: 'cancel' })
      })
      const result = await res.json()
      if (result.success) {
        setCancelTarget(null)
        fetchAuctions()
        fetchAdminAuctions()
      } else setActionError(result.error || 'Erro ao cancelar.')
    } catch {
      setActionError('Erro de conexão.')
    } finally {
      setCancelling(false)
    }
  }

  // ── filtered admin list ────────────────────────────────────────────────────

  const filteredAdmin =
    adminTab === 'ALL'
      ? adminAuctions
      : adminAuctions.filter(a => a.status === adminTab)

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <SEO title="Leilão GM" path="/dashboard/leilao" noindex />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Gavel className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold font-serif glow-text">
                Leilão GM
              </h1>
            </div>
            <p className="text-sm text-base-content/60">
              Lances em itens raros criados pela equipe. Use seus Donation
              Points!
            </p>
          </div>
        </div>

        <WalletCard />

        {/* ── Admin Panel ─────────────────────────────────────────────────── */}
        {isAdmin && (
          <div className="card border-2 border-warning/40 bg-warning/5 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                    <ShieldAlert className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-bold text-warning text-lg">
                      Painel Admin — Leilões
                    </p>
                    <p className="text-xs text-base-content/50">
                      Gerencie todos os leilões da plataforma
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-warning btn-sm gap-2"
                  onClick={() => {
                    setCreateOpen(true)
                    setCreateError(null)
                    setCreateSuccess(null)
                    setCreateForm(emptyCreateForm)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Criar Leilão
                </button>
              </div>

              {/* Tabs */}
              <div className="tabs tabs-bordered mb-4">
                {(
                  [
                    'ALL',
                    'ACTIVE',
                    'DRAFT',
                    'SCHEDULED',
                    'CLOSED',
                    'CANCELLED'
                  ] as const
                ).map(tab => (
                  <button
                    key={tab}
                    className={`tab tab-sm ${adminTab === tab ? 'tab-active' : ''}`}
                    onClick={() => setAdminTab(tab)}
                  >
                    {tab === 'ALL'
                      ? 'Todos'
                      : STATUS_LABEL[tab as AuctionStatus]}
                    <span className="ml-1.5 badge badge-xs">
                      {tab === 'ALL'
                        ? adminAuctions.length
                        : adminAuctions.filter(a => a.status === tab).length}
                    </span>
                  </button>
                ))}
              </div>

              {actionError && (
                <div className="alert alert-error alert-sm mb-3 text-sm py-2">
                  <AlertCircle className="h-4 w-4" />
                  {actionError}
                  <button
                    className="ml-auto btn btn-ghost btn-xs"
                    onClick={() => setActionError(null)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {adminLoading ? (
                <div className="flex items-center gap-2 text-base-content/40 py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando...
                </div>
              ) : filteredAdmin.length === 0 ? (
                <p className="text-base-content/40 text-sm py-4 text-center italic">
                  Nenhum leilão nesta categoria
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredAdmin.map(a => (
                    <AdminAuctionCard
                      key={a.id}
                      auction={a}
                      onClose={setCloseTarget}
                      onCancel={setCancelTarget}
                      onEdit={openEdit}
                      onPublish={a => {
                        setPublishTarget(a)
                        setPublishHours(24)
                        setActionError(null)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Active Auctions (players) ────────────────────────────────────── */}
        <div className="card-fantasy overflow-hidden">
          <div className="flex items-center justify-between border-b border-base-300 p-4">
            <h2 className="font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Leilões Ativos
            </h2>
            <span className="badge badge-outline text-xs">
              {auctions.length} itens
            </span>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-base-content/30">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando…
              </div>
            ) : auctions.length === 0 ? (
              <div className="text-center py-12">
                <Gavel className="h-16 w-16 text-base-content/20 mx-auto mb-4" />
                <p className="text-base-content/60">
                  Nenhum leilão ativo no momento
                </p>
                <p className="text-sm text-base-content/40 mt-1">
                  Novos leilões são criados regularmente!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {auctions.map(auction => {
                  const min =
                    auction.current_bid > 0
                      ? Math.ceil(auction.current_bid * 1.05)
                      : auction.starting_bid
                  const rarityColor =
                    RARITY_COLORS[auction.rarity] ?? 'text-gray-400'
                  const rarityBg =
                    RARITY_BG[auction.rarity] ??
                    'bg-gray-500/20 border-gray-500/30'

                  return (
                    <div
                      key={auction.id}
                      className={`card border-2 ${rarityBg} shadow-md hover:shadow-lg transition-all`}
                    >
                      <div className="card-body p-4 justify-between">
                        <div>
                          <h3 className={`text-lg font-bold ${rarityColor}`}>
                            {auction.item_name || `Item #${auction.item_entry}`}
                          </h3>

                          <div className="flex flex-wrap gap-2 mb-2">
                            {auction.category && (
                              <span className="badge badge-sm">
                                {auction.category}
                              </span>
                            )}
                            <span
                              className={`badge badge-sm badge-outline ${rarityColor}`}
                            >
                              {auction.rarity}
                            </span>
                          </div>

                          {auction.description && (
                            <p className="text-xs text-base-content/60 line-clamp-2">
                              {auction.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span
                              className={
                                auction.seconds_remaining < 3600
                                  ? 'text-error font-bold'
                                  : ''
                              }
                            >
                              {formatTime(auction.seconds_remaining)}
                            </span>
                          </div>

                          <div className="divider my-2" />

                          <div className="space-y-1">
                            {auction.current_bid > 0 ? (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span className="text-base-content/60">
                                    Lance atual
                                  </span>
                                  <span className="font-bold text-primary">
                                    {auction.current_bid.toLocaleString()} DP
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-base-content/60">
                                    Próximo mínimo
                                  </span>
                                  <span className="font-semibold">
                                    {min.toLocaleString()} DP
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="flex justify-between text-sm">
                                <span className="text-base-content/60">
                                  Lance inicial
                                </span>
                                <span className="font-bold text-primary">
                                  {auction.starting_bid.toLocaleString()} DP
                                </span>
                              </div>
                            )}
                            {auction.buyout_price && (
                              <div className="flex justify-between text-sm">
                                <span className="text-base-content/60">
                                  Compra direta
                                </span>
                                <span className="font-semibold text-success">
                                  {auction.buyout_price.toLocaleString()} DP
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs text-base-content/40 mt-1">
                              <TrendingUp className="h-3.5 w-3.5" />
                              {auction.total_bids}{' '}
                              {auction.total_bids === 1 ? 'lance' : 'lances'}
                              {auction.participant_count > 0 &&
                                ` · ${auction.participant_count} participantes`}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <button
                            className="btn btn-primary btn-sm btn-block gap-2"
                            onClick={() => openBidModal(auction)}
                          >
                            <Gavel className="h-4 w-4" /> Dar Lance
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal: Dar Lance ─────────────────────────────────────────────────── */}
      {bidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative z-50 w-full max-w-md rounded-lg border border-base-300 bg-base-100 p-6 shadow-2xl">
            <button
              className="btn btn-ghost btn-xs btn-square absolute right-3 top-3"
              onClick={() => setBidModal(null)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold mb-4">Dar Lance</h3>
            <div
              className={`p-4 rounded-lg border ${RARITY_BG[bidModal.rarity] ?? 'bg-base-200'} mb-4`}
            >
              <h4
                className={`font-bold ${RARITY_COLORS[bidModal.rarity] ?? ''}`}
              >
                {bidModal.item_name || `Item #${bidModal.item_entry}`}
              </h4>
              <p className="text-sm text-base-content/60 mt-1">
                Lance atual:{' '}
                {bidModal.current_bid > 0
                  ? `${bidModal.current_bid.toLocaleString()} DP`
                  : 'Nenhum'}
              </p>
            </div>
            <div className="space-y-1 mb-4">
              <label className="text-xs font-medium text-base-content/60">
                Valor do Lance (DP)
                <span className="ml-2 text-base-content/40">
                  Mínimo:{' '}
                  {(bidModal.current_bid > 0
                    ? Math.ceil(bidModal.current_bid * 1.05)
                    : bidModal.starting_bid
                  ).toLocaleString()}{' '}
                  DP
                </span>
              </label>
              <input
                type="number"
                className="input input-bordered input-sm w-full"
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
              />
            </div>
            {bidError && (
              <div className="flex items-center gap-2 rounded-lg border border-error/50 bg-error/10 p-3 text-sm text-error mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {bidError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setBidModal(null)}
                disabled={bidding}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary btn-sm gap-2"
                onClick={placeBid}
                disabled={bidding || !bidAmount}
              >
                {bidding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Coins className="h-4 w-4" />
                )}
                Confirmar Lance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Criar Leilão ───────────────────────────────────────────────── */}
      {isAdmin && createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" />
          <div className="relative z-50 w-full max-w-2xl rounded-lg border border-warning/30 bg-base-100 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              className="btn btn-ghost btn-xs btn-square absolute right-3 top-3"
              onClick={() => setCreateOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                <Gavel className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Criar Leilão</h3>
                <p className="text-xs text-base-content/50">
                  Item deve estar na whitelist com can_auction = 1
                </p>
              </div>
            </div>

            {createSuccess ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-success/50 bg-success/10 p-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <p className="text-sm">{createSuccess}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCreateOpen(false)}
                  >
                    Fechar
                  </button>
                  <button
                    className="btn btn-warning btn-sm gap-1"
                    onClick={() => {
                      setCreateSuccess(null)
                      setCreateForm(emptyCreateForm)
                    }}
                  >
                    <Plus className="h-4 w-4" /> Criar outro
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-base-content/60">
                    Status ao criar
                  </label>
                  <div className="flex gap-2">
                    {(['ACTIVE', 'DRAFT', 'SCHEDULED'] as const).map(s => (
                      <button
                        key={s}
                        className={`btn btn-sm flex-1 ${createForm.status === s ? 'btn-warning' : 'btn-outline'}`}
                        onClick={() =>
                          setCreateForm(f => ({ ...f, status: s }))
                        }
                      >
                        {s === 'ACTIVE'
                          ? 'Publicar agora'
                          : s === 'DRAFT'
                            ? 'Rascunho'
                            : 'Agendar'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-base-content/60">
                      Item Entry *
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Ex: 13335"
                      className="input input-bordered input-sm w-full"
                      value={createForm.item_entry}
                      onChange={e =>
                        setCreateForm(f => ({
                          ...f,
                          item_entry: e.target.value
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-base-content/60">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="1"
                      className="input input-bordered input-sm w-full"
                      value={createForm.item_count}
                      onChange={e =>
                        setCreateForm(f => ({
                          ...f,
                          item_count: e.target.value
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Bids */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-base-content/60">
                      Lance Inicial (DP) *
                    </label>
                    <input
                      type="number"
                      min={10}
                      placeholder="Ex: 500"
                      className="input input-bordered input-sm w-full"
                      value={createForm.starting_bid}
                      onChange={e =>
                        setCreateForm(f => ({
                          ...f,
                          starting_bid: e.target.value
                        }))
                      }
                    />
                    <p className="text-[10px] text-base-content/40">
                      Mínimo: 10 DP
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-base-content/60">
                      Incremento mínimo (DP)
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="50"
                      className="input input-bordered input-sm w-full"
                      value={createForm.min_increment}
                      onChange={e =>
                        setCreateForm(f => ({
                          ...f,
                          min_increment: e.target.value
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-base-content/60">
                      Compra imediata (DP)
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Opcional"
                      className="input input-bordered input-sm w-full"
                      value={createForm.buyout_price}
                      onChange={e =>
                        setCreateForm(f => ({
                          ...f,
                          buyout_price: e.target.value
                        }))
                      }
                    />
                    <p className="text-[10px] text-base-content/40">
                      Deve ser maior que o lance inicial
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-base-content/60">
                      Reserva (DP)
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Opcional"
                      className="input input-bordered input-sm w-full"
                      value={createForm.reserve_price}
                      onChange={e =>
                        setCreateForm(f => ({
                          ...f,
                          reserve_price: e.target.value
                        }))
                      }
                    />
                    <p className="text-[10px] text-base-content/40">
                      Preço mínimo para fechar
                    </p>
                  </div>
                </div>

                {/* Duration / start_time */}
                {createForm.status !== 'DRAFT' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-base-content/60">
                        Duração *
                      </label>
                      <select
                        className="select select-bordered select-sm w-full"
                        value={createForm.duration_hours}
                        onChange={e =>
                          setCreateForm(f => ({
                            ...f,
                            duration_hours: Number(e.target.value)
                          }))
                        }
                      >
                        {DURATION_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {createForm.status === 'SCHEDULED' && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-base-content/60">
                          Início agendado *
                        </label>
                        <input
                          type="datetime-local"
                          className="input input-bordered input-sm w-full"
                          min={toLocalDatetimeValue(new Date())}
                          value={createForm.start_time}
                          onChange={e =>
                            setCreateForm(f => ({
                              ...f,
                              start_time: e.target.value
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-base-content/60">
                    Descrição (opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalhes do item, condições do leilão…"
                    className="textarea textarea-bordered textarea-sm w-full"
                    value={createForm.description}
                    onChange={e =>
                      setCreateForm(f => ({
                        ...f,
                        description: e.target.value
                      }))
                    }
                  />
                  <p className="text-[10px] text-base-content/40">
                    {createForm.description.length}/500
                  </p>
                </div>

                {createError && (
                  <div className="flex items-center gap-2 rounded-lg border border-error/50 bg-error/10 p-3 text-sm text-error">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {createError}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCreateOpen(false)}
                    disabled={creating}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-warning btn-sm gap-2"
                    onClick={handleCreate}
                    disabled={
                      creating ||
                      !createForm.item_entry ||
                      !createForm.starting_bid
                    }
                  >
                    {creating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Gavel className="h-4 w-4" />
                    )}
                    {createForm.status === 'DRAFT'
                      ? 'Salvar rascunho'
                      : createForm.status === 'SCHEDULED'
                        ? 'Agendar'
                        : 'Publicar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Editar Leilão ──────────────────────────────────────────────── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" />
          <div className="relative z-50 w-full max-w-lg rounded-lg border border-base-300 bg-base-100 p-6 shadow-2xl">
            <button
              className="btn btn-ghost btn-xs btn-square absolute right-3 top-3"
              onClick={() => setEditTarget(null)}
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold mb-1">
              Editar Leilão #{editTarget.id}
            </h3>
            <p className="text-xs text-base-content/50 mb-4">
              {editTarget.item_name || `Item #${editTarget.item_entry}`}
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-base-content/60">
                    Lance Inicial (DP)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-full"
                    value={editForm.starting_bid}
                    onChange={e =>
                      setEditForm(f => ({ ...f, starting_bid: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-base-content/60">
                    Incremento mínimo (DP)
                  </label>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-full"
                    value={editForm.min_increment}
                    onChange={e =>
                      setEditForm(f => ({
                        ...f,
                        min_increment: e.target.value
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-base-content/60">
                    Compra imediata (DP)
                  </label>
                  <input
                    type="number"
                    placeholder="Deixar vazio para remover"
                    className="input input-bordered input-sm w-full"
                    value={editForm.buyout_price}
                    onChange={e =>
                      setEditForm(f => ({ ...f, buyout_price: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-base-content/60">
                    Reserva (DP)
                  </label>
                  <input
                    type="number"
                    placeholder="Deixar vazio para remover"
                    className="input input-bordered input-sm w-full"
                    value={editForm.reserve_price}
                    onChange={e =>
                      setEditForm(f => ({
                        ...f,
                        reserve_price: e.target.value
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-base-content/60">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  className="textarea textarea-bordered textarea-sm w-full"
                  value={editForm.description}
                  onChange={e =>
                    setEditForm(f => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              {editError && (
                <div className="flex items-center gap-2 rounded-lg border border-error/50 bg-error/10 p-3 text-sm text-error">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {editError}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditTarget(null)}
                  disabled={editing}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary btn-sm gap-2"
                  onClick={handleEdit}
                  disabled={editing}
                >
                  {editing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Edit2 className="h-4 w-4" />
                  )}
                  Salvar alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Publicar DRAFT ─────────────────────────────────────────────── */}
      {publishTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" />
          <div className="relative z-50 w-full max-w-sm rounded-lg border border-base-300 bg-base-100 p-6 shadow-2xl">
            <button
              className="btn btn-ghost btn-xs btn-square absolute right-3 top-3"
              onClick={() => setPublishTarget(null)}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-success" />
              <h3 className="font-bold">
                Publicar leilão #{publishTarget.id}?
              </h3>
            </div>
            <p className="text-sm text-base-content/60 mb-4">
              {publishTarget.item_name || `Item #${publishTarget.item_entry}`}
            </p>
            <div className="space-y-1 mb-4">
              <label className="text-xs font-medium text-base-content/60">
                Duração
              </label>
              <select
                className="select select-bordered select-sm w-full"
                value={publishHours}
                onChange={e => setPublishHours(Number(e.target.value))}
              >
                {DURATION_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-error/50 bg-error/10 p-3 text-sm text-error mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPublishTarget(null)}
                disabled={publishing}
              >
                Cancelar
              </button>
              <button
                className="btn btn-success btn-sm gap-2"
                onClick={handlePublish}
                disabled={publishing}
              >
                {publishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Fechar Leilão ──────────────────────────────────────────────── */}
      {closeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" />
          <div className="relative z-50 w-full max-w-sm rounded-lg border border-warning/40 bg-base-100 p-6 shadow-2xl">
            <button
              className="btn btn-ghost btn-xs btn-square absolute right-3 top-3"
              onClick={() => setCloseTarget(null)}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Gavel className="h-6 w-6 text-warning" />
              <h3 className="font-bold">Fechar leilão #{closeTarget.id}?</h3>
            </div>
            <p className="text-sm text-base-content/60 mb-2">
              {closeTarget.item_name || `Item #${closeTarget.item_entry}`}
            </p>
            {closeTarget.current_bid > 0 ? (
              <div className="alert alert-success alert-soft text-sm mb-4">
                <Trophy className="h-4 w-4" />
                Lance vencedor:{' '}
                <strong>{closeTarget.current_bid.toLocaleString()} DP</strong>.
                O item será adicionado à fila de entrega.
              </div>
            ) : (
              <div className="alert alert-warning alert-soft text-sm mb-4">
                <AlertTriangle className="h-4 w-4" />
                Nenhum lance. O leilão será encerrado sem vencedor.
              </div>
            )}
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-error/50 bg-error/10 p-3 text-sm text-error mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCloseTarget(null)}
                disabled={closing}
              >
                Cancelar
              </button>
              <button
                className="btn btn-warning btn-sm gap-2"
                onClick={handleClose}
                disabled={closing}
              >
                {closing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Gavel className="h-4 w-4" />
                )}
                Confirmar fechamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Cancelar Leilão ────────────────────────────────────────────── */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" />
          <div className="relative z-50 w-full max-w-sm rounded-lg border border-error/40 bg-base-100 p-6 shadow-2xl">
            <button
              className="btn btn-ghost btn-xs btn-square absolute right-3 top-3"
              onClick={() => setCancelTarget(null)}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Ban className="h-6 w-6 text-error" />
              <h3 className="font-bold text-error">
                Cancelar leilão #{cancelTarget.id}?
              </h3>
            </div>
            <p className="text-sm text-base-content/60 mb-2">
              {cancelTarget.item_name || `Item #${cancelTarget.item_entry}`}
            </p>
            {cancelTarget.current_bid > 0 && cancelTarget.current_bidder_id && (
              <div className="alert alert-warning alert-soft text-sm mb-4">
                <AlertTriangle className="h-4 w-4" />O lance de{' '}
                <strong>{cancelTarget.current_bid.toLocaleString()} DP</strong>{' '}
                será reembolsado automaticamente.
              </div>
            )}
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-error/50 bg-error/10 p-3 text-sm text-error mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {actionError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
              >
                Voltar
              </button>
              <button
                className="btn btn-error btn-sm gap-2"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4" />
                )}
                Cancelar leilão
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
  let isAdmin = false

  try {
    const [rows] = (await pool.query(
      'SELECT 1 FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 2 LIMIT 1',
      [session.user.id]
    )) as any[]
    isAdmin = rows.length > 0
  } catch {
    isAdmin = false
  }

  return { props: { user: session.user, isAdmin } }
}
