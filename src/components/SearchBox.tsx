import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search, X } from 'lucide-react'
import { getSuggestions } from '../services/productService'
import type { Product } from '../types/product'

interface SearchBoxProps {
  large?: boolean
  initialQuery?: string
  onSearch?: (query: string) => void
}

export function SearchBox({ large = false, initialQuery = '', onSearch }: SearchBoxProps) {
  const [query, setQuery] = useState(initialQuery)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const selectedQuery = useRef<string>()
  const wrapper = useRef<HTMLFormElement>(null)
  const listId = `${useId()}-suggestions`

  useEffect(() => setQuery(initialQuery), [initialQuery])

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    if (selectedQuery.current === query) {
      selectedQuery.current = undefined
      setSuggestions([])
      setOpen(false)
      return
    }
    const trimmed = query.trim()
    if (!trimmed) {
      setSuggestions([])
      setOpen(false)
      return
    }
    timer.current = setTimeout(() => {
      setSuggestions(getSuggestions(trimmed))
      setOpen(true)
    }, 180)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [query])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function submit(event?: FormEvent) {
    event?.preventDefault()
    const value = query.trim()
    setOpen(false)
    setActiveIndex(-1)
    if (onSearch) onSearch(value)
    else navigate(`/pesquisa${value ? `?q=${encodeURIComponent(value)}` : ''}`)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (event.key === 'Enter') submit()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, -1))
    } else if (event.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      choose(suggestions[activeIndex])
    }
  }

  function choose(product: Product) {
    if (query !== product.name) selectedQuery.current = product.name
    setQuery(product.name)
    setOpen(false)
    setActiveIndex(-1)
    navigate(`/produto/${product.slug}`)
  }

  return (
    <form className={`search-box${large ? ' search-box-large' : ''}`} onSubmit={submit} ref={wrapper} role="search">
      <Search size={large ? 21 : 19} aria-hidden="true" className="search-icon" />
      <input
        aria-label="Pesquisar produtos"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
        aria-expanded={open && suggestions.length > 0}
        autoComplete="off"
        onChange={(event) => {
          setQuery(event.target.value)
          setActiveIndex(-1)
        }}
        onFocus={() => query.trim() && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Pesquise por produto, marca ou modelo..."
        role="combobox"
        value={query}
      />
      {query && (
        <button className="search-clear" type="button" aria-label="Limpar pesquisa" onClick={() => {
          setQuery('')
          setActiveIndex(-1)
        }}>
          <X size={17} />
        </button>
      )}
      <button className="search-submit" type="submit" aria-label="Pesquisar">
        {large ? <><span>Pesquisar</span><ArrowRight size={17} /></> : <Search size={18} />}
      </button>
      {open && suggestions.length > 0 && (
        <div className="suggestions">
          <ul className="suggestions-list" id={listId} role="listbox" aria-label="Sugestões de produtos">
            {suggestions.map((product, index) => (
              <li key={product.id} role="presentation">
                <button
                  aria-selected={activeIndex === index}
                  id={`${listId}-option-${index}`}
                  role="option"
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(product)}
                >
                <span className="suggestion-icon"><Search size={15} /></span>
                <span><strong>{product.name}</strong><small>{product.category} · {product.brand}</small></span>
                <ArrowRight size={15} className="suggestion-arrow" />
                </button>
              </li>
            ))}
          </ul>
          <div className="suggestion-all">
            <button type="submit">Ver todos os resultados para “{query.trim()}”</button>
          </div>
        </div>
      )}
    </form>
  )
}
