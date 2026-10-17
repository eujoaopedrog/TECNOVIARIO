import {
  ArrowRight, AudioLines, Cpu, HardDrive, Laptop, MemoryStick, Monitor, Mouse, PanelsTopLeft, PlugZap, Search, ShieldCheck, Wrench,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { PageMeta } from '../components/PageMeta'
import { SearchBox } from '../components/SearchBox'
import { products } from '../data/products'
import { guides } from '../data/guides'
import { getCategories } from '../services/productService'

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
  const navigate = useNavigate()
  const categories = getCategories()
  const featured = products.slice(0, 4)
  const selectedGuides = guides.slice(0, 3)

  return (
    <>
      <PageMeta title="Tecnologia escolhida com inteligência" description="Pesquise produtos de tecnologia, entenda as especificações e encontre o que faz sentido para seu setup." />
      <main>
        <section className="hero page-shell">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-line" /> ESCOLHAS MAIS CLARAS, TECNOLOGIA MELHOR</span>
            <h1>Encontre a tecnologia <span>certa para você.</span></h1>
            <p>Pesquise, compare e descubra produtos para seu setup, com informações que ajudam você a escolher melhor.</p>
            <SearchBox large />
            <div className="hero-trust"><ShieldCheck size={16} /><span>Busca transparente. Sem preços inventados ou ofertas falsas.</span></div>
            <Link className="builder-hero-link" to="/montar-pc"><Wrench size={17} /> Montar meu PC <ArrowRight size={16} /></Link>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-grid" />
            <div className="art-card art-card-main">
              <div className="art-chip"><Cpu size={30} /></div>
              <span>SEU PRÓXIMO UPGRADE</span>
              <strong>Começa com uma boa escolha.</strong>
              <div className="art-lines"><i /><i /><i /></div>
            </div>
            <div className="art-chip-float"><MemoryStick size={22} /></div>
            <div className="art-storage-float"><HardDrive size={21} /><span>Pesquisa inteligente<br /><b>Catálogo independente</b></span></div>
            <span className="art-orbit art-orbit-a" /><span className="art-orbit art-orbit-b" />
          </div>
        </section>

        <section className="category-section page-shell">
          <div className="section-heading">
            <div><span className="section-kicker">EXPLORE POR CATEGORIA</span><h2>O que você está procurando?</h2></div>
            <Link className="text-link" to="/pesquisa">Ver todo o catálogo <ArrowRight size={16} /></Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => {
              const Icon = categoryIcons[category] ?? Search
              const count = products.filter((product) => product.category === category).length
              return (
                <Link key={category} to={`/pesquisa?categoria=${encodeURIComponent(category)}`} className="category-tile">
                  <span className="category-icon"><Icon size={21} strokeWidth={1.8} /></span>
                  <span><strong>{category}</strong><small>{count} {count === 1 ? 'produto cadastrado' : 'produtos cadastrados'}</small></span>
                  <ArrowRight size={15} className="category-arrow" />
                </Link>
              )
            })}
          </div>
        </section>

        <section className="featured-section">
          <div className="page-shell">
            <div className="section-heading">
              <div><span className="section-kicker">CATÁLOGO TECNOVIARIO</span><h2>Produtos para conhecer</h2><p>Confira as informações e especificações cadastradas para cada produto.</p></div>
              <Link className="text-link" to="/pesquisa">Explorar produtos <ArrowRight size={16} /></Link>
            </div>
              {featured.length ? (
                <div className="product-grid">
                  {featured.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
              ) : (
                <div className="empty-state"><span className="empty-icon"><HardDrive size={28} /></span><h2>Os próximos produtos estão a caminho</h2><p>Estamos preparando o catálogo. Volte em breve para encontrar novos produtos.</p></div>
              )}
          </div>
        </section>

        <section className="guides-section page-shell">
          <div className="section-heading">
            <div><span className="section-kicker">CONHECIMENTO QUE AJUDA A ESCOLHER</span><h2>Guias práticos de tecnologia</h2></div>
            <Link className="text-link" to="/guias">Todos os guias <ArrowRight size={16} /></Link>
          </div>
          <div className="guide-grid">
            {selectedGuides.map((guide, index) => (
              <Link className={`guide-card guide-card-${index + 1}`} to={`/guias/${guide.slug}`} key={guide.slug}>
                <div className="guide-art"><span className="guide-art-label">{guide.category}</span><span className="guide-art-number">0{index + 1}</span><HardDrive size={34} strokeWidth={1.4} /></div>
                <div className="guide-content"><span>{guide.readTime}</span><h3>{guide.title}</h3><p>{guide.summary}</p><strong>Ler guia <ArrowRight size={15} /></strong></div>
              </Link>
            ))}
          </div>
        </section>
        <section className="closing-cta page-shell">
          <div><span className="section-kicker">PRONTO PARA ENCONTRAR?</span><h2>Uma pesquisa pode ser o começo de um setup melhor.</h2></div>
          <button className="button-primary" onClick={() => navigate('/pesquisa')}>Explorar catálogo <ArrowRight size={17} /></button>
        </section>
      </main>
    </>
  )
}
