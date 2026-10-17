import { useState } from 'react'
import { ArrowUpRight, CircuitBoard, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCurrentPrice, getDealTag } from '../services/productService'
import type { Product } from '../types/product'
import { PriceTag, productPriceTagProps } from './PriceTag'
import { StoreBadge, storeName } from './StoreBadge'
import { VerificationBadge } from './VerificationBadge'

interface ProductCardProps {
  product: Product
  compact?: boolean
  variant?: 'catalog' | 'deal'
}

export function ProductCard({ product, compact = false, variant = 'catalog' }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const [imageLoading, setImageLoading] = useState(Boolean(product.image))
  // Favorites stay component-local to match the site's no-local-storage privacy policy.
  const [favorite, setFavorite] = useState(false)
  const keySpecs = Object.entries(product.specifications).slice(0, 2)
  const currentPrice = getCurrentPrice(product)
  const isDeal = variant === 'deal'
  const storeLabel = product.store ? storeName(product.store) : undefined
  const isUnavailable = product.available === false
  const dealTag = isDeal ? getDealTag(product) : undefined
  const dealTagLabel = dealTag === 'menor-preco-30d'
    ? 'Menor preço em 30 dias'
    : dealTag === 'acabou-de-cair'
      ? 'Acabou de cair'
      : dealTag === 'em-alta'
        ? 'Em alta esta semana'
        : dealTag === 'novo'
          ? 'Novo'
          : undefined
  return (
    <article className={`product-card${compact ? ' product-card-compact' : ''}${isDeal ? ' deal-card' : ''}${isUnavailable ? ' deal-card-unavailable' : ''}`}>
      <div className="product-media">
        <Link className="product-visual" to={`/produto/${product.slug}`} aria-label={`Ver detalhes de ${product.name}`}>
        {product.image && !imageFailed ? (
          <img
            className={imageLoading ? 'product-image-loading' : undefined}
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width="320"
            height="220"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false)
              setImageFailed(true)
            }}
          />
        ) : (
          <div className="product-placeholder" aria-label="Imagem do produto não disponível">
            <span className="placeholder-orbit orbit-one" /><span className="placeholder-orbit orbit-two" />
            <CircuitBoard size={compact ? 34 : 42} strokeWidth={1.3} />
            <small>Imagem não cadastrada</small>
          </div>
        )}
        </Link>
        <button
          className={`favorite-toggle${favorite ? ' favorite-active' : ''}`}
          type="button"
          aria-label={favorite ? `Remover ${product.name} dos favoritos` : `Adicionar ${product.name} aos favoritos`}
          aria-pressed={favorite}
          onClick={() => setFavorite((active) => !active)}
        >
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
        </button>
        {isUnavailable && <span className="deal-unavailable-overlay">Oferta indisponível</span>}
      </div>
      <div className="product-card-content">
        <div className="product-meta-badges">
          <span className="product-category">{product.category}</span>
          <StoreBadge store={product.store} />
          {dealTagLabel && <span className={`deal-tag-badge deal-tag-${dealTag}`}>{dealTagLabel}</span>}
        </div>
        <Link to={`/produto/${product.slug}`} className="product-title"><h3>{product.name}</h3></Link>
        <p className="product-byline">{product.brand} <span>·</span> {product.model}</p>
        <VerificationBadge product={product} />
        <div className="product-specs">
          {keySpecs.map(([label, value]) => <span key={label}>{label}: {value}</span>)}
        </div>
        <div className="product-card-bottom">
          {isDeal
            ? <PriceTag {...productPriceTagProps({ ...product, price: currentPrice })} />
            : <span className={`product-card-price${currentPrice === undefined ? ' price-unavailable' : ''}`}>
                {currentPrice === undefined ? 'Consultar preço na loja' : currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>}
          {isDeal ? (
            product.affiliateUrl && !isUnavailable && storeLabel
              ? <>
                  <a className="card-link" href={product.affiliateUrl} target="_blank" rel="nofollow sponsored noreferrer">Ver oferta na {storeLabel} <ArrowUpRight size={16} /></a>
                  <p className="card-affiliate-disclosure">
                    {product.store === 'amazon'
                      ? 'Como associado da Amazon, podemos receber comissão por compras qualificadas, sem custo adicional.'
                      : 'Este link pode gerar comissão por uma compra qualificada, sem custo adicional.'}
                  </p>
                </>
              : <button className="card-link" type="button" disabled>Oferta indisponível</button>
          ) : (
            <Link className="card-link" to={`/produto/${product.slug}`} aria-label={`Ver ${product.name}`}>
              Ver produto <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
