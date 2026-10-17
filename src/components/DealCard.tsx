import type { Product } from '../types/product'
import { ProductCard } from './ProductCard'

interface DealCardProps {
  product: Product
}

// Deal cards extend the existing product card markup and keep its visual behavior consistent.
export function DealCard({ product }: DealCardProps) {
  return <ProductCard product={product} variant="deal" />
}
