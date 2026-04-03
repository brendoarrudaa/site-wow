import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout/Layout'
import SEO from '@/components/SEO'
import { Shield, Mail, KeyRound, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react'

const RecuperarSenha = () => {
  const router = useRouter()
  const { token } = router.query

  // --- Solicitar reset ---
  const [email, setEmail] = useState('')
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestDone, setRequestDone] = useState(false)
  const [requestError, setRequestError] = useState('')

  const handleRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setRequestError('')
    setRequestLoading(true)
    try {
      const res = await fetch('/api/account/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) setRequestError(data.error || 'Erro ao solicitar.')
      else setRequestDone(true)
    } catch {
      setRequestError('Erro de conexão. Tente novamente.')
    } finally {
      setRequestLoading(false)
    }
  }

  // --- Confirmar nova senha ---
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [confirmDone, setConfirmDone] = useState(false)
  const [confirmError, setConfirmError] = useState('')

  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setConfirmError('')
    if (password !== confirm) {
      setConfirmError('As senhas não coincidem.')
      return
    }
    setConfirmLoading(true)
    try {
      const res = await fetch('/api/account/reset-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) setConfirmError(data.error || 'Erro ao redefinir.')
      else setConfirmDone(true)
    } catch {
      setConfirmError('Erro de conexão. Tente novamente.')
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <Layout>
      <SEO
        title="Recuperar Senha"
        description="Redefina sua senha no Azeroth Legacy."
        path="/recuperar-senha"
      />

      <section className="page-section">
        <div className="page-container flex items-center justify-center py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-linear-to-br from-gold-light via-gold to-accent shadow-lg shadow-gold/20 mb-4">
                <KeyRound className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold font-serif text-foreground glow-text">
                Recuperar Senha
              </h1>
              <p className="text-muted-foreground mt-2">
                {token ? 'Crie uma nova senha para sua conta.' : 'Informe seu e-mail para receber o link de redefinição.'}
              </p>
            </div>

            <div className="card-fantasy p-6 md:p-8">

              {/* === FLUXO 1: Solicitar link === */}
              {!token && (
                <>
                  {requestDone ? (
                    <div className="text-center space-y-4 py-2">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-online/10 mx-auto">
                        <Check className="h-6 w-6 text-online" />
                      </div>
                      <p className="text-sm text-foreground">
                        Se este e-mail estiver cadastrado, você receberá as instruções em breve.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Verifique sua caixa de spam caso não receba o e-mail.
                      </p>
                      <Link href="/cadastro" className="btn btn-sm btn-outline border-border-strong w-full mt-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar ao login
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleRequest} className="space-y-5">
                      <div>
                        <label htmlFor="reset-email" className="block text-sm font-medium text-foreground mb-2">
                          E-mail da conta
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input
                            id="reset-email"
                            type="email"
                            className="input input-bordered w-full pl-10"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {requestError && (
                        <p className="text-sm text-warning bg-warning/10 border border-warning/30 rounded-lg px-4 py-3">
                          {requestError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={requestLoading}
                        className="btn bg-gold text-black hover:bg-gold/90 border-0 w-full h-11 text-base disabled:opacity-60"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {requestLoading ? 'Enviando...' : 'Enviar link de recuperação'}
                      </button>

                      <Link href="/cadastro" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Voltar ao login
                      </Link>
                    </form>
                  )}
                </>
              )}

              {/* === FLUXO 2: Nova senha (via token) === */}
              {token && (
                <>
                  {confirmDone ? (
                    <div className="text-center space-y-4 py-2">
                      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-online/10 mx-auto">
                        <Check className="h-6 w-6 text-online" />
                      </div>
                      <p className="text-sm text-foreground font-medium">Senha redefinida com sucesso!</p>
                      <p className="text-xs text-muted-foreground">Agora você pode entrar com sua nova senha no site e no jogo.</p>
                      <Link href="/cadastro" className="btn bg-gold text-black hover:bg-gold/90 border-0 w-full h-11 text-base">
                        <Shield className="h-4 w-4 mr-2" />
                        Ir para o login
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleConfirm} className="space-y-5">
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-2">
                          Nova senha
                        </label>
                        <div className="relative">
                          <input
                            id="new-password"
                            type={showPassword ? 'text' : 'password'}
                            className="input input-bordered w-full pr-10"
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            minLength={6}
                            maxLength={16}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-2">
                          Confirmar nova senha
                        </label>
                        <div className="relative">
                          <input
                            id="confirm-password"
                            type={showConfirm ? 'text' : 'password'}
                            className="input input-bordered w-full pr-10"
                            placeholder="Repita a senha"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            minLength={6}
                            maxLength={16}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {confirmError && (
                        <p className="text-sm text-warning bg-warning/10 border border-warning/30 rounded-lg px-4 py-3">
                          {confirmError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={confirmLoading}
                        className="btn bg-gold text-black hover:bg-gold/90 border-0 w-full h-11 text-base disabled:opacity-60"
                      >
                        <KeyRound className="h-4 w-4 mr-2" />
                        {confirmLoading ? 'Salvando...' : 'Redefinir senha'}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default RecuperarSenha
