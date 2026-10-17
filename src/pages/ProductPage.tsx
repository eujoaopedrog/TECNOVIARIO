import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, Check, CircuitBoard, Share2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import { ProductCard } from '../components/ProductCard'
import { getCurrentPrice, getProductBySlug, getRelatedProducts } from '../services/productService'

export function ProductPage() {
  const { slug = '' } = useParams()
  const product = getProductBySlug(slug)
  const [failedImage, setFailedImage] = useState('')

  if (!product) {
    return <main className="page-shell not-found"><h1>Produto não encontrado</h1><p>Este item não está no catálogo Tecnoviario.</p><Link className="button-primary" to="/pesquisa">Voltar ao catálogo</Link></main>
  }
  const related = getRelatedProducts(product.id)
  const currentPrice = getCurrentPrice(product)
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      window.dispatchEvent(new CustomEvent('toast', { detail: 'Link copiado para a área de transferência.' }))
    } catch (error) {
      console.error('Não foi possível copiar o link do produto.', error)
      window.dispatchEvent(new CustomEvent('toast', { detail: 'Não foi possível copiar o link neste navegador.' }))
    }
  }

  return (
    <main className="page-shell product-page">
      <PageMeta title={product.name} description={product.description} />
      <div className="breadcrumb"><Link to="/">Início</Link><span>/</span><Link to={`/pesquisa?categoria=${encodeURIComponent(product.category)}`}>{product.category}</Link><span>/</span><span>{product.name}</span></div>
      <Link className="back-link" to="/pesquisa"><ArrowLeft size={16} /> Voltar ao catálogo</Link>
      <div className="product-detail">
        <div className="detail-visual">
          {product.image && failedImage !== product.image ? (
            <div className="detail-product-image"><img src={product.image} alt={product.name} onError={() => setFailedImage(product.image ?? '')} /></div>
          ) : (
            <div className="detail-placeholder"><span className="placeholder-orbit orbit-one" /><span className="placeholder-orbit orbit-two" /><CircuitBoard size={58} strokeWidth={1.2} /><span>Imagem do produto não cadastrada</span></div>
          )}
        </div>
        <div className="detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-byline">{product.brand} <span>·</span> Modelo {product.model}</p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-action-box">
            <span className={`detail-price${currentPrice === undefined ? ' detail-price-missing' : ''}`}>
              {currentPrice === undefined
                ? 'Consulte o preço na loja'
                : currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            {product.affiliateUrl ? (
              <a className="button-primary" href={product.affiliateUrl} target="_blank" rel="nofollow sponsored noreferrer">Ver oferta na loja <ArrowUpRight size={17} /></a>
            ) : <button type="button" disabled className="button-primary">Link de compra não configurado</button>}
            {currentPrice !== undefined && <small>Preço e disponibilidade podem mudar na loja.</small>}
          </div>
          <button className="share-button" type="button" onClick={copyLink}><Share2 size={16} /> Compartilhar produto</button>
        </div>
      </div>
      <section className="spec-section">
        <div className="section-heading"><div><span className="section-kicker">DETALHES</span><h2>Especificações cadastradas</h2></div></div>
        <dl className="spec-list">{Object.entries(product.specifications).map(([label, value]) => <div key={label}><dt>{label}</dt><dd><Check size={15} />{value}</dd></div>)}</dl>
        <div className="data-source">Origem dos dados: {product.dataSource}</div>
      </section>
      {related.length > 0 && <section className="related-section"><div className="section-heading"><div><span className="section-kicker">CONTINUE EXPLORANDO</span><h2>Mais em {product.category}</h2></div><Link className="text-link" to={`/pesquisa?categoria=${encodeURIComponent(product.category)}`}>Ver categoria <ArrowUpRight size={16} /></Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} compact />)}</div></section>}
    </main>
  )
}
