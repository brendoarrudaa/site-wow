import { useState } from "react"
import {
  User, Mail, Lock, Shield, Smartphone, Clock,
  Globe, Calendar, AlertTriangle, Copy, Gift, Share2,
} from "lucide-react"
import { mockUser } from "@/lib/mock-data"

const referralCode = "FROST-" + mockUser.username.toUpperCase().slice(0, 4) + "-2024"

const ContaPage = () => {
  const [passwordDialog, setPasswordDialog] = useState(false)
  const [notifPromo, setNotifPromo] = useState(true)
  const [notifTickets, setNotifTickets] = useState(true)
  const [notifSecurity, setNotifSecurity] = useState(true)
  const [notifNewsletter, setNotifNewsletter] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif glow-text">Configurações da Conta</h1>
        <p className="text-sm text-base-content/60">Gerencie suas informações e segurança</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main — 2 cols */}
        <div className="space-y-6 lg:col-span-2">

          {/* Profile Info */}
          <div className="card-fantasy p-6 space-y-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h2 className="font-bold">Informações do Perfil</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-content text-2xl font-bold">
                {mockUser.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold">{mockUser.username}</h3>
                <p className="text-base-content/60">{mockUser.email}</p>
                <span className="badge badge-outline mt-2 gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  Membro desde {mockUser.accountCreated}
                </span>
              </div>
            </div>

            <div className="h-px bg-base-300" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-base-content/60">Nome de Usuário</label>
                <input
                  value={mockUser.username}
                  disabled
                  className="input input-bordered w-full bg-base-200 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-base-content/60">Email</label>
                <input
                  value={mockUser.email}
                  disabled
                  className="input input-bordered w-full bg-base-200 text-sm"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <span>Para alterar seu nome de usuário ou email, entre em contato com o suporte.</span>
            </div>
          </div>

          {/* Security */}
          <div className="card-fantasy p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="font-bold">Segurança</h2>
            </div>

            {/* Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-200">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Senha</p>
                  <p className="text-sm text-base-content/50">Última alteração há 30 dias</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordDialog(true)}
                className="btn btn-outline btn-sm"
              >
                Alterar Senha
              </button>
            </div>

            <div className="h-px bg-base-300" />

            {/* 2FA */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-200">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Autenticação 2FA</p>
                  <p className="text-sm text-base-content/50">Adicione uma camada extra de segurança</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge badge-outline border-error text-error text-xs">Desativado</span>
                <button className="btn btn-outline btn-sm">Ativar</button>
              </div>
            </div>

            <div className="h-px bg-base-300" />

            {/* Sessions */}
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-200">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Sessões Ativas</p>
                  <p className="text-sm text-base-content/50">Gerencie onde você está logado</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-base-300 p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    <div>
                      <p className="text-sm font-medium">Windows — Chrome</p>
                      <p className="text-xs text-base-content/50">São Paulo, BR — Ativo agora</p>
                    </div>
                  </div>
                  <span className="badge badge-outline border-success text-success text-xs">Atual</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-base-300 p-3">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-base-content/30" />
                    <div>
                      <p className="text-sm font-medium">Android — App</p>
                      <p className="text-xs text-base-content/50">São Paulo, BR — Há 2 dias</p>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-xs text-error">Encerrar</button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card-fantasy p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="font-bold">Notificações</h2>
            </div>

            {[
              { label: "Emails de Promoções", desc: "Receba ofertas e novidades da loja", value: notifPromo, set: setNotifPromo },
              { label: "Atualizações de Tickets", desc: "Notificações sobre seus tickets de suporte", value: notifTickets, set: setNotifTickets },
              { label: "Alertas de Segurança", desc: "Avisos sobre atividades suspeitas", value: notifSecurity, set: setNotifSecurity },
              { label: "Newsletter do Servidor", desc: "Novidades e atualizações do servidor", value: notifNewsletter, set: setNotifNewsletter },
            ].map(({ label, desc, value, set }, i, arr) => (
              <div key={label}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-base-content/50">{desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    checked={value}
                    onChange={(e) => set(e.target.checked)}
                  />
                </div>
                {i < arr.length - 1 && <div className="mt-4 h-px bg-base-300" />}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-6">
          {/* Account stats */}
          <div className="card-fantasy p-4 space-y-3">
            <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider">Estatísticas</h3>
            {[
              { label: "Personagens", value: mockUser.characters.length, color: "" },
              { label: "Pontos de Doação", value: mockUser.donationPoints, color: "text-primary" },
              { label: "Pontos de Voto", value: mockUser.votePoints, color: "text-secondary" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-base-content/60">{label}</span>
                <span className={`font-bold ${color}`}>{value}</span>
              </div>
            ))}
            <div className="h-px bg-base-300" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-base-content/60">Último Login</span>
              <span>{mockUser.lastLogin}</span>
            </div>
          </div>

          {/* Referral */}
          <div className="card-fantasy border-primary/30 bg-primary/5 p-4 space-y-4">
            <div>
              <h3 className="flex items-center gap-2 font-bold">
                <Gift className="h-5 w-5 text-primary" />
                Indique Amigos
              </h3>
              <p className="mt-1 text-sm text-base-content/60">
                Ganhe 100 DP por cada amigo que se cadastrar
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-base-content/50">Seu código de indicação</label>
              <div className="flex gap-2">
                <input
                  value={referralCode}
                  readOnly
                  className="input input-bordered input-sm w-full font-mono bg-base-100 text-xs"
                />
                <button className="btn btn-outline btn-sm btn-square">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-base-content/60">Amigos indicados</span>
              <span className="font-bold">3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-base-content/60">DP ganhos</span>
              <span className="font-bold text-primary">300</span>
            </div>
            <button className="btn btn-outline btn-sm w-full gap-2">
              <Share2 className="h-4 w-4" />
              Compartilhar
            </button>
          </div>

          {/* Danger zone */}
          <div className="card-fantasy border-error/30 p-4 space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-error">
              <AlertTriangle className="h-4 w-4" />
              Zona de Perigo
            </h3>
            <button className="btn btn-outline btn-sm btn-error w-full">
              Desativar Conta
            </button>
            <p className="text-center text-xs text-base-content/50">
              Isso irá desativar temporariamente sua conta. Você pode reativar a qualquer momento.
            </p>
          </div>
        </div>
      </div>

      {/* Change password modal */}
      {passwordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setPasswordDialog(false)} />
          <div className="relative z-50 w-full max-w-md rounded-lg border border-base-300 bg-base-100 p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-semibold">Alterar Senha</h2>
            <p className="mb-5 text-sm text-base-content/60">
              Digite sua senha atual e a nova senha
            </p>
            <div className="space-y-4">
              {["Senha Atual", "Nova Senha", "Confirmar Nova Senha"].map((label) => (
                <div key={label} className="space-y-1">
                  <label className="text-xs font-medium text-base-content/60">{label}</label>
                  <input type="password" className="input input-bordered w-full text-sm" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setPasswordDialog(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary btn-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContaPage
