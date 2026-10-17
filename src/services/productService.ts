import { products } from '../data/products'
import type { DealTag, Product, ProductFilters, ProductStore } from '../types/product'

const searchStopWords = new Set(['a', 'as', 'ao', 'aos', 'com', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'na', 'nas', 'no', 'nos', 'o', 'os', 'para', 'por', 'um', 'uma', 'uns', 'umas', 'que', 'produto', 'produtos'])
const productDataMaxAgeMs = 24 * 60 * 60 * 1000

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function getCurrentPrice(product: Product, now = Date.now()): number | undefined {
  const checkedAt = product.lastCheckedAt ?? product.priceUpdatedAt
  if (product.available === false || typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price < 0 || !checkedAt) {
    return undefined
  }
  const updatedAt = Date.parse(checkedAt)
  if (!Number.isFinite(updatedAt) || updatedAt > now || now - updatedAt >= productDataMaxAgeMs) {
    return undefined
  }
  return product.price
}

export function getDiscountPercent(product: Pick<Product, 'price' | 'originalPrice'>): number | undefined {
  if (product.price === undefined || product.originalPrice === undefined || product.originalPrice <= product.price || product.originalPrice <= 0) return undefined
  const discount = Math.round((1 - product.price / product.originalPrice) * 100)
  return discount > 0 ? discount : undefined
}

export function getVerificationAgeHours(product: Pick<Product, 'lastCheckedAt'>, now = Date.now()): number | undefined {
  if (!product.lastCheckedAt) return undefined
  const checkedAt = Date.parse(product.lastCheckedAt)
  if (!Number.isFinite(checkedAt) || checkedAt > now) return undefined
  return Math.floor((now - checkedAt) / (60 * 60 * 1000))
}

export function isOfferActive(product: Product, now = Date.now()): boolean {
  return product.available !== false
    && Boolean(product.store && product.affiliateUrl)
    && getCurrentPrice(product, now) !== undefined
    && getVerificationAgeHours(product, now) !== undefined
}

function tagFromHistory(product: Product, now: number): DealTag | undefined {
  if (product.dealTag) return product.dealTag
  const points = product.priceHistory
  if (!points || points.length < 2) return undefined
  const recentPoints = points.filter((point) => {
    const date = Date.parse(point.date)
    return date <= now && date >= now - 30 * 24 * 60 * 60 * 1000
  })
  const currentPrice = getCurrentPrice(product, now)
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  const historyCoversThirtyDays = Date.parse(points[0].date) <= now - thirtyDays
  if (currentPrice !== undefined && historyCoversThirtyDays && recentPoints.length >= 2) {
    const lowestRecordedPrice = Math.min(currentPrice, ...recentPoints.map((point) => point.price))
    if (currentPrice === lowestRecordedPrice) return 'menor-preco-30d'
  }
  const latest = points[points.length - 1]
  const previous = points[points.length - 2]
  const latestDate = latest ? Date.parse(latest.date) : Number.NaN
  if (
    currentPrice !== undefined
    && latest
    && previous
    && latestDate <= now
    && currentPrice === latest.price
    && latest.price < previous.price
    && now - latestDate <= 48 * 60 * 60 * 1000
  ) return 'acabou-de-cair'
  return undefined
}

export function getDealTag(product: Product, now = Date.now()): DealTag | undefined {
  return tagFromHistory(product, now)
}

export interface OfferFilters {
  deal?: boolean
  available?: boolean
  updatedToday?: boolean
  store?: ProductStore
  minPrice?: number
  maxPrice?: number
  category?: string
  sort?: 'relevance' | 'discount' | 'price' | 'recent'
}

export function getActiveOffers(filters: OfferFilters = {}, now = Date.now()): Product[] {
  const today = localDateKey(new Date(now))
  const matches = products.filter((product) => {
    if (!isOfferActive(product, now)) return false
    const price = getCurrentPrice(product, now)
    if (price === undefined) return false
    if (filters.deal && getDiscountPercent(product) === undefined) return false
    if (filters.available && product.available !== true) return false
    if (filters.store && product.store !== filters.store) return false
    if (filters.minPrice !== undefined && price < filters.minPrice) return false
    if (filters.maxPrice !== undefined && price > filters.maxPrice) return false
    if (filters.category && product.category !== filters.category) return false
    if (filters.updatedToday) {
      const checkedAt = product.lastCheckedAt ? Date.parse(product.lastCheckedAt) : Number.NaN
      if (!Number.isFinite(checkedAt) || localDateKey(new Date(checkedAt)) !== today) return false
    }
    return true
  })

  switch (filters.sort) {
    case 'discount':
      return matches.sort((left, right) => (getDiscountPercent(right) ?? -1) - (getDiscountPercent(left) ?? -1))
    case 'price':
      return matches.sort((left, right) => (getCurrentPrice(left, now) ?? Infinity) - (getCurrentPrice(right, now) ?? Infinity))
    case 'recent':
      return matches.sort((left, right) => Date.parse(right.lastCheckedAt ?? '') - Date.parse(left.lastCheckedAt ?? ''))
    default:
      return matches
  }
}

export function getOfferActivity(productsToShow: Product[] = products, now = Date.now()): { count: number; latestCheckedAt?: string } {
  const offers = productsToShow.filter((product) => isOfferActive(product, now))
  const latestCheckedAt = offers
    .map((product) => product.lastCheckedAt)
    .filter((value): value is string => Boolean(value) && Date.parse(value as string) <= now)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0]
  return { count: offers.length, ...(latestCheckedAt ? { latestCheckedAt } : {}) }
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

export function getOtherOffers(productId: string, limit = 4): Product[] {
  const currentProduct = products.find((product) => product.id === productId)
  if (!currentProduct) return []
  return products.filter((product) =>
    product.id !== productId
    && product.store !== currentProduct.store
    && normalizeText(product.name) === normalizeText(currentProduct.name)
    && isOfferActive(product),
  ).slice(0, limit)
}

export function getSuggestions(query: string, limit = 5): Product[] {
  return searchProducts(query).slice(0, limit)
}
