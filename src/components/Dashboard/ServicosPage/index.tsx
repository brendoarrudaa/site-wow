import { useState } from "react"
import {
  MapPin, Repeat, Users, Edit, Palette, RotateCcw,
  Coins, Shield, AlertTriangle, CheckCircle, ChevronDown,
} from "lucide-react"
import { mockUser, services, classColors } from "@/lib/mock-data"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MapPin, Repeat, Users, Edit, Palette, RotateCcw,
}

const ServicosPage = () => {
  const [selectedChar, setSelectedChar] = useState(mockUser.characters[0]?.id ?? "")
  const [selectOpen, setSelectOpen] = useState(false)
  const [confirmService, setConfirmService] = useState<string | null>(null)

  const character = mockUser.characters.find((c) => c.id === selectedChar)
  const service = services.find((s) => s.id === confirmService)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif glow-text">Serviços de Personagem</h1>
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
                  <span className={classColors[character.class]}>{character.name}</span>
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
                {mockUser.characters.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedChar(c.id); setSelectOpen(false) }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-base-200"
                  >
                    <span className={classColors[c.class]}>{c.name}</span>
                    <span className="text-base-content/50">— {c.class} Lv.{c.level}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {character && (
            <div className="flex items-center gap-3 rounded-lg border border-base-300 bg-base-200/50 px-4 py-2">
              <Shield className={`h-5 w-5 ${classColors[character.class]}`} />
              <div>
                <p className="font-semibold">{character.name}</p>
                <p className="text-xs text-base-content/50">
                  {character.class} — {character.race}
                </p>
              </div>
              <span className={`badge badge-outline badge-sm ml-2 ${
                character.faction === "Horda"
                  ? "border-red-500 text-red-500"
                  : "border-blue-500 text-blue-500"
              }`}>
                {character.faction}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Balance */}
      <div className="flex items-center gap-3 rounded-lg border border-base-300 bg-card-fantasy p-4">
        <Coins className="h-5 w-5 text-primary" />
        <span className="text-base-content/60">Seus Pontos de Doação:</span>
        <span className="text-lg font-bold text-primary">
          {mockUser.donationPoints.toLocaleString()} DP
        </span>
      </div>

      {/* Services grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((svc) => {
          const Icon = iconMap[svc.icon] ?? Shield
          const canAfford = svc.price === 0 || mockUser.donationPoints >= svc.price

          return (
            <div
              key={svc.id}
              className={`card-fantasy flex flex-col p-5 transition-all ${
                !canAfford ? "opacity-60" : "hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className={`badge badge-sm ${
                  svc.price === 0 ? "badge-success" : "badge-outline"
                }`}>
                  {svc.price === 0 ? "Grátis" : `${svc.price} DP`}
                </span>
              </div>
              <h3 className="mt-4 font-bold">{svc.name}</h3>
              <p className="mt-1 flex-1 text-sm text-base-content/60">{svc.description}</p>
              <button
                className={`btn btn-sm mt-4 w-full ${
                  svc.price === 0 ? "btn-primary" : "btn-outline"
                }`}
                disabled={!selectedChar || !canAfford}
                onClick={() => setConfirmService(svc.id)}
              >
                {!selectedChar
                  ? "Selecione um personagem"
                  : !canAfford
                  ? "Pontos insuficientes"
                  : "Usar Serviço"}
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
              desc: "Certifique-se de que o personagem está deslogado antes de executar qualquer serviço.",
            },
            {
              title: "Serviços não são reembolsáveis",
              desc: "Uma vez executado, o serviço não pode ser desfeito ou reembolsado.",
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
          <div className="fixed inset-0 bg-black/50" onClick={() => setConfirmService(null)} />
          <div className="relative z-50 w-full max-w-md rounded-lg border border-base-300 bg-base-100 p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-semibold">{service.name}</h2>
            <p className="mb-5 text-sm text-base-content/60">Confirme a execução do serviço</p>

            <div className="space-y-4">
              {/* Selected character */}
              <div className="rounded-lg border border-base-300 p-4">
                <p className="mb-2 text-sm text-base-content/60">Personagem selecionado</p>
                <div className="flex items-center gap-3">
                  <Shield className={`h-8 w-8 ${classColors[character.class]}`} />
                  <div>
                    <p className="font-bold">{character.name}</p>
                    <p className="text-sm text-base-content/50">
                      {character.class} — {character.race} — Level {character.level}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {service.id === "unstuck" && (
                <div className="flex items-start gap-3 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span>
                    Seu personagem será teleportado para{" "}
                    {character.faction === "Horda" ? "Orgrimmar" : "Stormwind"}.
                    Certifique-se de que está deslogado.
                  </span>
                </div>
              )}
              {service.id === "faction-change" && (
                <div className="flex items-start gap-3 rounded-lg border border-error/50 bg-error/10 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
                  <span>
                    Trocar de facção irá remover seu personagem da guild atual e resetar
                    sua reputação com facções opostas.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg bg-base-200 p-3">
                <span>Custo do serviço</span>
                <span className="font-bold text-primary">
                  {service.price === 0 ? "Grátis" : `${service.price} DP`}
                </span>
              </div>

              {service.price > 0 && (
                <p className="flex items-center justify-between text-sm text-base-content/50">
                  <span>Saldo após o serviço</span>
                  <span>{(mockUser.donationPoints - service.price).toLocaleString()} DP</span>
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmService(null)}
              >
                Cancelar
              </button>
              <button className="btn btn-primary btn-sm gap-2">
                <CheckCircle className="h-4 w-4" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServicosPage
