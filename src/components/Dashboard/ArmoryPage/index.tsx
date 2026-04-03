import { useEffect, useState } from "react"
import {
  Shield,
  Swords,
  Heart,
  Zap,
  Target,
  Clock,
  Trophy,
  Star,
  ChevronDown,
  Loader2,
  Flame,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface EquipItem {
  name: string
  ilvl: number
  label: string
  rarity: string
}

interface ArmoryCharacter {
  guid: number
  name: string
  class: string
  race: string
  level: number
  gold: number
  silver: number
  copper: number
  online: boolean
  playedTime: string
  totalKills: number
  faction: "Horda" | "Aliança"
  avgIlvl: number
  equipment: Record<string, EquipItem>
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

const RARITY_BORDER: Record<string, string> = {
  poor:      "border-base-content/20",
  common:    "border-base-content/30",
  uncommon:  "border-green-500",
  rare:      "border-blue-500",
  epic:      "border-purple-500",
  legendary: "border-primary",
  artifact:  "border-primary",
}

const RARITY_TEXT: Record<string, string> = {
  poor:      "text-base-content/40",
  common:    "",
  uncommon:  "text-green-500",
  rare:      "text-blue-500",
  epic:      "text-purple-400",
  legendary: "text-primary",
  artifact:  "text-primary",
}

const RARITY_LABEL: Record<string, string> = {
  poor:      "Ruim",
  common:    "Comum",
  uncommon:  "Incomum",
  rare:      "Raro",
  epic:      "Épico",
  legendary: "Lendário",
  artifact:  "Artefato",
}

const LEFT_SLOTS  = ["head","neck","shoulders","chest","waist","legs","feet"]
const RIGHT_SLOTS = ["wrist","hands","ring1","ring2","trinket1","trinket2","back"]
const WEAPON_SLOTS = ["mainHand","offHand","ranged"]

// ─── Sub-components ───────────────────────────────────────────────────────────

const EquipmentSlot = ({ item }: { item: EquipItem }) => (
  <div className={`rounded-lg border-2 ${RARITY_BORDER[item.rarity] ?? "border-base-300"} bg-base-200/50 p-2`}>
    <div className="flex items-center gap-2">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded bg-base-300 ${RARITY_TEXT[item.rarity] ?? ""}`}>
        <Swords className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-xs font-medium ${RARITY_TEXT[item.rarity] ?? ""}`}>{item.name}</p>
        <p className="text-[10px] text-base-content/50">{item.label} — iLvl {item.ilvl}</p>
      </div>
    </div>
  </div>
)

const EmptySlot = ({ label }: { label: string }) => (
  <div className="rounded-lg border-2 border-dashed border-base-300 bg-base-200/20 p-2">
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-base-300/40">
        <Shield className="h-4 w-4 text-base-content/20" />
      </div>
      <p className="text-xs text-base-content/30">{label} — vazio</p>
    </div>
  </div>
)

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = "equipment" | "stats"

const ArmoryPage = () => {
  const [characters, setCharacters] = useState<ArmoryCharacter[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGuid, setSelectedGuid] = useState<number | null>(null)
  const [tab, setTab] = useState<Tab>("equipment")
  const [selectOpen, setSelectOpen] = useState(false)

  useEffect(() => {
    fetch("/api/account/armory")
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
  const classColor = character ? (CLASS_COLORS[character.class] ?? "text-base-content") : ""

  const SLOT_LABELS: Record<string, string> = {
    head:      "Cabeça",
    neck:      "Pescoço",
    shoulders: "Ombros",
    chest:     "Peito",
    waist:     "Cintura",
    legs:      "Pernas",
    feet:      "Pés",
    wrist:     "Pulsos",
    hands:     "Mãos",
    ring1:     "Anel 1",
    ring2:     "Anel 2",
    trinket1:  "Bijuteria 1",
    trinket2:  "Bijuteria 2",
    back:      "Costas",
    mainHand:  "Mão Principal",
    offHand:   "Mão Secundária",
    ranged:    "Ranged",
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "equipment", label: "Equipamentos", icon: Swords },
    { key: "stats",     label: "Estatísticas", icon: Target },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif glow-text">Armory</h1>
          <p className="text-sm text-base-content/60">
            Equipamentos e estatísticas dos seus personagens
          </p>
        </div>

        {/* Character selector */}
        {!loading && characters.length > 0 && (
          <div className="relative w-full sm:w-56">
            <button
              onClick={() => setSelectOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm transition-colors hover:bg-base-200"
            >
              {character && (
                <span className={classColor}>
                  {character.name}{" "}
                  <span className="text-base-content/50">Lv.{character.level}</span>
                </span>
              )}
              <ChevronDown className="h-4 w-4 text-base-content/50" />
            </button>
            {selectOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-base-300 bg-base-100 py-1 shadow-lg">
                {characters.map((c) => (
                  <button
                    key={c.guid}
                    onClick={() => { setSelectedGuid(c.guid); setSelectOpen(false) }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-base-200"
                  >
                    <span className={CLASS_COLORS[c.class] ?? ""}>{c.name}</span>
                    <span className="text-base-content/50">Lv.{c.level}</span>
                    {c.online && <span className="ml-auto inline-flex h-2 w-2 rounded-full bg-success" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-base-content/40">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando armory…
        </div>
      )}

      {/* Empty state */}
      {!loading && characters.length === 0 && (
        <div className="card border border-dashed border-base-300 bg-base-100 p-12 text-center text-base-content/40">
          <Shield className="mx-auto mb-3 h-12 w-12 opacity-20" />
          <p className="text-sm">Nenhum personagem encontrado.</p>
          <p className="mt-1 text-xs">Entre no jogo e crie seu primeiro personagem!</p>
        </div>
      )}

      {/* Content */}
      {!loading && character && (
        <>
          {/* Character banner */}
          <div className="card-fantasy overflow-hidden">
            <div className="bg-linear-to-r from-primary/20 via-base-200 to-primary/10 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-primary bg-base-100 ${classColor}`}>
                  <Shield className="h-12 w-12" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className={`text-2xl font-bold font-serif ${classColor}`}>
                      {character.name}
                    </h2>
                    {character.online && (
                      <span className="inline-flex h-2 w-2 rounded-full bg-success" title="Online" />
                    )}
                    <span
                      className={`badge badge-outline text-xs ${
                        character.faction === "Horda"
                          ? "border-red-500 text-red-500"
                          : "border-blue-500 text-blue-500"
                      }`}
                    >
                      {character.faction}
                    </span>
                  </div>
                  <p className="mt-1 text-base-content/60">
                    {character.class} — {character.race} — Level {character.level}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-base-content/60">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {character.playedTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Swords className="h-3.5 w-3.5" />
                      {character.totalKills.toLocaleString()} kills
                    </span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="rounded-lg bg-base-100/80 px-4 py-2 text-center">
                    <p className="text-xs text-base-content/50">Item Level</p>
                    <p className="text-2xl font-bold text-primary">
                      {character.avgIlvl > 0 ? character.avgIlvl : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-base-100/80 px-4 py-2 text-center">
                    <p className="text-xs text-base-content/50">Gold</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {character.gold.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-lg border border-base-300 bg-base-200 p-1 w-fit">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === key ? "bg-base-100 shadow-sm" : "text-base-content/60 hover:text-base-content"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Equipment */}
          {tab === "equipment" && (
            <div className="space-y-4">
              {Object.keys(character.equipment).length === 0 ? (
                <p className="text-sm text-base-content/40 text-center py-8">
                  Nenhum item equipado encontrado. Entre no jogo para equipar itens.
                </p>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Left slots */}
                  <div className="card-fantasy p-4">
                    <h3 className="mb-3 text-sm font-semibold text-base-content/60 uppercase tracking-wider">
                      Slots (Esquerda)
                    </h3>
                    <div className="space-y-2">
                      {LEFT_SLOTS.map((slot) =>
                        character.equipment[slot] ? (
                          <EquipmentSlot key={slot} item={character.equipment[slot]} />
                        ) : (
                          <EmptySlot key={slot} label={SLOT_LABELS[slot] ?? slot} />
                        )
                      )}
                    </div>
                  </div>

                  {/* Right slots */}
                  <div className="card-fantasy p-4">
                    <h3 className="mb-3 text-sm font-semibold text-base-content/60 uppercase tracking-wider">
                      Slots (Direita)
                    </h3>
                    <div className="space-y-2">
                      {RIGHT_SLOTS.map((slot) =>
                        character.equipment[slot] ? (
                          <EquipmentSlot key={slot} item={character.equipment[slot]} />
                        ) : (
                          <EmptySlot key={slot} label={SLOT_LABELS[slot] ?? slot} />
                        )
                      )}
                    </div>
                  </div>

                  {/* Weapons */}
                  {WEAPON_SLOTS.some((s) => character.equipment[s]) && (
                    <div className="card-fantasy p-4 lg:col-span-2">
                      <h3 className="mb-3 text-sm font-semibold text-base-content/60 uppercase tracking-wider">
                        Armas
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {WEAPON_SLOTS.map((slot) => {
                          const item = character.equipment[slot]
                          if (!item) return null
                          const border = RARITY_BORDER[item.rarity] ?? "border-base-300"
                          const textColor = RARITY_TEXT[item.rarity] ?? ""
                          return (
                            <div key={slot} className={`rounded-lg border-2 ${border} bg-base-200/50 p-3`}>
                              <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-base-300 ${textColor}`}>
                                  <Swords className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className={`font-bold text-sm ${textColor}`}>{item.name}</p>
                                  <p className="text-xs text-base-content/50">
                                    {item.label} — iLvl {item.ilvl}
                                  </p>
                                  <span className={`badge badge-outline badge-sm mt-1 text-[10px] ${textColor}`}>
                                    {RARITY_LABEL[item.rarity] ?? item.rarity}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab: Stats */}
          {tab === "stats" && (
            <div className="card-fantasy p-6">
              <h3 className="mb-1 text-lg font-bold">Estatísticas do Personagem</h3>
              <p className="mb-6 text-sm text-base-content/60">
                Informações gerais da conta no banco de dados
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: Shield,    label: "Classe",         value: character.class,                          color: classColor },
                  { icon: Star,      label: "Raça",           value: character.race,                           color: "" },
                  { icon: Trophy,    label: "Facção",         value: character.faction,                        color: character.faction === "Horda" ? "text-red-500" : "text-blue-500" },
                  { icon: Swords,    label: "Level",          value: `${character.level} / 80`,                color: "text-primary" },
                  { icon: Flame,     label: "Item Level médio", value: character.avgIlvl > 0 ? character.avgIlvl.toString() : "—", color: "text-primary" },
                  { icon: Swords,    label: "Kills totais",   value: character.totalKills.toLocaleString(),    color: "" },
                  { icon: Clock,     label: "Tempo jogado",   value: character.playedTime,                     color: "" },
                  { icon: Zap,       label: "Gold",           value: `${character.gold.toLocaleString()}g ${character.silver}s ${character.copper}c`, color: "text-yellow-400" },
                  { icon: Heart,     label: "Status",         value: character.online ? "Online" : "Offline",  color: character.online ? "text-success" : "text-base-content/40" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center gap-3 rounded-lg bg-base-200 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-base-300">
                      <Icon className={`h-5 w-5 ${color || "text-base-content/60"}`} />
                    </div>
                    <div>
                      <p className="text-xs text-base-content/50">{label}</p>
                      <p className={`font-semibold ${color}`}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ArmoryPage
