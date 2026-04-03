import { useState } from "react"
import { Shield, Swords, Heart, Zap, Target, Award, Clock, Trophy, Star, Flame, ChevronDown } from "lucide-react"
import { mockUser, classColors, Character } from "@/lib/mock-data"

const mockEquipment = {
  head:      { name: "Sanctified Lightsworn Faceguard", ilvl: 277, rarity: "epic" },
  neck:      { name: "Sindragosa's Cruel Claw", ilvl: 277, rarity: "epic" },
  shoulders: { name: "Sanctified Lightsworn Shoulderguards", ilvl: 277, rarity: "epic" },
  chest:     { name: "Sanctified Lightsworn Chestguard", ilvl: 277, rarity: "epic" },
  waist:     { name: "Lich Killer's Lanyard", ilvl: 264, rarity: "epic" },
  legs:      { name: "Sanctified Lightsworn Legguards", ilvl: 277, rarity: "epic" },
  feet:      { name: "Apocalypse's Advance", ilvl: 264, rarity: "epic" },
  wrist:     { name: "Bracers of Dark Reckoning", ilvl: 264, rarity: "epic" },
  hands:     { name: "Sanctified Lightsworn Handguards", ilvl: 277, rarity: "epic" },
  ring1:     { name: "Ashen Band of Endless Courage", ilvl: 277, rarity: "epic" },
  ring2:     { name: "Frostbrood Sapphire Ring", ilvl: 264, rarity: "epic" },
  trinket1:  { name: "Sindragosa's Flawless Fang", ilvl: 264, rarity: "epic" },
  trinket2:  { name: "Corpse Tongue Coin", ilvl: 264, rarity: "epic" },
  back:      { name: "Sentinel's Winter Cloak", ilvl: 264, rarity: "epic" },
  mainHand:  { name: "Shadowmourne", ilvl: 284, rarity: "legendary" },
  offHand:   { name: "Bulwark of Smouldering Steel", ilvl: 277, rarity: "epic" },
}

const mockStats = {
  health: 52000, mana: 23000, strength: 1450, stamina: 2100,
  armor: 28500, dodge: 24.5, parry: 18.2, block: 22.8,
  attackPower: 4520, hitRating: 263, expertise: 26, spellPower: 1200,
}

const mockAchievements = [
  { name: "The Kingslayer", points: 10, date: "2024-01-15" },
  { name: "Fall of the Lich King (25)", points: 25, date: "2024-01-10" },
  { name: "Heroic: The Lich King", points: 25, date: "2024-01-05" },
  { name: "Bane of the Fallen King", points: 25, date: "2023-12-20" },
  { name: "Glory of the Icecrown Raider", points: 25, date: "2023-12-15" },
]

const equipmentSlots = [
  { key: "head",     label: "Cabeça",      side: "left" },
  { key: "neck",     label: "Pescoço",     side: "left" },
  { key: "shoulders",label: "Ombros",      side: "left" },
  { key: "chest",    label: "Peito",       side: "left" },
  { key: "waist",    label: "Cintura",     side: "left" },
  { key: "legs",     label: "Pernas",      side: "left" },
  { key: "feet",     label: "Pés",         side: "left" },
  { key: "wrist",    label: "Pulsos",      side: "right" },
  { key: "hands",    label: "Mãos",        side: "right" },
  { key: "ring1",    label: "Anel 1",      side: "right" },
  { key: "ring2",    label: "Anel 2",      side: "right" },
  { key: "trinket1", label: "Bijuteria 1", side: "right" },
  { key: "trinket2", label: "Bijuteria 2", side: "right" },
  { key: "back",     label: "Costas",      side: "right" },
]

const rarityBorder: Record<string, string> = {
  common:    "border-base-content/30",
  uncommon:  "border-green-500",
  rare:      "border-blue-500",
  epic:      "border-purple-500",
  legendary: "border-primary",
}

const rarityText: Record<string, string> = {
  common:    "",
  uncommon:  "text-green-500",
  rare:      "text-blue-500",
  epic:      "text-purple-400",
  legendary: "text-primary",
}

type EquipItem = { name: string; ilvl: number; rarity: string }

const EquipmentSlot = ({ label, item }: { label: string; item: EquipItem }) => (
  <div className={`rounded-lg border-2 ${rarityBorder[item.rarity]} bg-base-200/50 p-2`}>
    <div className="flex items-center gap-2">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded bg-base-300 ${rarityText[item.rarity]}`}>
        <Swords className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-xs font-medium ${rarityText[item.rarity]}`}>{item.name}</p>
        <p className="text-[10px] text-base-content/50">{label} — iLvl {item.ilvl}</p>
      </div>
    </div>
  </div>
)

const CharacterStats = ({ character }: { character: Character }) => (
  <div className="space-y-6">
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-base-content/50">
        Atributos Primários
      </h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          { icon: Heart, label: "Vida", value: mockStats.health.toLocaleString(), color: "text-error" },
          { icon: Zap, label: "Mana", value: mockStats.mana.toLocaleString(), color: "text-info" },
          { icon: Flame, label: "Força", value: mockStats.strength, color: "text-orange-400" },
          { icon: Shield, label: "Vigor", value: mockStats.stamina, color: "text-primary" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center justify-between rounded-lg bg-base-200 p-2">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-sm">{label}</span>
            </div>
            <span className="font-bold">{value}</span>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-base-content/50">Defesa</h4>
      <div className="space-y-3">
        {[
          { label: "Armadura", value: `${mockStats.armor.toLocaleString()}`, pct: 75 },
          { label: "Esquiva", value: `${mockStats.dodge}%`, pct: mockStats.dodge },
          { label: "Aparar", value: `${mockStats.parry}%`, pct: mockStats.parry },
          { label: "Bloquear", value: `${mockStats.block}%`, pct: mockStats.block },
        ].map(({ label, value, pct }) => (
          <div key={label}>
            <div className="flex justify-between text-sm">
              <span>{label}</span>
              <span>{value}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-base-300">
              <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-base-content/50">Ataque</h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          { label: "Poder de Ataque", value: mockStats.attackPower, highlight: "text-primary" },
          { label: "Acerto", value: mockStats.hitRating, highlight: "" },
          { label: "Expertise", value: mockStats.expertise, highlight: "" },
          { label: "Spell Power", value: mockStats.spellPower, highlight: "text-purple-400" },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="flex items-center justify-between rounded-lg bg-base-200 p-2">
            <span className="text-sm">{label}</span>
            <span className={`font-bold ${highlight}`}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

type Tab = "equipment" | "stats" | "achievements"

const ArmoryPage = () => {
  const [selectedId, setSelectedId] = useState(mockUser.characters[0]?.id ?? "")
  const [tab, setTab] = useState<Tab>("equipment")
  const [selectOpen, setSelectOpen] = useState(false)

  const character = mockUser.characters.find((c) => c.id === selectedId)
  const avgIlvl = Math.round(
    Object.values(mockEquipment).reduce((s, i) => s + i.ilvl, 0) /
      Object.keys(mockEquipment).length
  )

  if (!character) return null

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "equipment", label: "Equipamentos", icon: Swords },
    { key: "stats", label: "Estatísticas", icon: Target },
    { key: "achievements", label: "Conquistas", icon: Trophy },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif glow-text">Armory</h1>
          <p className="text-sm text-base-content/60">
            Visualize equipamentos e estatísticas dos seus personagens
          </p>
        </div>

        {/* Character select */}
        <div className="relative w-full sm:w-56">
          <button
            onClick={() => setSelectOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm transition-colors hover:bg-base-200"
          >
            <span className={classColors[character.class]}>
              {character.name} <span className="text-base-content/50">Lv.{character.level}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-base-content/50" />
          </button>
          {selectOpen && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-base-300 bg-base-100 py-1 shadow-lg">
              {mockUser.characters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedId(c.id); setSelectOpen(false) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-base-200"
                >
                  <span className={classColors[c.class]}>{c.name}</span>
                  <span className="text-base-content/50">Lv.{c.level}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Character banner */}
      <div className="card-fantasy overflow-hidden">
        <div className="bg-linear-to-r from-primary/20 via-base-200 to-primary/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-primary bg-base-100 ${classColors[character.class]}`}>
              <Shield className="h-12 w-12" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className={`text-2xl font-bold font-serif ${classColors[character.class]}`}>
                  {character.name}
                </h2>
                <span className={`badge badge-outline text-xs ${
                  character.faction === "Horda" ? "border-red-500 text-red-500" : "border-blue-500 text-blue-500"
                }`}>
                  {character.faction}
                </span>
              </div>
              <p className="mt-1 text-base-content/60">
                {character.class} — {character.race} — Level {character.level}
              </p>
              {character.guild && (
                <p className="mt-1 text-sm">
                  <span className="text-base-content/50">Guild:</span>{" "}
                  <span className="font-medium">{character.guild}</span>
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <div className="rounded-lg bg-base-100/80 px-4 py-2 text-center">
                <p className="text-xs text-base-content/50">Item Level</p>
                <p className="text-2xl font-bold text-primary">{avgIlvl}</p>
              </div>
              <div className="rounded-lg bg-base-100/80 px-4 py-2 text-center">
                <p className="text-xs text-base-content/50">Conquistas</p>
                <p className="text-2xl font-bold text-secondary">{character.achievementPoints}</p>
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
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card-fantasy p-4">
            <h3 className="mb-3 text-sm font-semibold text-base-content/60 uppercase tracking-wider">
              Equipamentos (Esquerda)
            </h3>
            <div className="space-y-2">
              {equipmentSlots.filter((s) => s.side === "left").map((slot) => (
                <EquipmentSlot
                  key={slot.key}
                  label={slot.label}
                  item={mockEquipment[slot.key as keyof typeof mockEquipment]}
                />
              ))}
            </div>
          </div>

          <div className="card-fantasy p-4">
            <h3 className="mb-3 text-sm font-semibold text-base-content/60 uppercase tracking-wider">
              Equipamentos (Direita)
            </h3>
            <div className="space-y-2">
              {equipmentSlots.filter((s) => s.side === "right").map((slot) => (
                <EquipmentSlot
                  key={slot.key}
                  label={slot.label}
                  item={mockEquipment[slot.key as keyof typeof mockEquipment]}
                />
              ))}
            </div>
          </div>

          <div className="card-fantasy p-4 lg:col-span-2">
            <h3 className="mb-3 text-sm font-semibold text-base-content/60 uppercase tracking-wider">
              Armas
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border-2 border-primary bg-primary/10 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <Swords className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-primary">{mockEquipment.mainHand.name}</p>
                    <p className="text-xs text-base-content/50">
                      Mão Principal — iLvl {mockEquipment.mainHand.ilvl}
                    </p>
                    <span className="badge badge-warning badge-sm mt-1">Lendário</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border-2 border-purple-500 bg-purple-500/10 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-purple-400">{mockEquipment.offHand.name}</p>
                    <p className="text-xs text-base-content/50">
                      Mão Secundária — iLvl {mockEquipment.offHand.ilvl}
                    </p>
                    <span className="badge badge-outline badge-sm mt-1 border-purple-500 text-purple-400">
                      Épico
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Stats */}
      {tab === "stats" && (
        <div className="card-fantasy p-6">
          <h3 className="mb-1 text-lg font-bold">Estatísticas do Personagem</h3>
          <p className="mb-6 text-sm text-base-content/60">Atributos e capacidades de combate</p>
          <CharacterStats character={character} />
        </div>
      )}

      {/* Tab: Achievements */}
      {tab === "achievements" && (
        <div className="card-fantasy p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Trophy className="h-5 w-5 text-primary" />
                Conquistas Recentes
              </h3>
              <p className="text-sm text-base-content/60">Suas últimas conquistas no jogo</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{character.achievementPoints}</p>
              <p className="text-xs text-base-content/50">pontos totais</p>
            </div>
          </div>
          <div className="space-y-3">
            {mockAchievements.map((achievement, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-base-300 p-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{achievement.name}</p>
                  <div className="flex items-center gap-1 text-xs text-base-content/50">
                    <Clock className="h-3 w-3" />
                    {achievement.date}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-4 w-4" />
                  <span className="font-bold">{achievement.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ArmoryPage
