import { useState } from "react"
import { ShoppingCart, Sparkles, Star, X } from "lucide-react"
import { ShopItem } from "@/lib/mock-data"

interface ShopItemCardProps {
  item: ShopItem
}

const rarityConfig = {
  common: {
    label: "Comum",
    border: "border-base-300",
    text: "text-base-content/60",
    bg: "bg-base-200",
  },
  uncommon: {
    label: "Incomum",
    border: "border-green-500/50",
    text: "text-green-500",
    bg: "bg-green-500/10",
  },
  rare: {
    label: "Raro",
    border: "border-blue-500/50",
    text: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  epic: {
    label: "Épico",
    border: "border-purple-500/50",
    text: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  legendary: {
    label: "Lendário",
    border: "border-primary/50",
    text: "text-primary",
    bg: "bg-primary/10",
  },
}

const categoryLabels: Record<ShopItem["category"], string> = {
  mount: "Montaria",
  pet: "Pet",
  transmog: "Transmog",
  consumable: "Consumível",
  bag: "Bolsa",
  service: "Serviço",
}

const ShopItemCard = ({ item }: ShopItemCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const rarity = rarityConfig[item.rarity]
  const category = categoryLabels[item.category]

  return (
    <>
      <div
        className={`card relative overflow-hidden border bg-base-100 transition-all hover:shadow-lg ${rarity.border}`}
      >
        {item.featured && (
          <div className="absolute right-0 top-0 z-10">
            <span className="flex items-center gap-1 rounded-bl-lg bg-primary px-2 py-1 text-[10px] font-semibold text-primary-content">
              <Star className="h-3 w-3 fill-current" />
              Destaque
            </span>
          </div>
        )}

        <div className="card-body p-4">
          <div
            className={`mb-4 flex h-24 w-full items-center justify-center rounded-lg ${rarity.bg}`}
          >
            <Sparkles className={`h-12 w-12 ${rarity.text}`} />
          </div>

          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-bold leading-tight ${
                  item.rarity === "legendary" ? "text-primary" : ""
                }`}
              >
                {item.name}
              </h3>
              <span className="badge badge-outline shrink-0 text-xs">{category}</span>
            </div>

            <p className="line-clamp-2 text-sm text-base-content/60">{item.description}</p>

            <span className={`badge badge-outline text-xs ${rarity.text} ${rarity.border}`}>
              {rarity.label}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-base-300 p-4">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-primary">
              {item.price.toLocaleString()}
            </span>
            <span className="text-sm text-base-content/60">{item.currency}</span>
          </div>

          <button
            onClick={() => setDialogOpen(true)}
            className="btn btn-primary btn-sm gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Comprar
          </button>
        </div>
      </div>

      {/* Confirm purchase modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setDialogOpen(false)}
          />
          <div className="relative z-50 w-full max-w-md rounded-lg border border-base-300 bg-base-100 p-6 shadow-xl">
            <button
              className="btn btn-ghost btn-xs btn-square absolute right-3 top-3"
              onClick={() => setDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="mb-1 text-lg font-semibold">Confirmar Compra</h2>
            <p className="mb-4 text-sm text-base-content/60">
              Você está prestes a comprar este item.
            </p>

            <div className="rounded-lg border border-base-300 p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg ${rarity.bg}`}
                >
                  <Sparkles className={`h-8 w-8 ${rarity.text}`} />
                </div>
                <div>
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-sm text-base-content/60">
                    {category} — {rarity.label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-primary">
                    {item.price.toLocaleString()} {item.currency}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-base-content/60">{item.description}</p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary btn-sm">Confirmar Compra</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ShopItemCard
