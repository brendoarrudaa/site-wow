import { useState, useEffect } from 'react'
import { X, AlertCircle, Package, DollarSign, Tag } from 'lucide-react'
import { buildIdempotencyKey } from '../../lib/idempotency'

interface CreateListingModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Character {
  guid: number
  name: string
  race: number
  class: number
  level: number
}

interface InventoryItem {
  item_guid: number
  item_entry: number
  item_name?: string
  count: number
  quality?: number
}

const CATEGORIES = [
  { value: 'MOUNT', label: 'Montaria' },
  { value: 'PET', label: 'Pet' },
  { value: 'TRANSMOG', label: 'Transmog' },
  { value: 'CONSUMABLE', label: 'Consumível' },
  { value: 'BAG', label: 'Bolsa' },
  { value: 'OTHER', label: 'Outro' }
]

const RARITIES = [
  { value: 'COMMON', label: 'Comum', color: 'text-gray-400' },
  { value: 'UNCOMMON', label: 'Incomum', color: 'text-green-400' },
  { value: 'RARE', label: 'Raro', color: 'text-blue-400' },
  { value: 'EPIC', label: 'Épico', color: 'text-purple-400' }
]

export default function CreateListingModal({
  isOpen,
  onClose,
  onSuccess
}: CreateListingModalProps) {
  const [step, setStep] = useState(1) // 1: Selecionar char, 2: Selecionar item, 3: Definir preço
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedChar, setSelectedChar] = useState<number | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    item_entry: 0,
    item_count: 1,
    price: 100,
    category: 'OTHER' as string,
    rarity: 'COMMON' as string
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchCharacters()
      resetForm()
    }
  }, [isOpen])

  const resetForm = () => {
    setStep(1)
    setSelectedChar(null)
    setSelectedItem(null)
    setInventory([])
    setFormData({
      item_entry: 0,
      item_count: 1,
      price: 100,
      category: 'OTHER',
      rarity: 'COMMON'
    })
    setError(null)
  }

  const fetchCharacters = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/account/characters')
      const result = await response.json()

      // /api/account/characters retorna { characters: [...] } diretamente
      if (result.characters) {
        setCharacters(result.characters || [])
      }
    } catch (err) {
      console.error('Error fetching characters:', err)
      setError('Erro ao carregar personagens')
    } finally {
      setLoading(false)
    }
  }

  const fetchInventory = async (charGuid: number) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/account/inventory?characterGuid=${charGuid}`)
      const result = await response.json()

      if (result.success) {
        setInventory(result.data.items || [])
      } else {
        setError(result.error || 'Erro ao carregar inventário')
      }
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setError('Erro ao carregar inventário')
    } finally {
      setLoading(false)
    }
  }

  const selectCharacter = (charGuid: number) => {
    setSelectedChar(charGuid)
    fetchInventory(charGuid)
    setStep(2)
  }

  const selectItem = (item: InventoryItem) => {
    setSelectedItem(item.item_guid)
    setFormData({
      ...formData,
      item_entry: item.item_entry,
      item_count: Math.min(item.count, 1) // Max 1 por listing no MVP
    })
    setStep(3)
  }

  const createListing = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!selectedChar) {
        setError('Selecione um personagem')
        return
      }

      const response = await fetch('/api/marketplace-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': buildIdempotencyKey(
            'marketplace-create',
            selectedChar
          )
        },
        body: JSON.stringify({
          character_guid: selectedChar,
          item_entry: formData.item_entry,
          item_count: formData.item_count,
          price: formData.price,
          category: formData.category,
          rarity: formData.rarity
        })
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
        onClose()
        alert('Venda criada com sucesso! Aguarde aprovação da staff.')
      } else {
        setError(result.error || 'Erro ao criar venda')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
      console.error('Error creating listing:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const selectedItemData = inventory.find(i => i.item_guid === selectedItem)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card bg-base-100 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="card-body">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Criar Venda no Marketplace</h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <ul className="steps steps-horizontal w-full mb-6">
            <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>
              Personagem
            </li>
            <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Item</li>
            <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>Preço</li>
          </ul>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-4">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Select Character */}
          {step === 1 && (
            <div>
              <h4 className="text-lg font-bold mb-4">Selecione o Personagem</h4>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-16"></div>
                  ))}
                </div>
              ) : characters.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-base-content/70">
                    Nenhum personagem encontrado
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {characters.map(char => (
                    <button
                      key={char.guid}
                      className="btn btn-outline w-full justify-start"
                      onClick={() => selectCharacter(char.guid)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-10">
                            <span>{char.level}</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-bold">{char.name}</div>
                          <div className="text-xs text-base-content/60">
                            Level {char.level}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Item */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold">Selecione o Item</h4>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setStep(1)}
                >
                  Voltar
                </button>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="skeleton h-20"></div>
                  ))}
                </div>
              ) : inventory.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-base-content/30 mx-auto mb-2" />
                  <p className="text-base-content/70">Nenhum item disponível</p>
                  <p className="text-sm text-base-content/50 mt-1">
                    Apenas itens da whitelist aparecem aqui
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inventory.map(item => (
                    <button
                      key={item.item_guid}
                      className="btn btn-outline w-full justify-start h-auto py-3"
                      onClick={() => selectItem(item)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Package className="h-8 w-8" />
                        <div className="text-left flex-1">
                          <div className="font-bold">
                            {item.item_name || `Item #${item.item_entry}`}
                          </div>
                          <div className="text-xs text-base-content/60">
                            Quantidade: {item.count}x
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Set Price & Details */}
          {step === 3 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold">Definir Preço e Categoria</h4>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setStep(2)}
                >
                  Voltar
                </button>
              </div>

              {/* Selected Item Preview */}
              {selectedItemData && (
                <div className="card bg-base-200 mb-6">
                  <div className="card-body py-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-8 w-8 text-primary" />
                      <div>
                        <div className="font-bold">
                          {selectedItemData.item_name ||
                            `Item #${selectedItemData.item_entry}`}
                        </div>
                        <div className="text-sm text-base-content/60">
                          {selectedItemData.count}x disponível
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                {/* Price */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Preço (DP)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="50000"
                    className="input input-bordered"
                    value={formData.price}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        price: parseInt(e.target.value) || 0
                      })
                    }
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Você receberá:{' '}
                      {Math.floor(formData.price * 0.95).toLocaleString()} DP
                      (taxa 5%)
                    </span>
                  </label>
                </div>

                {/* Category */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      <Tag className="h-4 w-4 inline mr-1" />
                      Categoria
                    </span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rarity */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Raridade</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.rarity}
                    onChange={e =>
                      setFormData({ ...formData, rarity: e.target.value })
                    }
                  >
                    {RARITIES.map(rar => (
                      <option key={rar.value} value={rar.value}>
                        {rar.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Info Alert */}
                <div className="alert alert-info">
                  <AlertCircle className="h-5 w-5" />
                  <div className="text-sm">
                    <p>
                      Sua venda será enviada para aprovação da staff. O item
                      será removido do seu inventário apenas após aprovação e
                      venda.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card-actions justify-end mt-6">
            <button
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            {step === 3 && (
              <button
                className="btn btn-primary"
                onClick={createListing}
                disabled={
                  loading || formData.price < 10 || formData.price > 50000
                }
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Criando...
                  </>
                ) : (
                  'Criar Venda'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
