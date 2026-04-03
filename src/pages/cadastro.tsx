import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout/Layout'
import SEO from '@/components/SEO'
import { Shield, Gamepad2, Eye, EyeOff, LogIn, UserPlus, Mail, RotateCcw, Check } from 'lucide-react'

// TODO: substituir strings por t("register.*") quando i18n for aplicado nas páginas

type Step = 'form' | 'verify'

const Register = () => {
  const router = useRouter()

  // ── step controla se estamos no formulário ou na verificação ──────────────
  const [step, setStep] = useState<Step>('form')
  const [pendingEmail, setPendingEmail] = useState('')

  // ── estado compartilhado ──────────────────────────────────────────────────
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ── login ─────────────────────────────────────────────────────────────────
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })

  // ── register ──────────────────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // ── verificação ───────────────────────────────────────────────────────────
  const [code, setCode] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [cooldown, setCooldown] = useState(60) // começa com 60s após cadastro
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (step !== 'verify') return
    setCooldown(60)
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(cooldownRef.current!)
  }, [step])

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginForm.username, password: loginForm.password }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Erro ao entrar.')
      else router.push('/dashboard')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }
    if (!agreed) {
      setError('Aceite as regras para continuar.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/account/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta.')
      } else {
        // 202 → conta pendente, ir para etapa de verificação
        setPendingEmail(data.email || registerForm.email.toLowerCase().trim())
        setStep('verify')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setVerifyError('')
    setVerifyLoading(true)
    try {
      const res = await fetch('/api/account/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setVerifyError(data.error || 'Código inválido.')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setVerifyError('Erro de conexão. Tente novamente.')
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return
    setVerifyError('')
    setResendLoading(true)
    try {
      const res = await fetch('/api/account/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        setVerifyError(data.error || 'Erro ao reenviar.')
        if (data.cooldown) setCooldown(data.cooldown)
      } else {
        setCode('')
        setCooldown(60)
        cooldownRef.current = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) { clearInterval(cooldownRef.current!); return 0 }
            return prev - 1
          })
        }, 1000)
      }
    } catch {
      setVerifyError('Erro de conexão. Tente novamente.')
    } finally {
      setResendLoading(false)
    }
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <SEO
        title="Conta"
        description="Crie sua conta ou faça login no Azeroth Legacy."
        path="/cadastro"
      />

      <section className="page-section">
        <div className="page-container flex items-center justify-center py-12">
          <div className="w-full max-w-md">

            {/* ══ ETAPA DE VERIFICAÇÃO ══════════════════════════════════════ */}
            {step === 'verify' && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-linear-to-br from-gold-light via-gold to-accent shadow-lg shadow-gold/20 mb-4">
                    <Mail className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h1 className="text-3xl font-bold font-serif text-foreground glow-text">Confirme seu e-mail</h1>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Enviamos um código de 6 dígitos para<br />
                    <span className="text-foreground font-medium">{pendingEmail}</span>
                  </p>
                </div>

                <div className="card-fantasy p-6 md:p-8">
                  <form onSubmit={handleVerify} className="space-y-5">
                    <div>
                      <label htmlFor="verify-code" className="block text-sm font-medium text-foreground mb-2">
                        Código de verificação
                      </label>
                      <input
                        id="verify-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        className="input input-bordered w-full text-center text-2xl font-mono tracking-[0.5em]"
                        placeholder="000000"
                        value={code}
                        onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">O código expira em 10 minutos.</p>
                    </div>

                    {verifyError && (
                      <p className="text-sm text-warning bg-warning/10 border border-warning/30 rounded-lg px-4 py-3">
                        {verifyError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={verifyLoading || code.length !== 6}
                      className="btn bg-gold text-black hover:bg-gold/90 border-0 w-full h-11 text-base disabled:opacity-60"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {verifyLoading ? 'Verificando...' : 'Confirmar código'}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={cooldown > 0 || resendLoading}
                        className="flex items-center justify-center gap-1.5 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {resendLoading
                          ? 'Reenviando...'
                          : cooldown > 0
                          ? `Reenviar código (${cooldown}s)`
                          : 'Reenviar código'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {/* ══ FORMULÁRIO DE LOGIN / CADASTRO ═══════════════════════════ */}
            {step === 'form' && (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-linear-to-br from-gold-light via-gold to-accent shadow-lg shadow-gold/20 mb-4">
                    <Shield className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h1 className="text-3xl font-bold font-serif text-foreground glow-text">Sua Conta</h1>
                  <p className="text-muted-foreground mt-2">Entre em Northrend e comece sua jornada</p>
                </div>

                <div className="card-fantasy p-6 md:p-8">
                  {/* Tabs */}
                  <div className="grid grid-cols-2 rounded-lg bg-muted/40 p-1 mb-6">
                    <button
                      onClick={() => { setTab('login'); setError('') }}
                      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                        tab === 'login' ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <LogIn className="h-4 w-4" />
                      Entrar
                    </button>
                    <button
                      onClick={() => { setTab('register'); setError('') }}
                      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                        tab === 'register' ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <UserPlus className="h-4 w-4" />
                      Criar Conta
                    </button>
                  </div>

                  {/* ── Login ─────────────────────────────────────────────── */}
                  {tab === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                        <label htmlFor="login-username" className="block text-sm font-medium text-foreground mb-2">
                          Nome de Usuário
                        </label>
                        <div className="relative">
                          <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input
                            id="login-username"
                            className="input input-bordered w-full pl-10"
                            placeholder="Seu nome de usuário"
                            value={loginForm.username}
                            onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="login-password" className="block text-sm font-medium text-foreground mb-2">
                          Senha
                        </label>
                        <div className="relative">
                          <input
                            id="login-password"
                            type={showLoginPassword ? 'text' : 'password'}
                            className="input input-bordered w-full pr-10"
                            placeholder="Sua senha"
                            value={loginForm.password}
                            onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <p className="text-sm text-warning bg-warning/10 border border-warning/30 rounded-lg px-4 py-3">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn bg-gold text-black hover:bg-gold/90 border-0 w-full h-11 text-base disabled:opacity-60"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        {loading ? 'Entrando...' : 'Entrar'}
                      </button>

                      <div className="text-center">
                        <Link href="/recuperar-senha" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          Esqueci minha senha
                        </Link>
                      </div>
                    </form>
                  )}

                  {/* ── Register ──────────────────────────────────────────── */}
                  {tab === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-5">
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                          Nome de Usuário *
                        </label>
                        <div className="relative">
                          <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input
                            id="username"
                            className="input input-bordered w-full pl-10"
                            placeholder="Seu nome no jogo"
                            value={registerForm.username}
                            onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                          E-mail *
                        </label>
                        <input
                          id="email"
                          type="email"
                          className="input input-bordered w-full"
                          placeholder="seu@email.com"
                          value={registerForm.email}
                          onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                          Senha *
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            className="input input-bordered w-full pr-10"
                            placeholder="Mínimo 6 caracteres"
                            value={registerForm.password}
                            onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                            minLength={6}
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
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                          Confirmar Senha *
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            className="input input-bordered w-full pr-10"
                            placeholder="Repita a senha"
                            value={registerForm.confirmPassword}
                            onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                            minLength={6}
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

                      <div className="flex items-start gap-3">
                        <input
                          id="rules"
                          type="checkbox"
                          className="checkbox checkbox-sm mt-0.5"
                          checked={agreed}
                          onChange={e => setAgreed(e.target.checked)}
                        />
                        <label htmlFor="rules" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                          Li e aceito as{' '}
                          <Link href="/regras" className="text-primary hover:underline">
                            regras do servidor
                          </Link>
                        </label>
                      </div>

                      {error && (
                        <p className="text-sm text-warning bg-warning/10 border border-warning/30 rounded-lg px-4 py-3">
                          {error}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn bg-gold text-black hover:bg-gold/90 border-0 w-full h-11 text-base disabled:opacity-60"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {loading ? 'Enviando...' : 'Criar Conta'}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Register
