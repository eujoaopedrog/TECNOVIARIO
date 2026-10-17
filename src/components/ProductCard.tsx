import { useState } from 'react'
import { ArrowUpRight, CircuitBoard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCurrentPrice } from '../services/productService'
import type { Product } from '../types/product'

interface ProductCardProps {
  product: Product
  compact?: boolean
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const keySpecs = Object.entries(product.specifications).slice(0, 2)
  const currentPrice = getCurrentPrice(product)
  return (
    <article className={`product-card${compact ? ' product-card-compact' : ''}`}>
      <Link className="product-visual" to={`/produto/${product.slug}`} aria-label={`Ver detalhes de ${product.name}`}>
        {product.image && !imageFailed ? (
          <img src={product.image} alt={product.name} loading="lazy" width="320" height="220" onError={() => setImageFailed(true)} />
        ) : (
          <div className="product-placeholder" aria-label="Imagem do produto não disponível">
            <span className="placeholder-orbit orbit-one" /><span className="placeholder-orbit orbit-two" />
            <CircuitBoard size={compact ? 34 : 42} strokeWidth={1.3} />
            <small>Imagem não cadastrada</small>
          </div>
        )}
      </Link>
      <div className="product-card-content">
        <span className="product-category">{product.category}</span>
        <Link to={`/produto/${product.slug}`} className="product-title"><h3>{product.name}</h3></Link>
        <p className="product-byline">{product.brand} <span>·</span> {product.model}</p>
        <div className="product-specs">
          {keySpecs.map(([label, value]) => <span key={label}>{label}: {value}</span>)}
        </div>
        <div className="product-card-bottom">
          <span className={`product-card-price${currentPrice === undefined ? ' price-unavailable' : ''}`}>
            {currentPrice === undefined ? 'Preço não informado' : currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <Link className="card-link" to={`/produto/${product.slug}`} aria-label={`Ver ${product.name}`}>
            Ver produto <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  )
}
