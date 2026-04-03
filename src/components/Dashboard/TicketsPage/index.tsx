import { useState } from "react"
import {
  MessageSquare, Plus, Clock, CheckCircle, AlertCircle,
  Send, Bug, User, Shield, AlertTriangle, Lightbulb,
  HelpCircle, X,
} from "lucide-react"
import { mockTickets, Ticket } from "@/lib/mock-data"

const categoryConfig = {
  bug:        { label: "Bug Report",  Icon: Bug,          color: "text-error" },
  account:    { label: "Conta",       Icon: User,         color: "text-info" },
  character:  { label: "Personagem",  Icon: Shield,       color: "text-secondary" },
  report:     { label: "Denúncia",    Icon: AlertTriangle, color: "text-warning" },
  suggestion: { label: "Sugestão",    Icon: Lightbulb,    color: "text-primary" },
  other:      { label: "Outro",       Icon: HelpCircle,   color: "text-base-content/50" },
}

const statusConfig = {
  open:        { label: "Aberto",       cls: "badge-outline text-warning border-warning" },
  "in-progress": { label: "Em Progresso", cls: "badge-primary" },
  resolved:    { label: "Resolvido",    cls: "badge-outline text-success border-success" },
  closed:      { label: "Fechado",      cls: "badge-ghost" },
}

const priorityConfig = {
  low:    { label: "Baixa",  cls: "bg-base-200 text-base-content/50" },
  medium: { label: "Média",  cls: "bg-warning/20 text-warning" },
  high:   { label: "Alta",   cls: "bg-error/20 text-error" },
}

const TicketCard = ({
  ticket,
  selected,
  onClick,
}: {
  ticket: Ticket
  selected: boolean
  onClick: () => void
}) => {
  const cat = categoryConfig[ticket.category]
  const status = statusConfig[ticket.status]
  const priority = priorityConfig[ticket.priority]

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-4 transition-all hover:border-primary/50 ${
        selected ? "border-primary bg-primary/5" : "border-base-300 bg-base-100"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-base-200 ${cat.color}`}>
            <cat.Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{ticket.subject}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs text-base-content/40">#{ticket.id}</span>
              <span className={`badge badge-sm ${status.cls}`}>{status.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${priority.cls}`}>
                {priority.label}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-base-content/40">{ticket.updatedAt}</p>
          <p className="mt-1 text-xs text-base-content/40">
            {ticket.messages.length} {ticket.messages.length === 1 ? "msg" : "msgs"}
          </p>
        </div>
      </div>
    </div>
  )
}

const TicketDetail = ({ ticket }: { ticket: Ticket }) => {
  const cat = categoryConfig[ticket.category]
  const status = statusConfig[ticket.status]
  const canReply = ticket.status === "open" || ticket.status === "in-progress"

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-base-200 ${cat.color}`}>
          <cat.Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold">{ticket.subject}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-base-content/40">#{ticket.id}</span>
            <span className={`badge badge-sm ${status.cls}`}>{status.label}</span>
          </div>
        </div>
      </div>

      <div className="max-h-72 space-y-4 overflow-y-auto rounded-lg border border-base-300 p-4">
        {ticket.messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.isStaff ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              msg.isStaff ? "bg-primary text-primary-content" : "bg-base-300"
            }`}>
              {msg.author.slice(0, 2).toUpperCase()}
            </div>
            <div className={`flex-1 ${msg.isStaff ? "text-right" : ""}`}>
              <div className={`inline-block rounded-lg p-3 text-left ${
                msg.isStaff ? "bg-primary/10" : "bg-base-200"
              }`}>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium">{msg.author}</span>
                  {msg.isStaff && (
                    <span className="badge badge-outline badge-xs border-primary text-primary">Staff</span>
                  )}
                </div>
                <p className="text-sm">{msg.content}</p>
                <p className="mt-1 text-[10px] text-base-content/40">{msg.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {canReply && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite sua resposta..."
            className="input input-bordered input-sm flex-1 text-sm"
          />
          <button className="btn btn-primary btn-sm btn-square">
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

const TicketsPage = () => {
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [filter, setFilter] = useState("all")
  const [newTicketOpen, setNewTicketOpen] = useState(false)

  const filtered = mockTickets.filter((t) => {
    if (filter === "open") return t.status === "open" || t.status === "in-progress"
    if (filter === "closed") return t.status === "resolved" || t.status === "closed"
    return true
  })

  const openCount = mockTickets.filter(
    (t) => t.status === "open" || t.status === "in-progress"
  ).length
  const closedCount = mockTickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif glow-text">Tickets de Suporte</h1>
          <p className="text-sm text-base-content/60">
            Abra e acompanhe seus pedidos de suporte
          </p>
        </div>
        <button
          onClick={() => setNewTicketOpen(true)}
          className="btn btn-primary btn-sm gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Abertos", value: openCount, icon: Clock, color: "bg-warning/10 text-warning" },
          { label: "Resolvidos", value: closedCount, icon: CheckCircle, color: "bg-success/10 text-success" },
          { label: "Total", value: mockTickets.length, icon: MessageSquare, color: "bg-primary/10 text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-fantasy flex items-center gap-4 p-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-base-content/60">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* List + Detail */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* List */}
        <div className="card-fantasy overflow-hidden">
          <div className="flex items-center justify-between border-b border-base-300 p-4">
            <h3 className="font-bold">Seus Tickets</h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select select-bordered select-sm w-32"
            >
              <option value="all">Todos</option>
              <option value="open">Abertos</option>
              <option value="closed">Fechados</option>
            </select>
          </div>
          <div className="space-y-3 p-4">
            {filtered.length > 0 ? (
              filtered.map((t) => (
                <TicketCard
                  key={t.id}
                  ticket={t}
                  selected={selected?.id === t.id}
                  onClick={() => setSelected(t)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MessageSquare className="h-10 w-10 text-base-content/20" />
                <p className="mt-2 font-medium">Nenhum ticket encontrado</p>
                <p className="text-sm text-base-content/50">
                  {filter === "open" ? "Você não tem tickets abertos" : "Nenhum ticket no filtro"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="card-fantasy p-6">
          <h3 className="mb-1 font-bold">Detalhes do Ticket</h3>
          <p className="mb-4 text-sm text-base-content/60">
            Selecione um ticket para ver os detalhes
          </p>
          {selected ? (
            <TicketDetail ticket={selected} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-base-content/20" />
              <p className="mt-2 font-medium">Nenhum ticket selecionado</p>
              <p className="text-sm text-base-content/50">
                Clique em um ticket para ver os detalhes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New ticket modal */}
      {newTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setNewTicketOpen(false)} />
          <div className="relative z-50 w-full max-w-lg rounded-lg border border-base-300 bg-base-100 p-6 shadow-xl">
            <button
              className="btn btn-ghost btn-xs btn-square absolute right-3 top-3"
              onClick={() => setNewTicketOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="mb-1 text-lg font-semibold">Criar Novo Ticket</h2>
            <p className="mb-5 text-sm text-base-content/60">
              Descreva seu problema e nossa equipe responderá em breve.
            </p>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-base-content/60">Categoria</label>
                <select className="select select-bordered select-sm w-full">
                  <option value="">Selecione a categoria</option>
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-base-content/60">Prioridade</label>
                <select className="select select-bordered select-sm w-full" defaultValue="medium">
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-base-content/60">Assunto</label>
                <input
                  type="text"
                  placeholder="Resumo do problema"
                  className="input input-bordered input-sm w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-base-content/60">Descrição</label>
                <textarea
                  placeholder="Descreva detalhadamente seu problema..."
                  className="textarea textarea-bordered w-full text-sm"
                  rows={4}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setNewTicketOpen(false)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary btn-sm">Enviar Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketsPage
