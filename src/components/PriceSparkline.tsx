import { useId } from 'react'
import type { Product } from '../types/product'

interface PriceSparklineProps {
  history?: Product['priceHistory']
}

export function PriceSparkline({ history }: PriceSparklineProps) {
  const gradientId = `price-line-${useId().replace(/:/g, '')}`
  const points = history?.slice(-7)
  if (!points || points.length < 3) return null
  const values = points.map((point) => point.price)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const plotted = values.map((value, index) => ({
    x: 4 + (index / (values.length - 1)) * 192,
    y: 4 + ((max - value) / range) * 44,
  }))
  const polyline = plotted.map((point) => `${point.x},${point.y}`).join(' ')
  const lastPoint = plotted[plotted.length - 1]

  return (
    <figure className="price-sparkline">
      <svg viewBox="0 0 200 56" role="img" aria-label={`Histórico recente: ${points.length} registros de preço`}>
        <title>Variação recente do preço</title>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity=".16" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`4,54 ${polyline} 196,54`} fill={`url(#${gradientId})`} />
        <polyline points={polyline} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill="#2563EB" />
      </svg>
    </figure>
  )
}
