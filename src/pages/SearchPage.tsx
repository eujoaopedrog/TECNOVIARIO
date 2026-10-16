import { useMemo } from 'react'
import { ArrowUpDown, PackageSearch, SlidersHorizontal } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageMeta } from '../components/PageMeta'
import { ProductCard } from '../components/ProductCard'
import { SearchBox } from '../components/SearchBox'
import { getBrands, getCategories, searchProducts } from '../services/productService'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const category = params.get('categoria') ?? ''
  const brand = params.get('marca') ?? ''
  const sort = (['relevance', 'name-asc', 'name-desc'] as const)
    .find((value) => value === params.get('ordem')) ?? 'relevance'
  const products = useMemo(() => searchProducts(query, {
    category: category || undefined,
    brand: brand || undefined,
    sort,
  }), [query, category, brand, sort])

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const title = query ? `Resultados para “${query}”` : category ? category : 'Explore todos os produtos'

  return (
    <main className="page-shell search-page">
      <PageMeta title={title} description="Resultados da pesquisa no catálogo demonstrativo Tecnoviario." noIndex />
      <div className="breadcrumb"><Link to="/">Início</Link><span>/</span><span>Pesquisa</span></div>
      <div className="results-heading">
        <div><span className="section-kicker">PESQUISA DE PRODUTOS</span><h1>{title}</h1><p>{products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'} no catálogo Tecnoviario</p></div>
        <div className="results-search"><SearchBox initialQuery={query} onSearch={(value) => updateParam('q', value)} /></div>
      </div>
      <div className="results-layout">
        <aside className="filter-panel">
          <div className="filter-heading"><SlidersHorizontal size={18} /><strong>Filtros</strong></div>
          <label className="filter-label" htmlFor="category-filter">Categoria</label>
          <select id="category-filter" value={category} onChange={(event) => updateParam('categoria', event.target.value)}>
            <option value="">Todas as categorias</option>
            {getCategories().map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <label className="filter-label" htmlFor="brand-filter">Marca</label>
          <select id="brand-filter" value={brand} onChange={(event) => updateParam('marca', event.target.value)}>
            <option value="">Todas as marcas</option>
            {getBrands().map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          {(category || brand) && <button className="clear-filters" onClick={() => {
            const next = new URLSearchParams(params)
            next.delete('categoria')
            next.delete('marca')
            setParams(next, { replace: true })
          }} type="button">Limpar filtros</button>}
          <p className="filter-note">Os filtros refletem os campos cadastrados em cada produto.</p>
        </aside>
        <section className="results-content" aria-live="polite">
          <div className="results-toolbar">
            <span>{products.length} {products.length === 1 ? 'resultado' : 'resultados'}</span>
            <label><ArrowUpDown size={15} /><span className="sr-only">Ordenar por</span>
              <select value={sort} onChange={(event) => updateParam('ordem', event.target.value)}>
                <option value="relevance">Relevância</option>
                <option value="name-asc">Nome: A–Z</option>
                <option value="name-desc">Nome: Z–A</option>
              </select>
            </label>
          </div>
          {products.length ? (
            <div className="product-grid results-grid">{products.map((product) => <ProductCard key={product.id} product={product} compact />)}</div>
          ) : (
            <div className="empty-state"><span className="empty-icon"><PackageSearch size={28} /></span><h2>Nenhum produto encontrado</h2><p>Tente outros termos ou remova um filtro. A busca considera nomes, marcas, categorias e especificações.</p><SearchBox initialQuery={query} onSearch={(value) => updateParam('q', value)} /></div>
          )}
          <p className="catalog-disclaimer">Itens marcados como demonstração são fictícios e não representam ofertas reais. Confirme dados, preço e disponibilidade com as fontes antes de comprar.</p>
        </section>
      </div>
    </main>
  )
}
