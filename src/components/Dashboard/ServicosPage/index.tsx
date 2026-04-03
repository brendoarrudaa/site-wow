import { useEffect, useState } from "react"
import {
  MapPin,
  Repeat,
  Users,
  Edit,
  Palette,
  RotateCcw,
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Loader2,
  Swords,
  X,
} from "lucide-react"

interface RealCharacter {
  guid: number
  name: string
  race: string
  class: string
  level: number
  gold: number
  online: boolean
}

const CLASS_COLORS: Record<string, string> = {
  "Death Knight": "text-red-500",
  Druid: "text-orange-400",
  Hunter: "text-green-400",
  Mage: "text-cyan-400",
  Paladin: "text-pink-400",
  Priest: "text-white",
  Rogue: "text-yellow-400",
  Shaman: "text-blue-400",
  Warlock: "text-purple-400",
  Warrior: "text-amber-600",
}

const HORDE_RACES = new Set([
  "Orc", "Morto-Vivo", "Tauren", "Troll", "Elfo Sangrento", "Goblin",
])

interface ServiceDef {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  free: boolean
}

const SERVICES: ServiceDef[] = [
  {
    id: "unstuck",
    name: "Destravar Personagem",
    description: "Teleporte seu personagem preso para a cidade inicial da sua facção.",
    icon: MapPin,
    free: true,
  },
  {
    id: "level-reset",
    name: "Reset de Talentos",
    description: "Resete os talentos do seu personagem gratuitamente.",
    icon: RotateCcw,
    free: true,
  },
  {
    id: "name-change",
    name: "Troca de Nome",
    description: "Escolha um novo nome para o seu personagem no próximo login.",
    icon: Edit,
    free: true,
  },
  {
    id: "appearance",
    name: "Mudança de Aparência",
    description: "Altere a aparência visual do seu personagem no próximo login.",
    icon: Palette,
    free: true,
  },
  {
    id: "race-change",
    name: "Troca de Raça",
    description: "Mude a raça do seu personagem mantendo a mesma facção.",
    icon: Users,
    free: true,
  },
  {
    id: "faction-change",
    name: "Troca de Facção",
    description: "Mude seu personagem de Horda para Aliança ou vice-versa.",
    icon: Repeat,
    free: true,
  },
]

const ServicosPage = () => {
  const [characters, setCharacters] = useState<RealCharacter[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGuid, setSelectedGuid] = useState<number | null>(null)
  const [selectOpen, setSelectOpen] = useState(false)

  const [confirmService, setConfirmService] = useState<string | null>(null)
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    fetch("/api/account/characters")
      .then((r) => r.json())
      .then((data) => {
        if (data.characters?.length) {
          setCharacters(data.characters)
          setSelectedGuid(data.characters[0].guid)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const character = characters.find((c) => c.guid === selectedGuid) ?? null
  const service = SERVICES.find((s) => s.id === confirmService) ?? null
  const faction = character ? (HORDE_RACES.has(character.race) ? "Horda" : "Aliança") : null
  const classColor = character ? (CLASS_COLORS[character.class] ?? "text-base-content") : ""

  const handleExecute = async () => {
    if (!confirmService || !character) return

    setExecuting(true)
    setResult(null)

    try {
      const res = await fetch("/api/account/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: confirmService, characterGuid: character.guid }),
      })
      const data = await res.json()

      if (!res.ok) {
        setResult({ success: false, message: data.error || "Erro ao executar serviço." })
      } else {
        setResult({ success: true, message: data.message })
      }
    } catch {
      setResult({ success: false, message: "Erro de conexão." })
    } finally {
      setExecuting(false)
    }
  }

  const closeModal = () => {
    setConfirmService(null)
    setResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif glow-text">
          Serviços de Personagem
        </h1>
        <p className="text-sm text-base-content/60">
          Teleporte, troca de facção, raça e muito mais
        </p>
      </div>

      {/* Character selector */}
      <div className="card-fantasy p-6 space-y-4">
        <div>
          <h3 className="font-bold">Selecione o Personagem</h3>
          <p className="text-sm text-base-content/60">
            Escolha o personagem que receberá o serviço
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-4 text-base-content/40">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando personagens…
          </div>
        ) : characters.length === 0 ? (
          <div className="py-4 text-center text-base-content/40">
            <Swords className="mx-auto mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm">Nenhum personagem encontrado.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative w-full sm:w-72">
              <label className="mb-1 block text-xs font-medium text-base-content/60">
                Personagem
              </label>
              <button
                onClick={() => setSelectOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm transition-colors hover:bg-base-200"
              >
                {character ? (
                  <span>
                    <span className={classColor}>{character.name}</span>
                    <span className="ml-2 text-base-content/50">
                      {character.class} Lv.{character.level}
                    </span>
                  </span>
                ) : (
                  <span className="text-base-content/40">Selecione um personagem</span>
                )}
                <ChevronDown className="h-4 w-4 text-base-content/50" />
              </button>
              {selectOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-base-300 bg-base-100 py-1 shadow-lg">
                  {characters.map((c) => (
                    <button
                      key={c.guid}
                      onClick={() => {
                        setSelectedGuid(c.guid)
                        setSelectOpen(false)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-base-200"
                    >
                      <span className={CLASS_COLORS[c.class] ?? ""}>
                        {c.name}
                      </span>
                      <span className="text-base-content/50">
                        — {c.class} Lv.{c.level}
                      </span>
                      {c.online && (
                        <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-success" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {character && (
              <div className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-200/50 px-4 py-2">
                <Shield className={`h-5 w-5 ${classColor}`} />
                <div>
                  <p className="font-semibold">{character.name}</p>
                  <p className="text-xs text-base-content/50">
                    {character.class} — {character.race}
                  </p>
                </div>
                <span
                  className={`badge badge-outline badge-sm ml-2 ${
                    faction === "Horda"
                      ? "border-red-500 text-red-500"
                      : "border-blue-500 text-blue-500"
                  }`}
                >
                  {faction}
                </span>
                {character.online && (
                  <span className="badge badge-success badge-sm ml-1 text-[10px]">
                    Online
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Services grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((svc) => {
          const Icon = svc.icon

          return (
            <div
              key={svc.id}
              className="card-fantasy flex flex-col p-5 transition-all hover:border-primary/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="badge badge-success badge-sm">Grátis</span>
              </div>
              <h3 className="mt-4 font-bold">{svc.name}</h3>
              <p className="mt-1 flex-1 text-sm text-base-content/60">
                {svc.description}
              </p>
              <button
                className="btn btn-primary btn-sm mt-4 w-full"
                disabled={!character}
                onClick={() => {
                  setConfirmService(svc.id)
                  setResult(null)
                }}
              >
                {character ? "Usar Serviço" : "Selecione um personagem"}
              </button>
            </div>
          )
        })}
      </div>

      {/* Info */}
      <div className="card-fantasy p-6">
        <h3 className="mb-4 font-bold">Informações Importantes</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Deslogue antes de usar serviços",
              desc: "Certifique-se de que o personagem está deslogado do jogo antes de executar qualquer serviço.",
            },
            {
              title: "Alterações no próximo login",
              desc: "Os serviços (exceto unstuck) são aplicados quando o personagem entrar no jogo novamente.",
            },
          ].map(({ title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-base-content/60">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm modal */}
      {confirmService && service && character && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative z-50 w-full max-w-md rounded-lg border border-base-300 bg-base-100 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold">{service.name}</h2>
                <p className="text-sm text-base-content/60">
                  Confirme a execução do serviço
                </p>
              </div>
              <button className="btn btn-ghost btn-sm btn-square" onClick={closeModal}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {result ? (
              <div className="space-y-4">
                <div
                  className={`flex items-start gap-3 rounded-lg border p-4 ${
                    result.success
                      ? "border-success/50 bg-success/10"
                      : "border-error/50 bg-error/10"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error" />
                  )}
                  <p className="text-sm">{result.message}</p>
                </div>
                <div className="flex justify-end">
                  <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                    Fechar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected character */}
                <div className="rounded-lg border border-base-300 p-4">
                  <p className="mb-2 text-sm text-base-content/60">
                    Personagem selecionado
                  </p>
                  <div className="flex items-center gap-3">
                    <Shield className={`h-8 w-8 ${classColor}`} />
                    <div>
                      <p className="font-bold">{character.name}</p>
                      <p className="text-sm text-base-content/50">
                        {character.class} — {character.race} — Level{" "}
                        {character.level}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service-specific warnings */}
                {confirmService === "unstuck" && (
                  <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <span>
                      Seu personagem será teleportado para{" "}
                      {faction === "Horda" ? "Orgrimmar" : "Stormwind"}.
                      Certifique-se de que está deslogado.
                    </span>
                  </div>
                )}
                {confirmService === "faction-change" && (
                  <div className="flex items-start gap-3 rounded-lg border border-error/50 bg-error/10 p-3 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                    <span>
                      Trocar de facção irá remover seu personagem da guild atual
                      e resetar sua reputação com facções opostas.
                    </span>
                  </div>
                )}

                {character.online && (
                  <div className="flex items-start gap-3 rounded-lg border border-error/50 bg-error/10 p-3 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                    <span>
                      O personagem está online. Deslogue do jogo antes de
                      executar o serviço.
                    </span>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary btn-sm gap-2"
                    onClick={handleExecute}
                    disabled={executing}
                  >
                    {executing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ServicosPage
