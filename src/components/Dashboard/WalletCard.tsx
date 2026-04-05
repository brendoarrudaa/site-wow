import { useEffect, useState } from 'react'
import { Coins, TrendingUp } from 'lucide-react'

type WalletBalance = {
  dp: number
  vp: number
}

export default function WalletCard() {
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/wallet-balance')
      const result = await response.json()

      if (result.success) {
        setBalance(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to load balance')
      }
    } catch (err) {
      setError('Network error')
      console.error('Error fetching balance:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-3">
            <div className="skeleton h-12 w-12 rounded-full"></div>
            <div className="flex-1">
              <div className="skeleton h-4 w-24 mb-2"></div>
              <div className="skeleton h-6 w-32"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* DP Card */}
      <div className="card bg-linear-to-br from-primary/20 to-primary/5 border border-primary/30 shadow-lg hover:shadow-xl transition-shadow">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-full">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-base-content/70">Donation Points</p>
                <h3 className="text-3xl font-bold text-primary">
                  {balance?.dp?.toLocaleString() || 0}
                </h3>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-base-content/60">
              Usado para leilões e marketplace
            </p>
          </div>
        </div>
      </div>

      {/* VP Card */}
      <div className="card bg-linear-to-br from-primary/20 to-primary/5 border border-primary/30 shadow-lg hover:shadow-xl transition-shadow">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-base-content/70">Check Points</p>
                <h3 className="text-3xl font-bold text-primary">
                  {balance?.vp?.toLocaleString() || 0}
                </h3>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-base-content/60">
              Ganhe ficando online diariamente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
