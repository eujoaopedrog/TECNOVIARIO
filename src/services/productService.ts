import { products } from '../data/products'
import type { Product, ProductFilters } from '../types/product'

const searchStopWords = new Set(['a', 'as', 'ao', 'aos', 'com', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'na', 'nas', 'no', 'nos', 'o', 'os', 'para', 'por', 'um', 'uma', 'uns', 'umas', 'que', 'produto', 'produtos'])
const productDataMaxAgeMs = 24 * 60 * 60 * 1000

export function getCurrentPrice(product: Product, now = Date.now()): number | undefined {
  if (typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price < 0 || !product.priceUpdatedAt) {
    return undefined
  }
  const updatedAt = Date.parse(product.priceUpdatedAt)
  if (!Number.isFinite(updatedAt) || updatedAt > now || now - updatedAt >= productDataMaxAgeMs) {
    return undefined
  }
  return product.price
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/(\d)\s+(tb|gb|mb|mhz|hz|w|mm)\b/g, '$1$2')
    .trim()
}

function searchableText(product: Product): string {
  return normalizeText([
    product.name,
    product.brand,
    product.model,
    product.category,
    product.description,
    ...Object.entries(product.specifications).flat(),
    ...product.keywords,
  ].join(' '))
}

function isOneEditAway(left: string, right: string): boolean {
  if (Math.abs(left.length - right.length) > 1) return false
  let leftIndex = 0
  let rightIndex = 0
  let edits = 0
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1
      rightIndex += 1
      continue
    }
    edits += 1
    if (edits > 1) return false
    if (left.length > right.length) leftIndex += 1
    else if (right.length > left.length) rightIndex += 1
    else {
      leftIndex += 1
      rightIndex += 1
    }
  }
  if (leftIndex < left.length || rightIndex < right.length) edits += 1
  return edits === 1
}

function scoreProduct(product: Product, query: string): number {
  if (!query) return 1
  const normalizedQuery = normalizeText(query)
  const terms = normalizedQuery.split(' ').filter((term) => (term.length > 1 || /^\d+$/.test(term)) && !searchStopWords.has(term))
  if (!terms.length) return 0
  const meaningfulQuery = terms.join(' ')
  const fullText = searchableText(product)
  const name = normalizeText(product.name)
  const brandModel = normalizeText(`${product.brand} ${product.model}`)
  const words = [...new Set(fullText.split(' '))]
  const nameWords = name.split(' ')
  const brandModelWords = brandModel.split(' ')
  const matchesTerm = (term: string, candidates: string[]) => candidates.some((word) =>
    word.startsWith(term) || (term.length >= 4 && isOneEditAway(term, word)),
  )
  const matchedTerms = terms.filter((term) =>
    matchesTerm(term, words) || matchesTerm(term, nameWords) || matchesTerm(term, brandModelWords),
  )
  if (matchedTerms.length < Math.ceil(terms.length * 0.67)) return 0

  let score = 0

  if (name.includes(meaningfulQuery)) score += 12
  if (brandModel.includes(meaningfulQuery)) score += 10
  if (fullText.includes(meaningfulQuery)) score += 7
  for (const term of terms) {
    if (matchesTerm(term, nameWords)) score += 3
    else if (matchesTerm(term, words)) score += 1
  }
  return score
}

export function searchProducts(query: string, filters: ProductFilters = {}): Product[] {
  const normalizedQuery = normalizeText(query)
  const matches = products.filter((product) => {
    const matchesQuery = !normalizedQuery || scoreProduct(product, normalizedQuery) > 0
    const matchesCategory = !filters.category || product.category === filters.category
    const matchesBrand = !filters.brand || product.brand === filters.brand
    return matchesQuery && matchesCategory && matchesBrand
  })

  switch (filters.sort) {
    case 'name-asc':
      return matches.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    case 'name-desc':
      return matches.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'))
    case 'price-asc':
      return matches.filter((product) => getCurrentPrice(product) !== undefined)
        .sort((a, b) => {
          const priceA = getCurrentPrice(a)
          const priceB = getCurrentPrice(b)
          if (priceA === undefined || priceB === undefined) return 0
          return priceA - priceB
        })
    case 'price-desc':
      return matches.filter((product) => getCurrentPrice(product) !== undefined)
        .sort((a, b) => {
          const priceA = getCurrentPrice(a)
          const priceB = getCurrentPrice(b)
          if (priceA === undefined || priceB === undefined) return 0
          return priceB - priceA
        })
    default:
      return matches.sort((a, b) => scoreProduct(b, normalizedQuery) - scoreProduct(a, normalizedQuery))
  }
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function getCategories(): string[] {
  return [...new Set(products.map((product) => product.category))]
}

export function getBrands(): string[] {
  return [...new Set(products.map((product) => product.brand))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export function getRelatedProducts(productId: string, limit = 4): Product[] {
  const currentProduct = products.find((product) => product.id === productId)
  if (!currentProduct) return []
  return products.filter((product) => product.id !== productId && product.category === currentProduct.category).slice(0, limit)
}

export function getSuggestions(query: string, limit = 5): Product[] {
  return searchProducts(query).slice(0, limit)
}
