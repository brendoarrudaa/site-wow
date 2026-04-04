import { useEffect, useState } from 'react'
import { buildIdempotencyKey } from '../../../lib/idempotency'
import {
  User,
  Mail,
  Lock,
  Shield,
  Clock,
  Calendar,
  AlertTriangle,
  Swords,
  Loader2,
  Check,
  X
} from 'lucide-react'

interface AccountInfo {
  joindate: string
  lastLogin: string | null
  lastIp: string
  locked: boolean
  failedLogins: number
  totalCharacters: number
}

interface ContaPageProps {
  username: string
  email: string
}

const ContaPage = ({ username = '', email = '' }: ContaPageProps) => {
  const [info, setInfo] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Password change
  const [passwordDialog, setPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/account/info')
      .then(r => r.json())
      .then(setInfo)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Preencha todos os campos.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': buildIdempotencyKey(
            'account-change-password',
            username || 'self'
          )
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()

      if (!res.ok) {
        setPasswordError(data.error || 'Erro ao alterar senha.')
        return
      }

      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setPasswordDialog(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch {
      setPasswordError('Erro de conexão.')
    } finally {
      setPasswordLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif glow-text">
          Configurações da Conta
        </h1>
        <p className="text-sm text-base-content/60">
          Gerencie suas informações e segurança
        </p>
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
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold">{username}</h3>
                <p className="text-base-content/60">{email || 'Sem e-mail'}</p>
                {info && (
                  <span className="badge badge-outline mt-2 gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    Membro desde {formatDate(info.joindate)}
                  </span>
                )}
              </div>
            </div>

            <div className="h-px bg-base-300" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-base-content/60">
                  Nome de Usuário
                </label>
                <input
                  value={username}
                  disabled
                  className="input input-bordered w-full bg-base-200 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-base-content/60">
                  Email
                </label>
                <input
                  value={email || '—'}
                  disabled
                  className="input input-bordered w-full bg-base-200 text-sm"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <span>
                O nome de usuário não pode ser alterado. Para alterar o email,
                entre em contato com o suporte.
              </span>
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
                  <p className="text-sm text-base-content/50">
                    Altere a senha da sua conta (site e jogo)
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPasswordDialog(true)
                  setPasswordError('')
                  setPasswordSuccess(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="btn btn-outline btn-sm"
              >
                Alterar Senha
              </button>
            </div>

            <div className="h-px bg-base-300" />

            {/* Account status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-200">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Status da Conta</p>
                  <p className="text-sm text-base-content/50">
                    {loading
                      ? 'Carregando…'
                      : info?.locked
                        ? 'Conta bloqueada'
                        : 'Conta ativa'}
                  </p>
                </div>
              </div>
              {!loading && info && (
                <span
                  className={`badge badge-outline text-xs ${
                    info.locked
                      ? 'border-error text-error'
                      : 'border-success text-success'
                  }`}
                >
                  {info.locked ? 'Bloqueada' : 'Ativa'}
                </span>
              )}
            </div>

            {!loading && info && info.failedLogins > 0 && (
              <>
                <div className="h-px bg-base-300" />
                <div className="flex items-start gap-3 rounded-lg border border-error/50 bg-error/10 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                  <span>
                    {info.failedLogins} tentativa(s) de login falha(s)
                    registrada(s).
                    {info.failedLogins >= 10 &&
                      ' A conta foi bloqueada automaticamente por segurança.'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-6">
          {/* Account stats */}
          <div className="card-fantasy p-4 space-y-3">
            <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider">
              Detalhes da Conta
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-6 text-base-content/30">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : info ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-base-content/60">
                    <Swords className="h-3.5 w-3.5" />
                    Personagens
                  </span>
                  <span className="font-bold">{info.totalCharacters}</span>
                </div>

                <div className="h-px bg-base-300" />

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-base-content/60">
                    <Calendar className="h-3.5 w-3.5" />
                    Cadastro
                  </span>
                  <span className="text-sm">{formatDate(info.joindate)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-base-content/60">
                    <Clock className="h-3.5 w-3.5" />
                    Último Login
                  </span>
                  <span className="text-sm">{formatDate(info.lastLogin)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-base-content/60">
                    <Mail className="h-3.5 w-3.5" />
                    Último IP
                  </span>
                  <span className="text-sm font-mono text-base-content/50">
                    {info.lastIp || '—'}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-base-content/40">
                Erro ao carregar dados.
              </p>
            )}
          </div>

          {/* Info card */}
          <div className="card-fantasy p-4 space-y-3">
            <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider">
              Dica de Segurança
            </h3>
            <p className="text-sm text-base-content/60">
              Use uma senha forte e exclusiva para sua conta. A mesma senha é
              usada para entrar no site e no cliente do jogo.
            </p>
          </div>
        </div>
      </div>

      {/* Change password modal */}
      {passwordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setPasswordDialog(false)}
          />
          <div className="relative z-50 w-full max-w-md rounded-lg border border-base-300 bg-base-100 p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Alterar Senha</h2>
                <p className="text-sm text-base-content/60">
                  A nova senha vale para o site e para o cliente do jogo
                </p>
              </div>
              <button
                className="btn btn-ghost btn-sm btn-square"
                onClick={() => setPasswordDialog(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {passwordSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6 text-success">
                <Check className="h-10 w-10" />
                <p className="font-medium">Senha alterada com sucesso!</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-base-content/60">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full text-sm"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-base-content/60">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full text-sm"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-base-content/60">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      className="input input-bordered w-full text-sm"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                {passwordError && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-error/50 bg-error/10 p-2 text-sm text-error">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {passwordError}
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setPasswordDialog(false)}
                    disabled={passwordLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Salvar'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ContaPage
