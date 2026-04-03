import Link from "next/link"
import { useState } from "react"
import { Shield, Coins, Trophy, Swords, MoreVertical } from "lucide-react"
import { Character, classColors } from "@/lib/mock-data"

interface CharacterCardProps {
  character: Character
  isSelected?: boolean
  onSelect?: () => void
}

const CharacterCard = ({ character, isSelected, onSelect }: CharacterCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const levelProgress = (character.level / character.maxLevel) * 100
  const classColor = classColors[character.class]
  const accentBg = classColor.replace("text-", "bg-")

  return (
    <div
      className={`card relative overflow-hidden border bg-base-100 transition-all hover:border-primary/50 ${
        isSelected ? "border-primary ring-1 ring-primary" : "border-base-300"
      }`}
      onClick={onSelect}
    >
      {/* Class color accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${accentBg}`} />

      <div className="card-body p-4 pl-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg border border-base-300 bg-base-200 ${classColor}`}
            >
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{character.name}</h3>
                {character.guild && (
                  <span className="rounded-full border border-base-300 px-2 py-0.5 text-xs">
                    {character.guild}
                  </span>
                )}
              </div>
              <p className={`text-sm ${classColor}`}>
                {character.class} — {character.race}
              </p>
            </div>
          </div>

          {/* Actions menu */}
          <div className="relative">
            <button
              className="btn btn-ghost btn-xs btn-square"
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((v) => !v)
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full z-10 mt-1 min-w-[8rem] rounded-lg border border-base-300 bg-base-100 py-1 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href={`/dashboard/armory?char=${character.id}`}
                  className="block px-3 py-1.5 text-sm transition-colors hover:bg-base-200"
                  onClick={() => setMenuOpen(false)}
                >
                  Ver Armory
                </Link>
                <Link
                  href={`/dashboard/servicos?char=${character.id}`}
                  className="block px-3 py-1.5 text-sm transition-colors hover:bg-base-200"
                  onClick={() => setMenuOpen(false)}
                >
                  Serviços
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {/* Level progress */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-base-content/60">Level</span>
              <span className="font-medium">
                {character.level} / {character.maxLevel}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-base-300">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-base-content/60">Gold</span>
              <span className="ml-auto font-medium text-primary">
                {character.gold.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-error" />
              <span className="text-base-content/60">HKs</span>
              <span className="ml-auto font-medium">
                {character.honorableKills.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Arena ratings */}
          {(character.arenaRating2v2 > 0 || character.arenaRating3v3 > 0) && (
            <div className="flex items-center gap-4 rounded-lg bg-base-200 p-2">
              <Trophy className="h-4 w-4 text-primary" />
              {character.arenaRating2v2 > 0 && (
                <div className="text-sm">
                  <span className="text-base-content/60">2v2:</span>{" "}
                  <span className="font-bold">{character.arenaRating2v2}</span>
                </div>
              )}
              {character.arenaRating3v3 > 0 && (
                <div className="text-sm">
                  <span className="text-base-content/60">3v3:</span>{" "}
                  <span className="font-bold">{character.arenaRating3v3}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Faction badge */}
        <span
          className={`badge badge-outline absolute right-4 top-4 text-xs ${
            character.faction === "Horda" ? "border-red-500 text-red-500" : "border-blue-500 text-blue-500"
          }`}
        >
          {character.faction}
        </span>
      </div>
    </div>
  )
}

export default CharacterCard
