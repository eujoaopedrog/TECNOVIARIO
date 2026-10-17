import { getDiscountPercent } from '../services/productService'

interface PriceTagProps {
  price?: number
  originalPrice?: number
  discountPercent?: number
  large?: boolean
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function PriceTag({ price, originalPrice, discountPercent, large = false }: PriceTagProps) {
  if (price === undefined || !Number.isFinite(price) || price < 0) return null
  const hasRealDiscount = originalPrice !== undefined
    && Number.isFinite(originalPrice)
    && originalPrice > price
    && discountPercent !== undefined
    && discountPercent > 0

  return (
    <span className={`price-tag${large ? ' price-tag-large' : ''}`}>
      {hasRealDiscount && <span className="price-tag-original">De {formatPrice(originalPrice)}</span>}
      <span className="price-tag-current">Por {formatPrice(price)}</span>
      {hasRealDiscount && <span className="discount-badge">-{discountPercent}%</span>}
    </span>
  )
}

export function productPriceTagProps(product: { price?: number; originalPrice?: number; discountPercent?: number }) {
  return {
    price: product.price,
    originalPrice: product.originalPrice,
    discountPercent: getDiscountPercent(product),
  }
}
