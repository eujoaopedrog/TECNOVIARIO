import { ShoppingBag, Store as StoreIcon } from 'lucide-react'
import type { ProductStore } from '../types/product'

interface StoreBadgeProps {
  store?: ProductStore
}

export function storeName(store: ProductStore): string {
  if (store === 'amazon') return 'Amazon'
  if (store === 'kabum') return 'KaBuM!'
  return 'Mercado Livre'
}

export function StoreBadge({ store }: StoreBadgeProps) {
  if (!store) return null
  const Icon = store === 'amazon' ? ShoppingBag : StoreIcon
  return (
    <span className={`store-badge store-badge-${store}`}>
      <Icon size={14} aria-hidden="true" />
      {storeName(store)}
    </span>
  )
}
