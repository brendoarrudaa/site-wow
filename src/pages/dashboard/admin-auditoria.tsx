import { useEffect, useState, useCallback } from 'react'
import type { GetServerSidePropsContext } from 'next'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import SEO from '../../components/SEO'
import { getSession, type SessionUser } from '../../lib/session'
import { getPool } from '../../lib/db'
import {
  FileText,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Shield,
  User,
  X
} from 'lucide-react'

// ── constants ────────────────────────────────────────────────────────────────

const CRITICAL_ACTIONS = [
  'APPROVE_LISTING',
  'REJECT_LISTING',
  'AUCTION_CLOSED_GM',
  'FULFILLMENT_DELIVERED',
  'CREDIT_DP',
  'CREDIT_VP',
  'ADMIN_ADJUSTMENT',
  'BID_REFUND',
  'MARKETPLACE_PURCHASE',
  'AUCTION_WIN'
]

const QUICK_FILTERS: { label: string; actions: string[] }[] = [
  {
    label: 'Leilões',
    actions: [
      'CREATE_AUCTION',
      'AUCTION_PUBLISHED',
      'AUCTION_EDITED',
      'AUCTION_CANCELLED',
      'AUCTION_CLOSED_GM',
      'AUCTION_WIN',
      'BID_PLACED',
      'BID_REFUND'
    ]
  },
  {
    label: 'Marketplace',
    actions: [
      'CREATE_LISTING',
      'APPROVE_LISTING',
      'REJECT_LISTING',
      'MARKETPLACE_PURCHASE'
    ]
  },
  {
    label: 'Financeiro',
    actions: ['CREDIT_DP', 'CREDIT_VP', 'ADMIN_ADJUSTMENT', 'BID_REFUND']
  },
  {
    label: 'Entregas',
    actions: ['FULFILLMENT_DELIVERED']
  }
]

const ACTION_COLORS: Record<string, string> = {
  APPROVE_LISTING: 'badge-success',
  FULFILLMENT_DELIVERED: 'badge-success',
  AUCTION_WIN: 'badge-success',
  CREDIT_DP: 'badge-success',
  CREDIT_VP: 'badge-success',
  REJECT_LISTING: 'badge-error',
  AUCTION_CANCELLED: 'badge-error',
  BID_REFUND: 'badge-warning',
  ADMIN_ADJUSTMENT: 'badge-warning',
  AUCTION_CLOSED_GM: 'badge-warning',
  MARKETPLACE_PURCHASE: 'badge-info',
  BID_PLACED: 'badge-info',
  CREATE_LISTING: 'badge-primary',
  CREATE_AUCTION: 'badge-primary',
  AUCTION_PUBLISHED: 'badge-primary'
}

const ACTION_LABELS: Record<string, string> = {
  APPROVE_LISTING: 'Aprovação',
  REJECT_LISTING: 'Rejeição',
  CREATE_LISTING: 'Nova Listagem',
  MARKETPLACE_PURCHASE: 'Compra',
  CREATE_AUCTION: 'Novo Leilão',
  AUCTION_PUBLISHED: 'Leilão Publicado',
  AUCTION_EDITED: 'Leilão Editado',
  AUCTION_CANCELLED: 'Leilão Cancelado',
  AUCTION_CLOSED_GM: 'Leilão Encerrado',
  AUCTION_WIN: 'Leilão Vencido',
  BID_PLACED: 'Lance',
  BID_REFUND: 'Reembolso',
  CREDIT_DP: 'Crédito DP',
  CREDIT_VP: 'Crédito VP',
  ADMIN_ADJUSTMENT: 'Ajuste Admin',
  FULFILLMENT_DELIVERED: 'Entregue',
  MARK_DELIVERED: 'Entregue (Manual)',
  DELIVER_SOAP: 'Entregue (Auto)',
  GM_SOAP_ANNOUNCE: 'Announce',
  GM_SOAP_NOTIFY: 'Notify',
  GM_SOAP_KICK: 'Kick',
  GM_SOAP_SUMMON: 'Summon',
  GM_SOAP_REVIVE: 'Revive',
  GM_SOAP_SAVEALL: 'Saveall'
}

const ROLE_COLORS: Record<string, string> = {
  PLAYER: 'badge-ghost',
  GM1: 'badge-info',
  GM2: 'badge-warning',
  GM3: 'badge-error',
  GM4: 'badge-error'
}

// ── helpers ──────────────────────────────────────────────────────────────────

function actionColor(action: string) {
  return ACTION_COLORS[action] ?? 'badge-neutral'
}

function roleColor(role: string) {
  return ROLE_COLORS[role] ?? 'badge-ghost'
}

function prettyJson(raw: string | null | undefined) {
  if (!raw) return null
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return JSON.stringify(parsed, null, 2)
  } catch {
    return String(raw)
  }
}

// ── ExpandableCell ────────────────────────────────────────────────────────────

function ExpandableJson({
  label,
  value
}: {
  label: string
  value: string | null | undefined
}) {
  const [open, setOpen] = useState(false)
  const pretty = prettyJson(value)
  if (!pretty) return <span className="text-base-content/30 text-xs">—</span>

  return (
    <div>
      <button
        className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {label}
      </button>
      {open && (
        <pre className="mt-1 text-xs bg-base-300 rounded p-2 max-w-xs max-h-40 overflow-auto whitespace-pre-wrap break-all">
          {pretty}
        </pre>
      )}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function AuditoriaPage({ user }: { user: SessionUser }) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [quickFilter, setQuickFilter] = useState<string[] | null>(null)

  const [filters, setFilters] = useState({
    action_type: '',
    account_id: '',
    date_from: '',
    date_to: '',
    page: 1
  })

  const buildParams = useCallback(
    (overrides: Record<string, string> = {}) => {
      const p = new URLSearchParams()
      const f = { ...filters, ...overrides }
      if (f.action_type) p.set('action_type', f.action_type)
      if (f.account_id) p.set('account_id', f.account_id)
      if (f.date_from) p.set('date_from', f.date_from)
      if (f.date_to) p.set('date_to', f.date_to)
      if (criticalOnly) p.set('critical', '1')
      p.set('page', (f.page ?? 1).toString())
      p.set('perPage', '50')
      return p
    },
    [filters, criticalOnly]
  )

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = buildParams()
      if (quickFilter?.length) {
        // quick filter overrides action_type: fetch each and merge (or just first action for simplicity)
        // API supports single action_type — we'll make multiple requests if needed, or just show first
        // For now, pass the first action; a real multi-value filter would need API support
        params.set('action_type', quickFilter.join(',')) // server handles comma-separated? no — use critical instead
        // Actually the API uses exact match. Let's skip quick filter on fetch and filter client-side.
        params.delete('action_type')
      }
      const res = await fetch(`/api/admin-audit?${params}`)
      const result = await res.json()
      if (result.success) {
        let rows = result.data.logs ?? []
        if (quickFilter?.length) {
          rows = rows.filter((r: any) => quickFilter.includes(r.action_type))
        }
        setLogs(rows)
        setTotal(result.data.total ?? 0)
        setTotalPages(result.data.total_pages ?? 1)
      }
    } catch (e) {
      console.error('[admin-auditoria] fetch error', e)
    } finally {
      setLoading(false)
    }
  }, [buildParams, quickFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const applyFilters = () => {
    setFilters(f => ({ ...f, page: 1 }))
    setQuickFilter(null)
  }

  const clearFilters = () => {
    setFilters({
      action_type: '',
      account_id: '',
      date_from: '',
      date_to: '',
      page: 1
    })
    setCriticalOnly(false)
    setQuickFilter(null)
  }

  const exportCSV = () => {
    const params = buildParams()
    params.set('format', 'csv')
    window.location.href = `/api/admin-audit?${params}`
  }

  const toggleQuickFilter = (actions: string[]) => {
    const key = actions.join(',')
    const currentKey = quickFilter?.join(',') ?? ''
    if (currentKey === key) {
      setQuickFilter(null)
    } else {
      setQuickFilter(actions)
      setFilters(f => ({ ...f, action_type: '', page: 1 }))
      setCriticalOnly(false)
    }
  }

  const toggleCritical = () => {
    setCriticalOnly(v => !v)
    setQuickFilter(null)
    setFilters(f => ({ ...f, action_type: '', page: 1 }))
  }

  return (
    <DashboardLayout>
      <SEO title="Auditoria" path="/dashboard/admin-auditoria" noindex />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Log de Auditoria
              </h1>
              <p className="text-base-content/60 text-sm mt-0.5">
                {total > 0
                  ? `${total.toLocaleString('pt-BR')} registros encontrados`
                  : 'Histórico de ações do marketplace'}
              </p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm gap-2" onClick={exportCSV}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>

        {/* Quick filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-base-content/50 font-semibold uppercase tracking-wider mr-1">
            Filtros rápidos:
          </span>

          <button
            className={`btn btn-xs gap-1 ${criticalOnly ? 'btn-error' : 'btn-outline btn-error'}`}
            onClick={toggleCritical}
          >
            <AlertTriangle className="h-3 w-3" />
            Ações Críticas
          </button>

          {QUICK_FILTERS.map(qf => {
            const active = quickFilter?.join(',') === qf.actions.join(',')
            return (
              <button
                key={qf.label}
                className={`btn btn-xs ${active ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => toggleQuickFilter(qf.actions)}
              >
                {qf.label}
              </button>
            )
          })}

          {(criticalOnly || quickFilter) && (
            <button
              className="btn btn-xs btn-ghost gap-1"
              onClick={clearFilters}
            >
              <X className="h-3 w-3" /> Limpar
            </button>
          )}
        </div>

        {/* Filtros detalhados */}
        <div className="card bg-base-200 shadow">
          <div className="card-body py-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-base-content/60" />
              <span className="font-semibold text-sm">Filtros detalhados</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Tipo de Ação</span>
                </label>
                <select
                  className="select select-bordered select-sm"
                  value={filters.action_type}
                  onChange={e =>
                    setFilters(f => ({ ...f, action_type: e.target.value }))
                  }
                >
                  <option value="">Todas</option>
                  <optgroup label="Leilão">
                    <option value="CREATE_AUCTION">Criar Leilão</option>
                    <option value="AUCTION_PUBLISHED">Publicar Leilão</option>
                    <option value="AUCTION_EDITED">Editar Leilão</option>
                    <option value="AUCTION_CANCELLED">Cancelar Leilão</option>
                    <option value="AUCTION_CLOSED_GM">
                      Fechar Leilão (GM)
                    </option>
                    <option value="AUCTION_WIN">Leilão Vencido</option>
                    <option value="BID_PLACED">Lance</option>
                    <option value="BID_REFUND">Reembolso de Lance</option>
                  </optgroup>
                  <optgroup label="Marketplace">
                    <option value="CREATE_LISTING">Criar Venda</option>
                    <option value="APPROVE_LISTING">Aprovar Venda</option>
                    <option value="REJECT_LISTING">Rejeitar Venda</option>
                    <option value="MARKETPLACE_PURCHASE">Compra</option>
                  </optgroup>
                  <optgroup label="Financeiro">
                    <option value="CREDIT_DP">Crédito DP</option>
                    <option value="CREDIT_VP">Crédito VP</option>
                    <option value="ADMIN_ADJUSTMENT">Ajuste Admin</option>
                  </optgroup>
                  <optgroup label="Entregas">
                    <option value="FULFILLMENT_DELIVERED">Entrega</option>
                  </optgroup>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Account ID</span>
                </label>
                <input
                  type="number"
                  placeholder="Ex: 1234"
                  className="input input-bordered input-sm"
                  value={filters.account_id}
                  onChange={e =>
                    setFilters(f => ({ ...f, account_id: e.target.value }))
                  }
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Data Inicial</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={filters.date_from}
                  onChange={e =>
                    setFilters(f => ({ ...f, date_from: e.target.value }))
                  }
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Data Final</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={filters.date_to}
                  onChange={e =>
                    setFilters(f => ({ ...f, date_to: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                className="btn btn-primary btn-sm gap-2"
                onClick={applyFilters}
              >
                <Search className="h-4 w-4" />
                Buscar
              </button>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                Limpar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-6 space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton h-14 w-full rounded" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-base-content/20 mx-auto mb-4" />
                <p className="text-base-content/50">
                  Nenhum registro encontrado
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-xs w-full">
                  <thead>
                    <tr className="bg-base-300 text-base-content/70 text-xs uppercase tracking-wide">
                      <th className="w-12">#</th>
                      <th>Ator</th>
                      <th>Papel</th>
                      <th>Ação</th>
                      <th>Alvo</th>
                      <th>Antes/Depois</th>
                      <th>IP / UA</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => {
                      const isCritical =
                        log.is_critical ||
                        CRITICAL_ACTIONS.includes(log.action_type)
                      const isExpanded = expandedRow === log.id
                      const target = log.target_type
                        ? `${log.target_type} #${log.target_id ?? '?'}`
                        : log.entity_type
                          ? `${log.entity_type} #${log.entity_id ?? '?'}`
                          : '—'

                      return (
                        <tr
                          key={log.id}
                          className={[
                            isCritical
                              ? 'bg-warning/5 border-l-2 border-l-warning'
                              : '',
                            idx % 2 === 0 ? '' : 'bg-base-100/30',
                            'hover:bg-base-300/40 transition-colors'
                          ].join(' ')}
                        >
                          {/* ID */}
                          <td className="font-mono text-xs text-base-content/40 align-top pt-3">
                            {isCritical && (
                              <AlertTriangle className="h-3 w-3 text-warning inline mr-1" />
                            )}
                            {log.id}
                          </td>

                          {/* Ator */}
                          <td className="align-top pt-3">
                            <div className="flex items-center gap-1.5">
                              {log.actor_role && log.actor_role !== 'PLAYER' ? (
                                <Shield className="h-3.5 w-3.5 text-warning shrink-0" />
                              ) : (
                                <User className="h-3.5 w-3.5 text-base-content/40 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="font-semibold text-xs truncate max-w-[100px]">
                                  {log.actor_username || `#${log.account_id}`}
                                </div>
                                <div className="text-base-content/40 text-xs">
                                  ID {log.account_id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Papel */}
                          <td className="align-top pt-3">
                            <span
                              className={`badge p-2 badge-sm ${roleColor(log.actor_role ?? 'PLAYER')}`}
                            >
                              {log.actor_role ?? 'PLAYER'}
                            </span>
                          </td>

                          {/* Ação */}
                          <td className="align-top pt-3">
                            <span
                              className={`badge p-2 badge-sm font-mono text-xs ${actionColor(log.action_type)}`}
                            >
                              {ACTION_LABELS[log.action_type] ??
                                log.action_type}
                            </span>
                          </td>

                          {/* Alvo */}
                          <td className="align-top pt-3 text-xs text-base-content/60 font-mono">
                            {target}
                          </td>

                          {/* Before/After */}
                          <td className="align-top pt-2">
                            <div className="space-y-1">
                              <ExpandableJson
                                label="Antes"
                                value={log.before_state}
                              />
                              <ExpandableJson
                                label="Depois"
                                value={log.after_state}
                              />
                              <ExpandableJson
                                label="Detalhes"
                                value={log.details}
                              />
                            </div>
                          </td>

                          {/* IP / UA */}
                          <td className="align-top pt-2">
                            <button
                              className="cursor-pointer text-xs font-mono text-base-content/50 hover:text-base-content flex items-center gap-1"
                              onClick={() =>
                                setExpandedRow(isExpanded ? null : log.id)
                              }
                              title="Ver user-agent e correlation ID"
                            >
                              {log.ip_address || '—'}
                              {log.user_agent &&
                                (isExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                ))}
                            </button>
                            {isExpanded && (
                              <div className="mt-1 text-xs bg-base-300 rounded p-2 max-w-[200px] space-y-1">
                                {log.user_agent && (
                                  <p className="text-base-content/60 break-all">
                                    <span className="font-semibold text-base-content/80">
                                      UA:{' '}
                                    </span>
                                    {log.user_agent}
                                  </p>
                                )}
                                {log.correlation_id && (
                                  <p className="font-mono text-base-content/60 break-all">
                                    <span className="font-semibold text-base-content/80">
                                      Corr:{' '}
                                    </span>
                                    {log.correlation_id}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Data */}
                          <td className="align-top pt-3 text-xs text-base-content/60 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginação */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t border-base-300">
                <span className="text-sm text-base-content/50">
                  Página {filters.page} de {totalPages}
                </span>
                <div className="join">
                  <button
                    className="join-item btn btn-sm"
                    disabled={filters.page === 1}
                    onClick={() =>
                      setFilters(f => ({ ...f, page: f.page - 1 }))
                    }
                  >
                    «
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, filters.page - 2) + i
                    if (p > totalPages) return null
                    return (
                      <button
                        key={p}
                        className={`join-item btn btn-sm ${p === filters.page ? 'btn-active' : ''}`}
                        onClick={() => setFilters(f => ({ ...f, page: p }))}
                      >
                        {p}
                      </button>
                    )
                  })}
                  <button
                    className="join-item btn btn-sm"
                    disabled={filters.page >= totalPages}
                    onClick={() =>
                      setFilters(f => ({ ...f, page: f.page + 1 }))
                    }
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legenda */}
        <div className="alert alert-warning alert-soft text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <div>
            <strong>Ações críticas</strong> são destacadas com borda laranja e
            ícone <AlertTriangle className="h-3 w-3 inline text-warning" />.
            Incluem: aprovações, rejeições, entregas, estornos, créditos e
            fechamento de leilão.
          </div>
        </div>
      </div>
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
      'SELECT 1 FROM acore_auth.account_access WHERE account_id = ? AND gmlevel >= 3 LIMIT 1',
      [session.user.id]
    )) as any
  } catch {
    ;[access] = (await pool.query(
      'SELECT 1 FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 3 LIMIT 1',
      [session.user.id]
    )) as any
  }

  if (!access.length) {
    return { redirect: { destination: '/dashboard', permanent: false } }
  }

  return { props: { user: session.user } }
}
