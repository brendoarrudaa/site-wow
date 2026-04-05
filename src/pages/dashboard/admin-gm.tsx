import { useState } from 'react'
import Link from 'next/link'
import type { GetServerSidePropsContext } from 'next'
import DashboardLayout from '../../components/Dashboard/DashboardLayout'
import SEO from '../../components/SEO'
import { getSession, type SessionUser } from '../../lib/session'
import { getPool } from '../../lib/db'
import {
  Shield,
  CheckCircle,
  Truck,
  FileText,
  Gavel,
  AlertCircle,
  Terminal,
  Copy,
  Check,
  Zap,
  MapPin,
  Sword,
  Package,
  Globe,
  UserX,
  Megaphone,
  BellRing,
  LogOut,
  Save,
  HeartPulse,
  Antenna,
  Ban,
  ShieldOff,
  Coins,
  TrendingUp,
  Loader2,
  Database,
  Wifi
} from 'lucide-react'

// ── types ─────────────────────────────────────────────────────────────────────

type AdminGmPageProps = { user: SessionUser; gmLevel: number }

type Cmd = { cmd: string; desc: string; obs: string }

type Section = {
  id: string
  title: string
  icon: React.ReactNode
  commands: Cmd[]
}

// ── data ──────────────────────────────────────────────────────────────────────

const QUICK_KIT = [
  '.gm on',
  '.gm fly on',
  '.cheat god on',
  '.cheat power on',
  '.teleport add teste',
  '.teleport teste',
  '.go xyz X Y Z mapId',
  '.summon NomeDoPlayer',
  '.additem 6948 1',
  '.modify money 1000000',
  '.levelup 80',
  '.learn all my spells',
  '.npc add 12345',
  '.npc delete',
  '.gps',
  '.respawn'
]

const SECTIONS: Section[] = [
  {
    id: 'essenciais',
    title: 'Essenciais para teste',
    icon: <Zap className="h-4 w-4" />,
    commands: [
      {
        cmd: '.gm on / .gm off',
        desc: 'Liga ou desliga o modo GM.',
        obs: 'Use ao entrar para testar com permissões elevadas.'
      },
      {
        cmd: '.gm fly on / .gm fly off',
        desc: 'Ativa ou desativa o voo de GM.',
        obs: 'Bom para explorar mapa e checar áreas.'
      },
      {
        cmd: '.gm visible off / on',
        desc: 'Fica invisível ou visível para outros players.',
        obs: 'Útil ao administrar sem aparecer.'
      },
      {
        cmd: '.cheat god on / off',
        desc: 'Ativa o modo deus e impede dano em você.',
        obs: 'Ideal para testes longos.'
      },
      {
        cmd: '.cheat power on / off',
        desc: 'Remove o custo de mana/energia das skills.',
        obs: 'Bom para validar spells sem limite de recurso.'
      },
      {
        cmd: '.cheat status',
        desc: 'Mostra quais cheats estão ativos.',
        obs: 'Cheque antes de concluir um teste.'
      }
    ]
  },
  {
    id: 'teleporte',
    title: 'Teleporte e movimentação',
    icon: <MapPin className="h-4 w-4" />,
    commands: [
      {
        cmd: '.teleport NomeDoLugar',
        desc: 'Teleporta para um local salvo no sistema.',
        obs: 'Ex.: .teleport stormwind'
      },
      {
        cmd: '.teleport add MeuLugar',
        desc: 'Salva sua posição atual como ponto de teleporte.',
        obs: 'Crie pontos de teste próprios.'
      },
      {
        cmd: '.teleport del MeuLugar',
        desc: 'Remove um ponto salvo.',
        obs: 'Use para limpar atalhos antigos.'
      },
      {
        cmd: '.go xyz X Y Z mapId',
        desc: 'Teleporta para coordenadas exatas.',
        obs: 'Ex.: .go xyz -8833.37 628.62 94.00 0'
      },
      {
        cmd: '.go zonexy X Y zoneId',
        desc: 'Teleporta por coordenadas de zona.',
        obs: 'Bom quando você já tem a zona correta.'
      },
      {
        cmd: '.summon NomeDoPlayer',
        desc: 'Puxa um player até você.',
        obs: 'Muito útil em teste com amigos.'
      },
      {
        cmd: '.appear NomeDoPlayer',
        desc: 'Teleporta você até o player, inclusive offline.',
        obs: 'Facilita suporte e debugging.'
      },
      {
        cmd: '.go creature id 12345',
        desc: 'Vai até um NPC pelo entry ID.',
        obs: 'Ótimo para achar NPCs de quest ou vendor.'
      },
      {
        cmd: '.go creature nome NomeDoNPC',
        desc: 'Vai até um NPC pelo nome.',
        obs: 'Serve quando você não sabe o entry ID.'
      }
    ]
  },
  {
    id: 'vida',
    title: 'Vida, nível, spells e atributos',
    icon: <Sword className="h-4 w-4" />,
    commands: [
      {
        cmd: '.revive',
        desc: 'Revive o player selecionado ou você mesmo.',
        obs: 'Útil depois de testes de combate.'
      },
      {
        cmd: '.die',
        desc: 'Mata o alvo selecionado ou você mesmo.',
        obs: 'Bom para validar fluxos de morte.'
      },
      {
        cmd: '.respawn',
        desc: 'Respawna a criatura ou objeto selecionado.',
        obs: 'Evita esperar o tempo normal.'
      },
      {
        cmd: '.respawn all',
        desc: 'Respawna criaturas e objetos próximos.',
        obs: 'Acelera testes em massa.'
      },
      {
        cmd: '.levelup 10',
        desc: 'Sobe 10 níveis no alvo ou em você.',
        obs: 'Ex.: .levelup 80 para ir rápido.'
      },
      {
        cmd: '.character level Nome 80',
        desc: 'Define o nível de um personagem.',
        obs: 'Melhor quando quiser ajustar um alt específico.'
      },
      {
        cmd: '.learn 12345',
        desc: 'Ensina uma spell pelo ID.',
        obs: 'Use junto de lookup quando necessário.'
      },
      {
        cmd: '.learn all my spells',
        desc: 'Aprende todas as spells da sua classe.',
        obs: 'Comando de setup rápido.'
      },
      {
        cmd: '.learn all my talents',
        desc: 'Aprende todos os talentos disponíveis.',
        obs: 'Bom para montar builds rapidamente.'
      },
      {
        cmd: '.reset talents Nome',
        desc: 'Reseta os talentos de um player.',
        obs: 'Útil em validação de builds.'
      },
      {
        cmd: '.modify hp 50000',
        desc: 'Define HP.',
        obs: 'Facilita cenários de teste específicos.'
      },
      {
        cmd: '.modify mana 50000',
        desc: 'Define mana.',
        obs: 'Útil para classes caster.'
      },
      {
        cmd: '.modify speed all 5',
        desc: 'Aumenta todas as velocidades do personagem.',
        obs: 'Acelera deslocamento durante QA.'
      },
      {
        cmd: '.modify speed fly 10',
        desc: 'Aumenta velocidade de voo.',
        obs: 'Muito prático em mapa grande.'
      }
    ]
  },
  {
    id: 'itens',
    title: 'Itens, dinheiro e inventário',
    icon: <Package className="h-4 w-4" />,
    commands: [
      {
        cmd: '.additem 6948 1',
        desc: 'Adiciona item por ID e quantidade.',
        obs: 'Se usar quantidade negativa, remove o item.'
      },
      {
        cmd: '.lookup item NomeDoItem',
        desc: 'Procura item pelo nome e mostra o ID.',
        obs: 'Ex.: .lookup item Frostmourne'
      },
      {
        cmd: '.list item 6948',
        desc: 'Mostra onde o item existe em inventário, mail, banco e guild bank.',
        obs: 'Bom para rastrear item em teste.'
      },
      {
        cmd: '.modify money 1000000',
        desc: 'Adiciona dinheiro; valor negativo remove.',
        obs: 'Prático para validar vendors e economia.'
      }
    ]
  },
  {
    id: 'npcs',
    title: 'NPCs, mundo e visual',
    icon: <Globe className="h-4 w-4" />,
    commands: [
      {
        cmd: '.npc add 12345',
        desc: 'Cria um NPC usando o template ID.',
        obs: 'Base para teste de spawn.'
      },
      {
        cmd: '.npc delete',
        desc: 'Apaga o NPC selecionado.',
        obs: 'Cuidado para não remover o alvo errado.'
      },
      {
        cmd: '.npc info',
        desc: 'Mostra informações detalhadas do NPC selecionado.',
        obs: 'Ajuda no debugging de spawn.'
      },
      {
        cmd: '.npc guid',
        desc: 'Mostra o GUID do NPC selecionado.',
        obs: 'Útil para banco de dados e scripts.'
      },
      {
        cmd: '.gps',
        desc: 'Mostra X, Y, Z, orientação, map ID e zone ID.',
        obs: 'Comando essencial para customização.'
      },
      {
        cmd: '.morph 12345',
        desc: 'Troca seu model ID.',
        obs: 'Bom para testes visuais.'
      },
      {
        cmd: '.morph reset',
        desc: 'Volta ao visual original.',
        obs: 'Reverte morph aplicado.'
      },
      {
        cmd: '.aura 12345',
        desc: 'Aplica uma aura ou spell no alvo.',
        obs: 'Serve para validar efeitos e buffs.'
      },
      {
        cmd: '.unaura 12345',
        desc: 'Remove a aura ou spell do alvo.',
        obs: 'Limpa o alvo para o próximo teste.'
      }
    ]
  },
  {
    id: 'admin',
    title: 'Administração e moderação',
    icon: <UserX className="h-4 w-4" />,
    commands: [
      {
        cmd: '.announce Mensagem',
        desc: 'Envia mensagem global no chat.',
        obs: 'Ex.: aviso de manutenção.'
      },
      {
        cmd: '.notify Mensagem',
        desc: 'Exibe mensagem global na tela dos players.',
        obs: 'Mais chamativo que announce.'
      },
      {
        cmd: '.kick Nome motivo',
        desc: 'Expulsa um player do servidor.',
        obs: 'Use para moderação imediata.'
      },
      {
        cmd: '.ban account conta 7d motivo',
        desc: 'Bane conta por tempo ou permanente.',
        obs: 'Use tempo negativo para ban permanente.'
      },
      {
        cmd: '.unban account conta',
        desc: 'Remove o banimento de uma conta.',
        obs: 'Após resolução do problema.'
      },
      {
        cmd: '.mute Nome 60 Spam',
        desc: 'Silencia um player por X minutos.',
        obs: 'Valor em minutos. Use antes do ban.'
      },
      {
        cmd: '.save',
        desc: 'Salva seu personagem.',
        obs: 'Bom antes de encerrar teste.'
      },
      {
        cmd: '.saveall',
        desc: 'Salva todos os personagens online.',
        obs: 'Use antes de restart e manutenção.'
      }
    ]
  }
]

// ── Action helpers ────────────────────────────────────────────────────────────

const BAN_DURATIONS = [
  { value: '1h', label: '1 hora' },
  { value: '6h', label: '6 horas' },
  { value: '12h', label: '12 horas' },
  { value: '1d', label: '1 dia' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'permanent', label: 'Permanente' }
]

type ActionResult = { ok: boolean; message: string } | null

async function callDB(body: Record<string, unknown>): Promise<ActionResult> {
  const res = await fetch('/api/admin-gm-actions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  return {
    ok: data.success,
    message: data.message || data.error || 'Erro desconhecido'
  }
}

async function callSOAP(body: Record<string, unknown>): Promise<ActionResult> {
  const res = await fetch('/api/admin-gm-soap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  return {
    ok: data.success,
    message: data.message || data.error || 'Erro desconhecido'
  }
}

// ── ActionResult display ──────────────────────────────────────────────────────

function ResultBadge({ result }: { result: ActionResult }) {
  if (!result) return null
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border p-3 text-sm mt-3
      ${
        result.ok
          ? 'border-success/40 bg-success/10 text-success'
          : 'border-error/40 bg-error/10 text-error'
      }`}
    >
      {result.ok ? (
        <Check className="h-4 w-4 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      )}
      {result.message}
    </div>
  )
}

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      className="btn btn-xs btn-ghost opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      onClick={handleCopy}
      title="Copiar comando"
    >
      {copied ? (
        <Check className="h-3 w-3 text-success" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  )
}

// ── CommandTable ──────────────────────────────────────────────────────────────

function CommandTable({ commands }: { commands: Cmd[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="text-xs uppercase text-base-content/40 border-b border-base-300">
            <th className="w-56">Comando</th>
            <th>O que faz</th>
            <th className="hidden md:table-cell">Exemplo / observação</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {commands.map((c, i) => (
            <tr
              key={i}
              className="group hover:bg-base-300/40 align-top border-b border-base-300/30"
            >
              <td className="pt-3 pb-2">
                <code className="text-xs font-semibold text-primary bg-base-300 px-2 py-1 rounded whitespace-nowrap">
                  {c.cmd}
                </code>
              </td>
              <td className="text-sm text-base-content/80 pt-3 pb-2">
                {c.desc}
              </td>
              <td className="hidden md:table-cell text-xs text-base-content/50 pt-3 pb-2 italic">
                {c.obs}
              </td>
              <td className="pt-2 pb-2">
                <CopyButton text={c.cmd} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminGmPage({ user, gmLevel }: AdminGmPageProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [actionTab, setActionTab] = useState<
    'comunicacao' | 'moderacao' | 'personagem'
  >('comunicacao')

  // ── Comunicação ────────────────────────────────────────────────────────
  const [announceMsg, setAnnounceMsg] = useState('')
  const [notifyMsg, setNotifyMsg] = useState('')
  const [announceRes, setAnnounceRes] = useState<ActionResult>(null)
  const [notifyRes, setNotifyRes] = useState<ActionResult>(null)
  const [sendingAnn, setSendingAnn] = useState(false)
  const [sendingNot, setSendingNot] = useState(false)

  // ── Moderação ──────────────────────────────────────────────────────────
  const [banUser, setBanUser] = useState('')
  const [banDur, setBanDur] = useState('1d')
  const [banReason, setBanReason] = useState('')
  const [banRes, setBanRes] = useState<ActionResult>(null)
  const [banning, setBanning] = useState(false)

  const [unbanUser, setUnbanUser] = useState('')
  const [unbanRes, setUnbanRes] = useState<ActionResult>(null)
  const [unbanning, setUnbanning] = useState(false)

  const [kickChar, setKickChar] = useState('')
  const [kickReason, setKickReason] = useState('')
  const [kickRes, setKickRes] = useState<ActionResult>(null)
  const [kicking, setKicking] = useState(false)

  const [saveallRes, setSaveallRes] = useState<ActionResult>(null)
  const [savingAll, setSavingAll] = useState(false)

  // ── Personagem ─────────────────────────────────────────────────────────
  const [moneyChar, setMoneyChar] = useState('')
  const [moneyGold, setMoneyGold] = useState('')
  const [moneyRes, setMoneyRes] = useState<ActionResult>(null)
  const [settingMoney, setSettingMoney] = useState(false)

  const [levelChar, setLevelChar] = useState('')
  const [levelVal, setLevelVal] = useState('')
  const [levelRes, setLevelRes] = useState<ActionResult>(null)
  const [settingLevel, setSettingLevel] = useState(false)

  const [reviveChar, setReviveChar] = useState('')
  const [reviveRes, setReviveRes] = useState<ActionResult>(null)
  const [reviving, setReviving] = useState(false)

  // ── Handlers ───────────────────────────────────────────────────────────
  const submit = async (
    setter: (v: boolean) => void,
    resSetter: (v: ActionResult) => void,
    fn: () => Promise<ActionResult>
  ) => {
    setter(true)
    resSetter(null)
    try {
      resSetter(await fn())
    } catch {
      resSetter({ ok: false, message: 'Erro de conexão.' })
    } finally {
      setter(false)
    }
  }

  return (
    <DashboardLayout>
      <SEO title="Painel GM" path="/dashboard/admin-gm" noindex />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Painel GM</h1>
          </div>
          <p className="text-base-content/70">
            Atalhos e utilidades rápidas para operação da equipe.
          </p>
        </div>

        <div className="alert alert-info rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <div className="text-sm">
            Você está logado como <strong>{user.username}</strong> (GM {gmLevel}
            ).
          </div>
        </div>

        {/* ── Ações do Painel ───────────────────────────────────────────────── */}
        <div className="card bg-base-200 shadow-xl rounded-lg">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-1">
              <Shield className="h-6 w-6 text-warning" />
              <h2 className="text-2xl font-bold">Ações do Painel</h2>
            </div>
            <p className="text-sm text-base-content/60 mb-4">
              Execute ações diretamente pelo painel — sem precisar abrir o jogo.
            </p>

            <div className="tabs tabs-box mb-6 w-fit">
              {[
                {
                  id: 'comunicacao',
                  label: 'Comunicação'
                },
                {
                  id: 'moderacao',
                  label: 'Moderação'
                },
                {
                  id: 'personagem',
                  label: 'Personagem'
                }
              ].map(t => (
                <input
                  key={t.id}
                  type="radio"
                  name="admin_gm_action_tabs"
                  className="tab"
                  aria-label={t.label}
                  checked={actionTab === t.id}
                  onChange={() => setActionTab(t.id as typeof actionTab)}
                />
              ))}
            </div>

            {/* ── Comunicação ─────────────────────────────────────────────── */}
            {actionTab === 'comunicacao' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Announce */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-info" />
                    <h3 className="font-bold">.announce</h3>
                    <span className="text-xs text-base-content/40">
                      Mensagem no chat global
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    className="textarea textarea-bordered w-full text-sm"
                    placeholder="Ex.: Servidor entrará em manutenção em 10 minutos!"
                    value={announceMsg}
                    onChange={e => setAnnounceMsg(e.target.value)}
                  />
                  <button
                    className="btn btn-info btn-sm w-full gap-2"
                    disabled={sendingAnn || !announceMsg.trim()}
                    onClick={() =>
                      submit(setSendingAnn, setAnnounceRes, () =>
                        callSOAP({ action: 'announce', message: announceMsg })
                      )
                    }
                  >
                    {sendingAnn ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Megaphone className="h-4 w-4" />
                    )}
                    Enviar Announce
                  </button>
                  <ResultBadge result={announceRes} />
                </div>

                {/* Notify */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-warning" />
                    <h3 className="font-bold">.notify</h3>
                    <span className="text-xs text-base-content/40">
                      Popup na tela dos players
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    className="textarea textarea-bordered w-full text-sm"
                    placeholder="Ex.: Restart em 5 minutos! Salve seus personagens."
                    value={notifyMsg}
                    onChange={e => setNotifyMsg(e.target.value)}
                  />
                  <button
                    className="btn btn-warning btn-sm w-full gap-2"
                    disabled={sendingNot || !notifyMsg.trim()}
                    onClick={() =>
                      submit(setSendingNot, setNotifyRes, () =>
                        callSOAP({ action: 'notify', message: notifyMsg })
                      )
                    }
                  >
                    {sendingNot ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <BellRing className="h-4 w-4" />
                    )}
                    Enviar Notify
                  </button>
                  <ResultBadge result={notifyRes} />
                </div>

                {/* Saveall */}
                <div className="md:col-span-2 border-t border-base-300 pt-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4 text-success" />
                        <h3 className="font-bold">.saveall</h3>
                        <span className="text-xs text-base-content/40">
                          Salva todos os personagens online
                        </span>
                      </div>
                      <p className="text-xs text-base-content/40 mt-0.5 ml-6">
                        Use antes de restart ou manutenção.
                      </p>
                    </div>
                    <button
                      className="btn btn-success btn-sm gap-2"
                      disabled={savingAll}
                      onClick={() =>
                        submit(setSavingAll, setSaveallRes, () =>
                          callSOAP({ action: 'saveall' })
                        )
                      }
                    >
                      {savingAll ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Salvar Todos
                    </button>
                  </div>
                  <ResultBadge result={saveallRes} />
                </div>
              </div>
            )}

            {/* ── Moderação ────────────────────────────────────────────────── */}
            {actionTab === 'moderacao' && (
              <div className="space-y-6">
                {/* Ban */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Ban className="h-4 w-4 text-error" />
                    <h3 className="font-bold">Banir conta</h3>
                    <span className="badge badge-xs badge-success">DB</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      className="input input-bordered input-sm"
                      placeholder="Username da conta"
                      value={banUser}
                      onChange={e => setBanUser(e.target.value)}
                    />
                    <select
                      className="select select-bordered select-sm"
                      value={banDur}
                      onChange={e => setBanDur(e.target.value)}
                    >
                      {BAN_DURATIONS.map(d => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className="input input-bordered input-sm"
                      placeholder="Motivo"
                      value={banReason}
                      onChange={e => setBanReason(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-error btn-sm mt-3 gap-2"
                    disabled={banning || !banUser.trim() || !banReason.trim()}
                    onClick={() =>
                      submit(setBanning, setBanRes, () =>
                        callDB({
                          action: 'ban',
                          username: banUser,
                          duration: banDur,
                          reason: banReason
                        })
                      )
                    }
                  >
                    {banning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Ban className="h-4 w-4" />
                    )}
                    Banir
                  </button>
                  <ResultBadge result={banRes} />
                </div>

                <div className="divider my-0" />

                {/* Unban */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldOff className="h-4 w-4 text-success" />
                    <h3 className="font-bold">Remover ban</h3>
                    <span className="badge badge-xs badge-success">DB</span>
                  </div>
                  <div className="flex gap-3">
                    <input
                      className="input input-bordered input-sm flex-1 max-w-xs"
                      placeholder="Username da conta"
                      value={unbanUser}
                      onChange={e => setUnbanUser(e.target.value)}
                    />
                    <button
                      className="btn btn-success btn-sm gap-2"
                      disabled={unbanning || !unbanUser.trim()}
                      onClick={() =>
                        submit(setUnbanning, setUnbanRes, () =>
                          callDB({ action: 'unban', username: unbanUser })
                        )
                      }
                    >
                      {unbanning ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldOff className="h-4 w-4" />
                      )}
                      Remover Ban
                    </button>
                  </div>
                  <ResultBadge result={unbanRes} />
                </div>

                <div className="divider my-0" />

                {/* Kick */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <LogOut className="h-4 w-4 text-warning" />
                    <h3 className="font-bold">Kick</h3>
                    <span className="badge badge-xs badge-info">SOAP</span>
                    <span className="text-xs text-base-content/40">
                      Player precisa estar online
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <input
                      className="input input-bordered input-sm flex-1 max-w-xs"
                      placeholder="Nome do personagem"
                      value={kickChar}
                      onChange={e => setKickChar(e.target.value)}
                    />
                    <input
                      className="input input-bordered input-sm flex-1 max-w-xs"
                      placeholder="Motivo (opcional)"
                      value={kickReason}
                      onChange={e => setKickReason(e.target.value)}
                    />
                    <button
                      className="btn btn-warning btn-sm gap-2"
                      disabled={kicking || !kickChar.trim()}
                      onClick={() =>
                        submit(setKicking, setKickRes, () =>
                          callSOAP({
                            action: 'kick',
                            character: kickChar,
                            reason: kickReason
                          })
                        )
                      }
                    >
                      {kicking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      Kick
                    </button>
                  </div>
                  <ResultBadge result={kickRes} />
                </div>
              </div>
            )}

            {/* ── Personagem ───────────────────────────────────────────────── */}
            {actionTab === 'personagem' && (
              <div className="space-y-6">
                {/* Money */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Coins className="h-4 w-4 text-warning" />
                    <h3 className="font-bold">Modificar dinheiro</h3>
                    <span className="badge badge-xs badge-success">DB</span>
                  </div>
                  <p className="text-xs text-base-content/50 mb-3">
                    Valor em gold (positivo = adicionar, negativo = remover). 1
                    gold = 10.000 copper.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <input
                      className="input input-bordered input-sm w-48"
                      placeholder="Nome do personagem"
                      value={moneyChar}
                      onChange={e => setMoneyChar(e.target.value)}
                    />
                    <input
                      type="number"
                      className="input input-bordered input-sm w-36"
                      placeholder="Gold (ex: 1000)"
                      value={moneyGold}
                      onChange={e => setMoneyGold(e.target.value)}
                    />
                    <button
                      className="btn btn-warning btn-sm gap-2"
                      disabled={settingMoney || !moneyChar.trim() || !moneyGold}
                      onClick={() =>
                        submit(setSettingMoney, setMoneyRes, () =>
                          callDB({
                            action: 'money',
                            character: moneyChar,
                            gold: moneyGold
                          })
                        )
                      }
                    >
                      {settingMoney ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Coins className="h-4 w-4" />
                      )}
                      Aplicar
                    </button>
                  </div>
                  <ResultBadge result={moneyRes} />
                </div>

                <div className="divider my-0" />

                {/* Level */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="font-bold">Definir nível</h3>
                    <span className="badge badge-xs badge-success">DB</span>
                  </div>
                  <p className="text-xs text-base-content/50 mb-3">
                    Personagem deve reconectar para aplicar o novo nível.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <input
                      className="input input-bordered input-sm w-48"
                      placeholder="Nome do personagem"
                      value={levelChar}
                      onChange={e => setLevelChar(e.target.value)}
                    />
                    <input
                      type="number"
                      min={1}
                      max={80}
                      className="input input-bordered input-sm w-24"
                      placeholder="Nível (1–80)"
                      value={levelVal}
                      onChange={e => setLevelVal(e.target.value)}
                    />
                    <button
                      className="btn btn-primary btn-sm gap-2"
                      disabled={settingLevel || !levelChar.trim() || !levelVal}
                      onClick={() =>
                        submit(setSettingLevel, setLevelRes, () =>
                          callDB({
                            action: 'level',
                            character: levelChar,
                            level: levelVal
                          })
                        )
                      }
                    >
                      {settingLevel ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TrendingUp className="h-4 w-4" />
                      )}
                      Definir Nível
                    </button>
                  </div>
                  <ResultBadge result={levelRes} />
                </div>

                <div className="divider my-0" />

                {/* Revive */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <HeartPulse className="h-4 w-4 text-success" />
                    <h3 className="font-bold">Reviver personagem</h3>
                    <span className="badge badge-xs badge-info">SOAP</span>
                    <span className="text-xs text-base-content/40">
                      Personagem precisa estar online
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <input
                      className="input input-bordered input-sm w-48"
                      placeholder="Nome do personagem"
                      value={reviveChar}
                      onChange={e => setReviveChar(e.target.value)}
                    />
                    <button
                      className="btn btn-success btn-sm gap-2"
                      disabled={reviving || !reviveChar.trim()}
                      onClick={() =>
                        submit(setReviving, setReviveRes, () =>
                          callSOAP({ action: 'revive', character: reviveChar })
                        )
                      }
                    >
                      {reviving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <HeartPulse className="h-4 w-4" />
                      )}
                      Reviver
                    </button>
                  </div>
                  <ResultBadge result={reviveRes} />
                </div>
              </div>
            )}

            {/* Legenda */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-base-300 text-xs text-base-content/50">
              <span className="flex items-center gap-1.5">
                <Database className="h-3 w-3 text-success" />
                <span className="p-2 text-white badge badge-xs badge-success">
                  DB
                </span>{' '}
                Funciona mesmo com servidor offline
              </span>
              <span className="flex items-center gap-1.5">
                <Wifi className="h-3 w-3 text-info" />
                <span className="p-2 badge badge-xs badge-info text-white">
                  SOAP
                </span>{' '}
                Requer worldserver online e SOAP habilitado
              </span>
            </div>
          </div>
        </div>

        {/* ── Comandos GM ───────────────────────────────────────────────────── */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-1">
              <Terminal className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Comandos GM Essenciais</h2>
            </div>
            <p className="text-sm text-base-content/60 mb-4">
              Documento de referência rápida com os comandos mais usados para
              teste, administração e customização de servidor.
            </p>

            {/* Usage tip */}
            <div className="alert alert-warning alert-soft text-sm mb-6">
              <Terminal className="h-4 w-4 shrink-0" />
              <span>
                <strong>Uso rápido:</strong> no chat do jogo, todos os comandos
                começam com ponto. Ex.:{' '}
                <code className="bg-base-300 px-1 rounded">.gm on</code>. No
                console do worldserver, o ponto não é obrigatório. Alguns
                comandos exigem selecionar um player ou NPC antes de usar.
              </span>
            </div>

            {/* Kit rápido */}
            <div className="mb-6">
              <h3 className="font-bold text-sm text-base-content/60 uppercase tracking-wider mb-3">
                Kit rápido para o dia a dia
              </h3>
              <div className="bg-base-300 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {QUICK_KIT.map((cmd, i) => (
                  <div
                    key={i}
                    className="group flex items-center justify-between gap-1 bg-base-100/50 rounded px-2 py-1.5"
                  >
                    <code className="text-xs text-primary font-mono truncate">
                      {cmd}
                    </code>
                    <CopyButton text={cmd} />
                  </div>
                ))}
              </div>
            </div>

            {/* Nav tabs */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                className={`btn btn-xs ${activeSection === null ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveSection(null)}
              >
                Todos
              </button>
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  className={`btn btn-xs gap-1 ${activeSection === s.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() =>
                    setActiveSection(prev => (prev === s.id ? null : s.id))
                  }
                >
                  {s.icon}
                  {s.title}
                </button>
              ))}
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {SECTIONS.filter(
                s => activeSection === null || s.id === activeSection
              ).map(s => (
                <div key={s.id}>
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-base-300">
                    <span className="text-primary">{s.icon}</span>
                    <h3 className="font-bold">{s.title}</h3>
                    <span className="badge badge-xs badge-ghost ml-auto">
                      {s.commands.length} comandos
                    </span>
                  </div>
                  <CommandTable commands={s.commands} />
                </div>
              ))}
            </div>

            <p className="text-xs text-base-content/30 mt-4 pt-3 border-t border-base-300">
              * Clique no ícone de cópia (aparece ao passar o mouse) para copiar
              o comando diretamente.
            </p>
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
      'SELECT MAX(gmlevel) as gmlevel FROM acore_auth.account_access WHERE account_id = ?',
      [session.user.id]
    )) as any
  } catch {
    ;[access] = (await pool.query(
      'SELECT MAX(gmlevel) as gmlevel FROM acore_auth.account_access WHERE id = ?',
      [session.user.id]
    )) as any
  }

  const gmLevel =
    access.length > 0 && access[0]?.gmlevel ? Number(access[0].gmlevel) : 0

  if (gmLevel < 1) {
    return { redirect: { destination: '/dashboard', permanent: false } }
  }

  return { props: { user: session.user, gmLevel } }
}
