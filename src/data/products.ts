import catalog from './products.json'
import type { DealTag, Product, ProductCompatibility, ProductStore, PriceHistoryPoint } from '../types/product'

interface CatalogEntry {
  id?: string
  slug?: string
  name: string
  brand?: string
  model?: string
  category: string
  description?: string
  specifications?: Record<string, string | undefined>
  keywords?: string[]
  dataSource?: string
  image?: string
  price?: number
  originalPrice?: number
  discountPercent?: number
  priceUpdatedAt?: string
  affiliateUrl?: string
  store?: ProductStore
  lastCheckedAt?: string
  priceHistory?: PriceHistoryPoint[]
  available?: boolean
  dealTag?: DealTag
  editorialAssessment?: string
  compatibility?: ProductCompatibility
}

const catalogEntries = catalog as CatalogEntry[]
const seenIds = new Set<string>()
const seenSlugs = new Set<string>()

function createSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeCompatibility(value: ProductCompatibility | undefined): ProductCompatibility | undefined {
  if (!value || typeof value !== 'object') return undefined
  const text = (candidate: unknown) => typeof candidate === 'string' && candidate.trim() ? candidate.trim() : undefined
  const list = (candidate: unknown) => Array.isArray(candidate)
    ? candidate.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim())
    : undefined
  const positiveNumber = (candidate: unknown) => typeof candidate === 'number' && Number.isFinite(candidate) && candidate > 0
    ? candidate
    : undefined
  const normalized: ProductCompatibility = {
    ...(text(value.socket) ? { socket: text(value.socket) } : {}),
    ...(text(value.memoryType) ? { memoryType: text(value.memoryType) } : {}),
    ...(list(value.supportedMemoryTypes) ? { supportedMemoryTypes: list(value.supportedMemoryTypes) } : {}),
    ...(text(value.formFactor) ? { formFactor: text(value.formFactor) } : {}),
    ...(list(value.supportedFormFactors) ? { supportedFormFactors: list(value.supportedFormFactors) } : {}),
    ...(text(value.storageInterface) ? { storageInterface: text(value.storageInterface) } : {}),
    ...(list(value.supportedStorageInterfaces) ? { supportedStorageInterfaces: list(value.supportedStorageInterfaces) } : {}),
    ...(positiveNumber(value.psuWattage) ? { psuWattage: positiveNumber(value.psuWattage) } : {}),
    ...(positiveNumber(value.minimumPsuWatts) ? { minimumPsuWatts: positiveNumber(value.minimumPsuWatts) } : {}),
    ...(typeof value.integratedGraphics === 'boolean' ? { integratedGraphics: value.integratedGraphics } : {}),
  }
  return Object.keys(normalized).length ? normalized : undefined
}

function detectStore(affiliateUrl: string | undefined): ProductStore | undefined {
  if (!affiliateUrl) return undefined
  let hostname: string
  try {
    hostname = new URL(affiliateUrl).hostname.toLocaleLowerCase('en-US')
  } catch {
    return undefined
  }
  if (hostname === 'link.amazon' || hostname === 'amzn.to' || hostname === 'amazon.com' || hostname.endsWith('.amazon.com') || hostname === 'amazon.com.br' || hostname.endsWith('.amazon.com.br')) return 'amazon'
  if (hostname === 'meli.la' || hostname === 'mercadolivre.com.br' || hostname.endsWith('.mercadolivre.com.br') || hostname === 'mercadolibre.com' || hostname.endsWith('.mercadolibre.com')) return 'mercadolivre'
  if (hostname === 'kabum.com.br' || hostname.endsWith('.kabum.com.br')) return 'kabum'
  return undefined
}

function normalizePriceHistory(value: PriceHistoryPoint[] | undefined): PriceHistoryPoint[] | undefined {
  if (!Array.isArray(value)) return undefined
  const points = value.filter((point) =>
    point
    && typeof point.date === 'string'
    && Number.isFinite(Date.parse(point.date))
    && typeof point.price === 'number'
    && Number.isFinite(point.price)
    && point.price >= 0,
  ).sort((left, right) => Date.parse(left.date) - Date.parse(right.date))
  return points.length ? points : undefined
}

function calculateDiscountPercent(price: number | undefined, originalPrice: number | undefined): number | undefined {
  if (price === undefined || originalPrice === undefined || originalPrice <= price || originalPrice <= 0) return undefined
  return Math.round((1 - price / originalPrice) * 100)
}

export const products: Product[] = catalogEntries.map((entry, index) => {
  if (!entry.name.trim() || !entry.category.trim()) {
    throw new Error(`Product catalog entry ${index + 1} must include a name and category.`)
  }
  const slug = entry.slug?.trim() || createSlug(entry.name)
  if (!slug) throw new Error(`Product catalog entry ${index + 1} needs a name that can form a URL slug.`)
  const id = entry.id?.trim() || slug
  if (seenIds.has(id)) throw new Error(`Duplicate product id in src/data/products.json: "${id}".`)
  if (seenSlugs.has(slug)) throw new Error(`Duplicate product slug in src/data/products.json: "${slug}".`)
  if (entry.image && (
    !/^\/products\/images\/[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(entry.image)
    || entry.image.includes('..')
  )) {
    throw new Error(`Invalid image path for "${entry.name}". Use /products/images/filename.jpg.`)
  }
  seenIds.add(id)
  seenSlugs.add(slug)
  const compatibility = normalizeCompatibility(entry.compatibility)
  const affiliateUrl = entry.affiliateUrl?.trim()
  const detectedStore = detectStore(affiliateUrl)
  if (detectedStore && entry.store && detectedStore !== entry.store) {
    throw new Error(`Store metadata does not match the affiliate link for "${entry.name}".`)
  }
  const store = detectedStore ?? (entry.store === 'amazon' || entry.store === 'mercadolivre' || entry.store === 'kabum' ? entry.store : undefined)
  const priceHistory = normalizePriceHistory(entry.priceHistory)
  const price = typeof entry.price === 'number' && Number.isFinite(entry.price) && entry.price >= 0 ? entry.price : undefined
  const originalPrice = typeof entry.originalPrice === 'number' && Number.isFinite(entry.originalPrice) && entry.originalPrice > 0
    ? entry.originalPrice
    : undefined
  const lastCheckedAt = entry.lastCheckedAt && Number.isFinite(Date.parse(entry.lastCheckedAt))
    ? entry.lastCheckedAt
    : entry.priceUpdatedAt && Number.isFinite(Date.parse(entry.priceUpdatedAt))
      ? entry.priceUpdatedAt
      : undefined

  return {
    id,
    slug,
    name: entry.name,
    brand: entry.brand?.trim() || 'Não informada',
    model: entry.model?.trim() || 'Não informado',
    category: entry.category,
    description: entry.description?.trim() || 'Consulte a página do fabricante para informações detalhadas sobre este produto.',
    specifications: Object.fromEntries(
      Object.entries(entry.specifications ?? {}).filter((specification): specification is [string, string] =>
        typeof specification[1] === 'string',
      ),
    ),
    keywords: entry.keywords ?? [],
    dataSource: entry.dataSource?.trim() || 'Informado manualmente pelo editor',
    ...(entry.image ? { image: entry.image } : {}),
    ...(price !== undefined ? { price } : {}),
    ...(originalPrice !== undefined ? { originalPrice } : {}),
    ...(calculateDiscountPercent(price, originalPrice) !== undefined ? { discountPercent: calculateDiscountPercent(price, originalPrice) } : {}),
    ...(entry.priceUpdatedAt ? { priceUpdatedAt: entry.priceUpdatedAt } : {}),
    ...(affiliateUrl ? { affiliateUrl } : {}),
    ...(store ? { store } : {}),
    ...(lastCheckedAt ? { lastCheckedAt } : {}),
    ...(priceHistory ? { priceHistory } : {}),
    ...(typeof entry.available === 'boolean' ? { available: entry.available } : {}),
    ...(entry.dealTag && ['menor-preco-30d', 'acabou-de-cair', 'em-alta', 'novo'].includes(entry.dealTag) ? { dealTag: entry.dealTag } : {}),
    ...(typeof entry.editorialAssessment === 'string' && entry.editorialAssessment.trim() ? { editorialAssessment: entry.editorialAssessment.trim() } : {}),
    ...(compatibility ? { compatibility } : {}),
  }
})
