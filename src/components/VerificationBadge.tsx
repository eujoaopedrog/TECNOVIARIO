import { Clock3 } from 'lucide-react'
import { getVerificationAgeHours } from '../services/productService'
import type { Product } from '../types/product'

interface VerificationBadgeProps {
  product: Pick<Product, 'lastCheckedAt'>
}

export function VerificationBadge({ product }: VerificationBadgeProps) {
  const hours = getVerificationAgeHours(product)
  if (hours === undefined) return null
  const tone = hours < 24 ? 'fresh' : hours <= 72 ? 'aging' : 'stale'

  return (
    <span className={`verification-badge verification-${tone}`}>
      <Clock3 size={13} aria-hidden="true" />
      Verificado há {hours}h
    </span>
  )
}
