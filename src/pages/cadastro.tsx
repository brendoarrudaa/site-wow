import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout/Layout'
import SEO from '@/components/SEO'
import { Shield, Gamepad2, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'

// TODO: substituir strings por t("register.*") quando i18n for aplicado nas páginas
const Register = () => {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  })

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
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
        setSuccess(`Conta "${data.username}" criada com sucesso! Você já pode entrar no jogo.`)
        setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' })
        setAgreed(false)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao entrar.')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

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
                    tab === 'login'
                      ? 'bg-card text-foreground font-medium shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  Entrar
                </button>
                <button
                  onClick={() => { setTab('register'); setError('') }}
                  className={`flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                    tab === 'register'
                      ? 'bg-card text-foreground font-medium shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  Criar Conta
                </button>
              </div>

              {/* Login */}
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

                  <button type="submit" disabled={loading} className="btn bg-gold text-black hover:bg-gold/90 border-0 w-full h-11 text-base disabled:opacity-60">
                    <LogIn className="h-4 w-4 mr-2" />
                    {loading ? 'Entrando...' : 'Entrar'}
                  </button>
                </form>
              )}

              {/* Register */}
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

                  {success && (
                    <p className="text-sm text-success bg-success/10 border border-success/30 rounded-lg px-4 py-3">
                      {success}
                    </p>
                  )}

                  <button type="submit" disabled={loading} className="btn bg-gold text-black hover:bg-gold/90 border-0 w-full h-11 text-base disabled:opacity-60">
                    <Shield className="h-4 w-4 mr-2" />
                    {loading ? 'Criando conta...' : 'Criar Conta'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Register
