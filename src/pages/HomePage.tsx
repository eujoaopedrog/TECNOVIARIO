import {
  ArrowRight, AudioLines, Cpu, HardDrive, Laptop, MemoryStick, Monitor, Mouse, PanelsTopLeft, PlugZap, Search, Wrench,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { DealCard } from '../components/DealCard'
import { PageMeta } from '../components/PageMeta'
import { StoreBadge } from '../components/StoreBadge'
import { guides } from '../data/guides'
import { getActiveOffers, getCategories, getDealTag, getOfferActivity } from '../services/productService'
import type { Product } from '../types/product'

const categoryIcons: Record<string, typeof Cpu> = {
  Processadores: Cpu,
  'Placas de vídeo': PanelsTopLeft,
  'Memórias RAM': MemoryStick,
  'SSDs e armazenamento': HardDrive,
  'Placas-mãe': PanelsTopLeft,
  'Fontes e gabinetes': PlugZap,
  Monitores: Monitor,
  'Teclados e mouses': Mouse,
  Headsets: AudioLines,
  'Notebooks e acessórios': Laptop,
}

export function HomePage() {
  const categories = getCategories()
  const offers = getActiveOffers({ sort: 'recent' })
  const activity = getOfferActivity()
  const dailyDeals = offers.slice(0, 8)
  const lowestPrices = offers.filter((product) => getDealTag(product) === 'menor-preco-30d').slice(0, 4)
  const recentDrops = offers.filter((product) => getDealTag(product) === 'acabou-de-cair').slice(0, 4)
  const trending = offers.filter((product) => getDealTag(product) === 'em-alta').slice(0, 4)
  const selectedGuides = guides.slice(0, 3)
  const offerCategories = new Set(offers.map((product) => product.category))
  const latestCheckedAt = activity.latestCheckedAt
  const latestCheckLabel = latestCheckedAt
    ? (() => {
        const checkedAt = new Date(latestCheckedAt)
        const today = new Date()
        const sameDay = checkedAt.getFullYear() === today.getFullYear()
          && checkedAt.getMonth() === today.getMonth()
          && checkedAt.getDate() === today.getDate()
        const date = sameDay
          ? 'hoje'
          : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(checkedAt)
        const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(checkedAt)
        return `${date} às ${time}`
      })()
    : undefined

  function OfferSection({ title, kicker, products: sectionProducts }: { title: string; kicker: string; products: Product[] }) {
    if (!sectionProducts.length) return null
    return (
      <section className="deal-section page-shell">
        <div className="section-heading">
          <div><span className="section-kicker">{kicker}</span><h2>{title}</h2></div>
          <Link className="text-link" to="/ofertas">Ver todas <ArrowRight size={16} /></Link>
        </div>
        <div className="product-grid deal-grid">{sectionProducts.map((product) => <DealCard key={product.id} product={product} />)}</div>
      </section>
    )
  }

  return (
    <>
      <PageMeta title="Achadinhos de hardware, atualizados todos os dias" description="Ofertas selecionadas da Amazon e do Mercado Livre, com preço verificado e data de atualização." />
      <main>
        <section className="hero page-shell">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-line" /> HARDWARE ESCOLHIDO COM CRITÉRIO</span>
            <h1>Achadinhos de hardware, <span>atualizados todos os dias</span></h1>
            <p>Ofertas selecionadas da Amazon e do Mercado Livre, com preço verificado e data de atualização.</p>
            <div className="home-hero-stores"><StoreBadge store="amazon" /><StoreBadge store="mercadolivre" /></div>
            <div className="home-hero-actions">
              <Link className="button-primary" to="/ofertas">Ver achados de hoje <ArrowRight size={17} /></Link>
              <Link className="home-search-link" to="/pesquisa">Pesquisar produto</Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-grid" />
            <div className="art-card art-card-main">
              <div className="art-chip"><Cpu size={30} /></div>
              <span>PREÇO + ORIGEM + ATUALIZAÇÃO</span>
              <strong>Mais clareza para encontrar um bom preço.</strong>
              <div className="art-lines"><i /><i /><i /></div>
            </div>
            <div className="art-chip-float"><MemoryStick size={22} /></div>
            <div className="art-storage-float"><HardDrive size={21} /><span>Ofertas verificadas<br /><b>Amazon + Mercado Livre</b></span></div>
            <span className="art-orbit art-orbit-a" /><span className="art-orbit art-orbit-b" />
          </div>
        </section>
        <div className="offer-status page-shell" role="status">
          <span className="offer-status-dot" />
          <span>{activity.count} {activity.count === 1 ? 'oferta ativa' : 'ofertas ativas'}</span>
          <span aria-hidden="true">·</span>
          <span>{latestCheckLabel ? `Última verificação ${latestCheckLabel}` : 'Nenhuma oferta verificada nas últimas 24 horas'}</span>
        </div>

        <section className="category-section page-shell">
          <div className="section-heading">
            <div><span className="section-kicker">ATALHOS DE HARDWARE</span><h2>Explore por categoria</h2></div>
            <Link className="text-link" to="/ofertas">Todas as ofertas <ArrowRight size={16} /></Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => {
              const Icon = categoryIcons[category] ?? Search
              if (!offerCategories.has(category)) return null
              const count = offers.filter((product) => product.category === category).length
              return (
                <Link key={category} to={`/ofertas?category=${encodeURIComponent(category)}`} className="category-tile">
                  <span className="category-icon"><Icon size={21} strokeWidth={1.8} /></span>
                  <span><strong>{category}</strong><small>{count} {count === 1 ? 'oferta ativa' : 'ofertas ativas'}</small></span>
                  <ArrowRight size={15} className="category-arrow" />
                </Link>
              )
            })}
          </div>
        </section>

        <OfferSection title="Achados do dia" kicker="OFERTAS ATUALIZADAS" products={dailyDeals} />
        <OfferSection title="Menor preço em 30 dias" kicker="HISTÓRICO CONFIRMADO" products={lowestPrices} />
        <OfferSection title="Acabou de cair o preço" kicker="QUEDA RECENTE" products={recentDrops} />
        <OfferSection title="Em alta esta semana" kicker="DESTAQUES DA SEMANA" products={trending} />

        <section className="guides-section page-shell guides-secondary">
          <div className="section-heading">
            <div><span className="section-kicker">PARA COMPRAR COM MAIS CONTEXTO</span><h2>Guias e comparativos</h2></div>
            <Link className="text-link" to="/guias">Todos os guias <ArrowRight size={16} /></Link>
          </div>
          <div className="guide-grid">
            {selectedGuides.map((guide, index) => (
              <Link className={`guide-card guide-card-${index + 1}`} to={`/guias/${guide.slug}`} key={guide.slug}>
                <div className="guide-art"><span className="guide-art-label">{guide.category}</span><span className="guide-art-number">0{index + 1}</span><HardDrive size={26} strokeWidth={1.4} /></div>
                <div className="guide-content"><span>{guide.readTime}</span><h3>{guide.title}</h3><p>{guide.summary}</p><strong>Ler guia <ArrowRight size={15} /></strong></div>
              </Link>
            ))}
          </div>
        </section>
        <section className="closing-cta page-shell builder-cta">
          <div><span className="section-kicker">PLANEJE SEU PRÓXIMO SETUP</span><h2>Monte um PC peça por peça, compare preços atuais e confira a compatibilidade.</h2></div>
          <Link className="button-primary" to="/montar-pc"><Wrench size={17} /> Montar meu PC <ArrowRight size={17} /></Link>
        </section>
      </main>
    </>
  )
}
