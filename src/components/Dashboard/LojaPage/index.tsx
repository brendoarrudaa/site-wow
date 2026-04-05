import { useState } from "react"
import { Search, Coins, Sparkles, ShoppingBag } from "lucide-react"
import { mockShopItems, mockUser } from "@/lib/mock-data"
import ShopItemCard from "@/components/Dashboard/ShopItemCard"

const categories = [
  { value: "all", label: "Todos" },
  { value: "mount", label: "Montarias" },
  { value: "pet", label: "Pets" },
  { value: "transmog", label: "Transmog" },
  { value: "consumable", label: "Consumíveis" },
  { value: "bag", label: "Bolsas" },
  { value: "service", label: "Serviços" },
]

const rarities = [
  { value: "all", label: "Todas" },
  { value: "legendary", label: "Lendário" },
  { value: "epic", label: "Épico" },
  { value: "rare", label: "Raro" },
  { value: "uncommon", label: "Incomum" },
  { value: "common", label: "Comum" },
]

const sortOptions = [
  { value: "featured", label: "Destaques" },
  { value: "price-asc", label: "Menor Preço" },
  { value: "price-desc", label: "Maior Preço" },
  { value: "name", label: "Nome A-Z" },
]

const LojaPage = () => {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [rarity, setRarity] = useState("all")
  const [sortBy, setSortBy] = useState("featured")

  const filtered = mockShopItems
    .filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === "all" || item.category === category
      const matchRar = rarity === "all" || item.rarity === rarity
      return matchSearch && matchCat && matchRar
    })
    .sort((a, b) => {
      if (sortBy === "featured") {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return 0
      }
      if (sortBy === "price-asc") return a.price - b.price
      if (sortBy === "price-desc") return b.price - a.price
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return 0
    })

  const hasFilters = search || category !== "all" || rarity !== "all"

  const clearFilters = () => {
    setSearch("")
    setCategory("all")
    setRarity("all")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif glow-text">Loja</h1>
          <p className="text-sm text-base-content/60">
            Compre montarias, pets e muito mais com seus pontos
          </p>
        </div>

        {/* Points balance */}
        <div className="card-fantasy flex items-center gap-4 px-4 py-2">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" />
            <span className="font-bold text-primary">
              {mockUser.donationPoints.toLocaleString()}
            </span>
            <span className="text-xs text-base-content/50">DP</span>
          </div>
          <div className="h-4 w-px bg-base-300" />
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-secondary" />
            <span className="font-bold text-secondary">{mockUser.votePoints}</span>
            <span className="text-xs text-base-content/50">VP</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-fantasy p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              placeholder="Buscar itens..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select select-bordered select-sm w-36"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            <select
              value={rarity}
              onChange={(e) => setRarity(e.target.value)}
              className="select select-bordered select-sm w-32"
            >
              {rarities.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select select-bordered select-sm w-36"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {hasFilters && (
              <button onClick={clearFilters} className="btn btn-ghost btn-sm">
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="mb-4 text-sm text-base-content/50">
          Mostrando {filtered.length} de {mockShopItems.length} itens
        </p>

        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <ShopItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="card-fantasy flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="h-12 w-12 text-base-content/20" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum item encontrado</h3>
            <p className="text-sm text-base-content/50">Tente ajustar os filtros de busca</p>
            <button onClick={clearFilters} className="btn btn-outline btn-sm mt-4">
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* How to get points */}
      <div className="card-fantasy p-6">
        <h3 className="mb-4 font-bold">Como conseguir pontos?</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-base-300 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Pontos de Doação (DP)</h4>
                <p className="text-sm text-base-content/60">
                  Obtidos através de doações para o servidor
                </p>
              </div>
            </div>
            <button className="btn btn-outline btn-sm mt-3 w-full">Fazer Doação</button>
          </div>

          <div className="rounded-lg border border-base-300 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <Sparkles className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h4 className="font-semibold">Check Points (CP)</h4>
                <p className="text-sm text-base-content/60">
                  Fique 5 minutos online no jogo e ganhe CP diariamente
                </p>
              </div>
            </div>
            <button className="btn btn-outline btn-sm mt-3 w-full" disabled>Automático</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LojaPage
