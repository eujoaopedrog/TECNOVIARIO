import { useMemo } from 'react'
import { ArrowUpDown, PackageSearch } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { DealCard } from '../components/DealCard'
import { FilterBar } from '../components/FilterBar'
import { PageMeta } from '../components/PageMeta'
import { getActiveOffers } from '../services/productService'
import type { ProductStore } from '../types/product'

function optionalPrice(value: string | null): number | undefined {
  if (!value) return undefined
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : undefined
}

export function OffersPage() {
  const [params, setParams] = useSearchParams()
  const sort = (['relevance', 'discount', 'price', 'recent'] as const)
    .find((value) => value === params.get('sort')) ?? 'relevance'
  const offers = useMemo(() => getActiveOffers({
    deal: params.get('deal') === '1',
    available: params.get('available') === '1',
    updatedToday: params.get('updatedToday') === '1',
    store: params.get('store') === 'amazon' || params.get('store') === 'mercadolivre' || params.get('store') === 'kabum' ? params.get('store') as ProductStore : undefined,
    minPrice: optionalPrice(params.get('minPrice')),
    maxPrice: optionalPrice(params.get('maxPrice')),
    category: params.get('category') ?? undefined,
    sort,
  }), [params, sort])

  function updateSort(value: string) {
    const next = new URLSearchParams(params)
    if (value === 'relevance') next.delete('sort')
    else next.set('sort', value)
    setParams(next, { replace: true })
  }

  return (
    <main className="page-shell offers-page">
      <PageMeta title="Achadinhos de hardware" description="Ofertas de hardware com preço e data de verificação visíveis." noIndex />
      <header className="offers-heading">
        <span className="section-kicker">OFERTAS VERIFICADAS</span>
        <h1>Achadinhos de hardware</h1>
        <p>{offers.length} {offers.length === 1 ? 'oferta ativa' : 'ofertas ativas'}</p>
      </header>
      <FilterBar />
      <div className="offers-toolbar">
        <span>{offers.length} {offers.length === 1 ? 'oferta' : 'ofertas'}</span>
        <label><ArrowUpDown size={16} /><span>Ordenar por</span>
          <select value={sort} onChange={(event) => updateSort(event.target.value)}>
            <option value="relevance">Relevância</option>
            <option value="discount">Maior desconto</option>
            <option value="price">Menor preço</option>
            <option value="recent">Atualizados recentemente</option>
          </select>
        </label>
      </div>
      {offers.length ? (
        <div className="product-grid offers-grid">
          {offers.map((product) => <DealCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="empty-state offers-empty-state">
          <span className="empty-icon"><PackageSearch size={28} /></span>
          <h2>Nenhuma oferta com esses filtros.</h2>
          <p>Tente remover algum filtro.</p>
        </div>
      )}
    </main>
  )
}
