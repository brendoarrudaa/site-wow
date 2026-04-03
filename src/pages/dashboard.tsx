import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { getIronSession } from 'iron-session'
import Link from 'next/link'
import Layout from '@/components/Layout/Layout'
import SEO from '@/components/SEO'
import { Swords, Crown, Coins, Shield, LogOut, User, Trophy } from 'lucide-react'
import { sessionOptions } from '@/lib/session'

const CLASS_ICON: Record<string, typeof Swords> = {
  'Death Knight': Swords,
  'Warrior': Swords,
  'Paladin': Shield,
  'Priest': Shield,
  'Mage': Crown,
  'Warlock': Crown,
  'Hunter': Swords,
  'Rogue': Swords,
  'Shaman': Crown,
  'Druid': Crown,
}

const CLASS_COLOR: Record<string, string> = {
  'Death Knight': 'text-red-400',
  'Warrior': 'text-orange-400',
  'Paladin': 'text-pink-400',
  'Priest': 'text-yellow-100',
  'Mage': 'text-blue-400',
  'Warlock': 'text-purple-400',
  'Hunter': 'text-green-400',
  'Rogue': 'text-yellow-400',
  'Shaman': 'text-blue-300',
  'Druid': 'text-orange-300',
}

type Character = {
  guid: number
  name: string
  race: string
  class: string
  level: number
  gold: number
  online: boolean
}

type Props = {
  username: string
  email: string
}

const Dashboard = ({ username, email }: Props) => {
  const router = useRouter()
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/account/characters')
      .then(r => r.json())
      .then(data => setCharacters(data.characters || []))
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/account/logout', { method: 'POST' })
    router.push('/cadastro')
  }

  const totalGold = characters.reduce((sum, c) => sum + c.gold, 0)
  const maxLevel = characters.length > 0 ? Math.max(...characters.map(c => c.level)) : 0

  return (
    <Layout>
      <SEO title="Dashboard" description="Painel do jogador no Azeroth Legacy." path="/dashboard" />

      <section className="page-section">
        <div className="page-container py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-linear-to-br from-gold-light via-gold to-accent flex items-center justify-center shadow-lg shadow-gold/20">
                <User className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-serif text-foreground glow-text">
                  Bem-vindo, {username}
                </h1>
                <p className="text-muted-foreground text-sm">{email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline border-border-strong text-muted-foreground hover:text-foreground gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card-fantasy p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Swords className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Personagens</p>
                <p className="text-2xl font-bold text-foreground">{characters.length}</p>
              </div>
            </div>
            <div className="card-fantasy p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maior Level</p>
                <p className="text-2xl font-bold text-foreground">{maxLevel || '—'}</p>
              </div>
            </div>
            <div className="card-fantasy p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gold Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalGold.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Characters */}
          <h2 className="text-xl font-bold font-serif text-foreground mb-4">Seus Personagens</h2>

          {loading && (
            <p className="text-muted-foreground text-sm">Carregando personagens...</p>
          )}

          {!loading && characters.length === 0 && (
            <div className="card-fantasy p-8 text-center text-muted-foreground">
              <Swords className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Nenhum personagem encontrado.</p>
              <p className="text-sm mt-1">Entre no jogo e crie seu primeiro personagem!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map(char => {
              const Icon = CLASS_ICON[char.class] || Swords
              const color = CLASS_COLOR[char.class] || 'text-muted-foreground'
              return (
                <div key={char.guid} className="card-fantasy p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground truncate">{char.name}</h3>
                        {char.online && (
                          <span className="h-2 w-2 rounded-full bg-green-400 shrink-0" title="Online" />
                        )}
                      </div>
                      <p className={`text-sm ${color}`}>{char.class} — {char.race}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-semibold text-foreground">{char.level} / 80</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-primary to-gold rounded-full transition-all"
                        style={{ width: `${(char.level / 80) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Gold</span>
                    <span className="font-semibold text-gold flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5" />
                      {char.gold.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession<{ user?: { id: number; username: string; email: string } }>(req, res, sessionOptions)

  if (!session.user) {
    return {
      redirect: { destination: '/cadastro', permanent: false },
    }
  }

  return {
    props: {
      username: session.user.username,
      email: session.user.email,
    },
  }
}

export default Dashboard
