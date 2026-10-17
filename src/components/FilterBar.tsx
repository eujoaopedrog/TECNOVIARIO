import { useEffect, useRef, useState, type FormEvent } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { getActiveOffers } from '../services/productService'
import type { ProductStore } from '../types/product'

interface FilterValues {
  deal: boolean
  available: boolean
  updatedToday: boolean
  store: '' | ProductStore
  minPrice: string
  maxPrice: string
  category: string
}

const emptyFilters: FilterValues = {
  deal: false,
  available: false,
  updatedToday: false,
  store: '',
  minPrice: '',
  maxPrice: '',
  category: '',
}

function readFilters(params: URLSearchParams): FilterValues {
  return {
    deal: params.get('deal') === '1',
    available: params.get('available') === '1',
    updatedToday: params.get('updatedToday') === '1',
    store: params.get('store') === 'amazon' || params.get('store') === 'mercadolivre' ? params.get('store') as ProductStore : '',
    minPrice: params.get('minPrice') ?? '',
    maxPrice: params.get('maxPrice') ?? '',
    category: params.get('category') ?? '',
  }
}

function writeFilters(values: FilterValues, current: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(current)
  for (const key of ['deal', 'available', 'updatedToday', 'store', 'minPrice', 'maxPrice', 'category']) next.delete(key)
  if (values.deal) next.set('deal', '1')
  if (values.available) next.set('available', '1')
  if (values.updatedToday) next.set('updatedToday', '1')
  if (values.store) next.set('store', values.store)
  if (values.minPrice) next.set('minPrice', values.minPrice)
  if (values.maxPrice) next.set('maxPrice', values.maxPrice)
  if (values.category) next.set('category', values.category)
  return next
}

export function FilterBar() {
  const [params, setParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draft, setDraft] = useState(() => readFilters(params))
  const filterButton = useRef<HTMLButtonElement>(null)
  const drawer = useRef<HTMLElement | null>(null)
  const categories = [...new Set(getActiveOffers().map((product) => product.category))].sort()
  const applied = readFilters(params)

  useEffect(() => {
    if (!drawerOpen) return
    const focusable = () => [...(drawer.current?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
    ) ?? [])]
    focusable()[0]?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setDrawerOpen(false)
        filterButton.current?.focus()
        return
      }
      if (event.key !== 'Tab') return
      const elements = focusable()
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (!first || !last) {
        event.preventDefault()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  function closeDrawer() {
    setDrawerOpen(false)
    filterButton.current?.focus()
  }

  function update<K extends keyof FilterValues>(key: K, value: FilterValues[K]) {
    const next = { ...applied, [key]: value }
    setParams(writeFilters(next, params), { replace: true })
    setDraft(next)
  }

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setParams(writeFilters(draft, params), { replace: true })
    closeDrawer()
  }

  function reset() {
    setDraft(emptyFilters)
    setParams(writeFilters(emptyFilters, params), { replace: true })
  }

  return (
    <section className="offer-filter-bar" aria-label="Filtros de ofertas">
      <button ref={filterButton} className="offer-filter-trigger" type="button" onClick={() => {
        setDraft(applied)
        setDrawerOpen(true)
      }}>
        <SlidersHorizontal size={18} aria-hidden="true" /> Filtros
      </button>
      <form className="offer-filter-desktop" onSubmit={(event) => event.preventDefault()}>
        <label className="offer-filter-check"><input type="checkbox" checked={applied.deal} onChange={(event) => update('deal', event.target.checked)} /> Só com desconto</label>
        <label className="offer-filter-check"><input type="checkbox" checked={applied.available} onChange={(event) => update('available', event.target.checked)} /> Só disponíveis</label>
        <label className="offer-filter-check"><input type="checkbox" checked={applied.updatedToday} onChange={(event) => update('updatedToday', event.target.checked)} /> Atualizados hoje</label>
        <label>Loja
          <select value={applied.store} onChange={(event) => update('store', event.target.value as FilterValues['store'])}>
            <option value="">Todas</option><option value="amazon">Amazon</option><option value="mercadolivre">Mercado Livre</option>
          </select>
        </label>
        <label>Preço mínimo
          <input type="number" min="0" inputMode="decimal" value={applied.minPrice} onChange={(event) => update('minPrice', event.target.value)} placeholder="R$" />
        </label>
        <label>Preço máximo
          <input type="number" min="0" inputMode="decimal" value={applied.maxPrice} onChange={(event) => update('maxPrice', event.target.value)} placeholder="R$" />
        </label>
        <label>Categoria
          <select value={applied.category} onChange={(event) => update('category', event.target.value)}>
            <option value="">Todas</option>{categories.map((category) => <option value={category} key={category}>{category}</option>)}
          </select>
        </label>
        {Object.keys(applied).some((key) => applied[key as keyof FilterValues] && applied[key as keyof FilterValues] !== false) && <button className="clear-filters" type="button" onClick={reset}>Limpar</button>}
      </form>
      {drawerOpen && (
        <div className="offer-filter-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeDrawer()
        }}>
          <section ref={drawer} className="offer-filter-drawer" role="dialog" aria-modal="true" aria-labelledby="offer-filters-title">
            <header><h2 id="offer-filters-title">Filtrar ofertas</h2><button type="button" aria-label="Fechar filtros" onClick={closeDrawer}><X size={20} /></button></header>
            <form onSubmit={apply}>
              <label className="offer-filter-check"><input type="checkbox" checked={draft.deal} onChange={(event) => setDraft({ ...draft, deal: event.target.checked })} /> Só com desconto</label>
              <label className="offer-filter-check"><input type="checkbox" checked={draft.available} onChange={(event) => setDraft({ ...draft, available: event.target.checked })} /> Só disponíveis</label>
              <label className="offer-filter-check"><input type="checkbox" checked={draft.updatedToday} onChange={(event) => setDraft({ ...draft, updatedToday: event.target.checked })} /> Atualizados hoje</label>
              <label>Loja<select value={draft.store} onChange={(event) => setDraft({ ...draft, store: event.target.value as FilterValues['store'] })}><option value="">Todas</option><option value="amazon">Amazon</option><option value="mercadolivre">Mercado Livre</option></select></label>
              <div className="offer-price-range">
                <label>Preço mínimo<input type="number" min="0" inputMode="decimal" value={draft.minPrice} onChange={(event) => setDraft({ ...draft, minPrice: event.target.value })} placeholder="R$" /></label>
                <label>Preço máximo<input type="number" min="0" inputMode="decimal" value={draft.maxPrice} onChange={(event) => setDraft({ ...draft, maxPrice: event.target.value })} placeholder="R$" /></label>
              </div>
              <label>Categoria<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}><option value="">Todas</option>{categories.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>
              <button className="button-primary" type="submit">Aplicar filtros</button>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}
