import Link from 'next/link'
import Layout from '@/components/Layout/Layout'
import SEO from '@/components/SEO'
import { Swords, Crown, Coins, Shield, LogOut, User, Trophy } from 'lucide-react'

// TODO: i18n — strings em pt-BR fixo, aguardando chaves dashboard.* nos locales
// TODO: substituir dados mock por API real quando sistema de contas estiver ativo
const mockCharacters = [
  {
    name: 'Arthasx',
    class: 'Death Knight',
    race: 'Humano',
    level: 80,
    gold: 12450,
    icon: Swords,
    classColor: 'text-red-400',
  },
  {
    name: 'Frostmage',
    class: 'Mage',
    race: 'Elfo Sangrento',
    level: 73,
    gold: 3200,
    icon: Crown,
    classColor: 'text-blue-400',
  },
  {
    name: 'Healbot',
    class: 'Priest',
    race: 'Draenei',
    level: 45,
    gold: 580,
    icon: Shield,
    classColor: 'text-yellow-400',
  },
]

const Dashboard = () => {
  const totalGold = mockCharacters.reduce((sum, c) => sum + c.gold, 0)
  const maxLevel = Math.max(...mockCharacters.map(c => c.level))

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
                <h1 className="text-2xl font-bold font-serif text-foreground glow-text">Bem-vindo, Jogador</h1>
                <p className="text-muted-foreground text-sm">Gerencie seus personagens e acompanhe seu progresso</p>
              </div>
            </div>
            <Link
              href="/cadastro"
              className="btn btn-sm btn-outline border-border-strong text-muted-foreground hover:text-foreground gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card-fantasy p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Swords className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Personagens</p>
                <p className="text-2xl font-bold text-foreground">{mockCharacters.length}</p>
              </div>
            </div>
            <div className="card-fantasy p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maior Level</p>
                <p className="text-2xl font-bold text-foreground">{maxLevel}</p>
              </div>
            </div>
            <div className="card-fantasy p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gold Total</p>
                <p className="text-2xl font-bold text-foreground">{totalGold.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Characters */}
          <h2 className="text-xl font-bold font-serif text-foreground mb-4">Seus Personagens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCharacters.map(char => {
              const Icon = char.icon
              return (
                <div key={char.name} className="card-fantasy p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <Icon className={`h-5 w-5 ${char.classColor}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{char.name}</h3>
                      <p className={`text-sm ${char.classColor}`}>{char.class} — {char.race}</p>
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

export default Dashboard
