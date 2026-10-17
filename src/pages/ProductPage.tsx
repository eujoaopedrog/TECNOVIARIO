import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, Check, CircuitBoard, Share2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { DealCard } from '../components/DealCard'
import { PageMeta } from '../components/PageMeta'
import { PriceSparkline } from '../components/PriceSparkline'
import { PriceTag, productPriceTagProps } from '../components/PriceTag'
import { ProductCard } from '../components/ProductCard'
import { StoreBadge, storeName } from '../components/StoreBadge'
import { VerificationBadge } from '../components/VerificationBadge'
import { getCurrentPrice, getDiscountPercent, getOtherOffers, getProductBySlug, getRelatedProducts } from '../services/productService'

export function ProductPage() {
  const { slug = '' } = useParams()
  const product = getProductBySlug(slug)
  const [failedImage, setFailedImage] = useState('')
  const [isSharing, setIsSharing] = useState(false)

  if (!product) {
    return <main className="page-shell not-found"><h1>Produto não encontrado</h1><p>Este item não está no catálogo Tecnoviario.</p><Link className="button-primary" to="/pesquisa">Voltar ao catálogo</Link></main>
  }
  const related = getRelatedProducts(product.id)
  const otherOffers = getOtherOffers(product.id)
  const currentPrice = getCurrentPrice(product)
  const discountPercent = currentPrice !== undefined
    ? getDiscountPercent({ ...product, price: currentPrice })
    : undefined
  const offerAvailable = Boolean(product.affiliateUrl && product.store && currentPrice !== undefined)
  const priceHistoryAvailable = (product.priceHistory?.length ?? 0) >= 3
  const affiliateNotice = product.store === 'amazon'
    ? 'Como associado da Amazon, podemos receber comissão por compras qualificadas, sem custo adicional para você.'
    : 'Este link pode gerar comissão por uma compra qualificada, sem custo adicional para você.'

  const copyLink = async () => {
    setIsSharing(true)
    try {
      await navigator.clipboard.writeText(window.location.href)
      window.dispatchEvent(new CustomEvent('toast', { detail: 'Link copiado para a área de transferência.' }))
    } catch (error) {
      console.error('Não foi possível copiar o link do produto.', error)
      window.dispatchEvent(new CustomEvent('toast', { detail: 'Não foi possível copiar o link neste navegador.' }))
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <main className="page-shell product-page">
      <PageMeta title={product.name} description={product.description} />
      <div className="breadcrumb"><Link to="/">Início</Link><span>/</span><Link to={`/ofertas?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><span>/</span><span>{product.name}</span></div>
      <Link className="back-link" to="/ofertas"><ArrowLeft size={16} /> Voltar às ofertas</Link>
      <div className="product-detail deal-product-detail">
        <aside className="detail-offer-column" aria-label="Oferta e imagem do produto">
          <div className="detail-visual">
            {product.image && failedImage !== product.image ? (
              <div className="detail-product-image"><img src={product.image} alt={product.name} width="640" height="420" loading="eager" decoding="async" onError={() => setFailedImage(product.image ?? '')} /></div>
            ) : (
              <div className="detail-placeholder"><span className="placeholder-orbit orbit-one" /><span className="placeholder-orbit orbit-two" /><CircuitBoard size={58} strokeWidth={1.2} /><span>Imagem do produto não cadastrada</span></div>
            )}
          </div>
          <div className="detail-offer-badges">
            <StoreBadge store={product.store} />
            {discountPercent !== undefined && <span className="discount-badge">-{discountPercent}%</span>}
          </div>
          {offerAvailable && product.store ? (
            <>
              <a className="button-primary detail-offer-cta" href={product.affiliateUrl} target="_blank" rel="nofollow sponsored noreferrer">
                Ver oferta na {storeName(product.store)} <ArrowUpRight size={17} />
              </a>
              <p className="affiliate-disclosure">{affiliateNotice}</p>
            </>
          ) : (
            <p className="detail-unavailable-note">Não há uma oferta disponível confirmada para este produto.</p>
          )}
        </aside>
        <div className="detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-byline">{product.brand} <span>·</span> Modelo {product.model}</p>
          {currentPrice !== undefined
            ? <PriceTag {...productPriceTagProps({ ...product, price: currentPrice })} large />
            : <p className="detail-price-missing">Preço sem atualização recente. Consulte o valor final na loja.</p>}
          <VerificationBadge product={product} />
          {priceHistoryAvailable && (
            <section className="detail-history" aria-label="Histórico de preço">
              <h2>Histórico de preço</h2>
              <PriceSparkline history={product.priceHistory} />
            </section>
          )}
          <p className="detail-description">{product.description}</p>
          <section className="spec-section detail-spec-section">
            <div className="section-heading"><div><span className="section-kicker">DETALHES TÉCNICOS</span><h2>Especificações cadastradas</h2></div></div>
            <dl className="spec-list">{Object.entries(product.specifications).map(([label, value]) => <div key={label}><dt>{label}</dt><dd><Check size={15} />{value}</dd></div>)}</dl>
            <div className="data-source">Origem das especificações: {product.dataSource}</div>
          </section>
          {product.editorialAssessment && (
            <section className="worth-it-section">
              <span className="section-kicker">ANÁLISE EDITORIAL</span>
              <h2>Vale a pena?</h2>
              <p>{product.editorialAssessment}</p>
            </section>
          )}
          <button className="share-button" type="button" onClick={copyLink} aria-busy={isSharing} disabled={isSharing}><Share2 size={16} /> Compartilhar produto</button>
        </div>
      </div>
      {otherOffers.length > 0 && (
        <section className="related-section">
          <div className="section-heading"><div><span className="section-kicker">COMPARE A LOJA</span><h2>Outras ofertas deste produto</h2></div></div>
          <div className="product-grid deal-grid">{otherOffers.map((offer) => <DealCard key={offer.id} product={offer} />)}</div>
        </section>
      )}
      {related.length > 0 && (
        <section className="related-section">
          <div className="section-heading"><div><span className="section-kicker">CONTINUE EXPLORANDO</span><h2>Produtos relacionados</h2></div><Link className="text-link" to={`/ofertas?category=${encodeURIComponent(product.category)}`}>Ver categoria <ArrowUpRight size={16} /></Link></div>
          <div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} compact />)}</div>
        </section>
      )}
      {offerAvailable && (
        <div className="mobile-offer-sticky">
          {currentPrice !== undefined && <PriceTag {...productPriceTagProps({ ...product, price: currentPrice })} />}
          <a className="button-primary" href={product.affiliateUrl} target="_blank" rel="nofollow sponsored noreferrer">
            Ver oferta{product.store ? ` na ${storeName(product.store)}` : ''}
          </a>
          <p className="affiliate-disclosure">{affiliateNotice}</p>
        </div>
      )}
    </main>
  )
}
