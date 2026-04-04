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
  Info,
} from "lucide-react"

interface RealCharacter {
  guid: number
  raceId: number
  classId: number
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

const RACE_NAMES: Record<number, string> = {
  1: "Humano", 2: "Orc", 3: "Anão", 4: "Elfo Noturno",
  5: "Morto-Vivo", 6: "Tauren", 7: "Gnomo", 8: "Troll",
  10: "Elfo Sangrento", 11: "Draenei",
}

const ALLIANCE_RACE_IDS = [1, 3, 4, 7, 11]
const HORDE_RACE_IDS    = [2, 5, 6, 8, 10]
const HORDE_RACE_ID_SET = new Set(HORDE_RACE_IDS)

// Default race equivalent for faction change
const FACTION_CHANGE_MAP: Record<number, number> = {
  1: 2, 2: 1, 3: 5, 5: 3, 4: 6, 6: 4, 7: 8, 8: 7, 11: 10, 10: 11,
}

// Valid races per class (WoW 3.3.5a)
// 1=Warrior 2=Paladin 3=Hunter 4=Rogue 5=Priest 6=DK 7=Shaman 8=Mage 9=Warlock 11=Druid
const CLASS_RACE_MAP: Record<number, Set<number>> = {
  1:  new Set([1, 2, 3, 4, 5, 6, 7, 8, 10, 11]), // Warrior
  2:  new Set([1, 3, 10, 11]),                     // Paladin
  3:  new Set([2, 3, 4, 6, 8, 10, 11]),            // Hunter
  4:  new Set([1, 2, 3, 4, 5, 7, 8, 10]),          // Rogue
  5:  new Set([1, 3, 4, 5, 8, 10, 11]),            // Priest
  6:  new Set([1, 2, 3, 4, 5, 6, 7, 8, 10, 11]),  // Death Knight
  7:  new Set([2, 6, 8, 11]),                       // Shaman
  8:  new Set([1, 5, 7, 8, 10, 11]),               // Mage
  9:  new Set([1, 2, 5, 7, 10]),                   // Warlock
  11: new Set([4, 6]),                              // Druid
}

const HORDE_RACES_NAMES = new Set([
  "Orc", "Morto-Vivo", "Tauren", "Troll", "Elfo Sangrento",
])

interface ServiceDef {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  mode: "direct" | "game"
  directLabel?: string
}

const SERVICES: ServiceDef[] = [
  {
    id: "unstuck",
    name: "Destravar Personagem",
    description: "Teleporte seu personagem para a cidade inicial da facção.",
    icon: MapPin,
    mode: "direct",
    directLabel: "Aplicado na hora",
  },
  {
    id: "level-reset",
    name: "Reset de Talentos",
    description: "Remove todos os talentos do personagem para redistribuir.",
    icon: RotateCcw,
    mode: "direct",
    directLabel: "Aplicado na hora",
  },
  {
    id: "name-change",
    name: "Troca de Nome",
    description: "Escolha um novo nome para o seu personagem (2-12 letras).",
    icon: Edit,
    mode: "direct",
    directLabel: "Aplicado na hora",
  },
  {
    id: "appearance",
    name: "Mudança de Aparência",
    description: "Altere a aparência do personagem na tela de login do jogo.",
    icon: Palette,
    mode: "game",
  },
  {
    id: "race-change",
    name: "Troca de Raça",
    description: "Mude para outra raça da mesma facção. Aparência personalizada no próximo login.",
    icon: Users,
    mode: "direct",
    directLabel: "Aplicado na hora",
  },
  {
    id: "faction-change",
    name: "Troca de Facção",
    description: "Mude de Horda para Aliança ou vice-versa. Guild removida automaticamente.",
    icon: Repeat,
    mode: "direct",
    directLabel: "Aplicado na hora",
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
  const [newName, setNewName] = useState("")
  const [newRace, setNewRace] = useState<number | null>(null)

  const loadCharacters = () => {
    fetch("/api/account/characters")
      .then((r) => r.json())
      .then((data) => {
        if (data.characters?.length) {
          setCharacters(data.characters)
          if (!selectedGuid) setSelectedGuid(data.characters[0].guid)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCharacters()
  }, [])

  const character = characters.find((c) => c.guid === selectedGuid) ?? null
  const service = SERVICES.find((s) => s.id === confirmService) ?? null
  const faction = character
    ? HORDE_RACES_NAMES.has(character.race) ? "Horda" : "Aliança"
    : null
  const classColor = character ? (CLASS_COLORS[character.class] ?? "text-base-content") : ""

  const validForClass = character ? (CLASS_RACE_MAP[character.classId] ?? new Set<number>()) : new Set<number>()

  // Available races for race-change (same faction, excluding current, compatible with class)
  const sameFactRaces = character
    ? (HORDE_RACE_ID_SET.has(character.raceId) ? HORDE_RACE_IDS : ALLIANCE_RACE_IDS)
        .filter((id) => id !== character.raceId && validForClass.has(id))
    : []

  // Available races for faction-change (opposite faction, compatible with class)
  const oppFactRaces = character
    ? (HORDE_RACE_ID_SET.has(character.raceId) ? ALLIANCE_RACE_IDS : HORDE_RACE_IDS)
        .filter((id) => validForClass.has(id))
    : []

  const openService = (svcId: string) => {
    setConfirmService(svcId)
    setResult(null)
    setNewName("")
    // Pre-select default race
    if (svcId === "race-change" && character) {
      setNewRace(sameFactRaces[0] ?? null)
    } else if (svcId === "faction-change" && character) {
      setNewRace(FACTION_CHANGE_MAP[character.raceId] ?? oppFactRaces[0] ?? null)
    } else {
      setNewRace(null)
    }
  }

  const handleExecute = async () => {
    if (!confirmService || !character) return

    setExecuting(true)
    setResult(null)

    const body: Record<string, unknown> = {
      serviceId: confirmService,
      characterGuid: character.guid,
    }
    if (confirmService === "name-change") body.newName = newName
    if (confirmService === "race-change" || confirmService === "faction-change") body.newRace = newRace

    try {
      const res = await fetch("/api/account/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        setResult({ success: false, message: data.error || "Erro ao executar serviço." })
      } else {
        setResult({ success: true, message: data.message })
        if (["name-change", "race-change", "faction-change"].includes(confirmService)) {
          loadCharacters()
        }
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
    setNewName("")
    setNewRace(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif glow-text">
          Serviços de Personagem
        </h1>
        <p className="text-sm text-base-content/60">
          Teleporte, troca de facção, raça e muito mais — tudo grátis
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
                  <span className="text-base-content/40">Selecione</span>
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
                      <span className={CLASS_COLORS[c.class] ?? ""}>{c.name}</span>
                      <span className="text-base-content/50">— {c.class} Lv.{c.level}</span>
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
                  <p className="text-xs text-base-content/50">{character.class} — {character.race}</p>
                </div>
                <span
                  className={`badge badge-outline badge-sm ml-2 ${
                    faction === "Horda" ? "border-red-500 text-red-500" : "border-blue-500 text-blue-500"
                  }`}
                >
                  {faction}
                </span>
                {character.online && (
                  <span className="badge badge-success badge-sm ml-1 text-[10px]">Online</span>
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
                <div className="flex flex-col items-end gap-1">
                  <span className="badge badge-success badge-sm">Grátis</span>
                  {svc.mode === "direct" ? (
                    <span className="text-[10px] text-success">Instantâneo</span>
                  ) : (
                    <span className="text-[10px] text-base-content/40">Via jogo</span>
                  )}
                </div>
              </div>
              <h3 className="mt-4 font-bold">{svc.name}</h3>
              <p className="mt-1 flex-1 text-sm text-base-content/60">{svc.description}</p>
              {(() => {
                const noRaces =
                  (svc.id === "race-change" && character && sameFactRaces.length === 0) ||
                  (svc.id === "faction-change" && character && oppFactRaces.length === 0)
                return (
                  <button
                    className="btn btn-primary btn-sm mt-4 w-full"
                    disabled={!character || !!noRaces}
                    title={noRaces ? "Nenhuma raça compatível com esta classe" : undefined}
                    onClick={() => openService(svc.id)}
                  >
                    {!character
                      ? "Selecione um personagem"
                      : noRaces
                      ? "Sem raças compatíveis"
                      : "Usar Serviço"}
                  </button>
                )
              })()}
            </div>
          )
        })}
      </div>

      {/* Info */}
      <div className="card-fantasy p-6">
        <h3 className="mb-4 font-bold">Informações Importantes</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <p className="font-medium">Deslogue antes de usar serviços</p>
              <p className="text-sm text-base-content/60">O personagem deve estar deslogado do jogo.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" />
            <div>
              <p className="font-medium">Aparência após troca de raça/facção</p>
              <p className="text-sm text-base-content/60">
                A aparência é resetada e pode ser personalizada no próximo login no jogo.
              </p>
            </div>
          </div>
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
                  {service.mode === "direct" ? "Será aplicado imediatamente" : "Será ativado no próximo login no jogo"}
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
                    result.success ? "border-success/50 bg-success/10" : "border-error/50 bg-error/10"
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
                  <button className="btn btn-ghost btn-sm" onClick={closeModal}>Fechar</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected character */}
                <div className="rounded-lg border border-base-300 p-4">
                  <p className="mb-2 text-sm text-base-content/60">Personagem selecionado</p>
                  <div className="flex items-center gap-3">
                    <Shield className={`h-8 w-8 ${classColor}`} />
                    <div>
                      <p className="font-bold">{character.name}</p>
                      <p className="text-sm text-base-content/50">
                        {character.class} — {character.race} — Level {character.level}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name input */}
                {confirmService === "name-change" && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-base-content/60">Novo nome do personagem</label>
                    <input
                      type="text"
                      placeholder="Ex: Arthas"
                      className="input input-bordered input-sm w-full"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      maxLength={12}
                    />
                    <p className="text-xs text-base-content/40">2 a 12 letras, sem números ou espaços</p>
                  </div>
                )}

                {/* Race picker — race-change */}
                {confirmService === "race-change" && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-base-content/60">
                      Nova raça ({faction})
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {sameFactRaces.map((id) => (
                        <button
                          key={id}
                          onClick={() => setNewRace(id)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            newRace === id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-base-300 hover:bg-base-200"
                          }`}
                        >
                          {RACE_NAMES[id]}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-base-content/40">
                      Apenas raças da mesma facção disponíveis
                    </p>
                  </div>
                )}

                {/* Race picker — faction-change */}
                {confirmService === "faction-change" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={faction === "Horda" ? "text-red-400 font-semibold" : "text-blue-400 font-semibold"}>
                        {faction}: {character.race}
                      </span>
                      <span className="text-base-content/40">→</span>
                      <span className={faction === "Horda" ? "text-blue-400 font-semibold" : "text-red-400 font-semibold"}>
                        {faction === "Horda" ? "Aliança" : "Horda"}
                      </span>
                    </div>
                    <label className="text-xs font-medium text-base-content/60">
                      Escolha a nova raça ({faction === "Horda" ? "Aliança" : "Horda"})
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {oppFactRaces.map((id) => (
                        <button
                          key={id}
                          onClick={() => setNewRace(id)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            newRace === id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-base-300 hover:bg-base-200"
                          }`}
                        >
                          {RACE_NAMES[id]}
                          {FACTION_CHANGE_MAP[character.raceId] === id && (
                            <span className="ml-1 text-[10px] text-base-content/40">(equiv.)</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {confirmService === "unstuck" && (
                  <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <span>Será teleportado para {faction === "Horda" ? "Orgrimmar" : "Stormwind"}.</span>
                  </div>
                )}
                {confirmService === "level-reset" && (
                  <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <span>Todos os talentos serão removidos. Você poderá redistribuí-los no jogo.</span>
                  </div>
                )}
                {confirmService === "faction-change" && (
                  <div className="flex items-start gap-3 rounded-lg border border-error/50 bg-error/10 p-3 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                    <span>
                      Você será removido da sua guild. Reputações com facções opostas serão mantidas, mas NPCs inimigas podem atacar.
                    </span>
                  </div>
                )}
                {(confirmService === "race-change" || confirmService === "faction-change") && (
                  <div className="flex items-start gap-3 rounded-lg border border-info/50 bg-info/10 p-3 text-sm">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                    <span>A aparência será resetada. Você poderá personalizar no próximo login no jogo.</span>
                  </div>
                )}
                {character.online && (
                  <div className="flex items-start gap-3 rounded-lg border border-error/50 bg-error/10 p-3 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                    <span>O personagem está online. Deslogue do jogo antes.</span>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={closeModal}>Cancelar</button>
                  <button
                    className="btn btn-primary btn-sm gap-2"
                    onClick={handleExecute}
                    disabled={
                      executing ||
                      (confirmService === "name-change" && newName.length < 2) ||
                      ((confirmService === "race-change" || confirmService === "faction-change") && !newRace)
                    }
                  >
                    {executing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
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
